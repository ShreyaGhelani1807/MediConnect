import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { patientAPI, appointmentAPI } from "../services/api";
import {
  Calendar, Clock, Star, X, CheckCircle, XCircle,
  AlertCircle, ChevronRight, IndianRupee, MapPin,
  Loader, MessageSquare, RefreshCw
} from "lucide-react";

// ── Status Config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: "Pending",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: AlertCircle },
  confirmed: { label: "Confirmed", color: "#0DC4A1", bg: "rgba(13,196,161,0.1)",  icon: CheckCircle },
  completed: { label: "Completed", color: "#059669", bg: "rgba(5,150,105,0.1)",   icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "#E8604C", bg: "rgba(232,96,76,0.1)",   icon: XCircle    },
};

function StatusBadge({ status }) {
  const cfg  = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ── Star Picker ────────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((n) => (
        <motion.button key={n} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          className="p-0.5">
          <Star size={28}
            fill={(hovered || value) >= n ? "#F59E0B" : "none"}
            color={(hovered || value) >= n ? "#F59E0B" : "#CBD5E1"} />
        </motion.button>
      ))}
    </div>
  );
}

// ── Rate Modal ─────────────────────────────────────────────────────────────────
function RateModal({ appointment, onClose, onSuccess }) {
  const [rating,  setRating]  = useState(0);
  const [review,  setReview]  = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a star rating"); return; }
    setLoading(true);
    try {
      await appointmentAPI.rate(
        appointment.id,
        { rating, ...(review.trim() ? { review: review.trim() } : {}) }
      );
      toast.success("Rating submitted successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit rating");
    } finally {
      setLoading(false);
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
          <h3 className="text-lg font-bold" style={{ color: "#0B2545" }}>Rate Your Visit</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={16} style={{ color: "#64748b" }} />
          </button>
        </div>

        {/* Doctor info */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
          style={{ background: "rgba(13,196,161,0.06)", border: "1px solid rgba(13,196,161,0.12)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
            {appointment.doctor?.name?.charAt(0)?.toUpperCase() || "D"}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#0B2545" }}>Dr. {appointment.doctor?.name}</p>
            <p className="text-xs" style={{ color: "#0DC4A1" }}>{appointment.doctor?.specialization}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="text-center mb-5">
          <p className="text-sm font-semibold mb-3" style={{ color: "#0B2545" }}>
            How was your experience?
          </p>
          <div className="flex justify-center">
            <StarPicker value={rating} onChange={setRating} />
          </div>
          {rating > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs mt-2 font-semibold"
              style={{ color: "#F59E0B" }}>
              {["","Poor","Fair","Good","Very Good","Excellent"][rating]}
            </motion.p>
          )}
        </div>

        {/* Review */}
        <div className="mb-5">
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>
            Write a review <span style={{ color: "#94a3b8" }}>(optional)</span>
          </label>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3}
            placeholder="Share your experience..."
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background: "#F0F7FF", border: "1px solid rgba(11,37,69,0.1)", color: "#0B2545", fontFamily: "Inter, sans-serif" }} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(11,37,69,0.06)", color: "#0B2545" }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={loading || rating === 0}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{
              background: rating > 0 ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : "rgba(11,37,69,0.12)",
              color: rating > 0 ? "white" : "#94a3b8",
              cursor: rating > 0 ? "pointer" : "not-allowed",
            }}>
            {loading ? <Loader size={14} className="animate-spin" /> : <Star size={14} />}
            {loading ? "Submitting…" : "Submit Rating"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Appointment Card ───────────────────────────────────────────────────────────
function AppointmentCard({ appt, index, onCancel, onRate }) {
  const canCancel = ["pending", "confirmed"].includes(appt.status);
  const canRate   = appt.status === "completed" && !appt.rating;
  const isRated   = appt.status === "completed" && appt.rating;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>

      {/* Top row */}
      <div className="flex items-start gap-4">
        {/* Doctor avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
          {appt.doctor?.name?.charAt(0)?.toUpperCase() || "D"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-sm truncate" style={{ color: "#0B2545" }}>
                Dr. {appt.doctor?.name}
              </h3>
              <p className="text-xs font-semibold" style={{ color: "#0DC4A1" }}>
                {appt.doctor?.specialization}
              </p>
            </div>
            <StatusBadge status={appt.status} />
          </div>

          {/* Date / Time / Fee chips */}
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
            {appt.doctor?.consultationFee && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(232,96,76,0.07)", color: "#E8604C" }}>
                <IndianRupee size={9} />₹{appt.doctor.consultationFee}
              </span>
            )}
            {appt.doctor?.city && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(11,37,69,0.05)", color: "#64748b" }}>
                <MapPin size={10} />{appt.doctor.city}
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
              style={{ background: "rgba(13,196,161,0.07)", color: "#0B2545", border: "1px solid rgba(13,196,161,0.15)" }}>
              <span className="font-semibold text-teal-600">Doctor's note: </span>
              {appt.doctorNotes}
            </div>
          )}

          {/* Existing rating */}
          {isRated && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} size={12}
                  fill={n <= (appt.rating?.rating || 0) ? "#F59E0B" : "none"}
                  color={n <= (appt.rating?.rating || 0) ? "#F59E0B" : "#CBD5E1"} />
              ))}
              <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                {appt.rating?.rating}/5
              </span>
              {appt.rating?.review && (
                <span className="text-xs" style={{ color: "#94a3b8" }}>· "{appt.rating.review}"</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(canCancel || canRate) && (
        <div className="flex gap-2 mt-4 pt-3.5" style={{ borderTop: "1px solid rgba(11,37,69,0.06)" }}>
          {canCancel && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onCancel(appt)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(232,96,76,0.08)", color: "#E8604C", border: "1px solid rgba(232,96,76,0.15)" }}>
              <XCircle size={12} /> Cancel Appointment
            </motion.button>
          )}
          {canRate && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onRate(appt)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #F59E0B, #E8604C)" }}>
              <Star size={12} /> Rate & Review
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
        <div className="h-3.5 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-slate-200 rounded-full w-20" />
          <div className="h-5 bg-slate-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("all");
  const [rateTarget,   setRateTarget]   = useState(null);  // appointment to rate
  const [cancelTarget, setCancelTarget] = useState(null);  // appointment to cancel
  const [cancelling,   setCancelling]   = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientAPI.getAppointments();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await appointmentAPI.updateStatus(cancelTarget.id, { status: "cancelled" });
      toast.success("Appointment cancelled");
      setCancelTarget(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel appointment");
    } finally {
      setCancelling(false);
    }
  };

  const filtered = appointments.filter(
    (a) => filter === "all" || a.status === filter
  );

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "all" ? appointments.length : appointments.filter((a) => a.status === t.key).length;
    return acc;
  }, {});

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

      <div className="relative max-w-3xl mx-auto" style={{ zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#0B2545", fontFamily: "Inter, sans-serif" }}>
                My Appointments
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                {appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
                onClick={fetchAppointments}
                className="p-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <RefreshCw size={15} style={{ color: "#0B2545" }} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/doctors")}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
                Book New <ChevronRight size={13} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex gap-1.5 flex-wrap mb-6 p-1.5 rounded-2xl w-fit"
          style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
          {FILTER_TABS.map((tab) => (
            <motion.button key={tab.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(tab.key)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              style={{
                background: filter === tab.key ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : "transparent",
                color: filter === tab.key ? "white" : "#64748b",
              }}>
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    background: filter === tab.key ? "rgba(255,255,255,0.25)" : "rgba(11,37,69,0.08)",
                    color: filter === tab.key ? "white" : "#0B2545",
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
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(24px)" }}>
            <Calendar size={44} className="mx-auto mb-4" style={{ color: "#CBD5E1" }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: "#0B2545" }}>
              {filter === "all" ? "No appointments yet" : `No ${filter} appointments`}
            </h3>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              {filter === "all" ? "Book your first appointment to get started." : `You have no ${filter} appointments right now.`}
            </p>
            {filter === "all" && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/doctors")}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
                Find a Doctor
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((appt, i) => (
                <AppointmentCard key={appt.id} appt={appt} index={i}
                  onCancel={(a) => setCancelTarget(a)}
                  onRate={(a) => setRateTarget(a)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Rate Modal ── */}
      <AnimatePresence>
        {rateTarget && (
          <RateModal
            appointment={rateTarget}
            onClose={() => setRateTarget(null)}
            onSuccess={() => { setRateTarget(null); fetchAppointments(); }}
          />
        )}
      </AnimatePresence>

      {/* ── Cancel Confirm Modal ── */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ background: "rgba(11,37,69,0.4)", backdropFilter: "blur(6px)", zIndex: 1000 }}
            onClick={(e) => e.target === e.currentTarget && setCancelTarget(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="rounded-3xl p-6 w-full max-w-sm text-center"
              style={{ background: "#fff", boxShadow: "0 32px 80px rgba(11,37,69,0.18)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(232,96,76,0.1)" }}>
                <XCircle size={28} style={{ color: "#E8604C" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#0B2545" }}>Cancel Appointment?</h3>
              <p className="text-sm mb-2" style={{ color: "#64748b" }}>
                Appointment with <strong>Dr. {cancelTarget.doctor?.name}</strong>
              </p>
              <p className="text-xs mb-6" style={{ color: "#94a3b8" }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelTarget(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(11,37,69,0.06)", color: "#0B2545" }}>
                  Keep It
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleCancel} disabled={cancelling}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #E8604C, #c0392b)" }}>
                  {cancelling ? <Loader size={14} className="animate-spin" /> : <XCircle size={14} />}
                  {cancelling ? "Cancelling…" : "Yes, Cancel"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}