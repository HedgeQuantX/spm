import { cn } from '@/lib/cn';

interface ProbabilityBarProps {
  sideAPercent: number;
  sideALabel: string;
  sideBLabel: string;
  className?: string;
}

export function ProbabilityBar({ sideAPercent, sideALabel, sideBLabel, className }: ProbabilityBarProps) {
  const sideBPercent = 100 - sideAPercent;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs font-mono tracking-wider">
        <span className="text-cyan-400">{sideALabel} {sideAPercent.toFixed(1)}%</span>
        <span className="text-[#e63973]">{sideBLabel} {sideBPercent.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#0f1628] overflow-hidden flex">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${sideAPercent}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-[#d6295f] to-[#e63973] transition-all duration-500 ease-out"
          style={{ width: `${sideBPercent}%` }}
        />
      </div>
    </div>
  );
}
