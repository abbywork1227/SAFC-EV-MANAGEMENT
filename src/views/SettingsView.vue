<script setup>
const emit = defineEmits(['open-qr'])
</script>
<template>
  <section>
    <div class="section-heading"><div><h2>系統設定</h2><p>設定設備狀態判斷、QR Code 顯示與系統安全參數</p></div></div>
    <div class="concept-banner"><strong>系統參數設定</strong><p>此頁只放系統本身的運作設定。使用紀錄匯出請到「使用紀錄 LOG」頁面；員工資料匯入、匯出及範本請到「員工／卡片管理」頁面操作。</p></div>
    <div class="settings-grid">
      <article class="setting-card"><div class="setting-icon">▦</div><h3>設備狀態更新</h3><p>設定外部電流偵測訊號的讀取及畫面更新間隔。</p><label class="setting-control">更新間隔<select><option>每 5 秒</option><option>每 10 秒</option><option>每 30 秒</option></select></label></article>
      <article class="setting-card"><div class="setting-icon">ϟ</div><h3>電流判斷門檻</h3><p>設定判斷設備進入使用中或結束使用的電流門檻。正式值需與硬體廠商確認。</p><label class="setting-control">狀態判斷門檻<input type="number" value="1.0" step="0.1" min="0" /> A</label></article>
      <article class="setting-card"><div class="setting-icon">▣</div><h3>QR Code 顯示時間</h3><p>員工選擇充電設備後，QR Code 顯示多久後自動關閉。</p><label class="setting-control">顯示時間<select><option>15 秒</option><option>30 秒</option><option>60 秒</option></select></label></article>
      <article class="setting-card"><div class="setting-icon">◷</div><h3>閒置自動登出</h3><p>管理者或員工一段時間未操作時，自動返回系統入口。</p><label class="setting-control">閒置時間<select><option>3 分鐘</option><option>5 分鐘</option><option>10 分鐘</option><option>15 分鐘</option></select></label></article>
      <button class="setting-card setting-card-action" type="button" @click="emit('open-qr')"><div class="setting-icon">▧</div><h3>設備與 QR 對應</h3><p>查看各充電位置目前使用的原廠 QR Code。若原廠更換 QR Code，可上傳新圖片更新對應。</p><span class="text-hint">進入 QR Code 管理　→</span></button>
    </div>
    <div class="note-box">目前為前端示意控制項，尚未儲存至正式設定資料庫。QR Code 圖片可在本示意頁面選取及預覽；正式環境需串接後端檔案儲存空間。</div>
  </section>
</template>
