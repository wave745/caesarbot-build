"use client"

import { useState, useEffect } from "react"
import { Plus, Target, Zap, Pause, Play, Edit, Copy, Trash2, FileText, Settings } from "lucide-react"
import { useSniperStore } from "@/stores/sniper"
import { AutomationAPI } from "@/lib/services/automation-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AutomationModal } from "@/components/automation-modal"
import { LogsModal } from "@/components/logs-modal"

export function SniperContent() {
  const {
    automations,
    activeTab,
    isModalOpen,
    modalMode,
    selectedAutomation,
    dailyCapUsed,
    dailyCapLimit,
    isArmed,
    isDryRun,
    wallets,
    setActiveTab,
    openModal,
    closeModal,
    setWallets,
    setAutomations,
    setSelectedAutomation,
    pauseAutomation,
    resumeAutomation,
    deleteAutomation,
    setArmed,
    setDryRun
  } = useSniperStore()

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [selectedAutomationForLogs, setSelectedAutomationForLogs] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [automationsData, walletsData] = await Promise.all([
          AutomationAPI.getAutomations(),
          AutomationAPI.getWallets()
        ])
        
        // Update store with loaded data
        setWallets(walletsData)
        setAutomations(automationsData)
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }
    
    loadData()
  }, [setWallets, setAutomations])

  const handleCreateAutomation = () => {
    openModal("create")
  }

  const handleEditAutomation = (automation: any) => {
    setSelectedAutomation(automation)
    openModal("edit", automation)
  }

  const handleDuplicateAutomation = (automation: any) => {
    setSelectedAutomation(automation)
    openModal("duplicate", automation)
  }

  const handleViewLogs = (automationId: string) => {
    setSelectedAutomationForLogs(automationId)
    setIsLogsModalOpen(true)
  }

  const handleDeleteAutomation = async (id: string) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      try {
        await AutomationAPI.deleteAutomation(id)
        deleteAutomation(id)
      } catch (error) {
        console.error("Failed to delete automation:", error)
      }
    }
  }

  const handleToggleAutomation = async (automation: any) => {
    try {
      if (automation.status === "active") {
        pauseAutomation(automation.id)
      } else {
        resumeAutomation(automation.id)
      }
    } catch (error) {
      console.error("Failed to toggle automation:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="READY">Active</Badge>
      case "paused":
        return <Badge variant="PENDING">Paused</Badge>
      case "expired":
        return <Badge variant="BLOCKER">Expired</Badge>
      default:
        return <Badge variant="INFO">Unknown</Badge>
    }
  }

  const getModeIcon = (mode: string) => {
    return mode === "copy" ? <Target className="w-4 h-4" /> : <Zap className="w-4 h-4" />
  }

  const getModeLabel = (mode: string) => {
    return mode === "copy" ? "Copy Trading" : "Pumpfun Snipe"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--cb-text)" }}>
            Sniper Automations
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--cb-subtext)" }}>
            Auto-execute high-probability entries with strict risk limits
          </p>
        </div>
        
        <Button 
          onClick={handleCreateAutomation}
          variant="gold"
        >
          <Plus className="w-4 h-4" />
          New Automation
        </Button>
      </div>

      {/* Global Controls */}
      <div className="cb-panel p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--cb-subtext)" }}>Daily Cap:</span>
            <span className="text-sm font-medium" style={{ color: "var(--cb-text)" }}>
              {dailyCapUsed.toFixed(2)} / {dailyCapLimit} SOL
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--cb-subtext)" }}>Status:</span>
            <button
              onClick={() => setArmed(!isArmed)}
              className={`cb-chip px-3 py-1 text-xs ${isArmed ? 'cb-chip[data-on="true"]' : ''}`}
              data-on={isArmed}
            >
              {isArmed ? "Armed" : "Disarmed"}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--cb-subtext)" }}>Mode:</span>
            <button
              onClick={() => setDryRun(!isDryRun)}
              className={`cb-chip px-3 py-1 text-xs ${isDryRun ? 'cb-chip[data-on="true"]' : ''}`}
              data-on={isDryRun}
            >
              {isDryRun ? "Dry Run" : "Live"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b" style={{ borderColor: "var(--cb-border)" }}>
        <button
          onClick={() => setActiveTab("copy")}
          className={`cb-tab ${activeTab === "copy" ? 'cb-tab[aria-selected="true"]' : ''}`}
          aria-selected={activeTab === "copy"}
        >
          <Target className="w-4 h-4 mr-2 inline" />
          Copy Trading
        </button>
        <button
          onClick={() => setActiveTab("snipe")}
          className={`cb-tab ${activeTab === "snipe" ? 'cb-tab[aria-selected="true"]' : ''}`}
          aria-selected={activeTab === "snipe"}
        >
          <Zap className="w-4 h-4 mr-2 inline" />
          Pumpfun Snipes
        </button>
      </div>

      {/* Automations Table */}
      <div className="cb-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "rgba(24,24,27,.6)" }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--cb-subtext)" }}>
                  Automation
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--cb-subtext)" }}>
                  Wallet
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--cb-subtext)" }}>
                  Settings
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--cb-subtext)" }}>
                  Expires
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--cb-subtext)" }}>
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--cb-subtext)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {automations
                .filter(automation => automation.mode === activeTab)
                .map((automation) => {
                  const wallet = wallets.find(w => w.id === automation.walletId)
                  const expiresAt = automation.expiresAt ? new Date(automation.expiresAt) : null
                  
                  return (
                    <tr 
                      key={automation.id}
                      className="hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: "rgba(24,24,27,.35)",
                        borderBottom: "1px solid var(--cb-border)"
                      }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getModeIcon(automation.mode)}
                          <div>
                            <div className="text-sm font-medium" style={{ color: "var(--cb-text)" }}>
                              {getModeLabel(automation.mode)}
                            </div>
                            <div className="text-xs" style={{ color: "var(--cb-subtext)" }}>
                              {automation.mode === "copy" 
                                ? `Target: ${automation.copy?.target?.slice(0, 8)}...`
                                : `${automation.snipe?.tickers?.length || 0} ticker filters`
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm" style={{ color: "var(--cb-text)" }}>
                          {wallet?.name || "Unknown"}
                        </div>
                        <div className="text-xs" style={{ color: "var(--cb-subtext)" }}>
                          {wallet?.balance?.toFixed(2)} SOL
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-xs space-y-1" style={{ color: "var(--cb-subtext)" }}>
                          {automation.mode === "copy" ? (
                            <>
                              <div>Max: {automation.copy?.limits?.maxSingleBuy} SOL</div>
                              <div>Buy%: {automation.copy?.buy?.buyPercent}%</div>
                              <div>MEV: {automation.exec.mev ? "ON" : "OFF"}</div>
                            </>
                          ) : (
                            <>
                              <div>Budget: {automation.snipe?.budgetSol} SOL</div>
                              <div>Max Snipes: {automation.snipe?.maxSnipes}</div>
                              <div>MEV: {automation.exec.mev ? "ON" : "OFF"}</div>
                            </>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm" style={{ color: "var(--cb-text)" }}>
                          {expiresAt ? expiresAt.toLocaleDateString() : "Never"}
                        </div>
                        <div className="text-xs" style={{ color: "var(--cb-subtext)" }}>
                          {expiresAt ? `${Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)}d left` : ""}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {getStatusBadge(automation.status)}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleAutomation(automation)}
                            className="p-1 h-8 w-8"
                          >
                            {automation.status === "active" ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAutomation(automation)}
                            className="p-1 h-8 w-8"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicateAutomation(automation)}
                            className="p-1 h-8 w-8"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewLogs(automation.id)}
                            className="p-1 h-8 w-8"
                          >
                            <FileText className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAutomation(automation.id)}
                            className="p-1 h-8 w-8 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          
          {automations.filter(automation => automation.mode === activeTab).length === 0 && (
            <div className="p-8 text-center">
              <div className="text-lg mb-2" style={{ color: "var(--cb-subtext)" }}>
                No {activeTab === "copy" ? "copy trading" : "snipe"} automations yet
              </div>
              <div className="text-sm mb-4" style={{ color: "var(--cb-subtext)" }}>
                Create your first automation to start auto-trading
              </div>
              <Button 
                onClick={handleCreateAutomation}
                variant="gold"
              >
                <Plus className="w-4 h-4" />
                Create Automation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <AutomationModal
          mode={modalMode}
          automation={selectedAutomation}
          onClose={closeModal}
        />
      )}
      
      {isLogsModalOpen && selectedAutomationForLogs && (
        <LogsModal
          automationId={selectedAutomationForLogs}
          onClose={() => {
            setIsLogsModalOpen(false)
            setSelectedAutomationForLogs(null)
          }}
        />
      )}
    </div>
  )
}
