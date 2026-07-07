import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import useAuthStore from '../store/authStore'

const CODE_WORDS = ['React', 'Express', 'MongoDB', 'Node.js', 'JWT', 'AI Interview', 'REST API', 'Dashboard', 'TypeScript', 'Mongoose']

export default function LampLogin() {
  const [lampOn, setLampOn] = useState(false)
  const [flickering, setFlickering] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [swinging, setSwinging] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeText, setCodeText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [particles, setParticles] = useState([])
  const [bulbOpacity, setBulbOpacity] = useState(0)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lampOn) return
    const word = CODE_WORDS[wordIdx]
    const speed = deleting ? 50 : 100
    const timer = setTimeout(() => {
      if (!deleting) {
        setCodeText(word.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), 1500)
      } else {
        setCodeText(word.slice(0, charIdx - 1))
        setCharIdx(c => c - 1)
        if (charIdx <= 1) {
          setDeleting(false)
          setWordIdx(i => (i + 1) % CODE_WORDS.length)
        }
      }
    }, speed)
    return () => clearTimeout(timer)
  }, [lampOn, charIdx, deleting, wordIdx])

  useEffect(() => {
    if (!lampOn) return
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 25 + Math.random() * 50,
      initY: 15 + Math.random() * 70,
      size: 1 + Math.random() * 2,
      duration: 4 + Math.random() * 5,
      delay: Math.random() * 4
    })))
  }, [lampOn])

  const handleLampClick = () => {
    if (lampOn || flickering) return
    setSwinging(true)
    setFlickering(true)
    const seq = [200, 500, 750, 1050, 1250, 1600]
    seq.forEach((delay, i) => {
      setTimeout(() => {
        const on = i % 2 !== 0
        setBulbOpacity(on ? 0.9 : 0)
        setLampOn(on)
        if (i === seq.length - 1) {
          setLampOn(true)
          setBulbOpacity(1)
          setFlickering(false)
          setSwinging(false)
          setTimeout(() => setShowLogin(true), 700)
        }
      }, delay)
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#04040a] flex items-center justify-center relative overflow-hidden select-none">

      {/* Code wall background */}
      <AnimatePresence>
        {lampOn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="font-mono text-indigo-500/10 text-8xl font-black whitespace-nowrap">
              {`{ `}{codeText}<span className="animate-pulse text-indigo-400/20">_</span>{` }`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volumetric light */}
      <AnimatePresence>
        {lampOn && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
            style={{
              width: '700px', height: '100vh', transformOrigin: 'top center',
              background: 'conic-gradient(from 265deg at 50% 0%, transparent 25%, rgba(255,230,120,0.04) 38%, rgba(255,210,80,0.1) 50%, rgba(255,230,120,0.04) 62%, transparent 75%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Floor reflection */}
      <AnimatePresence>
        {lampOn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(255,200,50,0.06) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Dust particles */}
      {lampOn && particles.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full pointer-events-none z-10"
          style={{ left: `${p.x}%`, top: `${p.initY}%`, width: p.size, height: p.size, background: 'rgba(255,230,150,0.4)' }}
          animate={{ y: [-20, 20, -20], x: [0, 8, -8, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Lamp assembly */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
        {/* Ceiling wire */}
        <motion.div
          animate={swinging ? { rotate: [0, 8, -8, 5, -5, 2, -2, 0] } : { rotate: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center' }}
          className="flex flex-col items-center"
        >
          {/* Wire */}
          <div className="w-0.5 h-20 bg-gradient-to-b from-gray-500 to-gray-700" />

          {/* Lamp shade */}
          <div className="relative">
            <div className="w-20 h-10 rounded-b-full"
              style={{ background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)', boxShadow: lampOn ? '0 0 20px rgba(255,200,50,0.3)' : 'none', border: '1px solid #333' }} />

            {/* Bulb */}
            <motion.div
              animate={{ opacity: bulbOpacity, boxShadow: lampOn ? ['0 0 20px rgba(255,200,50,0.8)', '0 0 40px rgba(255,200,50,1)', '0 0 20px rgba(255,200,50,0.8)'] : '0 0 0px transparent' }}
              transition={{ duration: 1.5, repeat: lampOn ? Infinity : 0, repeatType: 'reverse' }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-10 rounded-full"
              style={{ background: lampOn ? 'radial-gradient(circle, #fff9c4 0%, #ffd700 50%, #ffb300 100%)' : '#222', border: '2px solid #444' }}
            />
          </div>

          {/* Pull cord */}
          <motion.div
            className="flex flex-col items-center cursor-pointer"
            onClick={handleLampClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-px h-12 bg-gray-500" />
            <motion.div
              animate={swinging ? { y: [0, 4, 0] } : {}}
              className="w-4 h-4 rounded-full bg-gray-400 border-2 border-gray-500 shadow-md"
            />
            {!lampOn && !flickering && (
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                className="mt-2 text-[10px] text-gray-500 font-mono whitespace-nowrap">
                click to turn on
              </motion.span>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Login Card */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0, x: 120, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150, delay: 0.1 }}
            className="relative z-40 w-full max-w-md mx-4"
          >
            <div className="rounded-3xl p-8 border border-white/10 shadow-2xl"
              style={{ background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(40px)', boxShadow: '0 0 60px rgba(99,102,241,0.1), 0 25px 50px rgba(0,0,0,0.5)' }}>

              {/* Logo */}
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                  <span className="text-2xl">🧠</span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-white">
                  Welcome back
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="text-slate-400 text-sm mt-1">Secure access to your AI interview cockpit</motion.p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/10 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                      style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/10 outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                      style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
                </div>

                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
                >
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                </motion.button>
              </form>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="text-center text-sm text-slate-500 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign up free</Link>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark room hint */}
      <AnimatePresence>
        {!lampOn && (
          <motion.div exit={{ opacity: 0 }} className="absolute bottom-8 text-center z-20">
            <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
              className="text-gray-600 text-sm font-mono">
              🔦 Pull the switch to begin
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}