import { cn } from '@/lib/cn';
import { IconDot } from '@/components/icons';
import { MarketStatus } from '@/types';
import { STATUS_LABELS } from '@/config/constants';

interface StatusBadgeProps {
  status: MarketStatus;
}

const statusStyles: Record<MarketStatus, string> = {
  [MarketStatus.Open]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  [MarketStatus.Closed]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  [MarketStatus.Resolved]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  [MarketStatus.Cancelled]: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
      )}
    >
      <IconDot size={8} />
      {STATUS_LABELS[status]}
    </span>
  );
}
