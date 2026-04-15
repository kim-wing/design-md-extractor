import { useState } from 'react';
import { DesignMdResult } from '../store';
import { Copy, Download, Check } from 'lucide-react';

interface ResultPanelProps {
  result: DesignMdResult;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DESIGN.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800">
        <div>
          <p className="text-sm font-medium text-white">DESIGN.md</p>
          <p className="text-xs text-neutral-500 truncate max-w-[200px]">{result.url}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3 h-3" />
                Copy
              </span>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
          >
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              Download
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <pre className="text-xs text-neutral-400 overflow-x-auto max-h-80">
          <code className="whitespace-pre-wrap leading-relaxed">{result.content}</code>
        </pre>
      </div>
    </div>
  );
}
