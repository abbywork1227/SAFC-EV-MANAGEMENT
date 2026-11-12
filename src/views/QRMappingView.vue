<script setup>
import { ref } from 'vue'
const props = defineProps({ stations: { type: Array, required: true } })
const emit = defineEmits(['update-qr','back'])
const editing = ref(null)
const preview = ref('')
const fileName = ref('')
function chooseFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) { alert('請選擇 PNG、JPG 或 WEBP 圖片'); event.target.value=''; return }
  const reader = new FileReader()
  reader.onload = () => { preview.value = String(reader.result); fileName.value = file.name }
  reader.readAsDataURL(file)
  event.target.value = ''
}
function openEdit(station) { editing.value = station; preview.value = station.qrImage || ''; fileName.value = '' }
function save() { if (!preview.value) return alert('請先選擇原廠 QR Code 圖片'); emit('update-qr', editing.value.id, preview.value); editing.value = null; preview.value = ''; fileName.value = '' }
</script>
<template>
  <section>
    <div class="section-heading"><div><h2>設備與 QR Code 對應</h2><p>查看各充電位置對應的原廠 QR Code；如原廠更換，請上傳新圖片。</p></div><button class="btn btn-outline" @click="emit('back')">← 返回系統設定</button></div>
    <div class="concept-banner"><strong>管理方式</strong><p>每個充電位置使用各自固定的原廠 QR Code。初次由客戶提供圖片並建置；日後如有更換，管理者選擇新圖片、預覽後儲存即可。請勿自行重新編輯 QR Code 內容。</p></div>
    <div class="qr-mapping-grid">
      <article v-for="station in stations" :key="station.id" class="qr-mapping-card">
        <div class="station-top"><strong>{{ station.id }}</strong><span class="status" :class="station.qrImage ? 'available' : 'neutral'">{{ station.qrImage ? '已設定' : '待上傳原廠圖片' }}</span></div>
        <div class="muted">{{ station.name }}</div>
        <div class="qr-image-preview"><img v-if="station.qrImage" :src="station.qrImage" :alt="station.id + ' 原廠 QR Code'"/><div v-else class="qr-empty"><span>▦</span><small>尚未設定 QR Code 圖片</small></div></div>
        <button class="btn btn-outline" @click="openEdit(station)">{{ station.qrImage ? '更換 QR 圖片' : '上傳 QR 圖片' }}</button>
      </article>
    </div>
    <div class="note-box">目前為前端原型：圖片選取後暫存在本次頁面資料中，重新整理會還原示意資料。正式系統需將圖片上傳至後端檔案儲存空間，資料庫保存圖片路徑及設備對應關係。</div>
    <div v-if="editing" class="modal-backdrop" @click.self="editing=null"><div class="dialog qr-edit-dialog"><div class="dialog-head"><h3>{{ editing.qrImage ? '更換' : '設定' }}原廠 QR Code</h3><button class="icon-close" @click="editing=null">×</button></div><p class="muted">充電位置：{{ editing.id }}｜{{ editing.name }}</p><label class="upload-drop"><input type="file" accept="image/png,image/jpeg,image/webp" @change="chooseFile"/><span class="upload-symbol">↑</span><strong>選擇原廠 QR Code 圖片</strong><small>支援 PNG、JPG、WEBP</small></label><div v-if="preview" class="qr-upload-preview"><img :src="preview" alt="QR Code 預覽"/><span>{{ fileName || '目前使用中的 QR Code' }}</span></div><div class="dialog-actions"><button class="btn btn-light" @click="editing=null">取消</button><button class="btn btn-primary" @click="save">確認並儲存</button></div></div></div>
  </section>
</template>
