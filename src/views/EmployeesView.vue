<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ employees: { type: Array, required: true }, suspendEmployeeId: { type: String, default: '' } })
const emit = defineEmits(['add','toggle-role','toggle-active','bind-card','export','clear-suspend-target'])
const search = ref('')
const cardStatusFilter = ref('全部狀態')
const bindingDateFrom = ref('')
const bindingDateTo = ref('')
const appliedCardKeyword = ref('')
const appliedBindingFrom = ref('')
const appliedBindingTo = ref('')
const pageSize = 10
const cardPage = ref(1)
const bindingHistoryPage = ref(1)
const showAdd = ref(false)
const importPreview = ref(null)
const importFileName = ref('')
const importedUnboundCards = ref([])
const form = ref({ id:'', name:'', dept:'', role:'一般員工' })
const cardOverrides = ref({})
const selectedEmployees = ref({})
const unbindTarget = ref(null)
const unbindReason = ref('離職繳回')
const unbindOtherReason = ref('')
const suspendTarget = ref(null)
const suspendReason = ref('違規扣點達 3 點')
const suspendStart = ref(new Date().toISOString().slice(0,10))
const suspendEnd = ref('')
const bindingHistory = ref([
  { id: 1, time: '2026/11/18 09:00', uid: 'A0012345', from: '—', to: '王小明（E001）', reason: '初次綁定', operator: '管理者' },
  { id: 2, time: '2026/11/18 09:15', uid: 'A0012346', from: '陳小華（E002）', to: '未綁定', reason: '員工離職繳回', operator: '管理者' }
])
const filteredBindingHistory = computed(() => bindingHistory.value.filter(x => {
   const day = String(x.time || '').slice(0,10).replaceAll('/','-')
   const q=appliedCardKeyword.value.trim().toLowerCase()
   const keywordOk=!q || `${x.uid} ${x.from} ${x.to} ${x.reason} ${x.operator}`.toLowerCase().includes(q)
   return keywordOk && (!appliedBindingFrom.value || day >= appliedBindingFrom.value) && (!appliedBindingTo.value || day <= appliedBindingTo.value)
 }))
 function applyBindingHistoryFilters(){ appliedCardKeyword.value=search.value; appliedBindingFrom.value=bindingDateFrom.value; appliedBindingTo.value=bindingDateTo.value; cardPage.value=1; bindingHistoryPage.value=1 }
 function clearBindingHistoryFilters(){ search.value=''; appliedCardKeyword.value=''; cardStatusFilter.value='全部狀態'; bindingDateFrom.value=''; bindingDateTo.value=''; appliedBindingFrom.value=''; appliedBindingTo.value=''; cardPage.value=1; bindingHistoryPage.value=1 }
 function recordBinding(uid, from, to, reason) {
  bindingHistory.value.unshift({
    id: Date.now() + Math.random(),
    time: new Date().toLocaleString('zh-TW', { hour12: false }),
    uid, from: from || '未綁定', to: to || '未綁定',
    reason, operator: '目前管理者'
  })
}
const authorizedUids = ['A0012345','A0012346','A0012347','A0012348','A0012349','A0012350','A0012351','A0012352','A0012353','A0012354','A0012355']
const allCards = computed(() => [...new Set([...authorizedUids, ...props.employees.map(e=>e.uid).filter(Boolean), ...importedUnboundCards.value])].map(uid => { const e=props.employees.find(x=>x.uid===uid); return { uid, employee:e?.name || '—', employeeId:e?.id || '—', employeeRef:e || null, status:cardOverrides.value[uid] || (e ? (e.cardStatus || (e.active ? '使用中' : '停用')) : '未綁定') } }))
watch(() => props.suspendEmployeeId, (id) => { if(id){ const card=allCards.value.find(c=>c.employeeId===id); if(card) openSuspend(card); emit('clear-suspend-target') } }, { immediate: true })
const cardRows = computed(() => allCards.value.filter(c => (!appliedCardKeyword.value || [c.uid,c.employee,c.employeeId,c.status].some(v=>String(v).toLowerCase().includes(appliedCardKeyword.value.trim().toLowerCase()))) && (cardStatusFilter.value === '全部狀態' || c.status === cardStatusFilter.value)))
const pagedCardRows = computed(() => cardRows.value.slice((cardPage.value-1)*pageSize,cardPage.value*pageSize))
const pagedBindingHistory = computed(() => filteredBindingHistory.value.slice((bindingHistoryPage.value-1)*pageSize,bindingHistoryPage.value*pageSize))
const cardPageCount = computed(() => Math.max(1,Math.ceil(cardRows.value.length/pageSize)))
const bindingHistoryPageCount = computed(() => Math.max(1,Math.ceil(filteredBindingHistory.value.length/pageSize)))
function changeCardPage(page){cardPage.value=Math.min(cardPageCount.value,Math.max(1,page))}
function changeBindingHistoryPage(page){bindingHistoryPage.value=Math.min(bindingHistoryPageCount.value,Math.max(1,page))}
const boundCount = computed(() => allCards.value.filter(c=>c.employeeRef).length)
const unboundCount = computed(() => allCards.value.filter(c=>c.status==='未綁定').length)
function restoreCard(card){
  cardOverrides.value[card.uid] = card.employeeRef ? '使用中' : '未綁定'
  recordBinding(card.uid, card.employeeRef ? `${card.employee}（${card.employeeId}）` : '未綁定', card.employeeRef ? `${card.employee}（${card.employeeId}）` : '未綁定', '停用期滿／管理者恢復授權')
}
function setCardStatus(card,status){
  const reason = status === '遺失' ? '卡片掛失' : status === '損壞' ? '卡片損壞' : status === '停用' ? '管理者停用' : '卡片尋回／恢復未綁定'
  if (card.employeeRef && ['遺失','損壞','停用'].includes(status)) {
    recordBinding(card.uid, `${card.employee}（${card.employeeId}）`, '未綁定', reason)
    emit('bind-card',card.employeeId,'')
  } else {
    recordBinding(card.uid, card.employeeRef ? `${card.employee}（${card.employeeId}）` : '未綁定', status === '未綁定' ? '未綁定' : status, reason)
  }
  cardOverrides.value[card.uid]=status
}
function saveBinding(card){
  const employeeId = selectedEmployees.value[card.uid]
  if (!employeeId) return alert('請先選擇要綁定的員工')
  const employee = props.employees.find(e=>e.id===employeeId)
  if (!employee) return
  if (employee.uid && employee.uid !== card.uid) return alert('此員工已有綁定卡片，請先解除原卡片綁定。')
  if (card.employeeRef && card.employeeRef.id !== employee.id) return alert('請先解除目前綁定員工，再重新指派。')
  recordBinding(card.uid, card.employeeRef?.name ? `${card.employeeRef.name}（${card.employeeRef.id}）` : '未綁定', `${employee.name}（${employee.id}）`, '卡片綁定')
  emit('bind-card', employee.id, card.uid)
  cardOverrides.value[card.uid] = '使用中'
  delete selectedEmployees.value[card.uid]
}
function unbind(card){ unbindTarget.value=card; unbindReason.value='離職繳回'; unbindOtherReason.value='' }
function confirmUnbind(){
  const card=unbindTarget.value
  if(!card) return
  const reason=unbindReason.value==='其他' ? unbindOtherReason.value.trim() : unbindReason.value
  if(!reason) return alert('請填寫解除綁定原因')
  recordBinding(card.uid, `${card.employee}（${card.employeeId}）`, '未綁定', reason)
  emit('bind-card',card.employeeId,'')
  cardOverrides.value[card.uid]='未綁定'
  unbindTarget.value=null
}
function openSuspend(card){
  suspendTarget.value=card; suspendReason.value='違規扣點達 3 點'
  suspendStart.value=new Date().toISOString().slice(0,10)
  const end=new Date(); end.setMonth(end.getMonth()+3)
  suspendEnd.value=`${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`
}
function confirmSuspend(){
  const card=suspendTarget.value
  if(!card) return
  if(!suspendReason.value.trim()) return alert('請填寫停用原因')
  if(!suspendStart.value || !suspendEnd.value || suspendEnd.value < suspendStart.value) return alert('請確認停用起始日及結束日')
  recordBinding(card.uid, card.employeeRef ? `${card.employee}（${card.employeeId}）` : '未綁定', '停用', `${suspendReason.value}；停用期間 ${suspendStart.value} 至 ${suspendEnd.value}`)
  cardOverrides.value[card.uid]='停用'
  suspendTarget.value=null
}
function parseCsvLine(line){ const out=[]; let cur='', quoted=false; for(let i=0;i<line.length;i++){const ch=line[i]; if(ch==='"' && line[i+1]==='"' && quoted){cur+='"';i++} else if(ch==='"'){quoted=!quoted} else if(ch===','&&!quoted){out.push(cur);cur=''} else cur+=ch} out.push(cur); return out }
async function unzipXlsxEntries(buffer){
 const bytes=new Uint8Array(buffer), view=new DataView(buffer); let eocd=-1
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65558);i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break}}
 if(eocd<0) throw new Error('無法讀取 XLSX 壓縮檔')
 const count=view.getUint16(eocd+10,true), cdOffset=view.getUint32(eocd+16,true), entries={}; let pos=cdOffset
 for(let n=0;n<count;n++){if(view.getUint32(pos,true)!==0x02014b50) break; const method=view.getUint16(pos+10,true), csize=view.getUint32(pos+20,true), nameLen=view.getUint16(pos+28,true), extraLen=view.getUint16(pos+30,true), commentLen=view.getUint16(pos+32,true), local=view.getUint32(pos+42,true); const name=new TextDecoder().decode(bytes.slice(pos+46,pos+46+nameLen)); const lp=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true); let data=bytes.slice(lp,lp+csize); if(method===8)data=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); else if(method!==0) throw new Error('不支援此 XLSX 壓縮格式'); entries[name]=new TextDecoder().decode(data); pos+=46+nameLen+extraLen+commentLen }
 return entries
}
async function parseXlsx(file){
 const entries=await unzipXlsxEntries(await file.arrayBuffer()); const parser=new DOMParser()
 const shared=entries['xl/sharedStrings.xml']?Array.from(parser.parseFromString(entries['xl/sharedStrings.xml'],'application/xml').getElementsByTagName('si')).map(si=>Array.from(si.getElementsByTagName('t')).map(t=>t.textContent).join('')):[]
 const xml=parser.parseFromString(entries['xl/worksheets/sheet1.xml'],'application/xml'), rows=[]
 for(const row of Array.from(xml.getElementsByTagName('row'))){const values=[];for(const cell of Array.from(row.getElementsByTagName('c'))){const col=(cell.getAttribute('r')||'A1').match(/[A-Z]+/)?.[0]||'A';let idx=0;for(const ch of col)idx=idx*26+ch.charCodeAt(0)-64;const type=cell.getAttribute('t'),v=cell.getElementsByTagName('v')[0]?.textContent||'',inline=Array.from(cell.getElementsByTagName('t')).map(t=>t.textContent).join('');values[idx-1]=type==='s'?(shared[Number(v)]||''):type==='inlineStr'?inline:v}rows.push(values)}
 return rows
}
function buildImportPreview(rows){
 const headers=rows[0].map(x=>String(x||'').trim()), index=name=>headers.indexOf(name)
 const records=rows.slice(1).map(c=>({id:String(c[index('員工編號')]||'').trim(),name:String(c[index('員工姓名')]||'').trim(),dept:String(c[index('部門')]||'').trim(),uid:String(c[index('RFID UID')]||'').trim(),role:String(c[index('管理者權限')]||'N').toUpperCase()==='Y'?'管理者':'一般員工',cardStatus:String(c[index('卡片狀態')]||'未綁定').trim(),suspendStart:c[index('停用開始日')]||'',suspendEnd:c[index('停用結束日')]||'',reason:String(c[index('本次異動說明')]||'').trim()})).filter(x=>(x.id&&x.name)||x.uid)
 if(!records.length)throw new Error('找不到有效的員工資料，請確認欄位名稱及必填資料')
 const employeeRows=records.filter(r=>r.id&&r.name),old=new Map(props.employees.map(e=>[e.id,e])),incoming=new Map(employeeRows.map(e=>[e.id,e])),changes=[]
 employeeRows.forEach(r=>{const o=old.get(r.id);if(!o)changes.push({type:'新增員工',name:r.name,uid:r.uid,reason:r.reason||'新增員工資料'});else{if(o.name!==r.name||o.dept!==r.dept)changes.push({type:'修改員工資料',name:r.name,uid:r.uid,reason:r.reason});if((o.uid||'')!==(r.uid||''))changes.push({type:r.uid?'卡片綁定／更換':'解除卡片綁定',name:r.name,uid:r.uid||o.uid,reason:r.reason})}})
 props.employees.filter(e=>!incoming.has(e.id)).forEach(e=>changes.push({type:'移除員工',name:e.name,uid:e.uid,reason:e.importReason||`${e.name}離職，解除卡片綁定`}))
 importPreview.value={rows:employeeRows,unboundRows:records.filter(r=>!r.id&&r.uid),changes}
}
async function readImportFile(event){
 const file=event.target.files?.[0];if(!file)return;importFileName.value=file.name
 try{if(file.name.toLowerCase().endsWith('.xlsx'))buildImportPreview(await parseXlsx(file));else{const text=await file.text(),lines=text.replace(/^\ufeff/,'').split(/\r?\n/).filter(x=>x.trim());if(lines.length<2)throw new Error('匯入檔案沒有員工資料');buildImportPreview([parseCsvLine(lines[0]),...lines.slice(1).map(parseCsvLine)])}}
 catch(err){alert(`匯入失敗：${err.message||'請檢查檔案格式'}`)}
}

function confirmImport(){ if(!importPreview.value) return; importedUnboundCards.value=importPreview.value.unboundRows.map(r=>r.uid); importPreview.value.unboundRows.forEach(r=>{cardOverrides.value[r.uid]=r.cardStatus||'未綁定'}); emit('import',importPreview.value.rows); importPreview.value=null; importFileName.value=''; alert('匯入資料已套用（前端示意）；正式版仍需由資料庫保存匯入快照及異動歷史。') }
function save(){
  if (!form.value.id || !form.value.name) return alert('請填寫員工編號及姓名')
  if (props.employees.some(e=>e.id===form.value.id)) return alert('員工編號已存在')
  emit('add',{...form.value,uid:''})
  form.value={id:'',name:'',dept:'',role:'一般員工'};showAdd.value=false
}

function xmlEscape(value){return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;')}
function excelColumn(index){let n=index+1,out='';while(n){const r=(n-1)%26;out=String.fromCharCode(65+r)+out;n=Math.floor((n-1)/26)}return out}
function makeCrcTable(){const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);table[n]=c>>>0}return table}
const crcTable=makeCrcTable()
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
function zipStore(files){
  const encoder=new TextEncoder(), localParts=[], centralParts=[];let offset=0
  for(const [name,content] of Object.entries(files)){
    const nameBytes=encoder.encode(name),data=encoder.encode(content),crc=crc32(data)
    const local=new Uint8Array(30+nameBytes.length+data.length),lv=new DataView(local.buffer)
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x0800,true);lv.setUint16(8,0,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,nameBytes.length,true);local.set(nameBytes,30);local.set(data,30+nameBytes.length);localParts.push(local)
    const central=new Uint8Array(46+nameBytes.length),cv=new DataView(central.buffer)
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,0,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,nameBytes.length,true);cv.setUint32(42,offset,true);central.set(nameBytes,46);centralParts.push(central);offset+=local.length
  }
  const centralSize=centralParts.reduce((n,p)=>n+p.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer)
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,centralParts.length,true);ev.setUint16(10,centralParts.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true)
  return new Blob([...localParts,...centralParts,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
}
function createXlsxBlob(rows,sheetName){
  const sheetRows=rows.map((row,r)=>`<row r="${r+1}">${row.map((value,c)=>{const ref=`${excelColumn(c)}${r+1}`;return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`}).join('')}</row>`).join('')
  const files={
    '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEscape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:${excelColumn(Math.max(0,(rows[0]||[]).length-1))}${Math.max(1,rows.length)}"/></worksheet>`
  }
  return zipStore(files)
}
function downloadXlsx(filename,rows,sheetName){const url=URL.createObjectURL(createXlsxBlob(rows,sheetName));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportBindingHistory(){
  const rows=[['異動時間','卡片 UID','原綁定員工','新綁定員工','異動原因','操作人員'],...bindingHistory.value.map(x=>[x.time,x.uid,x.from,x.to,x.reason,x.operator])]
  downloadXlsx('卡片綁定異動紀錄.xlsx',rows,'綁定異動紀錄')
}
function exportCards(){
  const rows=[['員工編號','員工姓名','部門','RFID UID','管理者權限','卡片狀態','停用開始日','停用結束日','本次異動說明'],...allCards.value.map(c=>[c.employeeRef?.id||'',c.employeeRef?.name||'',c.employeeRef?.dept||'',c.uid,c.employeeRef?.role==='管理者'?'Y':'N',c.status,c.employeeRef?.suspendStart||'',c.employeeRef?.suspendEnd||'', ''])]
  downloadXlsx('員工卡片清單.xlsx',rows,'員工卡片清單')
}
</script>
<template>
<section class="employees-view">
 <div class="export-toolbar">
  <button class="btn btn-outline" @click="exportCards">↓ 匯出卡片清單</button>
  <button class="btn btn-outline" @click="exportBindingHistory">↓ 匯出綁定異動紀錄 Excel</button>
  <a class="btn btn-outline" href="/員工卡片匯入範本.xlsx" download>↓ 下載 Excel 匯入範本</a><label class="btn btn-primary import-file-button">↑ 匯入員工名單<input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" @change="readImportFile" hidden /></label>
 </div>

 <div class="stats-cards">
  <article><small>授權卡片</small><strong>{{allCards.length}}</strong><span>卡號清單（示意）</span></article>
  <article><small>已綁定</small><strong>{{boundCount}}</strong><span>張</span></article>
  <article><small>未綁定</small><strong>{{unboundCount}}</strong><span>張</span></article>
  <article><small>遺失／損壞／停用</small><strong>{{allCards.filter(c=>['遺失','損壞','停用'].includes(c.status)).length}}</strong><span>張</span></article>
 </div>

 <!-- 查詢條件獨立於下方同框列表；日期僅篩選綁定異動紀錄 -->
 <div class="filter-panel history-filter employee-binding-filter">
  <div class="filter-field search-field">
   <label>搜尋卡片／員工／異動內容</label>
   <input v-model="search" placeholder="卡片 UID、員工姓名、編號、異動原因或操作人員" />
  </div>
  <div class="filter-field card-status-filter"><label>卡片狀態（僅篩選授權卡片清單）</label><select v-model="cardStatusFilter" @change="cardPage=1"><option>全部狀態</option><option>使用中</option><option>未綁定</option><option>停用</option><option>遺失</option><option>損壞</option></select></div>
  <div class="filter-field"><label>異動開始日期</label><input type="date" v-model="bindingDateFrom" /></div>
  <div class="filter-field"><label>異動結束日期</label><input type="date" v-model="bindingDateTo" /></div>
  <button class="btn btn-outline" @click="applyBindingHistoryFilters">查詢</button>
  <button class="btn btn-light" @click="clearBindingHistoryFilters">清除條件</button>
 </div>

 <!-- 主清單與異動紀錄共用同一個外框，內部採垂直排列 -->
 <div class="management-combined-section employee-card-management-panel">
  <section class="management-list-block">
   <div class="section-heading">
    <div><h2>授權卡片清單</h2></div>
   </div>
   <div class="table-wrap">
    <table>
     <thead><tr><th>授權卡片 UID</th><th>卡片狀態</th><th>綁定員工</th><th>員工編號／部門</th><th>管理者權限</th></tr></thead>
     <tbody>
      <tr v-for="card in pagedCardRows" :key="card.uid">
       <td><code>{{card.uid}}</code></td>
       <td><span class="status" :class="card.status==='使用中'?'available':card.status==='未綁定'?'neutral':'fault'">{{card.status}}</span></td>
       <td v-if="card.employeeRef"><strong>{{card.employeeRef.name}}</strong></td>
       <td v-else>—</td>
       <td>{{card.employeeRef ? `${card.employeeId}｜${card.employeeRef.dept}` : '—'}}</td>
       <td>{{card.employeeRef?.role === '管理者' ? '是' : '否'}}</td>
      </tr>
      <tr v-if="!cardRows.length"><td colspan="5" class="empty-cell">沒有符合條件的卡片</td></tr>
     </tbody>
    </table>
   </div>
   <div class="pagination-row">
    <span>共 {{cardRows.length}} 張卡片｜每頁 10 筆</span>
    <div class="pagination-controls">
     <button class="btn btn-small btn-outline" :disabled="cardPage<=1" @click="changeCardPage(cardPage-1)">上一頁</button>
     <span>第 {{cardPage}} / {{cardPageCount}} 頁</span>
     <button class="btn btn-small btn-outline" :disabled="cardPage>=cardPageCount" @click="changeCardPage(cardPage+1)">下一頁</button>
    </div>
   </div>
  </section>

  <section class="management-history-block">
   <div class="section-heading"><div><h3>卡片綁定異動紀錄</h3></div></div>
   <div class="table-summary">綁定異動紀錄查詢結果：{{filteredBindingHistory.length}} 筆</div>
   <div class="table-wrap">
    <table>
     <thead><tr><th>異動時間</th><th>卡片 UID</th><th>原綁定員工</th><th>新綁定員工</th><th>異動原因</th><th>操作人員</th></tr></thead>
     <tbody>
      <tr v-for="item in pagedBindingHistory" :key="item.id">
       <td>{{item.time}}</td><td><code>{{item.uid}}</code></td><td>{{item.from}}</td><td>{{item.to}}</td><td>{{item.reason}}</td><td>{{item.operator}}</td>
      </tr>
      <tr v-if="!filteredBindingHistory.length"><td colspan="6" class="empty-cell">尚無卡片綁定異動紀錄</td></tr>
     </tbody>
    </table>
   </div>
   <div class="pagination-row">
    <span>共 {{filteredBindingHistory.length}} 筆紀錄｜每頁 10 筆</span>
    <div class="pagination-controls">
     <button class="btn btn-small btn-outline" :disabled="bindingHistoryPage<=1" @click="changeBindingHistoryPage(bindingHistoryPage-1)">上一頁</button>
     <span>第 {{bindingHistoryPage}} / {{bindingHistoryPageCount}} 頁</span>
     <button class="btn btn-small btn-outline" :disabled="bindingHistoryPage>=bindingHistoryPageCount" @click="changeBindingHistoryPage(bindingHistoryPage+1)">下一頁</button>
    </div>
   </div>
  </section>
 </div>

 <div class="note-box">員工及卡片資料僅透過 Excel 匯入管理，卡片清單為唯讀查詢；系統比對前次成功匯入資料，依異動說明建立歷史紀錄。卡機不預載員工授權名單，而是刷卡時由管理系統資料庫即時驗證。重新綁定卡片不會改寫過去的充電紀錄；歷史紀錄保留當時的員工編號及姓名快照。管理者權限可透過匯入名單更新。離職歸還卡片應解除綁定後回到未綁定；遺失或損壞卡片應停用舊卡授權。</div>

 <div v-if="importPreview" class="modal-backdrop" @click.self="importPreview=null"><div class="dialog import-preview-dialog"><div class="dialog-head"><h3>員工名單匯入預覽</h3><button class="icon-close" @click="importPreview=null">×</button></div><p class="muted">檔案：{{importFileName}}｜共 {{importPreview.rows.length}} 筆員工資料</p><div class="import-change-summary"><strong>系統比對結果：{{importPreview.changes.length}} 筆異動</strong><div v-for="(c,i) in importPreview.changes" :key="i" class="import-change-row"><b>{{c.type}}</b><span>{{c.name}}<small v-if="c.uid">｜{{c.uid}}</small></span><em>{{c.reason || '未填寫異動說明'}}</em></div><p v-if="!importPreview.changes.length" class="muted">與前次匯入資料相同，沒有異動。</p></div><div class="dialog-actions"><button class="btn btn-light" @click="importPreview=null">取消</button><button class="btn btn-primary" @click="confirmImport">確認匯入</button></div></div></div>
 <div v-if="unbindTarget" class="modal-backdrop" @click.self="unbindTarget=null"><div class="dialog">
  <div class="dialog-head"><h3>解除卡片綁定</h3><button class="icon-close" @click="unbindTarget=null">×</button></div>
  <p>卡片 {{unbindTarget.uid}}｜{{unbindTarget.employee}}（{{unbindTarget.employeeId}}）</p>
  <label>解除綁定原因<select v-model="unbindReason"><option>離職繳回</option><option>人員異動</option><option>更換卡片</option><option>卡片收回</option><option>其他</option></select></label>
  <label v-if="unbindReason==='其他'">其他原因<input v-model="unbindOtherReason" placeholder="請輸入解除綁定原因" /></label>
  <div class="dialog-actions"><button class="btn btn-light" @click="unbindTarget=null">取消</button><button class="btn btn-primary" @click="confirmUnbind">確認解除綁定</button></div>
 </div></div>

 <div v-if="suspendTarget" class="modal-backdrop" @click.self="suspendTarget=null"><div class="dialog">
  <div class="dialog-head"><h3>設定卡片停用期間</h3><button class="icon-close" @click="suspendTarget=null">×</button></div>
  <p>卡片 {{suspendTarget.uid}}｜{{suspendTarget.employee || '未綁定'}}</p>
  <label>停用原因／說明<input v-model="suspendReason" placeholder="請輸入停用原因" /></label>
  <label>停用起始日<input type="date" v-model="suspendStart" /></label>
  <label>停用結束日<input type="date" v-model="suspendEnd" /></label>
  <div class="note-box">暫定規則：累計扣點達 3 點，停用 3 個月。系統預填三個月後日期，可依確認結果調整結束日。</div>
  <div class="dialog-actions"><button class="btn btn-light" @click="suspendTarget=null">取消</button><button class="btn btn-primary" @click="confirmSuspend">確認停用</button></div>
 </div></div>

 <div v-if="showAdd" class="modal-backdrop" @click.self="showAdd=false"><div class="dialog">
  <div class="dialog-head"><h3>新增員工</h3><button class="icon-close" @click="showAdd=false">×</button></div>
  <div class="form-grid"><label>員工編號<input v-model="form.id" placeholder="例如 E009" /></label><label>員工姓名<input v-model="form.name" placeholder="姓名" /></label><label>部門<input v-model="form.dept" placeholder="部門名稱" /></label><label>角色<select v-model="form.role"><option>一般員工</option><option>管理者</option></select></label></div>
  <div class="dialog-actions"><button class="btn btn-light" @click="showAdd=false">取消</button><button class="btn btn-primary" @click="save">儲存員工</button></div>
 </div></div>
</section>
</template>
