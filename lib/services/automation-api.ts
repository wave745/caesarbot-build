import { Automation, AutomationLog, WalletInfo, TargetWalletStats } from "@/lib/types/automation"
import { SniperMockData } from "@/lib/mock-data/sniper-mock-data"

// API service for automations
export class AutomationAPI {
  private static baseUrl = "/api/automations"
  
  // CRUD Operations
  static async getAutomations(): Promise<Automation[]> {
    try {
      // For now, return mock data instead of making API calls
      // TODO: Replace with real API calls when backend is ready
      const mockAutomations = SniperMockData.generateAutomations(8);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return mockAutomations;
    } catch (error) {
      console.error("Error fetching automations:", error)
      return []
    }
  }
  
  static async createAutomation(automation: Omit<Automation, "id" | "createdAt">): Promise<Automation> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(automation)
      })
      if (!response.ok) {
        throw new Error(`Failed to create automation: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error creating automation:", error)
      throw error
    }
  }
  
  static async updateAutomation(id: string, updates: Partial<Automation>): Promise<Automation> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      if (!response.ok) {
        throw new Error(`Failed to update automation: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error updating automation:", error)
      throw error
    }
  }
  
  static async deleteAutomation(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error(`Failed to delete automation: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error deleting automation:", error)
      throw error
    }
  }
  
  static async getAutomation(id: string): Promise<Automation> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch automation: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching automation:", error)
      throw error
    }
  }
  
  // Simulation
  static async simulateAutomation(automation: Automation): Promise<{
    route: any
    priceImpact: number
    ok: boolean
    reason?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${automation.id}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(automation)
      })
      if (!response.ok) {
        throw new Error(`Failed to simulate automation: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error simulating automation:", error)
      throw error
    }
  }
  
  // Logs
  static async getAutomationLogs(automationId: string): Promise<AutomationLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${automationId}/logs`)
      if (!response.ok) {
        throw new Error(`Failed to fetch automation logs: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching automation logs:", error)
      return []
    }
  }
  
  // Wallets
  static async getWallets(): Promise<WalletInfo[]> {
    try {
      // For now, return mock data instead of making API calls
      // TODO: Replace with real API calls when backend is ready
      const mockWallets = SniperMockData.generateWallets(5);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockWallets;
    } catch (error) {
      console.error("Error fetching wallets:", error)
      return []
    }
  }
  
  // Target wallet stats
  static async getTargetWalletStats(address: string): Promise<TargetWalletStats> {
    try {
      // For now, return mock data instead of making API calls
      // TODO: Replace with real API calls when backend is ready
      const mockStats = SniperMockData.generateTargetWalletStats(address);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockStats;
    } catch (error) {
      console.error("Error fetching wallet stats:", error)
      throw error
    }
  }
}
