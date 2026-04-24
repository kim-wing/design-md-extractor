import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { addToHistory as saveHistory, loadFromStorage } from './lib/storage';
import { generateDesignMd } from './lib/gemini';
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
}

interface BackgroundMessageResponse<T> {
  error?: string;
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
    typeof candidate.cssVariables === 'object' &&
    candidate.cssVariables !== null
  );
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
      setError('Extension not ready. Please try again or reload the extension.');
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
          throw new Error(response.error);
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
        throw new Error(extractionResponse.error);
      }

      const extractedStyle = extractionResponse?.payload;
      if (!isExtractedStylePayload(extractedStyle)) {
        throw new Error('Failed to extract styles. Make sure you are on a webpage.');
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
      setError(err instanceof Error ? err.message : 'Analysis failed');
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
          <div className="mb-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
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
