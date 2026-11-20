<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { initialEmployees, initialStations, initialLogs, statusLabels } from './data'
import EntryScreen from './views/EntryScreen.vue'
import DashboardView from './views/DashboardView.vue'
import LogsView from './views/LogsView.vue'
import EmployeesView from './views/EmployeesView.vue'
import SettingsView from './views/SettingsView.vue'
import QRMappingView from './views/QRMappingView.vue'
import QrModal from './components/QrModal.vue'
import ExtrasView from './views/ExtrasView.vue'

const employees = ref(initialEmployees.map(x => ({ ...x })))
const stations = ref(initialStations.map(x => ({ ...x })))
const logs = ref(initialLogs.map(x => ({ ...x })))
const mode = ref('')
const currentUser = ref(null)
const activePage = ref('dashboard')
const settingsSubpage = ref('')
const qrStation = ref(null)
const qrPurpose = ref('employee')
const suspendEmployeeId = ref('')
const inactivitySettings = ref({ enabled: true, idleMinutes: 5, warningSeconds: 30 })
const showInactivityWarning = ref(false)
const inactivityCountdown = ref(30)
const inactivityRemaining = ref(300)
let inactivityDeadline = null
let inactivityTimer = null
let warningTimer = null
let countdownTimer = null
let displayCountdownTimer = null

const navItems = [
  { id: 'dashboard', label: '設備總覽／狀態管理', icon: '▦' },
  { id: 'reports', label: '統計報表', icon: '▥' },
  { id: 'logs', label: '使用紀錄 LOG', icon: '≡' },
  { id: 'points', label: '員工積點（暫定功能）', icon: '★' },
  { id: 'employees', label: '員工／卡片管理', icon: '♙' },
  { id: 'settings', label: '系統設定', icon: '⚙' }
]

const pageTitle = computed(() => navItems.find(x => x.id === activePage.value)?.label || '設備總覽')

function clearInactivityTimers() {
  clearTimeout(inactivityTimer)
  clearTimeout(warningTimer)
  clearInterval(countdownTimer)
  inactivityTimer = null
  warningTimer = null
  countdownTimer = null
  clearInterval(displayCountdownTimer)
  displayCountdownTimer = null
}
function formatRemaining(seconds) {
  const safe = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0')
  const secs = Math.floor(safe % 60).toString().padStart(2, '0')
  return `${minutes}:${secs}`
}
function closeInactivityWarning() {
  showInactivityWarning.value = false
  clearInterval(countdownTimer)
  countdownTimer = null
}
function startInactivityCountdown() {
  showInactivityWarning.value = true
  inactivityCountdown.value = Math.max(5, Number(inactivitySettings.value.warningSeconds) || 30)
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    inactivityCountdown.value -= 1
    if (inactivityCountdown.value <= 0) {
      clearInactivityTimers()
      showInactivityWarning.value = false
      logout()
    }
  }, 1000)
}
function resetInactivityTimer() {
  if (!currentUser.value || !inactivitySettings.value.enabled || showInactivityWarning.value) return
  clearTimeout(inactivityTimer)
  clearTimeout(warningTimer)
  const idleSeconds = Math.max(1, Number(inactivitySettings.value.idleMinutes) || 5) * 60
  inactivityRemaining.value = idleSeconds
  inactivityDeadline = Date.now() + idleSeconds * 1000
  clearInterval(displayCountdownTimer)
  displayCountdownTimer = setInterval(() => {
    if (!currentUser.value || showInactivityWarning.value) return
    inactivityRemaining.value = Math.max(0, Math.ceil((inactivityDeadline - Date.now()) / 1000))
  }, 250)
  inactivityTimer = setTimeout(startInactivityCountdown, idleSeconds * 1000)
}
function continueUsing() {
  closeInactivityWarning()
  resetInactivityTimer()
}
function saveInactivitySettings() {
  const clean = {
    enabled: !!inactivitySettings.value.enabled,
    idleMinutes: Math.min(120, Math.max(1, Number(inactivitySettings.value.idleMinutes) || 5)),
    warningSeconds: Math.min(120, Math.max(5, Number(inactivitySettings.value.warningSeconds) || 30))
  }
  inactivitySettings.value = clean
  try { localStorage.setItem('safc-inactivity-settings', JSON.stringify(clean)) } catch {}
  if (currentUser.value) resetInactivityTimer()
}
const activityEvents = ['pointerdown','keydown','touchstart','click']
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('safc-inactivity-settings') || 'null')
    if (saved) inactivitySettings.value = { ...inactivitySettings.value, ...saved }
  } catch {}
  activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer, { passive: true }))
})
onUnmounted(() => {
  clearInactivityTimers()
  activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer))
})
watch(currentUser, user => {
  if (user) resetInactivityTimer()
  else { clearInactivityTimers(); showInactivityWarning.value = false; inactivityRemaining.value = 0 }
})
watch(() => inactivitySettings.value.enabled, enabled => {
  if (!enabled) { clearInactivityTimers(); showInactivityWarning.value = false }
  else if (currentUser.value) resetInactivityTimer()
})

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
function updateStationQr(id, url) { const station = stations.value.find(s => s.id === id); if (station) station.qrUrl = url }
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
function clearSuspendTarget() {
  suspendEmployeeId.value = ''
}
function updateEmployeeCard(id, uid) {
  const employee = employees.value.find(e => e.id === id)
  if (employee) employee.uid = uid
}
function importEmployees(rows) {
  const next = rows.map(row => ({
    id: String(row.id || '').trim(), name: String(row.name || '').trim(), dept: row.dept || '未設定',
    uid: String(row.uid || '').trim(), role: row.role || '一般員工', active: true,
    cardStatus: row.cardStatus || (row.uid ? '使用中' : '未綁定'),
    suspendStart: row.suspendStart || '', suspendEnd: row.suspendEnd || '', importReason: row.reason || ''
  })).filter(e => e.id && e.name)
  const ids = new Set(next.map(e => e.id))
  if (ids.size !== next.length) { alert('匯入失敗：員工編號重複'); return { added:0, updated:0, skipped:rows.length } }
  const uids = next.map(e=>e.uid).filter(Boolean)
  if (new Set(uids).size !== uids.length) { alert('匯入失敗：RFID UID 重複'); return { added:0, updated:0, skipped:rows.length } }
  employees.value = next
  return { added: next.length, updated: 0, skipped: 0 }
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
  downloadCsv('員工卡片匯入範本_請以Excel編輯.csv', [
    ['員工編號','員工姓名','部門','RFID UID','管理者權限','卡片狀態','停用開始日','停用結束日','本次異動說明'],
    ['E009','測試員工','資訊部','A0012353','N','使用中','','','新進員工，首次配發卡片'],
    ['','','','A0012356','N','未綁定','','','離職員工繳回卡片，轉為未綁定']
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
      <div><h1>選擇充電設備</h1><p>僅可選擇目前可使用的充電位置</p></div>
      <div class="account-actions"><span class="account-name">{{ currentUser.name }}（{{ currentUser.id }}）</span><span v-if="inactivitySettings.enabled" class="idle-clock" title="閒置自動登出倒數"><span class="idle-clock-dot"></span>{{ formatRemaining(showInactivityWarning ? inactivityCountdown : inactivityRemaining) }}</span><button class="btn btn-light" @click="logout">登出</button></div>
    </header>
    <div class="helper-banner">僅可選擇「可使用」的充電位置。選擇設備後，系統會顯示對應 QR Code。</div>
    <div class="station-grid employee-grid">
      <article v-for="station in stations" :key="station.id" class="station-card" :class="{ disabled: station.status !== 'available' }">
        <div class="station-top"><strong>{{ station.id }}</strong><span class="status" :class="station.status">{{ statusLabels[station.status] }}</span></div>
        
        <button class="btn" :class="station.status === 'available' ? 'btn-primary' : 'btn-disabled'" :disabled="station.status !== 'available'" @click="openQr(station, 'employee')">
          {{ station.status === 'available' ? '選擇此設備' : '目前無法使用' }}
        </button>
      </article>
    </div>
  </div>
  <div v-else class="admin-layout">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">⚡</div><div><strong>充電管理中控台</strong></div></div>
      <nav class="nav-list">
        <button v-for="item in navItems" :key="item.id" :class="{ active: activePage === item.id }" @click="activePage = item.id">
          <span class="nav-icon">{{ item.icon }}</span>{{ item.label }}
        </button>
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-foot">離線模式・本機資料示意<br>設備狀態為展示用模擬資料</div>
      </div>
    </aside>
    <main class="main-area">
        <header class="topbar">
        <div><h1>{{ pageTitle }}</h1></div>
        <div class="account-actions admin-account-actions"><span class="account-name">{{ currentUser.name }}（管理者）</span><span v-if="inactivitySettings.enabled" class="idle-clock" title="閒置自動登出倒數"><span class="idle-clock-dot"></span>{{ formatRemaining(showInactivityWarning ? inactivityCountdown : inactivityRemaining) }}</span><button class="btn btn-light" @click="logout">登出</button></div>
      </header>
      <div v-if="activePage==='settings' && settingsSubpage==='announcements'" class="subpage-back"><button class="btn btn-outline" @click="settingsSubpage=''">← 返回系統設定</button></div>
      <ExtrasView v-if="['dashboard','reports','points'].includes(activePage) || (activePage==='settings' && settingsSubpage==='announcements')" :page="activePage === 'dashboard' ? 'equipment' : activePage === 'points' ? 'points' : (settingsSubpage==='announcements' ? 'announcements' : 'reports')" :stations="stations" :logs="logs" :operator="currentUser?.name || '管理者'" />
      <LogsView v-else-if="activePage === 'logs'" :logs="logs" @export="exportLogs" />
      <EmployeesView v-else-if="activePage === 'employees'" :employees="employees" :suspend-employee-id="suspendEmployeeId" @add="addEmployee" @toggle-role="toggleEmployeeRole" @toggle-active="toggleEmployeeActive" @bind-card="updateEmployeeCard" @export="exportEmployees" @import="importEmployeeFile" @template="downloadTemplate" @clear-suspend-target="clearSuspendTarget" />
      <div v-else-if="activePage === 'settings' && settingsSubpage === 'qr'"><div class="subpage-back"><button class="btn btn-outline" @click="settingsSubpage = ''">← 返回系統設定</button></div><QRMappingView :stations="stations" @update-qr="updateStationQr" @back="settingsSubpage = ''" /></div>
      <SettingsView v-else-if="activePage === 'settings' && !settingsSubpage" :inactivity-settings="inactivitySettings" @save-inactivity="saveInactivitySettings" @open-qr="settingsSubpage = 'qr'" @open-announcements="settingsSubpage = 'announcements'" />
    </main>
  </div>
  <QrModal v-if="qrStation" :station="qrStation" :purpose="qrPurpose" @close="closeQr" />
  <div v-if="showInactivityWarning" class="inactivity-overlay" role="dialog" aria-modal="true" aria-labelledby="inactivity-title">
    <section class="inactivity-dialog"><div class="inactivity-symbol">⏱</div><h2 id="inactivity-title">即將自動登出</h2><p>系統偵測到一段時間沒有操作，請確認是否繼續使用。</p><div class="inactivity-countdown"><strong>{{ inactivityCountdown }}</strong><span>秒後自動登出</span></div><button class="btn btn-primary inactivity-continue" @click="continueUsing">繼續使用</button></section>
  </div>
</template>
