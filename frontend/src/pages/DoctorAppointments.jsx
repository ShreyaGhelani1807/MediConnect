import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { prescriptionAPI } from "../services/api";
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronDown, RefreshCw, User, IndianRupee, MapPin,
  Loader, X, FileText, Star, Stethoscope, Pill, Plus, Trash2, Bell
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// ── Status Config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: "Pending",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: AlertCircle },
  confirmed: { label: "Confirmed", color: "#0DC4A1", bg: "rgba(13,196,161,0.1)",  icon: CheckCircle },
  completed: { label: "Completed", color: "#059669", bg: "rgba(5,150,105,0.1)",   icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "#E8604C", bg: "rgba(232,96,76,0.1)",   icon: XCircle    },
};

function StatusBadge({ status }) {
  const cfg  = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ── Status Update Modal ────────────────────────────────────────────────────────
function StatusModal({ appointment, onClose, onSuccess }) {
  const [status,     setStatus]     = useState(appointment.status?.toLowerCase() || "pending");
  const [notes,      setNotes]      = useState(appointment.doctorNotes || "");
  const [submitting, setSubmitting] = useState(false);

  const STATUS_OPTIONS = [
    { value: "confirmed", label: "Confirmed",  icon: CheckCircle, color: "#0DC4A1" },
    { value: "completed", label: "Completed",  icon: CheckCircle, color: "#059669" },
    { value: "cancelled", label: "Cancelled",  icon: XCircle,     color: "#E8604C" },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("mediconnect_token");
      await axios.put(
        `${API_BASE}/appointments/${appointment.id}/status`,
        { status, ...(notes.trim() ? { doctorNotes: notes.trim() } : {}) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Appointment marked as ${status}`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(11,37,69,0.4)", backdropFilter: "blur(6px)", zIndex: 1000 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="rounded-3xl p-6 w-full max-w-md"
        style={{ background: "#fff", boxShadow: "0 32px 80px rgba(11,37,69,0.18)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: "#0B2545" }}>Update Appointment</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={16} style={{ color: "#64748b" }} />
          </button>
        </div>

        {/* Patient Info */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
          style={{ background: "rgba(13,196,161,0.06)", border: "1px solid rgba(13,196,161,0.12)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0B2545, #0DC4A1)" }}>
            {appointment.patientName?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#0B2545" }}>
              {appointment.patientName || "Patient"}
            </p>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric", month: "short"
              })} · {appointment.timeSlot?.startTime}
            </p>
          </div>
        </div>

        {/* Status Options */}
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
          Set Status
        </p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {STATUS_OPTIONS.map((opt) => {
            const Icon   = opt.icon;
            const active = status === opt.value;
            return (
              <motion.button key={opt.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStatus(opt.value)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: active ? opt.color : "rgba(11,37,69,0.04)",
                  color:      active ? "white"    : "#64748b",
                  border:     `1px solid ${active ? "transparent" : "rgba(11,37,69,0.08)"}`,
                }}>
                <Icon size={16} />
                {opt.label}
              </motion.button>
            );
          })}
        </div>

        {/* Doctor Notes */}
        <div className="mb-5">
          <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#64748b" }}>
            <FileText size={11} style={{ color: "#0DC4A1" }} />
            Doctor's Notes <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="Diagnosis, prescription notes, follow-up instructions..."
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: "#F0F7FF", border: "1px solid rgba(11,37,69,0.1)",
              color: "#0B2545", fontFamily: "Inter, sans-serif"
            }} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(11,37,69,0.06)", color: "#0B2545" }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)", opacity: submitting ? 0.8 : 1 }}>
            {submitting ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {submitting ? "Saving…" : "Update Status"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Add Prescription Modal ─────────────────────────────────────────────────────
function AddPrescriptionModal({ appointment, onClose, onSuccess }) {
  const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
  const [medicines,    setMedicines]    = useState([{ ...EMPTY_MED }]);
  const [notes,        setNotes]        = useState('');
  const [reminderTimes, setReminderTimes] = useState(['']);
  const [submitting,   setSubmitting]   = useState(false);

  const addMedicine    = () => setMedicines(m => [...m, { ...EMPTY_MED }]);
  const removeMedicine = (i) => setMedicines(m => m.filter((_, idx) => idx !== i));
  const updateMed      = (i, field, val) => setMedicines(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));

  const addReminder    = () => setReminderTimes(r => [...r, '']);
  const removeReminder = (i) => setReminderTimes(r => r.filter((_, idx) => idx !== i));
  const updateReminder = (i, val) => setReminderTimes(r => r.map((t, idx) => idx === i ? val : t));

  const handleSubmit = async () => {
    const validMeds = medicines.filter(m => m.name.trim());
    if (validMeds.length === 0) { toast.error('Add at least one medicine name'); return; }
    setSubmitting(true);
    try {
      await prescriptionAPI.addPrescription(appointment.id, {
        medicines: validMeds,
        notes: notes.trim() || undefined,
        reminderTimes: reminderTimes.filter(t => t.trim()),
      });
      toast.success('Prescription added successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(11,37,69,0.12)', background: '#F0F7FF', fontSize: 13, color: '#0B2545', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,37,69,0.45)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        style={{ background: '#fff', borderRadius: 24, padding: '28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(11,37,69,0.2)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(13,196,161,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={17} color="#0DC4A1" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0B2545' }}>Add Prescription</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>for {appointment.patientName || 'Patient'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} style={{ color: '#64748b' }} />
          </button>
        </div>

        {/* Medicines */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Medicines *</p>
            <motion.button whileHover={{ scale: 1.03 }} onClick={addMedicine}
              style={{ fontSize: 12, fontWeight: 700, color: '#0DC4A1', background: 'rgba(13,196,161,0.1)', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter, sans-serif' }}>
              <Plus size={12} /> Add Medicine
            </motion.button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {medicines.map((med, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 14, background: 'rgba(13,196,161,0.05)', border: '1px solid rgba(13,196,161,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0DC4A1' }}>Medicine {i + 1}</span>
                  {medicines.length > 1 && (
                    <button onClick={() => removeMedicine(i)} style={{ background: 'rgba(232,96,76,0.08)', border: 'none', borderRadius: 7, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={12} style={{ color: '#E8604C' }} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input placeholder="Medicine name *" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} style={{ ...inputStyle, gridColumn: '1/-1' }} />
                  <input placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} style={inputStyle} />
                  <input placeholder="Frequency (e.g. Twice daily)" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} style={inputStyle} />
                  <input placeholder="Duration (e.g. 7 days)" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} style={inputStyle} />
                  <input placeholder="Instructions (optional)" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} style={{ ...inputStyle, gridColumn: '1/-1' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Doctor's Notes <span style={{ fontWeight: 400 }}>(optional)</span></p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Diagnosis summary, follow-up instructions, dietary advice..."
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
        </div>

        {/* Reminder Times */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={13} style={{ color: '#F59E0B' }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Reminder Times <span style={{ fontWeight: 400 }}>(optional)</span></p>
            </div>
            <button onClick={addReminder} style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>+ Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {reminderTimes.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '5px 5px 5px 10px' }}>
                <input type="time" value={t} onChange={e => updateReminder(i, e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#B45309', outline: 'none', fontFamily: 'Inter, sans-serif', width: 90 }} />
                {reminderTimes.length > 1 && (
                  <button onClick={() => removeReminder(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                    <X size={12} style={{ color: '#94a3b8' }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(11,37,69,0.12)', background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={submitting}
            style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: submitting ? 'rgba(13,196,161,0.5)' : 'linear-gradient(135deg, #0DC4A1, #0B2545)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting ? <Loader size={14} className="animate-spin" /> : <Pill size={14} />}
            {submitting ? 'Saving…' : 'Save Prescription'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── View Prescription Modal ─────────────────────────────────────────────────────
function ViewPrescriptionModal({ appointmentId, patientName, onClose }) {
  const [rx, setRx]         = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getByAppointment(appointmentId)
      .then(r => setRx(r.data.prescription))
      .catch(() => toast.error('Could not load prescription'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,37,69,0.45)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        style={{ background: '#fff', borderRadius: 24, padding: '28px', width: '100%', maxWidth: 500, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(11,37,69,0.2)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(13,196,161,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={17} color="#0DC4A1" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0B2545' }}>Prescription</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{patientName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} style={{ color: '#64748b' }} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader size={28} style={{ color: '#0DC4A1', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : !rx ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>No prescription found.</div>
        ) : (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>Medicines</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {(rx.medicines || []).map((med, i) => (
                <div key={i} style={{ padding: '13px 16px', borderRadius: 14, background: 'rgba(13,196,161,0.06)', border: '1px solid rgba(13,196,161,0.15)' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0B2545', margin: '0 0 5px' }}>{med.name}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {med.dosage     && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(11,37,69,0.08)', color: '#64748b', fontWeight: 600 }}>{med.dosage}</span>}
                    {med.frequency  && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(13,196,161,0.12)', color: '#0B9E82', fontWeight: 600 }}>{med.frequency}</span>}
                    {med.duration   && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(244,162,97,0.15)', color: '#B45309', fontWeight: 600 }}>{med.duration}</span>}
                  </div>
                  {med.instructions && <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0', fontStyle: 'italic' }}>{med.instructions}</p>}
                </div>
              ))}
            </div>
            {rx.notes && (
              <div style={{ padding: '13px 16px', borderRadius: 14, background: '#F0F7FF', border: '1px solid rgba(11,37,69,0.08)', marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Your Notes</p>
                <p style={{ fontSize: 13, color: '#0B2545', margin: 0, lineHeight: 1.65 }}>{rx.notes}</p>
              </div>
            )}
            {rx.reminderTimes?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Bell size={13} style={{ color: '#F59E0B' }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Reminder Times</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {rx.reminderTimes.map((t, i) => (
                    <span key={i} style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 9, background: 'rgba(245,158,11,0.1)', color: '#B45309', border: '1px solid rgba(245,158,11,0.2)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={onClose} style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0DC4A1, #0B2545)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Close</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Appointment Card ───────────────────────────────────────────────────────────
function AppointmentCard({ appt, index, onUpdate, onAddRx, onViewRx }) {
  const status = appt.status?.toLowerCase() || "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(11,37,69,0.08)",
      }}>

      {/* Top row */}
      <div className="flex items-start gap-4">
        {/* Patient avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0B2545, #13356B)" }}>
          {appt.patientName?.charAt(0)?.toUpperCase() || "P"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-sm" style={{ color: "#0B2545" }}>
                {appt.patientName || "Patient"}
              </h3>
              {appt.patientAge && (
                <p className="text-xs" style={{ color: "#64748b" }}>
                  Age {appt.patientAge} · {appt.patientGender || ""}
                </p>
              )}
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Date / Time chips */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: "rgba(11,37,69,0.05)", color: "#64748b" }}>
              <Calendar size={10} />
              {new Date(appt.appointmentDate).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </span>
            {appt.timeSlot && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(11,37,69,0.05)", color: "#64748b" }}>
                <Clock size={10} />
                {appt.timeSlot.startTime}
                {appt.timeSlot.endTime ? ` – ${appt.timeSlot.endTime}` : ""}
              </span>
            )}
            {appt.consultationFee && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(232,96,76,0.07)", color: "#E8604C" }}>
                <IndianRupee size={9} />₹{appt.consultationFee}
              </span>
            )}
          </div>

          {/* Reason */}
          {appt.reasonForVisit && (
            <p className="text-xs mt-2 italic" style={{ color: "#94a3b8" }}>
              "{appt.reasonForVisit}"
            </p>
          )}

          {/* Doctor Notes */}
          {appt.doctorNotes && (
            <div className="mt-2.5 p-2.5 rounded-xl text-xs"
              style={{
                background: "rgba(13,196,161,0.07)",
                border: "1px solid rgba(13,196,161,0.15)",
                color: "#0B2545"
              }}>
              <span className="font-semibold" style={{ color: "#0DC4A1" }}>Your note: </span>
              {appt.doctorNotes}
            </div>
          )}

          {/* Rating (if patient rated) */}
          {appt.rating && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} size={11}
                  fill={n <= (appt.rating?.rating || appt.rating || 0) ? "#F59E0B" : "none"}
                  color={n <= (appt.rating?.rating || appt.rating || 0) ? "#F59E0B" : "#CBD5E1"} />
              ))}
              <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                Patient review
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(status === "pending" || status === "confirmed" || status === "completed") && (
        <div className="mt-4 pt-3.5 flex items-center gap-2 flex-wrap"
          style={{ borderTop: "1px solid rgba(11,37,69,0.06)" }}>
          {(status === "pending" || status === "confirmed") && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onUpdate(appt)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
              <ChevronDown size={12} /> Update Status
            </motion.button>
          )}
          {status === "completed" && !appt.hasPrescription && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onAddRx(appt)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(13,196,161,0.1)", color: "#0DC4A1", border: "1px solid rgba(13,196,161,0.25)" }}>
              <Pill size={12} /> Add Prescription
            </motion.button>
          )}
          {status === "completed" && appt.hasPrescription && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onViewRx(appt)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(13,196,161,0.08)", color: "#0B9E82", border: "1px solid rgba(13,196,161,0.2)" }}>
              <Pill size={12} /> View Rx
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl p-5 animate-pulse"
    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(11,37,69,0.08)" }}>
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-slate-200 rounded-full w-20" />
          <div className="h-5 bg-slate-200 rounded-full w-16" />
        </div>
      </div>
      <div className="h-5 bg-slate-200 rounded-full w-20 flex-shrink-0" />
    </div>
  </div>
);

// ── Filter Tabs ────────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");
  const [modalTarget,  setModalTarget]  = useState(null);
  const [addRxTarget,  setAddRxTarget]  = useState(null);
  const [viewRxTarget, setViewRxTarget] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("mediconnect_token");
      const res   = await axios.get(`${API_BASE}/doctor/appointments/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Normalize: backend returns appointments array
      const raw = res.data.appointments || res.data || [];
      // Flatten patient name from nested user object
      const normalized = raw.map((a) => ({
        ...a,
        patientName:   a.patient?.name || a.patient?.user?.name || a.patientName || "Patient",
        patientAge:    a.patient?.age        || a.patientAge  || null,
        patientGender: a.patient?.gender   || a.patientGender || null,
        status:        (a.status || "pending").toLowerCase(),
        hasPrescription: !!a.prescription,
      }));
      setAppointments(normalized);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const filtered = appointments.filter(
    (a) => filter === "all" || a.status === filter
  );

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "all"
      ? appointments.length
      : appointments.filter((a) => a.status === t.key).length;
    return acc;
  }, {});

  // Summary stats
  const stats = [
    { label: "Total",     value: appointments.length,                                             color: "#0B2545" },
    { label: "Pending",   value: appointments.filter(a => a.status === "pending").length,         color: "#F59E0B" },
    { label: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length,       color: "#0DC4A1" },
    { label: "Completed", value: appointments.filter(a => a.status === "completed").length,       color: "#059669" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: "#F0F7FF" }}>
      {/* BG orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #0DC4A1, transparent)", top: "5%", right: "5%" }} />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #0B2545, transparent)", bottom: "10%", left: "3%" }} />
      </div>

      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#0B2545", fontFamily: "Inter, sans-serif" }}>
                Appointments
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                Manage and update your patient appointments
              </p>
            </div>
            <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
              onClick={fetchAppointments}
              className="p-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(11,37,69,0.08)", color: "#0B2545" }}>
              <RefreshCw size={15} />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="rounded-2xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "#94a3b8" }}>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex gap-1.5 flex-wrap mb-5 p-1.5 rounded-2xl w-fit"
          style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
          {FILTER_TABS.map((tab) => (
            <motion.button key={tab.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(tab.key)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              style={{
                background: filter === tab.key ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : "transparent",
                color:      filter === tab.key ? "white" : "#64748b",
              }}>
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    background: filter === tab.key ? "rgba(255,255,255,0.25)" : "rgba(11,37,69,0.08)",
                    color:      filter === tab.key ? "white" : "#0B2545",
                  }}>
                  {counts[tab.key]}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(24px)" }}>
            <Stethoscope size={44} className="mx-auto mb-4" style={{ color: "#CBD5E1" }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: "#0B2545" }}>
              {filter === "all" ? "No appointments yet" : `No ${filter} appointments`}
            </h3>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {filter === "all"
                ? "Appointments will appear here once patients book with you."
                : `You have no ${filter} appointments at this time.`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((appt, i) => (
                <AppointmentCard key={appt.id} appt={appt} index={i}
                  onUpdate={(a) => setModalTarget(a)}
                  onAddRx={(a) => setAddRxTarget(a)}
                  onViewRx={(a) => setViewRxTarget(a)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Status Update Modal ── */}
      <AnimatePresence>
        {modalTarget && (
          <StatusModal
            appointment={modalTarget}
            onClose={() => setModalTarget(null)}
            onSuccess={() => { setModalTarget(null); fetchAppointments(); }}
          />
        )}
      </AnimatePresence>

      {/* ── Add Prescription Modal ── */}
      <AnimatePresence>
        {addRxTarget && (
          <AddPrescriptionModal
            appointment={addRxTarget}
            onClose={() => setAddRxTarget(null)}
            onSuccess={() => {
              setAddRxTarget(null);
              // Mark locally as having prescription
              setAppointments(prev => prev.map(a => a.id === addRxTarget.id ? { ...a, hasPrescription: true } : a));
            }}
          />
        )}
      </AnimatePresence>

      {/* ── View Prescription Modal ── */}
      <AnimatePresence>
        {viewRxTarget && (
          <ViewPrescriptionModal
            appointmentId={viewRxTarget.id}
            patientName={viewRxTarget.patientName}
            onClose={() => setViewRxTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}