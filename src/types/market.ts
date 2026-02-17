import { PublicKey } from '@solana/web3.js';

export enum MarketStatus {
  Open = 'open',
  Closed = 'closed',
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

export enum OutcomeSide {
  Yes = 'yes',
  No = 'no',
}

export interface MarketOutcome {
  side: OutcomeSide;
  label: string;
  probability: number;
  totalStake: number;
  tokenMint: PublicKey | null;
}

export interface Market {
  publicKey: PublicKey;
  authority: PublicKey;
  title: string;
  description: string;
  category: MarketCategory;
  status: MarketStatus;
  outcomes: [MarketOutcome, MarketOutcome];
  totalVolume: number;
  totalLiquidity: number;
  createdAt: number;
  closesAt: number;
  resolvedAt: number | null;
  resolvedOutcome: OutcomeSide | null;
  imageUrl: string | null;
}

export interface MarketTrade {
  signature: string;
  market: PublicKey;
  trader: PublicKey;
  side: OutcomeSide;
  amount: number;
  price: number;
  timestamp: number;
}

export interface MarketPosition {
  market: PublicKey;
  side: OutcomeSide;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface MarketFilter {
  category: MarketCategory | null;
  status: MarketStatus | null;
  search: string;
  sortBy: 'volume' | 'newest' | 'closing' | 'liquidity';
}

export interface PricePoint {
  timestamp: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
}
