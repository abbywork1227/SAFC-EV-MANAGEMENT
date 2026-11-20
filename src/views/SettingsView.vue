<script setup>
import { computed } from 'vue'
const props = defineProps({ inactivitySettings: { type: Object, required: true } })
const emit = defineEmits(['open-qr','open-announcements','save-inactivity'])
const settings = computed(() => props.inactivitySettings)
</script>
<template>
  <section>
    <!-- <div class="concept-banner"><strong>系統參數設定</strong><p>系統時間直接使用中控台電腦的作業系統時間，不需另外設定。公告內容管理與輪播設定可由下方入口進入。</p></div> -->
    <div class="settings-grid">
      <button class="setting-card setting-card-action" type="button" @click="emit('open-announcements')"><div class="setting-icon">▤</div><h3>首頁公告管理</h3><p>透過 USB 匯入公告圖片、設定公告排序、啟用狀態及輪播時間。</p><span class="text-hint">進入公告管理　→</span></button>
      <article class="setting-card"><div class="setting-icon">▣</div><h3>QR Code 顯示時間</h3><p>員工選擇充電設備後，QR Code 預設顯示 40 秒，時間到自動返回設備列表；管理者可調整。</p><label class="setting-control">顯示時間<select><option selected>40 秒（預設）</option><option>30 秒</option><option>60 秒</option><option>90 秒</option></select></label></article>
      <button class="setting-card setting-card-action" type="button" @click="emit('open-qr')"><div class="setting-icon">▧</div><h3>設備與 QR 對應</h3><p>查看各充電位置目前使用的原廠 QR Code。若原廠更換 QR Code，可更新對應。</p><span class="text-hint">進入 QR Code 管理　→</span></button>
    </div>
    <section class="inactivity-setting-panel">
      <div class="inactivity-panel-heading">
        <div><div class="setting-icon">⏱</div><h3>閒置自動登出</h3></div>
        <span class="inactivity-scope">適用對象：一般員工及管理者</span>
      </div>
      <p>員工刷卡進入充電操作介面，或管理者登入管理後台後，系統即開始計算閒置時間。有操作會重新計時；達到提醒時間後顯示倒數視窗，倒數結束仍無操作便自動登出。</p>
      <div class="inactivity-settings-fields">
        <label class="setting-check"><input v-model="settings.enabled" type="checkbox"> 啟用閒置自動登出</label>
        <label class="setting-control">閒置提醒時間<select v-model.number="settings.idleMinutes" :disabled="!settings.enabled"><option :value="1">1 分鐘</option><option :value="2">2 分鐘</option><option :value="3">3 分鐘</option><option :value="5">5 分鐘（預設）</option><option :value="10">10 分鐘</option><option :value="15">15 分鐘</option><option :value="30">30 分鐘</option></select></label>
        <label class="setting-control">提醒倒數時間<select v-model.number="settings.warningSeconds" :disabled="!settings.enabled"><option :value="15">15 秒</option><option :value="30">30 秒（預設）</option><option :value="45">45 秒</option><option :value="60">60 秒</option></select></label>
        <button class="btn btn-primary setting-save" @click="emit('save-inactivity')">儲存自動登出設定</button>
      </div>
    </section>
    <div class="note-box">目前為前端展示設定；自動登出設定會保存在此瀏覽器的本機儲存空間。正式環境需整合本機資料庫，並依中控台作業系統時間記錄事件。</div>
  </section>
</template>
