"use client"

import React from 'react'
import { X } from 'lucide-react'

interface BridgeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BridgeModal({ isOpen, onClose }: BridgeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-white">Quick Bridge</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <iframe 
            src="https://www.muteswap.com/embed/1a9e7988283e9aa4" 
            width="100%" 
            height="400" 
            frameBorder="0" 
            style={{ borderRadius: '8px' }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
