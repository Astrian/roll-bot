<script setup lang="ts">
const $props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

</script>

<template>
  <div class="modal" :class="$props.show ? 'is-active' : ''">
    <div class="modal-background"></div>
      <div class="modal-card">
        <slot></slot>
        
      </div>
  </div>
</template>

<style scoped lang="scss">

</style>