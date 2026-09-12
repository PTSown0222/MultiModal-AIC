import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Download, FileText, TrendingUp, BarChart2, PieChart as PieChartIcon, Calendar, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const weeklySearches = [
  { day: 'T2', searches: 1240, indexed: 8 },
  { day: 'T3', searches: 1890, indexed: 12 },
  { day: 'T4', searches: 1456, indexed: 7 },
  { day: 'T5', searches: 2102, indexed: 15 },
  { day: 'T6', searches: 1678, indexed: 11 },
  { day: 'T7', searches: 890, indexed: 4 },
  { day: 'CN', searches: 640, indexed: 2 },
];

const objectDistribution = [
  { name: 'Người', value: 42, color: '#2563eb' },
  { name: 'Xe cộ', value: 28, color: '#0ea5e9' },
  { name: 'Đối tượng', value: 15, color: '#10b981' },
  { name: 'Hoạt động', value: 10, color: '#f59e0b' },
  { name: 'Văn bản/OCR', value: 5, color: '#8b5cf6' },
];

const topQueries = [
  { query: 'Người trong khu vực hạn chế', count: 234 },
  { query: 'Nhận dạng xe cộ', count: 187 },
  { query: 'Gói hàng / đối tượng bỏ lại', count: 145 },
  { query: 'Hoạt động thẻ nhân viên', count: 132 },
  { query: 'Sự kiện đi theo', count: 98 },
  { query: 'Theo dõi khách thăm', count: 87 },
];

const responseTimeData = [
  { time: '00:00', avg: 2.4 },
  { time: '04:00', avg: 1.8 },
  { time: '08:00', avg: 3.1 },
  { time: '12:00', avg: 2.9 },
  { time: '16:00', avg: 2.2 },
  { time: '20:00', avg: 1.9 },
  { time: '23:59', avg: 2.1 },
];

const cameraActivity = [
  { camera: 'Lobby', queries: 890, alerts: 12 },
  { camera: 'Parking A', queries: 670, alerts: 8 },
  { camera: 'Server Rm', queries: 540, alerts: 19 },
  { camera: 'Reception', queries: 420, alerts: 5 },
  { camera: 'Elevator', queries: 380, alerts: 3 },
  { camera: 'Main Gate', queries: 310, alerts: 7 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }}>
        <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.color, fontWeight: 500 }}>
            {p.name}: <span style={{ color: '#0f172a' }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#0f172a', marginBottom: 4, letterSpacing: '-0.03em' }}>Phân tích & Báo cáo</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Hiệu suất hệ thống và thông tin sử dụng · 7–13 tháng 7, 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <Calendar size={14} /> Tuần này
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <RefreshCw size={14} /> Làm mới
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: 'white', fontWeight: 600, boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}>
            <Download size={14} /> Xuất PDF
          </button>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Tổng Video Đã lập chỉ mục', value: '12.847', icon: FileText, change: '+234 tuần này', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
          { label: 'Tổng Tìm kiếm', value: '9.896', icon: BarChart2, change: '+18,4% so với tuần trước', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
          { label: 'Thời gian Tìm kiếm TB', value: '2,3s', icon: TrendingUp, change: '-0,4s so với tuần trước', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Camera Đang hoạt động', value: '234', icon: PieChartIcon, change: '+12 đã kết nối', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ ...CARD, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, background: card.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={18} color={card.color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 12, color: card.color, fontWeight: 500 }}>{card.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 20 }}>
        {/* Weekly searches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...CARD, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: '#0f172a', marginBottom: 4 }}>Hoạt động Tìm kiếm Hàng tuần</h3>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Số lượt tìm kiếm và video lập chỉ mục theo ngày</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklySearches} barSize={22} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#10b981', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="searches" fill="#2563eb" name="Tìm kiếm" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="indexed" fill="#10b981" name="Lập chỉ mục" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Object distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ ...CARD, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: '#0f172a', marginBottom: 4 }}>Phân bố Loại Truy vấn</h3>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Phân tích theo danh mục tìm kiếm</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={objectDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {objectDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {objectDistribution.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#64748b', flex: 1 }}>{item.name}</span>
                <div style={{ flex: 1, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', width: 36, textAlign: 'right' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Response time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...CARD, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: '#0f172a', marginBottom: 4 }}>Thời gian Phản hồi Tìm kiếm</h3>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Độ trễ trung bình theo giờ (giây)</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} name="TB (s)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top queries */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ ...CARD, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: '#0f172a', marginBottom: 4 }}>Danh mục Truy vấn Hàng đầu</h3>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Các mẫu tìm kiếm phổ biến nhất</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topQueries.map((q, i) => (
              <div key={q.query}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 20, background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i <= 1 ? 'white' : '#3b82f6', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: '#334155' }}>{q.query}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{q.count}</span>
                </div>
                <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(q.count / topQueries[0].count) * 100}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }} style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #0ea5e9)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
