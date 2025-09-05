"use client"

import { create } from "zustand"
import { Automation, AutomationLog, WalletInfo, TargetWalletStats } from "@/lib/types/automation"

interface SniperState {
  // Automations
  automations: Automation[]
  selectedAutomation: Automation | null
  
  // UI State
  activeTab: "copy" | "snipe" | "bundler"
  isModalOpen: boolean
  modalMode: "create" | "edit" | "duplicate"
  
  // Global Controls
  dailyCapUsed: number
  dailyCapLimit: number
  isArmed: boolean
  isDryRun: boolean
  
  // Wallets
  wallets: WalletInfo[]
  selectedWallet: WalletInfo | null
  
  // Target wallet stats (for copy trading)
  targetStats: Record<string, TargetWalletStats>
  
  // Logs
  logs: AutomationLog[]
  
  // Actions
  setActiveTab: (tab: "copy" | "snipe" | "bundler") => void
  openModal: (mode: "create" | "edit" | "duplicate", automation?: Automation) => void
  closeModal: () => void
  setSelectedAutomation: (automation: Automation | null) => void
  
  // Automation CRUD
  setAutomations: (automations: Automation[]) => void
  createAutomation: (automation: Omit<Automation, "id" | "createdAt">) => void
  updateAutomation: (id: string, updates: Partial<Automation>) => void
  deleteAutomation: (id: string) => void
  pauseAutomation: (id: string) => void
  resumeAutomation: (id: string) => void
  
  // Global controls
  setArmed: (armed: boolean) => void
  setDryRun: (dryRun: boolean) => void
  setDailyCapLimit: (limit: number) => void
  
  // Wallets
  setWallets: (wallets: WalletInfo[]) => void
  setSelectedWallet: (wallet: WalletInfo | null) => void
  updateTargetStats: (address: string, stats: TargetWalletStats) => void
  
  // Logs
  addLog: (log: Omit<AutomationLog, "id">) => void
  getLogsForAutomation: (automationId: string) => AutomationLog[]
}

export const useSniperStore = create<SniperState>((set, get) => ({
  // Initial state
  automations: [],
  selectedAutomation: null,
  activeTab: "copy",
  isModalOpen: false,
  modalMode: "create",
  dailyCapUsed: 0,
  dailyCapLimit: 3, // 3 SOL default
  isArmed: false,
  isDryRun: false,
  wallets: [],
  selectedWallet: null,
  targetStats: {},
  logs: [],
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  openModal: (mode, automation) => set({ 
    isModalOpen: true, 
    modalMode: mode,
    selectedAutomation: automation || null 
  }),
  
  closeModal: () => set({ 
    isModalOpen: false, 
    selectedAutomation: null 
  }),
  
  setSelectedAutomation: (automation) => set({ selectedAutomation: automation }),
  
  setAutomations: (automations) => set({ automations }),
  
  createAutomation: (automationData) => {
    const newAutomation: Automation = {
      ...automationData,
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now()
    }
    set((state) => ({
      automations: [...state.automations, newAutomation]
    }))
  },
  
  updateAutomation: (id, updates) => set((state) => ({
    automations: state.automations.map(automation =>
      automation.id === id ? { ...automation, ...updates } : automation
    )
  })),
  
  deleteAutomation: (id) => set((state) => ({
    automations: state.automations.filter(automation => automation.id !== id)
  })),
  
  pauseAutomation: (id) => set((state) => ({
    automations: state.automations.map(automation =>
      automation.id === id ? { ...automation, status: "paused" as const } : automation
    )
  })),
  
  resumeAutomation: (id) => set((state) => ({
    automations: state.automations.map(automation =>
      automation.id === id ? { ...automation, status: "active" as const } : automation
    )
  })),
  
  setArmed: (armed) => set({ isArmed: armed }),
  setDryRun: (dryRun) => set({ isDryRun: dryRun }),
  setDailyCapLimit: (limit) => set({ dailyCapLimit: limit }),
  
  setWallets: (wallets) => set({ wallets }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  updateTargetStats: (address, stats) => set((state) => ({
    targetStats: { ...state.targetStats, [address]: stats }
  })),
  
  addLog: (logData) => {
    const newLog: AutomationLog = {
      ...logData,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    set((state) => ({
      logs: [...state.logs, newLog]
    }))
  },
  
  getLogsForAutomation: (automationId) => {
    return get().logs.filter(log => log.automationId === automationId)
  }
}))
