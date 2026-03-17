import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft, Star, MapPin, Clock, IndianRupee, Calendar,
  Phone, Mail, Award, BookOpen, User, ChevronRight, MessageSquare
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ── Shared StarRating ──────────────────────────────────────────────────────────
function StarRating({ rating = 0, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? "#F59E0B" : "none"}
          color={i <= Math.round(rating) ? "#F59E0B" : "#CBD5E1"}
        />
      ))}
    </div>
  );
}

// ── About Tab ──────────────────────────────────────────────────────────────────
function AboutTab({ doctor }) {
  const detailRows = [
    { label: "Specialization", value: doctor.specialization },
    { label: "Qualifications", value: doctor.qualifications },
    { label: "Experience", value: doctor.experienceYears ? `${doctor.experienceYears} years` : null },
    { label: "Consultation Fee", value: doctor.consultationFee ? `₹${doctor.consultationFee}` : null },
    { label: "City", value: doctor.city },
    { label: "Hospital / Clinic", value: doctor.clinicAddress },
  ].filter((r) => r.value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bio */}
      {doctor.bio && (
        <div
          className="md:col-span-2 rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(11,37,69,0.08)"
          }}
        >
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#0B2545" }}>
            <User size={15} style={{ color: "#0DC4A1" }} /> About
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{doctor.bio}</p>
        </div>
      )}

      {/* Details */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(11,37,69,0.08)"
        }}
      >
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
          <BookOpen size={15} style={{ color: "#0DC4A1" }} /> Professional Details
        </h3>
        <div className="space-y-0.5">
          {detailRows.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between items-center py-2.5"
              style={{ borderBottom: "1px solid rgba(11,37,69,0.05)" }}
            >
              <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{label}</span>
              <span className="text-sm font-semibold text-right" style={{ color: "#0B2545" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(11,37,69,0.08)"
        }}
      >
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
          <Phone size={15} style={{ color: "#0DC4A1" }} /> Contact & Location
        </h3>
        <div className="space-y-3">
          {doctor.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(13,196,161,0.06)" }}>
              <Mail size={15} style={{ color: "#0DC4A1" }} />
              <span className="text-sm" style={{ color: "#0B2545" }}>{doctor.email}</span>
            </div>
          )}
          {doctor.phone && (
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(13,196,161,0.06)" }}>
              <Phone size={15} style={{ color: "#0DC4A1" }} />
              <span className="text-sm" style={{ color: "#0B2545" }}>{doctor.phone}</span>
            </div>
          )}
          {doctor.clinicAddress && (
            <div className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "rgba(13,196,161,0.06)" }}>
              <MapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#0DC4A1" }} />
              <span className="text-sm" style={{ color: "#0B2545" }}>{doctor.clinicAddress}</span>
            </div>
          )}
          {!doctor.email && !doctor.phone && !doctor.clinicAddress && (
            <p className="text-sm text-center py-4" style={{ color: "#94a3b8" }}>No contact info available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Slots Tab ──────────────────────────────────────────────────────────────────
function SlotsTab({ doctor, navigate }) {
  const slots = doctor.timeSlots || doctor.slots || doctor.availableSlots || [];
  const grouped = slots.reduce((acc, slot) => {
    const day = slot.dayOfWeek || slot.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(11,37,69,0.08)"
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold flex items-center gap-2" style={{ color: "#0B2545" }}>
          <Clock size={15} style={{ color: "#0DC4A1" }} /> Weekly Availability
        </h3>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate(`/book/${doctor.id}`)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
        >
          Book Appointment <ChevronRight size={12} />
        </motion.button>
      </div>

      {slots.length === 0 ? (
        <div className="text-center py-10">
          <Calendar size={36} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
          <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>No availability added yet</p>
        </div>
      ) : (
        <div className="space-y-5">
          {DAY_ORDER.filter((d) => grouped[d]).map((day) => (
            <div key={day}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: "#94a3b8" }}>
                {day}
              </p>
              <div className="flex flex-wrap gap-2">
                {grouped[day]
                  .sort((a, b) => (a.startTime > b.startTime ? 1 : -1))
                  .map((slot, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{
                        background: slot.isAvailable !== false ? "rgba(13,196,161,0.1)" : "rgba(11,37,69,0.05)",
                        color: slot.isAvailable !== false ? "#0DC4A1" : "#94a3b8",
                        border: `1px solid ${slot.isAvailable !== false ? "rgba(13,196,161,0.25)" : "rgba(11,37,69,0.08)"}`,
                      }}
                    >
                      {slot.startTime}
                      {slot.endTime ? ` – ${slot.endTime}` : ""}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews Tab ────────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, doctor }) {
  const rating = doctor.averageRating || 0;

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(11,37,69,0.08)"
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="text-center flex-shrink-0">
            <div className="text-5xl font-bold mb-2" style={{ color: "#0B2545" }}>
              {rating > 0 ? rating.toFixed(1) : "—"}
            </div>
            <StarRating rating={rating} size={20} />
            <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          {rating > 0 && reviews.length > 0 && (
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs w-3 text-right" style={{ color: "#64748b" }}>{star}</span>
                    <Star size={9} fill="#F59E0B" color="#F59E0B" />
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(11,37,69,0.08)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: "#F59E0B" }}
                      />
                    </div>
                    <span className="text-xs w-4" style={{ color: "#94a3b8" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div
          className="text-center py-14 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(24px)" }}
        >
          <MessageSquare size={36} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
          <h3 className="font-semibold mb-1" style={{ color: "#0B2545" }}>No reviews yet</h3>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Reviews appear after completed appointments
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((appt, i) => (
            <motion.div
              key={appt.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(11,37,69,0.08)"
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0B2545, #0DC4A1)" }}
                  >
                    {appt.patient?.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0B2545" }}>
                      {appt.patient?.name || "Patient"}
                    </p>
                    {appt.date && (
                      <p className="text-xs" style={{ color: "#94a3b8" }}>
                        {new Date(appt.date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <StarRating rating={appt.rating} size={13} />
              </div>
              {appt.review && (
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  "{appt.review}"
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("mediconnect_token");
        const res = await axios.get(`${API_BASE}/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctor(res.data.doctor || res.data);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F7FF" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full"
          style={{ border: "3px solid rgba(13,196,161,0.2)", borderTopColor: "#0DC4A1" }}
        />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F7FF" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: "#0B2545" }}>Doctor not found</h3>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const rating = doctor.averageRating || 0;
  const reviews = doctor.reviews || [];

  const TABS = [
    { id: "about", label: "About" },
    { id: "slots", label: "Availability" },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: "#F0F7FF" }}>
      {/* BG orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #0DC4A1, transparent)", top: "8%", right: "8%" }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #E8604C, transparent)", bottom: "10%", left: "5%" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 1 }}>
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate("/doctors")}
          className="flex items-center gap-2 mb-6 text-sm font-medium"
          style={{ color: "#64748b" }}
        >
          <ArrowLeft size={16} /> Back to Search
        </motion.button>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 md:p-8 mb-6"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(11,37,69,0.08)"
          }}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl"
                style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
              >
                {doctor.name?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                style={{ background: "#0DC4A1" }}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: "#0B2545" }}>
                    Dr. {doctor.name}
                  </h1>
                  <p className="font-semibold" style={{ color: "#0DC4A1" }}>{doctor.specialization}</p>
                  {doctor.qualifications && (
                    <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{doctor.qualifications}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/book/${doctor.id}`)}
                  className="px-5 py-3 rounded-2xl font-semibold text-white flex items-center gap-2 text-sm"
                  style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
                >
                  <Calendar size={15} /> Book Appointment
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                {rating > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={rating} size={14} />
                    <span className="text-sm font-bold" style={{ color: "#0B2545" }}>{rating.toFixed(1)}</span>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>({reviews.length})</span>
                  </div>
                )}
                {doctor.experience && (
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: "#64748b" }}>
                    <Award size={13} style={{ color: "#0DC4A1" }} />
                    {doctor.experience} yrs experience
                  </div>
                )}
                {doctor.city && (
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: "#64748b" }}>
                    <MapPin size={13} style={{ color: "#0DC4A1" }} />
                    {doctor.city}
                  </div>
                )}
                {doctor.consultationFee && (
                  <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "#E8604C" }}>
                    <IndianRupee size={13} />₹{doctor.consultationFee} / visit
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-2xl w-fit"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(11,37,69,0.08)"
          }}
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: activeTab === tab.id
                  ? "linear-gradient(135deg, #0DC4A1, #0B2545)"
                  : "transparent",
                color: activeTab === tab.id ? "white" : "#64748b",
              }}
              whileHover={activeTab !== tab.id ? { color: "#0B2545" } : {}}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "about" && <AboutTab doctor={doctor} />}
            {activeTab === "slots" && <SlotsTab doctor={doctor} navigate={navigate} />}
            {activeTab === "reviews" && <ReviewsTab reviews={reviews} doctor={doctor} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}