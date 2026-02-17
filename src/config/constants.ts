export const LAMPORTS_PER_SOL = 1_000_000_000;
export const USDC_DECIMALS = 6;

export const WS_RECONNECT_INTERVAL = 3000;
export const WS_MAX_RECONNECT_ATTEMPTS = 10;
export const WS_HEARTBEAT_INTERVAL = 30000;

export const PRICE_PRECISION = 4;
export const AMOUNT_PRECISION = 2;

export const MARKET_CATEGORIES_LABELS: Record<string, string> = {
  crypto: 'Crypto',
  politics: 'Politics',
  sports: 'Sports',
  technology: 'Tech',
  science: 'Science',
  entertainment: 'Entertainment',
  other: 'Other',
};

export const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

export const SORT_OPTIONS = [
  { value: 'volume', label: 'Top Volume' },
  { value: 'newest', label: 'Newest' },
  { value: 'closing', label: 'Closing Soon' },
  { value: 'liquidity', label: 'Liquidity' },
] as const;

export const THROTTLE_MS = 250;
export const DEBOUNCE_MS = 300;

export const MAX_MARKETS_PER_PAGE = 24;
export const LEADERBOARD_PAGE_SIZE = 50;
