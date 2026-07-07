import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Download, Smartphone, Upload, CheckCircle, ArrowLeft } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Payment() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [utr, setUtr] = useState('')
  const [txnId, setTxnId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    api.get(`/plans/${planId}/payment-details`)
      .then(({ data }) => { setPaymentDetails(data); setLoading(false) })
      .catch(() => { toast.error('Failed to load payment details'); navigate('/plans') })
  }, [planId])

  const copyUPI = () => {
    navigator.clipboard.writeText(paymentDetails.upiId)
    toast.success('UPI ID copied!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!utr && !txnId) { toast.error('Please enter UTR or Transaction ID'); return }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('planId', planId)
      formData.append('utrNumber', utr)
      formData.append('transactionId', txnId)
      if (screenshot) formData.append('screenshot', screenshot)

      await api.post('/payments/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSubmitted(true)
      toast.success('Payment submitted for review!')
    } catch { toast.error('Failed to submit payment') }
    setSubmitting(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  if (submitted) return (
    <div className="max-w-md mx-auto text-center py-20">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
        className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={40} className="text-green-400" />
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-2">Payment Submitted!</h2>
      <p className="text-slate-400 mb-6">Your payment is under review. Your plan will be activated within 24 hours.</p>
      <button onClick={() => navigate('/dashboard')}
        className="px-6 py-3 rounded-xl font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        Go to Dashboard
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-transition">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/plans')} className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all">
          <ArrowLeft size