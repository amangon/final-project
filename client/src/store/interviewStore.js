import { create } from 'zustand'
import api from '../utils/api'

const useInterviewStore = create((set, get) => ({
  currentInterview: null,
  currentQuestion: null,
  questionIndex: 0,
  answers: [],
  isLoading: false,
  isCompleted: false,
  result: null,

  startInterview: async (config) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/interviews/start', config)
      set({
        currentInterview: data.interview,
        currentQuestion: data.interview.questions[0],
        questionIndex: 0,
        answers: [],
        isCompleted: false,
        result: null,
        isLoading: false
      })
      return { success: true, interview: data.interview }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err.response?.data?.error || 'Failed to start' }
    }
  },

  submitAnswer: async (answer, duration) => {
    const { currentInterview, currentQuestion, questionIndex } = get()
    set({ isLoading: true })
    try {
      const { data } = await api.post('/interviews/answer', {
        interviewId: currentInterview._id,
        questionId: currentQuestion._id,
        answer,
        duration
      })

      const nextIndex = questionIndex + 1
      const questions = currentInterview.questions

      set({
        answers: [...get().answers, { question: currentQuestion, answer, analysis: data.analysis }],
        questionIndex: nextIndex,
        currentQuestion: data.isCompleted ? null : questions[nextIndex],
        isCompleted: data.isCompleted,
        isLoading: false
      })

      return { success: true, ...data }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err.response?.data?.error }
    }
  },

  completeInterview: async () => {
    const { currentInterview } = get()
    set({ isLoading: true })
    try {
      const { data } = await api.post(`/interviews/complete/${currentInterview._id}`)
      set({ result: data.result, isCompleted: true, isLoading: false })
      return { success: true, result: data.result }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err.response?.data?.error }
    }
  },

  reset: () => set({ currentInterview: null, currentQuestion: null, questionIndex: 0, answers: [], isCompleted: false, result: null })
}))

export default useInterviewStore