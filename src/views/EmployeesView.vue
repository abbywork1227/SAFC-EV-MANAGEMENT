<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({ employees: { type: Array, required: true }, suspendEmployeeId: { type: String, default: '' } })
const emit = defineEmits(['add','toggle-role','toggle-active','bind-card','export','clear-suspend-target'])
const search = ref('')
const bindingDateFrom = ref('')
const bindingDateTo = ref('')
const appliedCardKeyword = ref('')
const appliedBindingFrom = ref('')
const appliedBindingTo = ref('')
const pageSize = 10
const cardPage = ref(1)
const bindingHistoryPage = ref(1)
const showAdd = ref(false)
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
 function clearBindingHistoryFilters(){ search.value=''; appliedCardKeyword.value=''; bindingDateFrom.value=''; bindingDateTo.value=''; appliedBindingFrom.value=''; appliedBindingTo.value=''; cardPage.value=1; bindingHistoryPage.value=1 }
 function recordBinding(uid, from, to, reason) {
  bindingHistory.value.unshift({
    id: Date.now() + Math.random(),
    time: new Date().toLocaleString('zh-TW', { hour12: false }),
    uid, from: from || '未綁定', to: to || '未綁定',
    reason, operator: '目前管理者'
  })
}
const authorizedUids = ['A0012345','A0012346','A0012347','A0012348','A0012349','A0012350','A0012351','A0012352','A0012353','A0012354','A0012355']
const allCards = computed(() => authorizedUids.map(uid => { const e=props.employees.find(x=>x.uid===uid); return { uid, employee:e?.name || '—', employeeId:e?.id || '—', employeeRef:e || null, status:cardOverrides.value[uid] || (e ? (e.active ? '使用中' : '停用') : '未綁定') } }))
watch(() => props.suspendEmployeeId, (id) => { if(id){ const card=allCards.value.find(c=>c.employeeId===id); if(card) openSuspend(card); emit('clear-suspend-target') } }, { immediate: true })
const cardRows = computed(() => allCards.value.filter(c => !appliedCardKeyword.value || [c.uid,c.employee,c.employeeId,c.status].some(v=>String(v).toLowerCase().includes(appliedCardKeyword.value.trim().toLowerCase()))))
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
function save(){
  if (!form.value.id || !form.value.name) return alert('請填寫員工編號及姓名')
  if (props.employees.some(e=>e.id===form.value.id)) return alert('員工編號已存在')
  emit('add',{...form.value,uid:''})
  form.value={id:'',name:'',dept:'',role:'一般員工'};showAdd.value=false
}

function exportBindingHistory(){
  const rows=[['異動時間','卡片 UID','原綁定員工','新綁定員工','異動原因','操作人員'],
    ...filteredBindingHistory.value.map(x=>[x.time,x.uid,x.from,x.to,x.reason,x.operator])]
  const escapeCell = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
  const html='\\ufeff<html><head><meta charset="UTF-8"></head><body><table>'+rows.map((r,i)=>'<tr>'+r.map(v=>`<${i===0?'th':'td'}>${escapeCell(v)}</${i===0?'th':'td'}>`).join('')+'</tr>').join('')+'</table></body></html>'
  const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8;'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='卡片綁定異動紀錄.xls';a.click();URL.revokeObjectURL(url)
}

function exportCards(){
  const rows=[['卡片 UID','卡片狀態','綁定員工','員工編號','部門','管理者權限','員工帳號狀態'],...allCards.value.map(c=>[c.uid,c.status,c.employee,c.employeeId,c.employeeRef?.dept||'',c.employeeRef?.role||'',c.employeeRef?.active?'啟用':'停用'])]
  const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\r\n')
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='授權卡片清單.csv';a.click();URL.revokeObjectURL(url)
}
</script>
<template>
<section class="employees-view">
 <div class="export-toolbar">
  <button class="btn btn-outline" @click="exportCards">↓ 匯出卡片清單</button>
  <button class="btn btn-outline" @click="exportBindingHistory">↓ 匯出綁定異動紀錄 Excel</button>
  <button class="btn btn-primary" @click="showAdd=true">＋ 新增員工</button>
 </div>

 <div class="stats-cards">
  <article><small>授權卡片</small><strong>100</strong><span>供應商預載（示意）</span></article>
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
  <div class="filter-field"><label>異動開始日期</label><input type="date" v-model="bindingDateFrom" /></div>
  <div class="filter-field"><label>異動結束日期</label><input type="date" v-model="bindingDateTo" /></div>
  <button class="btn btn-outline" @click="applyBindingHistoryFilters">查詢</button>
  <button class="btn btn-light" @click="clearBindingHistoryFilters">清除條件</button>
 </div>

 <!-- 主清單與異動紀錄共用同一個外框，內部採垂直排列 -->
 <div class="management-combined-section employee-card-management-panel">
  <section class="management-list-block">
   <div class="section-heading">
    <div><h2>授權卡片清單</h2><p>查看授權卡片、綁定員工及卡片管理狀態。</p></div>
   </div>
   <div class="table-wrap">
    <table>
     <thead><tr><th>授權卡片 UID</th><th>卡片狀態</th><th>綁定員工</th><th>員工編號／部門</th><th>管理者權限</th><th>員工帳號</th><th>卡片操作</th></tr></thead>
     <tbody>
      <tr v-for="card in pagedCardRows" :key="card.uid">
       <td><code>{{card.uid}}</code></td>
       <td><span class="status" :class="card.status==='使用中'?'available':card.status==='未綁定'?'neutral':'fault'">{{card.status}}</span></td>
       <td v-if="card.employeeRef"><strong>{{card.employeeRef.name}}</strong></td>
       <td v-else>
        <select v-model="selectedEmployees[card.uid]" :disabled="card.status!=='未綁定'">
         <option value="">選擇員工綁定</option>
         <option v-for="e in props.employees.filter(e=>!e.uid && e.active)" :key="e.id" :value="e.id">{{e.name}}（{{e.id}}）</option>
        </select>
        <button v-if="selectedEmployees[card.uid]" class="btn btn-small btn-primary" @click="saveBinding(card)">確認綁定</button>
       </td>
       <td>{{card.employeeRef ? `${card.employeeId}｜${card.employeeRef.dept}` : '—'}}</td>
       <td>
        <label v-if="card.employeeRef" class="switch-control"><input type="checkbox" :checked="card.employeeRef.role==='管理者'" @change="emit('toggle-role',card.employeeId)"/><span class="switch-slider"></span></label>
        <span v-else>—</span>
       </td>
       <td>
        <label v-if="card.employeeRef" class="switch-control"><input type="checkbox" :checked="card.employeeRef.active" @change="emit('toggle-active',card.employeeId)"/><span class="switch-slider"></span></label>
        <span v-else>—</span>
       </td>
       <td class="card-actions">
        <button v-if="card.status==='使用中'" class="btn btn-small btn-outline" @click="unbind(card)">解除綁定</button>
        <button v-if="card.status==='使用中'" class="btn btn-small btn-outline" @click="setCardStatus(card,'遺失')">掛失</button>
        <button v-if="card.status==='使用中'" class="btn btn-small btn-outline" @click="setCardStatus(card,'損壞')">標記損壞</button>
        <button v-if="['未綁定','使用中'].includes(card.status)" class="btn btn-small btn-outline" @click="openSuspend(card)">停用</button>
        <button v-if="card.status==='遺失'" class="btn btn-small btn-outline" @click="setCardStatus(card,'未綁定')">尋回後解除綁定</button>
        <button v-if="card.status==='損壞'" class="btn btn-small btn-outline" @click="setCardStatus(card,'未綁定')">恢復未綁定</button>
        <button v-if="card.status==='停用'" class="btn btn-small btn-outline" @click="restoreCard(card)">恢復授權</button>
       </td>
      </tr>
      <tr v-if="!cardRows.length"><td colspan="7" class="empty-cell">沒有符合條件的卡片</td></tr>
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

 <div class="note-box">卡片 UID 清單由供應商提供並預先載入讀卡控制器；管理者只需從未綁定卡片中選擇員工。重新綁定卡片不會改寫過去的充電紀錄；歷史紀錄保留當時的員工編號及姓名快照。管理者權限與員工帳號啟用狀態可直接在同一頁調整。離職歸還卡片應解除綁定後回到未綁定；遺失或損壞卡片應停用舊卡授權。</div>

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
