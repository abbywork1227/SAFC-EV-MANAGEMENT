<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
const props = defineProps({ employees: { type: Array, required: true } })
const emit = defineEmits(['choose', 'authenticate', 'back'])
const selected = ref('')
const uid = ref('A0012345')
const error = ref('')
const showCard = ref(false)
const started = ref(false)
// Online image references are used for the demo. Local SVG fallbacks keep the kiosk carousel working offline.
const slides = ref([
  { image: '/announcement-merck.webp', fallback: '/announcement-merck.webp', alt: '客戶充電樁使用須知公告示意' },
  { image: 'https://static.wixstatic.com/media/e8a42a_feb594272bd74eba8dd8653695c721f7~mv2.png/v1/fill/w_1024%2Ch_576%2Cal_c/e8a42a_feb594272bd74eba8dd8653695c721f7~mv2.png', fallback: '/ev-demo-corporate.svg', alt: '企業電動車充電場域示意' },
  { image: 'https://promwad.com/sites/default/files/predictive-maintenance-ev-charging.jpg', fallback: '/ev-demo-safety.svg', alt: '電動車充電安全公告示意' }
])
const slideIndex = ref(0)
let slideTimer
onMounted(() => { slideTimer = setInterval(() => { if (!started.value) slideIndex.value = (slideIndex.value + 1) % slides.value.length }, 3000) })
onUnmounted(() => clearInterval(slideTimer))
watch(selected, () => { error.value = '' })
function handleImageError(slide, event) {
  if (slide && event.target.src !== new URL(slide.fallback, window.location.origin).href) {
    slide.image = slide.fallback
  }
}
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
  <div class="entry-screen idle-screen" :class="{ 'service-selection-screen': started }" @click.self="started = true">
    <section v-if="!started" class="idle-carousel" @click="started = true">
      <div class="idle-stage">
        <img class="idle-stage-backdrop" :src="slides[slideIndex].image" alt="" aria-hidden="true" @error="handleImageError(slides[slideIndex], $event)" />
        <img class="idle-stage-image" :key="slideIndex" :src="slides[slideIndex].image" :alt="slides[slideIndex].alt" @error="handleImageError(slides[slideIndex], $event)" />
        <div class="idle-dots" aria-label="公告輪播頁數"><i v-for="(slide,i) in slides" :key="i" :class="{active:slideIndex===i}"></i></div>
      </div>
      <div class="idle-footer">
        <button class="idle-enter" @click.stop="started = true">點擊畫面開始使用　→</button>
        <small class="idle-timer">公告每 3 秒自動輪播</small>
      </div>
    </section>
    <section v-else class="entry-card">
      <div class="entry-logo">⚡</div>
      <h1>充電管理中控台</h1>
      <p class="muted">請選擇服務項目</p>
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
