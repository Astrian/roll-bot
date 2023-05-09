<script setup lang="ts">
import { reactive, defineEmits, onMounted } from 'vue'

const $props = defineProps(['current'])
const $emit = defineEmits(['navigate'])

const state = reactive({
  isDropdownActive: false,
  raffleList: [] as RafflePool[],
  raffleName: ''
})

onMounted(() => {
  load()
})

const load = () => {
  state.raffleList = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  if ($props.current === '_add') {
    state.raffleName = '添加新抽奖池'
  } else {
    const raffle = state.raffleList.find(r => r.id === $props.current)
    if (raffle) {
      state.raffleName = raffle.name
    }
  }
}

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
      <a href="#" class="dropdown-item" :class="$props.current === '_add' ? 'is-active' : ''" @click="() => {$emit('navigate', '_add'); state.isDropdownActive = false}">
        添加新抽奖池
      </a>
      <div v-if="state.raffleList.length > 0">
        <hr class="dropdown-divider" />
        <div v-for="(raffle, _) in state.raffleList" :key="raffle.id">
          <a href="#" class="dropdown-item" :class="$props.current === raffle.id ? 'is-active' : ''" @click="() => {$emit('navigate', raffle.id); state.isDropdownActive = false}">
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
