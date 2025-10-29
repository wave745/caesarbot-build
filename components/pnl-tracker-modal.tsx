"use client"

import React, { useState } from 'react'
import { Rnd } from 'react-rnd'
import { 
  X, 
  Settings,
  RefreshCw
} from 'lucide-react'
import { PnLSettingsModal } from './pnl-settings-modal'

interface PnLTrackerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PnLTrackerModal({ isOpen, onClose }: PnLTrackerModalProps) {
  const [size, setSize] = useState({ width: 280, height: 110 })
  const [showSettings, setShowSettings] = useState(false)
  const [showUSDValues, setShowUSDValues] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [opacity, setOpacity] = useState(50)
  const [blur, setBlur] = useState(10)

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
        enableResizing={true}
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
          className={`w-full h-full bg-transparent border border-transparent rounded-lg flex flex-col overflow-hidden transition-all duration-200 hover:border-[#3a3a3a]/20`}
        >
          {/* Header - Drag Handle */}
          <div className="drag-handle flex items-center justify-between px-3 py-2 bg-transparent cursor-move select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSettings(true)
                }}
                className="p-0.5 hover:bg-white/10 rounded transition-colors"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => {}}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-3 h-3 text-gray-400 hover:text-white" />
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
          <div className="flex-1 p-3 overflow-auto relative">
            {/* Background Image */}
            {backgroundImage && (
              <div 
                className="absolute inset-0 rounded-b-lg"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: opacity / 100,
                  filter: `blur(${blur}px)`,
                  zIndex: 0
                }}
              />
            )}
            {/* Content layer */}
            <div className="relative z-10">
              {/* Empty content area ready for your data */}
            </div>
          </div>

          {/* Resize Indicator - Bottom Right Corner */}
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-600/50" />
          </div>
        </div>
      </Rnd>

      {/* Settings Modal */}
      <PnLSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        showUSDValues={showUSDValues}
        onToggleUSDValues={setShowUSDValues}
        backgroundImage={backgroundImage}
        onBackgroundImageChange={setBackgroundImage}
        opacity={opacity}
        onOpacityChange={setOpacity}
        blur={blur}
        onBlurChange={setBlur}
      />
    </div>
  )
}
