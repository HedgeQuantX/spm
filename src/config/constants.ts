export const LAMPORTS_PER_SOL = 1_000_000_000;

export const WS_RECONNECT_INTERVAL = 3000;
export const WS_MAX_RECONNECT_ATTEMPTS = 10;
export const WS_HEARTBEAT_INTERVAL = 30000;

export const MARKET_CATEGORIES_LABELS: Record<string, string> = {
  crypto: 'CRYPTO',
  politics: 'POLITICS',
  sports: 'SPORTS',
  technology: 'TECH',
  science: 'SCIENCE',
  entertainment: 'ENTERTAINMENT',
  other: 'OTHER',
};

export const STATUS_LABELS: Record<string, string> = {
  open: 'OPEN',
  closed: 'CLOSED',
  resolving: 'RESOLVING',
  resolved: 'RESOLVED',
  cancelled: 'CANCELLED',
};

export const SORT_OPTIONS = [
  { value: 'volume', label: 'TOP VOLUME' },
  { value: 'newest', label: 'NEWEST' },
  { value: 'closing', label: 'CLOSING SOON' },
  { value: 'trending', label: 'TRENDING' },
] as const;

export const THROTTLE_MS = 250;
export const DEBOUNCE_MS = 300;

export const MAX_MARKETS_PER_PAGE = 24;
export const LEADERBOARD_PAGE_SIZE = 50;

/** Market account discriminator (first 8 bytes) */
export const MARKET_DISCRIMINATOR = [0xf6, 0xef, 0xb9, 0x28, 0x03, 0x4d, 0x92, 0xd5];

/** Platform account seed */
export const PLATFORM_SEED = 'platform';
export const MARKET_SEED = 'market';
export const VAULT_SEED = 'vault';
export const BET_SEED = 'bet';
export const USER_STATS_SEED = 'user_stats';
export const ARGUMENT_SEED = 'argument';
export const ARG_VOTE_SEED = 'arg_vote';
