import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Brain, Mic, BarChart3, Shield, Zap, Star, ArrowRight, Check, Play } from 'lucide-react'

const stats = [
  { value: '50K+', label: 'Interviews Conducted' },
  { value: '94%', label: 'Success Rate' },
  { value: '200+', label: 'Companies Covered' },
  { value: '4.9★', label: 'User Rating' },
]

const features = [
  { icon: Brain, title: 'AI-Powered Questions', desc: 'Intelligent questions tailored to your role, experience, and target company.', color: '#6366f1' },
  { icon: Mic, title: 'Voice Interview', desc: 'Practice with real-time speech recognition and AI evaluation of your responses.', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Detailed performance reports with scores, strengths, and improvement plans.', color: '#06b6d4' },
  { icon: Shield, title: 'ATS Resume Analysis', desc: 'Get your resume scored and optimized for Applicant Tracking Systems.', color: '#10b981' },
  { icon: Zap, title: 'Instant Feedback', desc: 'Real-time AI feedback on grammar, confidence, and technical accuracy.', color: '#f59e0b' },
  { icon: Star, title: 'Company Specific', desc: 'Practice for Google, Amazon, Microsoft, and 200+ other top companies.', color: '#ec4899' },
]

const plans = [
  { name: 'Free', price: '₹0', period: 'forever', color: '#64748b', features: ['5 Interviews/day', 'Basic AI', 'Basic Reports', 'Community Support'] },
  { name: 'Pro', price: '₹499', period: '/month', color: '#6366f1', popular: true, features: ['Unlimited Interviews', 'Resume Analyzer', 'Voice Interview', 'ATS Score', 'Priority Support'] },
  { name: 'Pro Max', price: '₹999', period: '/month', color: '#8b5cf6', features: ['Everything in Pro', 'AI Avatar', 'AI Mentor', 'Company Specific', 'Certificates', 'Career Coach'] },
]

export default function Landing() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80])
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.4 + 0.1
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(99,102,241,${0.1 * (1 - dist / 100)})`
            ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="min-h-screen bg-[#04040a] text-white overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5"
        style={{ background: 'rgba(4,4,10,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg">Interview<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-4 py-2">Sign In</Link>
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section style={{ y: heroY }} className="relative pt-32 pb-20 px-6 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
          <Zap size={14} /> AI-Powered Interview Practice Platform
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
          Ace Every<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Interview
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Practice with AI, get instant feedback, and land your dream job.
          The most advanced interview preparation platform powered by AI.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99,102,241,0.5)' }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
              Start Free Today <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-slate-300 border border-white/10 hover:border-indigo-500/50 transition-colors">
              <Play size={16} /> Watch Demo
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20">
          {stats.map((s, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }}
              className="p-5 rounded-2xl border border-white/10 text-center"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Everything You Need to<br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Get Hired</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">A complete interview preparation suite powered by cutting-edge AI technology.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, borderColor: f.color }}
                className="p-6 rounded-2xl border border-white/10 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Simple <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Pricing</span></h2>
            <p className="text-slate-400">Start free, upgrade when you're ready.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl border relative ${plan.popular ? 'border-indigo-500/50' : 'border-white/10'}`}
                style={{ background: plan.popular ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)' }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Most Popular</div>
                )}
                <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                    style={plan.popular
                      ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl border border-indigo-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' }}>
          <h2 className="text-4xl font-black mb-4">Ready to Get Hired?</h2>
          <p className="text-slate-400 mb-8">Join 50,000+ developers who practice with InterviewAI daily.</p>
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-2xl font-bold text-white text-base flex items-center gap-2 mx-auto"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
              Start Practicing Free <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-600 text-sm">
        © 2025 InterviewAI. Built with ❤️ for developers.
      </footer>
    </div>
  )
}