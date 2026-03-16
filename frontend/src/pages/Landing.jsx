import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Heart, Brain, Eye, Bone, Baby, Stethoscope, Activity, ArrowRight,
  Star, MapPin, CheckCircle, AlertTriangle, Zap, Shield,
  Search, CalendarCheck, ChevronRight, Users, TrendingUp
} from 'lucide-react';

/* ═══ PALETTE ═══ */
const P = {
  navy: '#0B2545', navyLt: '#13356B', navyDk: '#071A33',
  teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF', ice: '#E8F4FD', mint: '#F0FDFA',
  ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  coral: '#E8604C', amber: '#F4A261', gold: '#E9C46A',
  violet: '#7C3AED', blue: '#3B82F6', emerald: '#059669',
};

/* ═══ ANIMATED HEARTBEAT ═══ */
function Heartbeat({ color = P.teal, w = 180 }) {
  return (
    <svg width={w} height={w * 0.2} viewBox="0 0 180 36" fill="none">
      <motion.path
        d="M0,18 L35,18 L48,4 L54,32 L60,8 L66,28 L72,18 L110,18 L122,6 L128,30 L134,12 L140,24 L146,18 L180,18"
        stroke={color} strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/* ═══ LIVE AI DEMO ═══ */
const DEMOS = [
  {
    symptom: "Dull chest ache for 3 days, radiating to left arm, breathless on stairs...",
    spec: "Cardiologist", urg: "Urgent", uC: P.coral, flags: ["Chest radiation", "3+ days", "Exertional"], conf: 94,
    doctors: [
      { name: 'Dr. Ananya Sharma', rating: 4.9, exp: '14 yrs', avail: 'Today 4:30 PM', phone: '+91 98765 43210', color: P.coral },
      { name: 'Dr. Vikram Patel', rating: 4.7, exp: '11 yrs', avail: 'Tomorrow 10 AM', phone: '+91 91234 56789', color: P.amber },
    ],
  },
  {
    symptom: "Severe headache behind eyes, sensitive to light, nausea since morning...",
    spec: "Neurologist", urg: "Soon", uC: P.amber, flags: ["Light sensitivity", "Nausea", "High severity"], conf: 88,
    doctors: [
      { name: 'Dr. Priya Nair', rating: 4.8, exp: '9 yrs', avail: 'Today 6:00 PM', phone: '+91 87654 32100', color: P.violet },
      { name: 'Dr. Rohit Menon', rating: 4.6, exp: '12 yrs', avail: 'Wed 11:30 AM', phone: '+91 99876 54321', color: P.blue },
    ],
  },
  {
    symptom: "Knee swells after walking, painful going up stairs, 2 weeks now...",
    spec: "Orthopedist", urg: "Routine", uC: P.teal, flags: ["Joint swelling", "2 week duration"], conf: 91,
    doctors: [
      { name: 'Dr. Sanjay Kulkarni', rating: 4.9, exp: '16 yrs', avail: 'Thu 9:00 AM', phone: '+91 90123 45678', color: P.teal },
      { name: 'Dr. Meera Joshi', rating: 4.5, exp: '8 yrs', avail: 'Fri 3:00 PM', phone: '+91 88765 43210', color: P.emerald },
    ],
  },
];

function AiDemo() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    const s = DEMOS[idx].symptom;
    let t;
    if (phase === 'typing') {
      t = typed.length < s.length
        ? setTimeout(() => setTyped(s.slice(0, typed.length + 1)), 20)
        : setTimeout(() => setPhase('analyzing'), 500);
    } else if (phase === 'analyzing') {
      t = setTimeout(() => setPhase('result'), 1400);
    } else if (phase === 'result') {
      t = setTimeout(() => setPhase('doctors'), 2200);
    } else {
      t = setTimeout(() => {
        setPhase('typing');
        setTyped('');
        setIdx((i) => (i + 1) % DEMOS.length);
      }, 3500);
    }
    return () => clearTimeout(t);
  }, [typed, phase, idx]);

  const d = DEMOS[idx];

  return (
    <div style={{
      width: '100%', maxWidth: 400, borderRadius: 28, overflow: 'hidden',
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid rgba(13,196,161,0.08)',
      boxShadow: '0 40px 100px -20px rgba(11,37,69,0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: P.teal, boxShadow: '0 0 8px ' + P.teal }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: P.ink, letterSpacing: '-0.2px' }}>AI Symptom Analysis</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: '50%', background: P.coral }} />
      </div>
      <div style={{ padding: '18px 20px 12px' }}>
        <div style={{
          borderRadius: 16, padding: '14px 16px', minHeight: 56,
          background: 'linear-gradient(135deg, rgba(240,247,255,0.8), rgba(240,253,250,0.5))',
          border: '1px solid ' + (phase === 'typing' ? 'rgba(13,196,161,0.25)' : 'rgba(0,0,0,0.04)'),
          transition: 'all 0.4s',
        }}>
          <p style={{ fontSize: 12.5, color: P.ink, lineHeight: 1.65, margin: 0 }}>
            {typed}
            {phase === 'typing' && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ display: 'inline-block', width: 2, height: 14, background: P.teal, marginLeft: 2, verticalAlign: 'middle', borderRadius: 1 }}
              />
            )}
          </p>
        </div>
      </div>
      <div style={{ minHeight: 150, padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {phase === 'analyzing' && (
            <motion.div key="an" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ y: [-4, 4, -4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.blue + ')' }} />
                ))}
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: P.sub }}>Processing symptom patterns…</p>
            </motion.div>
          )}
          {phase === 'result' && (
            <motion.div key="re" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
              <div style={{
                borderRadius: 16, padding: '16px', marginBottom: 12,
                background: 'linear-gradient(135deg, ' + P.navy + ', ' + P.navyLt + ')',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(13,196,161,0.15)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Recommended Specialist</p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', margin: 0 }}>{d.spec}</p>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 8, background: d.uC + '20', border: '1px solid ' + d.uC + '35' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: d.uC, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.urg}</span>
                  </div>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: d.conf + '%' }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, ' + P.teal + ', ' + P.blue + ')' }} />
                </div>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4, textAlign: 'right' }}>{d.conf}% confidence</p>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {d.flags.map((f) => (
                  <span key={f} style={{ fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(232,96,76,0.06)', color: P.coral, border: '1px solid rgba(232,96,76,0.1)' }}>⚠ {f}</span>
                ))}
              </div>
            </motion.div>
          )}
          {phase === 'doctors' && (
            <motion.div key="doc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: P.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Nearby {d.spec}s</p>
                <span style={{ fontSize: 9, color: P.muted, fontWeight: 600 }}>{d.doctors.length} found near you</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.doctors.map((doc, i) => (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.35 }}
                    style={{
                      borderRadius: 14, padding: '12px 14px',
                      background: 'linear-gradient(135deg, rgba(240,247,255,0.7), rgba(255,255,255,0.9))',
                      border: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 11,
                        background: 'linear-gradient(135deg, ' + doc.color + ', ' + doc.color + 'aa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 900, color: 'white', flexShrink: 0,
                      }}>
                        {doc.name.split(' ')[1][0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: P.ink, margin: '0 0 2px', letterSpacing: '-0.2px' }}>{doc.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Star size={9} fill={P.amber} color={P.amber} />
                            <span style={{ fontSize: 9, fontWeight: 700, color: P.sub }}>{doc.rating}</span>
                          </div>
                          <span style={{ fontSize: 9, color: P.muted }}>·</span>
                          <span style={{ fontSize: 9, color: P.muted, fontWeight: 600 }}>{doc.exp}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarCheck size={10} color={P.emerald} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: P.emerald }}>{doc.avail}</span>
                      </div>
                      <span style={{ fontSize: 9, color: P.muted, fontWeight: 600 }}>{doc.phone}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button style={{
                width: '100%', padding: '9px', borderRadius: 10, border: 'none', marginTop: 10,
                background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.tealDk + ')',
                color: 'white', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(13,196,161,0.25)',
              }}>
                Book appointment <ArrowRight size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══ LANDING PAGE ═══ */
export default function Landing() {
  const navigate = useNavigate();
  const words = ['symptoms.', 'pain.', 'concerns.', 'health.'];
  const [wI, setWI] = useState(0);
  const [wT, setWT] = useState('');
  const [wD, setWD] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const w = words[wI];
    let t;
    if (!wD && wT.length < w.length) {
      t = setTimeout(() => setWT(w.slice(0, wT.length + 1)), 80);
    } else if (!wD && wT.length === w.length) {
      t = setTimeout(() => setWD(true), 1800);
    } else if (wD && wT.length > 0) {
      t = setTimeout(() => setWT(wT.slice(0, -1)), 45);
    } else {
      setWD(false);
      setWI((wI + 1) % words.length);
    }
    return () => clearTimeout(t);
  }, [wT, wD, wI]);

  const ease = [0.22, 1, 0.36, 1];

  return (
    <div style={{ fontFamily: "'Inter', 'Sora', system-ui, sans-serif", background: P.sky, overflowX: 'hidden', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-5%', left: '10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,196,161,0.06), transparent 65%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -25, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', top: '30%', right: '-8%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05), transparent 65%)', filter: 'blur(70px)' }}
        />
        <motion.div
          animate={{ y: [0, -35, 0], x: [0, 15, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{ position: 'absolute', bottom: '-10%', left: '35%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.04), transparent 65%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: ease }}
        style={{
          position: 'fixed', top: 12, left: 24, right: 24, zIndex: 200, height: 56,
          borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between',
          background: scrolled ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid ' + (scrolled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'),
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.04)' : 'none',
          transition: 'all 0.5s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6 }}
            style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.blue + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(13,196,161,0.3)' }}
          >
            <Activity size={16} color="white" />
          </motion.div>
          <span style={{ fontWeight: 800, fontSize: 17, color: P.navy, letterSpacing: '-0.5px' }}>
            Medi<span style={{ color: P.teal }}>Connect</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Features', 'How it works', 'Doctors'].map((l) => (
            <a key={l} href={'#' + l.toLowerCase().replace(/\s/g, '-')}
              style={{ fontSize: 13, fontWeight: 600, color: P.sub, textDecoration: 'none', padding: '6px 14px', borderRadius: 10, transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(13,196,161,0.06)'; e.currentTarget.style.color = P.teal; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.sub; }}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ fontSize: 13, fontWeight: 700, color: P.navy, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 10, fontFamily: 'inherit' }}
          >Sign in</button>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/register')}
            style={{ fontSize: 13, fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.tealDk + ')', border: 'none', padding: '9px 22px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(13,196,161,0.3)' }}
          >Get Started</motion.button>
        </div>
      </motion.nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden', zIndex: 1 }}>
        {/* Rotating ring */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(13,196,161,0.04)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '100px 56px 100px', width: '100%', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: ease }}>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease: ease }}
              style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.02, letterSpacing: '-3.5px', color: P.navy, margin: '0 0 8px' }}>
              Describe your
            </motion.h1>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9, ease: ease }}
              style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.02, letterSpacing: '-3.5px', margin: '0 0 8px', minHeight: 68 }}>
              <span style={{ background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.blue + ')', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{wT}</span>
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                style={{ display: 'inline-block', width: 4, height: 52, background: 'linear-gradient(180deg, ' + P.teal + ', ' + P.blue + ')', marginLeft: 5, verticalAlign: 'baseline', borderRadius: 2 }} />
            </motion.h1>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: ease }}
              style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.02, letterSpacing: '-3.5px', color: P.navy, margin: '0 0 36px' }}>
              We find your doctor.
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
              style={{ fontSize: 17, color: P.sub, lineHeight: 1.8, marginBottom: 48, maxWidth: 500, fontWeight: 400 }}>
              Not a directory. Our AI analyzes your exact symptom pattern, detects urgency, identifies red flags, and finds the right specialist near you.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}
              style={{ display: 'flex', gap: 12, marginBottom: 64 }}>
              <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.tealDk + ')', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 30px rgba(13,196,161,0.3)' }}>
                Start free consultation <ArrowRight size={16} strokeWidth={2.5} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                style={{ padding: '16px 28px', borderRadius: 16, border: '1.5px solid rgba(13,196,161,0.15)', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', color: P.navy, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.4s' }}>
                Sign in
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex' }}>
                {[P.teal, P.blue, P.violet, P.coral].map((c, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, ' + c + ', ' + c + 'cc)', border: '2.5px solid white', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {['S', 'P', 'R', 'A'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={12} fill={P.amber} color={P.amber} />)}
                </div>
                <p style={{ fontSize: 12, color: P.sub, fontWeight: 500 }}><span style={{ fontWeight: 800, color: P.navy }}>2,400+</span> patients trust us</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Demo + floating cards */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: ease }}
            style={{ position: 'relative' }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: -20, left: -40, zIndex: 10, padding: '12px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 12px 40px -10px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(13,196,161,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color={P.teal} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: P.navy, letterSpacing: '-0.5px', margin: 0 }}>12+</p>
                <p style={{ fontSize: 10, color: P.muted, fontWeight: 600, margin: 0 }}>Specializations</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{ position: 'absolute', bottom: 20, right: -30, zIndex: 10, padding: '12px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 12px 40px -10px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color={P.blue} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: P.navy, margin: 0 }}>Data Encrypted</p>
                <p style={{ fontSize: 10, color: P.muted, fontWeight: 600, margin: 0 }}>HIPAA Compliant</p>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <AiDemo />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{ padding: '120px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: 72 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: P.teal, textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: 16 }}>Features</span>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: P.navy, letterSpacing: '-2.5px', lineHeight: 1.08, margin: 0 }}>Built different.</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              style={{ borderRadius: 28, padding: '48px 44px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, ' + P.navy + ', ' + P.navyLt + ')', boxShadow: '0 24px 60px -12px rgba(11,37,69,0.25)' }}>
              <div style={{ position: 'absolute', bottom: -60, right: -40, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,196,161,0.12), transparent)' }} />
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(13,196,161,0.12)', border: '1px solid rgba(13,196,161,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                <Brain size={28} color={P.teal} />
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: 14, lineHeight: 1.15 }}>Multi-Symptom Pattern Recognition</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 420, marginBottom: 28 }}>The same chest pain means something different in a 25-year-old athlete vs a 55-year-old smoker. Context matters — our AI gets that.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Age-aware', 'Context-driven', 'Multi-pattern'].map((t) => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>{t}</span>
                ))}
              </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                style={{ borderRadius: 28, padding: '32px 28px', flex: 1, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(232,96,76,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <TrendingUp size={22} color={P.coral} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: P.navy, marginBottom: 12 }}>4-Level Urgency Detection</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[{ l: 'ER', c: '#DC2626' }, { l: 'Urgent', c: P.coral }, { l: 'Soon', c: P.amber }, { l: 'Routine', c: P.teal }].map(({ l, c }) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: c + '08' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: c }}>{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                style={{ borderRadius: 28, padding: '32px 28px', flex: 1, background: 'rgba(232,96,76,0.03)', border: '1px solid rgba(232,96,76,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(232,96,76,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={22} color={P.coral} />
                  </div>
                  <Heartbeat color={P.coral} w={100} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: P.navy, marginBottom: 8 }}>Emergency Detection</h3>
                <p style={{ fontSize: 13, color: P.sub, lineHeight: 1.6, margin: 0 }}>Life-threatening symptoms trigger instant emergency guidance.</p>
              </motion.div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: CheckCircle, color: P.violet, title: 'Smart Checklists', desc: 'AI-generated prep lists tailored to your symptoms and specialist.' },
              { icon: Search, color: P.blue, title: 'Doctor Matching', desc: 'Automatically matched to the right specialist for your condition.' },
              { icon: CalendarCheck, color: P.emerald, title: 'Instant Booking', desc: 'Real-time availability. Book with a single click.' },
            ].map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                style={{ borderRadius: 28, padding: '36px 30px', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '08', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: P.navy, marginBottom: 10, letterSpacing: '-0.3px' }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: P.sub, lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ padding: '120px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
            style={{ marginBottom: 72 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: P.teal, textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: 16 }}>How it works</span>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: P.navy, letterSpacing: '-2.5px', lineHeight: 1.08, margin: 0 }}>
              Three steps to <span style={{ color: P.teal }}>better care.</span>
            </h2>
          </motion.div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { n: '01', title: 'Describe', desc: 'Type symptoms in plain English. Just talk naturally.', icon: Search, c: P.teal },
              { n: '02', title: 'Analyze', desc: 'AI detects urgency, red flags, and generates recommendations.', icon: Zap, c: P.amber },
              { n: '03', title: 'Book', desc: 'See matched doctors with real-time slots. Confirm instantly.', icon: CalendarCheck, c: P.blue },
            ].map(({ n, title, desc, icon: Icon, c }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                style={{ flex: 1, borderRadius: 28, padding: '44px 36px', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                <span style={{ position: 'absolute', top: 20, right: 24, fontSize: 80, fontWeight: 900, lineHeight: 1, color: c + '08', letterSpacing: '-4px', userSelect: 'none' }}>{n}</span>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: c + '0a', border: '1px solid ' + c + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                  <Icon size={24} color={c} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: P.navy, letterSpacing: '-0.7px', marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: 14, color: P.sub, lineHeight: 1.75, margin: 0 }}>{desc}</p>
                {i < 2 && (
                  <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 28, height: 28, borderRadius: '50%', background: 'white', border: '1px solid ' + c + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                    <ChevronRight size={14} color={c} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOCTORS ═══ */}
      <section id="doctors" style={{ padding: '60px 56px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: P.teal, textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: 16 }}>Specializations</span>
              <h2 style={{ fontSize: 44, fontWeight: 900, color: P.navy, letterSpacing: '-2px', lineHeight: 1.1, margin: 0 }}>The right specialist, every time.</h2>
            </div>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
            {[
              { name: 'Cardiology', icon: Heart, c: P.coral },
              { name: 'Neurology', icon: Brain, c: P.violet },
              { name: 'Ophthalmology', icon: Eye, c: P.teal },
              { name: 'Orthopedics', icon: Bone, c: P.amber },
              { name: 'Pediatrics', icon: Baby, c: P.emerald },
              { name: 'General', icon: Stethoscope, c: P.blue },
            ].map(({ name, icon: Icon, c }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -8, boxShadow: '0 20px 50px ' + c + '12', transition: { duration: 0.3 } }}
                onClick={() => navigate('/register')}
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 0.3s' }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: c + '08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={26} color={c} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: P.navy, margin: 0 }}>{name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: '120px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 80, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: P.teal, textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: 16 }}>Patient Stories</span>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: P.navy, letterSpacing: '-2.5px', lineHeight: 1.06, marginBottom: 24 }}>Trusted across India.</h2>
            <Heartbeat w={160} />
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'Priya M.', city: 'Mumbai', text: 'Found a cardiologist in minutes. The AI knew exactly what specialist I needed.', c: P.teal },
              { name: 'Rajan K.', city: 'Bangalore', text: 'The consultation checklist made me so prepared — my doctor was genuinely impressed.', c: P.blue },
              { name: 'Ananya S.', city: 'Delhi', text: 'Red flag detection possibly saved my life. It flagged symptoms as emergency immediately.', c: P.violet },
            ].map(({ name, city, text, c }, i) => (
              <motion.div key={name} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', transition: { duration: 0.3 } }}
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 22, padding: '24px 28px', display: 'flex', gap: 18, cursor: 'default', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, ' + c + ', ' + c + 'bb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'white', flexShrink: 0 }}>{name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: P.navy }}>{name}</span>
                    <MapPin size={11} color={P.muted} />
                    <span style={{ fontSize: 12, color: P.muted }}>{city}</span>
                    <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
                      {[0, 1, 2, 3, 4].map((j) => <Star key={j} size={11} fill={P.amber} color={P.amber} />)}
                    </div>
                  </div>
                  <p style={{ fontSize: 13.5, color: P.sub, lineHeight: 1.7, margin: 0 }}>"{text}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '120px 56px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 900, margin: '0 auto', borderRadius: 36, padding: '80px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, ' + P.navy + ', ' + P.navyLt + ')', boxShadow: '0 40px 100px -20px rgba(11,37,69,0.3)' }}>
          <div style={{ position: 'absolute', top: -100, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,196,161,0.12), transparent)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-2.5px', lineHeight: 1.08, marginBottom: 20 }}>Intelligent care starts here.</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 44, lineHeight: 1.7 }}>Join MediConnect today — free, fast, and built around your health.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '16px 36px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.tealDk + ')', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 32px rgba(13,196,161,0.3)' }}>
                Get started <ArrowRight size={16} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }}
                onClick={() => navigate('/login')}
                style={{ padding: '16px 30px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.6)', padding: '28px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg, ' + P.teal + ', ' + P.tealDk + ')', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={13} color="white" />
          </div>
          <span style={{ fontWeight: 800, color: P.navy, fontSize: 14 }}>MediConnect</span>
        </div>
        <p style={{ fontSize: 12, color: P.muted, margin: 0 }}>© 2026 MediConnect — Built for better healthcare in India</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ fontSize: 13, color: P.muted, textDecoration: 'none', fontWeight: 600, transition: 'color 0.3s' }}
              onMouseEnter={(e) => { e.target.style.color = P.teal; }}
              onMouseLeave={(e) => { e.target.style.color = P.muted; }}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
