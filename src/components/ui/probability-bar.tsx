import { cn } from '@/lib/cn';
import { formatPercent } from '@/lib/format';

interface ProbabilityBarProps {
  yesPercent: number;
  className?: string;
}

export function ProbabilityBar({ yesPercent, className }: ProbabilityBarProps) {
  const noPercent = 1 - yesPercent;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs font-mono">
        <span className="text-emerald-400">Yes {formatPercent(yesPercent)}</span>
        <span className="text-rose-400">No {formatPercent(noPercent)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden flex">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${yesPercent * 100}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500 ease-out"
          style={{ width: `${noPercent * 100}%` }}
        />
      </div>
    </div>
  );
}
