import {
  PublicKey,
  TransactionInstruction,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getConnection } from './solana.service';
import { ENV } from '@/config/env';

const PROGRAM_ID = new PublicKey(ENV.PROGRAM_ID);

/* ------------------------------------------------------------------
 * PDA Seeds
 * ----------------------------------------------------------------*/
function textEncoder(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function u64ToLeBytes(n: number): Uint8Array {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, n & 0xFFFFFFFF, true);
  view.setUint32(4, Math.floor(n / 0x100000000), true);
  return new Uint8Array(buf);
}

function u32ToLeBytes(n: number): Uint8Array {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setUint32(0, n, true);
  return new Uint8Array(buf);
}

/* ------------------------------------------------------------------
 * PDA Derivations
 * ----------------------------------------------------------------*/
export function getPlatformPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [textEncoder('platform')],
    PROGRAM_ID
  );
  return pda;
}

export function getMarketPda(marketIndex: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [textEncoder('market'), u64ToLeBytes(marketIndex)],
    PROGRAM_ID
  );
  return pda;
}

export function getVaultPda(marketPda: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [textEncoder('vault'), marketPda.toBytes()],
    PROGRAM_ID
  );
  return pda;
}

export function getBetPda(
  marketPda: PublicKey,
  bettor: PublicKey,
  totalBets: number,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      textEncoder('bet'),
      marketPda.toBytes(),
      bettor.toBytes(),
      u32ToLeBytes(totalBets),
    ],
    PROGRAM_ID
  );
  return pda;
}

export function getUserStatsPda(wallet: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [textEncoder('user_stats'), wallet.toBytes()],
    PROGRAM_ID
  );
  return pda;
}

/* ------------------------------------------------------------------
 * Instruction discriminators (from IDL)
 * ----------------------------------------------------------------*/
const PLACE_BET_DISC = new Uint8Array([222, 62, 67, 220, 63, 166, 126, 33]);

/* ------------------------------------------------------------------
 * Build place_bet instruction data
 * Args: side: u8, amount: u64
 * ----------------------------------------------------------------*/
function buildPlaceBetData(side: number, amountLamports: number): Uint8Array {
  const data = new Uint8Array(8 + 1 + 8); // disc(8) + side(1) + amount(8)
  data.set(PLACE_BET_DISC, 0);
  data[8] = side;
  const amountBytes = u64ToLeBytes(amountLamports);
  data.set(amountBytes, 9);
  return data;
}

/* ------------------------------------------------------------------
 * Build place_bet transaction
 * ----------------------------------------------------------------*/
export interface PlaceBetParams {
  bettor: PublicKey;
  marketPda: PublicKey;
  marketIndex: number;
  totalBets: number;
  side: number; // 0 = A, 1 = B
  amountSol: number;
}

export async function buildPlaceBetTx(params: PlaceBetParams): Promise<Transaction> {
  const { bettor, marketPda, totalBets, side, amountSol } = params;

  const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  const platformPda = getPlatformPda();
  const vaultPda = getVaultPda(marketPda);
  const betPda = getBetPda(marketPda, bettor, totalBets);
  const userStatsPda = getUserStatsPda(bettor);

  const data = buildPlaceBetData(side, amountLamports);

  const instruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: bettor, isSigner: true, isWritable: true },
      { pubkey: platformPda, isSigner: false, isWritable: true },
      { pubkey: marketPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: betPda, isSigner: false, isWritable: true },
      { pubkey: userStatsPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });

  const connection = getConnection();
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  const tx = new Transaction();
  tx.add(instruction);
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = bettor;

  return tx;
}

/* ------------------------------------------------------------------
 * Send and confirm transaction
 * ----------------------------------------------------------------*/
export async function sendAndConfirm(
  signedTx: Transaction,
): Promise<string> {
  const connection = getConnection();
  const raw = signedTx.serialize();
  const sig = await connection.sendRawTransaction(raw, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
  await connection.confirmTransaction(sig, 'confirmed');
  return sig;
}
