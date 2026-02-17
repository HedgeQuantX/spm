import { formatAmount, formatTimestamp, formatCountdown } from '@/lib/format';
import { IconChart, IconClock, IconTrending } from '@/components/icons';
import type { Market } from '@/types';

interface MarketStatsProps {
  market: Market;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/20 border border-zinc-800/30">
      <div className="text-zinc-500">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="text-sm font-mono font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export function MarketStats({ market }: MarketStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatItem
        icon={<IconChart size={16} />}
        label="Volume"
        value={`$${formatAmount(market.totalVolume)}`}
      />
      <StatItem
        icon={<IconTrending size={16} />}
        label="Liquidity"
        value={`$${formatAmount(market.totalLiquidity)}`}
      />
      <StatItem
        icon={<IconClock size={16} />}
        label="Closes"
        value={formatCountdown(market.closesAt)}
      />
      <StatItem
        icon={<IconClock size={16} />}
        label="Created"
        value={formatTimestamp(market.createdAt)}
      />
    </div>
  );
}
