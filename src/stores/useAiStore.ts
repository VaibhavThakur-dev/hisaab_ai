import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AiTip } from '@/types';

interface AiState {
  aiTip: AiTip | null;
  isGenerating: boolean;
  error: string | null;
  setAiTip: (tip: AiTip | null) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
}

const useAiStore = create<AiState>()(
  devtools(
    (set) => ({
      aiTip: null,
      isGenerating: false,
      error: null,
      setAiTip: (aiTip) => set({ aiTip }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
    }),
    { name: 'ai-store' }
  )
);

export default useAiStore;
