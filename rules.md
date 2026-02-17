# SPM (Solana Prediction Markets) - Project Rules

## Code Standards

### File Size
- **Maximum 1000 lines per file** - no exceptions
- If a file approaches 800 lines, split into logical sub-modules
- Prefer many small, focused files over few large ones

### Code Quality
- **Zero dead code** - every function, variable, import must be used
- **Zero mock/simulation data** - all data comes from on-chain or WebSocket
- **Zero placeholder logic** - every function must have real implementation
- TypeScript strict mode enabled, no `any` types unless absolutely unavoidable
- All exports must be used by at least one consumer

### Architecture
- **Separation of concerns**: services / hooks / components / types / constants
- Components are purely presentational or container (never mixed)
- Business logic lives in hooks and services, never in components
- All Solana interactions go through dedicated service layer
- All real-time data flows through WebSocket service

### Data Policy
- **Real data only** from Solana blockchain (mainnet-beta / devnet)
- **Real-time updates** via WebSocket subscriptions (Solana WS RPC)
- No hardcoded addresses in components - use config/constants
- All prices, volumes, and balances fetched from on-chain state

### Naming Conventions
- Components: PascalCase (`MarketCard.tsx`)
- Hooks: camelCase with `use` prefix (`useMarkets.ts`)
- Services: camelCase (`solana.service.ts`)
- Types: PascalCase interfaces, camelCase for type aliases
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for non-component files

### Design System
- Dark-first design, clean minimalist aesthetic
- SVG icons only - no icon libraries, no image icons
- Consistent spacing scale: 4px base unit
- Glass-morphism for card elements
- Monospace for numbers/addresses, sans-serif for text

### Dependencies
- Minimal dependency footprint
- @solana/web3.js for blockchain interactions
- @solana/wallet-adapter for wallet connections
- Next.js 14+ with App Router
- Tailwind CSS for styling
- No unnecessary UI libraries

### Performance
- Server components by default, client components only when needed
- Lazy load heavy components
- Debounce WebSocket updates for UI
- Memoize expensive computations
- Virtual scrolling for long lists

### Git & Workflow
- Conventional commits
- Feature branches
- No secrets in code - use environment variables
