import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Building, Brain, Database, Globe, Moon, Sun, Info, CheckCircle, ChevronRight, Shield, Bell, Key, Cpu, Server, Zap } from 'lucide-react';

const CARD = { background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' };

const tabs = [
  { id: 'profile', label: 'Hồ sơ', icon: User },
  { id: 'organization', label: 'Tổ chức', icon: Building },
  { id: 'ai', label: 'Mô hình AI', icon: Brain },
  { id: 'database', label: 'Cơ sở dữ liệu Vector', icon: Database },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'system', label: 'Thông tin Hệ thống', icon: Info },
];

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ color: '#0f172a', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>{desc}</p>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      animate={{ background: checked ? '#3b82f6' : '#e2e8f0' }}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
    >
      <motion.div animate={{ x: checked ? 22 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} style={{ position: 'absolute', top: 2, width: 20, height: 20, background: 'white', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </motion.button>
  );
}

function SelectCard({ label, desc, selected, onClick }: { label: string; desc: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      style={{ padding: '16px 18px', border: `1.5px solid ${selected ? '#3b82f6' : '#e2e8f0'}`, borderRadius: 12, cursor: 'pointer', background: selected ? 'rgba(59,130,246,0.04)' : 'white', position: 'relative' }}
    >
      {selected && <div style={{ position: 'absolute', top: 12, right: 12, color: '#3b82f6' }}><CheckCircle size={16} fill="rgba(59,130,246,0.15)" /></div>}
      <div style={{ fontSize: 14, fontWeight: 600, color: selected ? '#2563eb' : '#334155', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>{desc}</div>
    </motion.div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [clipModel, setClipModel] = useState('clip');
  const [vectorDB, setVectorDB] = useState('milvus');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('vi');
  const [notifications, setNotifications] = useState({ alerts: true, reports: true, processing: true, weekly: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <SectionHeader title="Hồ sơ Người dùng" desc="Quản lý cài đặt tài khoản cá nhân và tùy chọn của bạn" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(14,165,233,0.04))', borderRadius: 14, border: '1px solid rgba(59,130,246,0.1)' }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'white', fontWeight: 700, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>JD</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>James Davis</div>
                <div style={{ fontSize: 14, color: '#64748b' }}>james.davis@corp.com</div>
                <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, marginTop: 4 }}>Quản trị viên Hệ thống · Toàn quyền truy cập</div>
              </div>
              <button style={{ marginLeft: 'auto', padding: '9px 18px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontSize: 13, color: '#334155', fontWeight: 500 }}>Chỉnh sửa hồ sơ</button>
            </div>
            {[
              { label: 'Tên đầy đủ', value: 'James Davis' },
              { label: 'Địa chỉ Email', value: 'james.davis@corp.com' },
              { label: 'Chức danh', value: 'Giám đốc An ninh Vận hành' },
              { label: 'Phòng ban', value: 'An ninh Doanh nghiệp' },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 500, color: '#475569' }}>{field.label}</label>
                <input defaultValue={field.value} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', fontSize: 14, color: '#334155', background: '#f8fafc', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
            ))}
          </div>
        );

      case 'organization':
        return (
          <div>
            <SectionHeader title="Cài đặt Tổ chức" desc="Cấu hình thông tin tổ chức doanh nghiệp của bạn" />
            {[
              { label: 'Tên Tổ chức', value: 'Acme Corporation' },
              { label: 'Mã Tổ chức', value: 'ORG-48291-ACME' },
              { label: 'Loại Giấy phép', value: 'Doanh nghiệp — Không giới hạn' },
              { label: 'Tổng số Chỗ', value: '50 / 200 đã sử dụng' },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 500, color: '#475569' }}>{field.label}</label>
                <input defaultValue={field.value} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', fontSize: 14, color: '#334155', background: '#f8fafc', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
            ))}
            <div style={{ padding: '16px 18px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Giấy phép Doanh nghiệp đang hoạt động</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Giấy phép hết hạn: 31 tháng 12, 2026 · Tự động gia hạn đã bật</div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div>
            <SectionHeader title="Lựa chọn Mô hình AI" desc="Chọn mô hình nhúng và phát hiện đối tượng cho phân tích video" />
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', marginBottom: 14, fontSize: 13, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mô hình Nhúng Hình ảnh</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <SelectCard label="CLIP (OpenAI)" desc="Huấn luyện tương phản ngôn ngữ-hình ảnh. Tìm kiếm đa phương thức nhanh và mạnh mẽ. Tốt nhất cho giám sát tổng quát." selected={clipModel === 'clip'} onClick={() => setClipModel('clip')} />
                <SelectCard label="SigLIP (Google)" desc="Mất mát Sigmoid cho huấn luyện ngôn ngữ-hình ảnh. Độ chính xác cao hơn cho truy vấn chi tiết và cảnh quay độ phân giải thấp." selected={clipModel === 'siglip'} onClick={() => setClipModel('siglip')} />
                <SelectCard label="BLIP-2" desc="Tiền huấn luyện ngôn ngữ-hình ảnh bootstrapping. Xuất sắc cho mô tả cảnh chi tiết." selected={clipModel === 'blip2'} onClick={() => setClipModel('blip2')} />
                <SelectCard label="CoCa" desc="Chú thích tương phản. Tối ưu hóa cho chú thích dày đặc và truy vấn thuộc tính." selected={clipModel === 'coca'} onClick={() => setClipModel('coca')} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 14, fontSize: 13, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mô hình Phát hiện Đối tượng</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { id: 'yolov8', label: 'YOLOv8x', desc: 'Phát hiện thời gian thực tiên tiến nhất. Tỷ lệ độ chính xác/tốc độ tốt nhất.' },
                  { id: 'rtdetr', label: 'RT-DETR', desc: 'Bộ biến đổi phát hiện thời gian thực. Phát hiện đầu cuối không cần NMS.' },
                ].map(m => (
                  <SelectCard key={m.id} label={m.label} desc={m.desc} selected={m.id === 'yolov8'} onClick={() => {}} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div>
            <SectionHeader title="Cơ sở dữ liệu Vector" desc="Cấu hình backend lưu trữ vector cho nhúng ngữ nghĩa" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              <SelectCard label="Milvus" desc="Cơ sở dữ liệu vector mã nguồn mở hiệu suất cao. Tốt nhất cho triển khai quy mô lớn." selected={vectorDB === 'milvus'} onClick={() => setVectorDB('milvus')} />
              <SelectCard label="Qdrant" desc="Tìm kiếm tương đồng vector với lọc tải trọng. API REST xuất sắc." selected={vectorDB === 'qdrant'} onClick={() => setVectorDB('qdrant')} />
              <SelectCard label="Pinecone" desc="Dịch vụ cơ sở dữ liệu vector được quản lý. Không tốn chi phí vận hành." selected={vectorDB === 'pinecone'} onClick={() => setVectorDB('pinecone')} />
              <SelectCard label="Weaviate" desc="Cơ sở dữ liệu vector tích hợp ML. Hỗ trợ tìm kiếm đa phương thức." selected={vectorDB === 'weaviate'} onClick={() => setVectorDB('weaviate')} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 500, color: '#475569' }}>Chuỗi Kết nối</label>
              <input defaultValue="milvus://localhost:19530/visionscope" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', fontSize: 13, color: '#334155', background: '#f8fafc', fontFamily: 'monospace', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#059669' }}>Đã kết nối · 12.847 vector đã lập chỉ mục · Độ trễ 240ms</span>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <SectionHeader title="Tùy chọn Thông báo" desc="Kiểm soát thời điểm và cách bạn nhận thông báo hệ thống" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'alerts', label: 'Cảnh báo Bảo mật', desc: 'Thông báo ngay lập tức cho các phát hiện độ tin cậy cao và sự kiện bảo mật' },
                { key: 'reports', label: 'Tạo Báo cáo', desc: 'Thông báo khi báo cáo theo lịch đã sẵn sàng để tải xuống' },
                { key: 'processing', label: 'Xử lý Hoàn tất', desc: 'Cảnh báo khi pipeline xử lý video kết thúc' },
                { key: 'weekly', label: 'Tóm tắt Hàng tuần', desc: 'Bản tóm tắt hàng tuần về hoạt động hệ thống và các điều tra hàng đầu' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{desc}</div>
                  </div>
                  <ToggleSwitch checked={notifications[key as keyof typeof notifications]} onChange={v => setNotifications(prev => ({ ...prev, [key]: v }))} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div>
            <SectionHeader title="Cài đặt Bảo mật" desc="Quản lý khóa API, xác thực và kiểm soát truy cập" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Xác thực Hai yếu tố', desc: '2FA đã bật qua ứng dụng xác thực', enabled: true },
                { label: 'Cấu hình SSO', desc: 'Microsoft Azure AD đã kết nối', enabled: true },
                { label: 'Quản lý Khóa API', desc: '3 khóa API đang hoạt động', enabled: false },
                { label: 'Nhật ký Kiểm toán', desc: 'Tất cả hành động được ghi lại trong 90 ngày', enabled: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: '#f8fafc', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Key size={15} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.desc}</div>
                    </div>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                    Quản lý <ChevronRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'system':
        return (
          <div>
            <SectionHeader title="Thông tin Hệ thống" desc="Chi tiết kỹ thuật về cài đặt VisionScope AI của bạn" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
              {[
                { icon: Zap, label: 'Phiên bản Nền tảng', value: 'VisionScope AI v3.2.1' },
                { icon: Cpu, label: 'Bộ máy Xử lý', value: 'NVIDIA A100 × 4 GPU' },
                { icon: Server, label: 'Cơ sở dữ liệu Vector', value: 'Milvus 2.4.0' },
                { icon: Database, label: 'Dung lượng Đã dùng', value: '1,2 TB / 10 TB' },
                { icon: Brain, label: 'Mô hình Đang hoạt động', value: 'CLIP ViT-L/14 + YOLOv8x' },
                { icon: Globe, label: 'Điểm cuối API', value: 'api.visionscope.internal' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ padding: '16px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, background: 'rgba(59,130,246,0.08)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 20px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Tất cả hệ thống hoạt động bình thường · Thời gian hoạt động: 99,97% (30 ngày)</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '32px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#0f172a', marginBottom: 4, letterSpacing: '-0.03em' }}>Cài đặt</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Cấu hình các tùy chọn nền tảng VisionScope AI</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: '#f1f5f9', borderRadius: 10 }}>
            {[
              { t: 'light', label: 'Sáng', icon: Sun },
              { t: 'dark', label: 'Tối', icon: Moon },
            ].map(({ t, label, icon: Icon }) => (
              <button key={t} onClick={() => setTheme(t)} style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: theme === t ? 'white' : 'transparent', cursor: 'pointer', color: theme === t ? '#334155' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: theme === t ? 500 : 400, boxShadow: theme === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 9, background: 'white', fontSize: 13, color: '#334155', cursor: 'pointer', outline: 'none' }}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ ...CARD, padding: '8px' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', borderRadius: 9, border: 'none', background: activeTab === id ? 'rgba(59,130,246,0.08)' : 'transparent', color: activeTab === id ? '#3b82f6' : '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === id ? 600 : 400, textAlign: 'left', marginBottom: 2 }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...CARD, padding: 28 }}>
          {renderContent()}
          {activeTab !== 'system' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                style={{ padding: '11px 28px', background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(59,130,246,0.3)', transition: 'background 0.2s' }}
              >
                {saved ? <><CheckCircle size={16} /> Đã lưu!</> : 'Lưu thay đổi'}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
