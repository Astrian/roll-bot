<script setup lang="ts">
/// <reference types="../../types/RafflePoolStorage.d.ts" />
import { defineProps, onMounted } from 'vue'
import axios from 'axios'

const $props = defineProps({
  current: {
    type: String,
    required: true
  }
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

      console.log(res.data)
      return
    }
  }
})
</script>

<template>
  {{ $props.current }}
</template>

<style scoped lang="scss">
</style>
