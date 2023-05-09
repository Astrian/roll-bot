import sqlite3 from 'sqlite3'
const db = new sqlite3.Database('./data.db')

export default {
  get: (sql: string, params: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err: any, result: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  },
  run: (sql: string, params: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err: any, result: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  },
  all: (sql: string, params: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err: any, result: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
}