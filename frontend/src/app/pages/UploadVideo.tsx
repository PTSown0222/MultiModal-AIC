import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileVideo, X, CheckCircle, AlertCircle, ArrowRight, Film, Clock, Monitor } from 'lucide-react';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const supportedFormats = ['MP4', 'AVI', 'MOV', 'MKV', 'WMV'];

const mockFiles = [
  { name: 'Lobby_Entrance_2024.mp4', size: '142 MB', duration: '02:14', resolution: '1920×1080', fps: '30fps' },
  { name: 'Bai_Do_Xe_Footage.avi', size: '210 MB', duration: '03:00', resolution: '1280×720', fps: '25fps' },
];

export default function UploadVideo() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<{ name: string; size: string; duration: string; resolution: string; fps: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickMockFile = () => {
    const mock = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setFile(mock);
  };

  const handleUpload = () => {
    setUploading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setUploaded(true);
      }
      setProgress(Math.min(p, 100));
    }, 180);
  };

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#0f172a', marginBottom: 4, letterSpacing: '-0.03em' }}>Tải lên Video</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Thêm cảnh quay vào VisionScope AI để lập chỉ mục ngữ nghĩa và phân tích</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Upload area */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ ...CARD, padding: 0, overflow: 'hidden', marginBottom: 20 }}
          >
            {!file ? (
              /* Drop zone */
              <motion.div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); pickMockFile(); }}
                onClick={() => { pickMockFile(); }}
                animate={{ background: dragging ? 'rgba(59,130,246,0.04)' : 'white' }}
                style={{
                  padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: `2px dashed ${dragging ? '#3b82f6' : '#e2e8f0'}`, borderRadius: 16, margin: 4, transition: 'all 0.2s',
                }}
              >
                <motion.div
                  animate={{ y: dragging ? -8 : 0 }}
                  style={{ width: 80, height: 80, background: dragging ? 'rgba(59,130,246,0.1)' : '#f8fafc', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `2px solid ${dragging ? '#3b82f6' : '#e2e8f0'}` }}
                >
                  <Upload size={32} color={dragging ? '#3b82f6' : '#94a3b8'} />
                </motion.div>
                <h2 style={{ color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  {dragging ? 'Thả để tải lên' : 'Kéo & Thả tệp video của bạn'}
                </h2>
                <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>hoặc nhấn vào đây để chọn tệp</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {supportedFormats.map(fmt => (
                    <span key={fmt} style={{ padding: '4px 12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>{fmt}</span>
                  ))}
                </div>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>Dung lượng tối đa: 500MB · Thời lượng tối đa: 3 phút</p>
                <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} />
              </motion.div>
            ) : (
              /* File selected */
              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h3 style={{ color: '#0f172a' }}>Đã chọn Video</h3>
                  {!uploading && (
                    <button onClick={() => { setFile(null); setUploaded(false); setProgress(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <X size={15} /> Remove
                    </button>
                  )}
                </div>

                {/* Video preview placeholder */}
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, #1e3a5f, #2d1b4e)', borderRadius: 14, marginBottom: 24, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Film size={48} color="rgba(255,255,255,0.3)" />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                      <div style={{ width: '35%', height: '100%', background: 'white', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{file.duration}</span>
                  </div>
                </div>

                {/* Upload progress */}
                {uploading && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{uploaded ? 'Tải lên hoàn tất!' : 'Đang tải lên...'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: uploaded ? '#10b981' : '#3b82f6' }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: uploaded ? '#10b981' : 'linear-gradient(90deg, #2563eb, #0ea5e9)', borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <AnimatePresence>
                  {!uploading && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={handleUpload}
                      style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600, boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
                    >
                      Tải lên Video
                    </motion.button>
                  )}
                  {uploaded && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => navigate('/processing')}
                      style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
                    >
                      <CheckCircle size={18} />
                      Bắt đầu Xử lý AI
                      <ArrowRight size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* File info */}
          {file && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ ...CARD, padding: 24 }}>
              <h3 style={{ color: '#0f172a', marginBottom: 16 }}>Video Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: FileVideo, label: 'Tên tệp', value: file.name },
                  { icon: Clock, label: 'Thời lượng', value: file.duration },
                  { icon: Monitor, label: 'Độ phân giải', value: file.resolution },
                  { icon: Film, label: 'Tốc độ khung hình', value: file.fps },
                  { icon: Upload, label: 'Dung lượng tệp', value: file.size },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Processing info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={{ ...CARD, padding: 24 }}>
            <h3 style={{ color: '#0f172a', marginBottom: 4 }}>Pipeline Xử lý AI</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Sau khi tải lên, video sẽ được xử lý tự động:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Trích xuất Khung hình', 'Phát hiện Cảnh quay', 'Phát hiện Đối tượng', 'Phân tích OCR', 'Hiểu Không gian', 'Nhúng Ngữ nghĩa', 'Lập chỉ mục Cơ sở dữ liệu Vector'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: '#475569' }}>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Format guide */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ ...CARD, padding: 24, background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="#3b82f6" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 6 }}>Hướng dẫn Tải lên</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                  <li>Thời lượng tối đa: 3 phút mỗi clip</li>
                  <li>Định dạng hỗ trợ: MP4, AVI, MOV, MKV, WMV</li>
                  <li>Độ phân giải tối thiểu: 720p để có kết quả tốt nhất</li>
                  <li>Thời gian xử lý: ~2–4 phút mỗi phút video</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
