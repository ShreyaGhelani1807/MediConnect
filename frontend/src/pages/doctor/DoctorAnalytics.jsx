import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { doctorAPI } from '../../services/api';

const P = { navy: '#0B2545', teal: '#0DC4A1', sky: '#F0F7FF', ink: '#0B1F3A', sub: '#64748B', white: '#FFFFFF', border: 'rgba(0,0,0,0.06)' };
const cardStyle = { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(24px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(11,37,69,0.07)', padding: 24 };

const COLORS = ['#0DC4A1', '#3B82F6', '#F4A261', '#E8604C', '#7C3AED'];

export default function DoctorAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    doctorAPI.getAnalytics()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Loader2 size={32} color={P.teal} style={{ animation: 'spin 1.5s linear infinite' }} /><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>;

  const data = stats || {
    totalPatients: 142, revenueThisMonth: 45000, 
    appointmentsLast7Days: [
      { date: 'Mon', count: 12 }, { date: 'Tue', count: 15 }, { date: 'Wed', count: 8 },
      { date: 'Thu', count: 20 }, { date: 'Fri', count: 18 }, { date: 'Sat', count: 24 }, { date: 'Sun', count: 5 }
    ],
    reasonsForVisit: [
      { name: 'Fever', value: 400 },
      { name: 'Routine Checkup', value: 300 },
      { name: 'Follow up', value: 300 },
      { name: 'Specialist Ref', value: 200 }
    ]
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: P.navy, margin: '0 0 8px', letterSpacing: '-1px' }}>Practice Analytics</h1>
        <p style={{ fontSize: 14, color: P.sub, margin: 0 }}>Overview of your performance and patient demographics.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.teal}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color={P.teal} /></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: P.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Patients</span>
          </div>
          <p style={{ fontSize: 36, fontWeight: 900, color: P.navy, margin: 0 }}>{data.totalPatients}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(59,130,246,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} color="#3B82F6" /></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: P.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue (This Month)</span>
          </div>
          <p style={{ fontSize: 36, fontWeight: 900, color: P.navy, margin: 0 }}>₹{data.revenueThisMonth}</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: 24 }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...cardStyle }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: P.navy, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} color={P.teal}/> Appointments (Last 7 Days)</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.appointmentsLast7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: P.sub }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: P.sub }} />
                <Tooltip cursor={{ fill: 'rgba(13,196,161,0.05)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 600, color: P.ink }} />
                <Bar dataKey="count" fill={`url(#tealGradient)`} radius={[6, 6, 0, 0]} maxBarSize={40} />
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.teal} />
                    <stop offset="100%" stopColor="#09A888" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ ...cardStyle }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: P.navy, margin: '0 0 24px' }}>Reasons for Visit</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie data={data.reasonsForVisit} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {data.reasonsForVisit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 600, color: P.ink }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, color: P.sub }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
