"use client"

import React, { useState } from 'react'
import { Rnd } from 'react-rnd'
import { 
  X, 
  Settings,
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
    <div className="fixed inset-0 z-[100] pointer-events-none" onClick={onClose}>
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
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div 
          className={`w-full h-full bg-black/80 backdrop-blur-md border border-[#2a2a2a] rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 hover:border-[#3a3a3a]`}
        >
          {/* Header - Drag Handle */}
          <div className="drag-handle flex items-center justify-between px-3 py-2 bg-gradient-to-r from-black/40 to-black/20 cursor-move select-none">
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-gray-400" />
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
              {/* Empty content area ready for your data */}
            </div>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="flex items-center justify-center p-2">
              {/* Empty minimized state */}
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
