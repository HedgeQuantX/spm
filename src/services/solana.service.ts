import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  type Commitment,
} from '@solana/web3.js';
import { ENV } from '@/config/env';

let connectionInstance: Connection | null = null;

export function getConnection(commitment: Commitment = 'confirmed'): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(ENV.SOLANA_RPC_URL, {
      commitment,
      wsEndpoint: ENV.SOLANA_WS_URL,
    });
  }
  return connectionInstance;
}

export async function getSolBalance(wallet: PublicKey): Promise<number> {
  const connection = getConnection();
  const balance = await connection.getBalance(wallet);
  return balance / LAMPORTS_PER_SOL;
}

export async function getTokenBalance(
  wallet: PublicKey,
  mint: PublicKey,
): Promise<number> {
  const connection = getConnection();
  const accounts = await connection.getParsedTokenAccountsByOwner(wallet, { mint });

  if (accounts.value.length === 0) return 0;

  const parsed = accounts.value[0].account.data.parsed;
  return parsed.info.tokenAmount.uiAmount ?? 0;
}

export async function getRecentBlockhash(): Promise<string> {
  const connection = getConnection();
  const { blockhash } = await connection.getLatestBlockhash();
  return blockhash;
}

export async function sendAndConfirmTx(
  transaction: Transaction,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> {
  const connection = getConnection();
  const blockhash = await getRecentBlockhash();

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = transaction.feePayer;

  const signed = await signTransaction(transaction);
  const rawTx = signed.serialize();
  const signature = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}

export async function getAccountInfo(address: PublicKey) {
  const connection = getConnection();
  return connection.getAccountInfo(address);
}

export async function getMultipleAccounts(addresses: PublicKey[]) {
  const connection = getConnection();
  return connection.getMultipleAccountsInfo(addresses);
}

export function subscribeToAccount(
  address: PublicKey,
  callback: (info: { lamports: number; data: Buffer }) => void,
): number {
  const connection = getConnection();
  return connection.onAccountChange(address, (accountInfo) => {
    callback({
      lamports: accountInfo.lamports,
      data: Buffer.from(accountInfo.data),
    });
  });
}

export function unsubscribeFromAccount(subscriptionId: number): void {
  const connection = getConnection();
  connection.removeAccountChangeListener(subscriptionId);
}

export { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL };
