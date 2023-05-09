<script setup lang="ts">
/// <reference path="../../types/RafflePool.d.ts" />

import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
console.log(route.params.id)

const state = reactive({
  raffle: {} as RafflePool,
})

onMounted(async () => {
  const res = await axios.get(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${route.params.id}`)
  state.raffle = res.data
})
</script>

<template>
<div class="container">
  <div class="columns">
    <div class="column">
      <h1 class="title is-1">{{ state.raffle.name }}</h1>
      <h2 class="subtitle">{{ state.raffle.has_raffled ? '已开奖' : '未开奖'}}</h2>
      <hr />
      <h2 class="title is-2">奖项</h2>
      <div v-for="(tier, _) in state.raffle.tiers" :key="tier.id">
        <div class="tier-name">{{ tier.name }}</div>
        <div class="tier-prize">{{ tier.prize }}（{{tier.number}} 位）</div>
        <div v-if="state.raffle.has_raffled">
          <div class="winner_name" v-for="(winner, _) in tier.winners" :key="winner.id">{{ winner.display_name }} <span class="winner_username">(@{{ winner.username }})</span></div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
* {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.column {
  margin-top: 40px;
  .tier-name {
    font-weight: 700;
    font-size: 25px;
  }
  .tier-prize {
    margin-bottom: 20px;
  }

  .winner_name {
    flex-direction: row;
    .winner_username {
      color: gray;
    }
  }
}
</style>
