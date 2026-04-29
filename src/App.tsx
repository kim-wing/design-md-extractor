import { useState, useEffect, useRef } from 'react';
import { type AppError, useStore } from './store';
import { addToHistory as saveHistory, loadFromStorage } from './lib/storage';
import { DesignMdGenerationError, generateDesignMd } from './lib/gemini';
import Settings from './components/Settings';
import ResultPanel from './components/ResultPanel';
import History from './components/History';
import { AlertCircle } from 'lucide-react';

interface ExtractedStylePayload {
  url: string;
  title: string;
  colors: string[];
  fonts: string[];
  cssVariables: Record<string, string>;
  typographyScale?: Array<Record<string, string>>;
  spacingScale: string[];
  borderRadiusScale: string[];
  shadowStyles: string[];
  layoutHints: {
    maxWidthCandidates: string[];
    gapScale: string[];
  };
  buttons: Array<Record<string, string>>;
  inputs: Array<Record<string, string>>;
  surfaces: Array<Record<string, string>>;
  navigation?: Array<Record<string, string>>;
  imageTreatment?: Array<Record<string, string>>;
  motionStyles?: string[];
}

interface BackgroundMessageResponse<T> {
  error?: AppError;
  tab?: chrome.tabs.Tab;
  payload?: T;
}

const isExtractedStylePayload = (
  value: unknown
): value is ExtractedStylePayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ExtractedStylePayload>;
  return (
    typeof candidate.url === 'string' &&
    typeof candidate.title === 'string' &&
    Array.isArray(candidate.colors) &&
    Array.isArray(candidate.fonts) &&
    Array.isArray(candidate.spacingScale) &&
    Array.isArray(candidate.borderRadiusScale) &&
    Array.isArray(candidate.shadowStyles) &&
    typeof candidate.cssVariables === 'object' &&
    candidate.cssVariables !== null &&
    typeof candidate.layoutHints === 'object' &&
    candidate.layoutHints !== null &&
    Array.isArray(candidate.buttons) &&
    Array.isArray(candidate.inputs) &&
    Array.isArray(candidate.surfaces)
  );
};

const normalizeAppError = (error: unknown): AppError => {
  if (error instanceof DesignMdGenerationError) {
    return {
      code: error.code,
      message: error.message,
      suggestion: error.suggestion,
    };
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const candidate = error as Partial<AppError>;
    return {
      code: candidate.code || 'unknown_error',
      message: candidate.message || 'Unknown error',
      suggestion: candidate.suggestion,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: error.message,
    };
  }

  return {
    code: 'unknown_error',
    message: 'Analysis failed',
  };
};

const pingBackground = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, 2000);

    chrome.runtime.sendMessage({ type: 'PING' }, (resp) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);

      if (chrome.runtime.lastError) {
        resolve(false);
        return;
      }

      resolve(resp === 'PONG');
    });
  });
};

const sendMessageWithRetry = <T,>(
  message: Record<string, unknown>,
  retries = 2
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft: number) => {
      chrome.runtime.sendMessage(message, (resp: T) => {
        if (chrome.runtime.lastError) {
          if (retriesLeft > 0) {
            setTimeout(() => attempt(retriesLeft - 1), 500);
          } else {
            reject(new Error(chrome.runtime.lastError.message));
          }
        } else {
          resolve(resp);
        }
      });
    };
    attempt(retries);
  });
};

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const analyzeRef = useRef<(tabId?: number) => Promise<void>>(async () => {});
  const {
    apiKey,
    setApiKey,
    isAnalyzing,
    setIsAnalyzing,
    designMdResult,
    setDesignMdResult,
    setHistory,
    addToHistory,
    setError,
    error,
  } = useStore();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const data = await loadFromStorage();
      if (!isMounted) {
        return;
      }

      setApiKey(data.apiKey || '');
      setHistory(data.history || []);

      const ready = await pingBackground();
      if (!isMounted) {
        return;
      }

      setIsReady(ready);
      setIsLoading(false);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [setApiKey, setHistory]);

  const analyze = async (preferredTabId?: number) => {
    const { apiKey: currentKey } = useStore.getState();

    if (!currentKey) {
      setShowSettings(true);
      return;
    }

    if (!isReady) {
      setError({
        code: 'extension_not_ready',
        message: 'Extension not ready.',
        suggestion: 'Reload the extension and try again.',
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let tabId = preferredTabId;

      if (!tabId) {
        const response = await sendMessageWithRetry<
          BackgroundMessageResponse<never>
        >({ type: 'GET_ACTIVE_TAB' });

        if (response?.error) {
          throw response.error;
        }

        if (!response?.tab?.id) {
          throw new Error('No active tab found');
        }

        tabId = response.tab.id;
      }

      const extractionResponse = await sendMessageWithRetry<
        BackgroundMessageResponse<ExtractedStylePayload>
      >({
        type: 'EXTRACT_FROM_TAB',
        tabId,
      });

      if (extractionResponse?.error) {
        throw extractionResponse.error;
      }

      const extractedStyle = extractionResponse?.payload;
      if (!isExtractedStylePayload(extractedStyle)) {
        throw {
          code: 'invalid_extraction_payload',
          message: 'Failed to extract styles from the current page.',
          suggestion: 'Reload the page and try again.',
        } satisfies AppError;
      }

      const content = await generateDesignMd(currentKey, extractedStyle);

      const result = {
        id: Date.now().toString(),
        url: extractedStyle.url,
        title: extractedStyle.title,
        content,
        createdAt: Date.now(),
      };

      setDesignMdResult(result);
      addToHistory(result);
      await saveHistory(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(normalizeAppError(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  analyzeRef.current = analyze;

  useEffect(() => {
    const listener = (message: { type?: string; tabId?: number }) => {
      if (message.type === 'TRIGGER_ANALYZE_FROM_CONTEXT_MENU') {
        void analyzeRef.current(message.tabId);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-neutral-800">
        <h1 className="text-sm font-medium text-white">
          getdesign.md
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-neutral-500 hover:text-white transition-colors"
        >
          Settings
        </button>
      </header>

      {/* Content */}
      <main className="p-4">
        {/* API Key Warning */}
        {!apiKey && !showSettings && (
          <div className="mb-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <p className="text-xs text-neutral-400">
              <button onClick={() => setShowSettings(true)} className="text-white hover:underline">
                Add API Key
              </button>
              {' '}to use the extractor
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-red-400">{error.message}</p>
              {error.suggestion && (
                <p className="mt-1 text-xs text-neutral-500">{error.suggestion}</p>
              )}
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4">
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        )}

        {/* Extract Button */}
        <button
          onClick={() => void analyze()}
          disabled={isAnalyzing || !apiKey}
          className="w-full py-3 px-4 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Extracting...' : 'Extract DESIGN.md'}
        </button>

        {/* Result Panel */}
        {designMdResult && (
          <div className="mt-5">
            <ResultPanel result={designMdResult} />
          </div>
        )}

        {/* History */}
        <History />
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-neutral-800">
        <a
          href="https://designmd.542186947.workers.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neutral-500 hover:text-white transition-colors"
        >
          Browse 66+ DESIGN.md Examples →
        </a>
      </footer>
    </div>
  );
}

export default App;
