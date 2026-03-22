import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Users, Clock, CheckCircle, FileText, Plus, X, Loader2, Save, Calendar as CalIcon, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorAPI, appointmentAPI, prescriptionAPI } from '../../services/api';

const P = { navy: '#0B2545', teal: '#0DC4A1', tealDk: '#09A888', sky: '#F0F7FF', ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8', white: '#FFFFFF', border: 'rgba(0,0,0,0.06)', coral: '#E8604C', emerald: '#059669', amber: '#F4A261' };

const URGENCY = { routine: { color: P.emerald, bg: '#ECFDF5', label: 'Routine' }, soon: { color: P.amber, bg: '#FFFBEB', label: 'Soon' }, urgent: { color: P.coral, bg: '#FEF2F0', label: 'Urgent' }, emergency: { color: '#DC2626', bg: '#FFF0F0', label: 'Emergency' } };

const STATUS = { pending: { bg: 'rgba(245,158,11,0.12)', color: '#D97706' }, confirmed: { bg: 'rgba(13,196,161,0.12)', color: '#0B9E82' }, completed: { bg: 'rgba(5,150,105,0.12)', color: '#059669' }, cancelled: { bg: 'rgba(232,96,76,0.12)', color: P.coral } };

const cardStyle = { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(11,37,69,0.07)' };

function PrescriptionModal({ appointment, onClose, onSubmit }) {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [reminderTimes, setReminderTimes] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleReminder = (time) => {
    if (reminderTimes.includes(time)) setReminderTimes(reminderTimes.filter(t => t !== time));
    else setReminderTimes([...reminderTimes, time]);
  };

  const handleAddMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const handleRemoveMedicine = (idx) => setMedicines(medicines.filter((_, i) => i !== idx));
  const updateMedicine = (idx, field, val) => { const newMeds = [...medicines]; newMeds[idx][field] = val; setMedicines(newMeds); };

  const submit = async () => {
    setSaving(true);
    try {
      await onSubmit(appointment.id, { medicines, notes, reminderTimes });
      toast.success('Prescription added');
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add prescription'); } finally { setSaving(false); }
  };

  const inputCss = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: P.sky, outline: 'none', fontSize: 13, color: P.ink, fontFamily: 'Inter', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,37,69,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: P.white, borderRadius: 24, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color={P.sub} /></button>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: P.navy, margin: '0 0 6px' }}>Add Prescription</h2>
        <p style={{ fontSize: 13, color: P.sub, margin: '0 0 24px' }}>For {appointment.patient?.name} • {appointment.reasonForVisit}</p>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: P.ink, margin: 0 }}>Medicines</h3>
            <button onClick={handleAddMedicine} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${P.teal}15`, border: 'none', color: P.tealDk, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Plus size={14} /> Add Medicine</button>
          </div>
          {medicines.map((m, i) => (
            <div key={i} style={{ background: P.sky, padding: 16, borderRadius: 16, marginBottom: 16, position: 'relative', border: '1px solid rgba(0,0,0,0.05)' }}>
              {medicines.length > 1 && <button onClick={() => handleRemoveMedicine(i)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: P.coral, cursor: 'pointer' }}><X size={16}/></button>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.muted, marginBottom: 4 }}>Medicine Name</label><input style={inputCss} value={m.name} onChange={e => updateMedicine(i, 'name', e.target.value)} placeholder="e.g. Paracetamol" /></div>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.muted, marginBottom: 4 }}>Dosage</label><input style={inputCss} value={m.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} placeholder="e.g. 500mg" /></div>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.muted, marginBottom: 4 }}>Frequency</label><input style={inputCss} value={m.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} placeholder="e.g. Twice a day" /></div>
                <div><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.muted, marginBottom: 4 }}>Duration</label><input style={inputCss} value={m.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} placeholder="e.g. 5 days" /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.muted, marginBottom: 4 }}>Instructions</label><input style={inputCss} value={m.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} placeholder="e.g. After meals" /></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: P.ink, margin: '0 0 12px' }}>Reminders for Patient</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{v:'08:00', l:'Morning'}, {v:'13:00', l:'Afternoon'}, {v:'20:00', l:'Evening'}].map(t => (
              <label key={t.v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: P.ink }}>
                <input type="checkbox" checked={reminderTimes.includes(t.v)} onChange={() => toggleReminder(t.v)} /> {t.l} ({t.v})
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: P.ink, margin: '0 0 12px' }}>Doctor's Notes (Optional)</h3>
          <textarea style={{ ...inputCss, resize: 'vertical' }} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional advice..." />
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submit} disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: 'white', fontWeight: 800, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(13,196,161,0.3)', fontFamily: 'Inter' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Prescription
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [appts, setAppts] = useState([]);
  const [prescModal, setPrescModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [profRes, apptsRes] = await Promise.all([ doctorAPI.getProfile(), doctorAPI.getTodayAppointments() ]);
      setProfile(profRes.data);
      setAppts(apptsRes.data.appointments || []);
    } catch { toast.error('Failed to load dashboard'); } finally { setLoading(false); }
  };

  const markComplete = async (id) => {
    try {
      await appointmentAPI.updateStatus(id, { status: 'completed' });
      toast.success('Appointment marked complete');
      setAppts(appts.map(a => a.id === id ? { ...a, status: 'completed' } : a));
    } catch { toast.error('Failed to update status'); }
  };

  const handleAddPresc = async (apptId, data) => {
    await prescriptionAPI.create(apptId, data);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Loader2 size={32} color={P.teal} style={{ animation: 'spin 1.5s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>;

  const todayStr = format(new Date(), 'EEEE, d MMMM yyyy');
  const pending = appts.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
  const completed = appts.filter(a => a.status === 'completed').length;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: P.navy, margin: '0 0 8px', letterSpacing: '-1px' }}>Good morning, Dr. {profile.user?.name || profile.name || 'Doctor'}!</h1>
        <p style={{ fontSize: 14, color: P.sub, margin: 0, fontWeight: 500 }}>{todayStr}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.teal}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color={P.teal} /></div><span style={{ fontSize: 13, fontWeight: 700, color: P.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Appts</span></div>
          <p style={{ fontSize: 36, fontWeight: 900, color: P.navy, margin: 0, letterSpacing: '-1px' }}>{appts.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.amber}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={20} color={P.amber} /></div><span style={{ fontSize: 13, fontWeight: 700, color: P.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</span></div>
          <p style={{ fontSize: 36, fontWeight: 900, color: P.navy, margin: 0, letterSpacing: '-1px' }}>{pending}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.emerald}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} color={P.emerald} /></div><span style={{ fontSize: 13, fontWeight: 700, color: P.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</span></div>
          <p style={{ fontSize: 36, fontWeight: 900, color: P.navy, margin: 0, letterSpacing: '-1px' }}>{completed}</p>
        </motion.div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: P.navy, margin: 0 }}>Today's Queue</h2>
        <span style={{ padding: '4px 10px', borderRadius: 20, background: `${P.teal}15`, color: P.tealDk, fontSize: 12, fontWeight: 700 }}>{appts.length} patients</span>
      </div>

      {appts.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CalIcon size={28} color={P.muted} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: P.ink, margin: '0 0 8px' }}>No appointments today</h3>
          <p style={{ fontSize: 14, color: P.sub, margin: 0 }}>Enjoy your free time or manage your profile.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {appts.map((a, i) => {
            const urg = URGENCY[a.aiSymptomAnalysis?.urgency?.level || 'routine'] || URGENCY.routine;
            const sts = STATUS[a.status] || STATUS.pending;
            const isCompleted = a.status === 'completed';
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} style={{ ...cardStyle, marginBottom: 0, padding: 20, display: 'flex', gap: 24, opacity: isCompleted ? 0.75 : 1 }}>
                <div style={{ width: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${P.border}`, paddingRight: 24, flexShrink: 0 }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: P.navy, margin: '0 0 4px', letterSpacing: '-0.5px' }}>{a.timeSlot?.startTime}</p>
                  <p style={{ fontSize: 12, color: P.muted, fontWeight: 600, margin: 0 }}>{a.timeSlot?.endTime}</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: P.ink, margin: '0 0 4px' }}>{a.patient?.name}</h3>
                      <p style={{ fontSize: 13, color: P.sub, margin: 0 }}>{a.patient?.age} yrs • {a.patient?.gender} • {a.patient?.phone}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: urg.bg, color: urg.color }}>{urg.label}</span>
                      <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: sts.bg, color: sts.color }}>{a.status}</span>
                    </div>
                  </div>
                  
                  {a.aiSymptomAnalysis?.primary_recommendation?.reasoning && (
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', marginBottom: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: P.blue, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={12} /> AI Summary</p>
                      <p style={{ fontSize: 13, color: P.sub, margin: 0, lineHeight: 1.5 }}>{a.aiSymptomAnalysis.primary_recommendation.reasoning}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    {!isCompleted && a.status !== 'cancelled' && (
                      <button onClick={() => markComplete(a.id)} style={{ padding: '8px 16px', borderRadius: 10, background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(13,196,161,0.25)', fontFamily: 'Inter' }}><CheckCircle size={14} /> Mark Complete</button>
                    )}
                    {a.status !== 'cancelled' && (
                      <button onClick={() => setPrescModal(a)} style={{ padding: '8px 16px', borderRadius: 10, background: 'transparent', border: `1.5px solid rgba(11,37,69,0.15)`, color: P.navy, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter' }}><FileText size={14} /> Add Prescription</button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {prescModal && <PrescriptionModal appointment={prescModal} onClose={() => setPrescModal(null)} onSubmit={handleAddPresc} />}
      </AnimatePresence>
    </div>
  );
}
