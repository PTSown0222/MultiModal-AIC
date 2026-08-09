import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Video, Camera, Search, Clock, ArrowUpRight, Play, Eye, Upload,
  Sparkles, FileText, TrendingUp, Activity, MoreHorizontal, CheckCircle, AlertCircle
} from 'lucide-react';

const CARD = {
  background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
  padding: 24,
};

const statCards = [
  { label: 'Video Đã Lập chỉ mục', value: '12.847', change: '+3,2%', icon: Video, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', trend: 'up' },
  { label: 'Camera Kết nối', value: '234', change: '+12 mới', icon: Camera, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', trend: 'up' },
  { label: 'Tìm kiếm Hôm nay', value: '1.456', change: '+18,7%', icon: Search, color: '#10b981', bg: 'rgba(16,185,129,0.08)', trend: 'up' },
  { label: 'Thời gian Phản hồi TB', value: '2,3s', change: '-0,4s nhanh hơn', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', trend: 'down' },
];

const recentVideos = [
  { id: 1, name: 'Lobby_Cam_2024-07-13.mp4', duration: '02:14', camera: 'Sảnh Chính', time: '10:32 SA', status: 'indexed' },
  { id: 2, name: 'Parking_Lot_B_0713.mp4', duration: '01:47', camera: 'Bãi đỗ xe B', time: '09:15 SA', status: 'indexed' },
  { id: 3, name: 'Server_Room_Access.mp4', duration: '03:00', camera: 'Phòng máy chủ', time: '08:44 SA', status: 'processing' },
  { id: 4, name: 'Reception_Area_0713.mp4', duration: '00:58', camera: 'Khu vực lễ tân', time: '08:12 SA', status: 'indexed' },
];

const recentInvestigations = [
  { id: 'INV-8821', query: 'Người mặc áo khoác đỏ gần thang máy', time: '11:24 SA', results: 8, status: 'completed' },
  { id: 'INV-8820', query: 'Xe tải giao hàng màu trắng bãi đỗ xe B', time: '10:58 SA', results: 3, status: 'completed' },
  { id: 'INV-8819', query: 'Nhân viên cầm laptop trong phòng máy chủ', time: '09:41 SA', results: 12, status: 'completed' },
  { id: 'INV-8818', query: 'Người lạ tại lễ tân sau 20:00', time: 'Hôm qua', results: 2, status: 'reviewing' },
  { id: 'INV-8817', query: 'Xe sedan xanh trong khu vực cấm', time: 'Hôm qua', results: 0, status: 'no_results' },
];

const gradients = [
  'linear-gradient(135deg, #0d2d5e, #0e4f7a)',
  'linear-gradient(135deg, #0a3060, #0c6ea3)',
  'linear-gradient(135deg, #0b2545, #0e6688)',
  'linear-gradient(135deg, #0d2b45, #0b5876)',
];

function VideoThumbnail({ index, status }: { index: number; status: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: gradients[index % gradients.length], borderRadius: 10, overflow: 'hidden', cursor: 'pointer', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <Play size={16} color="white" fill="white" style={{ marginLeft: 2 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 8, right: 8, background: status === 'indexed' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: 'white', fontWeight: 600 }}>
        {status === 'indexed' ? '✓ Đã lập chỉ mục' : '⟳ Đang xử lý'}
      </div>
      <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '1px 6px', fontSize: 11, color: 'white' }}>
        {recentVideos[index % recentVideos.length].duration}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: '#0f172a', marginBottom: 4, letterSpacing: '-0.03em' }}>Tổng quan Hệ thống</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Thứ Hai, 13 tháng 7, 2026 · 11:34 SA</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 13, color: '#059669', fontWeight: 500 }}>Tất cả hệ thống hoạt động bình thường</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
            style={{ ...CARD, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, background: card.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={20} color={card.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: card.trend === 'up' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '3px 8px' }}>
                <TrendingUp size={11} color={card.trend === 'up' ? '#10b981' : '#ef4444'} />
                <span style={{ fontSize: 12, color: card.trend === 'up' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{card.change}</span>
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
        {/* Recent Videos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ color: '#0f172a', marginBottom: 2 }}>Video Tải lên Gần đây</h3>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Các video mới nhất được lập chỉ mục vào hệ thống</p>
            </div>
            <button onClick={() => navigate('/library')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Xem tất cả <ArrowUpRight size={13} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
            {recentVideos.map((video, i) => (
              <div key={video.id} style={{ cursor: 'pointer', minWidth: 0 }} onClick={() => navigate('/library')}>
                <VideoThumbnail index={i} status={video.status} />
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.camera} · {video.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={CARD}>
          <h3 style={{ color: '#0f172a', marginBottom: 4 }}>Thao tác nhanh</h3>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Các tác vụ thường dùng và phím tắt</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: Upload, label: 'Tải lên Video', desc: 'Thêm cảnh quay mới vào hệ thống', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', action: () => navigate('/upload') },
              { icon: Sparkles, label: 'Bắt đầu Tìm kiếm AI', desc: 'Truy vấn video ngữ nghĩa', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', action: () => navigate('/search') },
              { icon: FileText, label: 'Mở Báo cáo', desc: 'Phân tích và thông tin chi tiết', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', action: () => navigate('/reports') },
            ].map(({ icon: Icon, label, desc, color, bg, action }) => (
              <motion.button
                key={label}
                whileHover={{ x: 4 }}
                onClick={action}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: bg, border: `1px solid ${color}18`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <div style={{ width: 40, height: 40, background: color + '15', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{desc}</div>
                </div>
                <ArrowUpRight size={14} color={color} style={{ marginLeft: 'auto' }} />
              </motion.button>
            ))}
          </div>

          {/* Activity stats */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#f8fafc', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Activity size={14} color="#64748b" />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Hoạt động Hôm nay</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[{ label: 'Tải lên', val: '8' }, { label: 'Tìm kiếm', val: '1,4K' }, { label: 'Cảnh báo', val: '3' }].map(({ label, val }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Investigations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ color: '#0f172a', marginBottom: 2 }}>Điều tra Gần đây</h3>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Các truy vấn tìm kiếm ngữ nghĩa và kết quả mới nhất</p>
          </div>
          <button onClick={() => navigate('/history')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            Xem tất cả <ArrowUpRight size={13} />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['ID', 'Truy vấn', 'Thời gian', 'Kết quả', 'Trạng thái', ''].map(h => (
                <th key={h} style={{ padding: '0 12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentInvestigations.map((inv, i) => (
              <motion.tr
                key={inv.id}
                whileHover={{ background: '#f8fafc' }}
                style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                onClick={() => navigate('/history')}
              >
                <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>{inv.id}</td>
                <td style={{ padding: '14px 12px', fontSize: 13, color: '#334155', maxWidth: 340 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.query}</div>
                </td>
                <td style={{ padding: '14px 12px', fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>{inv.time}</td>
                <td style={{ padding: '14px 12px', fontSize: 13, color: '#334155', fontWeight: 500 }}>
                  {inv.results > 0 ? `${inv.results} kết quả` : <span style={{ color: '#94a3b8' }}>Không có kết quả</span>}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: inv.status === 'completed' ? 'rgba(16,185,129,0.08)' : inv.status === 'reviewing' ? 'rgba(245,158,11,0.08)' : 'rgba(148,163,184,0.1)',
                    color: inv.status === 'completed' ? '#10b981' : inv.status === 'reviewing' ? '#f59e0b' : '#94a3b8',
                  }}>
                    {inv.status === 'completed' ? '✓ Hoàn thành' : inv.status === 'reviewing' ? '⏳ Đang xem xét' : '— Không có KQ'}
                  </span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
