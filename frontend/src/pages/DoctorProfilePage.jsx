import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Star, MapPin, Award, ArrowLeft, Calendar as CalIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorsAPI } from '../services/api';

const P = { navy: '#0B2545', teal: '#0DC4A1', tealDk: '#09A888', sky: '#F0F7FF', ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8', white: '#FFFFFF', border: 'rgba(0,0,0,0.06)', emerald: '#059669', amber: '#F4A261' };

const cardStyle = { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(11,37,69,0.07)' };

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    doctorsAPI.getById(id)
      .then(res => setDoctor(res.data))
      .catch(() => toast.error('Failed to load doctor profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: P.sky }}><Loader2 size={32} color={P.teal} style={{ animation: 'spin 1.5s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>;
  if (!doctor) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: P.sky, color: P.navy, fontSize: 18, fontWeight: 700, fontFamily: 'Inter' }}>Doctor not found</div>;

  const dname = doctor.user?.name || doctor.name || 'Doctor';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: P.sky, paddingBottom: 100 }}>
      {/* Navbar Minimal */}
      <div style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'white', border: `1px solid ${P.border}`, borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}><ArrowLeft size={18} color={P.navy} /></button>
        <span style={{ fontSize: 20, fontWeight: 900, color: P.navy, letterSpacing: '-0.5px' }}>Medi<span style={{ color: P.teal }}>Connect</span></span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardStyle, padding: 32, marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: `radial-gradient(circle, ${P.teal}15, transparent 70%)`, borderRadius: '50%' }} />
          
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, flexShrink: 0, boxShadow: '0 12px 24px rgba(11,37,69,0.15)', border: '4px solid white' }}>
            {dname[0]}
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 900, color: P.navy, margin: '0 0 4px', letterSpacing: '-1px' }}>Dr. {dname}</h1>
                <p style={{ fontSize: 16, color: P.tealDk, fontWeight: 700, margin: 0 }}>{doctor.specialization}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: P.ink, margin: '0 0 4px', letterSpacing: '-1px' }}>₹{doctor.consultationFee}</p>
                <p style={{ fontSize: 12, color: P.sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Per Consultation</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Award size={18} color={P.muted}/><span style={{ fontSize: 14, color: P.ink, fontWeight: 600 }}>{doctor.experienceYears} Years Exp.</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Star size={18} color={P.amber} fill={P.amber} /><span style={{ fontSize: 14, color: P.ink, fontWeight: 600 }}>{doctor.averageRating?.toFixed(1) || '4.8'} / 5</span></div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ ...cardStyle, padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: P.navy, margin: '0 0 16px' }}>About Doctor</h2>
          <p style={{ fontSize: 15, color: P.sub, lineHeight: 1.8, margin: 0 }}>{doctor.bio || `Dr. ${dname} is a highly experienced ${doctor.specialization} with ${doctor.experienceYears} years of expertise. Dedicated to providing compassionate care and utilizing the latest medical advancements to ensure patient well-being.`}</p>
          
          <div style={{ margin: '24px 0', height: 1, background: P.border }} />

          <h2 style={{ fontSize: 20, fontWeight: 800, color: P.navy, margin: '0 0 16px' }}>Clinic Details</h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.teal}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={20} color={P.teal} /></div>
            <div>
              <p style={{ fontSize: 15, color: P.ink, fontWeight: 600, margin: '0 0 4px' }}>{doctor.clinicAddress || 'City Hospital'}</p>
              <p style={{ fontSize: 13, color: P.sub, margin: 0 }}>{doctor.city || 'Location not specified'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...cardStyle, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: P.navy, margin: '0 0 24px' }}>Patient Reviews</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { name: 'R. Sharma', text: 'Very patient and explained everything clearly. Highly recommend.', rating: 5 },
              { name: 'A. Gupta', text: 'Wait time was minimal, and the consultation was very thorough.', rating: 5 },
              { name: 'M. Patel', text: 'Great doctor, very reassuring and professional.', rating: 4 }
            ].map((r, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 16, background: P.sky, border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: P.ink }}>{r.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} color={s <= r.rating ? P.amber : P.muted} fill={s <= r.rating ? P.amber : 'none'} />)}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: P.sub, margin: 0, lineHeight: 1.6 }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 24, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', borderTop: `1px solid rgba(255,255,255,0.9)`, boxShadow: '0 -8px 32px rgba(11,37,69,0.05)', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <button onClick={() => navigate(`/book/${doctor.id}`)} style={{ maxWidth: 800, width: '100%', padding: '16px', borderRadius: 16, background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, border: 'none', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(13,196,161,0.3)', fontFamily: 'Inter', transition: 'transform 0.2s' }}>
          <CalIcon size={20} /> Book Appointment
        </button>
      </div>
    </div>
  );
}
