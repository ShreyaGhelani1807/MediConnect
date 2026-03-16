import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity, Mail, Lock, Eye, EyeOff, ArrowRight, User,
  Stethoscope, Phone, MapPin, AlertCircle, CheckCircle,
  Zap, Shield, ChevronDown, Heart, Brain
} from 'lucide-react';

const P = {
  navy: '#0B2545', navyLt: '#13356B',
  teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF',
  ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  coral: '#E8604C', blue: '#3B82F6', emerald: '#059669', violet: '#7C3AED',
  error: '#EF4444',
};

const ease = [0.22, 1, 0.36, 1];

const SPECIALIZATIONS = [
  'Cardiology','Neurology','Ophthalmology','Orthopedics','Pediatrics',
  'Dermatology','General Practice','Gynecology','Psychiatry','ENT',
  'Gastroenterology','Endocrinology',
];
const CITIES = [
  'Mumbai','Delhi','Bangalore','Chennai','Ahmedabad',
  'Hyderabad','Pune','Kolkata','Rajkot','Surat',
];

/* ── Input ── */
function Input({ icon: Icon, label, type = 'text', value, onChange, placeholder, error, suffix, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: P.ink, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}{required && <span style={{ color: P.coral }}>*</span>}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 13, background: focused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)', border: `1.5px solid ${error ? P.error : focused ? P.teal : 'rgba(0,0,0,0.07)'}`, transition: 'all 0.3s', backdropFilter: 'blur(8px)' }}>
        <Icon size={14} color={focused ? P.teal : P.muted} style={{ flexShrink: 0, transition: 'color 0.3s' }} />
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: P.ink, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500 }} />
        {suffix}
      </div>
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={10} color={P.error} />
          <span style={{ fontSize: 11, color: P.error, fontWeight: 600 }}>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

/* ── Select ── */
function Select({ icon: Icon, label, value, onChange, options, placeholder, error, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: P.ink, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}{required && <span style={{ color: P.coral }}>*</span>}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 13, background: focused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)', border: `1.5px solid ${error ? P.error : focused ? P.teal : 'rgba(0,0,0,0.07)'}`, transition: 'all 0.3s', backdropFilter: 'blur(8px)' }}>
        <Icon size={14} color={focused ? P.teal : P.muted} style={{ flexShrink: 0 }} />
        <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: value ? P.ink : P.muted, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, appearance: 'none', cursor: 'pointer' }}>
          <option value="" disabled>{placeholder}</option>
          {options.map(o => <option key={o} value={o} style={{ color: P.ink }}>{o}</option>)}
        </select>
        <ChevronDown size={13} color={P.muted} style={{ flexShrink: 0 }} />
      </div>
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={10} color={P.error} />
          <span style={{ fontSize: 11, color: P.error, fontWeight: 600 }}>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

/* ── Step Indicator ── */
function StepBar({ step, role }) {
  const steps = ['Role', 'Account', role === 'doctor' ? 'Professional' : 'Profile'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {steps.map((s, i) => {
        const done = step > i + 1, active = step === i + 1;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done || active ? `linear-gradient(135deg, ${P.teal}, ${P.tealDk})` : 'rgba(0,0,0,0.06)', border: `2px solid ${done || active ? P.teal : 'rgba(0,0,0,0.06)'}`, transition: 'all 0.4s' }}>
                {done ? <CheckCircle size={13} color="white" /> : <span style={{ fontSize: 12, fontWeight: 800, color: active ? 'white' : P.muted }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: active || done ? P.teal : P.muted, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > i + 1 ? P.teal : 'rgba(0,0,0,0.06)', margin: '0 8px', marginBottom: 18, borderRadius: 2, transition: 'background 0.4s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Left panel dynamic content ── */
const LEFT = {
  1: { title: 'Join\nMediConnect.', sub: 'AI-powered healthcare connecting patients with the right specialists across India.', items: [{ icon: Zap, color: '#0DC4A1', text: 'AI symptom analysis in seconds' }, { icon: CheckCircle, color: '#059669', text: 'Matched to verified specialists' }, { icon: Heart, color: '#E8604C', text: 'Emergency detection built-in' }] },
  2: { title: 'Create your\naccount.', sub: 'Your credentials are encrypted. Your health data is always private.', items: [{ icon: CheckCircle, color: '#0DC4A1', text: 'Secure JWT authentication' }, { icon: Shield, color: '#3B82F6', text: 'Data encrypted at rest' }, { icon: CheckCircle, color: '#059669', text: 'No hidden charges, always free' }] },
  3: { title: 'Almost\nthere!', sub: 'Just a few more details to personalize your experience.', items: [{ icon: MapPin, color: '#0DC4A1', text: 'Doctors matched to your city' }, { icon: Brain, color: '#7C3AED', text: 'Age-aware AI recommendations' }, { icon: Zap, color: '#059669', text: 'Smart urgency detection' }] },
};

export default function Register() {
  const navigate     = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');

  // Step 2
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  // Step 3
  const [city,           setCity]           = useState('');
  const [gender,         setGender]         = useState('');
  const [age,            setAge]            = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience,     setExperience]     = useState('');
  const [fee,            setFee]            = useState('');
  const [hospital,       setHospital]       = useState('');

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [fieldErr, setFieldErr] = useState({});

  const validateStep2 = () => {
    const e = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setFieldErr(e); return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!city)   e.city   = 'City is required';
    if (!gender) e.gender = 'Gender is required';
    if (role === 'doctor') {
      if (!specialization) e.specialization = 'Required';
      if (!experience)     e.experience     = 'Required';
      if (!fee)            e.fee            = 'Required';
    }
    setFieldErr(e); return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!role) { setError('Please select your role to continue.'); return; }
      setStep(2); return;
    }
    if (step === 2) {
      if (!validateStep2()) return;
      setStep(3); return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true); setError('');
    try {
      const payload = {
        name, email, password, phone, role,
        ...(role === 'patient'
          ? { age: age ? parseInt(age) : undefined, gender, city }
          : { specialization, city, gender, yearsOfExperience: experience ? parseInt(experience) : undefined, consultationFee: fee ? parseInt(fee) : undefined, hospital }
        ),
      };
      await register(payload);
      navigate(role === 'doctor' ? '/doctor/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const lc = LEFT[step];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', display: 'flex', background: P.sky, overflow: 'hidden', position: 'relative' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-5%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,196,161,0.07), transparent 65%)', filter: 'blur(60px)' }} />
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: '-5%', left: '0%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.05), transparent 65%)', filter: 'blur(70px)' }} />
      </div>

      {/* LEFT PANEL */}
      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: ease }}
        style={{ width: '42%', background: `linear-gradient(150deg, ${P.navy}, ${P.navyLt})`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 56px', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', bottom: -120, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,196,161,0.1), transparent 65%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${P.teal}, ${P.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(13,196,161,0.35)' }}>
            <Activity size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: '-0.5px' }}>
            Medi<span style={{ color: P.teal }}>Connect</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.35, ease: ease }}>
            <div style={{ width: 36, height: 3, background: P.teal, borderRadius: 2, marginBottom: 24 }} />
            <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1.1, margin: '0 0 16px', whiteSpace: 'pre-line' }}>{lc.title}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 36, maxWidth: 300 }}>{lc.sub}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {lc.items.map(({ icon: Icon, color, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color={color} />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 'auto', paddingTop: 48 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>Already have an account?</p>
          <Link to="/login" style={{ fontSize: 14, fontWeight: 700, color: P.teal, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            Sign in instead <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: ease }}
          style={{ width: '100%', maxWidth: 460 }}>

          <div style={{ borderRadius: 28, padding: '40px 38px', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 24px 80px -12px rgba(11,37,69,0.12)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: P.navy, letterSpacing: '-1px', margin: 0 }}>Create account</h2>
              {step > 1 && (
                <button onClick={() => { setStep(s => s - 1); setError(''); setFieldErr({}); }}
                  style={{ fontSize: 12, fontWeight: 700, color: P.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 8, fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = P.navy; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = P.muted; }}>
                  ← Back
                </button>
              )}
            </div>
            <p style={{ fontSize: 13, color: P.muted, margin: '0 0 24px' }}>Step {step} of 3</p>

            <StepBar step={step} role={role} />

            <AnimatePresence mode="wait">
              {/* STEP 1 — Role */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: P.sub, marginBottom: 14 }}>I am joining as a…</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { value: 'patient', label: 'Patient', icon: User,        sub: 'Find doctors & manage appointments',      color: P.teal },
                      { value: 'doctor',  label: 'Doctor',  icon: Stethoscope, sub: 'List your practice & manage your schedule', color: P.blue },
                    ].map(({ value, label, icon: Icon, sub, color }) => {
                      const sel = role === value;
                      return (
                        <motion.button key={value} onClick={() => setRole(value)} whileTap={{ scale: 0.98 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 18, border: `2px solid ${sel ? color : 'rgba(0,0,0,0.06)'}`, background: sel ? `${color}06` : 'rgba(255,255,255,0.5)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxShadow: sel ? `0 0 0 4px ${color}10` : 'none', transition: 'all 0.3s' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: sel ? `${color}12` : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' }}>
                            <Icon size={22} color={sel ? color : P.muted} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 15, fontWeight: 800, color: sel ? P.navy : P.sub, margin: '0 0 3px', letterSpacing: '-0.3px' }}>{label}</p>
                            <p style={{ fontSize: 12, color: P.muted, margin: 0 }}>{sub}</p>
                          </div>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? color : 'rgba(0,0,0,0.1)'}`, background: sel ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0 }}>
                            {sel && <CheckCircle size={11} color="white" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Account */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Input icon={User}  label="Full name"         value={name}     onChange={e => { setName(e.target.value);     setFieldErr(f => ({ ...f, name: '' })); }}     placeholder="e.g. Priya Sharma"     error={fieldErr.name}     required />
                    <Input icon={Mail}  label="Email address"     value={email}    onChange={e => { setEmail(e.target.value);    setFieldErr(f => ({ ...f, email: '' })); }}    placeholder="you@example.com"       error={fieldErr.email}    required />
                    <Input icon={Phone} label="Phone (optional)"  value={phone}    onChange={e => setPhone(e.target.value)}                                                     placeholder="+91 98765 43210" />
                    <Input icon={Lock}  label="Password"          value={password} onChange={e => { setPassword(e.target.value); setFieldErr(f => ({ ...f, password: '' })); }} placeholder="Min. 6 characters"     error={fieldErr.password} required
                      type={showPass ? 'text' : 'password'}
                      suffix={<button onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: P.muted }}>{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                    <Input icon={Lock}  label="Confirm password"  value={confirm}  onChange={e => { setConfirm(e.target.value);  setFieldErr(f => ({ ...f, confirm: '' })); }}  placeholder="Repeat password"       error={fieldErr.confirm}  required
                      type={showConf ? 'text' : 'password'}
                      suffix={<button onClick={() => setShowConf(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: P.muted }}>{showConf ? <EyeOff size={14} /> : <Eye size={14} />}</button>} />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Profile */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Select icon={MapPin} label="City"   value={city}   onChange={e => { setCity(e.target.value);   setFieldErr(f => ({ ...f, city: '' })); }}   options={CITIES}  placeholder="Select your city" error={fieldErr.city}   required />
                    <Select icon={User}   label="Gender" value={gender} onChange={e => { setGender(e.target.value); setFieldErr(f => ({ ...f, gender: '' })); }} options={['Male', 'Female', 'Other', 'Prefer not to say']} placeholder="Select gender" error={fieldErr.gender} required />
                    {role === 'patient' && (
                      <Input icon={User} label="Age (optional)" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28" type="number" />
                    )}
                    {role === 'doctor' && (
                      <>
                        <Select icon={Stethoscope} label="Specialization" value={specialization} onChange={e => { setSpecialization(e.target.value); setFieldErr(f => ({ ...f, specialization: '' })); }} options={SPECIALIZATIONS} placeholder="Select specialization" error={fieldErr.specialization} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <Input icon={Zap}      label="Experience (yrs)" value={experience} onChange={e => { setExperience(e.target.value); setFieldErr(f => ({ ...f, experience: '' })); }} placeholder="e.g. 10" type="number" error={fieldErr.experience} required />
                          <Input icon={Activity} label="Consult Fee (₹)"  value={fee}        onChange={e => { setFee(e.target.value);        setFieldErr(f => ({ ...f, fee: '' })); }}        placeholder="e.g. 500"  type="number" error={fieldErr.fee}        required />
                        </div>
                        <Input icon={MapPin} label="Hospital / Clinic (optional)" value={hospital} onChange={e => setHospital(e.target.value)} placeholder="e.g. Apollo Hospital" />
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: 16, padding: '11px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <AlertCircle size={13} color={P.error} />
                  <span style={{ fontSize: 13, color: P.error, fontWeight: 600 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={handleNext} disabled={loading}
              style={{ width: '100%', marginTop: 24, padding: '14px', borderRadius: 16, border: 'none', background: loading ? `${P.teal}80` : `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontFamily: "'Inter', system-ui, sans-serif", boxShadow: '0 8px 28px rgba(13,196,161,0.28)', transition: 'all 0.3s' }}>
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Creating account…
                </>
              ) : step < 3
                ? <>Continue <ArrowRight size={16} strokeWidth={2.5} /></>
                : <>Create account <CheckCircle size={16} /></>
              }
            </motion.button>
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