# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Moralis API Configuration
MORALIS_API_KEY=your_moralis_api_key_here
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_api_key_here

# DexScreener API Configuration
DEXSCREENER_API_BASE_URL=https://api.dexscreener.com

# PumpPortal API Configuration (if needed)
PUMPPORTAL_API_KEY=your_pumpportal_api_key_here
PUMPPORTAL_API_BASE_URL=https://api.pumpportal.fun

# Bitquery API Configuration
BITQUERY_API_KEY=your_bitquery_api_key_here

# Helius RPC Configuration
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com

# CaesarX API Configuration
NEXT_PUBLIC_CAESARX_API_URL=http://localhost:3001

# SolanaTracker API Configuration
SOLANATRACKER_API_KEY=your_solanatracker_api_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure and private
- Use different API keys for development and production
- Rotate API keys regularly for security

## Services Updated

The following services have been updated to use environment variables:

1. **MoralisMetadataService** - Uses `MORALIS_API_KEY`
2. **DexScreenerService** - Uses `DEXSCREENER_API_BASE_URL`
3. **MoralisTrendingService** - Uses `MORALIS_API_KEY`
4. **MoralisComprehensiveService** - Already using `MORALIS_API_KEY`
5. **PumpPortalService** - Uses `PUMPPORTAL_API_KEY`
6. **BitqueryService** - Uses `BITQUERY_API_KEY`
7. **SolanaTrackerService** - Uses `SOLANATRACKER_API_KEY`

All hardcoded API keys have been removed from the codebase.
