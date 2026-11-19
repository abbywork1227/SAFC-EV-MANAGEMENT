<script setup>
const emit = defineEmits(['open-qr','open-announcements'])
</script>
<template>
  <section>
    <div class="concept-banner"><strong>系統參數設定</strong><p>系統時間直接使用中控台電腦的作業系統時間，不需另外設定。公告內容管理與輪播設定可由下方入口進入。</p></div>
    <div class="settings-grid">
      <button class="setting-card setting-card-action" type="button" @click="emit('open-announcements')"><div class="setting-icon">▤</div><h3>首頁公告管理</h3><p>透過 USB 匯入公告圖片、設定公告排序、啟用狀態及輪播時間。</p><span class="text-hint">進入公告管理　→</span></button>
      <article class="setting-card"><div class="setting-icon">▣</div><h3>QR Code 顯示時間</h3><p>員工選擇充電設備後，QR Code 預設顯示 40 秒，時間到自動返回設備列表；管理者可調整。</p><label class="setting-control">顯示時間<select><option selected>40 秒（預設）</option><option>30 秒</option><option>60 秒</option><option>90 秒</option></select></label></article>
      
      <button class="setting-card setting-card-action" type="button" @click="emit('open-qr')"><div class="setting-icon">▧</div><h3>設備與 QR 對應</h3><p>查看各充電位置目前使用的原廠 QR Code。若原廠更換 QR Code，可上傳新圖片更新對應。</p><span class="text-hint">進入 QR Code 管理　→</span></button>
    </div>
    <div class="note-box">目前為前端展示設定；正式環境需將設定儲存於本機資料庫，並依中控台作業系統時間記錄事件。</div>
  </section>
</template>
