import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, ExternalLink, Bookmark, Download, Filter, SlidersHorizontal, X, Camera, Clock, Sparkles, ChevronDown } from 'lucide-react';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const results = [
  {
    id: 1, rank: 1, camera: 'Sảnh Chính', timestamp: '10:32:14 SA', date: '13 tháng 7, 2026',
    similarity: 96.4, confidence: 94.2, duration: '00:08',
    objects: ['Người', 'Áo đỏ', 'Thẻ nhân viên'],
    description: 'Nam giới mặc áo đỏ nổi bật và đeo thẻ nhân viên, đi qua sảnh chính. Ghi lại được góc nhìn chính diện rõ ràng.',
    grad: 'linear-gradient(135deg, #1e3a5f, #2d5a6b)',
  },
  {
    id: 2, rank: 2, camera: 'Khu thang máy', timestamp: '10:28:47 SA', date: '13 tháng 7, 2026',
    similarity: 89.7, confidence: 87.1, duration: '00:12',
    objects: ['Người', 'Áo đỏ', 'Thang máy'],
    description: 'Cùng một người xuất hiện gần khu thang máy tầng 3. Đang chờ thang máy với cặp tài liệu.',
    grad: 'linear-gradient(135deg, #2d1b4e, #1a2f6b)',
  },
  {
    id: 3, rank: 3, camera: 'Nhà ăn', timestamp: '12:14:33 CH', date: '13 tháng 7, 2026',
    similarity: 82.3, confidence: 78.9, duration: '00:31',
    objects: ['Người', 'Áo đỏ', 'Bàn ăn'],
    description: 'Đối tượng xuất hiện trong nhà ăn giờ ăn trưa, ngồi ở bàn góc. Thời gian hiện diện kéo dài được ghi lại.',
    grad: 'linear-gradient(135deg, #1a2f4f, #3b1f5e)',
  },
  {
    id: 4, rank: 4, camera: 'Bãi đỗ xe B', timestamp: '05:48:20 CH', date: '12 tháng 7, 2026',
    similarity: 74.8, confidence: 71.3, duration: '00:05',
    objects: ['Người', 'Áo đỏ', 'Xe ô tô'],
    description: 'Người mặc áo đỏ được quan sát gần xe sedan xanh tại Bãi đỗ xe B. Dừng ngắn trước khi lái đi.',
    grad: 'linear-gradient(135deg, #0d2b45, #1f4f5e)',
  },
  {
    id: 5, rank: 5, camera: 'Khu vực lễ tân', timestamp: '08:03:55 SA', date: '13 tháng 7, 2026',
    similarity: 68.2, confidence: 64.7, duration: '00:22',
    objects: ['Người', 'Áo đỏ', 'Quầy lễ tân'],
    description: 'Hình ảnh một phần của đối tượng gần quầy lễ tân vào sáng sớm. Độ tin cậy thấp hơn do góc camera.',
    grad: 'linear-gradient(135deg, #1e2d5f, #3d2060)',
  },
  {
    id: 6, rank: 6, camera: 'Cổng chính', timestamp: '07:52:10 SA', date: '13 tháng 7, 2026',
    similarity: 61.5, confidence: 58.3, duration: '00:04',
    objects: ['Người', 'Áo đỏ', 'Cổng'],
    description: 'Ghi lại cảnh vào qua cổng chính. Độ phân giải thấp từ camera cổng nhưng xác nhận trùng màu sắc.',
    grad: 'linear-gradient(135deg, #2a0f4e, #150d3a)',
  },
];

function SimilarityBadge({ score }: { score: number }) {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const bg = score >= 85 ? 'rgba(16,185,129,0.08)' : score >= 70 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 60, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: '2px 7px', borderRadius: 5 }}>{score.toFixed(1)}%</span>
    </div>
  );
}

export default function SearchResults() {
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/search')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <ArrowLeft size={14} /> Quay lại
          </button>
          <div>
            <h1 style={{ color: '#0f172a', marginBottom: 4, letterSpacing: '-0.03em' }}>Kết quả Truy xuất Ngữ nghĩa</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
              <Sparkles size={13} color="#3b82f6" />
              <span>"Tìm người mặc áo đỏ"</span>
              <span style={{ color: '#94a3b8' }}>·</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>{results.length} kết quả tìm thấy</span>
              <span style={{ color: '#94a3b8' }}>·</span>
              <span>Phản hồi: 2,1s</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <SlidersHorizontal size={14} /> Bộ lọc
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <Download size={14} /> Xuất tất cả
          </button>
        </div>
      </motion.div>

      {/* Results grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {results.map((result, i) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
            style={{ ...CARD, overflow: 'hidden', cursor: 'default' }}
          >
            {/* Rank badge */}
            <div style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '16/9', background: result.grad, position: 'relative', overflow: 'hidden' }}>
                {/* Bounding box simulation */}
                <div style={{ position: 'absolute', top: '20%', left: '15%', width: '30%', height: '65%', border: '2px solid #93c5fd', borderRadius: 4 }}>
                  <div style={{ position: 'absolute', top: -18, left: 0, background: 'rgba(59,130,246,0.9)', borderRadius: 4, padding: '2px 7px', fontSize: 10, color: 'white', whiteSpace: 'nowrap' }}>Person</div>
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
                <div style={{ position: 'absolute', top: 10, left: 10, width: 28, height: 28, background: result.rank === 1 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : result.rank === 2 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : result.rank === 3 ? 'linear-gradient(135deg, #b45309, #92400e)' : 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {result.rank}
                </div>
                <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '1px 7px', fontSize: 11, color: 'white' }}>{result.duration}</div>
              </div>
            </div>

            <div style={{ padding: '16px 16px 14px' }}>
              {/* Camera + timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                  <Camera size={12} />
                  <span style={{ fontWeight: 500 }}>{result.camera}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
                  <Clock size={12} />
                  {result.timestamp}
                </div>
              </div>

              {/* Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Độ tương đồng</div>
                  <SimilarityBadge score={result.similarity} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Độ tin cậy</div>
                  <SimilarityBadge score={result.confidence} />
                </div>
              </div>

              {/* Objects */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {result.objects.map(obj => (
                  <span key={obj} style={{ padding: '2px 8px', background: 'rgba(59,130,246,0.07)', borderRadius: 5, fontSize: 11, color: '#3b82f6', fontWeight: 500 }}>{obj}</span>
                ))}
              </div>

              {/* Description */}
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {result.description}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setPreviewId(result.id)}
                  style={{ flex: 1, padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  <Play size={13} fill="currentColor" /> Xem trước
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate(`/video/${result.id}`)}
                  style={{ flex: 1, padding: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  <ExternalLink size={13} /> Xem chi tiết
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSaved(prev => { const s = new Set(prev); s.has(result.id) ? s.delete(result.id) : s.add(result.id); return s; })}
                  style={{ padding: '8px 10px', background: saved.has(result.id) ? 'rgba(245,158,11,0.08)' : '#f8fafc', border: `1px solid ${saved.has(result.id) ? 'rgba(245,158,11,0.3)' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', color: saved.has(result.id) ? '#f59e0b' : '#94a3b8' }}
                >
                  <Bookmark size={14} fill={saved.has(result.id) ? 'currentColor' : 'none'} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mini preview modal */}
      <AnimatePresence>
        {previewId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setPreviewId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: 640, background: '#0f172a', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
            >
              <div style={{ aspectRatio: '16/9', background: results.find(r => r.id === previewId)?.grad, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <Play size={24} color="white" fill="white" style={{ marginLeft: 3 }} />
                </div>
                {/* Bounding box */}
                <div style={{ position: 'absolute', top: '20%', left: '15%', width: '30%', height: '65%', border: '2px solid #93c5fd', borderRadius: 4 }}>
                  <span style={{ position: 'absolute', top: -22, left: 0, background: 'rgba(59,130,246,0.9)', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: 'white' }}>Person · 94%</span>
                </div>
                <button onClick={() => setPreviewId(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 3 }}>{results.find(r => r.id === previewId)?.camera}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{results.find(r => r.id === previewId)?.timestamp}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate(`/video/${previewId}`)}
                  style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Open Detail <ExternalLink size={13} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
