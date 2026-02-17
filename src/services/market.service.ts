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
const DISC_MARKET   = [0xdb, 0xbe, 0xd5, 0x37, 0x00, 0xe3, 0xc6, 0x9a];
const DISC_BET      = [0x93, 0x17, 0x23, 0x3b, 0x0f, 0x4b, 0x9b, 0x20];
const DISC_PLATFORM = [0x4d, 0x5c, 0xcc, 0x3a, 0xbb, 0x62, 0x5b, 0x0c];
const DISC_USTATS   = [0xb0, 0xdf, 0x88, 0x1b, 0x7a, 0x4f, 0x20, 0xe3];

function matchDisc(data: Uint8Array, disc: number[]): boolean {
  for (let i = 0; i < 8; i++) {
    if (data[i] !== disc[i]) return false;
  }
  return true;
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
 * Borsh deserialization primitives (pure Uint8Array + DataView)
 * Works in both Node.js and browser without Buffer polyfill
 * ----------------------------------------------------------------*/
function readString(dv: DataView, data: Uint8Array, offset: number): { value: string; newOffset: number } {
  const len = dv.getUint32(offset, true);
  offset += 4;
  const bytes = data.slice(offset, offset + len);
  const value = new TextDecoder().decode(bytes);
  return { value, newOffset: offset + len };
}

function readU8(dv: DataView, offset: number): { value: number; newOffset: number } {
  return { value: dv.getUint8(offset), newOffset: offset + 1 };
}

function readU32(dv: DataView, offset: number): { value: number; newOffset: number } {
  return { value: dv.getUint32(offset, true), newOffset: offset + 4 };
}

function readU64(dv: DataView, offset: number): { value: number; newOffset: number } {
  const lo = dv.getUint32(offset, true);
  const hi = dv.getUint32(offset + 4, true);
  return { value: lo + hi * 0x100000000, newOffset: offset + 8 };
}

function readI64(dv: DataView, offset: number): { value: number; newOffset: number } {
  const lo = dv.getUint32(offset, true);
  const hi = dv.getInt32(offset + 4, true);
  return { value: lo + hi * 0x100000000, newOffset: offset + 8 };
}

function readPubkey(data: Uint8Array, offset: number): { value: PublicKey; newOffset: number } {
  const bytes = data.slice(offset, offset + 32);
  return { value: new PublicKey(bytes), newOffset: offset + 32 };
}

function readOptionSide(dv: DataView, offset: number): { value: Side | null; newOffset: number } {
  const tag = dv.getUint8(offset);
  offset += 1;
  if (tag === 0) return { value: null, newOffset: offset };
  const side = decodeSide(dv.getUint8(offset));
  return { value: side, newOffset: offset + 1 };
}

function readBool(dv: DataView, offset: number): { value: boolean; newOffset: number } {
  return { value: dv.getUint8(offset) !== 0, newOffset: offset + 1 };
}

/* ------------------------------------------------------------------
 * Decode Market account
 * ----------------------------------------------------------------*/
function decodeMarketAccount(pubkey: PublicKey, data: Uint8Array): Market | null {
  if (data.length < 100 || !matchDisc(data, DISC_MARKET)) return null;
  try {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 8;
    const creator = readPubkey(data, offset); offset = creator.newOffset;
    const marketIndex = readU64(dv, offset); offset = marketIndex.newOffset;
    const title = readString(dv, data, offset); offset = title.newOffset;
    const description = readString(dv, data, offset); offset = description.newOffset;
    const categoryByte = readU8(dv, offset); offset = categoryByte.newOffset;
    const statusByte = readU8(dv, offset); offset = statusByte.newOffset;
    const sideALabel = readString(dv, data, offset); offset = sideALabel.newOffset;
    const sideBLabel = readString(dv, data, offset); offset = sideBLabel.newOffset;
    const sideAPool = readU64(dv, offset); offset = sideAPool.newOffset;
    const sideBPool = readU64(dv, offset); offset = sideBPool.newOffset;
    const totalVolume = readU64(dv, offset); offset = totalVolume.newOffset;
    const totalBets = readU32(dv, offset); offset = totalBets.newOffset;
    const totalBettorsA = readU32(dv, offset); offset = totalBettorsA.newOffset;
    const totalBettorsB = readU32(dv, offset); offset = totalBettorsB.newOffset;
    const bounty = readU64(dv, offset); offset = bounty.newOffset;
    const createdAt = readI64(dv, offset); offset = createdAt.newOffset;
    const closesAt = readI64(dv, offset); offset = closesAt.newOffset;
    const resolvedAt = readI64(dv, offset); offset = resolvedAt.newOffset;
    const winningSide = readOptionSide(dv, offset); offset = winningSide.newOffset;
    const resolutionReason = readString(dv, data, offset); offset = resolutionReason.newOffset;
    const vaultBump = readU8(dv, offset); offset = vaultBump.newOffset;
    const bump = readU8(dv, offset);

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
  } catch (e) {
    console.error('Failed to decode market:', pubkey.toBase58(), e);
    return null;
  }
}

/* ------------------------------------------------------------------
 * Decode Bet account
 * ----------------------------------------------------------------*/
function decodeBetAccount(pubkey: PublicKey, data: Uint8Array): Bet | null {
  if (data.length < 90 || !matchDisc(data, DISC_BET)) return null;
  try {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 8;
    const market = readPubkey(data, offset); offset = market.newOffset;
    const bettor = readPubkey(data, offset); offset = bettor.newOffset;
    const sideByte = readU8(dv, offset); offset = sideByte.newOffset;
    const amount = readU64(dv, offset); offset = amount.newOffset;
    const oddsAtBet = readU64(dv, offset); offset = oddsAtBet.newOffset;
    const claimed = readBool(dv, offset); offset = claimed.newOffset;
    const refunded = readBool(dv, offset); offset = refunded.newOffset;
    const createdAt = readI64(dv, offset); offset = createdAt.newOffset;
    const bump = readU8(dv, offset);

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
  } catch (e) {
    console.error('Failed to decode bet:', pubkey.toBase58(), e);
    return null;
  }
}

/* ------------------------------------------------------------------
 * Decode Argument account
 * ----------------------------------------------------------------*/
function decodeArgumentAccount(pubkey: PublicKey, data: Uint8Array): Argument | null {
  if (data.length < 110) return null;
  if (matchDisc(data, DISC_MARKET) || matchDisc(data, DISC_BET) ||
      matchDisc(data, DISC_PLATFORM) || matchDisc(data, DISC_USTATS)) return null;
  try {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 8;
    const market = readPubkey(data, offset); offset = market.newOffset;
    const bet = readPubkey(data, offset); offset = bet.newOffset;
    const author = readPubkey(data, offset); offset = author.newOffset;
    const sideByte = readU8(dv, offset); offset = sideByte.newOffset;
    const content = readString(dv, data, offset); offset = content.newOffset;
    const upvotes = readU32(dv, offset); offset = upvotes.newOffset;
    const downvotes = readU32(dv, offset); offset = downvotes.newOffset;
    const createdAt = readI64(dv, offset); offset = createdAt.newOffset;
    const bump = readU8(dv, offset);

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
  } catch (e) {
    console.error('Failed to decode argument:', pubkey.toBase58(), e);
    return null;
  }
}

/* ------------------------------------------------------------------
 * Decode UserStats account
 * ----------------------------------------------------------------*/
function decodeUserStatsAccount(pubkey: PublicKey, data: Uint8Array): UserStats | null {
  if (data.length < 80 || !matchDisc(data, DISC_USTATS)) return null;
  try {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 8;
    const wallet = readPubkey(data, offset); offset = wallet.newOffset;
    const totalBets = readU32(dv, offset); offset = totalBets.newOffset;
    const totalVolume = readU64(dv, offset); offset = totalVolume.newOffset;
    const totalWins = readU32(dv, offset); offset = totalWins.newOffset;
    const totalLosses = readU32(dv, offset); offset = totalLosses.newOffset;
    const totalPnl = readI64(dv, offset); offset = totalPnl.newOffset;
    const marketsCreated = readU32(dv, offset); offset = marketsCreated.newOffset;
    const marketsParticipated = readU32(dv, offset); offset = marketsParticipated.newOffset;
    const bump = readU8(dv, offset);

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
  } catch (e) {
    console.error('Failed to decode user stats:', pubkey.toBase58(), e);
    return null;
  }
}

/* ------------------------------------------------------------------
 * Convert account data to Uint8Array (handles Buffer, Uint8Array, etc.)
 * ----------------------------------------------------------------*/
function toUint8Array(data: Uint8Array | Buffer | number[]): Uint8Array {
  if (data instanceof Uint8Array) return data;
  return new Uint8Array(data);
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
    const raw = toUint8Array(account.data as Uint8Array);

    if (matchDisc(raw, DISC_MARKET)) {
      const m = decodeMarketAccount(pubkey, raw);
      if (m) markets.push(m);
    } else if (matchDisc(raw, DISC_BET)) {
      const b = decodeBetAccount(pubkey, raw);
      if (b) bets.push(b);
    } else if (matchDisc(raw, DISC_USTATS)) {
      const u = decodeUserStatsAccount(pubkey, raw);
      if (u) userStats.push(u);
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
  return decodeMarketAccount(address, toUint8Array(info.data as Uint8Array));
}

/** Fetch all bets for a given market */
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
    const decoded = decodeBetAccount(pubkey, toUint8Array(account.data as Uint8Array));
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
    const decoded = decodeArgumentAccount(pubkey, toUint8Array(account.data as Uint8Array));
    if (decoded && decoded.market.equals(marketAddress)) args.push(decoded);
  }
  return args.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
}

/** Fetch all bets by a specific user */
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
    const decoded = decodeBetAccount(pubkey, toUint8Array(account.data as Uint8Array));
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
