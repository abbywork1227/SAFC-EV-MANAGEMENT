export const initialEmployees = [
  { id: 'E001', name: '王小明', dept: '管理部', uid: 'A0012345', role: '管理者', active: true },
  { id: 'E002', name: '陳小華', dept: '業務部', uid: 'A0012346', role: '一般員工', active: true },
  { id: 'E003', name: '林大偉', dept: '工程部', uid: 'A0012347', role: '一般員工', active: true },
  { id: 'E004', name: '張雅婷', dept: '財務部', uid: 'A0012348', role: '一般員工', active: true },
  { id: 'E005', name: '黃志偉', dept: '資訊部', uid: 'A0012349', role: '一般員工', active: true },
  { id: 'E006', name: '吳佩珊', dept: '人資部', uid: '', role: '一般員工', active: true },
  { id: 'E007', name: '周建宏', dept: '製造部', uid: 'A0012351', role: '一般員工', active: false },
  { id: 'E008', name: '李佳蓉', dept: '採購部', uid: 'A0012352', role: '一般員工', active: true },
  { id: 'E009', name: '蔡承翰', dept: '總務部', uid: 'A0012353', role: '一般員工', active: true },
  { id: 'E010', name: '許庭瑜', dept: '品保部', uid: 'A0012354', role: '一般員工', active: true },
  { id: 'E011', name: '郭柏廷', dept: '研發部', uid: 'A0012355', role: '一般員工', active: true },
  { id: 'E012', name: '陳怡君', dept: '行政部', uid: '', role: '一般員工', active: true }
]

export const initialStations = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `A${String(i + 1).padStart(2, '0')}`,
    name: '',
    kind: '一般充電樁',
    status: [1, 4, 6].includes(i) ? 'charging' : i === 7 ? 'fault' : 'available',
    amps: i === 1 ? 16 : i === 4 ? 12 : i === 6 ? 18 : 0,
    qrCode: `SEFUS-${String(i + 1).padStart(3, '0')}`, qrUrl: ''
  })),
  { id: 'F01-1', name: '', kind: '快充設備', status: 'charging', amps: 42, qrCode: 'SEFUS-F01-1', qrUrl: '' },
  { id: 'F01-2', name: '', kind: '快充設備', status: 'available', amps: 0, qrCode: 'SEFUS-F01-2', qrUrl: '' }
]

export const initialLogs = [
  { id: 1, date: '2026-11-18', emp: 'E002', name: '陳小華', dept: '業務部', station: 'A01', qrTime: '07:42:15', start: '08:00:03', end: '09:05:20', duration: '1 小時 5 分', status: '已完成', kwh: '待硬體確認' },
  { id: 2, date: '2026-11-18', emp: 'E003', name: '林大偉', dept: '工程部', station: 'A02', qrTime: '08:03:15', start: '08:12:03', end: '09:30:20', duration: '1 小時 18 分', status: '已完成', kwh: '待硬體確認' },
  { id: 3, date: '2026-11-18', emp: 'E004', name: '張雅婷', dept: '財務部', station: 'A03', qrTime: '08:25:15', start: '08:31:03', end: '10:02:20', duration: '1 小時 31 分', status: '已完成', kwh: '待硬體確認' },
  { id: 4, date: '2026-11-18', emp: 'E009', name: '蔡承翰', dept: '總務部', station: 'A04', qrTime: '09:10:15', start: '09:18:03', end: '10:11:20', duration: '53 分鐘', status: '已完成', kwh: '待硬體確認' },
  { id: 5, date: '2026-11-17', emp: 'E005', name: '黃志偉', dept: '資訊部', station: 'A05', qrTime: '10:02:15', start: '10:10:03', end: '11:26:20', duration: '1 小時 16 分', status: '已完成', kwh: '待硬體確認' },
  { id: 6, date: '2026-11-17', emp: 'E008', name: '李佳蓉', dept: '採購部', station: 'A06', qrTime: '11:15:15', start: '11:23:03', end: '12:01:20', duration: '38 分鐘', status: '已完成', kwh: '待硬體確認' },
  { id: 7, date: '2026-11-17', emp: 'E010', name: '許庭瑜', dept: '品保部', station: 'A07', qrTime: '13:04:15', start: '13:12:03', end: '14:28:20', duration: '1 小時 16 分', status: '已完成', kwh: '待硬體確認' },
  { id: 8, date: '2026-11-17', emp: 'E011', name: '郭柏廷', dept: '研發部', station: 'A08', qrTime: '14:20:15', start: '14:28:03', end: '15:41:20', duration: '1 小時 13 分', status: '已完成', kwh: '待硬體確認' },
  { id: 9, date: '2026-11-16', emp: 'E002', name: '陳小華', dept: '業務部', station: 'F01-1', qrTime: '07:50:15', start: '08:00:03', end: '09:16:20', duration: '1 小時 16 分', status: '已完成', kwh: '待硬體確認' },
  { id: 10, date: '2026-11-16', emp: 'E003', name: '林大偉', dept: '工程部', station: 'F01-2', qrTime: '08:35:15', start: '08:44:03', end: '10:05:20', duration: '1 小時 21 分', status: '已完成', kwh: '待硬體確認' },
  { id: 11, date: '2026-11-15', emp: 'E004', name: '張雅婷', dept: '財務部', station: 'A01', qrTime: '09:22:15', start: '09:30:03', end: '10:40:20', duration: '1 小時 10 分', status: '已完成', kwh: '待硬體確認' },
  { id: 12, date: '2026-11-15', emp: 'E009', name: '蔡承翰', dept: '總務部', station: 'A02', qrTime: '10:48:15', start: '10:55:03', end: '12:04:20', duration: '1 小時 9 分', status: '已完成', kwh: '待硬體確認' },
  { id: 13, date: '2026-11-14', emp: 'E005', name: '黃志偉', dept: '資訊部', station: 'A03', qrTime: '12:15:15', start: '12:22:03', end: '13:18:20', duration: '56 分鐘', status: '已完成', kwh: '待硬體確認' },
  { id: 14, date: '2026-11-14', emp: 'E008', name: '李佳蓉', dept: '採購部', station: 'A04', qrTime: '13:30:15', start: '13:38:03', end: '14:50:20', duration: '1 小時 12 分', status: '已完成', kwh: '待硬體確認' },
  { id: 15, date: '2026-11-13', emp: 'E010', name: '許庭瑜', dept: '品保部', station: 'A05', qrTime: '14:02:15', start: '14:10:03', end: '15:25:20', duration: '1 小時 15 分', status: '已完成', kwh: '待硬體確認' },
  { id: 16, date: '2026-11-13', emp: 'E011', name: '郭柏廷', dept: '研發部', station: 'A06', qrTime: '15:10:15', start: '15:18:03', end: '16:29:20', duration: '1 小時 11 分', status: '已完成', kwh: '待硬體確認' },
  { id: 17, date: '2026-11-12', emp: 'E002', name: '陳小華', dept: '業務部', station: 'A07', qrTime: '16:05:15', start: '16:13:03', end: '17:20:20', duration: '1 小時 7 分', status: '已完成', kwh: '待硬體確認' },
  { id: 18, date: '2026-11-12', emp: 'E003', name: '林大偉', dept: '工程部', station: 'A08', qrTime: '17:12:15', start: '17:20:03', end: '18:35:20', duration: '1 小時 15 分', status: '已完成', kwh: '待硬體確認' },
  { id: 19, date: '2026-11-11', emp: 'E004', name: '張雅婷', dept: '財務部', station: 'F01-1', qrTime: '07:25:15', start: '07:34:03', end: '08:45:20', duration: '1 小時 11 分', status: '已完成', kwh: '待硬體確認' },
  { id: 20, date: '2026-11-11', emp: 'E009', name: '蔡承翰', dept: '總務部', station: 'F01-2', qrTime: '08:50:15', start: '08:58:03', end: '10:10:20', duration: '1 小時 12 分', status: '已完成', kwh: '待硬體確認' },
  { id: 21, date: '2026-11-10', emp: 'E005', name: '黃志偉', dept: '資訊部', station: 'A01', qrTime: '09:40:15', start: '09:48:03', end: '10:52:20', duration: '1 小時 4 分', status: '已完成', kwh: '待硬體確認' },
  { id: 22, date: '2026-11-10', emp: 'E008', name: '李佳蓉', dept: '採購部', station: 'A02', qrTime: '11:05:15', start: '11:13:03', end: '12:21:20', duration: '1 小時 8 分', status: '已完成', kwh: '待硬體確認' },
  { id: 23, date: '2026-11-09', emp: 'E010', name: '許庭瑜', dept: '品保部', station: 'A03', qrTime: '12:32:15', start: '12:40:03', end: '13:55:20', duration: '1 小時 15 分', status: '已完成', kwh: '待硬體確認' },
  { id: 24, date: '2026-11-09', emp: 'E011', name: '郭柏廷', dept: '研發部', station: 'A04', qrTime: '13:45:15', start: '13:53:03', end: '15:02:20', duration: '1 小時 9 分', status: '已完成', kwh: '待硬體確認' },
  { id: 25, date: '2026-11-08', emp: 'E002', name: '陳小華', dept: '業務部', station: 'A05', qrTime: '15:30:15', start: '15:38:03', end: '16:46:20', duration: '1 小時 8 分', status: '已完成', kwh: '待硬體確認' },
  { id: 26, date: '2026-11-07', emp: 'E003', name: '林大偉', dept: '工程部', station: 'A06', qrTime: '16:40:15', start: '16:48:03', end: '18:00:20', duration: '1 小時 12 分', status: '已完成', kwh: '待硬體確認' },
  { id: 27, date: '2026-11-06', emp: 'E004', name: '張雅婷', dept: '財務部', station: 'A07', qrTime: '07:55:15', start: '08:03:03', end: '09:11:20', duration: '1 小時 8 分', status: '已完成', kwh: '待硬體確認' },
  { id: 28, date: '2026-11-05', emp: 'E009', name: '蔡承翰', dept: '總務部', station: 'A08', qrTime: '08:15:15', start: '08:23:03', end: '09:35:20', duration: '1 小時 12 分', status: '已完成', kwh: '待硬體確認' },
  { id: 29, date: '2026-11-04', emp: 'E005', name: '黃志偉', dept: '資訊部', station: 'F01-1', qrTime: '10:25:15', start: '10:33:03', end: '11:52:20', duration: '1 小時 19 分', status: '已完成', kwh: '待硬體確認' },
  { id: 30, date: '2026-11-03', emp: 'E008', name: '李佳蓉', dept: '採購部', station: 'F01-2', qrTime: '14:45:15', start: '14:53:03', end: '16:04:20', duration: '1 小時 11 分', status: '已完成', kwh: '待硬體確認' }
]

export const statusLabels = {
  available: '可使用',
  charging: '使用中',
  fault: '故障',
  offline: '離線'
}
