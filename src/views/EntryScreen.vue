<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ employees: { type: Array, required: true } })
const emit = defineEmits(['choose', 'authenticate', 'back'])
const selected = ref('')
const uid = ref('A0012345')
const error = ref('')
const showCard = ref(false)
watch(selected, () => { error.value = '' })
function choose(value) {
  selected.value = value
  showCard.value = true
  emit('choose', value)
}
function submit() {
  const result = emitResult()
  if (!result.ok) error.value = result.message
}
function emitResult() {
  const person = props.employees.find(e => e.uid === uid.value.trim() && e.active)
  if (!person) return { ok: false, message: '卡片未授權、尚未綁定或已停用，請確認後再試。' }
  if (selected.value === 'manage' && person.role !== '管理者') return { ok: false, message: '此卡片沒有管理者權限，無法進入管理後台。' }
  emit('authenticate', uid.value.trim())
  return { ok: true }
}
function back() { selected.value = ''; showCard.value = false; error.value = ''; emit('back') }
</script>
<template>
  <div class="entry-screen">
    <section class="entry-card">
      <div class="entry-brand">MERCK GROUP IN TAIWAN · EV CHARGING</div>
      <div class="entry-logo">⚡</div>
      <h1>Merck Group in Taiwan｜充電管理系統</h1>
      <p class="muted">歡迎使用，請選擇服務項目</p>
      <div v-if="!showCard" class="entry-options">
        <button class="entry-option" @click="choose('charge')"><span>⚡</span><strong>我要充電</strong><small>員工選擇充電設備並取得 QR Code</small></button>
        <button class="entry-option" @click="choose('manage')"><span>⚙</span><strong>我要管理</strong><small>管理者查看設備與管理資料</small></button>
      </div>
      <div v-else class="rfid-box">
        <div class="eyebrow">{{ selected === 'charge' ? '我要充電' : '我要管理' }}</div>
        <h2>請感應 RFID 卡片</h2>
        <p class="muted">系統會依卡片權限確認是否可進入此功能</p>
        <label class="field-label">展示用 RFID UID</label>
        <input v-model="uid" class="text-input" placeholder="輸入 RFID 卡片 UID" @keyup.enter="submit" />
        <button class="btn btn-primary full-width" @click="submit">模擬刷卡驗證</button>
        <p class="error-text" v-if="error">{{ error }}</p>
        <button class="text-button" @click="back">返回選擇服務</button>
        <p class="demo-hint">展示卡片：A0012345 管理者｜A0012346、A0012347 一般員工</p>
      </div>
    </section>
  </div>
</template>
