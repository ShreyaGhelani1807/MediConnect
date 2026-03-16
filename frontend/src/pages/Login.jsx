import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity, Mail, Lock, Eye, EyeOff, ArrowRight,
  Stethoscope, User, AlertCircle, CheckCircle, Zap, Shield
} from 'lucide-react';

const P = {
  navy: '#0B2545', navyLt: '#13356B',
  teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF',
  ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  coral: '#E8604C', blue: '#3B82F6', emerald: '#059669',
  error: '#EF4444',
};

const ease = [0.22, 1, 0.36, 1];


function Input({ icon: Icon, label, type = 'text', value, onChange, placeholder, error, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: P.ink }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: focused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)', border: `1.5px solid ${error ? P.error : focused ? P.teal : 'rgba(0,0,0,0.07)'}`, transition: 'all 0.3s', backdropFilter: 'blur(8px)' }}>
        <Icon size={15} color={focused ? P.teal : P.muted} style={{ flexShrink: 0, transition: 'color 0.3s' }} />
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: P.ink, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }} />
        {suffix}
      </div>
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertCircle size={11} color={P.error} />
          <span style={{ fontSize: 11, color: P.error, fontWeight: 600 }}>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

function RoleToggle({ role, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: 4 }}>
      {[{ value: 'patient', label: 'Patient', icon: User }, { value: 'doctor', label: 'Doctor', icon: Stethoscope }].map(({ value, label, icon: Icon }) => {
        const active = role === value;
        return (
          <motion.button key={value} onClick={() => onChange(value)} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 700, background: active ? `linear-gradient(135deg, ${P.teal}, ${P.tealDk})` : 'transparent', color: active ? 'white' : P.muted, boxShadow: active ? '0 4px 16px rgba(13,196,161,0.25)' : 'none', transition: 'all 0.3s' }}>
            <Icon size={14} />{label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function Login() {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [role,     setRole]     = useState('patient');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [fieldErr, setFieldErr] = useState({});
  const [pendingStatus, setPendingStatus]   = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (role === 'patient') { setEmail('testpatient@gmail.com'); setPassword('Test@123'); }
    else                    { setEmail('rajesh.sharma@mediconnect.com'); setPassword('Doctor@123'); }
    setError(''); setFieldErr({});
  }, [role]);

  const validate = () => {
    const e = {};
    if (!email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setError('');
    try {
      const user = await login(email, password);

if (user.role === 'doctor') {
  if (user.verificationStatus === 'pending') {
    setPendingStatus('pending');
    return;
  }
  if (user.verificationStatus === 'rejected') {
    setPendingStatus('rejected');
    setRejectionReason(user.rejectionReason || '');
    return;
  }
  navigate('/doctor/dashboard');
} else {
  navigate('/dashboard');
}
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Doctor status screen — shown instead of redirecting
if (pendingStatus) {
  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: 16 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          maxWidth: 460, width: '100%', textAlign: 'center',
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)',
          borderRadius: 24, padding: '48px 36px',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 40px rgba(11,37,69,0.08)'
        }}
      >
        {pendingStatus === 'pending' ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🕐</div>
            <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: '#0B2545' }}>
              Account Under Review
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>
              Your doctor application is being reviewed by our admin team.
              Approval takes up to <strong>12 hours</strong>.
              You'll receive your new MediConnect credentials by email once approved.
            </p>
            <div style={{ background: 'rgba(13,196,161,0.06)', borderRadius: 12, padding: '16px', border: '1px solid rgba(13,196,161,0.2)', textAlign: 'left', marginBottom: 24 }}>
              {[
                '📧 Check your registered email for updates',
                '⏱️ Typical review time: 2–12 hours',
                '🔐 New login credentials will be emailed to you',
              ].map(t => <p key={t} style={{ margin: '0 0 6px', fontSize: 12, color: '#374151' }}>{t}</p>)}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
            <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: '#0B2545' }}>
              Application Rejected
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>
              Unfortunately your application was not approved.
            </p>
            {rejectionReason && (
              <div style={{ background: 'rgba(232,96,76,0.06)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(232,96,76,0.2)', textAlign: 'left', marginBottom: 24 }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#E8604C', textTransform: 'uppercase' }}>Reason</p>
                <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>{rejectionReason}</p>
              </div>
            )}
            <p style={{ margin: '0 0 24px', fontSize: 12, color: '#64748B' }}>
              You may re-register with updated credentials and a valid degree certificate.
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPendingStatus(null)} style={{
            flex: 1, padding: '11px', borderRadius: 11,
            border: '1.5px solid rgba(11,37,69,0.15)',
            background: 'transparent', color: '#64748B',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
          }}>← Back to Login</button>
          {pendingStatus === 'rejected' && (
            <Link to="/register" style={{
              flex: 1, padding: '11px', borderRadius: 11, border: 'none',
              background: 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>Re-apply →</Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', display: 'flex', background: P.sky, overflow: 'hidden', position: 'relative' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-10%', left: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,196,161,0.07), transparent 65%)', filter: 'blur(60px)' }} />
        <motion.div animate={{ y: [0, 25, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: '-10%', right: '0%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 65%)', filter: 'blur(70px)' }} />
      </div>

      {/* LEFT PANEL */}
      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: ease }}
        style={{ width: '42%', background: `linear-gradient(150deg, ${P.navy}, ${P.navyLt})`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 56px', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', bottom: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,196,161,0.1), transparent 65%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.6 }}
            style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${P.teal}, ${P.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(13,196,161,0.35)' }}>
            <Activity size={18} color="white" />
          </motion.div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: '-0.5px' }}>
            Medi<span style={{ color: P.teal }}>Connect</span>
          </span>
        </div>

        <div style={{ width: 36, height: 3, background: P.teal, borderRadius: 2, marginBottom: 24 }} />
        <h1 style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-2.5px', lineHeight: 1.08, margin: '0 0 16px' }}>Welcome<br />back.</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 48, maxWidth: 300 }}>
          Sign in to access AI-powered symptom analysis and connect with the right doctor.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { icon: Zap,         color: P.teal,    text: 'AI symptom analysis in seconds'  },
            { icon: CheckCircle, color: P.emerald, text: 'Matched to the right specialist' },
            { icon: Shield,      color: P.blue,    text: 'Emergency red flag detection'    },
          ].map(({ icon: Icon, color, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 56 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>Don't have an account?</p>
          <Link to="/register" style={{ fontSize: 14, fontWeight: 700, color: P.teal, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            Create free account <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 56px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: ease }}
          style={{ width: '100%', maxWidth: 440 }}>

          <div style={{ borderRadius: 28, padding: '44px 40px', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 24px 80px -12px rgba(11,37,69,0.12)' }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: P.navy, letterSpacing: '-1px', margin: '0 0 6px' }}>Sign in</h2>
              <p style={{ fontSize: 13, color: P.muted, margin: 0 }}>Choose your role to continue</p>
            </div>

            <div style={{ marginBottom: 24 }}><RoleToggle role={role} onChange={setRole} /></div>

            <motion.div key={role} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginBottom: 24, padding: '10px 14px', borderRadius: 12, background: `${P.teal}08`, border: `1px solid ${P.teal}18`, display: 'flex', alignItems: 'center', gap: 9 }}>
              <Zap size={13} color={P.teal} />
              <span style={{ fontSize: 12, color: P.teal, fontWeight: 600 }}>
                Demo: {role === 'patient' ? 'testpatient@gmail.com' : 'rajesh.sharma@mediconnect.com'}
              </span>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
              <Input icon={Mail} label="Email address" type="email" value={email}
                onChange={e => { setEmail(e.target.value); setFieldErr(f => ({ ...f, email: '' })); }}
                placeholder="you@example.com" error={fieldErr.email} />
              <Input icon={Lock} label="Password" type={showPass ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setFieldErr(f => ({ ...f, password: '' })); }}
                placeholder="Enter your password" error={fieldErr.password}
                suffix={
                  <button onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: P.muted }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                } />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <AlertCircle size={14} color={P.error} />
                  <span style={{ fontSize: 13, color: P.error, fontWeight: 600 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', background: loading ? `${P.teal}80` : `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontFamily: "'Inter', system-ui, sans-serif", boxShadow: '0 8px 28px rgba(13,196,161,0.28)', transition: 'all 0.3s' }}>
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Signing in…
                </>
              ) : <>Sign in <ArrowRight size={16} strokeWidth={2.5} /></>}
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
              <span style={{ fontSize: 11, color: P.muted, fontWeight: 600 }}>NEW HERE?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            </div>

            <Link to="/register" style={{ textDecoration: 'none', display: 'block' }}>
              <motion.div whileHover={{ y: -2 }}
                style={{ padding: '13px', borderRadius: 16, border: `1.5px solid rgba(13,196,161,0.18)`, background: 'rgba(13,196,161,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: P.navy, fontSize: 14, fontWeight: 700 }}>
                Create free account <ArrowRight size={15} />
              </motion.div>
            </Link>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
            <Link to="/" style={{ color: P.muted, textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => e.target.style.color = P.teal}
              onMouseLeave={e => e.target.style.color = P.muted}>
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}