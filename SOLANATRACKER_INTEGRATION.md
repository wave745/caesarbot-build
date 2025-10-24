# SolanaTracker Integration

This document outlines the integration of SolanaTracker API to fetch tokens from multiple platforms in the NEW column of the trenches page.

## Overview

The integration replaces the single-platform token fetching (Pump.fun only) with a multi-platform approach using SolanaTracker API, which provides data from:

- **Pump.fun** - Original launch platform
- **PumpSwap** - Pump.fun liquidity pools  
- **Moonshot** - New launches
- **Boop.fun** - Community platform
- **Orca** - Concentrated liquidity
- **Meteora** - Dynamic pools
- **Raydium Launchpad** - V4 AMM, CPMM, Launchpad

## Files Modified

### 1. New SolanaTracker Service
- **File**: `lib/services/solanatracker-service.ts`
- **Purpose**: Core service for interacting with SolanaTracker API
- **Features**:
  - Multi-platform token fetching
  - Platform configuration and metadata
  - Error handling and fallbacks
  - Token search functionality

### 2. API Routes
- **File**: `app/api/solanatracker/tokens/route.ts`
- **Purpose**: Main endpoint for fetching tokens from all platforms
- **File**: `app/api/solanatracker/search/route.ts`
- **Purpose**: Token search functionality
- **File**: `app/api/solanatracker/platforms/route.ts`
- **Purpose**: Platform information and configuration

### 3. Updated Token Fetching Logic
- **File**: `lib/pump-api.ts`
- **Changes**:
  - Updated `fetchPumpFunTokens()` to use SolanaTracker API
  - Updated `fetchPumpFunMCTokens()` to use SolanaTracker API
  - Added fallback to original APIs if SolanaTracker fails
  - Extended `PumpFunCoin` interface with platform fields

### 4. UI Components
- **File**: `components/trenches-page.tsx`
- **Changes**:
  - Updated `TrenchesToken` interface to support new platforms
  - Modified `convertPumpFunToToken()` to handle platform data
  - Added platform logo support

- **File**: `components/trenches-column.tsx`
- **Changes**:
  - Updated platform logo display logic
  - Added support for all new platform logos
  - Enhanced token card rendering

### 5. Environment Configuration
- **File**: `ENVIRONMENT_SETUP.md`
- **Changes**:
  - Added `SOLANATRACKER_API_KEY` configuration
  - Updated services documentation

## Platform Logos

The following platform logos are available in `/public/icons/platforms/`:

- `pump.fun-logo.svg` - Pump.fun
- `pumpswap-logo.svg` - PumpSwap
- `moonshot-logo.svg` - Moonshot
- `boop.fun-logo.svg` - Boop.fun
- `orca.so-logo.svg` - Orca
- `meteora.ag(met-dbc)-logo.png` - Meteora
- `raydium-launchlab-logo.svg` - Raydium Launchpad
- `bonk.fun-logo.svg` - Bonk.fun (existing)
- `moon.it-logo.png` - Moon.it (existing)

## API Integration Flow

1. **Primary**: SolanaTracker API provides unified access to multiple platforms
2. **Fallback**: Original platform APIs (Pump.fun, Bonk.fun, Moon.it) if SolanaTracker fails
3. **Data Transformation**: SolanaTracker tokens are converted to `PumpFunCoin` format for compatibility
4. **Platform Metadata**: Each token includes platform name and logo information

## Environment Variables

Add to your `.env.local` file:

```bash
# SolanaTracker API Configuration
SOLANATRACKER_API_KEY=your_solanatracker_api_key_here
```

## Testing

Run the integration test:

```bash
node test-solanatracker-integration.js
```

## Benefits

1. **Multi-Platform Support**: Access tokens from 7+ platforms in one place
2. **Unified Data Format**: Consistent token data across all platforms
3. **Platform Identification**: Clear visual indicators of token origin
4. **Fallback Reliability**: Original APIs still work if SolanaTracker fails
5. **Scalable Architecture**: Easy to add new platforms in the future

## Usage

The NEW column in the trenches page now displays tokens from all supported platforms:

- Tokens are sorted by creation time (newest first)
- Platform logos appear as overlays on token images
- Each token shows its originating platform
- Data includes market cap, volume, holders, and social links

## Future Enhancements

- Add platform-specific filtering
- Implement platform-based sorting options
- Add platform statistics and analytics
- Support for additional platforms as they become available
