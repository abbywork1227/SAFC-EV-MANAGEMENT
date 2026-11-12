export const initialEmployees = [
  { id: 'E001', name: '王小明', dept: '管理部', uid: 'A0012345', role: '管理者', active: true },
  { id: 'E002', name: '陳小華', dept: '業務部', uid: 'A0012346', role: '一般員工', active: true },
  { id: 'E003', name: '林大偉', dept: '工程部', uid: 'A0012347', role: '一般員工', active: true },
  { id: 'E004', name: '張雅婷', dept: '財務部', uid: 'A0012348', role: '一般員工', active: true },
  { id: 'E005', name: '黃志偉', dept: '資訊部', uid: 'A0012349', role: '一般員工', active: true },
  { id: 'E006', name: '吳佩珊', dept: '人資部', uid: '', role: '一般員工', active: true },
  { id: 'E007', name: '周建宏', dept: '製造部', uid: 'A0012351', role: '一般員工', active: false },
  { id: 'E008', name: '李佳蓉', dept: '採購部', uid: 'A0012352', role: '一般員工', active: true }
]

export const initialStations = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `A${String(i + 1).padStart(2, '0')}`,
    name: `一般充電樁 ${i + 1}`,
    kind: '一般充電樁',
    status: [1, 4, 6].includes(i) ? 'charging' : i === 7 ? 'fault' : 'available',
    amps: i === 1 ? 16 : i === 4 ? 12 : i === 6 ? 18 : 0,
    qrCode: `SEFUS-${String(i + 1).padStart(3, '0')}`
  })),
  { id: 'F01-1', name: '快充站 1 號槍', kind: '快充設備', status: 'charging', amps: 42, qrCode: 'SEFUS-F01-1' },
  { id: 'F01-2', name: '快充站 2 號槍', kind: '快充設備', status: 'available', amps: 0, qrCode: 'SEFUS-F01-2' }
]

export const initialLogs = [
  { id: 1, date: '2026-11-12', emp: 'E002', name: '陳小華', dept: '業務部', station: 'A02', qrTime: '08:20:15', start: '08:27:03', end: '09:45:20', duration: '1 小時 18 分', status: '已完成', kwh: '待硬體確認' },
  { id: 2, date: '2026-11-12', emp: 'E003', name: '林大偉', dept: '工程部', station: 'F01-1', qrTime: '08:42:10', start: '08:49:31', end: '使用中', duration: '進行中', status: '充電中', kwh: '待硬體確認' },
  { id: 3, date: '2026-11-11', emp: 'E004', name: '張雅婷', dept: '財務部', station: 'A05', qrTime: '13:05:42', start: '13:12:08', end: '14:02:44', duration: '50 分鐘', status: '已完成', kwh: '待硬體確認' },
  { id: 4, date: '2026-11-11', emp: 'E005', name: '黃志偉', dept: '資訊部', station: 'A07', qrTime: '15:18:22', start: '未偵測', end: '未偵測', duration: '未開始', status: '僅發放 QR', kwh: '—' },
  { id: 5, date: '2026-11-10', emp: 'E008', name: '李佳蓉', dept: '採購部', station: 'F01-2', qrTime: '09:10:05', start: '09:17:11', end: '10:31:09', duration: '1 小時 14 分', status: '已完成', kwh: '待硬體確認' },
  { id: 6, date: '2026-11-09', emp: 'E002', name: '陳小華', dept: '業務部', station: 'A01', qrTime: '16:21:30', start: '16:29:02', end: '17:10:40', duration: '41 分鐘', status: '已完成', kwh: '待硬體確認' }
]

export const statusLabels = {
  available: '可使用',
  charging: '使用中',
  fault: '故障',
  offline: '離線'
}
