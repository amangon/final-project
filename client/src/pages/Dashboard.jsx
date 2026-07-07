import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mic, Trophy, Zap, Target, Play, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import useAuthStore from '../store/authStore'
import useGreeting from '../hooks/useGreeting'
import api from '../utils/api'

export default function Dashboard() {
  const { user } = useAuthStore()
  const greeting = useGreeting(user?.name?.split(' ')[0])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/dashboard')
      .then(({ data }) => { setStats(data.stats); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Interviews', value: stats?.totalInterviews || 0, icon: Mic, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Avg Score', value: `${stats?.avgScore || 0}%`, icon: Target, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Streak', value: `${stats?.streak || 0} days`, icon: Trophy, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Total XP', value: stats?.xp || 0, icon: Zap, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 page-transition">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />{greeting.text}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">{greeting.icon} {user?.name || 'Aman'}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {stats?.totalInterviews === 0 ? "Start your first interview today and build your momentum." : `${stats?.totalInterviews} interviews completed. Keep going!`}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3 }} className="p-5 rounded-2xl border border-white/10 transition-all"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div className="text-2xl font-black text-white">{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Ready for an Interview?</h2>
            <p className="text-slate-400 text-sm">
              {user?.plan ? 'Unlimited interviews available' : `${Math.max(0, 5 - (user?.dailyInterviewCount || 0))} interviews remaining today`}
            </p>
          </div>
          <Link to="/interview">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Play size={16} /> Start Interview
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" /> Score History
          </h3>
          {stats?.scoreHistory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="interview" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              Complete interviews to see your progress
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Target size={16} className="text-purple-400" /> Skills Radar
          </h3>
          {stats?.radarData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={stats.radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              Complete interviews to see skill breakdown
            </div>
          )}
        </motion.div>
      </div>

      {stats?.recentInterviews?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" /> Recent Interviews
            </h3>
            <Link to="/results" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentInterviews.map((interview, i) => (
              <Link key={i} to={`/results/${interview.result?._id}`}>
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Mic size={14} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white capitalize">{interview.type} Interview</p>
                      <p className="text-xs text-slate-500">{new Date(interview.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${interview.overallScore >= 70 ? 'text-green-400' : interview.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {interview.overallScore}%
                    </span>
                    <ArrowRight size={14} className="text-slate-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}