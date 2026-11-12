<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ logs: { type: Array, required: true } })
const emit = defineEmits(['export'])
const dateFrom = ref('')
const dateTo = ref('')
const keyword = ref('')
const station = ref('')
const status = ref('')
const filtered = computed(() => props.logs.filter(log => {
  const inFrom = !dateFrom.value || log.date >= dateFrom.value
  const inTo = !dateTo.value || log.date <= dateTo.value
  const key = keyword.value.trim().toLowerCase()
  const matchKeyword = !key || [log.emp, log.name, log.dept].some(v => String(v).toLowerCase().includes(key))
  const matchStation = !station.value || log.station === station.value
  const matchStatus = !status.value || log.status === status.value
  return inFrom && inTo && matchKeyword && matchStation && matchStatus
}))
function clearFilters() { dateFrom.value=''; dateTo.value=''; keyword.value=''; station.value=''; status.value='' }
</script>
<template>
  <section>
    <div class="section-heading"><div><h2>充電使用紀錄</h2><p>依 QR Code 發放及電流偵測事件彙整；可查詢與匯出</p></div><button class="btn btn-primary" @click="emit('export', filtered)">↓ 匯出目前查詢結果</button></div>
    <div class="filter-panel">
      <div class="filter-field"><label>開始日期</label><input type="date" v-model="dateFrom" /></div>
      <div class="filter-field"><label>結束日期</label><input type="date" v-model="dateTo" /></div>
      <div class="filter-field search-field"><label>員工編號／姓名／部門</label><input v-model="keyword" placeholder="輸入關鍵字" /></div>
      <div class="filter-field"><label>充電設備</label><select v-model="station"><option value="">全部設備</option><option v-for="n in 8" :key="n" :value="`A${String(n).padStart(2,'0')}`">A{{ String(n).padStart(2,'0') }}</option><option value="F01-1">F01-1</option><option value="F01-2">F01-2</option></select></div>
      <div class="filter-field"><label>使用狀態</label><select v-model="status"><option value="">全部狀態</option><option>已完成</option><option>充電中</option><option>僅發放 QR</option></select></div>
      <button class="btn btn-light filter-clear" @click="clearFilters">清除條件</button>
    </div>
    <div class="table-summary">查詢結果：<strong>{{ filtered.length }}</strong> 筆</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>日期</th><th>員工</th><th>設備編號</th><th>QR Code 顯示時間</th><th>電流開始時間</th><th>電流結束時間</th><th>使用時間</th><th>狀態</th><th>用電量</th></tr></thead>
        <tbody>
          <tr v-for="log in filtered" :key="log.id">
            <td>{{ log.date }}</td><td><strong>{{ log.name }}</strong><small class="cell-sub">{{ log.emp }}｜{{ log.dept }}</small></td><td>{{ log.station }}</td><td>{{ log.qrTime }}</td><td>{{ log.start }}</td><td>{{ log.end }}</td><td>{{ log.duration }}</td><td><span class="status" :class="log.status === '已完成' ? 'available' : log.status === '充電中' ? 'charging' : 'neutral'">{{ log.status }}</span></td><td>{{ log.kwh }}</td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="9" class="empty-cell">沒有符合條件的紀錄</td></tr>
        </tbody>
      </table>
    </div>
    <div class="note-box">注意：顯示 QR Code 只代表系統發放過 QR Code，不代表已開始充電。開始／結束時間以電流偵測訊號為準；用電量需確認電表或硬體是否提供 kWh。</div>
  </section>
</template>
