<script setup>
import { computed, ref } from 'vue'
const emit = defineEmits(['go-card-management'])
const props = defineProps({ page: String, stations: Array, logs: Array, operator: { type: String, default: '管理者' } })
const title = computed(() => ({announcements:'首頁公告管理', reports:'統計報表', equipment:'設備狀態管理與異常紀錄', points:'員工積點（暫定功能）'}[props.page] || '管理功能'))
const announcements = ref([
 {id:1,title:'充電設備使用公告',file:'charging_notice.jpg',enabled:true,order:1},
 {id:2,title:'停車場安全提醒',file:'safety_reminder.png',enabled:true,order:2},
 {id:3,title:'設備維護通知',file:'maintenance.png',enabled:false,order:3}
])
const statusHistory = ref([])
const originalStatuses = ref(Object.fromEntries(props.stations.map(s => [s.id, s.status])))
const changeReasons = ref({})
const newTitle = ref('')
const selectedFile = ref('')
const period = ref('本月')
const dateFrom = ref('2026-11-01')
const dateTo = ref('2026-11-18')
const appliedFrom = ref(dateFrom.value)
const appliedTo = ref(dateTo.value)
const filteredLogs = computed(() => props.logs.filter(l => (!appliedFrom.value || l.date >= appliedFrom.value) && (!appliedTo.value || l.date <= appliedTo.value)))
const hourlyCounts = computed(() => Array.from({length:24},(_,h)=>filteredLogs.value.filter(l => { const t=String(l.start||''); return t.includes(':') && Number(t.slice(0,2))===h }).length))
const deviceCounts = computed(() => props.stations.map(st => ({ id:st.id, count:filteredLogs.value.filter(l=>l.station===st.id).length })))
const maxHourly = computed(() => Math.max(1,...hourlyCounts.value))
const deviceAxisMax = computed(() => Math.max(5, Math.ceil(Math.max(0,...deviceCounts.value.map(x=>x.count))/5)*5))
const deviceAxisTicks = computed(() => Array.from({length:6},(_,i)=>Math.round(deviceAxisMax.value*i/5)))
const activeUsers = {'A02':'陳小華','A05':'黃志偉','A07':'許庭瑜','F01-1':'王小明'}
function setPeriod(value){ period.value=value; const end='2026-11-18'; dateTo.value=end; if(value==='本月') dateFrom.value='2026-11-01'; else if(value==='本年度') dateFrom.value='2026-01-01'; else dateFrom.value='2026-10-20'; appliedFrom.value=dateFrom.value; appliedTo.value=dateTo.value }
function applyReportFilters(){ appliedFrom.value=dateFrom.value; appliedTo.value=dateTo.value }
const activeTab = ref('usage')
const carouselSeconds = ref('3')
const equipmentKeyword = ref('')
const statusDateFrom = ref('')
const statusDateTo = ref('')
const appliedStatusKeyword = ref('')
const appliedStatusFrom = ref('')
const appliedStatusTo = ref('')
const filteredStations = computed(() => props.stations.filter(s => !appliedStatusKeyword.value || `${s.id} ${s.name} ${s.status}`.toLowerCase().includes(appliedStatusKeyword.value.trim().toLowerCase())))
const filteredStatusHistory = computed(() => statusHistory.value.filter(x => {
 const day=String(x.time||'').slice(0,10).replaceAll('/','-')
 const dateOk=(!appliedStatusFrom.value || day>=appliedStatusFrom.value) && (!appliedStatusTo.value || day<=appliedStatusTo.value)
 const q=appliedStatusKeyword.value.trim().toLowerCase()
 return dateOk && (!q || `${x.station} ${x.from} ${x.to} ${x.reason} ${x.operator}`.toLowerCase().includes(q))
}))
function applyStatusFilters(){appliedStatusKeyword.value=equipmentKeyword.value;appliedStatusFrom.value=statusDateFrom.value;appliedStatusTo.value=statusDateTo.value}
function clearStatusFilters(){equipmentKeyword.value='';statusDateFrom.value='';statusDateTo.value='';appliedStatusKeyword.value='';appliedStatusFrom.value='';appliedStatusTo.value=''}
const pointRows = ref([
 {id:'E002',name:'陳小華',points:1,reason:'疑似逾時占用（暫定）'},
 {id:'E003',name:'林大偉',points:3,reason:'逾時占用（暫定）'},
 {id:'E004',name:'張雅婷',points:0,reason:'—'},
 {id:'E009',name:'蔡承翰',points:2,reason:'管理者登記違規（暫定）'}
])
const pointModal = ref(null)
const pointHistory = ref([
 {time:'2026/11/17 10:30',id:'E003',name:'林大偉',amount:2,reason:'逾時占用（暫定）',operator:'系統'},
 {time:'2026/11/16 15:20',id:'E002',name:'陳小華',amount:1,reason:'違規占用（暫定）',operator:'管理者'},
 {time:'2026/11/15 09:10',id:'E009',name:'蔡承翰',amount:1,reason:'違規占用（暫定）',operator:'管理者'}
])
const pointAmount = ref('1')
const pointKeyword = ref('')
const appliedPointKeyword = ref('')
const pointDateFrom = ref('')
const pointDateTo = ref('')
const appliedPointFrom = ref('')
const appliedPointTo = ref('')
const filteredPointHistory = computed(() => pointHistory.value.filter(x => {
 const day=String(x.time||'').slice(0,10).replaceAll('/','-')
 const dateOk=(!appliedPointFrom.value || day>=appliedPointFrom.value) && (!appliedPointTo.value || day<=appliedPointTo.value)
 const keyword=appliedPointKeyword.value.trim().toLowerCase()
 return dateOk && (!keyword || `${x.id} ${x.name} ${x.reason}`.toLowerCase().includes(keyword))
}))
const filteredPointRows = computed(() => {
 const hasFilters=!!(appliedPointFrom.value || appliedPointTo.value || appliedPointKeyword.value.trim())
 if(!hasFilters) return pointRows.value
 const matchedIds=new Set(filteredPointHistory.value.map(x=>x.id))
 return pointRows.value.filter(x=>matchedIds.has(x.id))
})
function applyPointFilters(){appliedPointFrom.value=pointDateFrom.value;appliedPointTo.value=pointDateTo.value;appliedPointKeyword.value=pointKeyword.value}
function clearPointFilters(){pointKeyword.value='';appliedPointKeyword.value='';pointDateFrom.value='';pointDateTo.value='';appliedPointFrom.value='';appliedPointTo.value=''}
function exportPointHistory(){
 const rows=[['扣點時間','員工編號','員工姓名','扣點數','扣點原因','操作人員'],...filteredPointHistory.value.map(x=>[x.time,x.id,x.name,x.amount,x.reason,x.operator])]
 const html='\ufeff<html><head><meta charset="UTF-8"></head><body><table>'+rows.map((r,i)=>'<tr>'+r.map(v=>`<${i===0?'th':'td'}>${String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</${i===0?'th':'td'}>`).join('')+'</tr>').join('')+'</table></body></html>'
 const url=URL.createObjectURL(new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='員工違規扣點紀錄.xls';a.click();URL.revokeObjectURL(url)
}
const pointReason = ref('逾時占用（暫定）')
function openPointModal(row){pointModal.value=row;pointAmount.value='1';pointReason.value='逾時占用（暫定）'}
function savePointDeduction(){
 const row=pointModal.value
 if(!row || !pointReason.value.trim()) return alert('請填寫扣點原因')
 const before=row.points
 row.points=Math.min(3,row.points+Number(pointAmount.value)); row.reason=pointReason.value
 pointHistory.value.unshift({time:new Date().toLocaleString('zh-TW',{hour12:false}),id:row.id,name:row.name,amount:row.points-before,reason:pointReason.value,operator:props.operator})
 pointModal.value=null
 if(row.points>=3 && before<3 && confirm(`${row.name} 累計扣點已達 3 點。是否前往員工／卡片管理設定停用期間？`)) emit('go-card-management',row.id)
}
function saveStatuses(){ const changed=props.stations.filter(s=>s.status!==originalStatuses.value[s.id]); if(changed.some(s=>!String(changeReasons.value[s.id]||'').trim())) return alert('請為每一筆設備狀態變更填寫原因。'); const now=new Date().toLocaleString('zh-TW',{hour12:false}); changed.forEach(s=>{statusHistory.value.unshift({id:Date.now()+Math.random(),station:s.id,from:statusText(originalStatuses.value[s.id]),to:statusText(s.status),reason:changeReasons.value[s.id],operator:props.operator,time:now});originalStatuses.value[s.id]=s.status;changeReasons.value[s.id]=''}); alert(changed.length ? '設備狀態及異動紀錄已儲存（前端示意）' : '設備狀態沒有變更。') }
function statusText(v){return ({available:'可使用',charging:'使用中',maintenance:'維修中',fault:'故障中',offline:'離線'})[v]||v}
const peakHour = computed(()=>{const counts={}; filteredLogs.value.forEach(l=>{const t=String(l.start||''); const h=Number(t.slice(0,2)); if(Number.isFinite(h)&&t.includes(':')) counts[h]=(counts[h]||0)+1}); const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]); return sorted.length?Number(sorted[0][0]):null})
const peakLabel = computed(()=>peakHour.value===null?'資料不足':`${String(peakHour.value).padStart(2,'0')}:00–${String((peakHour.value+1)%24).padStart(2,'0')}:00`)
const offPeakLabel = computed(()=>peakHour.value===null?'資料不足':`非尖峰時段（其餘時段）`)
function addAnnouncement(e){ const f=e.target.files?.[0]; if(f) selectedFile.value=f.name }
function saveAnnouncement(){ if(!newTitle.value || !selectedFile.value) return alert('請填寫公告標題並選擇圖片'); announcements.value.push({id:Date.now(),title:newTitle.value,file:selectedFile.value,enabled:true,order:announcements.value.length+1});newTitle.value='';selectedFile.value='';alert('公告已加入示意清單') }
function move(item,dir){const i=announcements.value.indexOf(item),j=i+dir;if(j<0||j>=announcements.value.length)return;[announcements.value[i],announcements.value[j]]=[announcements.value[j],announcements.value[i]];announcements.value.forEach((x,k)=>x.order=k+1)}
function notice(message){ window.alert(message) }
function exportStatusHistory(){ const rows=[['異動時間','設備','原狀態','新狀態','變更原因','操作人員'],...filteredStatusHistory.value.map(x=>[x.time,x.station,x.from,x.to,x.reason,x.operator])]; const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); const html='\ufeff<html><head><meta charset="UTF-8"></head><body><table>'+rows.map((r,i)=>'<tr>'+r.map(v=>`<${i===0?'th':'td'}>${esc(v)}</${i===0?'th':'td'}>`).join('')+'</tr>').join('')+'</table></body></html>'; const url=URL.createObjectURL(new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8;'})); const a=document.createElement('a');a.href=url;a.download='設備狀態異動紀錄.xls';a.click();URL.revokeObjectURL(url) }
</script>
<template>
<section>
 <template v-if="page==='announcements'">
  <!-- <div class="concept-banner"><strong>公告圖片管理</strong><p>請先將 JPG、JPEG 或 PNG 圖片存入 USB，再選取圖片匯入本機。匯入完成後可移除 USB；公告圖片由本機儲存及輪播。</p></div> -->
  <div class="filter-panel"><div class="filter-field search-field"><label>公告標題</label><input v-model="newTitle" placeholder="輸入公告標題" /></div><div class="filter-field"><label>選擇公告圖片（USB）</label><input type="file" accept="image/png,image/jpeg" @change="addAnnouncement" /></div><span class="table-summary">{{selectedFile || '尚未選擇圖片'}}</span><button class="btn btn-primary" @click="saveAnnouncement">＋ 匯入公告</button></div>
  <div class="filter-panel"><div><strong>首頁待機輪播</strong><p class="muted">員工尚未點擊畫面時自動播放啟用中的公告；點擊畫面後進入充電／管理選擇。</p></div><label class="setting-control">統一輪播時間 <select v-model="carouselSeconds"><option value="3">3 秒</option><option value="5">5 秒</option><option value="10">10 秒</option></select></label></div>
  <div class="table-wrap"><table><thead><tr><th>順序</th><th>公告標題</th><th>圖片檔案</th><th>啟用狀態</th><th>排序</th></tr></thead><tbody><tr v-for="a in announcements" :key="a.id"><td>{{a.order}}</td><td><strong>{{a.title}}</strong></td><td>{{a.file}}</td><td><label class="switch-control"><input type="checkbox" v-model="a.enabled"><span class="switch-slider"></span></label> {{a.enabled?'啟用':'停用'}}</td><td><button class="btn btn-small btn-outline" @click="move(a,-1)">↑</button> <button class="btn btn-small btn-outline" @click="move(a,1)">↓</button></td></tr></tbody></table></div>
  <div class="note-box">目前為前端展示操作；正式版需將圖片複製至本機儲存路徑，並保存公告資料及排序。</div>
 </template>
 <template v-else-if="page==='reports'">
  <div class="export-toolbar"><button class="btn btn-primary" @click="notice('報表匯出示意：正式版將輸出 Excel 至 USB')">↓ 匯出 Excel（USB）</button></div>
  <div class="filter-panel"><div class="filter-field"><label>統計區間</label><select :value="period" @change="setPeriod($event.target.value)"><option>本月</option><option>本年度</option><option>近 30 天</option></select></div><div class="filter-field"><label>起始日期</label><input type="date" v-model="dateFrom" /></div><div class="filter-field"><label>結束日期</label><input type="date" v-model="dateTo" /></div><button class="btn btn-outline" @click="applyReportFilters">查詢</button></div>
  <div class="stats-cards"><article><small>充電使用次數</small><strong>{{filteredLogs.length}}</strong><span>次</span></article><article><small>設備總數</small><strong>{{stations.length}}</strong><span>個充電位置</span></article><article><small>目前使用中</small><strong>{{stations.filter(s=>s.status==='charging').length}}</strong><span>個</span></article><article><small>設備使用率</small><strong>36.8%</strong><span>示意數據</span></article></div>
  <div class="report-tabs"><button :class="{active:activeTab==='usage'}" @click="activeTab='usage'">使用趨勢</button><button :class="{active:activeTab==='device'}" @click="activeTab='device'">設備統計</button><button :class="{active:activeTab==='peak'}" @click="activeTab='peak'">尖離峰分析</button></div>
  <div class="report-panel" v-if="activeTab==='usage'"><h3>24 小時使用趨勢</h3><p>依目前查詢結果統計各時段充電開始次數；調整日期並按查詢後，圖表與數字會同步更新。</p><div class="bar-chart"><div v-for="(v,i) in hourlyCounts" :key="i"><span :style="{height:Math.max(3,(v/maxHourly)*100)+'%'}"></span><small v-if="i%3===0">{{String(i).padStart(2,'0')}}:00</small></div></div><div v-if="!filteredLogs.length" class="empty-cell">此統計區間沒有紀錄</div></div>
  <div class="report-panel" v-else-if="activeTab==='device'"><h3>各設備使用次數</h3><div class="device-bars device-bars-single"><div class="device-chart-rows"><div v-for="s in deviceCounts" :key="s.id"><label>{{s.id}}</label><span><i :style="{width:Math.min(100,(s.count/deviceAxisMax)*100)+'%'}"></i></span><b>{{s.count}} 次</b></div></div><div class="device-axis"><span v-for="tick in deviceAxisTicks" :key="tick">{{tick}}</span></div><p class="chart-caption">橫軸：使用次數（次）；刻度依目前資料統一顯示。</p></div><div v-if="!filteredLogs.length" class="empty-cell">此統計區間沒有紀錄</div></div>
  <div class="report-panel" v-else><h3>尖峰／離峰使用分析</h3><p>依目前查詢期間的充電開始時間分布進行統計推估，非客戶預先設定的固定電價時段。</p><div class="stats-cards"><article><small>統計推估尖峰時段</small><strong>{{peakLabel}}</strong><span>開始充電紀錄最多的時段</span></article><article><small>統計推估離峰時段</small><strong>{{offPeakLabel}}</strong><span>其餘非尖峰時段</span></article></div></div>
  <div class="note-box">目前圖表依展示用紀錄計算，選擇統計區間並按查詢後會更新；實際資料以本機紀錄為準。現有電流感測僅可推估使用開始／結束，無法直接取得 kWh；使用率公式及尖離峰區間需由客戶確認。</div>
 </template>
 <template v-else-if="page==='equipment'">
   <div class="export-toolbar"><button class="btn btn-outline" @click="exportStatusHistory">↓ 匯出設備異動紀錄 Excel</button></div>
   <div class="section-heading"><div><h2>設備狀態</h2><p>查看設備目前狀態；管理者可調整設備狀態並留下異動紀錄。</p></div></div>
  <div class="stats-cards status-six">
   <article><small>可使用</small><strong>{{stations.filter(s=>s.status==='available').length}}</strong><span>個設備</span></article>
   <article><small>使用中</small><strong>{{stations.filter(s=>s.status==='charging').length}}</strong><span>個設備</span></article>
   <article><small>故障／維修中</small><strong>{{stations.filter(s=>['fault','maintenance'].includes(s.status)).length}}</strong><span>個設備</span></article>
   <article class="tentative-card"><small>充電完成（暫定功能）</small><strong>示意</strong><span>電流停止達設定時間</span></article>
   <article class="tentative-card"><small>逾時占用（暫定功能）</small><strong>待確認</strong><span>需確認車輛仍在車位</span></article>
  </div>
   <div class="filter-panel history-filter">
    <div class="filter-field search-field"><label>搜尋設備／異動內容</label><input v-model="equipmentKeyword" placeholder="設備編號、名稱、狀態、原因或操作人員" /></div>
    <div class="filter-field"><label>異動開始日期</label><input type="date" v-model="statusDateFrom" /></div>
    <div class="filter-field"><label>異動結束日期</label><input type="date" v-model="statusDateTo" /></div>
    <button class="btn btn-outline" @click="applyStatusFilters">查詢</button>
    <button class="btn btn-light" @click="clearStatusFilters">清除條件</button>
   </div>
   <div class="management-combined-section">
   <div class="section-heading"><div><h3>設備清單</h3><p>顯示 {{filteredStations.length}} 台設備</p></div></div>
   <div class="station-grid"> <article v-for="s in filteredStations" :key="s.id" class="station-card"><div class="station-top"><strong>{{s.id}}</strong><span class="status" :class="s.status==='maintenance'?'neutral':s.status">{{s.status==='available'?'可使用':s.status==='charging'?'使用中':s.status==='maintenance'?'維修中':s.status==='fault'?'故障中':'離線'}}</span></div><div class="muted">{{s.name}}</div><div class="filter-field"><label>管理者狀態設定</label><select v-model="s.status"><option value="available">可使用</option><option value="maintenance">維修中</option><option value="fault">故障中</option></select></div><div v-if="s.status==='charging'" class="current-user">目前使用者：<strong>{{activeUsers[s.id] || '員工示意資料'}}</strong></div><div v-if="s.status!==originalStatuses[s.id]" class="filter-field"><label>狀態變更原因（必填）</label><input v-model="changeReasons[s.id]" placeholder="例如：設備異常，暫停開放檢修" /></div></article></div>
  <div class="save-row"><span>調整設備狀態後，請按儲存套用變更。</span><button class="btn btn-primary" @click="saveStatuses">儲存設備狀態</button></div>
  <div class="section-heading" style="margin-top:26px"><div><h3>設備狀態異動紀錄</h3><p>查詢結果：{{filteredStatusHistory.length}} 筆</p></div></div>
   <div class="table-wrap"><table><thead><tr><th>異動時間</th><th>設備</th><th>原狀態</th><th>新狀態</th><th>變更原因</th><th>操作人員</th></tr></thead><tbody><tr v-for="i in filteredStatusHistory" :key="i.id"><td>{{i.time}}</td><td>{{i.station}}</td><td>{{i.from}}</td><td>{{i.to}}</td><td>{{i.reason}}</td><td>{{i.operator}}</td></tr><tr v-if="!filteredStatusHistory.length"><td colspan="6" class="empty-cell">沒有符合條件的設備異動紀錄</td></tr></tbody></table></div>
   </div>
  <div class="note-box">設備總覽與狀態管理已整合於同一頁。電流訊號可判斷充電開始及停止，但充電停止不代表車輛已離開；維修中及故障中均由管理者手動設定，儲存時填寫原因並留下異動紀錄。</div>
 </template>
 <template v-else-if="page==='points'">
  <div class="export-toolbar"><button class="btn btn-primary" @click="exportPointHistory">↓ 匯出扣點紀錄 Excel</button></div>
  <div class="section-heading"><div><h2>員工違規扣點（暫定功能）</h2><p>查看員工目前累計扣點及每筆扣點紀錄。</p></div></div>
   <div class="filter-panel history-filter">
    <div class="filter-field search-field"><label>搜尋員工／扣點原因</label><input v-model="pointKeyword" placeholder="員工編號、姓名或扣點原因" /></div>
   <div class="filter-field"><label>扣點開始日期</label><input type="date" v-model="pointDateFrom" /></div>
   <div class="filter-field"><label>扣點結束日期</label><input type="date" v-model="pointDateTo" /></div>
   <button class="btn btn-outline" @click="applyPointFilters">查詢</button>
   <button class="btn btn-light" @click="clearPointFilters">清除條件</button>
  </div>
  <div class="point-combined-section">
   <h3>員工累計扣點</h3>
   <div class="table-wrap"><table><thead><tr><th>員工編號</th><th>員工姓名</th><th>累計扣點</th><th>卡片處置</th><th>最近扣點原因</th><th>管理操作</th></tr></thead><tbody>
    <tr v-for="row in filteredPointRows" :key="row.id"><td>{{row.id}}</td><td>{{row.name}}</td><td>{{row.points}} / 3 點</td><td>{{row.points>=3?'達門檻，待停用':'正常使用'}}</td><td>{{row.reason}}</td><td><button class="btn btn-small btn-outline" @click="openPointModal(row)">＋ 手動扣點</button><button v-if="row.points>=3" class="btn btn-small btn-primary" @click="emit('go-card-management',row.id)">前往卡片管理停用</button></td></tr>
    <tr v-if="!filteredPointRows.length"><td colspan="6" class="empty-cell">沒有符合條件的員工</td></tr>
   </tbody></table></div>
   <h3 class="point-history-heading">違規扣點紀錄</h3>
   <div class="table-summary">查詢結果：{{filteredPointHistory.length}} 筆</div>
   <div class="table-wrap"><table><thead><tr><th>異動時間</th><th>員工</th><th>異動點數</th><th>異動方式</th><th>原因</th><th>操作人員</th></tr></thead><tbody>
    <tr v-for="(item,index) in filteredPointHistory" :key="index"><td>{{item.time}}</td><td>{{item.name}}（{{item.id}}）</td><td>-{{item.amount}}</td><td>{{item.operator==='系統'?'自動扣點（暫定）':'管理者手動扣點'}}</td><td>{{item.reason}}</td><td>{{item.operator}}</td></tr>
    <tr v-if="!filteredPointHistory.length"><td colspan="6" class="empty-cell">沒有符合條件的扣點紀錄</td></tr>
   </tbody></table></div>
  </div>
  <div v-if="pointModal" class="modal-backdrop" @click.self="pointModal=null"><div class="dialog"><div class="dialog-head"><h3>管理者手動扣點</h3><button class="icon-close" @click="pointModal=null">×</button></div><p>{{pointModal.name}}（{{pointModal.id}}）目前累計 {{pointModal.points}} / 3 點</p><label>本次扣點<select v-model="pointAmount"><option value="1">1 點</option><option value="2">2 點</option><option value="3">3 點</option></select></label><label>扣點原因<input v-model="pointReason" placeholder="請輸入違規原因" /></label><div class="dialog-actions"><button class="btn btn-light" @click="pointModal=null">取消</button><button class="btn btn-primary" @click="savePointDeduction">確認扣點</button></div></div></div>
 </template>
</section>
</template>
