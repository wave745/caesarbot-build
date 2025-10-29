"use client"

import React, { useState, useRef } from 'react'
import { X, Settings, Download } from 'lucide-react'
import { Rnd } from 'react-rnd'

interface PnlCardProps {
  isOpen: boolean
  onClose: () => void
}

interface PnlData {
  balanceSOL: number
  balanceUSD: number
  pnlPercentage: number
  pnlUSD: number
}

export function PnlCard({ isOpen, onClose }: PnlCardProps) {
  const [pnlData, setPnlData] = useState<PnlData>({
    balanceSOL: 0.0000,
    balanceUSD: 0.00,
    pnlPercentage: 0.00,
    pnlUSD: 0.00
  })

  const [showSettings, setShowSettings] = useState(false)
  const [showUSD, setShowUSD] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [opacity, setOpacity] = useState(23)
  const [blur, setBlur] = useState(5)
  const [cardSize, setCardSize] = useState({ width: 380, height: 200 })
  
  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Calculate scale factor based on current size vs default size (380x200)
  const scale = Math.min(cardSize.width / 380, cardSize.height / 200)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setBackgroundImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setBackgroundImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }


  const exportToPNG = async () => {
    if (!cardRef.current) return
    
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2
      })
      
      const link = document.createElement('a')
      link.download = 'pnl-card.png'
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Failed to export PNG:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center p-4">
      {/* PnL Card */}
      <Rnd
        default={{
          x: window.innerWidth / 2 - 190,
          y: window.innerHeight / 2 - 100,
          width: 380,
          height: 200,
        }}
        minWidth={300}
        minHeight={180}
        bounds="parent"
        enableResizing={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
        dragHandleClassName="drag-handle"
        onResize={(e, direction, ref) => {
          setCardSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          })
        }}
      >
        <div 
          ref={cardRef}
          className="relative rounded-[20px] overflow-hidden text-white h-full w-full border border-gray-700/30"
          style={{
            background: backgroundImage 
              ? `linear-gradient(135deg, rgba(10,10,20,${opacity/100}), rgba(20,20,30,${opacity/100})), url(${backgroundImage})`
              : `rgba(10,10,20,0.85)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backdropFilter: `blur(${blur}px)`,
          }}
        >
          {/* Drag Handle & Controls */}
          <div 
            className="drag-handle absolute top-0 left-0 right-0 cursor-move flex items-center justify-end px-3"
            style={{ height: `${scale * 2.5}rem` }}
          >
            <div className="flex items-center gap-2 z-10">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg bg-black/40 hover:bg-black/60"
              >
                <Settings style={{ width: `${scale * 1}rem`, height: `${scale * 1}rem` }} />
              </button>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg bg-black/40 hover:bg-black/60"
              >
                <X style={{ width: `${scale * 1}rem`, height: `${scale * 1}rem` }} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div 
            className="flex flex-col h-full items-center justify-center"
            style={{ 
              paddingLeft: `${scale * 1.25}rem`,
              paddingRight: `${scale * 1.25}rem`,
              paddingTop: `${scale * 2.5}rem`,
              paddingBottom: `${scale * 1.5}rem`,
              gap: `${scale * 0.5}rem`
            }}
          >
            {/* Top Row */}
            <div 
              className="flex items-center justify-between opacity-80 w-full"
              style={{ 
                fontSize: `${scale * 0.875}rem`,
                maxWidth: `${scale * 28}rem`
              }}
            >
              <span>Balance SOL</span>
              <span className={pnlData.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                {pnlData.pnlPercentage >= 0 ? '+' : ''}{pnlData.pnlPercentage.toFixed(2)}%
              </span>
            </div>

            {/* Main Values */}
            <div 
              className="flex items-center justify-between w-full"
              style={{ 
                fontSize: `${scale * 2.25}rem`,
                maxWidth: `${scale * 28}rem`,
                gap: `${scale * 0.75}rem`
              }}
            >
              <div className="flex items-center" style={{ gap: `${scale * 0.5}rem` }}>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00ffff]">≡</span>
                <span className="font-medium">{pnlData.balanceSOL.toFixed(4)}</span>
              </div>
              {showUSD && (
                <div className="flex items-center" style={{ gap: `${scale * 0.5}rem` }}>
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">≡</span>
                  <span className="font-medium">{pnlData.balanceUSD.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Bottom Row */}
            {showUSD && (
              <div 
                className="flex items-center justify-between opacity-70 w-full"
                style={{ 
                  fontSize: `${scale * 0.875}rem`,
                  maxWidth: `${scale * 28}rem`
                }}
              >
                <span>{pnlData.balanceUSD.toFixed(2)} USD</span>
                <span>{pnlData.pnlUSD >= 0 ? '+' : ''}{pnlData.pnlUSD.toFixed(2)}$</span>
              </div>
            )}
          </div>
        </div>
      </Rnd>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-[#1e1e2d]/95 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col">
          {/* Settings Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="text-white font-semibold">Settings</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Settings Body */}
          <div className="p-4 flex flex-col gap-4">
            {/* USD Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={showUSD}
                  onChange={(e) => setShowUSD(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-white">Show USD values</span>
            </label>

            {/* Custom Background */}
            <div>
              <div className="text-white mb-2">Custom Background</div>
              <label 
                className="border-2 border-dashed border-gray-600 hover:border-cyan-400 rounded-lg p-5 text-center cursor-pointer transition-colors block"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="text-gray-400 text-sm">Select or drag and drop an image here</span>
              </label>
            </div>

            {/* Opacity Slider */}
            <div>
              <label className="flex items-center justify-between text-white mb-2">
                <span>Opacity</span>
                <span>{opacity}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Blur Slider */}
            <div>
              <label className="flex items-center justify-between text-white mb-2">
                <span>Blur</span>
                <span>{blur}px</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Export PNG Button */}
            <button 
              onClick={exportToPNG}
              className="mt-3 px-4 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PNG
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
