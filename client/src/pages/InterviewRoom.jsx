import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Send, Clock, X, Volume2, CheckCircle, ChevronRight } from 'lucide-react'
import useSpeech from '../hooks/useSpeech'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function InterviewRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [currentQ, setCurrentQ] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [phase, setPhase] = useState('intro')
  const [feedback, setFeedback] = useState(null)
  const [aiMessage, setAiMessage] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [completing, setCompleting] = useState(false)
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking } = useSpeech()
  const timerRef = useRef(null)

  useEffect(() => { loadInterview() }, [id])
  useEffect(() => { if (transcript) setAnswer(transcript) }, [transcript])

  useEffect(() => {
    if (phase === 'question') {
      setTimeLeft(120)
      setStartTime(Date.now())
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, qIndex])

  const loadInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`)
      setInterview(data.interview)
      setCurrentQ(data.interview.questions[0])
      startIntroSequence(data.interview)
    } catch { toast.error('Failed to load interview'); navigate('/interview') }
  }

  const startIntroSequence = (iv) => {
    const msgs = [
      `Hello ${iv.user?.name || 'there'}! Welcome to InterviewAI.`,
      "My name is Alex. I will be conducting your interview today.",
      `This session contains ${iv.totalQuestions} questions covering ${iv.type} topics.`,
      "Please answer clearly and take your time. Are you ready to begin?"
    ]
    let i = 0
    const showNext = () => {
      if (i < msgs.length) {
        setAiMessage(msgs[i])
        speak(msgs[i], () => { i++; setTimeout(showNext, 500) })
      } else { setPhase('question') }
    }
    setTimeout(showNext, 800)
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim() && phase === 'question') { toast.error('Please provide an answer'); return }
    clearInterval(timerRef.current)
    stopListening()
    setSubmitting(true)
    try {
      const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 60
      const { data } = await api.post(`/interviews/${id}/answer`, {
        questionId: currentQ._id, questionText: currentQ.content, answer, duration
      })
      setFeedback(data.analysis)
      setPhase('feedback')
      speak(`Your score for this question is ${data.analysis.score} out of 100. ${data.analysis.feedback}`)
    } catch { toast.error('Failed to submit answer') }
    setSubmitting(false)
  }

  const handleNext = () => {
    if (!interview) return
    const nextIndex = qIndex + 1
    if (nextIndex >= interview.totalQuestions) {
      handleComplete()
    } else {
      setQIndex(nextIndex)
      setCurrentQ(interview.questions[nextIndex])
      setAnswer('')
      setFeedback(null)
      setPhase('question')
      const q = interview.questions[nextIndex]
      setAiMessage(q.content)
      speak(q.content)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      const { data } = await api.post(`/interviews/${id}/complete`)
      toast.success(`Interview complete! Score: ${data.overallScore}%`)
      navigate(`/results/${data.result._id}`)
    } catch { toast.error('Failed to complete interview') }
    setCompleting(false)
  }

  const handleAbandon = async () => {
    if (!confirm('Are you sure you want to abandon this interview?')) return
    await api.post(`/interviews/${id}/abandon`)
    navigate('/interview')
  }

  const timerColor = timeLeft > 60 ? '#10b981' : timeLeft > 30 ? '#f59e0b' : '#ef4444'

  if (!interview) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6" style={{ background: 'rgba(10,10,15,0.9)' }}>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold text-white capitalize">{interview.type} Interview</span>
          <span className="text-xs text-slate-500">Question {qIndex + 1} of {interview.totalQuestions}</span>
        </div>
        <div className="flex items-center gap-4">
          {phase === 'question' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ borderColor: `${timerColor}40`, background: `${timerColor}10` }}>
              <Clock size={14} style={{ color: timerColor }} />
              <span className="text-sm font-bold font-mono" style={{ color: timerColor }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          )}
          <button onClick={handleAbandon} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/5">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          animate={{ width: `${((qIndex + (phase === 'feedback' ? 1 : 0)) / interview.totalQuestions) * 100}%` }}
          transition={{ duration: 0.5 }} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* AI Avatar Panel */}
        <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col items-center gap-4" style={{ background: 'rgba(10,10,20,0.5)' }}>
          {/* Avatar */}
          <div className="relative">
            <motion.div
              animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1, boxShadow: isSpeaking ? ['0 0 0 0 rgba(99,102,241,0)', '0 0 0 20px rgba(99,102,241,0.1)', '0 0 0 0 rgba(99,102,241,0)'] : 'none' }}
              transition={{ duration: 1.5, repeat: isSpeaking ? Infinity : 0 }}
              className="w-32 h-32 rounded-full border-2 border-indigo-500/40 flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
              <span className="text-5xl">🤖</span>
            </motion.div>
            {isSpeaking && (
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-indigo-500/30" />
            )}
            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center ${isSpeaking ? 'bg-indigo-500' : 'bg-green-500'}`}>
              <Volume2 size={10} className="text-white" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-bold text-white">Alex</p>
            <p className="text-xs text-slate-500">AI Interviewer</p>
          </div>

          {aiMessage && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="w-full p-4 rounded-xl border border-indigo-500/20 text-sm text-slate-300 leading-relaxed"
              style={{ background: 'rgba(99,102,241,0.05)' }}>
              {aiMessage}
            </motion.div>
          )}

          {phase === 'intro' && (
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ y: [-4,0,-4] }} transition={{ duration: 0.6, delay: i*0.2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-indigo-500" />
              ))}
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4" />
                  <p className="text-slate-400">Preparing your interview...</p>
                </div>
              </motion.div>
            )}

            {phase === 'question' && currentQ && (
              <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="flex-1 flex flex-col gap-6">
                <div className="p-6 rounded-2xl border border-indigo-500/20" style={{ background: 'rgba(99,102,241,0.05)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold capitalize">{currentQ.type}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${currentQ.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : currentQ.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{currentQ.difficulty}</span>
                  </div>
                  <p className="text-white font-medium text-lg leading-relaxed">{currentQ.content}</p>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your answer here, or use the microphone to speak..."
                    className="flex-1 min-h-48 w-full p-4 rounded-xl border border-white/10 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 resize-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)' }} />

                  <div className="flex items-center gap-3">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={isListening ? stopListening : startListening}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition-all ${isListening ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-white/10 text-slate-400 hover:border-indigo-500/50'}`}>
                      {isListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Speak</>}
                    </motion.button>
                    {isListening && (
                      <div className="flex gap-1">
                        {[0,1,2,3].map(i => (
                          <motion.div key={i} animate={{ scaleY: [1, 2, 1] }} transition={{ duration: 0.5, delay: i*0.1, repeat: Infinity }}
                            className="w-1 h-4 bg-red-500 rounded-full" />
                        ))}
                      </div>
                    )}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitAnswer} disabled={submitting || !answer.trim()}
                      className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Submit</>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'feedback' && feedback && (
              <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col gap-6">
                <div className="p-6 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-400" /> Answer Analysis
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center font-black text-2xl"
                      style={{ borderColor: feedback.score >= 70 ? '#10b981' : feedback.score >= 50 ? '#f59e0b' : '#ef4444', color: feedback.score >= 70 ? '#10b981' : feedback.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {feedback.score}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed flex-1">{feedback.feedback}</p>
                  </div>
                  {feedback.details && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(feedback.details).filter(([k]) => k !== 'keywords').map(([key, val]) => (
                        <div key={key} className="p-3 rounded-xl border border-white/5 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="text-lg font-black text-indigo-400">{val}</div>
                          <div className="text-xs text-slate-500 capitalize mt-0.5">{key}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleNext} disabled={completing}
                  className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {completing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : qIndex + 1 >= interview.totalQuestions ? '🎉 Complete Interview' : <>Next Question <ChevronRight size={18} /></>}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}