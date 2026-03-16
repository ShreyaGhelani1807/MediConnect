import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import { adminAPI } from '../../services/api';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'rgba(251,191,36,0.12)',  color: '#D97706' },
  approved: { label: 'Approved', bg: 'rgba(13,196,161,0.12)',  color: '#0B9E82' },
  rejected: { label: 'Rejected', bg: 'rgba(232,96,76,0.12)',   color: '#E8604C' },
};

function RejectModal({ doctor, onConfirm, onClose }) {
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) { toast.error('Reason must be at least 10 characters'); return; }
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(8,12,20,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.15)' }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0B2545' }}>Reject {doctor.name}</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
          Provide a clear reason — recorded for {doctor.email}.
        </p>
        <textarea
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g. Medical registration number could not be verified. Please resubmit with a valid MCI certificate."
          rows={4}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: '1.5px solid rgba(11,37,69,0.15)', fontSize: 13,
            fontFamily: 'Inter, sans-serif', resize: 'vertical',
            color: '#0B2545', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6
          }}
        />
        <p style={{ margin: '6px 0 24px', fontSize: 11, color: '#94A3B8' }}>{reason.length} / 10 min characters</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid rgba(11,37,69,0.15)',
            background: 'transparent', color: '#64748B', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none',
            background: loading ? 'rgba(232,96,76,0.5)' : 'linear-gradient(135deg, #E8604C, #c94a38)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter'
          }}>{loading ? 'Rejecting…' : 'Confirm Rejection'}</button>
        </div>
      </motion.div>
    </div>
  );
}

function DoctorCard({ doc, index, onApprove, onReject, actionLoading }) {
  const st = STATUS_CONFIG[doc.verificationStatus] || STATUS_CONFIG.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.04 }}
      style={{
        background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)',
        borderRadius: 18, padding: '22px 24px',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 2px 16px rgba(11,37,69,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        {/* Left — doctor info */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #0B2545, #1a3a6e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 15, fontWeight: 800, flexShrink: 0
            }}>
              {doc.name.split(' ').pop()[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0B2545' }}>{doc.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>{doc.email}</p>
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 20,
              background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, flexShrink: 0
            }}>{st.label}</span>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px 20px' }}>
            {[
              { label: 'Specialization', value: doc.specialization },
              { label: 'Qualification',  value: doc.qualifications || '—' },
              { label: 'Experience',     value: doc.experienceYears ? `${doc.experienceYears} yrs` : '—' },
              { label: 'Consult Fee',    value: doc.consultationFee ? `₹${doc.consultationFee}` : '—' },
              { label: 'City',           value: doc.city || '—' },
              { label: 'Clinic',         value: doc.clinicAddress || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#374151', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Degree Image */}
{doc.degreeImage && (
  <div style={{ marginTop: 14 }}>
    <p style={{ margin: '0 0 8px', fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      Degree Certificate
    </p>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={doc.degreeImage}
        alt="Degree certificate"
        style={{ height: 90, width: 'auto', maxWidth: '100%', borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(11,37,69,0.1)', cursor: 'pointer' }}
        onClick={() => window.open(doc.degreeImage, '_blank')}
        title="Click to view full size"
      />
      <div style={{
        position: 'absolute', bottom: 4, right: 4,
        background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 6px'
      }}>
        <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>🔍 View</span>
      </div>
    </div>
  </div>
)}

          {/* Rejection reason */}
          {doc.rejectionReason && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: 'rgba(232,96,76,0.06)', borderRadius: 10,
              border: '1px solid rgba(232,96,76,0.15)'
            }}>
              <p style={{ margin: 0, fontSize: 10, color: '#E8604C', fontWeight: 700 }}>REJECTION REASON</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#374151' }}>{doc.rejectionReason}</p>
            </div>
          )}

          <p style={{ margin: '10px 0 0', fontSize: 11, color: '#94A3B8' }}>
            Registered {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Right — actions (only for pending) */}
        {doc.verificationStatus === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignSelf: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              disabled={actionLoading === doc.id}
              onClick={() => onApprove(doc.id, doc.name)}
              style={{
                padding: '9px 20px', borderRadius: 10, border: 'none',
                background: actionLoading === doc.id ? 'rgba(13,196,161,0.4)' : 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: actionLoading === doc.id ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter', boxShadow: '0 4px 12px rgba(13,196,161,0.25)',
                whiteSpace: 'nowrap'
              }}
            >
              {actionLoading === doc.id ? '…' : '✓ Approve'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              disabled={actionLoading === doc.id}
              onClick={() => onReject(doc)}
              style={{
                padding: '9px 20px', borderRadius: 10,
                border: '1.5px solid rgba(232,96,76,0.3)',
                background: 'rgba(232,96,76,0.06)', color: '#E8604C',
                fontSize: 13, fontWeight: 700,
                cursor: actionLoading === doc.id ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter', whiteSpace: 'nowrap'
              }}
            >
              ✕ Reject
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { admin, logout }               = useAdmin();
  const navigate                        = useNavigate();
  const [stats, setStats]               = useState(null);
  const [doctors, setDoctors]           = useState([]);
  const [summary, setSummary]           = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter]             = useState('pending');
  const [statsLoading, setStatsLoading] = useState(true);
  const [docsLoading, setDocsLoading]   = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Load stats + doctors in PARALLEL — fixes slow loading
  useEffect(() => {
    setStatsLoading(true);
    adminAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchDoctors = useCallback((status) => {
    setDocsLoading(true);
    adminAPI.getDoctors(status === 'all' ? '' : status)
      .then(r => {
        setDoctors(r.data.doctors);
        setSummary(r.data.summary);
      })
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setDocsLoading(false));
  }, []);

  useEffect(() => { fetchDoctors(filter); }, [filter, fetchDoctors]);

  const handleLogout = () => { logout(); navigate('/admin/login'); toast.success('Logged out'); };

  const handleApprove = async (id, name) => {
    setActionLoading(id);
    try {
      await adminAPI.approveDoctor(id);
      toast.success(`Dr. ${name} approved!`);
      // Refresh both stats and list
      adminAPI.getStats().then(r => setStats(r.data));
      fetchDoctors(filter);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setActionLoading(rejectTarget.id);
    try {
      await adminAPI.rejectDoctor(rejectTarget.id, reason);
      toast.success(`Dr. ${rejectTarget.name} rejected`);
      setRejectTarget(null);
      adminAPI.getStats().then(r => setStats(r.data));
      fetchDoctors(filter);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: 'pending',  label: 'Pending',  count: summary.pending  },
    { key: 'approved', label: 'Approved', count: summary.approved },
    { key: 'rejected', label: 'Rejected', count: summary.rejected },
    { key: 'all',      label: 'All',      count: summary.pending + summary.approved + summary.rejected },
  ];

  const statCards = [
    { icon: '🏥', label: 'Total Doctors',      value: stats?.stats.totalDoctors,      color: '#0DC4A1' },
    { icon: '👤', label: 'Total Patients',     value: stats?.stats.totalPatients,     color: '#0B2545' },
    { icon: '📅', label: 'Total Appointments', value: stats?.stats.totalAppointments, color: '#6366F1' },
    { icon: '⏳', label: 'Pending Approvals',  value: stats?.stats.pendingCount,      color: '#E8604C' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Topbar ───────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(11,37,69,0.08)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>🛡️</div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0B2545' }}>MediConnect Admin</p>
            <p style={{ margin: 0, fontSize: 11, color: '#64748B', fontWeight: 500 }}>Doctor Verification Portal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {summary.pending > 0 && (
            <span style={{
              background: 'rgba(232,96,76,0.1)', color: '#E8604C',
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700
            }}>
              {summary.pending} pending
            </span>
          )}
          <button onClick={handleLogout} style={{
            padding: '8px 18px', borderRadius: 10,
            border: '1px solid rgba(232,96,76,0.3)',
            background: 'rgba(232,96,76,0.08)', color: '#E8604C',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
          }}>Logout</button>
        </div>
      </div>

      {/* ── Page Content ─────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#0B2545' }}>
            Welcome back, {admin?.name} 👋
          </h1>
          <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: 14 }}>
            Review doctor registrations and monitor platform activity.
          </p>
        </motion.div>

        {/* ── Stat Cards ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 40 }}>
          {statCards.map(({ icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)',
                borderRadius: 18, padding: '22px 24px',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 20px rgba(11,37,69,0.05)',
                display: 'flex', alignItems: 'center', gap: 16
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 13,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
              }}>{icon}</div>
              <div>
                {statsLoading
                  ? <div style={{ width: 48, height: 28, borderRadius: 6, background: 'rgba(11,37,69,0.08)', marginBottom: 6 }} />
                  : <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#0B2545', lineHeight: 1 }}>{value ?? 0}</p>
                }
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Doctor Verification Queue ───────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0B2545' }}>Doctor Registrations</h2>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748B' }}>
                Verify doctor credentials before they appear in patient search
              </p>
            </div>

            {/* Filter tabs */}
            <div style={{
              display: 'flex', gap: 6,
              background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)',
              borderRadius: 12, padding: 5,
              border: '1px solid rgba(255,255,255,0.9)',
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none',
                    background: filter === tab.key ? '#0B2545' : 'transparent',
                    color: filter === tab.key ? '#fff' : '#64748B',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'Inter', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  {tab.label}
                  <span style={{
                    background: filter === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(11,37,69,0.08)',
                    padding: '1px 6px', borderRadius: 20, fontSize: 10,
                    color: filter === tab.key ? '#fff' : (tab.key === 'pending' && tab.count > 0 ? '#E8604C' : 'inherit'),
                    fontWeight: 700
                  }}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Doctor list */}
          {docsLoading ? (
            // Skeleton loaders
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  background: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: '22px 24px',
                  border: '1px solid rgba(255,255,255,0.9)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(11,37,69,0.08)' }} />
                    <div>
                      <div style={{ width: 140, height: 14, borderRadius: 6, background: 'rgba(11,37,69,0.08)', marginBottom: 6 }} />
                      <div style={{ width: 200, height: 11, borderRadius: 6, background: 'rgba(11,37,69,0.05)' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[1,2,3,4].map(x => <div key={x} style={{ height: 32, borderRadius: 6, background: 'rgba(11,37,69,0.05)' }} />)}
                  </div>
                </div>
              ))}
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
            </div>
          ) : doctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                textAlign: 'center', padding: '64px 0',
                background: 'rgba(255,255,255,0.7)', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.9)'
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 14 }}>
                {filter === 'pending' ? '🎉' : filter === 'approved' ? '👨‍⚕️' : '📋'}
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0B2545' }}>
                {filter === 'pending' ? 'All caught up — no pending doctors!' : `No ${filter} doctors yet`}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748B' }}>
                {filter === 'pending' ? 'New registrations will appear here.' : ''}
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {doctors.map((doc, i) => (
                  <DoctorCard
                    key={doc.id}
                    doc={doc}
                    index={i}
                    onApprove={handleApprove}
                    onReject={setRejectTarget}
                    actionLoading={actionLoading}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Reject Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            doctor={rejectTarget}
            onConfirm={handleRejectConfirm}
            onClose={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}