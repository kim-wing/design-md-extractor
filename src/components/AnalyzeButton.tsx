import { Sparkles, Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export default function AnalyzeButton({ onClick, isAnalyzing, disabled }: AnalyzeButtonProps) {
  return (
    <div className="space-y-3">
      {/* Main Extract Button */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        
        {/* Button */}
        <button
          onClick={onClick}
          disabled={isAnalyzing || disabled}
          className="relative w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
          
          {/* Border gradient animation */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-30 group-hover:opacity-60 transition-opacity duration-500" 
               style={{ backgroundSize: '200% 200%', animation: 'gradient-shift 3s ease infinite' }} />
          
          {/* Content */}
          <div className="relative flex items-center gap-3">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Extracting Design...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                  Extract DESIGN.md
                </span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
