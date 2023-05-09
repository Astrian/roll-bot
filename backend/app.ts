/// <reference path="./types/WinnersResponse.d.ts" />
/// <reference path="./types/Participant.d.ts" />

import Koa from 'koa'
import dotenv from 'dotenv'
import debug from 'debug'
import route from 'koa-route'
import koaBody from 'koa-body'
import path from 'path'
import fs from 'fs'
import sqlite from './utils/sqlite'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import cors from '@koa/cors'
import bcrypt from 'bcrypt'
import randomString from './utils/random_string'

dotenv.config()
const print = debug('rollbot:main')

const app = new Koa()

app.use(cors({
  origin: process.env.FRONTEND_DOMAIN,
}))

app.use(koaBody({
  multipart: true,
    formidable: {
      // 上传目录
      uploadDir: path.join(__dirname, 'public/uploads'),
      // 保留文件扩展名
      keepExtensions: true,
    }
}))

app.use(route.post('/raffle_pools', async (ctx) => {
  const { files } = ctx.request
  const file = Array.isArray(files?.file) ? files?.file[0] : files?.file
  const csvFile = await fs.readFileSync(file?.filepath ?? "", 'utf-8')
  //parse csv
  const csv = csvFile.split('\n')

  // delete file
  await fs.unlinkSync(file?.filepath ?? "")

  // Parse csv array to object
  const rafflePool = csv.map((item) => {
    const [time, display_name, username] = item.split(',')
    return {
      time,
      display_name,
      username: username.replace('\r', '').replace('@', '')
    }
  })

  // slice the first one (title of the spreadsheet)
  rafflePool.shift()

  // Get raffle name
  const raffleName = ctx.request.body.name

  // generate a password for this raffle pool
  const password = randomString(32)
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  // generate a uuid for this raffle pool
  const rafflePoolId = uuidv4()
  await sqlite.run('INSERT INTO raffle_pool (id, password, name) VALUES (?, ?, ?)', [rafflePoolId, hash, raffleName])

  // insert participants into database
  for (const participant of rafflePool) {
    // duplicate check (one username can only participate once)
    const duplicate = await sqlite.get('SELECT * FROM participant WHERE username = ? AND pool = ?', [participant.username, rafflePoolId])
    if (duplicate) continue
    await sqlite.run('INSERT INTO participant (id, time, display_name, username, pool) VALUES (?, ?, ?, ?, ?)', [uuidv4(), participant.time, participant.display_name, participant.username, rafflePoolId])
  }

  ctx.body = { raffle_poll_id: rafflePoolId, password }
  ctx.status = 200
}))

app.use(route.post('/raffle_pools/:raffle_pool_id/tiers', async (ctx, rafflePoolId) => {
  // Check pool exists
  const pool = await sqlite.get('SELECT * FROM raffle_pool WHERE id = ?', [rafflePoolId])
  if (!pool) {
    ctx.body = { message: 'raffle pool not found' }
    ctx.status = 404
    return
  }

  // Check if body is valid
  if (!ctx.request.body.name || !ctx.request.body.number || !ctx.request.body.prize) {
    ctx.body = { message: 'invalid body' }
    ctx.status = 400
    return
  }
  if (typeof(ctx.request.body.number) !== 'number') {
    ctx.body = { message: 'the number of the prize should be a number' }
    ctx.status = 400
    return
  }
  if (ctx.request.body.number < 1) {
    ctx.body = { message: 'the number of the prize should be 1 or larger than 1' }
    ctx.status = 400
    return
  }


  const {name, number, prize} = ctx.request.body
  const tierId = uuidv4()

  await sqlite.run('INSERT INTO tier (id, name, number, prize, pool) VALUES (?, ?, ?, ?, ?)', [tierId, name, number, prize, rafflePoolId])

  ctx.body = { tier_id: tierId }
  ctx.status = 200
}))

app.use(route.delete('/raffle_pools/:raffle_pool_id/tiers/:tier_id', async (ctx, rafflePoolId, tierId) => {
  // Check pool exists
  const pool = await sqlite.get('SELECT * FROM raffle_pool WHERE id = ?', [rafflePoolId])
  if (!pool) {
    ctx.body = { message: 'raffle pool not found' }
    ctx.status = 404
    return
  }

  // Check tier exists
  const tier = await sqlite.get('SELECT * FROM tier WHERE id = ? AND pool = ?', [tierId, rafflePoolId])
  if (!tier) {
    ctx.body = { message: 'tier not found' }
    ctx.status = 404
    return
  }

  // Check if there is any winner in this tier
  const winners = await sqlite.all('SELECT * FROM winner WHERE tier = ? AND pool = ?', [tierId, rafflePoolId])
  if (winners.length > 0) {
    ctx.body = { message: 'there are winners in this tier, you cannot modify it.' }
    ctx.status = 400
    return
  }

  // Delete tier
  await sqlite.run('DELETE FROM tier WHERE id = ?', [tierId])

  ctx.status = 204
}))

app.use(route.get('/raffle_pools/:raffle_pool_id', async (ctx, rafflePoolId) => {
  const pool = await sqlite.get('SELECT * FROM raffle_pool WHERE id = ?', [rafflePoolId])
  if (!pool) {
    ctx.body = { message: 'raffle pool not found' }
    ctx.status = 404
    return
  }
  print(pool)

  const tiers = await sqlite.all('SELECT * FROM tier WHERE pool = ?', [rafflePoolId])
  const participants = await sqlite.all('SELECT * FROM participant WHERE pool = ?', [rafflePoolId])

  let adminMode = false
  if (ctx.headers.authorization) {
    const authorization = ctx.headers.authorization.split(' ')
    if (authorization[0] !== 'Bearer') {
      ctx.body = { message: 'invalid authorization header' }
      ctx.status = 403
      return
    }

    const token = authorization[1]
    print(token)
    if (!await bcrypt.compare(token, pool.password)) {
      ctx.body = { message: 'invalid token' }
      ctx.status = 403
      return
    }
    adminMode = true
  }

  tiers.winners = []
  for (const tier of tiers) {
    const winnersId = await sqlite.all('SELECT * FROM winner WHERE tier = ?', [tier.id])
    const winners = []
    for (const winnerId of winnersId) {
      const winner = await sqlite.get('SELECT * FROM participant WHERE id = ?', [winnerId.participant])
      winners.push(winner)
    }
    tier.winners = winners
  }
  if (adminMode) {
    ctx.body = {
      id: rafflePoolId,
      tiers,
      participants,
      participants_number: participants.length,
      has_raffled: pool.has_raffled === 1 ? true : false,
      name: pool.name
    }
  } else {
    ctx.body = {
      id: rafflePoolId,
      tiers,
      participants_number: participants.length,
      has_raffled: pool.has_raffled === 1 ? true : false,
      name: pool.name
    }
  }
  ctx.status = 200
}))

app.use(route.post('/raffle_pools/:raffle_pool_id/winners', async (ctx, rafflePoolId) => {
  // check if pool exists
  const pool = await sqlite.get('SELECT * FROM raffle_pool WHERE id = ?', [rafflePoolId])
  if (!pool) {
    ctx.body = { message: 'raffle pool not found' }
    ctx.status = 404
    return
  }

  // Get all tiers
  const tiers = await sqlite.all('SELECT * FROM tier WHERE pool = ?', [rafflePoolId])
  if (!tiers) {
    ctx.body = { message: 'no tier available in this pool' }
    ctx.status = 404
    return
  }

  // Get all participants
  const participants = await sqlite.all('SELECT id FROM participant WHERE pool = ?', [rafflePoolId])
  if (!participants) {
    ctx.body = { message: 'no participant available in this pool' }
    ctx.status = 404
    return
  }

  // Get winners number
  let winnersNumber: number = 0
  for (const tier of tiers) {
    winnersNumber += Number(tier.number)
  }

  // Confirm the number of winners is not larger than the number of participants
  if (winnersNumber > participants.length) {
    ctx.body = { message: 'the number of winners is larger than the number of participants' }
    ctx.status = 400
    return
  }

  // Make sure the raffle pool is not rolled before
  const rolled = await sqlite.get('SELECT * FROM winner WHERE pool = ?', [rafflePoolId])
  if (rolled) {
    ctx.body = { message: 'this raffle pool is already rolled' }
    ctx.status = 400
    return
  }

  const roll_id = uuidv4()

  const result = await axios.post('https://api.random.org/json-rpc/4/invoke', {
    "jsonrpc": "2.0",
    "method": "generateIntegers",
    "params": {
      "apiKey": process.env.RANDOM_ORG_API_KEY,
      "n": winnersNumber,
      "min": 0,
      "max": participants.length - 1,
      "replacement": false,
      "base": 10
    },
    "id": roll_id
  })

  print(result.data)

  if (roll_id !== result.data.id) {
    ctx.body = { message: 'roll id not match' }
    ctx.status = 500
    return
  }

  // Check if random.org returns error
  if (result.data.error) {
    ctx.body = { message: `Random.org returns an error: ${result.data.error.message}` }
    ctx.status = 500
    return
  }

  // Extract winners
  let winners: string[] = []
  for (const winner of result.data.result.random.data) {
    winners.push(participants[winner].id)
  }

  for (let tier in tiers) {
    for (let i = 0; i < tiers[tier].number; i++) {
      await sqlite.run('INSERT INTO winner (id, participant, tier, pool) VALUES (?, ?, ?, ?)', [uuidv4(), winners[0], tiers[tier].id, rafflePoolId])
      winners.shift()
    }
  }

  // Constructure response
  let response: WinnersResponse[] = []

  for (const tier of tiers) {
    const winnersIdOfTheTier = await sqlite.all('SELECT * FROM winner WHERE tier = ?', [tier.id])
    let winnersOfTheTier: Participant[] = []
    for (const winnerId of winnersIdOfTheTier) {
      const winner = await sqlite.get('SELECT * FROM participant WHERE id = ?', [winnerId.participant])
      winnersOfTheTier.push(winner)
    }

    const winners = await sqlite.all('SELECT * FROM winner WHERE tier = ?', [tier.id])
    response.push({
      id: tier.id,
      name: tier.name,
      number: tier.number,
      prize: tier.prize,
      winners: winnersOfTheTier
    })
  }

  ctx.body = response
  ctx.status = 200
}))

app.listen(process.env.PORT ?? 3000, () => {
  print(`Server running on port ${process.env.PORT ?? 3000}`)
})