"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface BlacklistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BlacklistModal({ isOpen, onClose }: BlacklistModalProps) {
  const [activeTab, setActiveTab] = useState<"dev" | "hidden" | "handles">("dev")
  const [devAddress, setDevAddress] = useState("")
  const [handle, setHandle] = useState("")
  const [devBlacklist, setDevBlacklist] = useState<string[]>([])
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([])
  const [handlesBlacklist, setHandlesBlacklist] = useState<string[]>([])

  if (!isOpen) return null

  const handleAddDev = () => {
    if (devAddress.trim()) {
      setDevBlacklist([...devBlacklist, devAddress.trim()])
      setDevAddress("")
    }
  }

  const handleAddHandle = () => {
    if (handle.trim()) {
      setHandlesBlacklist([...handlesBlacklist, handle.trim()])
      setHandle("")
    }
  }

  const handleRemoveDev = (address: string) => {
    setDevBlacklist(devBlacklist.filter(addr => addr !== address))
  }

  const handleRemoveHidden = (token: string) => {
    setHiddenTokens(hiddenTokens.filter(t => t !== token))
  }

  const handleRemoveHandle = (handle: string) => {
    setHandlesBlacklist(handlesBlacklist.filter(h => h !== handle))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#262626]">
          <h2 className="text-lg font-semibold text-white">Blacklists</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#262626]">
          <button
            onClick={() => setActiveTab("dev")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "dev"
                ? "border-yellow-500 text-yellow-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Dev Blacklist
          </button>
          <button
            onClick={() => setActiveTab("hidden")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "hidden"
                ? "border-yellow-500 text-yellow-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Hidden Tokens
          </button>
          <button
            onClick={() => setActiveTab("handles")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "handles"
                ? "border-yellow-500 text-yellow-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Handles Blacklist
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === "dev" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Dev address"
                  value={devAddress}
                  onChange={(e) => setDevAddress(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddDev()
                    }
                  }}
                  className="flex-1 h-8 text-sm bg-[#111111] border-[#282828] text-white placeholder:text-gray-500"
                />
                <Button
                  onClick={handleAddDev}
                  className="h-7 px-2.5 text-xs bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold hover:from-orange-400 hover:to-yellow-400"
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {devBlacklist.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No dev addresses blacklisted
                  </div>
                ) : (
                  devBlacklist.map((address, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#111111] rounded-lg border border-[#282828]"
                    >
                      <span className="text-sm text-gray-300 font-mono">{address}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDev(address)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "hidden" && (
            <div className="space-y-4">
              <div className="text-center text-gray-500 py-8">
                {hiddenTokens.length === 0 ? (
                  "No hidden tokens"
                ) : (
                  <div className="space-y-2">
                    {hiddenTokens.map((token, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#111111] rounded-lg border border-[#282828]"
                      >
                        <span className="text-sm text-gray-300">{token}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveHidden(token)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "handles" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <Input
                    type="text"
                    placeholder="Handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddHandle()
                      }
                    }}
                    className="h-8 pl-7 text-sm bg-[#111111] border-[#282828] text-white placeholder:text-gray-500"
                  />
                </div>
                <Button
                  onClick={handleAddHandle}
                  className="h-7 px-2.5 text-xs bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold hover:from-orange-400 hover:to-yellow-400"
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {handlesBlacklist.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No handles blacklisted
                  </div>
                ) : (
                  handlesBlacklist.map((handle, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#111111] rounded-lg border border-[#282828]"
                    >
                      <span className="text-sm text-gray-300">@{handle}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHandle(handle)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

