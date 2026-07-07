import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const { token } = useParams()
  const { resetPassword } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const result = await resetPassword(token, password)
    setLoading(false)
    if (result.success) { setDone(true); setTimeout(() => navigate('/login'), 2000) }
    else setError(result.error || 'Reset failed')
  }

  return (
    <div className="min-h-screen bg-[#04040a] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="rounded-3xl p-8 border border-white/10" style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(40px)' }}>
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-slate-400 text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your new password below.</p>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required placeholder="New password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-indigo-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} value={confirm}
                    onChange={e => setConfirm(e.target.value)} required placeholder="Confirm new password"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-indigo-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-4">
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}