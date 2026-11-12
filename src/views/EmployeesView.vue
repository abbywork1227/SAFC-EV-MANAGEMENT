<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ employees: { type: Array, required: true } })
const emit = defineEmits(['add','toggle','toggle-role','toggle-active','bind-card','export','import','template'])
const search = ref('')
const statusFilter = ref('全部')
const showAdd = ref(false)
const showBind = ref(null)
const form = ref({ id:'', name:'', dept:'', uid:'', role:'一般員工' })
const bindUid = ref('')
const filtered = computed(() => props.employees.filter(e => {
  const k = search.value.trim().toLowerCase()
  const match = !k || [e.id,e.name,e.dept,e.uid].some(v => String(v || '').toLowerCase().includes(k))
  const state = statusFilter.value === '全部' || (statusFilter.value === '啟用' ? e.active : !e.active)
  return match && state
}))
function save() {
  if (!form.value.id || !form.value.name) return alert('請填寫員工編號及姓名')
  if (props.employees.some(e => e.id === form.value.id)) return alert('員工編號已存在')
  if (form.value.uid && props.employees.some(e => e.uid === form.value.uid)) return alert('卡片 UID 已綁定其他員工')
  emit('add', { ...form.value })
  form.value = { id:'', name:'', dept:'', uid:'', role:'一般員工' }
  showAdd.value = false
}
function bind(employee) {
  if (bindUid.value && props.employees.some(e => e.uid === bindUid.value && e.id !== employee.id)) return alert('此卡片 UID 已綁定其他員工')
  emit('bind-card', employee.id, bindUid.value.trim())
  bindUid.value = ''
  showBind.value = null
}
function parseCsvLine(line) {
  const result = []; let value = '', quoted = false
  for (let i=0; i<line.length; i++) {
    const c = line[i]
    if (c === '"' && line[i+1] === '"' && quoted) { value += '"'; i++ }
    else if (c === '"') quoted = !quoted
    else if (c === ',' && !quoted) { result.push(value); value = '' }
    else value += c
  }
  result.push(value); return result
}
function handleImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const lines = String(reader.result).replace(/^\\uFEFF/, '').trim().split(/\\r?\\n/)
    if (lines.length < 2) { alert('CSV 沒有可匯入的資料列'); return }
    const headers = parseCsvLine(lines[0]).map(x => x.trim())
    const map = {'員工編號':'id','員工姓名':'name','部門':'dept','卡片 UID':'uid','角色':'role','狀態':'active'}
    const rows = lines.slice(1).filter(Boolean).map(line => {
      const values = parseCsvLine(line), row = {}
      headers.forEach((h,i) => { if (map[h]) row[map[h]] = values[i] || '' })
      return row
    })
    emit('import', rows)
    alert(`已讀取 ${rows.length} 筆資料，請確認員工清單。`)
  }
  reader.readAsText(file, 'UTF-8')
  event.target.value = ''
}
</script>
<template>
  <section>
    <div class="section-heading"><div><h2>員工／卡片管理</h2><p>管理員工基本資料、RFID 卡片綁定、管理者權限及帳號啟用狀態</p></div><div class="inline-actions"><button class="btn btn-outline" @click="emit('template')">↓ 下載匯入範本</button><label class="btn btn-outline upload-button">↑ 匯入員工 CSV<input type="file" accept=".csv,text/csv" hidden @change="handleImportFile" /></label><button class="btn btn-outline" @click="emit('export')">匯出員工資料</button><button class="btn btn-primary" @click="showAdd = true">＋ 新增員工</button></div></div>
    <div class="filter-panel employee-filter">
      <div class="filter-field search-field"><label>搜尋員工</label><input v-model="search" placeholder="員工編號、姓名、部門或卡片 UID" /></div>
      <div class="filter-field"><label>員工狀態</label><select v-model="statusFilter"><option>全部</option><option>啟用</option><option>停用</option></select></div>
      <div class="table-summary employee-count">共 {{ filtered.length }} 位員工</div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>員工編號</th><th>姓名</th><th>部門</th><th>卡片 UID</th><th>管理者</th><th>啟用</th><th>卡片操作</th></tr></thead>
        <tbody>
          <tr v-for="employee in filtered" :key="employee.id">
            <td>{{ employee.id }}</td><td><strong>{{ employee.name }}</strong></td><td>{{ employee.dept }}</td><td><code>{{ employee.uid || '尚未綁定' }}</code></td><td><label class="switch-control" :aria-label="employee.role === '管理者' ? '管理者權限開啟' : '管理者權限關閉'"><input type="checkbox" :checked="employee.role === '管理者'" @change="emit('toggle-role', employee.id)" /><span class="switch-slider"></span></label></td>
            <td><label class="switch-control" :aria-label="employee.active ? '帳號啟用' : '帳號停用'"><input type="checkbox" :checked="employee.active" @change="emit('toggle-active', employee.id)" /><span class="switch-slider"></span></label></td>
            <td><button class="btn btn-small btn-outline" @click="showBind = employee; bindUid = employee.uid">{{ employee.uid ? '重新綁定' : '綁定卡片' }}</button></td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="7" class="empty-cell">沒有符合條件的員工資料</td></tr>
        </tbody>
      </table>
    </div>
    <div class="note-box">範例資料包含管理者、一般員工、尚未綁卡及已停用員工。卡片 UID 可由讀卡機或供應商提供的卡號清單事先取得，再手動輸入或 CSV 匯入；不要求管理者在中控台逐張刷卡。若現場沒有 UID 資料，才需要使用相容的 RFID 讀卡機讀取實體卡片。</div>

    <div v-if="showAdd" class="modal-backdrop" @click.self="showAdd = false"><div class="dialog">
      <div class="dialog-head"><h3>新增員工</h3><button class="icon-close" @click="showAdd = false">×</button></div>
      <div class="form-grid"><label>員工編號<input v-model="form.id" placeholder="例如 E009" /></label><label>員工姓名<input v-model="form.name" placeholder="姓名" /></label><label>部門<input v-model="form.dept" placeholder="部門名稱" /></label><label>卡片 UID（可預先輸入，不必現場刷卡）<input v-model="form.uid" placeholder="例如 A0012353" /></label><label>角色<select v-model="form.role"><option>一般員工</option><option>管理者</option></select></label></div>
      <div class="dialog-actions"><button class="btn btn-light" @click="showAdd = false">取消</button><button class="btn btn-primary" @click="save">儲存員工</button></div>
    </div></div>
    <div v-if="showBind" class="modal-backdrop" @click.self="showBind = null"><div class="dialog">
      <div class="dialog-head"><h3>綁定 RFID 卡片</h3><button class="icon-close" @click="showBind = null">×</button></div>
      <p class="muted">員工：{{ showBind.name }}（{{ showBind.id }}）</p>
      <label class="form-label">卡片 UID<input v-model="bindUid" placeholder="輸入已取得的卡片 UID；也可先由讀卡機讀取後再填入" /></label>
      <div class="dialog-actions"><button class="btn btn-light" @click="showBind = null">取消</button><button class="btn btn-primary" @click="bind(showBind)">儲存綁定</button></div>
    </div></div>
  </section>
</template>
