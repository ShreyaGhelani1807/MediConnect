import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientAPI } from '../services/api';

import {
  Brain, Calendar, Clock, ArrowRight, CheckCircle,
  AlertTriangle, Star, MapPin, ChevronRight, Zap, Activity
} from 'lucide-react';

const P = {
  navy: '#0B2545', navyLt: '#13356B',
  teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF', white: '#FFFFFF',
  ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  coral: '#E8604C', amber: '#F4A261', emerald: '#059669', blue: '#3B82F6',
  border: 'rgba(0,0,0,0.06)',
};

const URGENCY_COLOR = { routine: P.emerald, soon: P.amber, urgent: P.coral, emergency: '#DC2626' };
const STATUS_COLOR  = { pending: P.amber, confirmed: P.teal, completed: P.emerald, cancelled: P.muted };
const STATUS_LABEL  = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, color, sub, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
      style={{ background: P.white, borderRadius: 20, padding: '24px', border: `1px solid ${P.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={21} color={color} />
        </div>
      </div>
      <p style={{ fontSize: 30, fontWeight: 900, color: P.ink, letterSpacing: '-1.5px', margin: '0 0 4px' }}>{value}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: P.sub, margin: 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: P.muted, margin: '4px 0 0' }}>{sub}</p>}
    </motion.div>
  );
}

/* ── Appointment Row ── */
function AppointmentCard({ appt, i }) {
  const urgency = appt.aiSymptomAnalysis?.urgency_level || 'routine';
  const uColor  = URGENCY_COLOR[urgency] || P.muted;
  const sColor  = STATUS_COLOR[appt.status]  || P.muted;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: P.white, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.03)' }}>

      {/* Doctor avatar */}
      <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'white', flexShrink: 0 }}>
        {appt.doctor?.user?.name?.[0] || 'D'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: P.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {appt.doctor?.user?.name || 'Doctor'}
          </p>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: `${sColor}12`, color: sColor }}>
            {STATUS_LABEL[appt.status]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: P.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Activity size={11} />{appt.doctor?.specialization}
          </span>
          <span style={{ fontSize: 12, color: P.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} />
            {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
          </span>
          <span style={{ fontSize: 12, color: P.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} />{appt.timeSlot?.startTime || '—'}
          </span>
        </div>
      </div>

      {/* Urgency badge */}
      {urgency !== 'routine' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: `${uColor}10`, border: `1px solid ${uColor}20` }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: uColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: uColor, textTransform: 'capitalize' }}>{urgency}</span>
        </div>
      )}
    </motion.div>
  );
}

/* ── Next Appointment Card ── */
function NextAppointmentCard({ appt }) {
  if (!appt) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      style={{ marginBottom: 32, padding: '24px 32px', borderRadius: 20, background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 32px rgba(13,196,161,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calendar size={26} color="white" />
        </div>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
            Next Appointment
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Dr. {appt.doctor?.user?.name || 'Doctor'}</h3>
            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{appt.doctor?.specialization}</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', fontSize: 14, fontWeight: 700 }}>
          <Calendar size={14} style={{ opacity: 0.8 }} />
          {new Date(appt.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', fontSize: 14, fontWeight: 700 }}>
          <Clock size={14} style={{ opacity: 0.8 }} />
          {appt.timeSlot?.startTime || '—'}
        </div>
      </div>
    </motion.div>
  );
}

export default function PatientDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    patientAPI.getAppointments()
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming  = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const nextAppt = upcoming.sort((a,b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: P.muted, fontWeight: 600, margin: '0 0 4px' }}>{greeting()},</p>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: P.ink, letterSpacing: '-1.5px', margin: '0 0 4px' }}>
          {user?.name || 'there'} 👋
        </h1>
        <p style={{ fontSize: 14, color: P.sub, margin: 0 }}>Here's your health overview for today.</p>
      </motion.div>

      {/* Next Appointment Highlight */}
      <NextAppointmentCard appt={nextAppt} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Calendar}  label="Upcoming"  value={upcoming.length}  color={P.teal}    sub="appointments"  delay={0}    />
        <StatCard icon={CheckCircle} label="Completed" value={completed.length} color={P.emerald} sub="visits"        delay={0.06} />
        <StatCard icon={AlertTriangle} label="Cancelled" value={cancelled.length} color={P.coral} sub="appointments"  delay={0.12} />
        <StatCard icon={Star} label="Total visits" value={appointments.length} color={P.blue} sub="all time"       delay={0.18} />
      </div>

      {/* AI CTA Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        onClick={() => navigate('/symptoms')}
        style={{ marginBottom: 32, borderRadius: 22, padding: '28px 32px', background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(13,196,161,0.12), transparent 70%)` }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${P.teal}20`, border: `1px solid ${P.teal}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} color={P.teal} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: P.teal, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Symptom Analysis</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.7px', margin: '0 0 6px' }}>
            Not feeling well?
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Describe your symptoms and our AI will recommend the right specialist.
          </p>
        </div>
        <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, background: P.teal, color: P.navy, fontWeight: 800, fontSize: 14, flexShrink: 0, position: 'relative', zIndex: 1 }}>
          Analyze now <ArrowRight size={15} />
        </motion.div>
      </motion.div>

      {/* Appointments List */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: P.ink, letterSpacing: '-0.5px', margin: 0 }}>Your Appointments</h2>
          <button onClick={() => navigate('/appointments')}
            style={{ fontSize: 13, fontWeight: 700, color: P.teal, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
            View all <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 78, borderRadius: 16, background: 'rgba(0,0,0,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: P.white, borderRadius: 20, border: `1px solid ${P.border}` }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: `${P.teal}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Calendar size={26} color={P.teal} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: P.ink, margin: '0 0 8px' }}>No appointments yet</p>
            <p style={{ fontSize: 13, color: P.muted, margin: '0 0 20px' }}>Start by analyzing your symptoms to find the right doctor.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/symptoms')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Zap size={14} /> Analyze symptoms
            </motion.button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appointments.slice(0, 5).map((appt, i) => (
              <AppointmentCard key={appt.id} appt={appt} i={i} />
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}