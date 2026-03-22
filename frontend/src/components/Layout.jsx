import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity, LayoutDashboard, Brain, Calendar, User,
  LogOut, Menu, X, ChevronRight, Bell, Pill, BarChart2
} from 'lucide-react';

const P = {
  navy: '#0B2545', navyLt: '#13356B',
  teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF', white: '#FFFFFF',
  ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  border: 'rgba(0,0,0,0.06)',
};

const PATIENT_NAV = [
  { label: 'Dashboard',        icon: LayoutDashboard, path: '/dashboard'          },
  { label: 'Symptom Analysis', icon: Brain,           path: '/symptoms'           },
  { label: 'My Appointments',  icon: Calendar,        path: '/appointments'       },
  { label: 'Prescriptions',    icon: Pill,            path: '/prescriptions'      },
  { label: 'Profile',          icon: User,            path: '/profile'            },
];

const DOCTOR_NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/doctor/dashboard'    },
  { label: 'Appointments',  icon: Calendar,        path: '/doctor/appointments' },
  { label: 'Profile',       icon: User,            path: '/doctor/profile'      },
  { label: 'Analytics',     icon: BarChart2,       path: '/doctor/analytics'    },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const nav = user?.role === 'doctor' ? DOCTOR_NAV : PATIENT_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--mc-sky)', fontFamily: 'var(--font-sans)' }}>

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: `linear-gradient(180deg, ${P.navy} 0%, ${P.navyLt} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(11, 37, 69, 0.25)',
        }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 16px' : '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${P.teal}, #3B82F6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Activity size={15} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>
                  Medi<span style={{ color: P.teal }}>Connect</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${P.teal}, #3B82F6)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={15} color="white" />
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', padding: 4, borderRadius: 6, marginLeft: collapsed ? 'auto' : 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ x: 2 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: collapsed ? '10px 12px' : '10px 14px', borderRadius: 12, background: active ? `${P.teal}18` : 'transparent', border: `1px solid ${active ? P.teal + '30' : 'transparent'}`, transition: 'all 0.2s', cursor: 'pointer', overflow: 'hidden' }}>
                  <Icon size={17} color={active ? P.teal : 'rgba(255,255,255,0.45)'} style={{ flexShrink: 0 }} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'white' : 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && !collapsed && <ChevronRight size={13} color={P.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '10px 10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {!collapsed && (
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          )}
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: collapsed ? '10px 12px' : '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,96,76,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={17} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ paddingLeft: collapsed ? 68 : 240, flex: 1, transition: 'padding-left 0.3s cubic-bezier(0.22,1,0.36,1)', display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>

        {/* Top bar */}
        <header style={{ height: 64, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 8px 24px rgba(11, 37, 69, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} color={P.sub} />
            </button>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '36px 32px 40px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}