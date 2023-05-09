<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({
  isDropdownActive: false,
})
</script>

<template>
<div class="dropdown" :class="state.isDropdownActive ? 'is-active' : ''">
  <div class="dropdown-trigger">
    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" @click='() => { state.isDropdownActive = !state.isDropdownActive }'>
      <span>添加新抽奖池</span>
      <span class="icon is-small">
        <font-awesome-icon :icon="['fas', 'angle-down']" />
      </span>
    </button>
  </div>
  <div class="dropdown-menu" id="dropdown-menu" role="menu">
    <div class="dropdown-content">
      <a href="#" class="dropdown-item">
        添加新抽奖池
      </a>
      <hr class="dropdown-divider" />
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
</style>
