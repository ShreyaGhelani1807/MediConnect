import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Loader2, Calendar as CalIcon, FileText, CheckCircle, Clock, XCircle, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientAPI, appointmentAPI, prescriptionAPI } from '../services/api';

const P = { navy: '#0B2545', teal: '#0DC4A1', tealDk: '#09A888', sky: '#F0F7FF', ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8', white: '#FFFFFF', border: 'rgba(0,0,0,0.06)', coral: '#E8604C', emerald: '#059669', amber: '#F4A261' };

const STATUS = { pending: { bg: 'rgba(245,158,11,0.12)', color: '#D97706', icon: Clock }, confirmed: { bg: 'rgba(13,196,161,0.12)', color: '#0B9E82', icon: CheckCircle }, completed: { bg: 'rgba(5,150,105,0.12)', color: '#059669', icon: CheckCircle }, cancelled: { bg: 'rgba(232,96,76,0.12)', color: P.coral, icon: XCircle } };

const cardStyle = { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(11,37,69,0.07)' };


function PrescViewModal({ appointment, onClose }) {
  const [presc, setPresc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getByAppointment(appointment.id)
      .then(res => setPresc(res.data))
      .catch(() => toast.error('Failed to load prescription'))
      .finally(() => setLoading(false));
  }, [appointment.id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,37,69,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: P.white, borderRadius: 24, width: '100%', maxWidth: 500, padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color={P.sub} /></button>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: P.navy, margin: '0 0 6px' }}>Prescription</h2>
        <p style={{ fontSize: 13, color: P.sub, margin: '0 0 24px' }}>Dr. {appointment.doctor?.name || appointment.doctor?.user?.name}</p>
        
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Loader2 size={24} className="animate-spin" color={P.teal}/></div> : !presc ? <p style={{ color: P.sub, fontSize: 14 }}>No prescription found.</p> : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {(presc.medicines || []).map((m, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 12, background: P.sky, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: P.ink, margin: '0 0 4px' }}>{m.name}</h4>
                  <p style={{ fontSize: 13, color: P.sub, margin: 0 }}>{m.dosage} • {m.frequency} • {m.duration}</p>
                  {m.instructions && <p style={{ fontSize: 12, color: P.tealDk, margin: '8px 0 0', fontWeight: 600 }}>{m.instructions}</p>}
                </div>
              ))}
            </div>
            {presc.notes && (
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(244,162,97,0.1)', border: '1px solid rgba(244,162,97,0.2)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing:'0.05em' }}>Doctor's Advice</h4>
                <p style={{ fontSize: 13, color: P.ink, margin: 0, lineHeight: 1.5 }}>"{presc.notes}"</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function PatientAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [viewPrescId, setViewPrescId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await patientAPI.getAppointments();
      setAppointments(data.appointments || []);
    } catch { toast.error('Failed to load appointments'); } finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentAPI.updateStatus(id, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch { toast.error('Failed to cancel appointment'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Loader2 size={32} color={P.teal} style={{ animation: 'spin 1.5s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>;

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const past = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));
  
  const activeList = tab === 'upcoming' ? upcoming : past;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: P.navy, margin: '0 0 8px', letterSpacing: '-1px' }}>My Appointments</h1>
        <p style={{ fontSize: 14, color: P.sub, margin: 0 }}>View your scheduled visits and medical history.</p>
      </motion.div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
          { id: 'past', label: 'Past', count: past.length }
        ].map(t => {
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 16px', borderRadius: 20, border: isActive ? 'none' : `1.5px solid rgba(0,0,0,0.08)`, background: isActive ? `linear-gradient(135deg, ${P.navy}, ${P.navyLt})` : 'rgba(255,255,255,0.5)', color: isActive ? 'white' : P.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s' }}>
              {t.label} <span style={{ padding: '2px 8px', borderRadius: 10, background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', fontSize: 11, color: isActive ? 'white' : P.ink }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {activeList.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CalIcon size={28} color={P.muted} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: P.ink, margin: '0 0 8px' }}>No {tab} appointments</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeList.map((a, i) => {
            const sts = STATUS[a.status] || STATUS.pending;
            const StIcon = sts.icon;
            let dateStr = a.date;
            try { dateStr = format(new Date(a.date), 'EEEE, d MMMM yyyy'); } catch(e){}

            const dname = a.doctor?.user?.name || a.doctor?.name || 'Doctor';
            const spec = a.doctor?.specialization || '';

            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} style={{ ...cardStyle }}>
                <div style={{ padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                  <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                      {dname[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: P.ink, margin: '0 0 4px' }}>Dr. {dname}</h3>
                      <p style={{ fontSize: 13, color: P.sub, margin: '0 0 12px' }}>{spec}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: P.ink, fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CalIcon size={14} color={P.muted}/> {dateStr}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} color={P.muted}/> {a.timeSlot?.startTime}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <span style={{ padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: sts.bg, color: sts.color, display: 'flex', alignItems: 'center', gap: 6 }}><StIcon size={14}/> {a.status}</span>
                    
                    {a.status === 'pending' && (
                      <button onClick={() => handleCancel(a.id)} style={{ padding: '8px 16px', borderRadius: 10, background: 'transparent', border: `1px solid ${P.coral}40`, color: P.coral, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>Cancel</button>
                    )}
                    {a.status === 'completed' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ padding: '8px 16px', borderRadius: 10, background: 'transparent', border: `1.5px solid rgba(11,37,69,0.15)`, color: P.navy, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter' }}><Star size={14} /> Rate</button>
                        <button onClick={() => setViewPrescId(a)} style={{ padding: '8px 16px', borderRadius: 10, background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(13,196,161,0.25)', fontFamily: 'Inter' }}><FileText size={14} /> View Prescription</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {viewPrescId && <PrescViewModal appointment={viewPrescId} onClose={() => setViewPrescId(null)} />}
      </AnimatePresence>
    </div>
  );
}