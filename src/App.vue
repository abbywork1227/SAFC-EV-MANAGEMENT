<script setup>
import { computed, ref } from 'vue'
import { initialEmployees, initialStations, initialLogs, statusLabels } from './data'
import EntryScreen from './views/EntryScreen.vue'
import DashboardView from './views/DashboardView.vue'
import LogsView from './views/LogsView.vue'
import EmployeesView from './views/EmployeesView.vue'
import SettingsView from './views/SettingsView.vue'
import QRMappingView from './views/QRMappingView.vue'
import QrModal from './components/QrModal.vue'

const employees = ref(initialEmployees.map(x => ({ ...x })))
const stations = ref(initialStations.map(x => ({ ...x })))
const logs = ref(initialLogs.map(x => ({ ...x })))
const mode = ref('')
const currentUser = ref(null)
const activePage = ref('dashboard')
const settingsSubpage = ref('')
const qrStation = ref(null)
const qrPurpose = ref('employee')

const navItems = [
  { id: 'dashboard', label: '設備總覽', icon: '▦' },
  { id: 'logs', label: '使用紀錄 LOG', icon: '≡' },
  { id: 'employees', label: '員工／卡片管理', icon: '♙' },
  { id: 'settings', label: '系統設定', icon: '⚙' }
]

const pageTitle = computed(() => navItems.find(x => x.id === activePage.value)?.label || '設備總覽')

function authenticate(uid) {
  const person = employees.value.find(e => e.uid === uid && e.active)
  if (!person) return { ok: false, message: '卡片未授權、尚未綁定或已停用，請確認後再試。' }
  if (mode.value === 'manage' && person.role !== '管理者') {
    return { ok: false, message: '此卡片沒有管理者權限，無法進入管理後台。' }
  }
  currentUser.value = person
  if (mode.value === 'manage') activePage.value = 'dashboard'
  return { ok: true }
}
function toggleEmployeeRole(id) {
  const employee = employees.value.find(e => e.id === id)
  if (!employee) return
  if (employee.role === '管理者' && employees.value.filter(e => e.role === '管理者' && e.active).length <= 1) return alert('系統至少需保留一位啟用中的管理者。')
  employee.role = employee.role === '管理者' ? '一般員工' : '管理者'
}
function toggleEmployeeActive(id) {
  const employee = employees.value.find(e => e.id === id)
  if (!employee) return
  if (employee.active && employee.role === '管理者' && employees.value.filter(e => e.role === '管理者' && e.active).length <= 1) return alert('系統至少需保留一位啟用中的管理者。')
  employee.active = !employee.active
}
function updateStationQr(id, image) { const station = stations.value.find(s => s.id === id); if (station) station.qrImage = image }
function logout() {
  currentUser.value = null
  mode.value = ''
  activePage.value = 'dashboard'
  settingsSubpage.value = ''
  qrStation.value = null
}
function openQr(station, purpose = 'admin') {
  qrStation.value = station
  qrPurpose.value = purpose
  if (purpose === 'employee' && currentUser.value) {
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const time = now.toLocaleTimeString('zh-TW', { hour12: false })
    logs.value.unshift({
      id: Date.now(), date, emp: currentUser.value.id, name: currentUser.value.name,
      dept: currentUser.value.dept, station: station.id, qrTime: time,
      start: '待偵測', end: '待偵測', duration: '待偵測', status: '僅發放 QR', kwh: '待硬體確認'
    })
  }
}
function closeQr() { qrStation.value = null }

function addEmployee(employee) {
  employees.value.push({ ...employee, active: true, role: employee.role || '一般員工' })
}
function toggleEmployee(id) {
  const employee = employees.value.find(e => e.id === id)
  if (employee) employee.active = !employee.active
}
function updateEmployeeCard(id, uid) {
  const employee = employees.value.find(e => e.id === id)
  if (employee) employee.uid = uid
}
function importEmployees(rows) {
  let added = 0, updated = 0, skipped = 0
  rows.forEach(row => {
    const id = String(row.id || '').trim()
    const name = String(row.name || '').trim()
    const uid = String(row.uid || '').trim()
    if (!id || !name) { skipped++; return }
    const existing = employees.value.find(e => e.id === id)
    const duplicateUid = uid && employees.value.some(e => e.uid === uid && e.id !== id)
    if (duplicateUid) { skipped++; return }
    if (existing) {
      existing.name = name
      existing.dept = row.dept || existing.dept
      existing.uid = uid
      existing.active = String(row.active || '啟用') !== '停用'
      updated++
    } else {
      employees.value.push({ id, name, dept: row.dept || '未設定', uid, role: row.role || '一般員工', active: String(row.active || '啟用') !== '停用' })
      added++
    }
  })
  return { added, updated, skipped }
}
function exportLogs(rows) {
  const header = ['日期','員工編號','員工姓名','部門','設備編號','QR Code 顯示時間','電流開始時間','電流結束時間','使用時間','狀態','用電量(kWh)']
  const data = rows.map(l => [l.date,l.emp,l.name,l.dept,l.station,l.qrTime,l.start,l.end,l.duration,l.status,l.kwh])
  downloadCsv('充電使用紀錄.csv', [header, ...data])
}
function exportEmployees() {
  const header = ['員工編號','員工姓名','部門','卡片 UID','角色','狀態']
  const data = employees.value.map(e => [e.id,e.name,e.dept,e.uid,e.role,e.active ? '啟用' : '停用'])
  downloadCsv('員工卡片資料.csv', [header, ...data])
}
function importEmployeeFile(rows) {
  return importEmployees(rows)
}
function downloadTemplate() {
  downloadCsv('員工卡片匯入範本.csv', [
    ['員工編號','員工姓名','部門','卡片 UID','角色','狀態'],
    ['E009','測試員工','資訊部','A0012353','一般員工','啟用']
  ])
}
function downloadCsv(filename, rows) {
  const csv = '\ufeff' + rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <EntryScreen v-if="!currentUser" :employees="employees" @choose="mode = $event" @authenticate="authenticate" @back="mode = ''" />
  <div v-else-if="mode === 'charge'" class="employee-shell">
    <header class="employee-header">
      <div><div class="eyebrow">MERCK GROUP IN TAIWAN · EV CHARGING</div><h1>選擇充電設備</h1><p>您好，{{ currentUser.name }}（{{ currentUser.id }}）</p></div>
      <button class="btn btn-light" @click="logout">登出</button>
    </header>
    <div class="helper-banner">僅可選擇「可使用」的充電位置。選擇設備後，系統會顯示對應 QR Code。</div>
    <div class="station-grid employee-grid">
      <article v-for="station in stations" :key="station.id" class="station-card" :class="{ disabled: station.status !== 'available' }">
        <div class="station-top"><strong>{{ station.id }}</strong><span class="status" :class="station.status">{{ statusLabels[station.status] }}</span></div>
        <div class="muted">{{ station.name }}</div>
        <button class="btn" :class="station.status === 'available' ? 'btn-primary' : 'btn-disabled'" :disabled="station.status !== 'available'" @click="openQr(station, 'employee')">
          {{ station.status === 'available' ? '選擇此設備' : '目前無法使用' }}
        </button>
      </article>
    </div>
  </div>
  <div v-else class="admin-layout">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">⚡</div><div><small>MERCK GROUP IN TAIWAN · EV MANAGEMENT</small><strong>充電管理中控台</strong></div></div>
      <nav class="nav-list">
        <button v-for="item in navItems" :key="item.id" :class="{ active: activePage === item.id }" @click="activePage = item.id">
          <span class="nav-icon">{{ item.icon }}</span>{{ item.label }}
        </button>
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-user">
          <span class="sidebar-user-dot"></span>
          <div class="sidebar-user-info"><strong>{{ currentUser.name }}</strong><small>管理者</small></div>
          <button class="btn sidebar-logout" @click="logout">登出</button>
        </div>
        <div class="sidebar-foot">離線模式・本機資料示意<br>設備狀態為展示用模擬資料</div>
      </div>
    </aside>
    <main class="main-area">
      <header class="topbar">
        <div><div class="eyebrow">EV CHARGING CONTROL</div><h1>{{ pageTitle }}</h1><p>Merck Group in Taiwan｜充電樁使用管理示意</p></div>
      </header>
      <DashboardView v-if="activePage === 'dashboard'" :stations="stations" @show-qr="openQr($event, 'admin')" />
      <LogsView v-else-if="activePage === 'logs'" :logs="logs" @export="exportLogs" />
      <EmployeesView v-else-if="activePage === 'employees'" :employees="employees" @add="addEmployee" @toggle-role="toggleEmployeeRole" @toggle-active="toggleEmployeeActive" @bind-card="updateEmployeeCard" @export="exportEmployees" @import="importEmployeeFile" @template="downloadTemplate" />
      <QRMappingView v-else-if="activePage === 'settings' && settingsSubpage === 'qr'" :stations="stations" @update-qr="updateStationQr" @back="settingsSubpage = ''" />
      <SettingsView v-else-if="activePage === 'settings'" @open-qr="settingsSubpage = 'qr'" />
    </main>
  </div>
  <QrModal v-if="qrStation" :station="qrStation" :purpose="qrPurpose" @close="closeQr" />
</template>
