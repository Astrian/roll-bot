<script setup lang="ts">
import RaffleSelector from '../components/RaffleSelector.vue'
import NewRaffle from '../components/NewRaffle.vue'
import { onMounted, reactive } from 'vue'

const state = reactive({
  raffle_list: [],
  current_raffle: '',
})

if (!localStorage.getItem('raffle_list')) {
  localStorage.setItem('raffle_list', JSON.stringify([]))
}

onMounted(() => {
  load()
})

const load = () => {
  const list = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  state.raffle_list = list
  state.current_raffle = localStorage.getItem('current_raffle') ?? '_add'
}

const navigate = (id: string) => {
  localStorage.setItem('current_raffle', id)
  state.current_raffle = id
}
</script>

<template>
<div class="container">
  <h1 class="title">抽奖 bot</h1>
  <RaffleSelector @navigate="navigate" :current="state.current_raffle" />
  <hr />
  <NewRaffle @new-raffle="load" v-if="state.current_raffle === '_add'" />
</div>
</template>

<style scoped lang="scss">
.container {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
}
</style>
