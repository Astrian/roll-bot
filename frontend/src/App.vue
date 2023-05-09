<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({
  fileLoaded: false,
  participants: [] as {
    time: string
    display_name: string
    username: string
  }[],
  username_list: [] as string[]
})

const loadFile = (event: Event) => {
  if (event.type !== 'change') return

  const fileForm = (event.target as HTMLFormElement).files[0]
  
  // read file
  const reader = new FileReader()
  reader.readAsText(fileForm)
  reader.onload = () => {
    const csv = reader.result as string
    // remove all /r
    csv.replace(/\r/g, '')
    const lines = csv.split('\n')
    // remove first line
    lines.shift()
    for (const line of lines) {
      const [time, display_name, username] = line.split(',')
      const obj = {
        time,
        display_name,
        username: username.replace(/\@/g, '').replace(/\r/g, '')
      }
      state.participants.push(obj)
      state.username_list.push(obj.username)
    }
    state.fileLoaded = true
  }
}

</script>

<template>
  <div>
    <h1>抽奖 Bot</h1>
    <hr />
    <h2>Step 1: 加载写有抽奖参与者的 CSV 文件</h2>
    <form @submit.prevent="loadFile">
      <input type="file" accept=".csv" @change="loadFile">
    </form>
  </div>
</template>

<style scoped lang="scss">
</style>
