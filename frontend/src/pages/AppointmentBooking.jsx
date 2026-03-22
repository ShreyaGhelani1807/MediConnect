import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft, Calendar, Clock, CheckCircle, ChevronRight,
  MapPin, IndianRupee, AlertCircle, Loader
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getUpcomingDates(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

// ── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = [{ n: 1, label: "Pick Slot" }, { n: 2, label: "Confirm" }];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, idx) => (
        <div key={s.n} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: current >= s.n ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : "rgba(11,37,69,0.08)",
              color: current >= s.n ? "white" : "#94a3b8",
            }}
          >
            {current > s.n ? <CheckCircle size={14} /> : s.n}
          </div>
          <span className="text-xs font-semibold hidden sm:block"
            style={{ color: current >= s.n ? "#0B2545" : "#94a3b8" }}>
            {s.label}
          </span>
          {idx < steps.length - 1 && (
            <div className="w-8 h-px mx-1"
              style={{ background: current > s.n ? "#0DC4A1" : "rgba(11,37,69,0.1)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AppointmentBooking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor]                     = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [step, setStep]                         = useState(1);
  const [selectedDate, setSelectedDate]         = useState(null);
  const [selectedSlot, setSelectedSlot]         = useState(null);
  const [reason, setReason]                     = useState("");
  const [booking, setBooking]                   = useState(false);
  const [bookingError, setBookingError]         = useState("");
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Fetch doctor
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("mediconnect_token");
        const res = await axios.get(`${API_BASE}/doctors/${doctorId}`, {
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
  }, [doctorId]);

  const upcomingDates = getUpcomingDates(14);

  const getSlotsForDate = (date) => {
    const slots = doctor?.timeSlots || doctor?.slots || doctor?.availableSlots || [];
    const dayOfWeek = date.getDay();
    const dayName = DAYS[dayOfWeek];
    return slots
      .filter((s) => {
        const slotDay = s.dayOfWeek ?? s.day;
        const matchesDay = typeof slotDay === 'number' ? slotDay === dayOfWeek : slotDay === dayName;
        return matchesDay && s.isAvailable !== false;
      })
      .sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
  };

  // ── Fixed: correct field names matching backend controller ──
  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;
    setBooking(true);
    setBookingError("");
    try {
      const token = localStorage.getItem("mediconnect_token");
      // appointmentDate must be ISO string; timeSlotId must be the slot's id (integer)
      const appointmentDate = selectedDate.toISOString().split("T")[0];

      const res = await axios.post(
        `${API_BASE}/appointments/book`,
        {
          doctorId,
          appointmentDate,
          timeSlotId:      selectedSlot.id,
          ...(reason.trim() ? { reasonForVisit: reason.trim() } : {}),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookedAppointment(res.data.appointment || res.data);
      setStep(3);
    } catch (err) {
      setBookingError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Booking failed. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F7FF" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full"
          style={{ border: "3px solid rgba(13,196,161,0.2)", borderTopColor: "#0DC4A1" }} />
      </div>
    );
  }

  // ── BG Orbs (shared) ──────────────────────────────────────────────────────────
  const BgOrbs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #0DC4A1, transparent)", top: "8%", right: "8%" }} />
      <motion.div animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #E8604C, transparent)", bottom: "15%", left: "5%" }} />
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ background: "#F0F7FF" }}>
      <BgOrbs />
      <div className="relative max-w-2xl mx-auto" style={{ zIndex: 1 }}>

        {/* Back button */}
        {step < 3 && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ x: -3 }}
            onClick={() => step === 1 ? navigate(`/doctors/${doctorId}`) : setStep(1)}
            className="flex items-center gap-2 mb-6 text-sm font-medium" style={{ color: "#64748b" }}>
            <ArrowLeft size={16} />
            {step === 1 ? "Back to Doctor Profile" : "Change Date & Slot"}
          </motion.button>
        )}

        {step < 3 && <StepIndicator current={step} />}

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Pick Date & Slot ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>

              {/* Doctor Mini Card */}
              {doctor && (
                <div className="rounded-2xl p-5 mb-5 flex items-center gap-4"
                  style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
                    {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold truncate" style={{ color: "#0B2545" }}>Dr. {doctor.name}</h2>
                    <p className="text-sm font-semibold" style={{ color: "#0DC4A1" }}>{doctor.specialization}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {doctor.city && (
                        <span className="text-xs flex items-center gap-1" style={{ color: "#94a3b8" }}>
                          <MapPin size={10} /> {doctor.city}
                        </span>
                      )}
                      {doctor.consultationFee && (
                        <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: "#E8604C" }}>
                          <IndianRupee size={10} /> ₹{doctor.consultationFee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Date Picker */}
              <div className="rounded-2xl p-5 mb-4"
                style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                  <Calendar size={15} style={{ color: "#0DC4A1" }} /> Select Date
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {upcomingDates.map((date, i) => {
                    const daySlots  = getSlotsForDate(date);
                    const hasSlots  = daySlots.length > 0;
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    return (
                      <motion.button key={i}
                        whileHover={hasSlots ? { scale: 1.06 } : {}}
                        whileTap={hasSlots ? { scale: 0.94 } : {}}
                        onClick={() => { if (!hasSlots) return; setSelectedDate(date); setSelectedSlot(null); }}
                        disabled={!hasSlots}
                        className="flex flex-col items-center py-3 px-3 rounded-xl min-w-[58px] transition-all"
                        style={{
                          background: isSelected ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : hasSlots ? "rgba(13,196,161,0.07)" : "rgba(11,37,69,0.03)",
                          border: `1px solid ${isSelected ? "transparent" : hasSlots ? "rgba(13,196,161,0.2)" : "rgba(11,37,69,0.05)"}`,
                          opacity: hasSlots ? 1 : 0.4,
                          cursor: hasSlots ? "pointer" : "not-allowed",
                        }}>
                        <span className="text-xs font-semibold mb-1"
                          style={{ color: isSelected ? "rgba(255,255,255,0.75)" : "#94a3b8" }}>
                          {i === 0 ? "Today" : DAYS[date.getDay()].slice(0, 3)}
                        </span>
                        <span className="text-xl font-bold leading-none"
                          style={{ color: isSelected ? "white" : hasSlots ? "#0B2545" : "#CBD5E1" }}>
                          {date.getDate()}
                        </span>
                        <span className="text-xs mt-1"
                          style={{ color: isSelected ? "rgba(255,255,255,0.65)" : "#94a3b8" }}>
                          {date.toLocaleString("default", { month: "short" })}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                {upcomingDates.every((d) => getSlotsForDate(d).length === 0) && (
                  <p className="text-sm text-center mt-4 py-2" style={{ color: "#94a3b8" }}>
                    No available slots in the next 2 weeks
                  </p>
                )}
              </div>

              {/* Time Slots */}
              <AnimatePresence>
                {selectedDate && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl p-5 mb-4"
                    style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                      <Clock size={15} style={{ color: "#0DC4A1" }} />
                      Available Times —{" "}
                      <span style={{ color: "#0DC4A1" }}>
                        {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {getSlotsForDate(selectedDate).map((slot, i) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedSlot(slot)}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                              background: isSelected ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : "rgba(13,196,161,0.07)",
                              color: isSelected ? "white" : "#0B2545",
                              border: `1px solid ${isSelected ? "transparent" : "rgba(13,196,161,0.25)"}`,
                            }}>
                            {slot.startTime}
                            {slot.endTime && <span style={{ opacity: 0.7 }}> – {slot.endTime}</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reason */}
              <div className="rounded-2xl p-5 mb-6"
                style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-3" style={{ color: "#0B2545" }}>
                  Reason for Visit{" "}
                  <span className="font-normal text-xs" style={{ color: "#94a3b8" }}>(optional)</span>
                </h3>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                  placeholder="Briefly describe your symptoms or reason for the visit..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "rgba(240,247,255,0.9)", border: "1px solid rgba(11,37,69,0.1)", color: "#0B2545", fontFamily: "Inter, sans-serif" }} />
              </div>

              <motion.button
                whileHover={{ scale: selectedDate && selectedSlot ? 1.02 : 1 }}
                whileTap={{ scale: selectedDate && selectedSlot ? 0.98 : 1 }}
                onClick={() => selectedDate && selectedSlot && setStep(2)}
                disabled={!selectedDate || !selectedSlot}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: selectedDate && selectedSlot ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : "rgba(11,37,69,0.1)",
                  color: selectedDate && selectedSlot ? "white" : "#94a3b8",
                  cursor: selectedDate && selectedSlot ? "pointer" : "not-allowed",
                }}>
                Continue to Confirm <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2: Confirm ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="rounded-2xl p-6 mb-5"
                style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: "#0B2545" }}>Confirm Your Appointment</h2>
                <div className="flex items-center gap-4 p-4 rounded-xl mb-5"
                  style={{ background: "rgba(13,196,161,0.06)", border: "1px solid rgba(13,196,161,0.12)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
                    {doctor?.name?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "#0B2545" }}>Dr. {doctor?.name}</p>
                    <p className="text-sm" style={{ color: "#0DC4A1" }}>{doctor?.specialization}</p>
                  </div>
                </div>
                {[
                  { icon: <Calendar size={15} style={{ color: "#0DC4A1" }} />, label: "Date",
                    value: selectedDate?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                  { icon: <Clock size={15} style={{ color: "#0DC4A1" }} />, label: "Time",
                    value: `${selectedSlot?.startTime}${selectedSlot?.endTime ? ` – ${selectedSlot.endTime}` : ""}` },
                  ...(doctor?.consultationFee ? [{ icon: <IndianRupee size={15} style={{ color: "#E8604C" }} />, label: "Fee", value: `₹${doctor.consultationFee}` }] : []),
                  ...(reason.trim() ? [{ icon: <span style={{ color: "#0DC4A1", fontSize: 14 }}>📋</span>, label: "Reason", value: reason }] : []),
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start justify-between py-3.5 gap-3"
                    style={{ borderBottom: "1px solid rgba(11,37,69,0.05)" }}>
                    <div className="flex items-center gap-2 flex-shrink-0">{icon}<span className="text-sm" style={{ color: "#64748b" }}>{label}</span></div>
                    <span className="text-sm font-semibold text-right" style={{ color: "#0B2545", maxWidth: "60%" }}>{value}</span>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {bookingError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl mb-4"
                    style={{ background: "rgba(232,96,76,0.08)", border: "1px solid rgba(232,96,76,0.2)" }}>
                    <AlertCircle size={16} style={{ color: "#E8604C", flexShrink: 0 }} />
                    <p className="text-sm font-medium" style={{ color: "#E8604C" }}>{bookingError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleBooking} disabled={booking}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)", opacity: booking ? 0.8 : 1 }}>
                {booking ? <><Loader size={16} className="animate-spin" /> Booking…</> : <><CheckCircle size={16} /> Confirm Booking</>}
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }} className="text-center py-8">
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(13,196,161,0.1)", border: "2px solid rgba(13,196,161,0.25)" }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35, type: "spring", stiffness: 250 }}>
                  <CheckCircle size={52} style={{ color: "#0DC4A1" }} />
                </motion.div>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="text-2xl font-bold mb-2" style={{ color: "#0B2545" }}>
                Appointment Booked! 🎉
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-sm mb-8" style={{ color: "#64748b" }}>
                Your appointment with Dr. {doctor?.name} is confirmed
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="rounded-2xl p-6 mb-8 text-left"
                style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                {[
                  { label: "Doctor",  value: `Dr. ${doctor?.name}` },
                  { label: "Date",    value: selectedDate?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                  { label: "Time",    value: selectedSlot?.startTime },
                  { label: "Status",  value: "Confirmed ✓", highlight: true },
                  ...(bookedAppointment?.id ? [{ label: "Booking ID", value: `#${String(bookedAppointment.id).slice(0, 8).toUpperCase()}` }] : []),
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between items-center py-2.5"
                    style={{ borderBottom: "1px solid rgba(11,37,69,0.05)" }}>
                    <span className="text-sm" style={{ color: "#94a3b8" }}>{label}</span>
                    <span className="text-sm font-bold" style={{ color: highlight ? "#0DC4A1" : "#0B2545" }}>{value}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex gap-3">
                <button onClick={() => navigate("/appointments")}
                  className="flex-1 py-3 rounded-xl text-sm font-bold"
                  style={{ background: "rgba(11,37,69,0.07)", color: "#0B2545" }}>
                  My Appointments
                </button>
                <button onClick={() => navigate("/dashboard")}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
                  Go to Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}