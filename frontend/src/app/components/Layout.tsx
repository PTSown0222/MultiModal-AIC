import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Video, Search, History, BarChart2, Settings,
  Scan, Bell, ChevronDown, LogOut, Upload, Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/library', label: 'Thư viện Video', icon: Video },
  { path: '/search', label: 'Tìm kiếm Ngữ nghĩa', icon: Sparkles },
  { path: '/history', label: 'Lịch sử Điều tra', icon: History },
  { path: '/reports', label: 'Báo cáo', icon: BarChart2 },
  { path: '/settings', label: 'Cài đặt', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/search' && (location.pathname === '/search' || location.pathname === '/results' || location.pathname.startsWith('/video'))) return true;
    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: '#f0f7ff', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        minWidth: 260,
        background: 'linear-gradient(160deg, #06061e 0%, #12095e 35%, #1e0a6e 60%, #06061e 100%)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '4px 0 32px rgba(99,20,200,0.4)',
        zIndex: 10,
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(139,92,246,0.55)',
            }}>
              <Scan size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>VisionScope AI</div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.7)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Nền tảng Doanh nghiệp</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(196,181,253,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>Điều hướng</div>
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: active ? '#e9d5ff' : 'rgba(196,181,253,0.65)',
                  background: active ? 'rgba(139,92,246,0.25)' : 'transparent',
                  borderLeft: active ? '2px solid #a78bfa' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '-0.01em',
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}

          <div style={{ marginTop: 24, height: 1, background: 'rgba(139,92,246,0.2)' }} />
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(196,181,253,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 12px 8px' }}>Thao tác nhanh</div>
          <button
            onClick={() => navigate('/upload')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              border: '1px solid rgba(167,139,250,0.35)',
              background: 'rgba(139,92,246,0.15)',
              color: '#ddd6fe', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              width: '100%', textAlign: 'left',
            }}
          >
            <Upload size={16} />
            Tải lên Video
          </button>
        </nav>

        {/* User profile */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(139,92,246,0.12)', cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 600 }}>JD</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#e9d5ff', fontWeight: 500 }}>James Davis</div>
              <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.6)' }}>Quản trị viên</div>
            </div>
            <LogOut size={14} color="rgba(196,181,253,0.5)" style={{ cursor: 'pointer' }} onClick={() => navigate('/')} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 64, background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 32px', gap: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f1f5f9', borderRadius: 8, cursor: 'pointer' }}>
            <Search size={14} color="#94a3b8" />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Tìm kiếm nhanh...</span>
            <span style={{ fontSize: 11, color: '#cbd5e1', background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>⌘K</span>
          </div>
          <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#64748b' }}>
            <Bell size={18} />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, background: '#f8fafc' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 600 }}>JD</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>James Davis</span>
            <ChevronDown size={14} color="#94a3b8" />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', background: '#f0f7ff' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
