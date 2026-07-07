import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'

const suggestions = [
  'Explain React',
  'Explain Node.js',
  'Help with resume',
  'Interview feedback',
  'Career roadmap'
]

export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'ai',
      text: 'Hello! I can help with React, Node, MongoDB, DSA, resume review, and interview prep.'
    }
  ])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: message.trim() }])
    setMessage('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="mb-3 w-80 sm:w-96 rounded-2xl border border-white/10 shadow-2xl"
            style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(24px)' }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">InterviewAI Assistant</p>
                  <p className="text-xs text-slate-400">Always online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto px-4 py-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.from === 'user' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 px-3 py-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => setMessage(s)} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500/40 hover:text-white">
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-2 text-white">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
      >
        <MessageCircle size={16} />
        AI Assistant
      </motion.button>
    </div>
  )
}
