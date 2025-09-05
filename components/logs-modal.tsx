"use client"

import { useState, useEffect } from "react"
import { X, Clock, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { AutomationAPI } from "@/lib/services/automation-api"
import { AutomationLog } from "@/lib/types/automation"
import { Button } from "@/components/ui/button"

interface LogsModalProps {
  automationId: string
  onClose: () => void
}

export function LogsModal({ automationId, onClose }: LogsModalProps) {
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logsData = await AutomationAPI.getAutomationLogs(automationId)
        setLogs(logsData)
      } catch (error) {
        console.error("Failed to load logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [automationId])

  const getLogIcon = (type: string) => {
    switch (type) {
      case "trigger":
        return <Clock className="w-4 h-4" style={{ color: "var(--cb-info)" }} />
      case "gate_check":
        return <CheckCircle className="w-4 h-4" style={{ color: "var(--cb-ok)" }} />
      case "route_build":
        return <Info className="w-4 h-4" style={{ color: "var(--cb-info)" }} />
      case "order_sent":
        return <CheckCircle className="w-4 h-4" style={{ color: "var(--cb-ok)" }} />
      case "order_confirmed":
        return <CheckCircle className="w-4 h-4" style={{ color: "var(--cb-ok)" }} />
      case "order_failed":
        return <XCircle className="w-4 h-4" style={{ color: "var(--cb-err)" }} />
      case "auto_pause":
        return <AlertTriangle className="w-4 h-4" style={{ color: "var(--cb-warn)" }} />
      default:
        return <Info className="w-4 h-4" style={{ color: "var(--cb-subtext)" }} />
    }
  }

  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case "trigger":
        return "Trigger"
      case "gate_check":
        return "Gate Check"
      case "route_build":
        return "Route Build"
      case "order_sent":
        return "Order Sent"
      case "order_confirmed":
        return "Order Confirmed"
      case "order_failed":
        return "Order Failed"
      case "auto_pause":
        return "Auto Pause"
      default:
        return type
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="cb-panel w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--cb-border)" }}>
          <h2 className="text-xl font-semibold" style={{ color: "var(--cb-text)" }}>
            Automation Logs
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm" style={{ color: "var(--cb-subtext)" }}>
                Loading logs...
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg mb-2" style={{ color: "var(--cb-subtext)" }}>
                No logs yet
              </div>
              <div className="text-sm" style={{ color: "var(--cb-subtext)" }}>
                Logs will appear here when the automation runs
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 cb-panel"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--cb-text)" }}>
                        {getLogTypeLabel(log.type)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--cb-subtext)" }}>
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm" style={{ color: "var(--cb-text)" }}>
                      {log.message}
                    </div>
                    
                    {log.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer" style={{ color: "var(--cb-subtext)" }}>
                          View Details
                        </summary>
                        <pre className="text-xs mt-1 p-2 cb-panel overflow-x-auto" style={{ color: "var(--cb-subtext)" }}>
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t" style={{ borderColor: "var(--cb-border)" }}>
          <Button
            onClick={onClose}
            variant="gold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
