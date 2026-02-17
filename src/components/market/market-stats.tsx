import { formatSol, formatTimestamp, formatCountdown } from '@/lib/format';
import { IconChart, IconClock, IconTrending, IconSolana } from '@/components/icons';
import type { Market } from '@/types';

interface MarketStatsProps {
  market: Market;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}

function StatItem({ icon, label, value, accent }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0f1628]/60 border border-cyan-400/8">
      <div className={accent || 'text-[#6b7db3]'}>{icon}</div>
      <div>
        <p className="text-[10px] tracking-[0.15em] text-[#6b7db3]">{label}</p>
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
        label="VOLUME"
        value={`${formatSol(market.totalVolume)} SOL`}
        accent="text-violet-400"
      />
      <StatItem
        icon={<IconSolana size={16} />}
        label="TOTAL POOL"
        value={`${formatSol(market.sideAPool + market.sideBPool)} SOL`}
        accent="text-cyan-400"
      />
      <StatItem
        icon={<IconClock size={16} />}
        label="CLOSES"
        value={formatCountdown(market.closesAt)}
        accent="text-yellow-400"
      />
      <StatItem
        icon={<IconTrending size={16} />}
        label="TOTAL BETS"
        value={`${market.totalBets}`}
        accent="text-[#e63973]"
      />
    </div>
  );
}
