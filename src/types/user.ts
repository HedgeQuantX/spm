import { PublicKey } from '@solana/web3.js';

export interface UserStats {
  publicKey: PublicKey;
  wallet: PublicKey;
  totalBets: number;
  totalVolume: number;
  totalWins: number;
  totalLosses: number;
  totalPnl: number;
  marketsCreated: number;
  marketsParticipated: number;
  bump: number;
}

export interface LeaderboardEntry {
  rank: number;
  wallet: PublicKey;
  totalPnl: number;
  totalVolume: number;
  winRate: number;
  totalBets: number;
  totalWins: number;
}

export interface WalletBalance {
  sol: number;
}
