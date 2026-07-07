import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mic, Code, Users, Brain, Building, Shuffle, Lock } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useInterviewStore from '../store/interviewStore'
import toast from 'react-hot-toast'

const types = [
  { id: 'technical', label: 'Technical', icon: Brain, color: '#6366f1', desc: 'DSA, System Design, Frameworks' },
  { id: 'behavioral', label: 'Behavioral', icon: Users, color: '#10b981', desc: 'STAR method, Soft skills' },
  { id: 'hr', label: 'HR Round', icon: Users, color: '#f59e0b', desc: 'Culture fit, Career goals' },
  { id: 'coding', label: 'Coding', icon: Code, color: '#8b5cf6', desc: 'Live coding problems', requiresPlan: true },
  { id: 'mixed', label: 'Mixed', icon: Shuffle, color: '#06b6d4', desc: 'All round comprehensive' },
  { id: 'company-specific', label: 'Company Specific', icon: Building, color: '#ec4899', desc: 'Google, Amazon, Microsoft...', requiresPlan: true },
]

const difficulties = ['easy', 'medium', 'hard']
const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Flipkart', 'Infosys', 'TCS', 'Wipro']

export default function Interview() {
  const [selectedType, setSelectedType] = useState('technical')
  const [difficulty, setDifficulty] = useState('medium')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [questions, setQuestions] = useState(10)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { startInterview } = useInterviewStore()
  const navigate = useNavigate()

  const handleStart = async () => {
    const selected = types.find(t => t.id === selectedType)
    if (selected?.requiresPlan && !user?.plan) {
      toast.error('This feature requires a Pro plan!')
      navigate('/plans')
      return
    }
    setLoading(true)
    const result = await startInterview({ type: selectedType, difficulty, targetCompany: company, targetRole: role, totalQuestions: questions })
    setLoading(false)
    if (result.success) navigate(`/interview/${result.interview._id}`)
    else toast.error(result.error || 'Failed to start interview')
  }

  return (
    <div className="space-y-6 page-transition max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Start Interview</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your interview session</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="font-bold text-white mb-4">Interview Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {types.map(type => {
            const locked = type.requiresPlan && !user?.plan
            return (
              <motion.button key={type.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border text-left transition-all relative ${selectedType === type.id ? 'border-indigo-500/60' : 'border-white/10 hover:border-white/20'}`}
                style={{ background: selectedType === type.id ? `${type.color}15` : 'rgba(255,255,255,0.02)' }}>
                {locked && <Lock size={12} className="absolute top-2 right-2 text-yellow-400" />}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${type.color}20` }}>
                  <type.icon size={16} style={{ color: type.color }} />
                </div>
                <p className="text-sm font-semibold text-white">{type.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{type.desc}</p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="font-bold text-white mb-4">Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {difficulties.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${difficulty === d
                    ? d === 'easy' ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : d === 'medium' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                      : 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Questions: {questions}</label>
            <input type="range" min="5" max="15" value={questions} onChange={e => setQuestions(parseInt(e.target.value))}
              className="w-full accent-indigo-500" />
            <div className="flex justify-between text-xs text-slate-600 mt-1"><span>5</span><span>15</span></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Target Role (optional)</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Developer"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-indigo-500 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Target Company (optional)</label>
            <select value={company} onChange={e => setCompany(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white border border-white/10 outline-none focus:border-indigo-500 transition-all"
              style={{ background: '#111827' }}>
              <option value="">Select Company</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={handleStart} disabled={loading}
        className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
        {loading
          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Mic size={18} /> Start {questions}-Question Interview</>}
      </motion.button>
    </div>
  )
}