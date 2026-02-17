export const ENV = {
  SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  SOLANA_WS_URL: process.env.NEXT_PUBLIC_SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com',
  SOLANA_NETWORK: (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta') as 'mainnet-beta' | 'devnet',
  PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || 'EHDmhzaaMFxC49yWZfyzD5QfUc4R8Nhx5GaUWkbf3LCo',
} as const;
