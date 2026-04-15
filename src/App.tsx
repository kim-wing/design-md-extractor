import { useState, useEffect } from 'react';
import { useStore } from './store';
import { loadFromStorage } from './lib/storage';
import { generateDesignMd } from './lib/gemini';
import Settings from './components/Settings';
import ResultPanel from './components/ResultPanel';
import History from './components/History';
import { AlertCircle } from 'lucide-react';

// Ping background to ensure service worker is ready
const pingBackground = (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'PING' }, (resp) => {
      resolve(resp === 'PONG');
    });
    // Timeout after 2 seconds
    setTimeout(() => resolve(false), 2000);
  });
};

// Retry wrapper for chrome.runtime.sendMessage
const sendMessageWithRetry = (message: any, retries = 2): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft: number) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) {
          if (retriesLeft > 0) {
            // Retry after a short delay
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
  const { apiKey, setApiKey, isAnalyzing, setIsAnalyzing, designMdResult, setDesignMdResult, addToHistory, setError, error } = useStore();

  useEffect(() => {
    const init = async () => {
      const data = await loadFromStorage();
      setApiKey(data.apiKey || '');

      // Wait for background to be ready
      const ready = await pingBackground();
      setIsReady(ready);
      setIsLoading(false);
    };
    init();
  }, [setApiKey]);

  const handleAnalyze = async () => {
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
      // Get active tab
      const response = await sendMessageWithRetry({ type: 'GET_ACTIVE_TAB' });

      if (!response?.tab?.id) {
        throw new Error('No active tab found');
      }

      const tab = response.tab;

      // Extract styles from the tab
      const extractedStyle = await sendMessageWithRetry({
        type: 'EXTRACT_FROM_TAB',
        tabId: tab.id,
      });

      if (!extractedStyle) {
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

      const { addToHistory: saveHistory } = await import('./lib/storage');
      await saveHistory(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          onClick={handleAnalyze}
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
