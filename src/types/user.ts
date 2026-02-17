import { PublicKey } from '@solana/web3.js';
import type { MarketPosition } from './market';

export interface UserProfile {
  wallet: PublicKey;
  totalVolume: number;
  totalPnl: number;
  winRate: number;
  tradesCount: number;
  positions: MarketPosition[];
  rank: number;
}

export interface LeaderboardEntry {
  rank: number;
  wallet: PublicKey;
  totalPnl: number;
  totalVolume: number;
  winRate: number;
  tradesCount: number;
}

export interface WalletBalance {
  sol: number;
  usdc: number;
}
