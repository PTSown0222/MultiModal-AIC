import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, ArrowRight, Sparkles, Database, Eye, Type, Layers, Brain, Zap, Film, Network } from 'lucide-react';

const stages = [
  { id: 1, label: 'Trích xuất Khung hình', desc: 'Trích xuất keyframe ở độ phân giải 1fps', icon: Film, duration: 1200 },
  { id: 2, label: 'Phát hiện Cảnh quay', desc: 'Xác định ranh giới và chuyển cảnh', icon: Eye, duration: 1000 },
  { id: 3, label: 'Phát hiện Đối tượng', desc: 'Chạy mô hình phát hiện YOLOv8', icon: Layers, duration: 1400 },
  { id: 4, label: 'Phân tích OCR', desc: 'Trích xuất văn bản hiển thị từ khung hình', icon: Type, duration: 800 },
  { id: 5, label: 'Hiểu Không gian', desc: 'Phân tích vị trí và mối quan hệ đối tượng', icon: Network, duration: 1100 },
  { id: 6, label: 'Phân tích Thời gian', desc: 'Theo dõi chuyển động và các mẫu hành động', icon: Zap, duration: 1300 },
  { id: 7, label: 'Nhúng Ngữ nghĩa', desc: 'Tạo embedding CLIP/SigLIP', icon: Brain, duration: 1600 },
  { id: 8, label: 'Cơ sở dữ liệu Vector', desc: 'Lưu trữ embedding vào Milvus', icon: Database, duration: 900 },
  { id: 9, label: 'Lập chỉ mục Hoàn tất', desc: 'Video sẵn sàng cho tìm kiếm ngữ nghĩa', icon: CheckCircle, duration: 500 },
];

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

export default function VideoProcessing() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentStage >= stages.length) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => {
      setCompleted(prev => [...prev, currentStage]);
      setCurrentStage(prev => prev + 1);
    }, stages[currentStage]?.duration ?? 1000);
    return () => clearTimeout(timer);
  }, [currentStage]);

  const progress = Math.round((completed.length / stages.length) * 100);

  return (
    <div style={{ padding: '32px', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(59,130,246,0.35)' }}>
            <Sparkles size={22} color="white" />
          </div>
          <h1 style={{ color: '#0f172a', letterSpacing: '-0.03em' }}>Đang Xử lý Video</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 15 }}>VisionScope AI đang phân tích cảnh quay của bạn qua pipeline thông minh</p>
      </motion.div>

      {/* Progress overview */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...CARD, padding: '28px 40px', marginBottom: 32, width: '100%', maxWidth: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Lobby_Entrance_2024.mp4</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {done ? 'Xử lý Hoàn tất!' : `Giai đoạn ${Math.min(currentStage + 1, stages.length)} / ${stages.length}`}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', background: done ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #2563eb, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {progress}%
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Complete</div>
          </div>
        </div>
        <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', borderRadius: 5, background: done ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #2563eb, #0ea5e9)', boxShadow: done ? '0 0 10px rgba(16,185,129,0.4)' : '0 0 10px rgba(59,130,246,0.4)' }}
          />
        </div>
        {!done && currentStage < stages.length && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
            <motion.span key={currentStage} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {stages[currentStage]?.desc}
            </motion.span>
          </div>
        )}
      </motion.div>

      {/* Pipeline stages */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...CARD, padding: '28px 32px', width: '100%', maxWidth: 700, marginBottom: 28 }}>
        <h3 style={{ color: '#0f172a', marginBottom: 24 }}>Pipeline Xử lý</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {stages.map((stage, i) => {
            const isDone = completed.includes(i);
            const isActive = currentStage === i;
            const isPending = !isDone && !isActive;

            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                {/* Connector line + circle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
                  <motion.div
                    animate={{
                      background: isDone ? 'linear-gradient(135deg, #10b981, #059669)' : isActive ? 'linear-gradient(135deg, #2563eb, #0ea5e9)' : '#f1f5f9',
                      boxShadow: isActive ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                    }}
                    style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}
                  >
                    {isDone ? (
                      <CheckCircle size={16} color="white" />
                    ) : isActive ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                        <Loader2 size={16} color="white" />
                      </motion.div>
                    ) : (
                      <stage.icon size={15} color="#94a3b8" />
                    )}
                  </motion.div>
                  {i < stages.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 20, background: isDone ? '#10b981' : '#e2e8f0', margin: '4px 0', transition: 'background 0.3s' }} />
                  )}
                </div>

                {/* Content */}
                <motion.div
                  animate={{ opacity: isPending ? 0.45 : 1 }}
                  style={{ flex: 1, paddingBottom: i < stages.length - 1 ? 20 : 0, paddingLeft: 12 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: isActive ? 700 : isDone ? 600 : 400, color: isDone ? '#10b981' : isActive ? '#2563eb' : '#64748b' }}>
                      {stage.label}
                    </span>
                    {isDone && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Xong</span>}
                    {isActive && (
                      <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>
                        Đang xử lý...
                      </motion.span>
                    )}
                  </div>
                  {(isActive || isDone) && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{stage.desc}</div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* CTA */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{ ...CARD, padding: '28px 40px', width: '100%', maxWidth: 700, textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
              <CheckCircle size={28} color="white" />
            </div>
            <h2 style={{ color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Video Đã Được Lập Chỉ Mục!</h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>Video của bạn đã được xử lý và sẵn sàng cho các truy vấn tìm kiếm ngữ nghĩa</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/search')}
              style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 20px rgba(59,130,246,0.35)' }}
            >
              <Sparkles size={18} />
              Bắt đầu Tìm kiếm Ngữ nghĩa
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
