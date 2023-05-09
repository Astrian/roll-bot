<script setup lang="ts">
import { reactive } from 'vue'
import { onMounted } from 'vue'
import axios from 'axios'

const props = defineProps(['id'])

const state = reactive({
  ruffleDetailInfo: {} as RufflePool,
  showAddTierModel: false,
  newTier: {
    name: '',
    number: 1,
    prize: '',
  },
  addingNewTier: false
})

onMounted(async () => {
  loadRuffle()
})

const loadRuffle = async () => {
  const res = await axios.get(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${props.id}`)
  state.ruffleDetailInfo = res.data

  // Get desc from localStorage
  let pool_list = JSON.parse(localStorage.getItem('raffle_poll_id') ?? "[]")
  for (let i in pool_list) {
    const pool = pool_list[i]
    if (pool.id === props.id) {
      state.ruffleDetailInfo.desc = pool.desc
    }
  }
}

const addTier = async () => {
  state.addingNewTier = true
  console.log(state.newTier)

  try {
    await axios.post(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${props.id}/tiers`, state.newTier)
  } catch(e) {
    console.log(e)
  } finally {
    state.addingNewTier = false
    state.showAddTierModel = false
    state.newTier = {
      name: '',
      number: 1,
      prize: '',
    }
    loadRuffle()
  }
}

const removeTier = async (id: any) => {
  try{
    await axios.delete(`${import.meta.env.VITE_ENDPOINT_DOMAIN}/raffle_pools/${props.id}/tiers/${id}`)
  } catch(e) {
    alert(`无法删除奖项：${e}`)
  } finally {
    loadRuffle()
  }
}

</script>

<template>
  <a-layout>
    <a-layout-header style="background: #fff; padding: 0">
      <span style="margin: 16px">{{ state.ruffleDetailInfo.desc ?? props.id }}</span>
    </a-layout-header>
    <a-layout-content style="margin: 16px">
      <h2>奖项</h2>
      <a-button type="primary" @click="state.showAddTierModel = true">新增奖项</a-button>
      <a-table :columns="[
        { title: '奖项', dataIndex: 'name', key: 'name' },
        { title: '奖品', dataIndex: 'prize', key: 'name' },
        { title: '数量', dataIndex: 'number', key: 'name' },
        { title: '操作', dataIndex: 'operation' }
      ]" :dataSource="state.ruffleDetailInfo.tiers">
        <template #bodyCell="{ column, _, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-popconfirm title="即将删除此奖项" @confirm="removeTier(record.id)">
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
      <h2>参与者（{{ state.ruffleDetailInfo.participants_number }}）</h2>
      <a-table :columns="[
        { title: '显示名', dataIndex: 'display_name', key: 'username' },
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '参与抽奖时间', dataIndex: 'time', key: 'username' }
      ]" :dataSource="state.ruffleDetailInfo.participants" />
    </a-layout-content>
  </a-layout>

  <a-modal v-model:visible="state.showAddTierModel" title="新增奖项" @ok="addTier" :model="state.newTier">
    <a-form v-if="!state.addingNewTier">
      <a-form-item label="奖项名称" name="newtier_name">
        <a-input v-model:value="state.newTier.name" placeholder="一等奖" />
      </a-form-item>
      <a-form-item label="奖品描述" name="newtier_prize">
        <a-textarea v-model:value="state.newTier.prize" placeholder="奖品描述" />
      </a-form-item>
      <a-form-item label="获奖者数量" name="newtier_number" >
        <a-input v-model:value="state.newTier.number" min="1" type="number"  />
      </a-form-item>
    </a-form>
    <div v-else>
      <p>正在处理...</p>
    </div>
  </a-modal>
</template>