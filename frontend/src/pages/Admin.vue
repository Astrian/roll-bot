<script setup lang="ts">
import RaffleSelector from '../components/RaffleSelector.vue'
import NewRaffle from '../components/NewRaffle.vue'

if (!localStorage.getItem('raffle_list')) {
  localStorage.setItem('raffle_list', JSON.stringify([]))
}

const newRaffle = () => {
  console.log('newRaffle')
  console.log(localStorage.getItem('current_raffle'))
}
</script>

<template>
<div class="container">
  <h1 class="title">抽奖 bot</h1>
  <RaffleSelector />
  <hr />
  <NewRaffle @new-raffle="newRaffle" />
</div>
</template>

<style scoped lang="scss">
.container {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
}
</style>
