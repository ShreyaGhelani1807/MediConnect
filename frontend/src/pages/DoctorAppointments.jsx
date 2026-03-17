import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronDown, RefreshCw, User, IndianRupee, MapPin,
  Loader, X, FileText, Star, Stethoscope
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

// ── Appointment Card ───────────────────────────────────────────────────────────
function AppointmentCard({ appt, index, onUpdate }) {
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

      {/* Update Button — shown for pending/confirmed */}
      {(status === "pending" || status === "confirmed") && (
        <div className="mt-4 pt-3.5 flex justify-end"
          style={{ borderTop: "1px solid rgba(11,37,69,0.06)" }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onUpdate(appt)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
            <ChevronDown size={12} /> Update Status
          </motion.button>
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
        patientName: a.patient?.name || a.patient?.user?.name || a.patientName || "Patient",
        patientAge:  a.patient?.age        || a.patientAge  || null,
        patientGender: a.patient?.gender   || a.patientGender || null,
        status: (a.status || "pending").toLowerCase(),
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
                  onUpdate={(a) => setModalTarget(a)} />
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
    </div>
  );
}