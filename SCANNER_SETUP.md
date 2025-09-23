# Solana Scanner - Real Data Integration Setup

## Overview
The scanner now integrates with real Solana data sources using your Jupiter and Helius Pro plans.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Helius RPC (Required)
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# CaesarX API (Optional - for command execution)
NEXT_PUBLIC_CAESARX_API_URL=http://localhost:3001

# Jupiter API (Optional - for enhanced features)
NEXT_PUBLIC_JUPITER_API_KEY=your_jupiter_pro_key_here
```

## Data Sources Integrated

### 1. **Helius Pro RPC** 
- **Purpose**: Token metadata, holder data, transaction history
- **Methods Used**:
  - `getAccountInfo` - Token metadata and supply
  - `getTokenAccountsByMint` - Holder distribution
  - `getSignaturesForAddress` - Recent transactions
- **Benefits**: High rate limits, enhanced data parsing

### 2. **Jupiter API**
- **Purpose**: Real-time price data and market information
- **Methods Used**:
  - `/v4/price` - Current token prices
- **Benefits**: Accurate pricing, multiple DEX aggregation

### 3. **DexScreener API**
- **Purpose**: Market data, volume, liquidity information
- **Methods Used**:
  - `/dex/tokens/{address}` - Token market data
- **Benefits**: Comprehensive market metrics

## Features Now Available

### ✅ **Real Token Data**
- Live price data from Jupiter
- Market cap, volume, liquidity from DexScreener
- Token metadata from Helius RPC
- Holder distribution analysis
- Transaction history

### ✅ **Enhanced Risk Assessment**
- Based on real market data
- Holder concentration analysis
- Liquidity and volume ratios
- Age-based risk factors

### ✅ **Command Execution**
- 40+ CaesarX commands available
- Real data integration for results
- Holder analysis, whale detection
- Bundle transaction analysis

## Setup Instructions

1. **Get Helius API Key**:
   - Go to [Helius Dashboard](https://dashboard.helius.xyz/)
   - Create a new project
   - Copy your RPC URL with API key

2. **Configure Environment**:
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY_HERE
   ```

3. **Test the Integration**:
   - Start the development server: `npm run dev`
   - Go to `/scanner`
   - Try searching for a Solana token address
   - Test the CaesarX commands

## Example Token Addresses to Test

- **SOL**: `So11111111111111111111111111111111111111112`
- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **RAY**: `4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R`

## Command Examples

Try these CaesarX commands with real data:

1. **🐋 Whale Map** - See top holders
2. **⚡ Early Buyers** - First buyers analysis  
3. **📦 Bundle Check** - Bundle transactions
4. **👥 Top Holders** - Holder distribution
5. **🧪 DEX Updated** - DEX status

## Troubleshooting

### Common Issues:

1. **"Token not found"**:
   - Verify the address is a valid Solana mint address
   - Check if the token exists on mainnet

2. **"Rate limit exceeded"**:
   - Helius Pro has high limits, but if exceeded, wait a moment
   - Consider upgrading to higher tier if needed

3. **"Invalid address format"**:
   - Ensure address is 32-44 characters, base58 encoded
   - Use Solana address validator

### Performance Tips:

- The scanner caches data for 1 minute to reduce API calls
- Multiple data sources are called in parallel for speed
- Error handling provides graceful fallbacks

## Next Steps

1. **Add More Commands**: Extend the CaesarX command integration
2. **Historical Data**: Add price history and charts
3. **Alerts**: Set up price and holder alerts
4. **Portfolio**: Track multiple tokens
5. **Analytics**: Advanced token analytics

The scanner is now fully functional with real Solana data! 🚀




