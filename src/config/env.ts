export const ENV = {
  SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=43a2e3f7-3dea-4731-bc70-666b87980aa3',
  SOLANA_WS_URL: process.env.NEXT_PUBLIC_SOLANA_WS_URL || 'wss://mainnet.helius-rpc.com/?api-key=43a2e3f7-3dea-4731-bc70-666b87980aa3',
  SOLANA_NETWORK: (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta') as 'mainnet-beta' | 'devnet',
  PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || 'EHDmhzaaMFxC49yWZfyzD5QfUc4R8Nhx5GaUWkbf3LCo',
} as const;
