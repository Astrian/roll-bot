<script setup lang="ts">
import { reactive } from 'vue'
import { onMounted } from 'vue'
import axios from 'axios'

const props = defineProps(['id'])

const state = reactive({
  ruffleDetailInfo: {} as RufflePool
})

onMounted(async () => {
  const res = await axios.get(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${props.id}`)
  state.ruffleDetailInfo = res.data

  // Get desc from localStorage
  let pool_list = JSON.parse(localStorage.getItem('raffle_poll_id') ?? "[]")
  for (let i in pool_list) {
    const pool = pool_list[i]
    if (pool.id === props.id) {
      state.ruffleDetailInfo.desc = pool.desc
    }
  }
})

</script>

<template>
  <a-layout>
    <a-layout-header style="background: #fff; padding: 0">
      <span style="margin: 16px">{{ state.ruffleDetailInfo.desc ?? props.id }}</span>
    </a-layout-header>
    <a-layout-content style="margin: 16px">
      <h2>奖项</h2>
      <button>新增一个奖项</button>
      <a-table :columns="[
        { title: '奖项', dataIndex: 'prize', key: 'prize' }
      ]" :dataSource="state.ruffleDetailInfo.tiers" />
      <h2>参与者（{{ state.ruffleDetailInfo.participants_number }}）</h2>
      <a-table :columns="[
        { title: '显示名', dataIndex: 'display_name', key: 'username' },
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '参与抽奖时间', dataIndex: 'time', key: 'username' }
      ]" :dataSource="state.ruffleDetailInfo.participants" />
    </a-layout-content>
  </a-layout>
</template>