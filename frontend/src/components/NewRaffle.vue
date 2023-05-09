<script setup lang="ts">
import { reactive } from 'vue'
import axios from 'axios'

const $emit = defineEmits(['newRaffle'])

const state = reactive({
  form: {
    name: '',
    csv: new File([], '')
  },
  csv_filename: '',
  submitting: false,
})
const selectFile = async (event: Event) => {
  // extract file name
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    state.csv_filename = file.name
    state.form.csv = file
  }
}

const submit = async (event: Event) => {
  event.preventDefault()
  
  console.log(event.type)
  if (event.type !== 'submit') {
    return
  }

  state.submitting = true

  const name = ((event.target as HTMLFormElement)?.elements[0] as any).value
  const file = ((event.target as HTMLFormElement)?.elements[1] as any).files[0]

  if (name === '' || !file) {
    alert('请填写奖池名字和上传 CSV 文件')
    state.submitting = false
    return
  }

  const res = await axios.post(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools`, {
    name,
    file
  }, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })

  const { data } = res
  const list = JSON.parse(localStorage.getItem('raffle_list') || '[]')
  console.log(data)
  list.push({ ...data, name })
  localStorage.setItem('raffle_list', JSON.stringify(list))
  localStorage.setItem('current_raffle', data.raffle_poll_id)

  $emit('newRaffle')
}
</script>

<template>
<form @submit.prevent="submit" disabled>
  <div class="field">
    <label class="label" for="form_name">奖池名字</label>
    <div class="control">
      <input class="input" type="text" placeholder="幸运大抽奖" id="form_name" v-model="state.form.name" :disabled="state.submitting">
    </div>
  </div>
  <div class="field">
    <label class="label" for="form_csvupload">CSV 文件</label>
    <div class="file has-name">
      <label class="file-label" :disabled="state.submitting">
        <input class="file-input" type="file" name="raffle_participants" accept=".csv" id="form_csvupload" @change="selectFile" :disabled="state.submitting">
        <span class="file-cta">
          <span class="file-icon">
            <font-awesome-icon :icon="['fas', 'upload']" />
          </span>
          <span class="file-label">
            选择文件
          </span>
        </span>
        <span class="file-name">
          {{ state.csv_filename || '未选择文件' }}
        </span>
      </label>
    </div>
  </div>
  <div class="field is-grouped">
    <div class="control">
      <input type="submit" class="button is-link" value="提交" :disabled="state.submitting" />
    </div>
  </div>
</form>
</template>

<style scoped lang="scss">
</style>
