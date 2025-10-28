"use client"

import React, { useState } from 'react'
import { Rnd } from 'react-rnd'
import { 
  X, 
  Move, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Minus,
  Square
} from 'lucide-react'

interface PnLTrackerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PnLTrackerModal({ isOpen, onClose }: PnLTrackerModalProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [size, setSize] = useState({ width: 280, height: 110 })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <Rnd
        default={{
          x: window.innerWidth / 2 - 140,
          y: window.innerHeight / 2 - 55,
          width: 280,
          height: 110,
        }}
        minWidth={280}
        minHeight={110}
        maxWidth={1920}
        maxHeight={1080}
        bounds="parent"
        enableResizing={!isMinimized}
        dragHandleClassName="drag-handle"
        onResizeStop={(e, direction, ref, delta, position) => {
          setSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height)
          })
        }}
        className="pointer-events-auto"
      >
        <div 
          className={`w-full h-full bg-black/80 backdrop-blur-md border border-[#2a2a2a] rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 hover:border-[#3a3a3a]`}
        >
          {/* Header - Drag Handle */}
          <div className="drag-handle flex items-center justify-between px-3 py-2 border-b border-[#2a2a2a] bg-gradient-to-r from-black/40 to-black/20 cursor-move select-none">
            <div className="flex items-center gap-2">
              <Move className="w-3.5 h-3.5 text-gray-400" />
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-white tracking-wide">PnL Tracker</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Square className="w-3 h-3 text-gray-400 hover:text-white" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-400 hover:text-white" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                title="Close"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="flex-1 p-3 overflow-auto">
              <div className="space-y-3">
                {/* PnL Summary */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Total PnL */}
                  <div className="bg-gradient-to-br from-green-500/10 to-transparent p-2.5 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total PnL</span>
                    </div>
                    <div className="text-lg font-bold text-green-400">+$0.00</div>
                    <div className="text-[10px] text-green-400/70">+0.00%</div>
                  </div>

                  {/* Today's PnL */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-2.5 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Today</span>
                    </div>
                    <div className="text-lg font-bold text-blue-400">$0.00</div>
                    <div className="text-[10px] text-blue-400/70">0.00%</div>
                  </div>
                </div>

                {/* Recent Trades Section - Only shows when expanded */}
                {size.height > 150 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Recent Trades</span>
                      <span className="text-[9px] text-gray-500">0 trades</span>
                    </div>
                    
                    {/* Placeholder for when no data */}
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <TrendingUp className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500">No trades yet</p>
                      <p className="text-[10px] text-gray-600 mt-1">Connect wallet to track PnL</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="flex items-center justify-center p-2 gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">PnL:</span>
                <span className="text-xs font-bold text-green-400">+$0.00</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">Today:</span>
                <span className="text-xs font-bold text-blue-400">$0.00</span>
              </div>
            </div>
          )}

          {/* Resize Indicator - Bottom Right Corner */}
          {!isMinimized && (
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-600/50" />
            </div>
          )}
        </div>
      </Rnd>
    </div>
  )
}
