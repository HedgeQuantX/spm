# SPM - Solana Prediction Markets

Decentralized prediction market platform built on Solana. Trade predictions on real-world events with real-time on-chain data.

## Architecture

```
src/
  app/              # Next.js App Router pages
  components/
    icons/          # SVG icon system
    layout/         # Header, Footer, WalletProvider
    market/         # Market cards, filters, trading
    ui/             # Reusable UI primitives
    portfolio/      # Portfolio components
    leaderboard/    # Leaderboard components
  hooks/            # React hooks (useMarkets, useWalletBalance, etc.)
  services/         # Solana RPC, WebSocket, market service
  types/            # TypeScript type definitions
  config/           # Environment and constants
  lib/              # Utilities (format, cn, debounce)
```

## Stack

- **Next.js 16** - App Router, Server Components
- **Solana Web3.js** - Blockchain interactions
- **Wallet Adapter** - Phantom, Solflare support
- **Tailwind CSS 4** - Styling
- **TypeScript** - Strict mode

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Rules

See [rules.md](./rules.md) for project conventions.
