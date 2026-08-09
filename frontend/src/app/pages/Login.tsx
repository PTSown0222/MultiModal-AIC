import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Scan } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => navigate('/dashboard'), 800);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: 'white' }}>
      {/* Left: Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '46%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '48px 64px',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(59,130,246,0.35)' }}>
              <Scan size={22} color="white" />
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
              VisionScope AI
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, letterSpacing: '0.02em' }}>Hệ thống Truy xuất Video Ngữ nghĩa Không-Thời gian</p>
        </div>

        {/* Heading */}
        <div style={{ width: '100%', maxWidth: 400, marginBottom: 32 }}>
          <h1 style={{ color: '#0f172a', marginBottom: 6, letterSpacing: '-0.03em' }}>Chào mừng trở lại</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>Đăng nhập để truy cập nền tảng điều tra của bạn</p>
        </div>

        {/* Form */}
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 7, color: '#334155', fontSize: 14 }}>Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ten@congty.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', fontSize: 14, background: '#f8fafc', boxSizing: 'border-box', color: '#0f172a', transition: 'border-color 0.15s' }}
              onFocus={e => (e.target.style.borderColor = '#3b82f6')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 7, color: '#334155', fontSize: 14 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ width: '100%', padding: '12px 48px 12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', fontSize: 14, background: '#f8fafc', boxSizing: 'border-box', color: '#0f172a' }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#64748b' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ cursor: 'pointer', accentColor: '#3b82f6' }} />
              Ghi nhớ đăng nhập
            </label>
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3b82f6', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Quên mật khẩu?</button>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '13px', border: 'none', borderRadius: 10, cursor: 'pointer',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 20,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
              transition: 'background 0.2s',
              letterSpacing: '-0.01em',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập VisionScope AI'}
          </motion.button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ padding: '0 14px', color: '#94a3b8', fontSize: 13 }}>hoặc tiếp tục với</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* SSO Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              {
                label: 'Microsoft',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                ),
              },
              {
                label: 'Google',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.01, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                onClick={handleLogin}
                style={{
                  flex: 1, padding: '11px', border: '1.5px solid #e2e8f0', borderRadius: 10,
                  background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#334155',
                }}
              >
                {icon}
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right: Illustration */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #0f0c29 0%, #1e1b4b 35%, #312e81 65%, #1e1b4b 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: 'linear-gradient(rgba(165,180,252,1) 1px, transparent 1px), linear-gradient(90deg, rgba(165,180,252,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glowing orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '25%', right: '20%', width: 160, height: 160, background: 'radial-gradient(circle, rgba(14,165,233,0.3), transparent 70%)', borderRadius: '50%' }} />

        {/* Central video analysis visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ position: 'relative', width: 440, height: 340, zIndex: 2 }}
        >
          {/* Main video frame */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 320, height: 200, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(165,180,252,0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            {/* Video content gradient */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d1b2e, #0a2a5e)' }} />
            {/* Scan line animation */}
            <motion.div
              animate={{ y: [0, 200, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }}
            />
            {/* Bounding boxes */}
            <div style={{ position: 'absolute', top: 40, left: 30, width: 80, height: 100, border: '1.5px solid #93c5fd', borderRadius: 4 }}>
              <div style={{ position: 'absolute', top: -20, left: 0, background: 'rgba(59,130,246,0.9)', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: 'white', whiteSpace: 'nowrap' }}>Person 94%</div>
            </div>
            <div style={{ position: 'absolute', top: 60, right: 40, width: 100, height: 60, border: '1.5px solid #34d399', borderRadius: 4 }}>
              <div style={{ position: 'absolute', top: -20, left: 0, background: 'rgba(16,185,129,0.9)', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: 'white', whiteSpace: 'nowrap' }}>Vehicle 87%</div>
            </div>
            {/* Corner brackets */}
            {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }].map((pos, i) => (
              <div key={i} style={{ position: 'absolute', ...pos, width: 16, height: 16, borderColor: 'rgba(165,180,252,0.8)', borderStyle: 'solid', borderWidth: 0, ...(i === 0 ? { borderTopWidth: 2, borderLeftWidth: 2 } : i === 1 ? { borderTopWidth: 2, borderRightWidth: 2 } : i === 2 ? { borderBottomWidth: 2, borderLeftWidth: 2 } : { borderBottomWidth: 2, borderRightWidth: 2 }) }} />
            ))}
          </div>

          {/* Floating info cards */}
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: 10, right: 20, background: 'rgba(59,130,246,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(165,180,252,0.3)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: 'rgba(165,180,252,0.7)', marginBottom: 4 }}>SIMILARITY SCORE</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#93c5fd' }}>96.4%</div>
          </motion.div>

          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} style={{ position: 'absolute', bottom: 30, left: 10, background: 'rgba(14,165,233,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(196,181,253,0.3)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: 'rgba(196,181,253,0.7)', marginBottom: 4 }}>OBJECTS DETECTED</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#c4b5fd' }}>12</div>
          </motion.div>

          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} style={{ position: 'absolute', bottom: 20, right: 30, background: 'rgba(16,185,129,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: 'rgba(52,211,153,0.7)', marginBottom: 4 }}>INDEXED VIDEOS</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>12.8K</div>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', zIndex: 2, marginTop: 32 }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>Trí tuệ Video được hỗ trợ bởi AI</div>
          <div style={{ fontSize: 15, color: 'rgba(148,163,184,0.8)', maxWidth: 320 }}>Tìm kiếm ngữ nghĩa qua hàng nghìn luồng video trong mili giây</div>
        </motion.div>

        {/* Bottom dots indicator */}
        <div style={{ position: 'absolute', bottom: 32, display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: i === 0 ? 24 : 8, height: 8, borderRadius: 4, background: i === 0 ? '#3b82f6' : 'rgba(165,180,252,0.3)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
