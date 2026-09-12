import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, Filter, Download, ExternalLink, ChevronUp, ChevronDown, MoreHorizontal, Calendar, Sparkles } from 'lucide-react';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const history = [
  { id: 'INV-8821', query: 'Người mặc áo khoác đỏ gần thang máy', time: 'Hôm nay 11:24 SA', video: 'Lobby_Entrance_0713.mp4', results: 8, status: 'completed', duration: '2,1s', camera: 'Nhiều camera' },
  { id: 'INV-8820', query: 'Xe tải giao hàng màu trắng bãi đỗ xe B', time: 'Hôm nay 10:58 SA', video: 'Parking_Lot_B_0713.mp4', results: 3, status: 'completed', duration: '1,8s', camera: 'Bãi đỗ xe B' },
  { id: 'INV-8819', query: 'Nhân viên cầm laptop trong phòng máy chủ', time: 'Hôm nay 09:41 SA', video: 'Server_Room_0713.mp4', results: 12, status: 'completed', duration: '3,4s', camera: 'Phòng máy chủ' },
  { id: 'INV-8818', query: 'Người lạ tại lễ tân sau 20:00', time: 'Hôm nay 08:12 SA', video: 'Reception_Area_0712.mp4', results: 2, status: 'reviewing', duration: '1,2s', camera: 'Lễ tân' },
  { id: 'INV-8817', query: 'Xe sedan xanh trong khu vực đỗ xe cấm', time: 'Hôm qua 18:30', video: 'Parking_Lot_A_0712.mp4', results: 0, status: 'no_results', duration: '0,9s', camera: 'Bãi đỗ xe A' },
  { id: 'INV-8816', query: 'Gói hàng bỏ lại không ai trông coi trong sảnh', time: 'Hôm qua 14:15', video: 'Lobby_Entrance_0712.mp4', results: 5, status: 'completed', duration: '2,7s', camera: 'Sảnh Chính' },
  { id: 'INV-8815', query: 'Người đi theo qua cửa bảo mật', time: 'Hôm qua 10:33', video: 'Server_Room_0712.mp4', results: 1, status: 'escalated', duration: '1,5s', camera: 'Phòng máy chủ' },
  { id: 'INV-8814', query: 'Xe nâng hoạt động gần khu vực người đi bộ', time: '11 tháng 7 16:22', video: 'Warehouse_Floor_0711.mp4', results: 7, status: 'completed', duration: '4,1s', camera: 'Nhà kho' },
  { id: 'INV-8813', query: 'Sự kiện chia sẻ thẻ nhân viên', time: '11 tháng 7 11:08', video: 'Multi_Camera_0711.mp4', results: 3, status: 'completed', duration: '2,9s', camera: 'Nhiều camera' },
  { id: 'INV-8812', query: 'Xe không được phép trong khu vực hạn chế', time: '11 tháng 7 08:45', video: 'Main_Gate_0711.mp4', results: 2, status: 'completed', duration: '1,6s', camera: 'Cổng chính' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: '✓ Hoàn thành', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  reviewing: { label: '⏳ Đang xem xét', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  no_results: { label: '— Không có KQ', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  escalated: { label: '⚠ Đã leo thang', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

export default function InvestigationHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('time');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = history.filter(h =>
    (h.query.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || h.status === statusFilter)
  );

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.3 }}>
      {sortField === field && sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </span>
  );

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#0f172a', marginBottom: 4, letterSpacing: '-0.03em' }}>Lịch sử Điều tra</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{history.length} cuộc điều tra tổng cộng · Cập nhật liên tục</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <Download size={14} /> Xuất CSV
          </button>
          <button onClick={() => navigate('/search')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: 'white', fontWeight: 600, boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}>
            <Sparkles size={14} /> Tìm kiếm mới
          </button>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng điều tra', value: '8.821', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Tuần này', value: '124', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
          { label: 'Thời gian phản hồi TB', value: '2,3s', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Vụ leo thang', value: '7', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
        ].map(card => (
          <div key={card.label} style={{ ...CARD, padding: '16px 20px', background: card.bg, border: `1px solid ${card.color}18` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.color, letterSpacing: '-0.03em' }}>{card.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={CARD}>
        {/* Controls */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo truy vấn hoặc mã điều tra..."
              style={{ width: '100%', padding: '8px 12px 8px 32px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', fontSize: 13, color: '#334155', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'completed', 'reviewing', 'escalated', 'no_results'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid', borderColor: statusFilter === s ? '#3b82f6' : '#e2e8f0', background: statusFilter === s ? 'rgba(59,130,246,0.08)' : 'white', color: statusFilter === s ? '#3b82f6' : '#64748b', fontSize: 12, fontWeight: statusFilter === s ? 600 : 400, cursor: 'pointer' }}>
                {s === 'all' ? 'Tất cả' : s === 'no_results' ? 'Không có KQ' : s === 'completed' ? 'Hoàn thành' : s === 'reviewing' ? 'Xem xét' : 'Leo thang'}
              </button>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
              {[
                { key: 'id', label: 'ID' },
                { key: 'query', label: 'Truy vấn' },
                { key: 'time', label: 'Thời gian' },
                { key: 'video', label: 'Video' },
                { key: 'results', label: 'Kết quả' },
                { key: 'duration', label: 'Thời lượng' },
                { key: 'status', label: 'Trạng thái' },
                { key: 'actions', label: '' },
              ].map(col => (
                <th key={col.key} onClick={() => col.key !== 'actions' && handleSort(col.key)} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: col.key !== 'actions' ? 'pointer' : 'default', userSelect: 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {col.label}
                    {col.key !== 'actions' && <SortIcon field={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ background: '#f8fafc' }}
                style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                onClick={() => navigate('/results')}
              >
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>{inv.id}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#334155', maxWidth: 300 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.query}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{inv.time}</td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8', maxWidth: 180 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.video}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {inv.results > 0 ? (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{inv.results}</span>
                  ) : (
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{inv.duration}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: statusConfig[inv.status].bg, color: statusConfig[inv.status].color }}>
                    {statusConfig[inv.status].label}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => navigate('/results')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                      <ExternalLink size={14} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px 8px', borderRadius: 6 }}>
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Hiển thị {filtered.length} / {history.length} cuộc điều tra</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, '...', 12].map((p, i) => (
              <button key={i} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid', borderColor: p === 1 ? '#3b82f6' : '#e2e8f0', background: p === 1 ? 'rgba(59,130,246,0.08)' : 'white', color: p === 1 ? '#3b82f6' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: p === 1 ? 700 : 400 }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
