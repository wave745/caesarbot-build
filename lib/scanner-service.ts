import { TokenRow } from "@/stores/scanner";
import { SolanaScannerService } from "@/lib/services/solana-scanner";
import { SimpleScannerService } from "@/lib/services/simple-scanner";

// Service layer for scanner data
export class ScannerService {
  private static instance: ScannerService
  private solanaService: SolanaScannerService;
  private simpleService: SimpleScannerService;

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  constructor() {
    this.solanaService = SolanaScannerService.getInstance();
    this.simpleService = SimpleScannerService.getInstance();
  }

  // Search for a Solana token by contract address
  async searchToken(query: string): Promise<TokenRow | null> {
    try {
      // Validate if it's a Solana contract address
      if (!this.isValidSolanaAddress(query)) {
        throw new Error("Invalid Solana address format");
      }

      // Try Solana service first, fallback to simple service
      try {
        const token = await this.solanaService.searchToken(query);
        return token;
      } catch (error) {
        console.warn("Solana service failed, using simple service:", error);
        const token = await this.simpleService.searchToken(query);
        return token;
      }
    } catch (error) {
      console.error("Error searching token:", error);
      return null;
    }
  }

  // Get tokens (not used in Solana scanner - we search by contract address)
  async getTokens(filters?: any): Promise<TokenRow[]> {
    return [];
  }

  // Execute CaesarX command
  async executeCommand(command: string, contractAddress: string): Promise<any> {
    try {
      return await this.solanaService.executeCommand(command, contractAddress);
    } catch (error) {
      console.warn("Solana service command failed, using simple service:", error);
      return await this.simpleService.executeCommand(command, contractAddress);
    }
  }

  // Get available commands
  getAvailableCommands() {
    try {
      return this.solanaService.getAvailableCommands();
    } catch (error) {
      console.warn("Solana service commands failed, using simple service:", error);
      return this.simpleService.getAvailableCommands();
    }
  }

  // Validate Solana address
  private isValidSolanaAddress(address: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }
}

// Service instance ready for real data integration
const scannerService = ScannerService.getInstance();
export default scannerService;