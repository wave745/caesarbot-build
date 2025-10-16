# Scanner Components

This directory contains all the components for the CaesarX Scanner page - a real-time token discovery and analysis tool.

## Components

### Core Components
- **SidebarFilters.tsx** - Left sidebar with filter groups and command-based toggles
- **TokenCard.tsx** - Individual token display card with sparkline and risk badge
- **TokenDrawer.tsx** - Right-side detailed view for selected tokens
- **LiveFeedTicker.tsx** - Animated ticker for real-time events
- **RiskBadge.tsx** - Risk level indicator (low/med/high)
- **Sparkline.tsx** - Mini price chart visualization

### State Management
- **stores/scanner.ts** - Zustand store for scanner state
- **lib/scanner-service.ts** - Service layer for data fetching and filtering

## Features

### Filter Groups
- **Top Picks** - Curated high-quality tokens
- **Wallets & Holders** - Token holder analysis
- **Early & Snipers** - Early buyer detection
- **Security / Risk** - Risk assessment tools
- **Socials / KOL** - Social media and influencer tracking
- **Bundles & PnL** - Bundle detection and profit/loss analysis

### Command-Based Filters
- 🐳 **Whales** - High market cap tokens
- ⚡ **Early Buyers** - Early adopter detection
- 🎯 **Snipers** - Sniper bot activity
- 👑 **KOL Activity** - Key opinion leader tracking
- 🧨 **Risky Only** - High-risk tokens only

### Token Information
- Market cap, price, volume, liquidity
- Risk assessment with color-coded badges
- Sparkline price charts
- Security flags (bundled, dev sold, site reused)
- Social media links

### Real-time Features
- Live feed ticker with market events
- Auto-refreshing data
- Search functionality
- Responsive design

## Usage

The scanner page is accessible at `/scanner` and integrates with the existing CaesarX navigation. All components are built with Tailwind CSS and follow the existing design system.

**Note**: The scanner is currently configured to return empty data and is ready for real data integration. To connect real data sources, update the `ScannerService` class in `lib/scanner-service.ts`.

## Data Integration

The scanner is designed to integrate with CaesarX's existing command system:
- `/th`, `/top_holders` → Security analysis
- `/whale`, `/whale_map` → Whale detection
- `/early_map`, `/fresh`, `/sn` → Early buyer analysis
- `/bundle`, `/bundle_check` → Bundle detection
- `/domain`, `/site_check`, `/x` → Social verification
- `/dup` → Duplicate detection
- `/pnl`, `/wallet_analyzer` → Profit/loss analysis
