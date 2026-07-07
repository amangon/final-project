import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileText, ArrowRight, Trophy, Clock, TrendingUp } from 'lucide-react'
import api from '../utils/api'

export default function Results() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/results/my?page=${page}&limit=10`)
        setResults(data.results)
        setPagination(data.pagination)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [page])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-white">Interview Results</h1>
        <p className="text-slate-400 text-sm mt-1">Your complete interview history and performance</p>
      </div>

      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <FileText size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Results Yet</h3>
          <p className="text-slate-400 text-sm mb-6">Complete your first interview to see results here.</p>
          <Link to="/interview">
            <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Start Interview
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {results.map((result, i) => (
            <motion.div key={result._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/results/${result._id}`}>
                <div className="p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${result.overallScore >= 70 ? 'border-green-500/50 text-green-400 bg-green-500/10' : result.overallScore >= 50 ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                        {result.overallScore}%
                      </div>
                      <div>
                        <p className="font-bold text-white capitalize">{result.interview?.type || 'Interview'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${result.readinessLevel === 'expert' ? 'bg-purple-500/20 text-purple-400' : result.readinessLevel === 'advanced' ? 'bg-blue-500/20 text-blue-400' : result.readinessLevel === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'} capitalize`}>
                            {result.readinessLevel}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={11} /> {new Date(result.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:grid grid-cols-3 gap-3">
                        {[
                          { label: 'Technical', val: result.scores?.technical },
                          { label: 'Communication', val: result.scores?.communication },
                          { label: 'Confidence', val: result.scores?.confidence }
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <div className="text-sm font-bold text-white">{s.val || 0}%</div>
                            <div className="text-xs text-slate-600">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <ArrowRight size={16} className="text-slate-600" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}