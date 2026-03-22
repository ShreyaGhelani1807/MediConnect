import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const { login }     = useAdmin();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(1200px 600px at 10% -10%, rgba(19,185,129,0.18), transparent 60%), #08101c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      {[
        { w: 500, h: 500, bg: 'radial-gradient(circle, rgba(11,37,69,0.6) 0%, transparent 70%)', top: '-10%', left: '-10%' },
        { w: 400, h: 400, bg: 'radial-gradient(circle, rgba(13,196,161,0.08) 0%, transparent 70%)', bottom: '-10%', right: '-5%' },
        { w: 300, h: 300, bg: 'radial-gradient(circle, rgba(232,96,76,0.06) 0%, transparent 70%)', top: '30%', right: '10%' },
      ].map((orb, i) => (
        <div key={i} style={{ position: 'absolute', width: orb.w, height: orb.h, background: orb.bg, borderRadius: '50%', top: orb.top, left: orb.left, bottom: orb.bottom, right: orb.right, pointerEvents: 'none' }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 420, margin: '0 16px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24, padding: '48px 40px',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 24px 80px rgba(8, 16, 28, 0.55)'
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24,
            boxShadow: '0 8px 24px rgba(13,196,161,0.3)'
          }}>🛡️</div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
            MediConnect — Doctor Verification
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@mediconnect.in"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Enter your password"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(13,196,161,0.5)' : 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
              border: 'none', borderRadius: 12, color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(13,196,161,0.3)'
            }}
          >
            {loading ? 'Signing in…' : 'Sign In to Admin Portal'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          Restricted access — MediConnect team only
        </p>
      </motion.div>
    </div>
  );
}