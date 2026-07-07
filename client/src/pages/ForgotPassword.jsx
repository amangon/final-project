import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { forgotPassword } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await forgotPassword(email)
    setLoading(false)
    if (result.success) setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#04040a] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="rounded-3xl p-8 border border-white/10"
          style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(40px)' }}>
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email Sent!</h2>
              <p className="text-slate-400 text-sm mb-6">Check your inbox for password reset instructions.</p>
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">Back to Login</Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/10 outline-none focus:border-indigo-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}