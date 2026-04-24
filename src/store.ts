import { create } from 'zustand';

export interface DesignMdResult {
  id: string;
  url: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface AppError {
  code: string;
  message: string;
  suggestion?: string;
}

interface AppState {
  apiKey: string;
  isAnalyzing: boolean;
  designMdResult: DesignMdResult | null;
  history: DesignMdResult[];
  error: AppError | null;
  
  setApiKey: (key: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setDesignMdResult: (result: DesignMdResult | null) => void;
  setHistory: (history: DesignMdResult[]) => void;
  addToHistory: (result: DesignMdResult) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  setError: (error: AppError | null) => void;
}

export const useStore = create<AppState>((set) => ({
  apiKey: '',
  isAnalyzing: false,
  designMdResult: null,
  history: [],
  error: null,

  setApiKey: (key) => set({ apiKey: key }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setDesignMdResult: (result) => set({ designMdResult: result }),
  setHistory: (history) => set({ history }),
  addToHistory: (result) =>
    set((state) => ({
      history: [result, ...state.history].slice(0, 20),
    })),
  removeHistoryItem: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
      designMdResult:
        state.designMdResult?.id === id ? null : state.designMdResult,
    })),
  clearHistory: () => set({ history: [], designMdResult: null }),
  setError: (error) => set({ error }),
}));
