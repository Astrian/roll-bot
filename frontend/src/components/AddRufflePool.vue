<script setup lang="ts">
import axios from 'axios'
import { defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'newPool', id: string): void
}>()

const loadFile = async (event: Event) => {

  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  let res = await axios.post(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  // put raffle_poll_id into localStorage
  let pool_list = JSON.parse(localStorage.getItem('raffle_poll_id') ?? "[]")
  const date = new Date()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  pool_list.push({ id: res.data.raffle_poll_id, desc: `在 ${month} 月 ${day} 日 ${hour}:${minute} 创建的抽奖池`, active: true })
  localStorage.setItem('raffle_poll_id', JSON.stringify(pool_list))

  emit("newPool", res.data.raffle_poll_id)
}
</script>

<template>
  <a-layout>
    <a-layout-header style="background: #fff; padding: 0">
      <span style="margin: 16px">从 CSV 文件新增奖池</span>
    </a-layout-header>
    <a-layout-content style="margin: 16px">
      
      <form @submit.prevent="loadFile">
        <input type="file" accept=".csv" @change="loadFile">
      </form>
    </a-layout-content>
  </a-layout>
</template>