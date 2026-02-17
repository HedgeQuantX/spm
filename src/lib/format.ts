import { PRICE_PRECISION, AMOUNT_PRECISION } from '@/config/constants';

export function formatPrice(value: number): string {
  return value.toFixed(PRICE_PRECISION);
}

export function formatAmount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(AMOUNT_PRECISION);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatPnl(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatAmount(value)}`;
}

export function formatSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

export function formatUsdc(raw: number, decimals = 6): string {
  return (raw / Math.pow(10, decimals)).toFixed(2);
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

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatTimestamp(ts);
}

export function formatCountdown(closesAt: number): string {
  const now = Date.now() / 1000;
  const diff = closesAt - now;

  if (diff <= 0) return 'Closed';
  if (diff < 3600) return `${Math.floor(diff / 60)}m left`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h left`;
  return `${Math.floor(diff / 86400)}d left`;
}
