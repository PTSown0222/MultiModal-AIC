import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, Sparkles, Clock, Camera, Calendar, MapPin, Tag, ChevronDown, ArrowRight, X } from 'lucide-react';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const exampleQueries = [
  { text: 'Tìm người mặc áo đỏ', category: 'Người' },
  { text: 'Tìm xe tải giao hàng màu trắng', category: 'Xe cộ' },
  { text: 'Tìm nhân viên cầm laptop gần thang máy', category: 'Hoạt động' },
  { text: 'Ai truy cập phòng máy chủ sau 18:00', category: 'Bảo mật' },
  { text: 'Tìm túi bỏ lại gần khu vực lễ tân', category: 'Đối tượng' },
  { text: 'Xe sedan xanh ở bãi đỗ xe B', category: 'Xe cộ' },
];

const recentSearches = [
  { query: 'Người mặc áo khoác đỏ gần thang máy', time: '11:24 SA', results: 8 },
  { query: 'Xe tải giao hàng màu trắng bãi đỗ xe B', time: '10:58 SA', results: 3 },
  { query: 'Nhân viên cầm laptop trong phòng máy chủ', time: '09:41 SA', results: 12 },
  { query: 'Người lạ tại khu vực lễ tân', time: 'Hôm qua', results: 2 },
];

const cameras = ['Tất cả Camera', 'Sảnh Chính', 'Bãi đỗ xe A', 'Bãi đỗ xe B', 'Phòng máy chủ', 'Lễ tân', 'Khu thang máy', 'Nhà ăn', 'Cổng chính'];
const objects = ['Tất cả Đối tượng', 'Người', 'Xe cộ', 'Laptop', 'Túi xách', 'Điện thoại', 'Thẻ', 'Xe tải'];

const categoryColors: Record<string, { bg: string; color: string }> = {
  'Người': { bg: 'rgba(59,130,246,0.08)', color: '#3b82f6' },
  'Xe cộ': { bg: 'rgba(14,165,233,0.08)', color: '#0ea5e9' },
  'Hoạt động': { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b' },
  'Bảo mật': { bg: 'rgba(239,68,68,0.08)', color: '#ef4444' },
  'Đối tượng': { bg: 'rgba(16,185,129,0.08)', color: '#10b981' },
};

export default function SemanticSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [camera, setCamera] = useState('All Cameras');
  const [date, setDate] = useState('');
  const [object, setObject] = useState('All Objects');
  const [listening, setListening] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSearch = (q?: string) => {
    if ((q ?? query).trim()) navigate('/results');
  };

  const handleVoice = () => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      setQuery('Find the person wearing a red shirt near the elevator');
    }, 2200);
  };

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, marginBottom: 16 }}>
          <Sparkles size={13} color="#3b82f6" />
          <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600 }}>Tìm kiếm Ngữ nghĩa được hỗ trợ bởi AI</span>
        </div>
        <h1 style={{ color: '#0f172a', marginBottom: 8, letterSpacing: '-0.03em', fontSize: 32 }}>Tìm kiếm Kho tri thức Video của bạn</h1>
        <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>Hỏi bất cứ điều gì về video đã lập chỉ mục bằng ngôn ngữ tự nhiên — đối tượng, người, hành động, vị trí</p>
      </motion.div>

      {/* Main search box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ maxWidth: 760, margin: '0 auto 32px' }}
      >
        <div style={{
          ...CARD, padding: 0, overflow: 'hidden',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.2), 0 8px 32px rgba(0,0,0,0.12)' : '0 4px 24px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.2s',
          border: focused ? '1.5px solid rgba(59,130,246,0.5)' : '1.5px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 6px 6px 20px', gap: 12 }}>
            <Sparkles size={22} color={focused ? '#3b82f6' : '#94a3b8'} style={{ flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Hỏi bất cứ điều gì về video của bạn..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, color: '#0f172a', background: 'transparent', padding: '10px 0' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6 }}>
                <X size={16} />
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleVoice}
              animate={{ background: listening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#f8fafc' }}
              style={{ width: 42, height: 42, borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {listening ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  <Mic size={18} color="white" />
                </motion.div>
              ) : (
                <Mic size={18} color="#64748b" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSearch()}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
            >
              <Search size={16} />
              Tìm kiếm
            </motion.button>
          </div>

          {/* Filters bar */}
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, background: '#fafbfc' }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginRight: 4 }}>Bộ lọc:</span>
            {/* Camera */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>
              <Camera size={13} color="#64748b" />
              <select value={camera} onChange={e => setCamera(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 12, color: '#334155', background: 'transparent', cursor: 'pointer', fontWeight: 500 }}>
                {cameras.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>
              <Calendar size={13} color="#64748b" />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 12, color: date ? '#334155' : '#94a3b8', background: 'transparent', cursor: 'pointer', fontWeight: 500 }} />
            </div>
            {/* Object */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>
              <Tag size={13} color="#64748b" />
              <select value={object} onChange={e => setObject(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: 12, color: '#334155', background: 'transparent', cursor: 'pointer', fontWeight: 500 }}>
                {objects.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
        {listening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 12, color: '#ef4444', fontSize: 14, fontWeight: 500 }}>
            🎤 Đang nghe... hãy nói rõ câu truy vấn của bạn
          </motion.div>
        )}
      </motion.div>

      {/* Example queries */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ maxWidth: 760, margin: '0 auto 32px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Ví dụ Truy vấn</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {exampleQueries.map((eq, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => { setQuery(eq.text); handleSearch(eq.text); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 24, cursor: 'pointer', fontSize: 13, color: '#334155', fontWeight: 400 }}
            >
              <span style={{ padding: '2px 7px', background: categoryColors[eq.category]?.bg, borderRadius: 5, fontSize: 11, color: categoryColors[eq.category]?.color, fontWeight: 600, flexShrink: 0 }}>{eq.category}</span>
              {eq.text}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Searches */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ ...CARD, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={15} color="#94a3b8" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Tìm kiếm Gần đây</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentSearches.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ background: '#f8fafc', paddingLeft: 16 }}
                onClick={() => { setQuery(s.query); handleSearch(s.query); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, color: '#334155' }}>{s.query}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{s.time}</span>
                <span style={{ padding: '3px 10px', background: 'rgba(59,130,246,0.08)', borderRadius: 6, fontSize: 12, color: '#3b82f6', fontWeight: 600, flexShrink: 0 }}>{s.results} kết quả</span>
                <ArrowRight size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
