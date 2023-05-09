<script setup lang="ts">
/// <reference types="../../types/RafflePoolStorage.d.ts" />
/// <reference types="../../types/Tier.d.ts" />
import { onMounted, reactive } from 'vue'
import axios from 'axios'
import QRCodeVue3 from 'qrcode-vue3'

import Modal from './Modal.vue'

const $props = defineProps({
  current: {
    type: String,
    required: true
  }
})

const state = reactive({
  raffle: {} as RafflePool,
  showNewTierModal: false,
  showParticipantModal: false,
  showLink: false,
  submittingNewTier: false,
  domain: import.meta.env.VITE_DOMAIN
})

onMounted(async () => {
  load()
})

const load = async () => {
  const list: RafflePoolStorage[] = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  for (let i in list) {
    if (list[i].raffle_poll_id === $props.current) {
      const password = list[i].password
      console.log(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${$props.current}`)
      const res = await axios.get(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${$props.current}`, {
        headers: {
          'Authorization': `Bearer ${password}`,
        }
      })

      state.raffle = res.data
      return
    }
  }
}

const newTier = async (event: Event) => {
  event.preventDefault()
  state.submittingNewTier = true

  // Get passwor from localStorage
  const list: RafflePoolStorage[] = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  let password = ""
  for (let i in list) {
    if (list[i].raffle_poll_id === $props.current) {
      password = list[i].password
      break
    }
  }
  try {
    await axios.post(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${$props.current}/tiers`, {
      name: ((event.target as HTMLFormElement)?.elements[1] as any).value,
      number: Number(((event.target as HTMLFormElement)?.elements[2] as any).value),
      prize: ((event.target as HTMLFormElement)?.elements[3] as any).value,
    }, {
      headers: {
        'Authorization': `Bearer ${password}`,
      }
    })
  } catch(e: any){
    for (let i in e) {
      console.log(i)
    }
    alert(e.response.data.message)
  }

  // Clear form
  state.showNewTierModal = false
  state.submittingNewTier = false
  if (event.target instanceof HTMLFormElement) {
    event.target.reset()
  }
  load()
}

const deleteTier = async (id: string) => {
  // Get passwor from localStorage
  const list: RafflePoolStorage[] = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  let password = ""
  for (let i in list) {
    if (list[i].raffle_poll_id === $props.current) {
      password = list[i].password
      break
    }
  }

  try {
    await axios.delete(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${$props.current}/tiers/${id}`, {
      headers: {
        'Authorization': `Bearer ${password}`,
      }
    })
    load()
  } catch(e: any) {
    alert(e.response.data.message)
  }
}

const startRaffle = async () => {
  if (!confirm('一旦完成抽奖，奖池和奖项将无法修改。\n继续？')) return

  // Get passwor from localStorage
  const list: RafflePoolStorage[] = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  let password = ""
  for (let i in list) {
    if (list[i].raffle_poll_id === $props.current) {
      password = list[i].password
      break
    }
  }

  try {
    await axios.post(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${$props.current}/winners`, {}, {
      headers: {
        'Authorization': `Bearer ${password}`,
      }
    })
    alert('抽奖完成。')
    load()
  } catch(e: any) {
    alert(e.response.data.message)
  }
}

const clipboard = async () => {
  await navigator.clipboard.writeText(`${state.domain}/raffles/${$props.current}`)
  alert('已复制到剪贴板。')
}
</script>

<template>
  <h1 class="title is-4">奖项</h1>
  <div class="field is-grouped">
    <div class="control">
      <button class="button is-link" @click="state.showNewTierModal = true" :disabled="state.raffle.has_raffled">添加一个新奖项</button>
    </div>
  </div>
  <table class="table">
    <thead>
      <tr>
        <th>奖项</th>
        <th>奖品描述</th>
        <th>获奖人数</th>
        <th v-if="!state.raffle.has_raffled">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(tier, _) in state.raffle.tiers" :key="tier.id">
        <th>{{ tier.name }}</th>
        <td>{{ tier.prize }}</td>
        <td>{{ tier.number }}</td>
        <td v-if="!state.raffle.has_raffled"><button class="button is-danger is-small" @click="deleteTier(tier.id)">删除</button></td>
      </tr>
    </tbody>
  </table>

  <div v-if="state.raffle.has_raffled">
    <h1 class="title is-4">中奖名单</h1>
    <div class="content" id="raffle_winnerlist">
      <ul>
        <div v-for="(tier, _) in state.raffle.tiers" :key="tier.id">
          <li>{{ tier.name }}</li>
          <ul>
            <li v-for="(winner, i) in tier.winners" :key="i">{{ winner.display_name }}</li>
          </ul>
        </div>
      </ul>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary" @click="state.showLink = true">分享中奖名单链接</button>
        </div>
      </div>
    </div>
  </div>

  <h1 class="title is-4">操作</h1>
  <div class="field is-grouped">
    <div class="control" v-if="!state.raffle.has_raffled">
      <button class="button is-primary" @click="startRaffle">进行抽奖</button>
    </div>
    <div class="control">
      <button class="button" @click="state.showParticipantModal = true">查看参与者列表</button>
    </div>
  </div>
  
  <Modal :show="state.showNewTierModal">
    <form @submit.prevent="newTier">
      <header class="modal-card-head">
        <p class="modal-card-title">添加一个新奖项</p>
        <button class="delete" aria-label="close" @click="state.showNewTierModal = false"></button>
      </header>
      <section class="modal-card-body is-clipped">
        <div class="field">
          <label class="label" for="form_name">奖项名称</label>
          <div class="control">
            <input class="input" type="text" placeholder="一等奖" id="form_name" required :disabled="state.submittingNewTier">
          </div>
        </div>

        <div class="field">
          <label class="label" for="form_number">获奖人数量</label>
          <div class="control">
            <input class="input" type="number" min="1" value="1" id="form_number" required :disabled="state.submittingNewTier">
          </div>
        </div>

        <div class="field">
          <label class="label" for="form_prize">奖品描述</label>
          <div class="control">
            <textarea class="textarea" id="form_prize" placeholder="西湖雅座一位" required :disabled="state.submittingNewTier" />
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <input type="submit" class="button is-success" value="添加" :disabled="state.submittingNewTier" />
      </footer>
    </form>
  </Modal>

  <Modal :show="state.showParticipantModal">
    <header class="modal-card-head">
      <p class="modal-card-title">参与者</p>
      <button class="delete" aria-label="close" @click="state.showParticipantModal = false"></button>
    </header>

    <section class="modal-card-body">
      <table class="table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>显示名</th>
            <th>参与时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(participant, _) in state.raffle.participants" :key="participant.username">
            <th>@{{ participant.username }}</th>
            <td>{{ participant.display_name }}</td>
            <td>{{ participant.time }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <footer class="modal-card-foot">
      <p>共 {{ state.raffle.participants_number }} 人</p>
    </footer>
  </Modal>

  <Modal :show="state.showLink">
    <header class="modal-card-head">
      <p class="modal-card-title">中奖名单链接</p>
      <button class="delete" aria-label="close" @click="state.showLink = false"></button>
    </header>

    <section class="modal-card-body">
      <QRCodeVue3 :value="`${state.domain}/raffles/${state.raffle.raffle_poll_id}`" />
    </section>
    <footer class="modal-card-foot">
      <button class="button is-primary" @click="clipboard">复制至剪贴板</button>
    </footer>
  </Modal>
</template>

<style scoped lang="scss">
.modal-card-foot {
  display: flex;
  justify-content: flex-end;
}
#raffle_winnerlist {
  margin-bottom: 20px;
}
</style>
