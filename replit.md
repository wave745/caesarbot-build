# CaesarX Trading Platform

## Overview

CaesarX is a comprehensive Solana trading platform that provides professional-grade tools for cryptocurrency trading, analysis, and automation. The platform features real-time token discovery, advanced scanning capabilities, automated trading strategies (copy trading, sniping, bundling), portfolio management, and reward systems. Built with Next.js 14, it integrates with multiple blockchain data providers and offers a sophisticated UI for both novice and advanced traders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14 with App Router
- **Rendering Strategy**: Client-side rendering for interactive components with React Server Components where applicable
- **Styling**: Tailwind CSS with custom design system using shadcn/ui components
- **State Management**: Zustand for global state (scanner, sniper automations)
- **Font System**: Geist Sans and Geist Mono for modern typography

**Key Design Patterns**:
- Component-based architecture with clear separation of concerns
- Modular page structure under `/app` directory with feature-specific routes
- Reusable UI components in `/components` with specialized sub-directories for complex features
- Custom hooks and utilities for shared logic
- Mobile-first responsive design with progressive enhancement

**Core Features**:
1. **Dashboard** - Market overview, asset tracking, liquidity monitoring
2. **Scanner** - Real-time Solana token analysis with 40+ commands for deep inspection
3. **Trending** - Live token feeds from multiple sources (Moralis, DexScreener, Pump.fun)
4. **Sniper** - Automated trading system with copy trading, token sniping, and transaction bundling
5. **Portfolio** - Wallet management and operations
6. **Tracker** - Wallet performance tracking
7. **Deployer** - Token creation and deployment tools
8. **Meta** - Market meta-analysis and trend identification with AI-powered launch assistant
9. **Rewards** - Gamification and leaderboard system

### Data Layer & APIs

**Primary Data Sources**:
- **Moralis API**: Trending tokens, new token discovery, token metadata
- **Helius RPC**: Solana blockchain interaction, token metadata, holder data, transaction history
- **Jupiter API**: Real-time price data and DEX aggregation
- **DexScreener API**: Market data, volume, liquidity information
- **Bitquery API**: Advanced blockchain queries and trading data
- **Pump.fun API**: Platform-specific token data and metas
- **CaesarX Backend API**: Custom automation and bundler services
- **xAI Grok API**: AI-powered insights and ticker suggestions based on market metas

**Service Layer Pattern**:
- Singleton service classes for each external API (`/lib/services/`)
- Centralized error handling and rate limiting
- Caching strategies to minimize API calls
- Fallback mechanisms for service failures

**Scanner System**:
- Multi-source token search by Solana contract address
- Command-based analysis system with 40+ specialized commands grouped by category:
  - Overview (stats, search, heatmaps)
  - Wallets & Holders (top holders, whale maps, common traders)
  - Early & Snipers (early buyers, PnL tracking)
  - Security/Risk (bundle checks, DEX verification, domain age)
  - Wallet Tools (analyzer, funding trace)

**Meta AI Assistant**:
- Grok AI-powered chat interface for market meta analysis
- Floating chat icon with transparent card window UI
- Context-aware responses based on live meta data (top metas, scores, trends)
- Provides creative ticker suggestions with names, descriptions, and lore
- Strategic insights for memecoin launches aligned with current market trends
- Direct integration with deployer page for seamless token creation
- Both streaming and non-streaming chat modes supported

### Automation & Trading System

**Sniper Architecture**:
Three distinct automation modes with shared execution infrastructure:

1. **Copy Trading**: Mirror trades from target wallets with configurable limits and filters
2. **Token Sniping**: Automated new token purchases based on ticker patterns and dev parameters
3. **Transaction Bundling**: Multi-step transaction recipes with MEV protection via Jito

**Execution Pipeline**:
- Transaction preparation on backend (`/prepare` endpoint)
- Local signing in Portfolio (keys never leave client)
- Bundle chunking (≤5 transactions per Jito limit)
- Relay through Jito with rate limiting
- Execution monitoring and failure handling

**Safety Features**:
- Daily spending caps and per-transaction limits
- Rate limiting and cooldown periods
- Guard checks (price impact, liquidity, output protection)
- Dry-run mode for testing strategies
- Comprehensive logging system

### State Management

**Zustand Stores**:
- `scanner.ts`: Search queries, filters, selected tokens, command results
- `sniper.ts`: Automations, wallets, execution state, logs

**Store Patterns**:
- Single source of truth for feature-specific state
- Actions co-located with state
- Persistence for critical data
- Type-safe interfaces for all state shapes

### Security & Configuration

**Environment Variables**:
- API keys for all external services
- RPC endpoints with fallbacks
- Feature flags for experimental features
- Development vs production configuration

**Security Measures**:
- Private keys stored locally only (Portfolio as wallet manager)
- API keys in environment variables, never hardcoded
- CORS and rate limiting on API routes
- Input validation on all user inputs

## External Dependencies

### Blockchain & Crypto APIs

1. **Moralis** (`MORALIS_API_KEY`)
   - Purpose: Token trending data, new token discovery
   - Usage: Primary source for real-time Solana token information

2. **Helius RPC** (`NEXT_PUBLIC_HELIUS_RPC_URL`)
   - Purpose: Solana blockchain RPC with enhanced features
   - Usage: Token metadata, holder distribution, transaction history

3. **Jupiter API** (`NEXT_PUBLIC_JUPITER_API_KEY`)
   - Purpose: DEX aggregation and price feeds
   - Usage: Real-time token pricing across multiple Solana DEXs

4. **DexScreener** (`DEXSCREENER_API_BASE_URL`)
   - Purpose: Market data aggregation
   - Usage: Volume, liquidity, market cap information

5. **Bitquery** (`BITQUERY_API_KEY`)
   - Purpose: Advanced blockchain analytics
   - Usage: Trading patterns, transaction analysis

6. **PumpPortal** (`PUMPPORTAL_API_KEY`, `PUMPPORTAL_API_BASE_URL`)
   - Purpose: Pump.fun platform integration
   - Usage: Platform-specific token data

7. **xAI** (`XAI_API_KEY`)
   - Purpose: Grok AI integration for meta analysis
   - Usage: AI-powered ticker suggestions and strategic insights for token launches

### Solana Libraries

- `@solana/web3.js`: Core Solana blockchain interaction
- `@metaplex-foundation/mpl-token-metadata`: SPL token metadata handling
- `helius-sdk`: Enhanced Helius RPC functionality
- `bs58`: Base58 encoding for Solana addresses

### UI & Styling

- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-built component library built on Radix
- **Tailwind CSS**: Utility-first styling
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

### Backend Services

**CaesarX API** (`NEXT_PUBLIC_CAESARX_API_URL`)
- Custom backend for automation execution
- Transaction bundling and Jito integration
- Wallet operations and signing
- Safety checks and rate limiting

### Development Tools

- TypeScript for type safety
- ESLint with Next.js configuration
- Geist font family for typography
- Custom error boundaries and global error handling