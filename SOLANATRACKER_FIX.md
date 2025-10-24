# Solana Tracker Integration Fix

## Problem

Tokens from the Solana Tracker API were displaying as "Unknown" with no proper data in the NEW column of the trenches page.

## Root Cause

The SolanaTrackerService was not correctly mapping the nested field structure returned by the Solana Tracker API. The API returns data with a complex nested structure like:

```json
{
  "token": {
    "name": "Token Name",
    "symbol": "TKN",
    "mint": "...",
    "image": "...",
    "createdAt": "...",
    "createdOn": "pump.fun"
  },
  "pools": [{
    "marketCap": { "usd": 100000 },
    "volume": { "h24": 50000 },
    "price": { "usd": 0.001 },
    "txns": { "buys": 100, "sells": 50 }
  }],
  "risk": {
    "fees": { "total": 100, "totalTrading": 80, "totalTips": 20 }
  }
}
```

The original service was trying to access fields directly (e.g., `token.name`) instead of the nested path (`token.token.name`).

## Solution

Updated the `convertToTokens()` method in `/lib/services/solanatracker-service.ts` to properly map the nested fields:

### Key Changes:

1. **Token Information**: 
   - Changed from `token.name` to `item.token?.name`
   - Changed from `token.symbol` to `item.token?.symbol`
   - Changed from `token.mint` to `item.token?.mint`

2. **Market Data**:
   - Changed from `token.marketCap` to `item.pools?.[0]?.marketCap?.usd`
   - Changed from `token.volume` to `item.pools?.[0]?.volume?.h24`
   - Changed from `token.price` to `item.pools?.[0]?.price?.usd`

3. **Platform Detection**:
   - Added logic to detect platform from `item.token?.createdOn`
   - Added fallback to check `item.pools?.[0]?.market`

4. **Risk/Fee Data**:
   - Changed from `token.fees` to `item.risk?.fees?.total`
   - Changed from `token.tradingFees` to `item.risk?.fees?.totalTrading`

## Current Status

✅ **Fixed**: The service now properly maps all fields from the Solana Tracker API
✅ **Fallback**: If API key is missing or API fails, system falls back to existing pump.fun API
✅ **Multi-platform**: Supports detection of pump.fun, bonk.fun, moon.it, meteora, pumpswap, moonshot, boop.fun, orca, and raydium

## Setup Required

To use the Solana Tracker integration:

1. Get an API key from https://solanatracker.io
2. Create a `.env.local` file in the root directory:
   ```bash
   SOLANATRACKER_API_KEY=your_api_key_here
   ```
3. Restart the development server

Without the API key, the system will automatically fall back to the existing APIs.

## Testing

Once you've set up the API key, you can test the integration:

1. Start the server: `npm run dev`
2. Visit the trenches page
3. Check the NEW column - tokens should display with proper names, symbols, and data
4. Check the browser console for logs confirming Solana Tracker data is being used

## Files Modified

- `/lib/services/solanatracker-service.ts` - Fixed field mapping
- `/app/api/solanatracker/tokens/route.ts` - Created API route
- `/components/trenches-page.tsx` - Integrated Solana Tracker API with fallback
- `/SOLANATRACKER_SETUP.md` - Updated documentation
