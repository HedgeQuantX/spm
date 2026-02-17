import { cn } from '@/lib/cn';
import { IconDot } from '@/components/icons';
import { MarketStatus } from '@/types';
import { STATUS_LABELS } from '@/config/constants';

interface StatusBadgeProps {
  status: MarketStatus;
}

const statusStyles: Record<MarketStatus, string> = {
  [MarketStatus.Open]: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  [MarketStatus.Closed]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  [MarketStatus.Resolving]: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  [MarketStatus.Resolved]: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  [MarketStatus.Cancelled]: 'text-[#6b7db3] bg-[#6b7db3]/10 border-[#6b7db3]/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider border',
        statusStyles[status],
      )}
    >
      <IconDot size={8} />
      {STATUS_LABELS[status]}
    </span>
  );
}
