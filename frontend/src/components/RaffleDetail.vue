<script setup lang="ts">
/// <reference types="../../types/RafflePoolStorage.d.ts" />
import { defineProps, onMounted, reactive } from 'vue'
import axios from 'axios'

import Modal from './Modal.vue'

const $props = defineProps({
  current: {
    type: String,
    required: true
  }
})

const state = reactive({
  raffle: {} as RafflePool,
  showNewTierModal: false
})

onMounted(async () => {
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
})

const newTier = (event: Event) => {
  console.log(event)
}
</script>

<template>
  <h1 class="title is-4">奖项</h1>
  <div class="field is-grouped">
    <div class="control">
      <button class="button is-link" @click="state.showNewTierModal = true">添加一个新奖项</button>
    </div>
  </div>
  <h1 class="title is-4">参与者（{{state.raffle.participants_number}}）</h1>
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
            <input class="input" type="text" placeholder="一等奖" id="form_name" required>
          </div>
        </div>

        <div class="field">
          <label class="label" for="form_number">获奖人数量</label>
          <div class="control">
            <input class="input" type="number" min="1" value="1" id="form_number" required>
          </div>
        </div>

        <div class="field">
          <label class="label" for="form_prize">奖品描述</label>
          <div class="control">
            <textarea class="textarea" id="form_prize" placeholder="西湖雅座一位" required />
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <input type="submit" class="button is-success" value="添加" />
      </footer>
    </form>
  </Modal>
</template>

<style scoped lang="scss">
.modal-card-foot {
  display: flex;
  justify-content: flex-end;
}
</style>
