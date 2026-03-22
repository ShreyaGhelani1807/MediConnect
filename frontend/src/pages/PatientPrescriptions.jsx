import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { prescriptionAPI } from '../services/api';
import {
  Pill, Calendar, Clock, User, FileText, X,
  ChevronDown, ChevronUp, RefreshCw, Bell, CheckCircle, Stethoscope
} from 'lucide-react';

const P = {
  navy: '#0B2545', navyLt: '#13356B',
  teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF', white: '#FFFFFF',
  ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  coral: '#E8604C', amber: '#F4A261', emerald: '#059669',
  border: 'rgba(0,0,0,0.06)',
};

// ── Prescription Detail Modal ─────────────────────────────────────────────────
function PrescriptionModal({ prescription, onClose }) {
  const { medicines, notes, reminderTimes, appointment, createdAt } = prescription;
  const doctorName = appointment?.doctor?.user?.name || 'Doctor';
  const apptDate   = appointment?.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,37,69,0.45)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <motion.div
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        style={{ background: P.white, borderRadius: 26, padding: '32px', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(11,37,69,0.2)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${P.teal}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={18} color={P.teal} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: P.ink, margin: 0, letterSpacing: '-0.5px' }}>Prescription</h2>
            </div>
            <p style={{ fontSize: 13, color: P.sub, margin: 0 }}>
              Dr. {doctorName} · {apptDate}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: P.sub }}>
            <X size={16} />
          </button>
        </div>

        {/* Medicines */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Medicines</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(medicines || []).map((med, i) => (
              <div key={i} style={{ padding: '14px 18px', borderRadius: 14, background: `${P.teal}07`, border: `1px solid ${P.teal}18` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: P.ink, margin: '0 0 4px' }}>{med.name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {med.dosage && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: `${P.navy}08`, color: P.sub }}>{med.dosage}</span>
                      )}
                      {med.frequency && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: `${P.teal}12`, color: P.tealDk }}>{med.frequency}</span>
                      )}
                      {med.duration && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: `${P.amber}15`, color: '#B45309' }}>{med.duration}</span>
                      )}
                    </div>
                    {med.instructions && (
                      <p style={{ fontSize: 12, color: P.sub, margin: '6px 0 0', fontStyle: 'italic' }}>{med.instructions}</p>
                    )}
                  </div>
                  <CheckCircle size={16} color={P.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Notes */}
        {notes && (
          <div style={{ marginBottom: 24, padding: '16px 18px', borderRadius: 14, background: P.sky, border: `1px solid ${P.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Doctor's Notes</p>
            <p style={{ fontSize: 13, color: P.ink, margin: 0, lineHeight: 1.65 }}>{notes}</p>
          </div>
        )}

        {/* Reminder Times */}
        {reminderTimes && reminderTimes.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Bell size={13} color={P.amber} />
              <p style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Daily Reminders</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {reminderTimes.map((t, i) => (
                <span key={i} style={{ fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: `${P.amber}12`, color: '#B45309', border: `1px solid ${P.amber}25` }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ paddingTop: 16, borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 11, color: P.muted, margin: 0 }}>
            Issued {createdAt ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
          <button onClick={onClose}
            style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Prescription Card ─────────────────────────────────────────────────────────
function PrescriptionCard({ prescription, index, onView }) {
  const [expanded, setExpanded] = useState(false);
  const { medicines, notes, appointment, createdAt } = prescription;
  const doctorName = appointment?.doctor?.user?.name || 'Doctor';
  const spec       = appointment?.doctor?.specialization || '';
  const apptDate   = appointment?.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      style={{ background: P.white, borderRadius: 20, border: `1px solid ${P.border}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

      {/* Card header */}
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Doctor avatar */}
          <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: 'white', flexShrink: 0 }}>
            {doctorName[0]?.toUpperCase() || 'D'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: P.ink, margin: '0 0 3px' }}>Dr. {doctorName}</p>
                {spec && <p style={{ fontSize: 12, fontWeight: 600, color: P.teal, margin: 0 }}>{spec}</p>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 7, background: `${P.emerald}10`, color: P.emerald, border: `1px solid ${P.emerald}20` }}>
                {medicines?.length || 0} medicine{(medicines?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: P.sub, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={10} /> {apptDate}
              </span>
              {appointment?.timeSlot?.startTime && (
                <span style={{ fontSize: 11, color: P.sub, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> {appointment.timeSlot.startTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick medicine preview */}
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(medicines || []).slice(0, 3).map((med, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: `${P.teal}10`, color: P.tealDk, border: `1px solid ${P.teal}20` }}>
              {med.name}
            </span>
          ))}
          {(medicines?.length || 0) > 3 && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: 'rgba(0,0,0,0.05)', color: P.muted }}>
              +{medicines.length - 3} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onView(prescription)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
            <Pill size={12} /> View Prescription
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded(e => !e)}
            style={{ padding: '9px 14px', borderRadius: 11, border: `1px solid ${P.border}`, background: P.sky, color: P.sub, fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter, sans-serif' }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Less' : 'More'}
          </motion.button>
        </div>
      </div>

      {/* Expanded notes */}
      <AnimatePresence>
        {expanded && notes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 22px 20px' }}>
              <div style={{ padding: '12px 16px', borderRadius: 12, background: P.sky, border: `1px solid ${P.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Doctor's Notes</p>
                <p style={{ fontSize: 13, color: P.ink, margin: 0, lineHeight: 1.65 }}>{notes}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: P.white, borderRadius: 20, padding: '20px 22px', border: `1px solid ${P.border}`, animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, background: 'rgba(0,0,0,0.06)', borderRadius: 7, width: '55%', marginBottom: 8 }} />
          <div style={{ height: 11, background: 'rgba(0,0,0,0.04)', borderRadius: 5, width: '35%' }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [viewing, setViewing]             = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prescriptionAPI.getAllPatient();
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: `${P.teal}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={20} color={P.teal} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: P.ink, letterSpacing: '-1px', margin: 0 }}>My Prescriptions</h1>
              <p style={{ fontSize: 13, color: P.sub, margin: 0 }}>
                {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} from your visits
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
            onClick={fetchPrescriptions}
            style={{ padding: '9px 14px', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: P.sub, fontFamily: 'Inter, sans-serif' }}>
            <RefreshCw size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : prescriptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '64px 24px', background: P.white, borderRadius: 24, border: `1px solid ${P.border}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `${P.teal}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Stethoscope size={30} color={P.teal} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: P.ink, letterSpacing: '-0.5px', margin: '0 0 10px' }}>No prescriptions yet</h2>
          <p style={{ fontSize: 14, color: P.sub, margin: '0 auto', maxWidth: 380, lineHeight: 1.65 }}>
            Prescriptions from your completed appointments will appear here. Your doctor adds them after your visit.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {prescriptions.map((rx, i) => (
            <PrescriptionCard key={rx.id} prescription={rx} index={i} onView={setViewing} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {viewing && (
          <PrescriptionModal prescription={viewing} onClose={() => setViewing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
