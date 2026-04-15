import { useState } from 'react';
import { useStore } from '../store';
import { setApiKey as saveApiKey } from '../lib/storage';
import { Check, X } from 'lucide-react';

export default function Settings({ onClose }: { onClose: () => void }) {
  const { apiKey, setApiKey } = useStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await saveApiKey(inputKey);
    setApiKey(inputKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <p className="text-sm font-medium text-white">Settings</p>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-2">
            Gemini API Key
          </label>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!inputKey}
            className="px-4 py-2 bg-white text-black text-xs font-medium rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {saved ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved
              </span>
            ) : (
              'Save'
            )}
          </button>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Get API Key
          </a>
        </div>
      </div>
    </div>
  );
}
