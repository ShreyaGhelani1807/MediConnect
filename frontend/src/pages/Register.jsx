import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Role', 'Account', 'Details'];

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid rgba(11,37,69,0.12)',
  background: 'rgba(255,255,255,0.8)',
  fontSize: 13, color: '#0B2545', outline: 'none',
  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#64748B', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em'
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function Register() {
  const { register }   = useAuth();
  const navigate       = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);  // pending screen for doctors
  const [degreePreview, setDegreePreview] = useState(null);

  const [form, setForm] = useState({
    role: '',
    name: '', email: '', password: '', phone: '', city: '',
    // doctor fields
    specialization: '', qualifications: '', experienceYears: '',
    consultationFee: '', clinicAddress: '', bio: '', degreeImage: '',
    // patient fields
    age: '', gender: '', bloodGroup: '',
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleDegreeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      set('degreeImage', ev.target.result);
      setDegreePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (step === 0 && !form.role) { toast.error('Please select a role'); return; }
    if (step === 1) {
      if (!form.name || !form.email || !form.password) { toast.error('Name, email and password are required'); return; }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (form.role === 'doctor') {
      if (!form.specialization) { toast.error('Specialization is required'); return; }
      if (!form.degreeImage)    { toast.error('Please upload your degree certificate'); return; }
    }

    setLoading(true);
    try {
      const payload = {
        role: form.role, name: form.name, email: form.email,
        password: form.password, phone: form.phone, city: form.city,
        ...(form.role === 'doctor' && {
          specialization:  form.specialization,
          qualifications:  form.qualifications,
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
          consultationFee: form.consultationFee ? parseInt(form.consultationFee) : undefined,
          clinicAddress:   form.clinicAddress,
          bio:             form.bio,
          degreeImage:     form.degreeImage,
        })
      };

      const user = await register(payload);

      if (user.role === 'doctor') {
        setDone(true);   // show pending screen — don't redirect
      } else {
        toast.success('Welcome to MediConnect!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Pending approval screen (for doctors after registration) ──
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: 16 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            maxWidth: 480, width: '100%',
            background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)',
            borderRadius: 24, padding: '48px 40px', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 40px rgba(11,37,69,0.08)'
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 20 }}>🕐</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 900, color: '#0B2545' }}>
            Application Submitted!
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>
            Thank you, <strong style={{ color: '#0B2545' }}>{form.name}</strong>! Your application is under review.
          </p>

          <div style={{
            background: 'rgba(13,196,161,0.08)', borderRadius: 16, padding: '20px 24px',
            border: '1px solid rgba(13,196,161,0.2)', marginBottom: 24, textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#0B2545' }}>What happens next?</p>
            {[
              { icon: '🔍', text: 'Our admin team will review your degree and credentials' },
              { icon: '⏱️', text: 'Approval takes up to 12 hours' },
              { icon: '📧', text: `A new MediConnect email & password will be sent to ${form.email}` },
              { icon: '🚀', text: 'Use those credentials to log in to your doctor dashboard' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>

          <Link to="/login" style={{
            display: 'inline-block', padding: '12px 32px', borderRadius: 12,
            background: 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
            color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(13,196,161,0.25)'
          }}>
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #0B2545, #1a3a6e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 22
          }}>🏥</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0B2545' }}>Create Account</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
            Already have one? <Link to="/login" style={{ color: '#0DC4A1', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i <= step ? 'linear-gradient(135deg, #0DC4A1, #0B9E82)' : 'rgba(11,37,69,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                  color: i <= step ? '#fff' : '#94A3B8',
                  transition: 'all 0.3s'
                }}>{i < step ? '✓' : i + 1}</div>
                <span style={{ fontSize: 10, fontWeight: 600, color: i <= step ? '#0DC4A1' : '#94A3B8' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 60, height: 2, margin: '0 4px',
                  background: i < step ? '#0DC4A1' : 'rgba(11,37,69,0.08)',
                  marginBottom: 20, transition: 'background 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)',
            borderRadius: 20, padding: '32px 36px',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 32px rgba(11,37,69,0.07)'
          }}
        >
          {/* ── Step 0: Role ── */}
          {step === 0 && (
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0B2545' }}>I am a…</h3>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748B' }}>Choose how you'll use MediConnect</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { value: 'patient', icon: '🧑‍🤝‍🧑', title: 'Patient', desc: 'Find doctors & book appointments' },
                  { value: 'doctor',  icon: '👨‍⚕️', title: 'Doctor',  desc: 'Manage appointments & patients' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => set('role', opt.value)} style={{
                    padding: '20px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                    border: form.role === opt.value ? '2px solid #0DC4A1' : '2px solid rgba(11,37,69,0.1)',
                    background: form.role === opt.value ? 'rgba(13,196,161,0.06)' : 'transparent',
                    transition: 'all 0.2s', fontFamily: 'Inter'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{opt.icon}</div>
                    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: '#0B2545' }}>{opt.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>

              {form.role === 'doctor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginTop: 16, padding: '12px 16px',
                    background: 'rgba(232,96,76,0.06)', borderRadius: 12,
                    border: '1px solid rgba(232,96,76,0.15)'
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, color: '#E8604C', lineHeight: 1.6 }}>
                    ⚠️ <strong>Doctor accounts require verification.</strong> You'll need to upload your medical degree. 
                    After review (up to 12 hours), your login credentials will be sent to your email.
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* ── Step 1: Account ── */}
          {step === 1 && (
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0B2545' }}>Account Details</h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>Your login information</p>

              <Field label="Full Name *">
                <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Rajesh Sharma" />
              </Field>
              <Field label={form.role === 'doctor' ? 'Personal Email * (for receiving credentials)' : 'Email *'}>
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Password *">
                  <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" />
                </Field>
                <Field label="Phone">
                  <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
                </Field>
              </div>
              <Field label="City">
                <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
              </Field>
            </div>
          )}

          {/* ── Step 2: Role-specific ── */}
          {step === 2 && form.role === 'doctor' && (
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0B2545' }}>Professional Details</h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>This information will be visible to patients</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Specialization *">
                  <select style={inputStyle} value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                    <option value="">Select…</option>
                    {['General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedist','Pediatrician','Gynecologist','Psychiatrist','Ophthalmologist','ENT Specialist','Dentist','Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Experience (years)">
                  <input style={inputStyle} type="number" value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} placeholder="10" />
                </Field>
              </div>

              <Field label="Qualifications">
                <input style={inputStyle} value={form.qualifications} onChange={e => set('qualifications', e.target.value)} placeholder="MBBS, MD (Cardiology)" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Consultation Fee (₹)">
                  <input style={inputStyle} type="number" value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} placeholder="500" />
                </Field>
                <Field label="Clinic / Hospital">
                  <input style={inputStyle} value={form.clinicAddress} onChange={e => set('clinicAddress', e.target.value)} placeholder="Apollo Hospital, Delhi" />
                </Field>
              </div>

              <Field label="Bio">
                <textarea style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} rows={3}
                  value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="Brief description about yourself and your expertise…" />
              </Field>

              {/* Degree Upload */}
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Medical Degree Certificate * <span style={{ color: '#E8604C' }}>(JPG/PNG, max 5MB)</span></label>

                {!degreePreview ? (
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '28px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    border: '2px dashed rgba(11,37,69,0.2)',
                    background: 'rgba(11,37,69,0.02)',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#0B2545' }}>Click to upload degree</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>JPG or PNG • Max 5MB</p>
                    <input type="file" accept="image/*" onChange={handleDegreeUpload} style={{ display: 'none' }} />
                  </label>
                ) : (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(13,196,161,0.4)' }}>
                    <img src={degreePreview} alt="Degree preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: '4px 8px'
                    }}>
                      <label style={{ cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#0DC4A1' }}>
                        Change
                        <input type="file" accept="image/*" onChange={handleDegreeUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'rgba(13,196,161,0.85)', padding: '6px 12px'
                    }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#fff', fontWeight: 700 }}>✓ Degree uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && form.role === 'patient' && (
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0B2545' }}>Health Profile</h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>Optional — helps doctors understand your background</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Age">
                  <input style={inputStyle} type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
                </Field>
                <Field label="Gender">
                  <select style={inputStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select…</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
              </div>
              <Field label="Blood Group">
                <select style={inputStyle} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">Select…</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                border: '1.5px solid rgba(11,37,69,0.15)',
                background: 'transparent', color: '#64748B',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
              }}>← Back</button>
            )}

            {step < 2 ? (
              <motion.button
                onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #0B2545, #1a3a6e)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Inter'
                }}
              >Continue →</motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit} disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(13,196,161,0.5)' : 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(13,196,161,0.3)'
                }}
              >
                {loading ? 'Creating account…' : form.role === 'doctor' ? 'Submit Application 🚀' : 'Create Account 🚀'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}