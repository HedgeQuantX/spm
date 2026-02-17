export function formatSol(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  if (sol >= 1_000_000) return `${(sol / 1_000_000).toFixed(1)}M`;
  if (sol >= 1_000) return `${(sol / 1_000).toFixed(1)}K`;
  if (sol >= 1) return sol.toFixed(2);
  return sol.toFixed(4);
}

export function formatAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

export function formatPnl(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  const sign = sol >= 0 ? '+' : '';
  return `${sign}${formatSol(lamports)}`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeAgo(ts: number): string {
  const now = Date.now() / 1000;
  const diff = now - ts;

  if (diff < 60) return 'JUST NOW';
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}D AGO`;
  return formatTimestamp(ts);
}

export function formatCountdown(closesAt: number): string {
  const now = Date.now() / 1000;
  const diff = closesAt - now;

  if (diff <= 0) return 'CLOSED';
  if (diff < 3600) return `${Math.floor(diff / 60)}M LEFT`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H LEFT`;
  return `${Math.floor(diff / 86400)}D LEFT`;
}
