import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Lock, Crown, Zap, ArrowRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Plans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/plans').then(({ data }) => { setPlans(data.plans); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSelect = (plan) => {
    if (plan.price === 0) { toast('You already have the free plan!'); return }
    navigate(`/payment/${plan._id}`)
  }

  const isCurrentPlan = (plan) => user?.plan?._id === plan._id || user?.plan?.slug === plan.slug

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 page-transition">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-white mb-2">Choose Your Plan</h1>
        <p className="text-slate-400">Upgrade to unlock premium AI interview features</p>
      </motion.div>

      {user?.plan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-indigo-500/30 flex items-center gap-3"
          style={{ background: 'rgba(99,102,241,0.08)' }}>
          <Crown size={18} className="text-yellow-400" />
          <span className="text-sm text-slate-300">Current Plan: <strong className="text-white">{user.plan.name}</strong></span>
          {user?.planExpiry && <span className="text-xs text-slate-500 ml-auto">Expires: {new Date(user.planExpiry).toLocaleDateString()}</span>}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <motion.div key={plan._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl border relative ${plan.isPopular ? 'border-indigo-500/50' : 'border-white/10'} ${isCurrentPlan(plan) ? 'border-green-500/50' : ''}`}
            style={{ background: plan.isPopular ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)' }}>
            {plan.isPopular && !isCurrentPlan(plan) && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Most Popular</div>
            )}
            {isCurrentPlan(plan) && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white bg-green-600">Current Plan</div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-black text-white">{plan.name}</h3>
              <p className="text-slate-400 text-xs mt-1">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">₹{plan.price}</span>
              <span className="text-slate-400 text-sm">/{plan.duration === 36500 ? 'forever' : `${plan.duration} days`}</span>
            </div>
            {plan.originalPrice && plan.originalPrice > plan.price && (
              <p className="text-xs text-slate-500 -mt-4 mb-4">
                <span className="line-through">₹{plan.originalPrice}</span>
                <span className="text-green-400 ml-2">{Math.round((1 - plan.price/plan.originalPrice)*100)}% off</span>
              </p>
            )}

            <ul className="space-y-2 mb-6">
              {plan.features?.filter(f => f.enabled).map((feature, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check size={14} style={{ color: plan.color || '#6366f1' }} />
                  {feature.name}
                </li>
              ))}
            </ul>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(plan)}
              disabled={isCurrentPlan(plan)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={plan.isPopular && !isCurrentPlan(plan)
                ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}>
              {isCurrentPlan(plan) ? 'Current Plan' : plan.price === 0 ? 'Free Forever' : `Upgrade to ${plan.name}`}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}