<script setup lang="ts">
/// <reference path="../types/Pool.d.ts" />

import { reactive } from 'vue'
import { onMounted } from 'vue'
import AddRufflePool from './components/AddRufflePool.vue'
import RuffleDetail from './components/RuffleDetail.vue'

const state = reactive({
  poolList: [] as Pool[],
  activePool: ['-1'],
})

onMounted(() => {
  // Check localStorage
  const raffle_poll_id_string = localStorage.getItem('raffle_poll_id')
  if (!raffle_poll_id_string) {
    localStorage.setItem('raffle_poll_id', '[]')
  }

  loadPoolList()

  for (let i in state.poolList) {
    const pool = state.poolList[i]
    if (pool.active) {
      state.activePool = [pool.id]
    }
  }
})

const loadPoolList = async () => {
  state.poolList = localStorage.getItem('raffle_poll_id') ? JSON.parse(localStorage.getItem('raffle_poll_id') ?? "[]") : []
}

const newPool = async (id: string) => {
  loadPoolList()
  state.activePool = [id]
}

</script>

<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider>
      <div class="logo">抽奖 Bot</div>
      <a-menu theme="dark" mode="inline" v-model:selectedKeys="state.activePool">
        <a-menu-item key="-1">
          <span>新增抽奖池</span>
        </a-menu-item>

        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <span>抽奖池</span>
            </span>
          </template>
          <a-menu-item v-for="item in state.poolList" :key="item.id">{{ item.desc }}</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <AddRufflePool v-if="state.activePool[0] === '-1'" @newPool="newPool" />
    <RuffleDetail v-else :id="state.activePool[0]" />
  </a-layout>
</template>

<style scoped lang="scss">
  .logo {
    float: left;
    width: 120px;
    height: 31px;
    margin: 16px 24px 16px 24px;
    font-size: 20px;
    color: white;
  }
</style>
