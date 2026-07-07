import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, CreditCard, Package,
  HelpCircle, Settings, BarChart3, LogOut, Brain, Shield
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
  { icon: Package, label: 'Plans', path: '/admin/plans' },
  { icon: HelpCircle, label: 'Questions', path: '/admin/questions' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <div className="w-60 bg-[#0d0d14] border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Shield size={15} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Admin</span>
              <span className="font-bold text-red-400 text-sm"> Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active ? 'bg-indigo-500/20 text-white border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                  <Icon size={16} />
                  <span className="font-medium">{label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/admin/login') }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full text-sm transition-all">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur flex items-center px-6">
          <h1 className="text-sm font-semibold text-slate-300">
            {adminNav.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}