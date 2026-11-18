<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({ station: { type: Object, required: true }, purpose: { type: String, default: 'admin' } })
const emit = defineEmits(['close'])
const seconds = ref(40)
let timer
onMounted(() => { if (props.purpose === 'employee') timer = setInterval(() => { seconds.value--; if (seconds.value <= 0) emit('close') }, 1000) })
onUnmounted(() => clearInterval(timer))
</script>
<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="qr-dialog">
      <button class="icon-close qr-close" @click="$emit('close')">×</button>
      <div class="eyebrow">{{ purpose === 'admin' ? '管理者 QR CODE 檢視' : '員工充電 QR CODE' }}</div>
      <h2>{{ station.id }}｜{{ station.name }}</h2>
      <p class="muted">{{ purpose === 'admin' ? '管理者檢查 QR Code 對應是否正確' : '請使用原廠充電 App 掃描此 QR Code' }}</p>
      <img v-if="station.qrImage" class="qr-real-image" :src="station.qrImage" alt="原廠 QR Code"/><div v-else class="qr-demo"><div class="qr-center">DEMO<br>QR</div></div>
      <div class="qr-code-id">QR 對應代碼：{{ station.qrCode }}</div>
      <div v-if="purpose==='employee'" class="qr-countdown">QR Code 將於 <strong>{{seconds}}</strong> 秒後自動關閉</div>
      <div class="warning-text">{{ station.qrImage ? '此為已上傳的原廠 QR Code 圖片示意。' : '尚未設定原廠 QR Code；目前圖樣僅供展示，不能啟動實際充電。' }}</div>
      <button class="btn btn-primary full-width" @click="$emit('close')">{{purpose==='employee'?'返回設備列表':'關閉'}}</button>
    </div>
  </div>
</template>
