import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users, Calendar, Clock, TrendingUp, Star,
  ChevronRight, CheckCircle, XCircle, AlertCircle,
  Stethoscope, IndianRupee, Activity, Bell
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: "Pending",    color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   icon: AlertCircle },
  CONFIRMED: { label: "Confirmed",  color: "#0DC4A1", bg: "rgba(13,196,161,0.1)",   icon: CheckCircle },
  COMPLETED: { label: "Completed",  color: "#0B2545", bg: "rgba(11,37,69,0.08)",    icon: CheckCircle },
  CANCELLED: { label: "Cancelled",  color: "#E8604C", bg: "rgba(232,96,76,0.08)",   icon: XCircle    },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(11,37,69,0.1)" }}
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(11,37,69,0.08)",
        transition: "box-shadow 0.3s ease"
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-lg"
          style={{ background: "rgba(11,37,69,0.04)", color: "#94a3b8" }}>
          Today
        </span>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: "#0B2545", fontFamily: "Inter, sans-serif" }}>
        {value ?? "—"}
      </p>
      <p className="text-sm font-medium" style={{ color: "#64748b" }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{sub}</p>}
    </motion.div>
  );
}

// ── Queue Row ──────────────────────────────────────────────────────────────────
function QueueRow({ appt, index, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);

  const quickUpdate = async (status) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("mediconnect_token");
      await axios.put(
        `${API_BASE}/appointments/${appt.id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStatusUpdate(appt.id, status);
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{
        background: index === 0
          ? "rgba(13,196,161,0.06)"
          : "rgba(255,255,255,0.5)",
        border: `1px solid ${index === 0 ? "rgba(13,196,161,0.2)" : "rgba(11,37,69,0.05)"}`,
      }}
    >
      {/* Position badge */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: index === 0
            ? "linear-gradient(135deg, #0DC4A1, #0B2545)"
            : "rgba(11,37,69,0.08)",
          color: index === 0 ? "white" : "#94a3b8"
        }}
      >
        {index + 1}
      </div>

      {/* Patient avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #0B2545, #0DC4A1)" }}
      >
        {appt.patient?.name?.charAt(0)?.toUpperCase() || "P"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#0B2545" }}>
          {appt.patient?.name || "Patient"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock size={10} style={{ color: "#94a3b8" }} />
          <span className="text-xs" style={{ color: "#94a3b8" }}>
            {appt.timeSlot?.startTime || appt.timeSlot || appt.time || "—"}
          </span>
          {appt.reasonForVisit && (
            <>
              <span style={{ color: "#CBD5E1" }}>·</span>
              <span className="text-xs truncate max-w-[120px]" style={{ color: "#94a3b8" }}>
                {appt.reasonForVisit}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status + Quick Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={appt.status} />
        {appt.status?.toUpperCase() === "PENDING" && !updating && (
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => quickUpdate("CONFIRMED")}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(13,196,161,0.1)" }}
              title="Confirm"
            >
              <CheckCircle size={13} style={{ color: "#0DC4A1" }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => quickUpdate("CANCELLED")}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(232,96,76,0.08)" }}
              title="Cancel"
            >
              <XCircle size={13} style={{ color: "#E8604C" }} />
            </motion.button>
          </div>
        )}
        {appt.status === "CONFIRMED" && !updating && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => quickUpdate("COMPLETED")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(11,37,69,0.07)", color: "#0B2545" }}
          >
            Done
          </motion.button>
        )}
        {updating && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-full"
            style={{ border: "2px solid rgba(13,196,161,0.3)", borderTopColor: "#0DC4A1" }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [queue, setQueue]         = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [greeting, setGreeting]   = useState("Good morning");

  // Greeting based on time
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting("Good afternoon");
    else if (h >= 17)       setGreeting("Good evening");
    else                    setGreeting("Good morning");
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("mediconnect_token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [queueRes, analyticsRes, profileRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/doctor/appointments/today`, { headers }),
          axios.get(`${API_BASE}/doctor/analytics`, { headers }),
          axios.get(`${API_BASE}/doctor/profile`, { headers }),
        ]);

        if (queueRes.status === "fulfilled") {
          const d = queueRes.value.data;
          setQueue(d.appointments || d.queue || d || []);
        }
        if (analyticsRes.status === "fulfilled") {
          setAnalytics(analyticsRes.value.data);
        }
        if (profileRes.status === "fulfilled") {
          const d = profileRes.value.data;
          // Prefer 'd' itself as it contains name, email, and 'profile' nested
          setProfile(d);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleStatusUpdate = (id, newStatus) => {
    setQueue((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  // ── Derived stats ────────────────────────────────────────────────────────────
  const todayTotal     = queue.length;
  const todayCompleted = queue.filter((a) => a.status?.toUpperCase() === "COMPLETED").length;
  const todayPending   = queue.filter((a) => a.status?.toUpperCase() === "PENDING").length;
  const nextAppt       = queue.find((a) => a.status?.toUpperCase() === "CONFIRMED" || a.status?.toUpperCase() === "PENDING");

  const totalAppointments = analytics?.totalAppointments ?? "—";
  const avgRating         = analytics?.averageRating     ?? profile?.averageRating ?? 0;
  const totalRevenue      = analytics?.totalRevenue      ?? "—";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F0F7FF" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full"
          style={{ border: "3px solid rgba(13,196,161,0.2)", borderTopColor: "#0DC4A1" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "#F0F7FF" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{
            background: "radial-gradient(circle, #0DC4A1, transparent)",
            top: "-5%", right: "5%"
          }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #0B2545, transparent)",
            bottom: "10%", left: "2%"
          }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-72 h-72 rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #E8604C, transparent)",
            bottom: "30%", right: "20%"
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto" style={{ zIndex: 1 }}>

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: "#94a3b8" }}>
              {greeting} 👋
            </p>
            <h1
              className="text-3xl font-bold"
              style={{ color: "#0B2545", fontFamily: "Inter, sans-serif" }}
            >
              Dr. {profile?.name || "Doctor"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              {profile?.specialization || "Specialist"} ·{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/doctor/appointments")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white self-start sm:self-auto"
            style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
          >
            <Calendar size={15} /> View All Appointments <ChevronRight size={14} />
          </motion.button>
        </motion.div>

        {/* ── Next Appointment Highlight ───────────────────────────────────────── */}
        <AnimatePresence>
          {nextAppt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              style={{
                background: "linear-gradient(135deg, rgba(13,196,161,0.12), rgba(11,37,69,0.07))",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(13,196,161,0.25)"
              }}
            >
              {/* Pulse dot */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
                >
                  <Stethoscope size={22} color="white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                  style={{ background: "#0DC4A1" }}
                />
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: "#0DC4A1" }}>
                  Next Up
                </p>
                <p className="font-bold text-lg" style={{ color: "#0B2545" }}>
                  {nextAppt.patient?.name || "Patient"}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "#64748b" }}>
                    <Clock size={12} style={{ color: "#0DC4A1" }} />
                    {nextAppt.timeSlot?.startTime || nextAppt.timeSlot || nextAppt.time || "—"}
                  </span>
                  {nextAppt.reasonForVisit && (
                    <span className="text-sm" style={{ color: "#64748b" }}>
                      · {nextAppt.reasonForVisit}
                    </span>
                  )}
                  <StatusBadge status={nextAppt.status} />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/doctor/appointments")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
              >
                Manage
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Today's Patients"
            value={todayTotal}
            sub={`${todayCompleted} completed`}
            color="#0DC4A1"
            delay={0.1}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending"
            value={todayPending}
            sub="awaiting confirmation"
            color="#F59E0B"
            delay={0.15}
          />
          <StatCard
            icon={Activity}
            label="Total Appointments"
            value={totalAppointments}
            sub="all time"
            color="#0B2545"
            delay={0.2}
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value={avgRating > 0 ? `${Number(avgRating).toFixed(1)} ★` : "—"}
            sub={`${analytics?.totalReviews ?? 0} reviews`}
            color="#F59E0B"
            delay={0.25}
          />
        </div>

        {/* ── Main Content: Queue + Quick Stats ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Today's Queue */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(11,37,69,0.08)"
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-lg" style={{ color: "#0B2545" }}>
                    Today's Queue
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    {todayTotal} appointment{todayTotal !== 1 ? "s" : ""} scheduled
                  </p>
                </div>
                {todayTotal > 0 && (
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: "rgba(13,196,161,0.1)", color: "#0DC4A1" }}
                  >
                    {todayCompleted}/{todayTotal} done
                  </div>
                )}
              </div>

              {queue.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-14"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(13,196,161,0.08)" }}
                  >
                    <Calendar size={28} style={{ color: "#0DC4A1" }} />
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: "#0B2545" }}>
                    No appointments today
                  </h3>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    Your schedule is clear for today
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {queue.map((appt, i) => (
                    <QueueRow
                      key={appt.id}
                      appt={appt}
                      index={i}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              )}

              {queue.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate("/doctor/appointments")}
                  className="w-full mt-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(11,37,69,0.05)",
                    color: "#0B2545",
                    border: "1px solid rgba(11,37,69,0.08)"
                  }}
                >
                  View Full Appointments List <ChevronRight size={14} />
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">

            {/* Profile Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(11,37,69,0.08)"
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
                >
                  {profile?.name?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate" style={{ color: "#0B2545" }}>
                    Dr. {profile?.name || "—"}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "#0DC4A1" }}>
                    {profile?.specialization || "—"}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {profile?.qualifications || ""}
                  </p>
                </div>
              </div>

              {[
                { label: "Experience", value: profile?.experience ? `${profile.experience} yrs` : "—" },
                { label: "Consultation Fee", value: profile?.consultationFee ? `₹${profile.consultationFee}` : "—" },
                { label: "City", value: profile?.city || "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(11,37,69,0.05)" }}
                >
                  <span className="text-xs" style={{ color: "#94a3b8" }}>{label}</span>
                  <span className="text-xs font-semibold" style={{ color: "#0B2545" }}>{value}</span>
                </div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/doctor/profile")}
                className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold"
                style={{
                  background: "rgba(11,37,69,0.05)",
                  color: "#0B2545",
                  border: "1px solid rgba(11,37,69,0.08)"
                }}
              >
                Edit Profile
              </motion.button>
            </motion.div>

            {/* Revenue / Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, #0B2545, #0DC4A1)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} color="rgba(255,255,255,0.8)" />
                <p className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.7)" }}>
                  Overall Stats
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {totalRevenue !== "—" ? `₹${Number(totalRevenue).toLocaleString("en-IN")}` : "—"}
                  </p>
                </div>
                <div
                  className="h-px"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      All Appointments
                    </p>
                    <p className="text-xl font-bold text-white">{totalAppointments}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      Rating
                    </p>
                    <p className="text-xl font-bold text-white">
                      {avgRating > 0 ? `${Number(avgRating).toFixed(1)} ★` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(11,37,69,0.08)"
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-4"
                style={{ color: "#94a3b8" }}>
                Quick Links
              </p>
              <div className="space-y-2">
                {[
                  { label: "Manage Appointments", icon: Calendar, path: "/doctor/appointments" },
                  { label: "Update Profile",       icon: Users,    path: "/doctor/profile"      },
                ].map(({ label, icon: Icon, path }) => (
                  <motion.button
                    key={path}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(path)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium"
                    style={{
                      background: "rgba(11,37,69,0.04)",
                      color: "#0B2545",
                      border: "1px solid rgba(11,37,69,0.05)"
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} style={{ color: "#0DC4A1" }} />
                      {label}
                    </div>
                    <ChevronRight size={13} style={{ color: "#94a3b8" }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}