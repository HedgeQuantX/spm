import { PublicKey } from '@solana/web3.js';
import { getConnection, getMultipleAccounts } from './solana.service';
import { ENV } from '@/config/env';
import type { Market, MarketTrade } from '@/types';
import { MarketStatus, MarketCategory, OutcomeSide } from '@/types';

function hasProgramId(): boolean {
  return ENV.PROGRAM_ID.length > 0;
}

function parseProgramId(): PublicKey {
  return new PublicKey(ENV.PROGRAM_ID);
}

function decodeMarketAccount(pubkey: PublicKey, data: Buffer): Market {
  let offset = 8; // discriminator

  const authorityBytes = data.subarray(offset, offset + 32);
  const authority = new PublicKey(authorityBytes);
  offset += 32;

  const titleLen = data.readUInt32LE(offset);
  offset += 4;
  const title = data.subarray(offset, offset + titleLen).toString('utf-8');
  offset += titleLen;

  const descLen = data.readUInt32LE(offset);
  offset += 4;
  const description = data.subarray(offset, offset + descLen).toString('utf-8');
  offset += descLen;

  const categoryByte = data.readUInt8(offset);
  offset += 1;
  const categories = Object.values(MarketCategory);
  const category = categories[categoryByte] ?? MarketCategory.Other;

  const statusByte = data.readUInt8(offset);
  offset += 1;
  const statuses = Object.values(MarketStatus);
  const status = statuses[statusByte] ?? MarketStatus.Open;

  const yesProbability = data.readDoubleLE(offset);
  offset += 8;
  const yesStake = data.readDoubleLE(offset);
  offset += 8;
  const noStake = data.readDoubleLE(offset);
  offset += 8;

  const totalVolume = data.readDoubleLE(offset);
  offset += 8;
  const totalLiquidity = data.readDoubleLE(offset);
  offset += 8;

  const createdAt = Number(data.readBigInt64LE(offset));
  offset += 8;
  const closesAt = Number(data.readBigInt64LE(offset));
  offset += 8;

  const hasResolved = data.readUInt8(offset);
  offset += 1;
  let resolvedAt: number | null = null;
  let resolvedOutcome: OutcomeSide | null = null;

  if (hasResolved) {
    resolvedAt = Number(data.readBigInt64LE(offset));
    offset += 8;
    resolvedOutcome = data.readUInt8(offset) === 0 ? OutcomeSide.Yes : OutcomeSide.No;
    offset += 1;
  }

  return {
    publicKey: pubkey,
    authority,
    title,
    description,
    category,
    status,
    outcomes: [
      {
        side: OutcomeSide.Yes,
        label: 'Yes',
        probability: yesProbability,
        totalStake: yesStake,
        tokenMint: null,
      },
      {
        side: OutcomeSide.No,
        label: 'No',
        probability: 1 - yesProbability,
        totalStake: noStake,
        tokenMint: null,
      },
    ],
    totalVolume,
    totalLiquidity,
    createdAt,
    closesAt,
    resolvedAt,
    resolvedOutcome,
    imageUrl: null,
  };
}

export async function fetchAllMarkets(): Promise<Market[]> {
  if (!hasProgramId()) return [];

  const connection = getConnection();
  const programId = parseProgramId();

  const accounts = await connection.getProgramAccounts(programId, {
    commitment: 'confirmed',
  });

  return accounts
    .map(({ pubkey, account }) => {
      try {
        return decodeMarketAccount(pubkey, Buffer.from(account.data));
      } catch {
        return null;
      }
    })
    .filter((m): m is Market => m !== null);
}

export async function fetchMarket(address: PublicKey): Promise<Market | null> {
  const accounts = await getMultipleAccounts([address]);
  const info = accounts[0];
  if (!info) return null;

  try {
    return decodeMarketAccount(address, Buffer.from(info.data));
  } catch {
    return null;
  }
}

export async function fetchMarketTrades(
  market: PublicKey,
  limit = 50,
): Promise<MarketTrade[]> {
  const connection = getConnection();
  const signatures = await connection.getSignaturesForAddress(market, { limit });

  const txs = await connection.getParsedTransactions(
    signatures.map((s) => s.signature),
    { maxSupportedTransactionVersion: 0 },
  );

  const trades: MarketTrade[] = [];

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    if (!tx?.meta || tx.meta.err) continue;

    const sig = signatures[i];
    const logs = tx.meta.logMessages ?? [];
    const tradeLog = logs.find((l) => l.includes('Trade:'));

    if (tradeLog) {
      const parts = tradeLog.split('Trade:')[1]?.trim().split(',') ?? [];
      if (parts.length >= 3) {
        trades.push({
          signature: sig.signature,
          market,
          trader: new PublicKey(parts[0].trim()),
          side: parts[1].trim() === '0' ? OutcomeSide.Yes : OutcomeSide.No,
          amount: parseFloat(parts[2].trim()),
          price: parts.length > 3 ? parseFloat(parts[3].trim()) : 0,
          timestamp: sig.blockTime ?? 0,
        });
      }
    }
  }

  return trades;
}

export async function fetchMarketsByAddresses(addresses: PublicKey[]): Promise<Market[]> {
  const accounts = await getMultipleAccounts(addresses);

  return accounts
    .map((info, i) => {
      if (!info) return null;
      try {
        return decodeMarketAccount(addresses[i], Buffer.from(info.data));
      } catch {
        return null;
      }
    })
    .filter((m): m is Market => m !== null);
}
