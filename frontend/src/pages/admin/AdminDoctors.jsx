import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [reason, setReason] = useState('');
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#fff', borderRadius: 20, padding: 32,
          width: '100%', maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)'
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0B2545' }}>
          Reject {doctor.name}
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748B' }}>
          Please provide a clear reason — this will be recorded for {doctor.email}.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Medical registration number could not be verified. Please resubmit with a valid MCI certificate."
          rows={4}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: '1.5px solid rgba(11,37,69,0.15)', fontSize: 13,
            fontFamily: 'Inter, sans-serif', resize: 'vertical',
            color: '#0B2545', outline: 'none', boxSizing: 'border-box',
            lineHeight: 1.6
          }}
        />
        <p style={{ margin: '6px 0 24px', fontSize: 11, color: '#94A3B8' }}>
          {reason.length}/10 minimum characters
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            border: '1.5px solid rgba(11,37,69,0.15)',
            background: 'transparent', color: '#64748B',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none',
            background: loading ? 'rgba(232,96,76,0.5)' : 'linear-gradient(135deg, #E8604C, #c94a38)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter'
          }}>
            {loading ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDoctors() {
  const { admin, logout }             = useAdmin();
  const navigate                      = useNavigate();
  const [filter, setFilter]           = useState('pending');
  const [doctors, setDoctors]         = useState([]);
  const [summary, setSummary]         = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]         = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDoctors = async (status) => {
    setLoading(true);
    try {
      const res = await adminAPI.getDoctors(status === 'all' ? '' : status);
      setDoctors(res.data.doctors);
      setSummary(res.data.summary);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(filter); }, [filter]);

  const handleApprove = async (id, name) => {
    setActionLoading(id);
    try {
      await adminAPI.approveDoctor(id);
      toast.success(`Dr. ${name} approved!`);
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

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7FF', fontFamily: 'Inter, sans-serif' }}>
      {/* Topbar */}
      <div style={{
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(11,37,69,0.08)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/admin/dashboard" style={{ color: '#64748B', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            ← Dashboard
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(11,37,69,0.1)' }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0B2545' }}>Doctor Verification Queue</span>
        </div>
        <button onClick={() => { logout(); navigate('/admin/login'); }} style={{
          padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(232,96,76,0.3)',
          background: 'rgba(232,96,76,0.08)', color: '#E8604C',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
        }}>Logout</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#0B2545' }}>Doctor Verification</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748B' }}>
            Review and approve doctor registrations before they appear in patient search.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24,
          background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)',
          borderRadius: 14, padding: 6, width: 'fit-content',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 2px 12px rgba(11,37,69,0.06)'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: filter === tab.key ? '#0B2545' : 'transparent',
                color: filter === tab.key ? '#fff' : '#64748B',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Inter', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              {tab.label}
              <span style={{
                background: filter === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(11,37,69,0.08)',
                padding: '1px 7px', borderRadius: 20, fontSize: 11
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Doctor Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B', fontSize: 14 }}>
            Loading doctors…
          </div>
        ) : doctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '80px 0',
              background: 'rgba(255,255,255,0.65)', borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.8)'
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {filter === 'pending' ? '🎉' : filter === 'approved' ? '👨‍⚕️' : '📋'}
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0B2545' }}>
              {filter === 'pending' ? 'No pending doctors!' : `No ${filter} doctors yet`}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748B' }}>
              {filter === 'pending' ? 'All registrations have been reviewed.' : ''}
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {doctors.map((doc, i) => {
                const st = STATUS_CONFIG[doc.verificationStatus] || STATUS_CONFIG.pending;
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)',
                      borderRadius: 20, padding: '24px 28px',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 4px 20px rgba(11,37,69,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                      {/* Doctor Info */}
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'linear-gradient(135deg, #0B2545, #1a3a6e)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 16, fontWeight: 800, flexShrink: 0
                          }}>
                            {doc.name.split(' ').pop()[0]}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0B2545' }}>{doc.name}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>{doc.email}</p>
                          </div>
                          <span style={{
                            marginLeft: 4, padding: '3px 10px', borderRadius: 20,
                            background: st.bg, color: st.color,
                            fontSize: 11, fontWeight: 700
                          }}>{st.label}</span>
                        </div>

                        {/* Details grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '6px 20px' }}>
                          {[
                            { label: 'Specialization', value: doc.specialization },
                            { label: 'Qualification',  value: doc.qualifications || '—' },
                            { label: 'Experience',     value: doc.experienceYears ? `${doc.experienceYears} years` : '—' },
                            { label: 'Fee',            value: doc.consultationFee ? `₹${doc.consultationFee}` : '—' },
                            { label: 'City',           value: doc.city || '—' },
                            { label: 'Clinic',         value: doc.clinicAddress || '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                              <p style={{ margin: '1px 0 0', fontSize: 12, color: '#374151', fontWeight: 500 }}>{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Rejection reason if any */}
                        {doc.rejectionReason && (
                          <div style={{
                            marginTop: 12, padding: '10px 14px',
                            background: 'rgba(232,96,76,0.06)',
                            borderRadius: 10, border: '1px solid rgba(232,96,76,0.15)'
                          }}>
                            <p style={{ margin: 0, fontSize: 11, color: '#E8604C', fontWeight: 700 }}>REJECTION REASON</p>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#374151' }}>{doc.rejectionReason}</p>
                          </div>
                        )}

                        <p style={{ margin: '12px 0 0', fontSize: 11, color: '#94A3B8' }}>
                          Registered {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {doc.verificationStatus === 'pending' && (
                        <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignSelf: 'center' }}>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            disabled={actionLoading === doc.id}
                            onClick={() => handleApprove(doc.id, doc.name)}
                            style={{
                              padding: '10px 22px', borderRadius: 12, border: 'none',
                              background: actionLoading === doc.id ? 'rgba(13,196,161,0.4)' : 'linear-gradient(135deg, #0DC4A1, #0B9E82)',
                              color: '#fff', fontSize: 13, fontWeight: 700,
                              cursor: actionLoading === doc.id ? 'not-allowed' : 'pointer',
                              fontFamily: 'Inter',
                              boxShadow: '0 4px 14px rgba(13,196,161,0.3)'
                            }}
                          >
                            {actionLoading === doc.id ? '…' : '✓ Approve'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            disabled={actionLoading === doc.id}
                            onClick={() => setRejectTarget(doc)}
                            style={{
                              padding: '10px 22px', borderRadius: 12,
                              border: '1.5px solid rgba(232,96,76,0.3)',
                              background: 'rgba(232,96,76,0.06)',
                              color: '#E8604C', fontSize: 13, fontWeight: 700,
                              cursor: actionLoading === doc.id ? 'not-allowed' : 'pointer',
                              fontFamily: 'Inter'
                            }}
                          >
                            ✕ Reject
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Reject Modal */}
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