import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Loader2, Calendar as CalIcon, ChevronDown, ChevronUp, AlertTriangle, FileText, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorAPI } from '../../services/api';

const P = { navy: '#0B2545', teal: '#0DC4A1', tealDk: '#09A888', sky: '#F0F7FF', ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8', white: '#FFFFFF', border: 'rgba(0,0,0,0.06)', coral: '#E8604C', emerald: '#059669', amber: '#F4A261' };

const URGENCY = { routine: { color: P.emerald, bg: '#ECFDF5', label: 'Routine' }, soon: { color: P.amber, bg: '#FFFBEB', label: 'Soon' }, urgent: { color: P.coral, bg: '#FEF2F0', label: 'Urgent' }, emergency: { color: '#DC2626', bg: '#FFF0F0', label: 'Emergency' } };

const STATUS = { pending: { bg: 'rgba(245,158,11,0.12)', color: '#D97706', icon: Clock }, confirmed: { bg: 'rgba(13,196,161,0.12)', color: '#0B9E82', icon: CheckCircle }, completed: { bg: 'rgba(5,150,105,0.12)', color: '#059669', icon: CheckCircle }, cancelled: { bg: 'rgba(232,96,76,0.12)', color: P.coral, icon: XCircle } };

const cardStyle = { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(11,37,69,0.07)', overflow: 'hidden' };

export default function DoctorAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await doctorAPI.getAllAppointments();
      setAppointments(data.appointments || []);
    } catch { toast.error('Failed to load appointments'); } finally { setLoading(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Loader2 size={32} color={P.teal} style={{ animation: 'spin 1.5s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>;

  const tabs = ['All', 'pending', 'confirmed', 'completed', 'cancelled'];
  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: P.navy, margin: '0 0 8px', letterSpacing: '-1px' }}>All Appointments</h1>
        <p style={{ fontSize: 14, color: P.sub, margin: 0 }}>View and manage your complete schedule.</p>
      </motion.div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {tabs.map(t => {
          const isActive = filter === t;
          const count = t === 'All' ? appointments.length : appointments.filter(a => a.status === t).length;
          return (
            <button key={t} onClick={() => setFilter(t)} style={{ padding: '8px 16px', borderRadius: 20, border: isActive ? 'none' : `1.5px solid rgba(0,0,0,0.08)`, background: isActive ? `linear-gradient(135deg, ${P.navy}, ${P.navyLt})` : 'rgba(255,255,255,0.5)', color: isActive ? 'white' : P.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textTransform: 'capitalize', transition: 'all 0.3s', whiteSpace: 'nowrap' }}>
              {t} <span style={{ padding: '2px 8px', borderRadius: 10, background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', fontSize: 11, color: isActive ? 'white' : P.ink }}>{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CalIcon size={28} color={P.muted} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: P.ink, margin: '0 0 8px' }}>No appointments found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((a, i) => {
            const urg = URGENCY[a.aiSymptomAnalysis?.urgency?.level || 'routine'] || URGENCY.routine;
            const sts = STATUS[a.status] || STATUS.pending;
            const isExp = expandedId === a.id;
            const StIcon = sts.icon;
            
            let dateStr = a.date;
            try { dateStr = format(new Date(a.date), 'dd MMM yyyy'); } catch(e){}

            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} style={{ ...cardStyle }}>
                <div onClick={() => setExpandedId(isExp ? null : a.id)} style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ width: 120, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${P.border}`, paddingRight: 24, flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: P.sub, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dateStr}</p>
                    <p style={{ fontSize: 18, fontWeight: 900, color: P.navy, margin: 0, letterSpacing: '-0.5px' }}>{a.timeSlot?.startTime}</p>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: P.ink, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.patient?.name}
                        {a.status === 'completed' && <CheckCircle size={14} color={P.emerald} />}
                      </h3>
                      <p style={{ fontSize: 13, color: P.sub, margin: 0 }}>{a.patient?.age} yrs • {a.patient?.gender}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {a.aiSymptomAnalysis && <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: urg.bg, color: urg.color }}>{urg.label}</span>}
                      <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: sts.bg, color: sts.color, display: 'flex', alignItems: 'center', gap: 4 }}><StIcon size={12}/> {a.status}</span>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isExp ? <ChevronUp size={16} color={P.muted} /> : <ChevronDown size={16} color={P.muted} />}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExp && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${P.border}`, paddingTop: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
                          <div>
                            <h4 style={{ fontSize: 12, fontWeight: 800, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Reason for Visit</h4>
                            <p style={{ fontSize: 14, color: P.ink, margin: '0 0 20px', lineHeight: 1.6 }}>{a.reasonForVisit}</p>
                            
                            {a.aiSymptomAnalysis && (
                              <>
                                <h4 style={{ fontSize: 12, fontWeight: 800, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>AI Symptom Analysis</h4>
                                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                                  <p style={{ fontSize: 13, color: P.ink, margin: 0, lineHeight: 1.6 }}>{a.aiSymptomAnalysis.primary_recommendation?.reasoning}</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div>
                            {a.prescription && (
                              <div style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(13,196,161,0.2)', background: 'rgba(13,196,161,0.05)' }}>
                                <h4 style={{ fontSize: 12, fontWeight: 800, color: P.tealDk, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14}/> Prescription Added</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {(a.prescription.medicines || []).map((m, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: P.ink }}>
                                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                                      <span style={{ color: P.sub }}>{m.dosage} • {m.frequency}</span>
                                    </div>
                                  ))}
                                </div>
                                {a.prescription.notes && <p style={{ fontSize: 12, color: P.sub, margin: '12px 0 0', fontStyle: 'italic' }}>"{a.prescription.notes}"</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
