<script setup>
import { statusLabels } from '../data'
defineProps({ stations: { type: Array, required: true } })
defineEmits(['show-qr'])
</script>
<template>
  <section>
    <div class="section-heading"><div><h2>充電設備目前狀態</h2><p>共 10 個充電位置｜管理者可查看各設備 QR Code</p></div><div class="legend"><span><i class="dot available-dot"></i>可使用</span><span><i class="dot charging-dot"></i>使用中</span><span><i class="dot fault-dot"></i>故障</span><span><i class="dot offline-dot"></i>離線</span></div></div>
    <div class="station-grid">
      <article v-for="station in stations" :key="station.id" class="station-card">
        <div class="station-top"><strong>{{ station.id }}</strong><span class="status" :class="station.status">{{ statusLabels[station.status] }}</span></div>
        <div class="muted">{{ station.name }}</div>
        <div class="station-detail">{{ station.status === 'charging' ? `目前偵測電流：${station.amps} A` : station.status === 'available' ? '目前未偵測到電流' : '請確認設備及通訊狀態' }}</div>
        <button class="btn btn-outline" @click="$emit('show-qr', station)">▦ 查看 QR Code</button>
      </article>
    </div>
    <div class="note-box">設備狀態由外部電流偵測訊號推估；本示意畫面使用模擬資料。QR Code 為檢視用示意圖，非原廠有效啟動碼。</div>
  </section>
</template>
