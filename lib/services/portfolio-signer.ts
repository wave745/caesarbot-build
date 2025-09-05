/**
 * PortfolioSigner - Local signing service for wallet operations
 * 
 * This service handles local signing of transactions using wallet keys
 * stored in the Portfolio. It never exposes private keys and provides
 * a clean interface for signing transaction bundles.
 */

// Mock Solana types for development
interface Connection {
  // Mock connection interface - placeholder for Solana connection
  rpcEndpoint?: string;
}

interface PublicKey {
  toString(): string
}

interface Transaction {
  serialize(options?: { requireAllSignatures?: boolean; verifySignatures?: boolean }): Buffer
}

interface VersionedTransaction {
  serialize(options?: { requireAllSignatures?: boolean; verifySignatures?: boolean }): Buffer
}

// Mock implementations
const MockConnection = class MockConnection implements Connection {}
const MockPublicKey = class MockPublicKey implements PublicKey {
  constructor(public address: string) {}
  toString() { return this.address }
}
const MockTransaction = class MockTransaction implements Transaction {
  serialize() { return Buffer.from('mock-tx') }
}
const MockVersionedTransaction = class MockVersionedTransaction implements VersionedTransaction {
  serialize() { return Buffer.from('mock-versioned-tx') }
}

// Export mock types
export { MockConnection as Connection, MockPublicKey as PublicKey, MockTransaction as Transaction, MockVersionedTransaction as VersionedTransaction }
import { WalletInfo } from '@/lib/types/automation'

export interface SigningResult {
  success: boolean
  signedTxs?: string[]
  error?: string
}

export interface WalletSigner {
  walletId: string
  publicKey: PublicKey
  signTransaction: (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  signAllTransactions: (txs: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>
}

export class PortfolioSigner {
  private connection: Connection
  private walletSigners: Map<string, WalletSigner> = new Map()

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Register a wallet signer for a specific wallet ID
   */
  registerWalletSigner(walletId: string, signer: WalletSigner): void {
    this.walletSigners.set(walletId, signer)
  }

  /**
   * Get a signer for a specific wallet ID
   */
  getSigner(walletId: string): WalletSigner | null {
    return this.walletSigners.get(walletId) || null
  }

  /**
   * Sign a single transaction using the specified wallet
   */
  async signTransaction(walletId: string, tx: Transaction | VersionedTransaction): Promise<SigningResult> {
    try {
      const signer = this.getSigner(walletId)
      if (!signer) {
        return {
          success: false,
          error: `No signer found for wallet ${walletId}`
        }
      }

      const signedTx = await signer.signTransaction(tx)
      const serialized = signedTx.serialize({ requireAllSignatures: false })
      const base58 = serialized.toString('base64')

      return {
        success: true,
        signedTxs: [base58]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown signing error'
      }
    }
  }

  /**
   * Sign multiple transactions using the specified wallet
   */
  async signAllTransactions(walletId: string, txs: (Transaction | VersionedTransaction)[]): Promise<SigningResult> {
    try {
      const signer = this.getSigner(walletId)
      if (!signer) {
        return {
          success: false,
          error: `No signer found for wallet ${walletId}`
        }
      }

      const signedTxs = await signer.signAllTransactions(txs)
      const serialized = signedTxs.map(tx => {
        const serialized = tx.serialize({ requireAllSignatures: false })
        return serialized.toString('base64')
      })

      return {
        success: true,
        signedTxs: serialized
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown signing error'
      }
    }
  }

  /**
   * Sign base58 encoded transactions (convenience method)
   */
  async signBase58(walletId: string, txsBase58: string[]): Promise<SigningResult> {
    try {
      const signer = this.getSigner(walletId)
      if (!signer) {
        return {
          success: false,
          error: `No signer found for wallet ${walletId}`
        }
      }

      // Parse base58 transactions
      const txs = txsBase58.map(base58 => {
        const buffer = Buffer.from(base58, 'base64')
        return new MockTransaction()
      })

      return await this.signAllTransactions(walletId, txs)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse or sign transactions'
      }
    }
  }

  /**
   * Check if a wallet signer is available
   */
  hasSigner(walletId: string): boolean {
    return this.walletSigners.has(walletId)
  }

  /**
   * Get all registered wallet IDs
   */
  getRegisteredWallets(): string[] {
    return Array.from(this.walletSigners.keys())
  }

  /**
   * Remove a wallet signer
   */
  removeWalletSigner(walletId: string): void {
    this.walletSigners.delete(walletId)
  }

  /**
   * Clear all wallet signers
   */
  clearAllSigners(): void {
    this.walletSigners.clear()
  }
}

// Singleton instance
let portfolioSignerInstance: PortfolioSigner | null = null

export function getPortfolioSigner(connection?: Connection): PortfolioSigner {
  if (!portfolioSignerInstance) {
    if (!connection) {
      throw new Error('Connection required to initialize PortfolioSigner')
    }
    portfolioSignerInstance = new PortfolioSigner(connection)
  }
  return portfolioSignerInstance
}

// Mock wallet signer for development/testing
export class MockWalletSigner implements WalletSigner {
  constructor(
    public walletId: string,
    public publicKey: PublicKey
  ) {}

  async signTransaction(tx: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction> {
    // Mock signing - in real implementation, this would use actual wallet
    console.log(`Mock signing transaction for wallet ${this.walletId}`)
    return tx
  }

  async signAllTransactions(txs: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]> {
    // Mock signing - in real implementation, this would use actual wallet
    console.log(`Mock signing ${txs.length} transactions for wallet ${this.walletId}`)
    return txs
  }
}

// Helper function to create a mock signer for development
export function createMockSigner(walletId: string, publicKey: PublicKey): MockWalletSigner {
  return new MockWalletSigner(walletId, publicKey)
}
