import { PublicKey } from '@solana/web3.js';
import { getConnection } from './solana.service';
import { ENV } from '@/config/env';
import type { Market, Bet, Argument } from '@/types';
import { MarketStatus, MarketCategory, Side } from '@/types';
import type { UserStats, LeaderboardEntry } from '@/types/user';
import { LAMPORTS_PER_SOL } from '@/config/constants';

const PROGRAM_ID = new PublicKey(ENV.PROGRAM_ID);

/* ------------------------------------------------------------------
 * Account discriminators (sha256("account:<Name>")[..8])
 * Verified against live devnet data
 * ----------------------------------------------------------------*/
const DISC_MARKET   = 'dbbed53700e3c69a';
const DISC_BET      = '9317233b0f4b9b20';
const DISC_PLATFORM = '4d5ccc3abb625b0c';
const DISC_USTATS   = 'b0df881b7a4f20e3';

function getDiscriminator(data: Buffer): string {
  return data.subarray(0, 8).toString('hex');
}

/* ------------------------------------------------------------------
 * On-chain enum mapping
 * ----------------------------------------------------------------*/
const STATUS_MAP: MarketStatus[] = [
  MarketStatus.Open,
  MarketStatus.Closed,
  MarketStatus.Resolving,
  MarketStatus.Resolved,
  MarketStatus.Cancelled,
];

const CATEGORY_MAP: MarketCategory[] = [
  MarketCategory.Crypto,
  MarketCategory.Politics,
  MarketCategory.Sports,
  MarketCategory.Technology,
  MarketCategory.Science,
  MarketCategory.Entertainment,
  MarketCategory.Other,
];

function decodeSide(byte: number): Side {
  return byte === 0 ? Side.A : Side.B;
}

/* ------------------------------------------------------------------
 * Borsh deserialization primitives
 * ----------------------------------------------------------------*/
function readString(data: Buffer, offset: number): { value: string; newOffset: number } {
  const len = data.readUInt32LE(offset);
  offset += 4;
  const value = data.subarray(offset, offset + len).toString('utf-8');
  return { value, newOffset: offset + len };
}

function readU8(data: Buffer, offset: number): { value: number; newOffset: number } {
  return { value: data.readUInt8(offset), newOffset: offset + 1 };
}

function readU32(data: Buffer, offset: number): { value: number; newOffset: number } {
  return { value: data.readUInt32LE(offset), newOffset: offset + 4 };
}

function readU64(data: Buffer, offset: number): { value: number; newOffset: number } {
  const lo = data.readUInt32LE(offset);
  const hi = data.readUInt32LE(offset + 4);
  return { value: lo + hi * 0x100000000, newOffset: offset + 8 };
}

function readI64(data: Buffer, offset: number): { value: number; newOffset: number } {
  const value = Number(data.readBigInt64LE(offset));
  return { value, newOffset: offset + 8 };
}

function readPubkey(data: Buffer, offset: number): { value: PublicKey; newOffset: number } {
  const bytes = data.subarray(offset, offset + 32);
  return { value: new PublicKey(bytes), newOffset: offset + 32 };
}

function readOptionSide(data: Buffer, offset: number): { value: Side | null; newOffset: number } {
  const tag = data.readUInt8(offset);
  offset += 1;
  if (tag === 0) return { value: null, newOffset: offset };
  const side = decodeSide(data.readUInt8(offset));
  return { value: side, newOffset: offset + 1 };
}

function readBool(data: Buffer, offset: number): { value: boolean; newOffset: number } {
  return { value: data.readUInt8(offset) !== 0, newOffset: offset + 1 };
}

/* ------------------------------------------------------------------
 * Decode Market account (disc: dbbed53700e3c69a)
 * ----------------------------------------------------------------*/
function decodeMarketAccount(pubkey: PublicKey, data: Buffer): Market | null {
  if (data.length < 100 || getDiscriminator(data) !== DISC_MARKET) return null;
  try {
    let offset = 8;
    const creator = readPubkey(data, offset); offset = creator.newOffset;
    const marketIndex = readU64(data, offset); offset = marketIndex.newOffset;
    const title = readString(data, offset); offset = title.newOffset;
    const description = readString(data, offset); offset = description.newOffset;
    const categoryByte = readU8(data, offset); offset = categoryByte.newOffset;
    const statusByte = readU8(data, offset); offset = statusByte.newOffset;
    const sideALabel = readString(data, offset); offset = sideALabel.newOffset;
    const sideBLabel = readString(data, offset); offset = sideBLabel.newOffset;
    const sideAPool = readU64(data, offset); offset = sideAPool.newOffset;
    const sideBPool = readU64(data, offset); offset = sideBPool.newOffset;
    const totalVolume = readU64(data, offset); offset = totalVolume.newOffset;
    const totalBets = readU32(data, offset); offset = totalBets.newOffset;
    const totalBettorsA = readU32(data, offset); offset = totalBettorsA.newOffset;
    const totalBettorsB = readU32(data, offset); offset = totalBettorsB.newOffset;
    const bounty = readU64(data, offset); offset = bounty.newOffset;
    const createdAt = readI64(data, offset); offset = createdAt.newOffset;
    const closesAt = readI64(data, offset); offset = closesAt.newOffset;
    const resolvedAt = readI64(data, offset); offset = resolvedAt.newOffset;
    const winningSide = readOptionSide(data, offset); offset = winningSide.newOffset;
    const resolutionReason = readString(data, offset); offset = resolutionReason.newOffset;
    const vaultBump = readU8(data, offset); offset = vaultBump.newOffset;
    const bump = readU8(data, offset);

    return {
      publicKey: pubkey,
      creator: creator.value,
      marketIndex: marketIndex.value,
      title: title.value,
      description: description.value,
      category: CATEGORY_MAP[categoryByte.value] ?? MarketCategory.Other,
      status: STATUS_MAP[statusByte.value] ?? MarketStatus.Open,
      sideALabel: sideALabel.value,
      sideBLabel: sideBLabel.value,
      sideAPool: sideAPool.value,
      sideBPool: sideBPool.value,
      totalVolume: totalVolume.value,
      totalBets: totalBets.value,
      totalBettorsA: totalBettorsA.value,
      totalBettorsB: totalBettorsB.value,
      bounty: bounty.value,
      createdAt: createdAt.value,
      closesAt: closesAt.value,
      resolvedAt: resolvedAt.value,
      winningSide: winningSide.value,
      resolutionReason: resolutionReason.value,
      vaultBump: vaultBump.value,
      bump: bump.value,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
 * Decode Bet account (disc: 9317233b0f4b9b20)
 * ----------------------------------------------------------------*/
function decodeBetAccount(pubkey: PublicKey, data: Buffer): Bet | null {
  if (data.length < 90 || getDiscriminator(data) !== DISC_BET) return null;
  try {
    let offset = 8;
    const market = readPubkey(data, offset); offset = market.newOffset;
    const bettor = readPubkey(data, offset); offset = bettor.newOffset;
    const sideByte = readU8(data, offset); offset = sideByte.newOffset;
    const amount = readU64(data, offset); offset = amount.newOffset;
    const oddsAtBet = readU64(data, offset); offset = oddsAtBet.newOffset;
    const claimed = readBool(data, offset); offset = claimed.newOffset;
    const refunded = readBool(data, offset); offset = refunded.newOffset;
    const createdAt = readI64(data, offset); offset = createdAt.newOffset;
    const bump = readU8(data, offset);

    return {
      publicKey: pubkey,
      market: market.value,
      bettor: bettor.value,
      side: decodeSide(sideByte.value),
      amount: amount.value,
      oddsAtBet: oddsAtBet.value,
      claimed: claimed.value,
      refunded: refunded.value,
      createdAt: createdAt.value,
      bump: bump.value,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
 * Decode Argument account
 * ----------------------------------------------------------------*/
function decodeArgumentAccount(pubkey: PublicKey, data: Buffer): Argument | null {
  if (data.length < 110) return null;
  const disc = getDiscriminator(data);
  if (disc === DISC_MARKET || disc === DISC_BET || disc === DISC_PLATFORM || disc === DISC_USTATS) return null;
  try {
    let offset = 8;
    const market = readPubkey(data, offset); offset = market.newOffset;
    const bet = readPubkey(data, offset); offset = bet.newOffset;
    const author = readPubkey(data, offset); offset = author.newOffset;
    const sideByte = readU8(data, offset); offset = sideByte.newOffset;
    const content = readString(data, offset); offset = content.newOffset;
    const upvotes = readU32(data, offset); offset = upvotes.newOffset;
    const downvotes = readU32(data, offset); offset = downvotes.newOffset;
    const createdAt = readI64(data, offset); offset = createdAt.newOffset;
    const bump = readU8(data, offset);

    return {
      publicKey: pubkey,
      market: market.value,
      bet: bet.value,
      author: author.value,
      side: decodeSide(sideByte.value),
      content: content.value,
      upvotes: upvotes.value,
      downvotes: downvotes.value,
      createdAt: createdAt.value,
      bump: bump.value,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
 * Decode UserStats account (disc: b0df881b7a4f20e3)
 * ----------------------------------------------------------------*/
function decodeUserStatsAccount(pubkey: PublicKey, data: Buffer): UserStats | null {
  if (data.length < 80 || getDiscriminator(data) !== DISC_USTATS) return null;
  try {
    let offset = 8;
    const wallet = readPubkey(data, offset); offset = wallet.newOffset;
    const totalBets = readU32(data, offset); offset = totalBets.newOffset;
    const totalVolume = readU64(data, offset); offset = totalVolume.newOffset;
    const totalWins = readU32(data, offset); offset = totalWins.newOffset;
    const totalLosses = readU32(data, offset); offset = totalLosses.newOffset;
    const totalPnl = readI64(data, offset); offset = totalPnl.newOffset;
    const marketsCreated = readU32(data, offset); offset = marketsCreated.newOffset;
    const marketsParticipated = readU32(data, offset); offset = marketsParticipated.newOffset;
    const bump = readU8(data, offset);

    return {
      publicKey: pubkey,
      wallet: wallet.value,
      totalBets: totalBets.value,
      totalVolume: totalVolume.value,
      totalWins: totalWins.value,
      totalLosses: totalLosses.value,
      totalPnl: totalPnl.value,
      marketsCreated: marketsCreated.value,
      marketsParticipated: marketsParticipated.value,
      bump: bump.value,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
 * Fetch all accounts once, split by type
 * Efficient: single RPC call, client-side filtering
 * ----------------------------------------------------------------*/
interface ProgramData {
  markets: Market[];
  bets: Bet[];
  userStats: UserStats[];
}

async function fetchAllProgramAccounts(): Promise<ProgramData> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
  });

  const markets: Market[] = [];
  const bets: Bet[] = [];
  const userStats: UserStats[] = [];

  for (const { pubkey, account } of accounts) {
    const buf = Buffer.from(account.data);
    const disc = getDiscriminator(buf);

    switch (disc) {
      case DISC_MARKET: {
        const m = decodeMarketAccount(pubkey, buf);
        if (m) markets.push(m);
        break;
      }
      case DISC_BET: {
        const b = decodeBetAccount(pubkey, buf);
        if (b) bets.push(b);
        break;
      }
      case DISC_USTATS: {
        const u = decodeUserStatsAccount(pubkey, buf);
        if (u) userStats.push(u);
        break;
      }
    }
  }

  return { markets, bets, userStats };
}

/* ------------------------------------------------------------------
 * Public API
 * ----------------------------------------------------------------*/

/** Fetch all Market accounts */
export async function fetchAllMarkets(): Promise<Market[]> {
  const { markets } = await fetchAllProgramAccounts();
  return markets;
}

/** Fetch a single market by address */
export async function fetchMarket(address: PublicKey): Promise<Market | null> {
  const connection = getConnection();
  const info = await connection.getAccountInfo(address);
  if (!info) return null;
  return decodeMarketAccount(address, Buffer.from(info.data));
}

/** Fetch all bets for a given market (filtered by discriminator + market key) */
export async function fetchMarketBets(marketAddress: PublicKey): Promise<Bet[]> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
    filters: [
      { dataSize: 100 },
      { memcmp: { offset: 8, bytes: marketAddress.toBase58() } },
    ],
  });

  const bets: Bet[] = [];
  for (const { pubkey, account } of accounts) {
    const decoded = decodeBetAccount(pubkey, Buffer.from(account.data));
    if (decoded) bets.push(decoded);
  }
  return bets.sort((a, b) => b.createdAt - a.createdAt);
}

/** Fetch all arguments for a given market */
export async function fetchMarketArguments(marketAddress: PublicKey): Promise<Argument[]> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
    filters: [
      { memcmp: { offset: 8, bytes: marketAddress.toBase58() } },
    ],
  });

  const args: Argument[] = [];
  for (const { pubkey, account } of accounts) {
    const decoded = decodeArgumentAccount(pubkey, Buffer.from(account.data));
    if (decoded && decoded.market.equals(marketAddress)) args.push(decoded);
  }
  return args.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
}

/** Fetch all bets by a specific user (filter by bettor at offset 40) */
export async function fetchUserBets(wallet: PublicKey): Promise<Bet[]> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
    filters: [
      { dataSize: 100 },
      { memcmp: { offset: 40, bytes: wallet.toBase58() } },
    ],
  });

  const bets: Bet[] = [];
  for (const { pubkey, account } of accounts) {
    const decoded = decodeBetAccount(pubkey, Buffer.from(account.data));
    if (decoded) bets.push(decoded);
  }
  return bets.sort((a, b) => b.createdAt - a.createdAt);
}

/** Fetch leaderboard from UserStats accounts */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { userStats } = await fetchAllProgramAccounts();

  return userStats
    .filter((u) => u.totalBets > 0)
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .map((u, i) => ({
      rank: i + 1,
      wallet: u.wallet,
      totalPnl: u.totalPnl,
      totalVolume: u.totalVolume,
      winRate: u.totalBets > 0
        ? (u.totalWins / u.totalBets) * 100
        : 0,
      totalBets: u.totalBets,
      totalWins: u.totalWins,
    }));
}

/** Format lamports to SOL */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}
