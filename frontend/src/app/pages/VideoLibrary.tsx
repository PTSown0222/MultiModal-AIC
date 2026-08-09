import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, Filter, Upload, Play, MoreHorizontal, Grid3X3, List, SlidersHorizontal, CheckCircle } from 'lucide-react';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const videos = [
  { id: 1, name: 'Lobby_Entrance_0713_AM.mp4', camera: 'Sảnh Chính', duration: '02:14', date: '13 tháng 7, 2026 10:32 SA', resolution: '1920×1080', size: '142 MB', objects: ['Người', 'Cửa', 'Thẻ'], status: 'indexed', grad: 'linear-gradient(135deg, #1e3a5f, #2d5a6b)' },
  { id: 2, name: 'Parking_Lot_B_0713.mp4', camera: 'Bãi đỗ xe B', duration: '01:47', date: '13 tháng 7, 2026 09:15 SA', resolution: '1280×720', size: '98 MB', objects: ['Xe ô tô', 'Người', 'Xe tải'], status: 'indexed', grad: 'linear-gradient(135deg, #0a3060, #0c6ea3)' },
  { id: 3, name: 'Server_Room_Access_0713.mp4', camera: 'Phòng máy chủ', duration: '03:00', date: '13 tháng 7, 2026 08:44 SA', resolution: '1920×1080', size: '190 MB', objects: ['Người', 'Laptop', 'Máy chủ'], status: 'processing', grad: 'linear-gradient(135deg, #0b2545, #0e6688)' },
  { id: 4, name: 'Reception_Area_0713.mp4', camera: 'Khu vực lễ tân', duration: '00:58', date: '13 tháng 7, 2026 08:12 SA', resolution: '1280×720', size: '61 MB', objects: ['Người', 'Bàn làm việc', 'Ghế'], status: 'indexed', grad: 'linear-gradient(135deg, #0d2b45, #1f4f5e)' },
  { id: 5, name: 'Elevator_Bank_0712.mp4', camera: 'Khu vực thang máy', duration: '02:31', date: '12 tháng 7, 2026 06:30 CH', resolution: '1920×1080', size: '155 MB', objects: ['Người', 'Thang máy', 'Túi'], status: 'indexed', grad: 'linear-gradient(135deg, #1e2d5f, #3d2060)' },
  { id: 6, name: 'Cafeteria_0712_PM.mp4', camera: 'Nhà ăn', duration: '02:45', date: '12 tháng 7, 2026 01:15 CH', resolution: '1280×720', size: '167 MB', objects: ['Người', 'Bàn', 'Đồ ăn'], status: 'indexed', grad: 'linear-gradient(135deg, #0f2b3f, #1d3b5e)' },
  { id: 7, name: 'Main_Gate_0712.mp4', camera: 'Cổng chính', duration: '01:22', date: '12 tháng 7, 2026 09:00 SA', resolution: '4K UHD', size: '420 MB', objects: ['Xe ô tô', 'Người', 'Cổng'], status: 'indexed', grad: 'linear-gradient(135deg, #2a0f4e, #150d3a)' },
  { id: 8, name: 'Warehouse_Floor_0711.mp4', camera: 'Nhà kho', duration: '02:59', date: '11 tháng 7, 2026 04:22 CH', resolution: '1920×1080', size: '188 MB', objects: ['Xe nâng', 'Thùng hàng', 'Người'], status: 'indexed', grad: 'linear-gradient(135deg, #0d2040, #1a3050)' },
];

export default function VideoLibrary() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = videos.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.camera.toLowerCase().includes(search.toLowerCase())
  ).filter(v => filter === 'all' || v.status === filter);

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#0f172a', marginBottom: 4, letterSpacing: '-0.03em' }}>Thư viện Video</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{videos.length} video đã lập chỉ mục · Cập nhật lần cuối 2 phút trước</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/upload')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
        >
          <Upload size={16} />
          Tải lên Video
        </motion.button>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ ...CARD, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên file, camera hoặc đối tượng phát hiện..."
            style={{ width: '100%', padding: '9px 12px 9px 36px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 9, outline: 'none', fontSize: 13, color: '#334155', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'indexed', 'processing'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid', borderColor: filter === f ? '#3b82f6' : '#e2e8f0', background: filter === f ? 'rgba(59,130,246,0.08)' : 'white', color: filter === f ? '#3b82f6' : '#64748b', fontSize: 13, fontWeight: filter === f ? 600 : 400, cursor: 'pointer' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: '#f1f5f9', borderRadius: 8 }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: viewMode === 'grid' ? 'white' : 'transparent', cursor: 'pointer', color: viewMode === 'grid' ? '#334155' : '#94a3b8', boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: viewMode === 'list' ? 'white' : 'transparent', cursor: 'pointer', color: viewMode === 'list' ? '#334155' : '#94a3b8', boxShadow: viewMode === 'list' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
            <List size={16} />
          </button>
        </div>
      </motion.div>

      {/* Video grid */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {filtered.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
              style={{ ...CARD, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate('/search')}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', aspectRatio: '16/9', background: video.grad, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <Play size={18} color="white" fill="white" style={{ marginLeft: 2 }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  <span style={{ padding: '3px 8px', background: video.status === 'indexed' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)', borderRadius: 6, fontSize: 10, color: 'white', fontWeight: 600 }}>
                    {video.status === 'indexed' ? '✓ Đã lập chỉ mục' : '⟳ Đang xử lý'}
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.65)', borderRadius: 4, padding: '1px 7px', fontSize: 11, color: 'white' }}>{video.duration}</div>
              </div>
              {/* Info */}
              <div style={{ padding: '14px 14px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{video.camera} · {video.resolution}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {video.objects.slice(0, 3).map(obj => (
                    <span key={obj} style={{ padding: '2px 8px', background: 'rgba(59,130,246,0.08)', borderRadius: 5, fontSize: 11, color: '#3b82f6', fontWeight: 500 }}>{obj}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{video.date} · {video.size}</div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={CARD}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Video', 'Camera', 'Thời lượng', 'Độ phân giải', 'Đối tượng', 'Trạng thái', 'Ngày', ''].map(h => (
                  <th key={h} style={{ padding: '0 16px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(video => (
                <motion.tr key={video.id} whileHover={{ background: '#f8fafc' }} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }} onClick={() => navigate('/search')}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 30, background: video.grad, borderRadius: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{video.camera}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{video.duration}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{video.resolution}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {video.objects.slice(0, 2).map(obj => (
                        <span key={obj} style={{ padding: '2px 7px', background: 'rgba(59,130,246,0.08)', borderRadius: 5, fontSize: 11, color: '#3b82f6' }}>{obj}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: video.status === 'indexed' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', color: video.status === 'indexed' ? '#10b981' : '#f59e0b' }}>
                      {video.status === 'indexed' ? '✓ Đã lập chỉ mục' : '⟳ Đang xử lý'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{video.date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreHorizontal size={16} /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
