import type { MouseEvent } from 'react';
import { X } from 'lucide-react';
import { clearHistory as clearStoredHistory, removeHistoryItem as removeStoredHistoryItem } from '../lib/storage';
import { useStore } from '../store';

export default function History() {
  const { history, setDesignMdResult, removeHistoryItem, clearHistory } = useStore();

  if (history.length === 0) {
    return null;
  }

  const handleRestore = (item: (typeof history)[0]) => {
    setDesignMdResult(item);
  };

  const handleDelete = async (event: MouseEvent, id: string) => {
    event.stopPropagation();
    removeHistoryItem(id);
    await removeStoredHistoryItem(id);
  };

  const handleClearAll = async () => {
    clearHistory();
    await clearStoredHistory();
  };

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs text-neutral-500">
          Recent ({history.length})
        </div>
        <button
          onClick={() => void handleClearAll()}
          className="text-xs text-neutral-500 hover:text-white transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-1">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => handleRestore(item)}
            className="group flex w-full items-start justify-between gap-3 py-2 px-3 text-left hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white truncate">
                {item.title || 'Untitled'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {item.url}
              </p>
            </div>
            <span
              onClick={(event) => void handleDelete(event, item.id)}
              role="button"
              aria-label={`Delete ${item.title || 'history item'}`}
              className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-neutral-600 opacity-0 transition-all hover:bg-neutral-800 hover:text-white group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
