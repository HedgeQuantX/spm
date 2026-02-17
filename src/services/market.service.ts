import { PublicKey } from '@solana/web3.js';
import { getConnection } from './solana.service';
import { ENV } from '@/config/env';
import type { Market, Bet, Argument } from '@/types';
import { MarketStatus, MarketCategory, Side } from '@/types';
import { LAMPORTS_PER_SOL } from '@/config/constants';

const PROGRAM_ID = new PublicKey(ENV.PROGRAM_ID);

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
 * Borsh-compatible string reader (4-byte LE length prefix + utf8)
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

function readU16(data: Buffer, offset: number): { value: number; newOffset: number } {
  return { value: data.readUInt16LE(offset), newOffset: offset + 2 };
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
 * Decode Market account
 * ----------------------------------------------------------------*/
function decodeMarketAccount(pubkey: PublicKey, data: Buffer): Market | null {
  try {
    let offset = 8; // anchor discriminator

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
 * Decode Bet account
 * ----------------------------------------------------------------*/
function decodeBetAccount(pubkey: PublicKey, data: Buffer): Bet | null {
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
 * Fetch helpers
 * ----------------------------------------------------------------*/

/** Fetch all Market accounts from the program */
export async function fetchAllMarkets(): Promise<Market[]> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
  });

  const markets: Market[] = [];
  for (const { pubkey, account } of accounts) {
    const decoded = decodeMarketAccount(pubkey, Buffer.from(account.data));
    if (decoded) markets.push(decoded);
  }
  return markets;
}

/** Fetch a single market by address */
export async function fetchMarket(address: PublicKey): Promise<Market | null> {
  const connection = getConnection();
  const info = await connection.getAccountInfo(address);
  if (!info) return null;
  return decodeMarketAccount(address, Buffer.from(info.data));
}

/** Fetch all bets for a given market */
export async function fetchMarketBets(marketAddress: PublicKey): Promise<Bet[]> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
    filters: [
      { memcmp: { offset: 8, bytes: marketAddress.toBase58() } },
    ],
  });

  const bets: Bet[] = [];
  for (const { pubkey, account } of accounts) {
    const decoded = decodeBetAccount(pubkey, Buffer.from(account.data));
    if (decoded && decoded.market.equals(marketAddress)) bets.push(decoded);
  }
  return bets;
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
  return args;
}

/** Fetch all bets by a specific user */
export async function fetchUserBets(wallet: PublicKey): Promise<Bet[]> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
    filters: [
      { memcmp: { offset: 40, bytes: wallet.toBase58() } },
    ],
  });

  const bets: Bet[] = [];
  for (const { pubkey, account } of accounts) {
    const decoded = decodeBetAccount(pubkey, Buffer.from(account.data));
    if (decoded && decoded.bettor.equals(wallet)) bets.push(decoded);
  }
  return bets;
}

/** Format lamports to SOL for display */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}
