import { motion } from 'framer-motion'
import { Bell, Menu, Search, Moon, Sun, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useGreeting from '../../hooks/useGreeting'
import api from '../../utils/api'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuthStore()
  const greeting = useGreeting(user?.name?.split(' ')[0])
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get('/notifications')
        setNotifications(data.notifications?.slice(0, 5) || [])
        setUnread(data.unreadCount || 0)
      } catch {}
    }
    fetchNotifs()
  }, [])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setUnread(0)
      setNotifications(n => n.map(x => ({ ...x, isRead: true })))
    } catch {}
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40"
    >
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-slate-500">{greeting.icon} {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <span className="text-sm font-semibold text-white">{greeting.text}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* XP Badge */}
        <motion.div whileHover={{ scale: 1.05 }} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Zap size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300">{user?.xp || 0} XP</span>
        </motion.div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white relative"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </motion.button>

          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-12 w-80 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-semibold text-white">Notifications</span>
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No notifications</div>
                ) : notifications.map(n => (
                  <div key={n._id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-indigo-500/5' : ''}`}>
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    <p className="text-xs text-slate-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Avatar */}
        <Link to="/profile">
          <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer">
            {user?.name?.charAt(0).toUpperCase()}
          </motion.div>
        </Link>
      </div>
    </motion.nav>
  )
}