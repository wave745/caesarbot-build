"use client"

import { useState, useEffect } from "react"
import { X, Target, Zap, Plus, Trash2, Package } from "lucide-react"
import { useSniperStore } from "@/stores/sniper"
import { AutomationAPI } from "@/lib/services/automation-api"
import { Automation } from "@/lib/types/automation"
import { Button } from "@/components/ui/button"
import { CopyTradingForm } from "@/components/copy-trading-form"
import { SnipeForm } from "@/components/snipe-form"
import { BundlerForm } from "@/components/bundler-form"

interface AutomationModalProps {
  mode: "create" | "edit" | "duplicate"
  automation?: Automation | null
  onClose: () => void
}

export function AutomationModal({ mode, automation, onClose }: AutomationModalProps) {
  const { activeTab, setActiveTab, createAutomation, updateAutomation } = useSniperStore()
  const [currentTab, setCurrentTab] = useState<"copy" | "snipe" | "bundler">(activeTab)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set initial tab based on automation mode
  useEffect(() => {
    if (automation) {
      setCurrentTab(automation.mode)
    } else {
      setCurrentTab(activeTab)
    }
  }, [automation, activeTab])

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    
    try {
      const automationData: Omit<Automation, "id" | "createdAt"> = {
        mode: currentTab,
        walletId: formData.walletId,
        status: "active",
        expiresAt: formData.expiresAt,
        exec: {
          expiresInSec: formData.exec.expiresInSec,
          prio: formData.exec.prio,
          tip: formData.exec.tip,
          slippage: formData.exec.slippage,
          mev: formData.exec.mev
        },
        ...(currentTab === "copy" ? {
          copy: formData.copy
        } : currentTab === "snipe" ? {
          snipe: formData.snipe
        } : {
          bundler: formData.bundler
        })
      }

      if (mode === "create" || mode === "duplicate") {
        createAutomation(automationData)
      } else if (mode === "edit" && automation) {
        updateAutomation(automation.id, automationData)
      }

      onClose()
    } catch (error) {
      console.error("Failed to save automation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "New Automation"
      case "edit":
        return "Edit Automation"
      case "duplicate":
        return "Duplicate Automation"
      default:
        return "Automation"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="cb-panel w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--cb-border)" }}>
          <h2 className="text-xl font-semibold" style={{ color: "var(--cb-text)" }}>
            {getTitle()}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--cb-border)" }}>
          <button
            onClick={() => setCurrentTab("copy")}
            className={`cb-tab flex-1 flex items-center justify-center gap-2 ${
              currentTab === "copy" ? 'cb-tab[aria-selected="true"]' : ''
            }`}
            aria-selected={currentTab === "copy"}
          >
            <Target className="w-4 h-4" />
            Copy Trading
          </button>
          <button
            onClick={() => setCurrentTab("snipe")}
            className={`cb-tab flex-1 flex items-center justify-center gap-2 ${
              currentTab === "snipe" ? 'cb-tab[aria-selected="true"]' : ''
            }`}
            aria-selected={currentTab === "snipe"}
          >
            <Zap className="w-4 h-4" />
            Sniper
          </button>
          <button
            onClick={() => setCurrentTab("bundler")}
            className={`cb-tab flex-1 flex items-center justify-center gap-2 ${
              currentTab === "bundler" ? 'cb-tab[aria-selected="true"]' : ''
            }`}
            aria-selected={currentTab === "bundler"}
          >
            <Package className="w-4 h-4" />
            Bundler
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentTab === "copy" ? (
            <CopyTradingForm
              automation={automation}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onClose={onClose}
            />
          ) : currentTab === "snipe" ? (
            <SnipeForm
              automation={automation}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onClose={onClose}
            />
          ) : (
            <BundlerForm
              automation={automation}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
