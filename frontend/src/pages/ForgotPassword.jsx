import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import {
  Activity, Mail, ArrowRight, AlertCircle, CheckCircle, Zap, Shield
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]    = useState('');
  const [loading, setLoading]  = useState(false);
  const [error, setError]    = useState('');
  const [fieldErr, setFieldErr] = useState({});
  const [success, setSuccess]  = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFieldErr({ email: 'Enter a valid email' });
      return;
    }
    setLoading(true); setError(''); setFieldErr({});
    try {
      await authAPI.forgotPassword({ email });
    } catch (err) {
      // Ignore error to prevent mapping emails
    } finally {
      setSuccess(true);
      setLoading(false);
    }
  };

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
        <h1 style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-2.5px', lineHeight: 1.08, margin: '0 0 16px' }}>Password<br />recovery.</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 48, maxWidth: 300 }}>
          Enter your email address to receive a temporary password.
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
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>Remember your password?</p>
          <Link to="/login" style={{ fontSize: 14, fontWeight: 700, color: P.teal, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            Back to Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 56px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: ease }}
          style={{ width: '100%', maxWidth: 440 }}>

          <div style={{ borderRadius: 28, padding: '44px 40px', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 24px 80px -12px rgba(11,37,69,0.12)' }}>
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${P.teal}15`, border: `2px solid ${P.teal}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Mail size={32} color={P.teal} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: P.navy, letterSpacing: '-1px', margin: '0 0 12px' }}>Check your inbox</h2>
                <p style={{ fontSize: 14, color: P.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
                  If an account exists for that email, we've sent a temporary password.
                </p>
                <Link to="/login" style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 8px 28px rgba(13,196,161,0.28)' }}>
                  Return to Login
                </Link>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: P.navy, letterSpacing: '-1px', margin: '0 0 6px' }}>Reset Password</h2>
                  <p style={{ fontSize: 13, color: P.muted, margin: 0 }}>We'll send you a temporary password</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                  <Input icon={Mail} label="Email address" type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setFieldErr(f => ({ ...f, email: '' })); }}
                    placeholder="you@example.com" error={fieldErr.email} />
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
                      Sending...
                    </>
                  ) : <>Send Temporary Password</>}
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
