import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AiTip } from '@/types'

interface AiState {
  aiTip: AiTip | null
  isLoading: boolean
  isGenerating: boolean
  error: string | null
  setAiTip: (tip: AiTip | null) => void
  setLoading: (loading: boolean) => void
  setGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
}

const useAiStore = create<AiState>()(
  devtools(
    (set) => ({
      aiTip: null,
      isLoading: false,
      isGenerating: false,
      error: null,
      setAiTip: (aiTip) => set({ aiTip }),
      setLoading: (isLoading) => set({ isLoading }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
    }),
    { name: 'ai-store' }
  )
)

export default useAiStore
