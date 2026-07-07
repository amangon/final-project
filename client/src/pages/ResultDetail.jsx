import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trophy, TrendingUp, AlertCircle, CheckCircle, Target, Download } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import api from '../utils/api'

export default function ResultDetail() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/results/${id}`).then(({ data }) => { setResult(data.result); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!result) return <div className="text-center text-slate-400 py-20">Result not found</div>

  const radarData = [
    { subject: 'Technical', score: result.scores?.technical || 0 },
    { subject: 'Communication', score: result.scores?.communication || 0 },
    { subject: 'Grammar', score: result.scores?.grammar || 0 },
    { subject: 'Confidence', score: result.scores?.confidence || 0 },
    { subject: 'Problem Solving', score: result.scores?.problemSolving || 0 },
  ]

  const scoreColor = result.overallScore >= 80 ? '#10b981' : result.overallScore >= 60 ? '#6366f1' : result.overallScore >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-6 page-transition max-w-4xl">
      <div className="flex items-center gap-4">
        <Link to="/results" className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Interview Result</h1>
          <p className="text-slate-400 text-sm">{new Date(result.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Overall Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border text-center relative overflow-hidden"
        style={{ borderColor: `${scoreColor}30`, background: `${scoreColor}08` }}>
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 50%, ${scoreColor}, transparent)` }} />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
          className="w-32 h-32 rounded-full border-4 flex items-center justify-center mx-auto mb-4"
          style={{ borderColor: scoreColor }}>
          <div>
            <div className="text-4xl font-black" style={{ color: scoreColor }}>{result.overallScore}</div>
            <div className="text-xs text-slate-400">out of 100</div>
          </div>
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-1">Overall Performance</h2>
        <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold capitalize ${result.readinessLevel === 'expert' ? 'bg-purple-500/20 text-purple-400' : result.readinessLevel === 'advanced' ? 'bg-blue-500/20 text-blue-400' : result.readinessLevel === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>
          {result.readinessLevel} Level
        </span>
        <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">{result.detailedFeedback}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Target size={16} className="text-indigo-400" /> Skills Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" />
              <Radar name="Score" dataKey="score" stroke={scoreColor} fill={scoreColor} fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Detailed Feedback */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-400" /> Detailed Feedback</h3>
          <div className="space-y-4">
            {Object.entries(result.scores || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize text-sm text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-bold text-white">{value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Download Result */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="text-center mt-6">
        <a href={`/api/results/${id}/download`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
          <Download size={16} /> Download Result PDF
        </a>
      </motion.div>
    </div>
  )
}