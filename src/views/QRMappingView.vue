<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({ stations: { type: Array, required: true } })
const emit = defineEmits(['update-qr','back'])
const drafts = reactive({})
watch(() => props.stations, (items) => {
  items.forEach(station => { drafts[station.id] = station.qrUrl || '' })
}, { immediate: true, deep: true })
function save(station) {
  const value = String(drafts[station.id] || '').trim()
  if (!value) return alert('請輸入原廠提供的 QR Code 對應網址')
  try { new URL(value) } catch { return alert('請輸入有效的網址（需包含 https:// 或 http://）') }
  emit('update-qr', station.id, value)
  alert(`${station.id} QR Code 對應網址已儲存`)
}
</script>
<template>
 <section class="qr-mapping-view">
  <!-- <div class="section-heading"><div><h2>設備與 QR Code 網址對應</h2><p>每個設備只需設定原廠 QR Code 對應網址，系統依網址產生 QR Code，不需另存圖片。</p></div><button class="btn btn-outline" @click="emit('back')">← 返回系統設定</button></div> -->
  <!-- <div class="concept-banner"><strong>管理方式</strong><p>請填入廠商提供的原始 QR Code 網址。若廠商更新 QR Code，只需更新該設備的網址；請勿自行修改網址內容。</p></div> -->
  <div class="qr-mapping-list">
   <article v-for="station in stations" :key="station.id" class="qr-mapping-card">
    <div class="qr-mapping-card-head">
      <strong class="qr-station-id">{{ station.id }}</strong>
      <span class="status" :class="station.qrUrl ? 'available' : 'neutral'">{{ station.qrUrl ? '已設定' : '尚未設定' }}</span>
    </div>
    <label class="qr-url-field"><span>原廠 QR Code 對應網址</span><input v-model="drafts[station.id]" type="url" placeholder="請輸入原廠 QR Code 網址（https://...）" /></label>
    <div class="qr-mapping-card-actions"><button class="btn btn-primary" @click="save(station)">{{ station.qrUrl ? '更新網址' : '儲存網址' }}</button></div>
   </article>
  </div>
 </section>
</template>
