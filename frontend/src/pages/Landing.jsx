import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Heart, Brain, Eye, Bone, Baby, Stethoscope, Activity,
  ArrowRight, Star, MapPin, CheckCircle, AlertTriangle,
  Zap, Shield, TrendingUp, Search, CalendarCheck,
  Sparkles, Clock, Play, ArrowUpRight, ChevronDown, Users
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DESIGN SYSTEM — Dark premium (Linear / Raycast inspired)
   ═══════════════════════════════════════════════════════════ */
const P = {
  bg: '#09090B',         bgCard: '#131316',      bgElevated: '#1A1A1F',
  bgSubtle: '#0F0F12',   surface: '#18181C',
  accent: '#6C5CE7',     accentLt: '#A29BFE',    accentGlow: 'rgba(108,92,231,0.3)',
  mint: '#00D2A0',       mintGlow: 'rgba(0,210,160,0.2)',
  rose: '#FF6B6B',       amber: '#FBBF24',       sky: '#38BDF8',
  text: '#FAFAFA',       textMd: '#A1A1AA',      textDim: '#52525B',
  border: 'rgba(255,255,255,0.06)', borderLt: 'rgba(255,255,255,0.03)',
  grad1: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
  grad2: 'linear-gradient(135deg, #00D2A0, #38BDF8)',
};

const ease = [0.22, 1, 0.36, 1];

/* ── LIVE AI DEMO (floating card) ────────────────────────── */
const DEMOS = [
  { symptom: "Dull chest ache for 3 days, radiating to left arm, breathless on stairs...", spec: "Cardiologist", urgency: "Urgent", uClr: P.rose, flags: ["Chest radiation", "3+ days", "Exertional"], conf: 94 },
  { symptom: "Severe headache behind eyes, sensitive to light, nausea since morning...", spec: "Neurologist", urgency: "Soon", uClr: P.amber, flags: ["Light sensitivity", "Nausea", "Severity high"], conf: 88 },
  { symptom: "Knee swells after walking, painful going up stairs, 2 weeks now...", spec: "Orthopedist", urgency: "Routine", uClr: P.mint, flags: ["Joint swelling", "2 week duration"], conf: 91 },
];

function AiDemo() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    const sym = DEMOS[idx].symptom;
    let t;
    if (phase === 'typing') {
      t = typed.length < sym.length
        ? setTimeout(() => setTyped(sym.slice(0, typed.length + 1)), 20)
        : setTimeout(() => setPhase('analyzing'), 500);
    } else if (phase === 'analyzing') {
      t = setTimeout(() => setPhase('result'), 1400);
    } else {
      t = setTimeout(() => { setPhase('typing'); setTyped(''); setIdx(i => (i + 1) % DEMOS.length); }, 2800);
    }
    return () => clearTimeout(t);
  }, [typed, phase, idx]);

  const d = DEMOS[idx];

  return (
    <div style={{
      width: '100%', maxWidth: 400,
      background: P.bgCard, borderRadius: 20, overflow: 'hidden',
      border: `1px solid ${P.border}`,
      boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${P.border}, 0 0 80px ${P.accentGlow}`,
    }}>
      {/* Top bar */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: P.mint, boxShadow: `0 0 8px ${P.mintGlow}` }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: P.textMd, letterSpacing: '0.04em' }}>AI Symptom Analysis</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: P.textDim, padding: '3px 8px', background: P.bgElevated, borderRadius: 6 }}>LIVE</span>
      </div>

      {/* Input area */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          background: P.bgSubtle, borderRadius: 12, padding: '14px 16px', minHeight: 64,
          border: `1px solid ${phase === 'typing' ? P.accent + '40' : P.border}`,
          transition: 'border-color 0.3s',
        }}>
          <p style={{ fontSize: 13, color: P.text, lineHeight: 1.6, margin: 0, minHeight: 40 }}>
            {typed}
            {phase === 'typing' && (
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                style={{ display: 'inline-block', width: 2, height: '1em', background: P.accent, marginLeft: 2, verticalAlign: 'middle' }} />
            )}
          </p>
        </div>
      </div>

      {/* Result area */}
      <div style={{ minHeight: 172, padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {phase === 'analyzing' && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 28, height: 28, border: `2px solid ${P.bgElevated}`, borderTopColor: P.accent, borderRadius: '50%', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: P.text }}>Analyzing patterns…</p>
              <p style={{ fontSize: 11, color: P.textDim, marginTop: 4 }}>Urgency · Red flags · Specialist match</p>
            </motion.div>
          )}
          {phase === 'result' && (
            <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: d.uClr }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: d.uClr, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.urgency}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 4, width: 48, borderRadius: 2, background: P.bgElevated, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.conf}%` }} transition={{ duration: 0.6 }}
                      style={{ height: '100%', background: P.grad1, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10, color: P.textDim, fontWeight: 600 }}>{d.conf}%</span>
                </div>
              </div>
              <div style={{ background: P.bgSubtle, border: `1px solid ${P.accent}18`, borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: P.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Recommended Specialist</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: P.text, letterSpacing: '-0.5px', margin: 0 }}>{d.spec}</p>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {d.flags.map(f => (
                  <span key={f} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: `${d.uClr}12`, color: d.uClr, border: `1px solid ${d.uClr}20` }}>⚠ {f}</span>
                ))}
              </div>
              <button style={{
                width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                background: P.grad1, color: 'white', fontWeight: 700, fontSize: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
              }}>View matched doctors <ArrowRight size={13} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── GLOW ORB (ambient decoration) ───────────────────────── */
function Orb({ color, size = 400, top, left, right, bottom, blur = 120 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom,
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}, transparent 70%)`,
      filter: `blur(${blur}px)`, pointerEvents: 'none', opacity: 0.6,
    }} />
  );
}

/* ── NUMBER CARD ─────────────────────────────────────────── */
function StatPill({ value, label, icon: Icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 22px', borderRadius: 16,
      background: P.bgCard, border: `1px solid ${P.border}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${P.accent}10`, border: `1px solid ${P.accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={P.accentLt} />
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: P.text, letterSpacing: '-1px', margin: 0 }}>{value}</p>
        <p style={{ fontSize: 11, color: P.textDim, fontWeight: 500, margin: 0 }}>{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const words = ['symptoms.', 'pain.', 'concerns.', 'health.'];
  const [wI, setWI] = useState(0);
  const [wT, setWT] = useState('');
  const [wD, setWD] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const w = words[wI]; let t;
    if (!wD && wT.length < w.length) t = setTimeout(() => setWT(w.slice(0, wT.length + 1)), 80);
    else if (!wD && wT.length === w.length) t = setTimeout(() => setWD(true), 1600);
    else if (wD && wT.length > 0) t = setTimeout(() => setWT(wT.slice(0, -1)), 45);
    else { setWD(false); setWI((wI + 1) % words.length); }
    return () => clearTimeout(t);
  }, [wT, wD, wI]);

  const navSolid = scrollY > 40;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: P.bg, color: P.text, overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ══════════════════════════════════════════════════════
          NAVBAR — glass-morphism
      ══════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 clamp(20px, 4vw, 48px)', justifyContent: 'space-between',
          background: navSolid ? 'rgba(9,9,11,0.8)' : 'transparent',
          backdropFilter: navSolid ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: navSolid ? `1px solid ${P.border}` : '1px solid transparent',
          transition: 'all 0.35s ease',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: P.grad1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${P.accentGlow}`,
          }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px' }}>
            Medi<span style={{ color: P.accentLt }}>Connect</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')}
            style={{
              fontSize: 13, fontWeight: 600, color: P.textMd, background: 'none',
              border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 10,
              fontFamily: 'inherit', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = P.text}
            onMouseLeave={e => e.currentTarget.style.color = P.textMd}>
            Sign in
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{
              fontSize: 13, fontWeight: 700, color: 'white',
              background: P.grad1, border: 'none',
              padding: '9px 22px', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: `0 4px 20px ${P.accentGlow}`,
            }}>
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════════════
          HERO — centered, minimal, dramatic
      ══════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
      }}>
        {/* Ambient orbs */}
        <Orb color={`${P.accent}15`} size={700} top="-20%" left="-15%" />
        <Orb color={`${P.mint}08`} size={500} bottom="-10%" right="-10%" />
        <Orb color={`${P.rose}06`} size={300} top="30%" right="5%" blur={80} />

        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${P.border} 1px, transparent 1px), linear-gradient(90deg, ${P.border} 1px, transparent 1px)`,
          backgroundSize: '80px 80px', opacity: 0.4, pointerEvents: 'none',
          mask: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)',
          WebkitMask: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)',
        }} />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px 6px 8px', borderRadius: 100, marginBottom: 36,
            background: P.bgCard, border: `1px solid ${P.border}`,
            boxShadow: `0 0 30px ${P.accentGlow}`,
          }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${P.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={12} color={P.accentLt} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: P.textMd }}>Powered by AI — not a directory</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease }}
          style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-3px', margin: '0 0 8px', maxWidth: 900, position: 'relative', zIndex: 1 }}>
          Describe your{' '}
          <span style={{ background: P.grad1, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {wT}
          </span>
          <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
            style={{ display: 'inline-block', width: 4, height: '0.7em', background: P.accent, marginLeft: 4, verticalAlign: 'middle', borderRadius: 2, boxShadow: `0 0 16px ${P.accentGlow}` }} />
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease }}
          style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-3px', margin: '0 0 28px', position: 'relative', zIndex: 1 }}>
          We find your doctor.
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ease }}
          style={{ fontSize: 17, color: P.textDim, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 44px', position: 'relative', zIndex: 1 }}>
          Our AI analyzes your exact symptom pattern, detects urgency, identifies red flags, and connects you with the right specialist — in seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ease }}
          style={{ display: 'flex', gap: 12, marginBottom: 72, position: 'relative', zIndex: 1 }}>
          <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 40px ${P.accentGlow}` }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '14px 32px', borderRadius: 14, border: 'none',
              background: P.grad1, color: 'white', fontWeight: 700,
              fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: `0 6px 28px ${P.accentGlow}`,
            }}>
            Start free <ArrowRight size={16} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 26px', borderRadius: 14,
              border: `1px solid ${P.border}`, background: P.bgCard,
              color: P.textMd, fontWeight: 600, fontSize: 15,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
            Sign in
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, ease }}
          style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatPill value="12+" label="Specializations" icon={Heart} />
          <StatPill value="6+" label="Cities covered" icon={MapPin} />
          <StatPill value="AI" label="Powered analysis" icon={Zap} />
          <StatPill value="Free" label="Always" icon={Shield} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
          <ChevronDown size={20} color={P.textDim} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DEMO SHOWCASE — floating card with context
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '60px 24px 120px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left — demo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
            style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <Orb color={`${P.accent}10`} size={400} top="-20%" left="-20%" blur={100} />
            <div style={{ position: 'relative', zIndex: 1 }}><AiDemo /></div>
          </motion.div>

          {/* Right — copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 100,
              background: `${P.mint}10`, border: `1px solid ${P.mint}20`, marginBottom: 24,
            }}>
              <Play size={10} color={P.mint} fill={P.mint} />
              <span style={{ fontSize: 11, fontWeight: 700, color: P.mint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Demo</span>
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', margin: '0 0 18px' }}>
              Watch the AI <br />work in{' '}
              <span style={{ background: P.grad2, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>real-time</span>
            </h2>
            <p style={{ fontSize: 16, color: P.textDim, lineHeight: 1.75, margin: '0 0 32px', maxWidth: 420 }}>
              Type your symptoms naturally. Our AI processes patterns, detects urgency levels, flags emergencies, and recommends the right specialist — all within seconds.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: Brain, text: 'Multi-symptom pattern analysis', color: P.accent },
                { icon: AlertTriangle, text: 'Emergency & red flag detection', color: P.rose },
                { icon: Shield, text: 'Your data never leaves your device', color: P.mint },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}10`, border: `1px solid ${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: P.textMd }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES — horizontal scroll-style cards
      ══════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative' }}>
        <Orb color={`${P.accent}06`} size={500} top="0" right="-10%" />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 16 }}>Features</span>
            <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, margin: 0, maxWidth: 500 }}>
              Not a directory.<br />
              <span style={{ color: P.textDim }}>An AI that understands.</span>
            </h2>
          </motion.div>

          {/* Feature grid — 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                icon: Brain, color: P.accent, title: 'Pattern Recognition',
                desc: 'Same chest pain means different things for a 25-year-old athlete vs a 55-year-old smoker. Context matters — our AI gets it.',
                tags: ['Age-aware', 'Context-driven', 'Multi-pattern'],
              },
              {
                icon: TrendingUp, color: P.rose, title: '4-Level Urgency Triage',
                desc: 'Every analysis includes a clear urgency rating — from routine to emergency — so you know exactly how fast to act.',
                levels: [
                  { name: 'Emergency', color: '#EF4444', note: 'Go to ER' },
                  { name: 'Urgent', color: P.rose, note: 'Today' },
                  { name: 'Soon', color: P.amber, note: '2–3 days' },
                  { name: 'Routine', color: P.mint, note: 'This week' },
                ],
              },
              {
                icon: AlertTriangle, color: P.amber, title: 'Emergency Detection',
                desc: 'Stroke, heart attack, breathing difficulty — the AI detects life-threatening patterns and bypasses doctor search entirely.',
                alert: true,
              },
              {
                icon: CheckCircle, color: P.mint, title: 'Smart Checklists',
                desc: 'Auto-generated prep lists based on your symptoms and specialist — things to say, documents to bring, questions to ask.',
                checks: ['5 things to tell the doctor', '3 documents to bring', '4 questions to ask', 'Red flag reminders'],
              },
            ].map((feat, i) => (
              <motion.div key={feat.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, ease }}
                style={{
                  background: P.bgCard, borderRadius: 24, padding: '36px 34px',
                  border: `1px solid ${P.border}`, position: 'relative', overflow: 'hidden',
                  transition: 'border-color 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${feat.color}30`}
                onMouseLeave={e => e.currentTarget.style.borderColor = P.border}>
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${feat.color}10`, border: `1px solid ${feat.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
                }}>
                  <feat.icon size={22} color={feat.color} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12, color: P.text }}>{feat.title}</h3>
                <p style={{ fontSize: 14, color: P.textDim, lineHeight: 1.7, marginBottom: 20 }}>{feat.desc}</p>

                {/* Tags */}
                {feat.tags && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {feat.tags.map(t => (
                      <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: `${feat.color}08`, color: `${feat.color}CC`, border: `1px solid ${feat.color}15` }}>{t}</span>
                    ))}
                  </div>
                )}

                {/* Urgency levels */}
                {feat.levels && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {feat.levels.map(({ name, color, note }) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${P.borderLt}` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 12, boxShadow: `0 0 8px ${color}50` }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color, flex: 1 }}>{name}</span>
                        <span style={{ fontSize: 12, color: P.textDim }}>{note}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Emergency alert */}
                {feat.alert && (
                  <div style={{ background: `${P.rose}08`, border: `1px solid ${P.rose}18`, borderRadius: 12, padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }}
                        style={{ width: 7, height: 7, borderRadius: '50%', background: P.rose }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: P.rose, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emergency Detected</span>
                    </div>
                    <p style={{ fontSize: 12, color: P.textDim, lineHeight: 1.5, margin: 0 }}>Call 112 or go to your nearest ER immediately.</p>
                  </div>
                )}

                {/* Checklist */}
                {feat.checks && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {feat.checks.map(c => (
                      <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: `${P.mint}06`, border: `1px solid ${P.mint}10` }}>
                        <CheckCircle size={13} color={P.mint} />
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: P.textMd }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — timeline
      ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 72 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: P.mint, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 16 }}>How it works</span>
            <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, margin: 0 }}>
              Three steps to <span style={{ background: P.grad2, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>better care</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { n: '01', title: 'Describe', desc: 'Type your symptoms naturally. Duration, location, intensity — just talk like you would to a friend.', icon: Search, color: P.accent },
              { n: '02', title: 'Analyze', desc: 'AI processes symptom patterns, detects urgency, flags emergencies, and generates specialist recommendations.', icon: Zap, color: P.amber },
              { n: '03', title: 'Book', desc: 'See matched doctors near you with real-time availability. Pick a slot and confirm — done.', icon: CalendarCheck, color: P.mint },
            ].map(({ n, title, desc, icon: Icon, color }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, ease }}
                style={{
                  background: P.bgCard, borderRadius: 24, padding: '40px 32px',
                  border: `1px solid ${P.border}`, position: 'relative', overflow: 'hidden',
                  textAlign: 'center',
                }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 72, fontWeight: 900, color: `${color}08`, lineHeight: 1, letterSpacing: '-3px', userSelect: 'none' }}>{n}</div>
                <div style={{
                  width: 60, height: 60, borderRadius: 18,
                  background: `${color}10`, border: `1px solid ${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <Icon size={26} color={color} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: 14, color: P.textDim, lineHeight: 1.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SPECIALTIES
      ══════════════════════════════════════════════════════ */}
      <section id="doctors" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 16 }}>Specializations</span>
              <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, margin: 0 }}>The right specialist,<br /><span style={{ color: P.textDim }}>every time.</span></h2>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/register')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: P.accentLt, background: 'none', border: `1px solid ${P.accent}30`, padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              Browse all <ArrowRight size={14} />
            </motion.button>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {[
              { name: 'Cardiology', icon: Heart, color: P.rose },
              { name: 'Neurology', icon: Brain, color: P.accent },
              { name: 'Ophthalmology', icon: Eye, color: P.sky },
              { name: 'Orthopedics', icon: Bone, color: P.amber },
              { name: 'Pediatrics', icon: Baby, color: P.mint },
              { name: 'General', icon: Stethoscope, color: P.accentLt },
            ].map(({ name, icon: Icon, color }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -8, borderColor: `${color}40` }}
                onClick={() => navigate('/register')}
                style={{
                  background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 20,
                  padding: '32px 16px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 14, cursor: 'pointer',
                  transition: 'all 0.3s', textAlign: 'center',
                }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}10`, border: `1px solid ${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} color={color} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: P.textMd, lineHeight: 1.3, margin: 0 }}>{name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', borderTop: `1px solid ${P.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: P.accent, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 16 }}>Testimonials</span>
            <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, margin: 0 }}>
              Trusted across <span style={{ background: P.grad1, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>India</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Priya M.', city: 'Mumbai', text: 'Found a cardiologist within minutes. The AI knew exactly what kind of specialist I needed based on my symptoms.' },
              { name: 'Rajan K.', city: 'Bangalore', text: 'The pre-consultation checklist helped me prepare so well. My doctor was impressed with how organized I was.' },
              { name: 'Ananya S.', city: 'Delhi', text: 'Red flag detection possibly saved my life. It immediately flagged my symptoms as emergency and told me to call 112.' },
            ].map(({ name, city, text }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 20,
                  padding: '28px 26px', transition: 'border-color 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${P.accent}25`}
                onMouseLeave={e => e.currentTarget.style.borderColor = P.border}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={P.amber} color={P.amber} />)}
                </div>
                <p style={{ fontSize: 14, color: P.textMd, lineHeight: 1.7, margin: '0 0 24px' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${P.border}`, paddingTop: 18 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: P.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: 'white',
                  }}>{name[0]}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: P.text, margin: 0 }}>{name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={11} color={P.textDim} />
                      <span style={{ fontSize: 12, color: P.textDim }}>{city}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
        <Orb color={`${P.accent}12`} size={600} top="-30%" left="30%" />
        <Orb color={`${P.mint}08`} size={400} bottom="-20%" right="20%" />

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{
            maxWidth: 700, margin: '0 auto', textAlign: 'center',
            position: 'relative', zIndex: 1,
            background: P.bgCard, borderRadius: 32, padding: '64px 48px',
            border: `1px solid ${P.border}`,
            boxShadow: `0 0 120px ${P.accentGlow}`,
          }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: `${P.accent}10`, border: `1px solid ${P.accent}20`, marginBottom: 28,
          }}>
            <Heart size={12} color={P.accentLt} fill={P.accentLt} />
            <span style={{ fontSize: 11, fontWeight: 700, color: P.accentLt, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free forever</span>
          </div>
          <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, margin: '0 0 18px' }}>
            Intelligent care<br />starts here.
          </h2>
          <p style={{ fontSize: 16, color: P.textDim, marginBottom: 40, lineHeight: 1.7 }}>
            Join MediConnect today — free, fast, and built around your health.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 40px ${P.accentGlow}` }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '14px 34px', borderRadius: 14, border: 'none',
                background: P.grad1, color: 'white', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: `0 6px 28px ${P.accentGlow}`,
              }}>
              Get started free <ArrowRight size={16} />
            </motion.button>
            <button onClick={() => navigate('/login')}
              style={{
                padding: '14px 28px', borderRadius: 14,
                border: `1px solid ${P.border}`, background: P.bgElevated,
                color: P.textMd, fontWeight: 600, fontSize: 15,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${P.accent}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = P.border}>
              Sign in
            </button>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: `1px solid ${P.border}`, padding: '28px clamp(20px, 4vw, 48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: P.grad1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={13} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>MediConnect</span>
        </div>
        <p style={{ fontSize: 12, color: P.textDim }}>© 2026 MediConnect — Built for better healthcare in India</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: P.textDim, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = P.text}
              onMouseLeave={e => e.target.style.color = P.textDim}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
