import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, Volume2, Maximize, Download, Bookmark, Share2, Camera, Clock, Sparkles } from 'lucide-react';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const resultData = [
  { id: '1', camera: 'Sảnh Chính', time: '10:32:14 SA', similarity: 96.4, confidence: 94.2 },
  { id: '2', camera: 'Khu thang máy', time: '10:28:47 SA', similarity: 89.7, confidence: 87.1 },
  { id: '3', camera: 'Nhà ăn', time: '12:14:33 CH', similarity: 82.3, confidence: 78.9 },
  { id: '4', camera: 'Bãi đỗ xe B', time: '05:48:20 CH', similarity: 74.8, confidence: 71.3 },
  { id: '5', camera: 'Khu vực lễ tân', time: '08:03:55 SA', similarity: 68.2, confidence: 64.7 },
  { id: '6', camera: 'Cổng chính', time: '07:52:10 SA', similarity: 61.5, confidence: 58.3 },
];

const gradients: Record<string, string> = {
  '1': 'linear-gradient(135deg, #1e3a5f, #2d5a6b)',
  '2': 'linear-gradient(135deg, #2d1b4e, #1a2f6b)',
  '3': 'linear-gradient(135deg, #1a2f4f, #3b1f5e)',
  '4': 'linear-gradient(135deg, #0d2b45, #1f4f5e)',
  '5': 'linear-gradient(135deg, #1e2d5f, #3d2060)',
  '6': 'linear-gradient(135deg, #2a0f4e, #150d3a)',
};

export default function VideoDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [playing, setPlaying] = useState(false);
  const [timelinePos, setTimelinePos] = useState(35);

  const result = resultData.find(r => r.id === id) ?? resultData[0];
  const grad = gradients[id ?? '1'] ?? gradients['1'];
  const numId = parseInt(id ?? '1');
  const prevId = numId > 1 ? numId - 1 : null;
  const nextId = numId < resultData.length ? numId + 1 : null;

  const infoItems = [
    { label: 'Mô tả Cảnh quay', value: 'Khu vực sảnh trong nhà với lưu lượng người qua lại cao. Ánh đèn trên cao sáng. Đầu đọc thẻ bảo mật nhìn thấy bên phải. Cửa kính ở phía nền.' },
    { label: 'Đối tượng Phát hiện', value: 'Người (1), Áo đỏ (1), Thẻ nhân viên (1), Cửa (1), Camera an ninh (2)' },
    { label: 'Hành động Phát hiện', value: 'Đi về phía camera, phát hiện chạm thẻ, đi qua cửa bảo mật' },
    { label: 'Quan hệ Không gian', value: 'Đối tượng ở trung tâm-trái, cách camera 3,2m. Đầu đọc thẻ cách đối tượng 0,8m về phía phải.' },
    { label: 'Quan hệ Thời gian', value: 'Xuất hiện lần đầu lúc 10:31:58, rời khỏi khung hình lúc 10:32:22. Tổng thời gian hiển thị: 24 giây.' },
  ];

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/results')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <ArrowLeft size={14} /> Quay lại Kết quả
          </button>
          <div>
            <h1 style={{ color: '#0f172a', marginBottom: 2, letterSpacing: '-0.03em', fontSize: 20 }}>Chi tiết Video — {result.camera}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
              <Camera size={12} />
              <span>{result.camera}</span>
              <span style={{ color: '#94a3b8' }}>·</span>
              <Clock size={12} />
              <span>{result.time} · Jul 13, 2026</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/results')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <Share2 size={14} /> Chia sẻ
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: 'white', fontWeight: 600, boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}>
            <Download size={14} /> Xuất file
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Video player */}
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...CARD, overflow: 'hidden', marginBottom: 16 }}>
            {/* Video frame */}
            <div style={{ aspectRatio: '16/9', background: grad, position: 'relative', cursor: 'pointer' }} onClick={() => setPlaying(!playing)}>
              {/* Bounding boxes */}
              <div style={{ position: 'absolute', top: '15%', left: '12%', width: '28%', height: '70%', border: '2px solid #93c5fd', borderRadius: 6 }}>
                <div style={{ position: 'absolute', top: -24, left: 0, background: 'rgba(59,130,246,0.95)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Người · 94,2%</div>
                <div style={{ position: 'absolute', bottom: -24, left: 0, background: 'rgba(16,185,129,0.9)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>Áo đỏ · 97,8%</div>
              </div>
              <div style={{ position: 'absolute', top: '25%', right: '18%', width: '18%', height: '35%', border: '2px solid #34d399', borderRadius: 6 }}>
                <div style={{ position: 'absolute', top: -22, left: 0, background: 'rgba(16,185,129,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: 'white', whiteSpace: 'nowrap' }}>Đầu đọc thẻ</div>
              </div>
              {/* Play/Pause overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: playing ? 'transparent' : 'rgba(0,0,0,0.1)' }}>
                {!playing && (
                  <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <Play size={24} color="white" fill="white" style={{ marginLeft: 3 }} />
                  </div>
                )}
              </div>
              {/* Timestamp */}
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.65)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'white', fontWeight: 600 }}>10:32:14 AM</div>
              {/* Camera name */}
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.65)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'white' }}>{result.camera}</div>
            </div>

            {/* Player controls */}
            <div style={{ padding: '14px 20px', background: '#0f172a' }}>
              {/* Timeline */}
              <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, marginBottom: 12, cursor: 'pointer' }}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTimelinePos(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                }}>
                {/* Highlighted segment */}
                <div style={{ position: 'absolute', left: '30%', width: '20%', height: '100%', background: 'rgba(59,130,246,0.5)', borderRadius: 3 }} />
                {/* Progress */}
                <div style={{ width: `${timelinePos}%`, height: '100%', background: '#3b82f6', borderRadius: 3, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, background: 'white', borderRadius: '50%', boxShadow: '0 0 6px rgba(59,130,246,0.8)' }} />
                </div>
                {/* Segment label */}
                <div style={{ position: 'absolute', top: -22, left: '30%', fontSize: 10, color: '#93c5fd', whiteSpace: 'nowrap' }}>Đoạn được truy xuất</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setPlaying(!playing)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>00:{Math.round(timelinePos * 0.134).toString().padStart(2, '0')} / 02:14</span>
                <Volume2 size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
                <Maximize size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </motion.div>

          {/* Navigation between results */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => prevId && navigate(`/video/${prevId}`)} disabled={!prevId} style={{ flex: 1, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: prevId ? 'white' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, cursor: prevId ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 500, color: prevId ? '#334155' : '#cbd5e1' }}>
              <ChevronLeft size={15} /> Kết quả trước
            </button>
            <button onClick={() => navigate('/results')} style={{ flex: 1, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>
              Quay lại Kết quả
            </button>
            <button onClick={() => nextId && navigate(`/video/${nextId}`)} disabled={!nextId} style={{ flex: 1, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: nextId ? 'white' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, cursor: nextId ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 500, color: nextId ? '#334155' : '#cbd5e1' }}>
              Kết quả tiếp theo <ChevronRight size={15} />
            </button>
          </motion.div>
        </div>

        {/* Info panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Scores */}
          <div style={{ ...CARD, padding: 20 }}>
            <h3 style={{ color: '#0f172a', marginBottom: 16 }}>Điểm Trùng khớp</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Điểm Tương đồng', value: result.similarity, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                { label: 'Điểm Tin cậy', value: result.confidence, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              ].map(({ label, value, color, bg }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color }}>{value.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, delay: 0.3 }} style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reasoning */}
          <div style={{ ...CARD, padding: 20, background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(14,165,233,0.04))', border: '1px solid rgba(59,130,246,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={15} color="#3b82f6" />
              <h3 style={{ color: '#2563eb' }}>Lý luận AI</h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65 }}>
              Kết quả trùng khớp ngữ nghĩa cao dựa trên so sánh embedding hình ảnh (mô hình CLIP). Áo đỏ của đối tượng cung cấp điểm neo màu sắc-ngữ nghĩa mạnh. Thẻ nhân viên và tương tác cửa xác nhận ngữ cảnh nhân viên. Vị trí không gian phù hợp với ý định truy vấn sảnh chính.
            </p>
          </div>

          {/* Scene info */}
          <div style={{ ...CARD, padding: 20 }}>
            <h3 style={{ color: '#0f172a', marginBottom: 16 }}>Phân tích Cảnh quay</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {infoItems.map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{value}</div>
                  <div style={{ height: 1, background: '#f1f5f9', marginTop: 14 }} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
