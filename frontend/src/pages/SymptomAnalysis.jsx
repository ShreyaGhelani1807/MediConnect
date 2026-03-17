import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import {
  Brain, Send, AlertTriangle, CheckCircle, ArrowRight,
  Zap, MapPin, Star, Clock, Phone, Calendar, RefreshCw,
  Activity, Shield, ChevronRight, X, FileText
} from 'lucide-react';

const P = {
  navy: '#0B2545', navyLt: '#13356B',
  teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF', white: '#FFFFFF',
  ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  coral: '#E8604C', amber: '#F4A261', emerald: '#059669',
  blue: '#3B82F6', violet: '#7C3AED',
  border: 'rgba(0,0,0,0.06)', error: '#EF4444',
};

const URGENCY = {
  routine: { color: P.emerald, bg: '#ECFDF5', label: 'Routine', note: 'Book within a week' },
  soon: { color: P.amber, bg: '#FFFBEB', label: 'Soon', note: 'Book in 2–3 days' },
  urgent: { color: P.coral, bg: '#FEF2F0', label: 'Urgent', note: 'See a doctor today' },
  emergency: { color: '#DC2626', bg: '#FFF0F0', label: 'Emergency', note: 'Go to ER immediately' },
};

const EXAMPLE_SYMPTOMS = [
  "I've had a dull chest ache for 3 days, sometimes radiating to my left arm. I feel breathless when climbing stairs.",
  "Severe headache behind my eyes since morning, sensitive to light, slight nausea. No fever.",
  "My right knee has been swelling after walking. It's painful going up stairs. Started 2 weeks ago.",
  "Itchy skin rash spreading on both arms. Slightly raised, red patches. Appeared 5 days ago, no fever.",
];

/* ── Analyzing animation ── */
function AnalyzingState() {
  const steps = ['Reading symptom patterns…', 'Detecting urgency level…', 'Checking red flags…', 'Matching specialist…'];
  const [active, setActive] = useState(0);

  useState(() => {
    const t = setInterval(() => setActive(a => (a + 1) % steps.length), 700);
    return () => clearInterval(t);
  });

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '56px 32px' }}>
      <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 28px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          style={{ width: 72, height: 72, borderRadius: '50%', border: `3px solid ${P.sky}`, borderTopColor: P.teal, position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={28} color={P.teal} />
        </div>
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: P.ink, letterSpacing: '-0.5px', marginBottom: 8 }}>Analyzing your symptoms</p>
      <AnimatePresence mode="wait">
        <motion.p key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          style={{ fontSize: 13, color: P.muted, margin: '0 0 32px' }}>{steps[active]}</motion.p>
      </AnimatePresence>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 280, margin: '0 auto' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div animate={{ background: i <= active ? P.teal : 'rgba(0,0,0,0.08)' }} transition={{ duration: 0.4 }}
              style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i < active
                ? <CheckCircle size={11} color="white" />
                : i === active
                  ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
                  : null
              }
            </motion.div>
            <span style={{ fontSize: 12, color: i <= active ? P.ink : P.muted, fontWeight: i === active ? 700 : 500 }}>{s}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Doctor Card ── */
function DoctorCard({ doc, i, onBook }) {
  const doctorName = doc.name || doc.user?.name || 'Doctor';
  const doctorSpecialization = doc.specialization || 'General Physician';
  const doctorExperience = doc.experienceYears || doc.yearsOfExperience;
  const doctorClinic = doc.clinicAddress || doc.hospital;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
      style={{ background: P.white, borderRadius: 18, padding: '20px', border: `1px solid ${P.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 15, background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'white', flexShrink: 0 }}>
          {doc.name?.[0] || 'D'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: P.ink, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
          <p style={{ fontSize: 13, color: P.teal, fontWeight: 600, margin: '0 0 4px' }}>{doc.specialization}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={12} fill={P.amber} color={P.amber} />
              <span style={{ fontSize: 12, fontWeight: 700, color: P.sub }}>{doc.averageRating?.toFixed(1) || 'New'}</span>
            </div>
            <span style={{ fontSize: 12, color: P.muted }}>·</span>
            <span style={{ fontSize: 12, color: P.muted }}>{doc.experienceYears} yrs exp</span>
            <span style={{ fontSize: 12, color: P.muted }}>·</span>
            <span style={{ fontSize: 12, color: P.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} />{doc.city || 'N/A'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 900, color: P.ink, margin: '0 0 2px' }}>₹{doc.consultationFee}</p>
          <p style={{ fontSize: 11, color: P.muted }}>per visit</p>
        </div>
      </div>
      {doctorClinic && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '8px 12px', borderRadius: 10, background: P.sky }}>
          <Activity size={12} color={P.sub} />
          <span style={{ fontSize: 12, color: P.sub, fontWeight: 500 }}>{doctorClinic}</span>
        </div>
      )}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => onBook(doc)}
        style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(13,196,161,0.25)' }}>
        Book appointment <ArrowRight size={13} />
      </motion.button>
    </motion.div>
  );
}

/* ── Booking Modal ── */
function BookingModal({ doctor, analysisResult, onClose }) {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await api.get(`/doctors/${doctor.id}/slots`, { params: { date } });
        setSlots(res.data.availableSlots || []);
      } catch (e) {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [date, doctor.id]);

  const handleBook = async () => {
    if (!date || !selectedSlot) {
      setErr('Please select a date and an available time slot.');
      return;
    }
    setBooking(true); setErr('');
    try {
      await api.post('/appointments/book', {
        doctorId: doctor.id,
        appointmentDate: date,
        timeSlotId: selectedSlot,
        reasonForVisit: title || 'Symptom Analysis Checkup',
        aiSymptomAnalysis: analysisResult?.aiAnalysis || null
      });
      toast.success('Appointment booked successfully!');
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to book appointment.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,37,69,0.5)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
        style={{ width: '100%', maxWidth: 440, background: P.white, borderRadius: 24, padding: '32px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: P.sub }}>
          <X size={16} />
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: P.ink, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Book Appointment</h2>
        <p style={{ fontSize: 13, color: P.sub, margin: '0 0 24px' }}>with Dr. {doctor.name || doctor.user?.name}</p>

        {err && (
          <div style={{ padding: '12px', borderRadius: 12, background: '#FFF0F0', color: P.error, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <AlertTriangle size={14} /> {err}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {/* Title input */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: P.muted, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <FileText size={13} /> Reason for Visit (Title)
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Follow-up, Routine checkup"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: `1px solid ${P.border}`, background: P.sky, outline: 'none', fontSize: 14, color: P.ink, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Date Picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: P.muted, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Calendar size={13} /> Select Date *
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: `1px solid ${P.border}`, background: P.sky, outline: 'none', fontSize: 14, color: P.ink, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: P.muted, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Clock size={13} /> Available Time *
            </label>
            {!date ? (
              <p style={{ fontSize: 13, color: P.muted, margin: 0, padding: '10px 0' }}>Please select a date first.</p>
            ) : loadingSlots ? (
              <p style={{ fontSize: 13, color: P.teal, margin: 0, padding: '10px 0', fontWeight: 600 }}>Loading slots...</p>
            ) : slots.length === 0 ? (
              <p style={{ fontSize: 13, color: P.error, margin: 0, padding: '10px 0', fontWeight: 600 }}>No availability on this date.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {slots.map(s => (
                  <button key={s.id} onClick={() => setSelectedSlot(s.id)} disabled={s.isBooked === true}
                    style={{ padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: selectedSlot === s.id ? 800 : 600, border: selectedSlot === s.id ? `2px solid ${P.teal}` : `1px solid ${P.border}`, background: s.isBooked === true ? 'rgba(0,0,0,0.04)' : selectedSlot === s.id ? `${P.teal}15` : P.sky, color: s.isBooked === true ? P.muted : selectedSlot === s.id ? P.tealDk : P.ink, cursor: s.isBooked === true ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: s.isBooked === true ? 0.6 : 1 }}>
                    {s.startTime}{s.isBooked === true && ' (Booked)'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <motion.button whileHover={!booking ? { scale: 1.02 } : {}} whileTap={!booking ? { scale: 0.98 } : {}} onClick={handleBook} disabled={booking}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 800, fontSize: 14, cursor: booking ? 'wait' : 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 20px rgba(13,196,161,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {booking ? 'Confirming...' : 'Confirm Appointment'}
          {!booking && <ArrowRight size={15} />}
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ── Main Component ── */
export default function SymptomAnalysis() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [phase, setPhase] = useState('input');   // input | analyzing | result | emergency
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 10) {
      setError('Please describe your symptoms in at least a few words.');
      return;
    }
    setError(''); setPhase('analyzing');
    try {
      const res = await aiAPI.analyzeSymptoms({ symptoms });
      const data = res.data;
      if (data.isEmergency) { setResult(data); setPhase('emergency'); }
      else { setResult(data); setPhase('result'); }
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setPhase('input');
    }
  };

  const handleReset = () => { setSymptoms(''); setPhase('input'); setResult(null); setError(''); };

  const urg = result?.aiAnalysis?.urgency?.level || 'routine';
  const urgStyle = URGENCY[urg] || URGENCY.routine;

  return (
    <Layout>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `${P.teal}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color={P.teal} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: P.ink, letterSpacing: '-1px', margin: 0 }}>AI Symptom Analysis</h1>
        </div>
        <p style={{ fontSize: 14, color: P.sub, margin: 0, paddingLeft: 50 }}>Describe what you're feeling — our AI will recommend the right specialist.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* LEFT — main card */}
        <div style={{ background: P.white, borderRadius: 24, border: `1px solid ${P.border}`, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>

          <AnimatePresence mode="wait">

            {/* INPUT PHASE */}
            {phase === 'input' && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: '32px' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: P.ink, display: 'block', marginBottom: 10 }}>
                  Describe your symptoms <span style={{ color: P.coral }}>*</span>
                </label>
                <textarea
                  value={symptoms}
                  onChange={e => { setSymptoms(e.target.value); setError(''); }}
                  placeholder="e.g. I've had a dull chest ache for 3 days, sometimes radiating to my left arm. I feel breathless when climbing stairs and feel unusually tired..."
                  rows={6}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: `1.5px solid ${error ? P.error : symptoms.length > 0 ? P.teal : 'rgba(0,0,0,0.08)'}`, background: P.sky, outline: 'none', fontSize: 14, color: P.ink, fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.65, resize: 'vertical', transition: 'border-color 0.3s', boxSizing: 'border-box' }}
                />
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 12, color: P.error, fontWeight: 600, margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlertTriangle size={12} />{error}
                  </motion.p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <span style={{ fontSize: 12, color: symptoms.length < 10 ? P.muted : P.teal, fontWeight: 600 }}>
                    {symptoms.length} characters {symptoms.length < 10 ? '(min 10)' : '✓'}
                  </span>
                  <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={handleAnalyze} disabled={symptoms.length < 10}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 28px', borderRadius: 14, border: 'none', background: symptoms.length >= 10 ? `linear-gradient(135deg, ${P.teal}, ${P.tealDk})` : 'rgba(0,0,0,0.06)', color: symptoms.length >= 10 ? 'white' : P.muted, fontWeight: 800, fontSize: 14, cursor: symptoms.length >= 10 ? 'pointer' : 'not-allowed', fontFamily: "'Inter', system-ui, sans-serif", boxShadow: symptoms.length >= 10 ? '0 6px 20px rgba(13,196,161,0.28)' : 'none', transition: 'all 0.3s' }}>
                    <Brain size={16} /> Analyze symptoms
                  </motion.button>
                </div>

                {/* Example prompts */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${P.border}` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: P.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try an example</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {EXAMPLE_SYMPTOMS.map((ex, i) => (
                      <button key={i} onClick={() => { setSymptoms(ex); setError(''); }}
                        style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 11, border: `1px solid ${P.border}`, background: P.sky, cursor: 'pointer', fontSize: 12.5, color: P.sub, fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = P.teal; e.currentTarget.style.color = P.ink; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.sub; }}>
                        {ex.length > 90 ? ex.slice(0, 90) + '…' : ex}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ANALYZING PHASE */}
            {phase === 'analyzing' && <motion.div key="analyzing"><AnalyzingState /></motion.div>}

            {/* EMERGENCY PHASE */}
            {phase === 'emergency' && (
              <motion.div key="emergency" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '40px 32px' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF0F0', border: '2px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <AlertTriangle size={30} color="#DC2626" />
                  </motion.div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: '#DC2626', letterSpacing: '-0.7px', margin: '0 0 10px' }}>Emergency Detected</h2>
                  <p style={{ fontSize: 15, color: P.sub, lineHeight: 1.65, maxWidth: 440, margin: '0 auto' }}>
                    {result?.aiAnalysis?.emergency?.message || 'Your symptoms may indicate a life-threatening condition. Please seek emergency care immediately.'}
                  </p>
                </div>
                <div style={{ background: '#FFF0F0', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 18, padding: '24px', marginBottom: 20 }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: '#DC2626', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={16} /> Call 112 immediately
                  </p>
                  <p style={{ fontSize: 14, color: P.sub, margin: '0 0 12px', lineHeight: 1.65 }}>
                    Do not wait. Do not drive yourself. Call emergency services or have someone take you to the nearest ER right now.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(result?.aiAnalysis?.red_flags || []).map(f => (
                      <span key={f} style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>⚠ {f}</span>
                    ))}
                  </div>
                </div>
                <button onClick={handleReset} style={{ width: '100%', padding: '12px', borderRadius: 14, border: `1px solid ${P.border}`, background: 'transparent', color: P.sub, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Start new analysis
                </button>
              </motion.div>
            )}

            {/* RESULT PHASE */}
            {phase === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px' }}>

                {/* Urgency banner */}
                <div style={{ padding: '16px 20px', borderRadius: 16, background: urgStyle.bg, border: `1.5px solid ${urgStyle.color}22`, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                      style={{ width: 10, height: 10, borderRadius: '50%', background: urgStyle.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: urgStyle.color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Urgency Level</p>
                      <p style={{ fontSize: 18, fontWeight: 900, color: urgStyle.color, letterSpacing: '-0.4px', margin: 0 }}>{urgStyle.label}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: urgStyle.color, fontWeight: 600 }}>{urgStyle.note}</span>
                </div>

                {/* Recommended specialist */}
                <div style={{ background: P.sky, borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Recommended Specialist</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: P.ink, letterSpacing: '-0.8px', margin: '0 0 6px' }}>
                    {result.aiAnalysis?.primary_recommendation?.specialization || result.aiAnalysis?.doctor_search_query?.primary_specialization}
                  </p>
                  <p style={{ fontSize: 13, color: P.sub, margin: 0, lineHeight: 1.6 }}>
                    {result.aiAnalysis?.primary_recommendation?.reasoning}
                  </p>
                </div>

                {/* Red flags */}
                {result.aiAnalysis?.red_flags?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>Red Flags Detected</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {result.aiAnalysis.red_flags.map(f => (
                        <span key={f} style={{ fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 8, background: 'rgba(232,96,76,0.06)', color: P.coral, border: `1px solid ${P.coral}15` }}>⚠ {f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence + action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 12, color: P.muted, margin: '0 0 4px', fontWeight: 600 }}>AI Confidence</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.aiAnalysis?.primary_recommendation?.confidence === 'high' ? 92 : result.aiAnalysis?.primary_recommendation?.confidence === 'medium' ? 72 : 55}%` }} transition={{ duration: 0.8 }}
                          style={{ height: '100%', background: `linear-gradient(90deg, ${P.teal}, ${P.tealDk})`, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>{result.aiAnalysis?.primary_recommendation?.confidence === 'high' ? 92 : result.aiAnalysis?.primary_recommendation?.confidence === 'medium' ? 72 : 55}%</span>
                    </div>
                  </div>
                  <button onClick={handleReset}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: P.muted, background: 'none', border: `1px solid ${P.border}`, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    <RefreshCw size={13} /> New analysis
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — doctors sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Doctors header */}
          <div style={{ background: P.white, borderRadius: 20, padding: '20px', border: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={16} color={P.teal} />
              <p style={{ fontSize: 13, fontWeight: 800, color: P.ink, margin: 0 }}>
                {phase === 'result' && result?.doctors?.length > 0
                  ? `${result.doctors.length} doctors matched`
                  : 'Matched Doctors'}
              </p>
            </div>
            <p style={{ fontSize: 12, color: P.muted, margin: 0 }}>
              {phase === 'result' ? 'Based on your symptom analysis' : 'Will appear after analysis'}
            </p>
          </div>

          {/* Doctor cards */}
          {phase === 'result' && result?.doctors?.length > 0
            ? result.doctors.map((doc, i) => (
              <DoctorCard key={doc.id} doc={doc} i={i}
                onBook={doc => setBookingDoctor(doc)} />
            ))
            : phase === 'result' && result?.doctors?.length === 0
              ? (
                <div style={{ background: P.white, borderRadius: 20, padding: '28px 20px', border: `1px solid ${P.border}`, textAlign: 'center' }}>
                  <MapPin size={28} color={P.muted} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: P.ink, margin: '0 0 8px' }}>No doctors found nearby</p>
                  <p style={{ fontSize: 12, color: P.muted, lineHeight: 1.6, margin: '0 0 16px' }}>Try searching in a nearby city or contact us to expand the network.</p>
                  <button onClick={() => navigate('/doctors')}
                    style={{ fontSize: 13, fontWeight: 700, color: P.teal, background: 'none', border: `1px solid ${P.teal}30`, padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    Browse all doctors
                  </button>
                </div>
              )
              : (
                /* Placeholder skeleton */
                <div style={{ background: P.white, borderRadius: 20, padding: '28px 20px', border: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: P.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={22} color={P.muted} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: P.muted, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                    Matched doctors will appear here after you analyze your symptoms.
                  </p>
                </div>
              )
          }

          {/* Disclaimer */}
          <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', display: 'flex', gap: 10 }}>
            <Shield size={14} color={P.blue} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 11, color: P.sub, lineHeight: 1.6, margin: 0 }}>
              This AI analysis is for guidance only and does not replace professional medical advice. Always consult a qualified doctor.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {bookingDoctor && (
          <BookingModal
            doctor={bookingDoctor}
            analysisResult={result}
            onClose={() => setBookingDoctor(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}