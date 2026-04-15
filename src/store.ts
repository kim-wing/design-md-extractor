import { create } from 'zustand';

export interface ExtractedStyle {
  url: string;
  title: string;
  colors: string[];
  fonts: string[];
  cssVariables: Record<string, string>;
  screenshot?: string;
}

export interface DesignMdResult {
  id: string;
  url: string;
  title: string;
  content: string;
  createdAt: number;
}

interface AppState {
  apiKey: string;
  isAnalyzing: boolean;
  currentUrl: string;
  extractedStyle: ExtractedStyle | null;
  designMdResult: DesignMdResult | null;
  history: DesignMdResult[];
  error: string | null;
  
  setApiKey: (key: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setCurrentUrl: (url: string) => void;
  setExtractedStyle: (style: ExtractedStyle | null) => void;
  setDesignMdResult: (result: DesignMdResult | null) => void;
  addToHistory: (result: DesignMdResult) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>((set) => ({
  apiKey: '',
  isAnalyzing: false,
  currentUrl: '',
  extractedStyle: null,
  designMdResult: null,
  history: [],
  error: null,

  setApiKey: (key) => set({ apiKey: key }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setCurrentUrl: (url) => set({ currentUrl: url }),
  setExtractedStyle: (style) => set({ extractedStyle: style }),
  setDesignMdResult: (result) => set({ designMdResult: result }),
  addToHistory: (result) =>
    set((state) => ({
      history: [result, ...state.history].slice(0, 20),
    })),
  setError: (error) => set({ error }),
  clearHistory: () => set({ history: [] }),
}));
