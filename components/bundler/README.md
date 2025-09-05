# Bundler Integration for Caesarbot

This implementation provides a complete bundler integration that allows Copy Trading, Sniper, and dedicated Bundler automations to execute transactions as Jito bundles for faster, more reliable execution.

## 🏗️ Architecture Overview

The bundler system follows a clean, modular architecture with Portfolio as the single source of truth for wallet management:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Jito Relay    │
│                 │    │                  │    │                 │
│ • Bundler Tab   │───▶│ • /prepare       │───▶│ • Bundle TXs    │
│ • Copy Toggle   │    │ • /relay         │    │ • MEV Protection│
│ • Snipe Toggle  │    │ • Safety Checks  │    │ • Priority Fees │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Portfolio     │    │   Safety Rails   │
│                 │    │                  │
│ • Wallet Keys   │    │ • Spending Caps  │
│ • Local Signing │    │ • Rate Limits    │
│ • Balance Mgmt  │    │ • Guard Checks   │
└─────────────────┘    └──────────────────┘
```

## 🚀 Key Features

### ✅ Complete Integration
- **Bundler Tab**: Dedicated UI for creating complex bundle recipes
- **Copy/Snipe Toggle**: "Execute as bundle" option for existing automations
- **Portfolio Integration**: All wallet operations go through Portfolio
- **Safety Rails**: Comprehensive caps, rate limits, and guard checks

### ✅ Bundle Recipe System
- **Approve**: Token/router approvals
- **Buy**: Multi-route buying (Raydium, Jupiter, Pump)
- **Guard**: Price impact, LP, and output protection
- **List**: Take profit/stop loss orders
- **Sell**: Partial or full position selling

### ✅ Execution Pipeline
1. **Prepare**: Backend builds unsigned transactions
2. **Sign**: Portfolio handles local signing (keys never leave client)
3. **Chunk**: Split into ≤5 tx bundles (Jito limit)
4. **Relay**: Submit through Jito proxy with rate limiting
5. **Monitor**: Track execution and handle failures

### ✅ Safety & Limits
- **Daily Caps**: Per-wallet spending limits
- **Per-Bundle Caps**: Maximum single bundle size
- **Rate Limiting**: Cooldowns and execution frequency limits
- **Guard Checks**: Price impact, liquidity, and authority validation
- **Auto-Pause**: Automatic pausing on failures or cap breaches

## 📁 File Structure

```
components/
├── bundler-form.tsx          # Main bundler creation form
├── bundler-demo.tsx          # Integration demo component
├── automation-modal.tsx      # Updated with bundler tab
├── copy-trading-form.tsx     # Added bundle toggle
└── snipe-form.tsx           # Added bundle toggle

lib/
├── types/automation.ts       # Extended with bundler types
├── services/
│   ├── portfolio-signer.ts   # Local signing service
│   ├── bundle-executor.ts    # Core execution pipeline
│   ├── bundle-api.ts         # Backend API client
│   ├── caps-manager.ts       # Safety rails & limits
│   └── bundler-integration.ts # Main integration service
```

## 🔧 Usage Examples

### Creating a Bundler Automation

```typescript
const recipe: BundleStep[] = [
  { kind: "approve", program: "token" },
  { kind: "buy", route: "jupiter", amountSol: 0.1 },
  { kind: "guard", minOutPct: 95, maxImpactPct: 5, minLp: 1000 },
  { kind: "list", tpPct: 12, slPct: 6 }
]

const trigger: BundleTrigger = {
  mode: "signal",
  type: "liquidity_add"
}

const limits = {
  maxSol: 0.5,
  retries: 3,
  cooldownSec: 30,
  dailyCap: 2.0
}
```

### Executing Copy Trading as Bundle

```typescript
const integration = getBundlerIntegration()

const result = await integration.executeCopyAsBundle(
  {
    automationId: "copy_1",
    automationType: "copy",
    walletId: "wallet_1",
    tokenAddress: "token_address"
  },
  "target_wallet_address",
  5, // 5% of target's buy
  execParams
)
```

### Safety Check Example

```typescript
const safetyCheck = capsManager.performSafetyCheck(
  "wallet_1",
  0.1, // SOL amount
  "automation_1"
)

if (!safetyCheck.passed) {
  console.log("Errors:", safetyCheck.errors)
  console.log("Warnings:", safetyCheck.warnings)
  console.log("Recommendations:", safetyCheck.recommendations)
}
```

## 🛡️ Safety Features

### Spending Caps
- **Daily Cap**: Maximum SOL spent per day per wallet
- **Per-Bundle Cap**: Maximum single bundle size
- **Auto-Reset**: Daily caps reset at midnight UTC
- **Reservation System**: Amounts reserved before execution, released on failure

### Rate Limiting
- **Cooldown**: Minimum time between executions
- **Per-Minute Limit**: Maximum executions per minute
- **Exponential Backoff**: Automatic retry with increasing delays

### Guard Checks
- **Price Impact**: Maximum acceptable price impact
- **Liquidity**: Minimum LP requirements
- **Authority**: Mint/freeze authority validation
- **Output Protection**: Minimum output amount guarantees

## 🔌 API Endpoints

### Bundle Operations
```
POST /api/bundles/prepare     # Prepare unsigned transactions
POST /api/bundles/relay       # Relay signed transactions to Jito
POST /api/bundles/simulate    # Simulate bundle execution
GET  /api/bundles/stats       # Get execution statistics
```

### Bundler Automations
```
GET    /api/bundlers          # List all bundler automations
POST   /api/bundlers          # Create new bundler
PATCH  /api/bundlers/:id      # Update bundler
DELETE /api/bundlers/:id      # Delete bundler
GET    /api/bundlers/:id/logs # Get execution logs
```

## 🎯 Preset Recipes

### Snipe Safe
```typescript
[
  { kind: "approve", program: "token" },
  { kind: "buy", route: "raydium", amountSol: 0.2 },
  { kind: "guard", minOutPct: 98, maxImpactPct: 3, minLp: 1000 }
]
```

### Copy Mirror
```typescript
[
  { kind: "approve", program: "token" },
  { kind: "buy", route: "jupiter", pctCap: 5 }, // 5% of source
  { kind: "guard", minOutPct: 95, maxImpactPct: 5 }
]
```

### Buy + OCO (One-Cancels-Other)
```typescript
[
  { kind: "approve", program: "token" },
  { kind: "buy", route: "jupiter", amountSol: 0.1 },
  { kind: "guard", minOutPct: 95, maxImpactPct: 5 },
  { kind: "list", tpPct: 12, slPct: 6 }
]
```

## 🚨 Error Handling

### Common Error Types
- `BUNDLE_TOO_LARGE`: More than 5 transactions per bundle
- `CAP_EXCEEDED`: Daily or per-bundle cap exceeded
- `ROUTE_UNAVAILABLE`: No safe trading route found
- `RELAY_REJECTED`: Jito relay refused the bundle
- `AUTHORITY_CHANGED`: Mint/freeze authority changed
- `RATE_LIMITED`: Too many executions in time window

### Auto-Recovery
- **Retry Logic**: Automatic retries with exponential backoff
- **Cap Release**: Reserved amounts released on failure
- **Auto-Pause**: Automations paused after consecutive failures
- **Graceful Degradation**: Fallback to single transactions if bundling fails

## 🔧 Configuration

### Environment Variables
```bash
# Jito Configuration
JITO_RELAY_URL=https://mainnet.block-engine.jito.wtf
JITO_TIP_ACCOUNT=96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5

# Rate Limiting
BUNDLE_RATE_LIMIT_MS=500
MAX_BUNDLES_PER_MINUTE=2

# Safety Defaults
DEFAULT_DAILY_CAP_SOL=3.0
DEFAULT_PER_BUNDLE_CAP_SOL=0.5
DEFAULT_COOLDOWN_SEC=30
```

### Wallet Configuration
```typescript
// Initialize with custom caps
capsManager.initializeWalletCap("wallet_1", 5.0, 1.0) // 5 SOL daily, 1 SOL per bundle

// Update rate limits
capsManager.updateRateLimit("wallet_1", {
  cooldownMs: 60000, // 1 minute cooldown
  maxExecutionsPerMinute: 1
})
```

## 🧪 Testing

### Demo Component
The `BundlerDemo` component provides a complete testing interface:
- Initialize integration with mock wallets
- Execute sample bundles
- View safety checks and statistics
- Test simulation functionality

### Mock Services
All services include mock implementations for development:
- `MockBundleAPI`: Simulates backend responses
- `MockWalletSigner`: Simulates local signing
- `MockConnection`: Simulates Solana connection

## 🚀 Getting Started

1. **Initialize Integration**:
```typescript
const integration = initializeBundlerIntegration({
  connection: new Connection("https://api.mainnet-beta.solana.com"),
  useMockAPI: true, // Set to false for production
  enableSafetyChecks: true
})
```

2. **Register Wallets**:
```typescript
await integration.initialize(wallets)
```

3. **Create Bundler**:
```typescript
// Use the BundlerForm component or API directly
const bundler = await bundleAPI.createBundler({
  walletId: "wallet_1",
  trigger: { mode: "manual" },
  recipe: [...],
  limits: {...},
  exec: {...}
})
```

4. **Execute Bundle**:
```typescript
const result = await integration.executeBundlerAutomation(
  context,
  recipe,
  execParams
)
```

## 📊 Monitoring

### Statistics
- Total bundles executed
- Success/failure rates
- Average execution time
- Total fees spent
- Cap utilization

### Logs
- Execution events
- Safety check results
- Error details
- Performance metrics

### Alerts
- Cap threshold warnings
- Rate limit violations
- Execution failures
- Authority changes

This implementation provides a production-ready bundler system that integrates seamlessly with your existing Caesarbot architecture while maintaining the highest standards of safety and reliability.
