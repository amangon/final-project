import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('token', data.token)
          set({ user: data.user, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, error: err.response?.data?.error || 'Login failed' }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { name, email, password })
          localStorage.setItem('token', data.token)
          set({ user: data.user, token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, error: err.response?.data?.error || 'Registration failed' }
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null })
      },

      forgotPassword: async (email) => {
        try {
          await api.post('/auth/forgot-password', { email })
          return { success: true }
        } catch (err) {
          return { success: false, error: err.response?.data?.error || 'Failed to send reset link' }
        }
      },

      resetPassword: async (token, password) => {
        try {
          await api.post(`/auth/reset-password/${token}`, { password })
          return { success: true }
        } catch (err) {
          return { success: false, error: err.response?.data?.error || 'Failed to reset password' }
        }
      },

      updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.user })
        } catch (e) {}
      }
    }),
    { name: 'auth-storage', partialize: state => ({ token: state.token, user: state.user }) }
  )
)

export default useAuthStore