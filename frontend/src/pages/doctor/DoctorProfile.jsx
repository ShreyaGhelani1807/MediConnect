import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Stethoscope, Lock, Save, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorAPI } from '../../services/api';

const P = {
  navy: '#0B2545', navyLt: '#13356B', teal: '#0DC4A1', tealDk: '#09A888',
  sky: '#F0F7FF', ink: '#0B1F3A', sub: '#64748B', muted: '#94A3B8',
  white: '#FFFFFF', border: 'rgba(0,0,0,0.06)', coral: '#E8604C', emerald: '#059669'
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
  border: '1.5px solid rgba(0,0,0,0.07)',
  background: 'rgba(255,255,255,0.6)',
  outline: 'none',
  fontSize: 14,
  color: P.ink,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  boxSizing: 'border-box'
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: P.ink, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' };

const SPECIALIZATIONS = ['General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 'Pediatrician', 'Gynecologist', 'Psychiatrist', 'Ophthalmologist', 'ENT Specialist'];

function SectionCard({ title, icon: Icon, children, onSave, saving, headerExtra }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.teal}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={P.teal} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: P.navy, margin: 0, letterSpacing: '-0.5px' }}>{title}</h2>
          {headerExtra}
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${P.teal}, ${P.tealDk})`, color: P.white, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(13,196,161,0.3)', fontFamily: 'Inter' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
        </motion.button>
      </div>
      {children}
    </motion.div>
  );
}

export default function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingSections, setSavingSections] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await doctorAPI.getProfile();
      setProfile(data);
    } catch { 
      toast.error('Failed to load profile'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdate = async (section, fields) => {
    setSavingSections(p => ({ ...p, [section]: true }));
    try {
      const updateData = {};
      fields.forEach(f => updateData[f] = profile[f]);
      await doctorAPI.updateProfile(updateData);
      toast.success(`${section} updated successfully`);
    } catch (err) { 
      toast.error(err.response?.data?.error || `Failed to update ${section}`); 
    } finally { 
      setSavingSections(p => ({ ...p, [section]: false })); 
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    setSavingSections(p => ({ ...p, Password: true }));
    try {
      await doctorAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Failed to change password'); 
    } finally { 
      setSavingSections(p => ({ ...p, Password: false })); 
    }
  };

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} color={P.teal} style={{ animation: 'spin 1.5s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: P.navy, margin: '0 0 8px', letterSpacing: '-1px' }}>Doctor Profile</h1>
        <p style={{ fontSize: 14, color: P.sub, margin: 0 }}>Manage your practice and personal details.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: `linear-gradient(135deg, ${P.navy}, ${P.navyLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.white, fontSize: 32, fontWeight: 800 }}>
          {profile.user?.name?.[0] || profile.name?.[0] || 'D'}
        </div>
        <div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${P.border}`, background: 'transparent', color: P.sub, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <Camera size={14} /> Change Photo
          </button>
        </div>
      </motion.div>

      <SectionCard title="Personal Details" icon={User} onSave={() => handleUpdate('Personal Details', ['name', 'phone', 'city'])} saving={savingSections['Personal Details']}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
          <div><label style={labelStyle}>Full Name</label><input name="name" value={profile.name || profile.user?.name || ''} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Phone Number</label><input name="phone" value={profile.phone || ''} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>City</label><input name="city" value={profile.city || ''} onChange={handleChange} style={inputStyle} /></div>
        </div>
      </SectionCard>

      <SectionCard title="Professional Details" icon={Stethoscope} onSave={() => handleUpdate('Professional Details', ['specialization', 'qualifications', 'experienceYears', 'consultationFee', 'clinicAddress', 'bio', 'isAcceptingPatients'])} saving={savingSections['Professional Details']}
        headerExtra={
          <div style={{ marginLeft: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: P.sub }}>Accepting Patients</span>
            <div onClick={() => setProfile({ ...profile, isAcceptingPatients: !profile.isAcceptingPatients })} style={{ width: 44, height: 24, borderRadius: 12, background: profile.isAcceptingPatients ? P.emerald : P.coral, display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer', transition: 'background 0.3s' }}>
              <motion.div animate={{ x: profile.isAcceptingPatients ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ width: 20, height: 20, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profile.isAcceptingPatients ? <Check size={12} color={P.emerald} /> : <X size={12} color={P.coral} />}
              </motion.div>
            </div>
          </div>
        }>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
          <div><label style={labelStyle}>Specialization</label><select name="specialization" value={profile.specialization || ''} onChange={handleChange} style={inputStyle}><option value="">Select...</option>{SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>Experience (Years)</label><input type="number" name="experienceYears" value={profile.experienceYears || ''} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Qualifications</label><input name="qualifications" value={profile.qualifications || ''} onChange={handleChange} placeholder="e.g. MBBS, MD" style={inputStyle} /></div>
          <div><label style={labelStyle}>Consultation Fee (INR)</label><input type="number" name="consultationFee" value={profile.consultationFee || ''} onChange={handleChange} style={inputStyle} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Clinic Address</label><input name="clinicAddress" value={profile.clinicAddress || ''} onChange={handleChange} style={inputStyle} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Bio</label><textarea name="bio" value={profile.bio || ''} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></div>
        </div>
      </SectionCard>

      <SectionCard title="Change Password" icon={Lock} onSave={handlePasswordChange} saving={savingSections['Password']}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Current Password</label><input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePassChange} style={{ ...inputStyle, maxWidth: 400 }} /></div>
          <div><label style={labelStyle}>New Password</label><input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePassChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Confirm New Password</label><input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePassChange} style={inputStyle} /></div>
        </div>
      </SectionCard>
    </div>
  );
}
