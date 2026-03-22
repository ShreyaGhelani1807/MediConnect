import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { doctorAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Users, Star, MessageSquare, TrendingUp, BarChart2, Clock, Tag
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

/* ── Skeleton ── */
function Skeleton({ w = "full", h = "h-5", rounded = "rounded-lg" }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`bg-slate-200/60 ${h} ${rounded}`}
      style={{ width: w === 'full' ? '100%' : w }}
    />
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, colorClass, bgClass, loading, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex-1 bg-white/70 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_32px_rgba(11,37,69,0.04)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${bgClass}`}>
          <Icon size={20} className={colorClass} />
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      {loading ? (
        <Skeleton h="h-10" w="60%" />
      ) : (
        <p className="text-4xl font-black text-[#0B1F3A] m-0 tracking-tight leading-none">
          {value}
        </p>
      )}
    </motion.div>
  );
}

/* ── Custom Tooltip for Charts ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0B2545] text-white rounded-xl py-2 px-3 text-sm font-sans shadow-lg shadow-black/10 transition-all">
      <p className="m-0 mb-1 text-white/60 text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <p className="m-0 font-bold">{payload[0].value} appointments</p>
    </div>
  );
}

export default function DoctorAnalytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorAPI.getAnalytics();
        setData(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Format Recharts data safely
  const monthlyData = data?.monthlyVolume
    ? Object.entries(data.monthlyVolume).map(([month, count]) => ({
        month: (() => { try { return format(new Date(month + "-01"), "MMM yy"); } catch { return month; } })(),
        count,
      }))
    : [];

  const peakData = data?.peakHours
    ? Object.entries(data.peakHours)
        .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
    : [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-[#0DC4A1]/10 flex items-center justify-center">
            <BarChart2 size={22} className="text-[#0DC4A1]" />
          </div>
          <h1 className="text-[28px] font-black text-[#0B1F3A] tracking-tight m-0">Analytics</h1>
        </div>
        <p className="text-slate-500 text-sm m-0 pl-[52px]">Your practice performance at a glance</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="flex flex-col md:flex-row gap-5">
        <StatCard 
          icon={Users} 
          label="This Month's Patients" 
          value={loading ? "—" : (data?.thisMonthPatients ?? 0)} 
          colorClass="text-[#0DC4A1]" bgClass="bg-[#0DC4A1]/10" 
          loading={loading} delay={0} 
        />
        <StatCard 
          icon={Star} 
          label="Average Rating" 
          value={loading ? "—" : (data?.averageRating?.toFixed(1) ?? "0.0")} 
          colorClass="text-[#F4A261]" bgClass="bg-[#F4A261]/10" 
          loading={loading} delay={0.08} 
        />
        <StatCard 
          icon={MessageSquare} 
          label="Total Reviews" 
          value={loading ? "—" : (data?.totalReviews ?? 0)} 
          colorClass="text-[#3B82F6]" bgClass="bg-[#3B82F6]/10" 
          loading={loading} delay={0.16} 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Volume BarChart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-[24px] p-7 shadow-[0_8px_32px_rgba(11,37,69,0.04)]"
        >
          <div className="flex items-center gap-2.5 mb-8">
            <TrendingUp size={18} className="text-[#0DC4A1]" />
            <h2 className="text-[15px] font-extrabold text-[#0B1F3A] m-0">Monthly Appointment Volume</h2>
          </div>
          
          {loading ? (
             <div className="h-[240px] flex items-end gap-3 pb-5">
               {[60, 80, 50, 90, 70, 85].map((h, i) => <Skeleton key={i} w="100%" h={`h-[${h}%]`} rounded="rounded-t-lg" />)}
             </div>
          ) : monthlyData.length === 0 ? (
             <div className="h-[240px] flex items-center justify-center">
               <p className="text-slate-400 text-sm font-semibold">No data yet</p>
             </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#0DC4A1', opacity: 0.05 }} />
                  <Bar dataKey="count" fill="#0DC4A1" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Peak Hours LineChart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-[24px] p-7 shadow-[0_8px_32px_rgba(11,37,69,0.04)]"
        >
          <div className="flex items-center gap-2.5 mb-8">
            <Clock size={18} className="text-[#3B82F6]" />
            <h2 className="text-[15px] font-extrabold text-[#0B1F3A] m-0">Peak Appointment Hours</h2>
          </div>
          
          {loading ? (
             <div className="h-[240px]">
               <Skeleton h="h-full" rounded="rounded-2xl" />
             </div>
          ) : peakData.length === 0 ? (
             <div className="h-[240px] flex items-center justify-center">
               <p className="text-slate-400 text-sm font-semibold">No data yet</p>
             </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

      </div>

      {/* Top Reasons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-[24px] p-7 shadow-[0_8px_32px_rgba(11,37,69,0.04)]"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <Tag size={18} className="text-slate-400" />
          <h2 className="text-[15px] font-extrabold text-[#0B1F3A] m-0">Top Reasons for Visits</h2>
        </div>
        
        {loading ? (
          <div className="flex flex-wrap gap-2.5">
            {[120, 90, 100, 80, 110, 140, 85].map((w, i) => <Skeleton key={i} w={w} h="h-8" rounded="rounded-full" />)}
          </div>
        ) : !data?.topReasons?.length ? (
          <p className="text-slate-400 text-sm font-semibold m-0">No visit reasons recorded yet</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {data.topReasons.map((reason, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.4 + i * 0.04 }}
                className="text-[13px] font-bold px-4 py-1.5 rounded-full bg-white border border-black/5 text-slate-500 shadow-sm"
              >
                {reason}
              </motion.span>
            ))}
          </div>
        )}
      </motion.div>
      
    </div>
  );
}
