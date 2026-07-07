import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Mic, FileText, Trophy, BarChart3,
  CreditCard, User, LogOut, Zap, Brain, ChevronRight, X, Crown
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Mic, label: 'Interview', path: '/interview' },
  { icon: FileText, label: 'Results', path: '/results' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: CreditCard, label: 'Plans', path: '/plans' },
  { icon: User, label: 'Profile', path: '/profile' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg">Interview</span>
            <span className="font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-lg">AI</span>
          </div>
        </Link>
      </div>

      {/* User Card */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          {user?.plan && <Crown size={14} className="text-yellow-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-indigo-400" />
            <span className="text-xs text-indigo-300 font-semibold">{user?.xp || 0} XP</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
            Lv.{user?.level || 1}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs">🪙</span>
            <span className="text-xs text-yellow-300 font-semibold">{user?.coins || 0}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path} onClick={onClose}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="text-sm font-medium">{label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Plan Banner */}
      {!user?.plan && (
        <div className="p-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <p className="text-xs font-bold text-white mb-1">Upgrade to Pro</p>
            <p className="text-xs text-slate-400 mb-3">Unlock unlimited interviews & AI features</p>
            <Link to="/plans">
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold">
                Upgrade Now
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex w-64 bg-[#0d0d14] border-r border-white/5 flex-col flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#0d0d14] border-r border-white/5 z-50 overflow-y-auto"
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-slate-400">
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}