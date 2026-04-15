import { useStore } from '../store';

export default function History() {
  const { history, setDesignMdResult } = useStore();

  if (history.length === 0) {
    return null;
  }

  const handleRestore = (item: (typeof history)[0]) => {
    setDesignMdResult(item);
  };

  return (
    <div className="mt-5">
      <div className="text-xs text-neutral-500 mb-3">
        Recent ({history.length})
      </div>
      <div className="space-y-1">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => handleRestore(item)}
            className="w-full py-2 px-3 text-left hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <p className="text-sm text-white truncate">
              {item.title || 'Untitled'}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {item.url}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
