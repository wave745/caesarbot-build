# Echo Page Implementation Checklist

This document lists all files and changes needed to implement the Echo page in another repository.

## 📁 Core Echo Page Files

### 1. Page Routes
- [ ] `app/echo/page.tsx` - Main echo page route
- [ ] `app/echo/layout.tsx` - Echo page layout with metadata

### 2. Core Components
- [ ] `components/trenches-page.tsx` - Main trenches page component (2354 lines)
- [ ] `components/trenches-column.tsx` - Column component for displaying tokens
- [ ] `components/echo-customize-modal.tsx` - Settings modal with 3 tabs (Layout, Data, Quick Buy)

## 📦 Dependencies & Utilities

### 3. Library Files
- [ ] `lib/pump-api.ts` - API functions and types:
  - `fetchPumpFunTokens()`
  - `fetchPumpFunMCTokens()`
  - `fetchPumpFunGraduatedTokens()`
  - `fetchBonkFunTokens()`
  - `fetchBonkFunMCTokens()`
  - `fetchBonkFunGraduatedTokens()`
  - `fetchMoonItTokens()`
  - `fetchMoonItMCTokens()`
  - `fetchMoonItGraduatedTokens()`
  - `formatMarketCap()`
  - `formatVolume()`
  - `formatTimeAgo()`
  - `getContractAddress()`
  - Types: `PumpFunCoin`, `BonkFunToken`, `MoonItToken`

### 4. API Routes (Next.js API)
- [ ] `app/api/pump-fun/coins/route.ts` - Fetch new tokens
- [ ] `app/api/pump-fun/coins-mc/route.ts` - Fetch MC tokens (nearly there)
- [ ] `app/api/pump-fun/coins-graduated/route.ts` - Fetch graduated tokens
- [ ] `app/api/pump-fun/sol-price/route.ts` - SOL price fetcher
- [ ] `app/api/pump-fun/token/[address]/route.ts` - Individual token data
- [ ] `app/api/pump-fun/new-tokens/route.ts` - New tokens endpoint
- [ ] `app/api/pump-tokens-migrated/route.ts` - Migrated tokens endpoint

### 5. Supporting Components
- [ ] `components/trending-filter-modal.tsx` - Filter modal (used by trenches-column)
- [ ] `components/sound-selector.tsx` - Sound selection component
- [ ] `hooks/use-column-sound.ts` - Custom hook for column sounds

## 🎨 UI Components (shadcn/ui)

### 6. Required UI Components
- [ ] `components/ui/button.tsx`
- [ ] `components/ui/input.tsx`
- [ ] `components/ui/card.tsx`
- [ ] `components/ui/tabs.tsx`
- [ ] `components/ui/checkbox.tsx`

## 🖼️ Assets & Icons

### 7. Image Assets
- [ ] `/public/sol-logo.png` - Solana logo
- [ ] `/public/bnb-chain-binance-smart-chain-logo.svg` - BNB Chain logo
- [ ] `/public/icons/platforms/pump.fun-logo.svg` - Platform logos
- [ ] `/public/icons/social/x-logo.svg` - Social icons
- [ ] `/public/icons/ui/totalholders-icon.svg` - UI icons
- [ ] `/public/icons/ui/dev-migrated-icon.svg` - UI icons

## 🔧 Key Features to Implement

### 8. Core Functionality
- [ ] **Live Polling System**: 1-second intervals for real-time token updates
- [ ] **Real-time Age Calculation**: 100ms updates for token ages
- [ ] **Token Deduplication**: Merge tokens from multiple sources
- [ ] **SOL Price Caching**: Background fetcher (10ms updates)
- [ ] **Chain Toggle**: Solana/BNB switching
- [ ] **Three Column Layout**: New, Nearly there (MC), Migrated
- [ ] **Dynamic Column Visibility**: Based on echoSettings
- [ ] **Filter System**: Integration with TrendingFilterModal

### 9. Echo Settings Features
- [ ] **Layout Settings**:
  - Metrics size (Small/Large)
  - Avatar shape (Circle/Square)
  - Column spacing (Compact/Spaced)
  - Show/hide columns
  
- [ ] **Toggle Settings**:
  - Copy name on click
  - Pause on hover
  - Background color
  - Launchpad color matching
  
- [ ] **Threshold System**:
  - Market cap thresholds (3 levels with colors)
  - Tweet age thresholds (3 levels with colors)
  
- [ ] **Quick Buy Customization**:
  - Button color & text color
  - Size (Small/Large/Mega/Ultra)
  - Shape (Round/Square)
  - Width slider
  - Transparency slider
  
- [ ] **Data Display Toggles** (17 fields):
  - Top 10 holders, Dev holding, Snipers, Insiders
  - Bundles, Dex boosted, Dex paid, X token search
  - Dev bonded, Socials, Total holders, Volume
  - Market cap, Market cap in stats, Total fees
  - Contract address, Linked X user, Keywords search

## 📝 Type Definitions

### 10. TypeScript Interfaces
```typescript
// EchoSettings type (from echo-customize-modal.tsx)
export type EchoSettings = {
  layout: {
    metricsSize: "Small" | "Large"
    avatarShape: "Circle" | "Square"
    columns: "Compact" | "Spaced"
    showNew: boolean
    showAlmostBonded: boolean
    showMigrated: boolean
  }
  toggles: {
    copyNameOnClick: boolean
    pauseOnHover: boolean
    backgroundColor: boolean
    launchpadColorMatching: boolean
  }
  thresholds: {
    mc1: string
    mc2: string
    mc3: string
    tweetAge1: string
    tweetAge2: string
    tweetAge3: string
  }
  thresholdColors: {
    mc1: string
    mc2: string
    mc3: string
    tweet1: string
    tweet2: string
    tweet3: string
  }
  quickBuy: {
    buttonColor: string
    buttonTextColor: string
    size: "Small" | "Large" | "Mega" | "Ultra"
    shape: "Round" | "Square"
    width: number
    transparency: number
  }
  dataDisplay: {
    top10Holders: boolean
    devHolding: boolean
    snipersHoldings: boolean
    insidersHolding: boolean
    bundles: boolean
    dexBoosted: boolean
    dexPaid: boolean
    xTokenSearch: boolean
    devBonded: boolean
    socials: boolean
    totalHolders: boolean
    volume: boolean
    marketCap: boolean
    marketCapInStats: boolean
    totalFees: boolean
    contractAddress: boolean
    linkedXUser: boolean
    keywordsSearch: boolean
  }
}

// TrenchesToken interface
interface TrenchesToken {
  id: string
  name: string
  symbol: string
  image: string
  mc: string
  volume: string
  fee: string
  age: string
  holders: number
  buys: number
  sells: number
  status: 'new' | 'about-to-graduate' | 'migrated'
  tag: string
  contractAddress: string
  migratedTokens: number
  devSold: boolean
  top10Holders: number
  snipers: number
  insiders: number
  platform: 'pump.fun' | 'bonk.fun' | 'moon.it' | ...
  platformLogo?: string
  buyAmount: string
  totalFees?: number
  tradingFees?: number
  tipsFees?: number
  coinMint?: string
  dev?: string
  bondingCurveProgress?: number
  sniperCount?: number
  graduationDate?: string | null
  devHoldingsPercentage?: number
  sniperOwnedPercentage?: number
  topHoldersPercentage?: number
  hasTwitter?: boolean
  hasTelegram?: boolean
  hasWebsite?: boolean
  twitter?: string | null
  telegram?: string | null
  website?: string | null
  creationTime?: number
}
```

## 🔄 Integration Points

### 11. Component Integration Flow
```
app/echo/page.tsx
  └─> components/trenches-page.tsx
      ├─> components/trenches-column.tsx (x3 columns)
      │   ├─> components/trending-filter-modal.tsx
      │   ├─> components/sound-selector.tsx
      │   └─> hooks/use-column-sound.ts
      └─> components/echo-customize-modal.tsx
```

## ⚙️ Configuration

### 12. Environment Variables (if needed)
- [ ] Check for any API keys or environment variables used in API routes
- [ ] Verify CORS settings if calling external APIs

### 13. Package Dependencies
- [ ] `lucide-react` - Icons
- [ ] `next/image` - Image optimization
- [ ] React hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`

## 📋 Implementation Steps

1. **Copy Core Files**: Start with page routes and main components
2. **Copy API Routes**: Set up all API endpoints
3. **Copy Utilities**: Library files and helper functions
4. **Copy Supporting Components**: Filter modal, sound selector, etc.
5. **Copy Assets**: Icons and images
6. **Install Dependencies**: Ensure all npm packages are installed
7. **Test Integration**: Verify all components work together
8. **Test Settings**: Verify echoSettings flow through all components
9. **Test Live Updates**: Verify polling and real-time updates work
10. **Test Filters**: Verify filter system integration

## 🐛 Common Issues to Watch For

- [ ] **Path Aliases**: Ensure `@/` alias is configured in `tsconfig.json`
- [ ] **API Route Handlers**: Verify Next.js API route structure matches your Next.js version
- [ ] **Type Imports**: Check all TypeScript type imports are correct
- [ ] **Image Paths**: Verify all image paths are correct
- [ ] **State Management**: Ensure state flows correctly through component hierarchy
- [ ] **Polling Intervals**: May need adjustment based on performance requirements

## 📊 File Size Reference

- `trenches-page.tsx`: ~2354 lines (main component)
- `trenches-column.tsx`: ~1500+ lines (column component)
- `echo-customize-modal.tsx`: ~400 lines (settings modal)

---

**Note**: This is a comprehensive implementation. The echo page is a complex feature with real-time updates, extensive customization, and multiple data sources. Ensure you have all dependencies and API endpoints configured correctly.

