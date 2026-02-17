import { PublicKey } from '@solana/web3.js';

export enum MarketStatus {
  Open = 'open',
  Closed = 'closed',
  Resolving = 'resolving',
  Resolved = 'resolved',
  Cancelled = 'cancelled',
}

export enum MarketCategory {
  Crypto = 'crypto',
  Politics = 'politics',
  Sports = 'sports',
  Technology = 'technology',
  Science = 'science',
  Entertainment = 'entertainment',
  Other = 'other',
}

export enum Side {
  A = 'a',
  B = 'b',
}

export interface Market {
  publicKey: PublicKey;
  creator: PublicKey;
  marketIndex: number;
  title: string;
  description: string;
  category: MarketCategory;
  status: MarketStatus;
  sideALabel: string;
  sideBLabel: string;
  sideAPool: number;
  sideBPool: number;
  totalVolume: number;
  totalBets: number;
  totalBettorsA: number;
  totalBettorsB: number;
  bounty: number;
  createdAt: number;
  closesAt: number;
  resolvedAt: number;
  winningSide: Side | null;
  resolutionReason: string;
  vaultBump: number;
  bump: number;
}

export interface Bet {
  publicKey: PublicKey;
  market: PublicKey;
  bettor: PublicKey;
  side: Side;
  amount: number;
  oddsAtBet: number;
  claimed: boolean;
  refunded: boolean;
  createdAt: number;
  bump: number;
}

export interface Argument {
  publicKey: PublicKey;
  market: PublicKey;
  bet: PublicKey;
  author: PublicKey;
  side: Side;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  bump: number;
}

export interface ArgumentVote {
  publicKey: PublicKey;
  argument: PublicKey;
  voter: PublicKey;
  isUpvote: boolean;
  bump: number;
}

export interface MarketFilter {
  category: MarketCategory | null;
  status: MarketStatus | null;
  search: string;
  sortBy: 'volume' | 'newest' | 'closing' | 'trending';
}

/** Derived odds from pool ratios (in basis points, 10000 = 100%) */
export function calculateOdds(market: Market): { sideABps: number; sideBBps: number } {
  const total = market.sideAPool + market.sideBPool;
  if (total === 0) return { sideABps: 5000, sideBBps: 5000 };
  const aBps = Math.round((market.sideAPool / total) * 10000);
  return { sideABps: aBps, sideBBps: 10000 - aBps };
}

/** Total pool including bounty */
export function totalPool(market: Market): number {
  return market.sideAPool + market.sideBPool + market.bounty;
}
