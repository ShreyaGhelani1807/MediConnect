import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Heart, FileText, PhoneCall, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientAPI } from '../services/api';

const P = {
  navy: '#0B2545', navyLt: '#13356B', teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF', ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  white: '#FFFFFF', border: 'rgba(0,0,0,0.06)'
};

const cardStyle = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 8px 32px rgba(11,37,69,0.07)',
  padding: '24px 28px',
  marginBottom: 24,
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: `1.5px solid rgba(0,0,0,0.07)`,
  background: 'rgba(255,255,255,0.6)',
  outline: 'none',
  fontSize: 14,
  color: P.ink,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 500,
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: P.ink,
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

function SectionCard({ title, icon: Icon, children, onSave, saving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.teal}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={P.teal} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: P.navy, margin: 0, letterSpacing: '-0.5px' }}>{title}</h2>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: P.white, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(13,196,161,0.3)', fontFamily: 'Inter' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving' : 'Save'}
        </motion.button>
      </div>
      {children}
    </motion.div>
  );
}

export default function PatientProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '', phone: '', city: '',
    age: '', gender: '', bloodGroup: '',
    medicalHistory: '', emergencyContact: '',
    profilePhoto: ''
  });
  const [savingSections, setSavingSections] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await patientAPI.getProfile();
      setProfile(prev => ({ ...prev, ...data }));
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (section, fields) => {
    setSavingSections(prev => ({ ...prev, [section]: true }));
    try {
      const updateData = {};
      fields.forEach(f => updateData[f] = profile[f]);
      await patientAPI.updateProfile(updateData);
      toast.success(`${section} updated successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update ${section}`);
    } finally {
      setSavingSections(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} color={P.teal} style={{ animation: 'spin 1.5s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: P.navy, margin: '0 0 8px', letterSpacing: '-1px' }}>My Profile</h1>
        <p style={{ fontSize: 14, color: P.sub, margin: 0 }}>Manage your personal and medical details.</p>
      </motion.div>

      {/* Photo Section */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.white, fontSize: 32, fontWeight: 800, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
          {profile.profilePhoto ? <img src={profile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.name?.[0] || 'U')}
        </div>
        <div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${P.border}`, background: 'transparent', color: P.sub, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <Camera size={14} /> Change Photo
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        <div>
          <SectionCard title="Personal Details" icon={User} onSave={() => handleUpdate('Personal Details', ['name', 'phone', 'city'])} saving={savingSections['Personal Details']}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Full Name</label><input name="name" value={profile.name || ''} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>Phone Number</label><input name="phone" value={profile.phone || ''} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={labelStyle}>City</label><input name="city" value={profile.city || ''} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </SectionCard>

          <SectionCard title="Emergency Contact" icon={PhoneCall} onSave={() => handleUpdate('Emergency Contact', ['emergencyContact'])} saving={savingSections['Emergency Contact']}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Contact Name & Number</label><input name="emergencyContact" value={profile.emergencyContact || ''} onChange={handleChange} placeholder="e.g. John Doe, 9876543210" style={inputStyle} /></div>
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Health Profile" icon={Heart} onSave={() => handleUpdate('Health Profile', ['age', 'gender', 'bloodGroup'])} saving={savingSections['Health Profile']}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Age</label><input type="number" name="age" value={profile.age || ''} onChange={handleChange} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Blood Group</label>
                  <select name="bloodGroup" value={profile.bloodGroup || ''} onChange={handleChange} style={inputStyle}>
                    <option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                  </select>
                </div>
              </div>
              <div><label style={labelStyle}>Gender</label>
                <select name="gender" value={profile.gender || ''} onChange={handleChange} style={inputStyle}>
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Medical History" icon={FileText} onSave={() => handleUpdate('Medical History', ['medicalHistory'])} saving={savingSections['Medical History']}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Past Conditions & Surgeries</label>
                <textarea name="medicalHistory" value={profile.medicalHistory || ''} onChange={handleChange} rows={4} style={{...inputStyle, resize: 'vertical'}} placeholder="Briefly describe your medical history..."></textarea>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}