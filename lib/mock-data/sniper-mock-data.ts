import { Automation, AutomationLog, WalletInfo, TargetWalletStats } from "@/lib/types/automation";

// Mock data generator for sniper page
export class SniperMockData {
  private static walletNames = [
    "Main Wallet", "Trading Wallet", "Sniper Wallet", "Copy Wallet", "Backup Wallet",
    "Whale Wallet", "Early Wallet", "KOL Wallet", "Test Wallet", "Dev Wallet"
  ];

  private static targetWallets = [
    "0x1234567890abcdef1234567890abcdef12345678",
    "0xabcdef1234567890abcdef1234567890abcdef12",
    "0x9876543210fedcba9876543210fedcba98765432",
    "0xfedcba0987654321fedcba0987654321fedcba09",
    "0x1111222233334444555566667777888899990000"
  ];

  private static automationNames = [
    "Copy Whale #1", "Early Sniper", "KOL Tracker", "Volume Hunter", "Launchpad Sniper",
    "Bundle Master", "Risk Averse", "Aggressive Copy", "Conservative Copy", "Meme Hunter"
  ];

  private static generateWalletAddress(): string {
    const chars = "0123456789abcdef";
    let result = "0x";
    for (let i = 0; i < 40; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  static generateWallet(): WalletInfo {
    const name = this.walletNames[Math.floor(Math.random() * this.walletNames.length)];
    const balance = Math.random() * 50 + 0.1; // 0.1 - 50 SOL
    
    return {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: this.generateWalletAddress(),
      balance: Number(balance.toFixed(4)),
      name
    };
  }

  static generateWallets(count: number = 5): WalletInfo[] {
    return Array.from({ length: count }, () => this.generateWallet());
  }

  static generateTargetWalletStats(address: string): TargetWalletStats {
    return {
      address,
      winrate: Math.random() * 0.4 + 0.3, // 30-70% winrate
      pnl7d: (Math.random() - 0.3) * 100, // -30% to +70% PnL
      avgSize: Math.random() * 10 + 0.5, // 0.5 - 10.5 SOL average
      totalTrades: Math.floor(Math.random() * 100) + 10 // 10-110 trades
    };
  }

  static generateCopyAutomation(): Automation {
    const target = this.targetWallets[Math.floor(Math.random() * this.targetWallets.length)];
    const name = this.automationNames[Math.floor(Math.random() * this.automationNames.length)];
    
    return {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mode: "copy",
      walletId: `wallet_${Math.random().toString(36).substr(2, 9)}`,
      status: Math.random() > 0.3 ? "active" : "paused",
      createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last 7 days
      exec: {
        expiresInSec: 30,
        prio: Math.floor(Math.random() * 3) + 1, // 1-3 priority
        tip: Math.random() * 0.01, // 0-0.01 SOL tip
        slippage: Math.random() * 0.1 + 0.05, // 5-15% slippage
        mev: Math.random() > 0.5
      },
      copy: {
        target,
        limits: {
          maxSingleBuy: Math.random() * 5 + 0.5, // 0.5-5.5 SOL
          maxPerToken: Math.random() * 10 + 1 // 1-11 SOL
        },
        buy: {
          once: Math.random() > 0.5,
          skipLaunchpads: Math.random() > 0.3,
          mcapMin: Math.random() * 100000 + 10000, // 10K-110K
          mcapMax: Math.random() * 10000000 + 1000000, // 1M-11M
          buyPercent: Math.random() * 0.1 + 0.01, // 1-11%
          minBuySize: Math.random() * 0.5 + 0.1, // 0.1-0.6 SOL
          mintAuthDisabled: Math.random() > 0.5,
          freezeAuthDisabled: Math.random() > 0.5,
          devPct: {
            min: Math.random() * 0.1,
            max: Math.random() * 0.3 + 0.1
          },
          top10Pct: {
            min: Math.random() * 0.2,
            max: Math.random() * 0.5 + 0.2
          },
          tokenAgeMin: Math.random() * 24, // 0-24 hours
          tokenAgeMax: Math.random() * 168 + 24, // 24-192 hours
          holdersMin: Math.random() * 100 + 10, // 10-110 holders
          holdersMax: Math.random() * 1000 + 100, // 100-1100 holders
          minDevFund: Math.random() * 10 + 1, // 1-11 SOL
          devFundSource: ["any", "cex", "dex", "fresh"][Math.floor(Math.random() * 4)] as any
        },
        sell: {
          copySells: Math.random() > 0.5
        }
      }
    };
  }

  static generateSnipeAutomation(): Automation {
    const name = this.automationNames[Math.floor(Math.random() * this.automationNames.length)];
    
    return {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mode: "snipe",
      walletId: `wallet_${Math.random().toString(36).substr(2, 9)}`,
      status: Math.random() > 0.3 ? "active" : "paused",
      createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      exec: {
        expiresInSec: 30,
        prio: Math.floor(Math.random() * 3) + 1,
        tip: Math.random() * 0.01,
        slippage: Math.random() * 0.1 + 0.05,
        mev: Math.random() > 0.5
      },
      snipe: {
        tickers: [
          { value: "PEPE", op: "eq" as const },
          { value: "BONK", op: "eq" as const },
          { value: "WIF", op: "eq" as const }
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        budgetSol: Math.random() * 20 + 5, // 5-25 SOL
        maxSpendSol: Math.random() * 5 + 1, // 1-6 SOL per snipe
        maxSnipes: Math.floor(Math.random() * 10) + 1, // 1-11 snipes
        hasSocials: Math.random() > 0.5,
        devParams: {
          tokensCreated: {
            min: Math.floor(Math.random() * 5),
            max: Math.floor(Math.random() * 20) + 5
          },
          bondedCount: {
            min: Math.floor(Math.random() * 10),
            max: Math.floor(Math.random() * 50) + 10
          },
          creatorBuy: {
            min: Math.random() * 5,
            max: Math.random() * 20 + 5
          },
          bundleBuy: {
            min: Math.random() * 2,
            max: Math.random() * 10 + 2
          }
        },
        blacklist: ["SCAM", "FAKE", "RUG"].slice(0, Math.floor(Math.random() * 3)),
        whitelist: ["PEPE", "BONK", "WIF"].slice(0, Math.floor(Math.random() * 3))
      }
    };
  }

  static generateBundlerAutomation(): Automation {
    const name = this.automationNames[Math.floor(Math.random() * this.automationNames.length)];
    
    return {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mode: "bundler",
      walletId: `wallet_${Math.random().toString(36).substr(2, 9)}`,
      status: Math.random() > 0.3 ? "active" : "paused",
      createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      exec: {
        expiresInSec: 30,
        prio: Math.floor(Math.random() * 3) + 1,
        tip: Math.random() * 0.01,
        slippage: Math.random() * 0.1 + 0.05,
        mev: Math.random() > 0.5
      },
      bundler: {
        trigger: Math.random() > 0.5 
          ? { mode: "manual" }
          : { 
              mode: "signal", 
              type: ["liquidity_add", "trading_enabled", "ticker", "copy_wallet_buy", "volume_spike"][Math.floor(Math.random() * 5)] as any,
              args: { threshold: Math.random() * 1000000 + 100000 }
            },
        recipe: [
          { kind: "approve", program: "token" },
          { kind: "buy", route: "raydium", amountSol: Math.random() * 5 + 1 },
          { kind: "guard", minOutPct: 0.8, maxImpactPct: 0.1, minLp: 10000 },
          { kind: "list", tpPct: 0.5, slPct: 0.2 }
        ],
        limits: {
          maxSol: Math.random() * 20 + 5, // 5-25 SOL
          retries: Math.floor(Math.random() * 5) + 1, // 1-6 retries
          cooldownSec: Math.floor(Math.random() * 300) + 60, // 60-360 seconds
          dailyCap: Math.random() * 50 + 10 // 10-60 SOL daily cap
        }
      }
    };
  }

  static generateAutomations(count: number = 10): Automation[] {
    const automations: Automation[] = [];
    
    for (let i = 0; i < count; i++) {
      const mode = ["copy", "snipe", "bundler"][Math.floor(Math.random() * 3)] as "copy" | "snipe" | "bundler";
      
      switch (mode) {
        case "copy":
          automations.push(this.generateCopyAutomation());
          break;
        case "snipe":
          automations.push(this.generateSnipeAutomation());
          break;
        case "bundler":
          automations.push(this.generateBundlerAutomation());
          break;
      }
    }
    
    return automations;
  }

  static generateAutomationLog(automationId: string): AutomationLog {
    const types: AutomationLog["type"][] = [
      "trigger", "gate_check", "route_build", "order_sent", 
      "order_confirmed", "order_failed", "auto_pause"
    ];
    
    const messages = [
      "Automation triggered by signal",
      "Gate check passed - token meets criteria",
      "Route built successfully via Jupiter",
      "Order sent to mempool",
      "Order confirmed on-chain",
      "Order failed - insufficient liquidity",
      "Automation paused due to daily cap reached",
      "Target wallet made a buy - copying trade",
      "Snipe target detected - executing buy",
      "Bundle transaction prepared",
      "MEV protection enabled",
      "Slippage exceeded - order cancelled"
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      automationId,
      timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Last 24 hours
      type,
      message,
      data: {
        token: "PEPE",
        amount: Math.random() * 5 + 0.1,
        price: Math.random() * 0.01 + 0.001,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      }
    };
  }

  static generateAutomationLogs(automationId: string, count: number = 20): AutomationLog[] {
    return Array.from({ length: count }, () => this.generateAutomationLog(automationId));
  }

  static generateAllLogs(automationIds: string[]): AutomationLog[] {
    const allLogs: AutomationLog[] = [];
    
    automationIds.forEach(id => {
      const logCount = Math.floor(Math.random() * 15) + 5; // 5-20 logs per automation
      allLogs.push(...this.generateAutomationLogs(id, logCount));
    });
    
    return allLogs.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
  }
}
