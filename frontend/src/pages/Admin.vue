<script setup lang="ts">
import RaffleSelector from '../components/RaffleSelector.vue'
import NewRaffle from '../components/NewRaffle.vue';
</script>

<template>
<div class="container">
  <h1 class="title">抽奖 bot</h1>
  <RaffleSelector />
  <hr />
  <NewRaffle />
</div>
</template>

<style scoped lang="scss">
.container {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
}
</style>
