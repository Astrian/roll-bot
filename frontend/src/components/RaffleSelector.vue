<script setup lang="ts">
import { reactive, defineEmits } from 'vue'

const $emit = defineEmits(['navigate'])

const state = reactive({
  isDropdownActive: false,
  raffleList: [] as RafflePool[],
  raffleName: '',
  currentRaffle: ''
})

const load = () => {
  console.log('load')
  state.raffleList = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  const id = localStorage.getItem('current_raffle') ?? '_add'
  console.log(id)
  if (id === '_add') {
    state.raffleName = '添加新抽奖池'
    state.currentRaffle = '_add'
  } else {
    const raffle = state.raffleList.find(r => r.raffle_poll_id === id)
    if (raffle) {
      state.currentRaffle = id
      state.raffleName = raffle.name
    }
  }
}

defineExpose({
  load
})

</script>

<template>
<div class="dropdown" :class="state.isDropdownActive ? 'is-active' : ''">
  <div class="dropdown-trigger">
    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" @click='() => { state.isDropdownActive = !state.isDropdownActive }'>
      <span>{{ state.raffleName }}</span>
      <span class="icon is-small">
        <font-awesome-icon :icon="['fas', 'angle-down']" />
      </span>
    </button>
  </div>
  <div class="dropdown-menu" id="dropdown-menu" role="menu">
    <div class="dropdown-content">
      <a href="#" class="dropdown-item" :class="state.currentRaffle === '_add' ? 'is-active' : ''" @click="() => {$emit('navigate', '_add'); state.isDropdownActive = false}">
        添加新抽奖池
      </a>
      <div v-if="state.raffleList.length > 0">
        <hr class="dropdown-divider" />
        <div v-for="(raffle, _) in state.raffleList" :key="raffle.raffle_poll_id">
          <a href="#" class="dropdown-item" :class="state.currentRaffle === raffle.raffle_poll_id ? 'is-active' : ''" @click="() => {$emit('navigate', raffle.raffle_poll_id); state.isDropdownActive = false}">
            {{ raffle.name }}
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
</style>
