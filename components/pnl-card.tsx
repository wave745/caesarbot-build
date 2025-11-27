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
    balanceSOL: 0.000,
    balanceUSD: 0.00,
    pnlPercentage: 0.00,
    pnlUSD: 0.00
  })

  const [showSettings, setShowSettings] = useState(false)
  const [showUSD, setShowUSD] = useState(true)
  const [selectedChain, setSelectedChain] = useState<'sol' | 'bnb'>('sol')
  const [customBackgroundImage, setCustomBackgroundImage] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<'default' | 'gif1' | 'gif2' | 'custom'>('default')
  const [opacity, setOpacity] = useState(23)
  const [blur, setBlur] = useState(5)
  const [cardSize, setCardSize] = useState({ width: 380, height: 200 })
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Default background that's always present
  const defaultBackground = '/caesarx-main-pnlcard-BG.jpg'
  const presetGif1 = '/custom-gif1.gif'
  const presetGif2 = '/custom-gif2.gif'
  
  // Determine background image based on preset or custom
  const getBackgroundImage = () => {
    if (customBackgroundImage) return customBackgroundImage
    if (selectedPreset === 'gif1') return presetGif1
    if (selectedPreset === 'gif2') return presetGif2
    return defaultBackground
  }
  
  const backgroundImage = getBackgroundImage()
  const isCustomBackground = customBackgroundImage !== null
  
  // Detect mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Calculate scale factor based on current size vs default size (380x200)
  const scale = Math.min(cardSize.width / 380, cardSize.height / 200)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setCustomBackgroundImage(ev.target?.result as string)
        setSelectedPreset('custom')
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
        setCustomBackgroundImage(ev.target?.result as string)
        setSelectedPreset('custom')
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePresetSelect = (preset: 'default' | 'gif1' | 'gif2') => {
    setSelectedPreset(preset)
    setCustomBackgroundImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if we're not dragging and the click is directly on the backdrop
    if (!isDragging && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Initialize position and size on mount
  React.useEffect(() => {
    if (isOpen && !isInitialized) {
      const width = isMobile ? Math.min(window.innerWidth - 32, 340) : 380
      const height = isMobile ? 180 : 200
      
      setCardSize({ width, height })
      setCardPosition({
        x: window.innerWidth / 2 - width / 2,
        y: window.innerHeight / 2 - height / 2,
      })
      setIsInitialized(true)
    }
  }, [isOpen, isInitialized, isMobile])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-transparent z-[9999] flex items-center justify-center p-4"
      onMouseDown={handleBackdropClick}
    >
      {/* PnL Card */}
      {isMobile ? (
        // Mobile: Fixed centered card without drag/resize
        <div
          className="relative mx-auto"
          style={{
            width: `${cardSize.width}px`,
            height: `${cardSize.height}px`,
            maxWidth: 'calc(100vw - 2rem)',
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={() => setIsHovering(true)}
        >
          <div 
            ref={cardRef}
            className="relative overflow-hidden text-white h-full w-full border border-gray-700/30"
            style={{
              background: 'transparent',
            }}
          >
            {/* Background Image Layer */}
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: isCustomBackground ? `blur(${blur}px)` : 'none',
                  transform: isCustomBackground ? 'scale(1.1)' : 'none',
                }}
              />
              {isCustomBackground && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: `rgba(0,0,0,${1 - opacity/100})`,
                  }}
                />
              )}
            </>
            
            {/* Mobile Content */}
            <div className="relative z-10 h-full w-full">
              {/* Chain Toggle - Top Left */}
              <div 
                className="absolute top-0 left-0 flex items-center gap-1 px-3 z-20 pointer-events-auto"
                style={{ 
                  height: `${scale * 2.5}rem`,
                  paddingTop: `${scale * 0.5}rem`
                }}
              >
                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedChain('sol')
                    }}
                    className="transition-all duration-200 pointer-events-auto"
                    style={{
                      filter: selectedChain === 'sol' ? 'none' : 'grayscale(100%)',
                      opacity: selectedChain === 'sol' ? 1 : 0.5,
                    }}
                  >
                    <img 
                      src="/sol-logo.png" 
                      alt="Solana" 
                      style={{ 
                        width: `${scale * 0.7}rem`, 
                        height: `${scale * 0.7}rem`,
                        objectFit: 'contain',
                      }} 
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedChain('bnb')
                    }}
                    className="transition-all duration-200 pointer-events-auto"
                    style={{
                      filter: selectedChain === 'bnb' ? 'none' : 'grayscale(100%)',
                      opacity: selectedChain === 'bnb' ? 1 : 0.5,
                    }}
                  >
                    <img 
                      src="/bnb-chain-binance-smart-chain-logo.svg" 
                      alt="BNB Chain" 
                      style={{ 
                        width: `${scale * 0.7}rem`, 
                        height: `${scale * 0.7}rem`,
                        objectFit: 'contain',
                      }} 
                    />
                  </button>
                </div>
              </div>

              {/* Mobile Controls */}
              <div 
                className="absolute top-0 right-0 flex items-center justify-end px-3"
                style={{ height: `${scale * 2.5}rem` }}
              >
                <div className="flex items-center gap-2 z-10 pointer-events-auto">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSettings(!showSettings)
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg bg-black/40 hover:bg-black/60 pointer-events-auto"
                  >
                    <Settings style={{ width: `${scale * 1}rem`, height: `${scale * 1}rem` }} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose()
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg bg-black/40 hover:bg-black/60 pointer-events-auto"
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
                  <span>Balance {selectedChain === 'sol' ? 'SOL' : 'BNB'}</span>
                  <span className={pnlData.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {pnlData.pnlPercentage >= 0 ? '+' : ''}{pnlData.pnlPercentage.toFixed(2)}%
                  </span>
                </div>

                {/* Main Values */}
                <div 
                  className="flex items-center justify-between w-full"
                  style={{ 
                    fontSize: `${scale * 2.0}rem`,
                    maxWidth: `${scale * 28}rem`,
                    gap: `${scale * 0.75}rem`
                  }}
                >
                  <div className="flex items-baseline flex-1" style={{ gap: `${scale * 0.5}rem` }}>
                    <img 
                      src={selectedChain === 'sol' ? '/sol-logo.png' : '/bnb-chain-binance-smart-chain-logo.svg'} 
                      alt={selectedChain === 'sol' ? 'SOL' : 'BNB'} 
                      style={{ 
                        width: `${scale * 1.6}rem`, 
                        height: `${scale * 1.6}rem`,
                        objectFit: 'contain',
                        verticalAlign: 'baseline'
                      }} 
                    />
                    <span className="font-bold leading-none">{pnlData.balanceSOL.toFixed(3)}</span>
                  </div>
                  <div className="flex items-baseline flex-1 justify-end" style={{ gap: `${scale * 0.5}rem` }}>
                    <img 
                      src={selectedChain === 'sol' ? '/sol-logo.png' : '/bnb-chain-binance-smart-chain-logo.svg'} 
                      alt={selectedChain === 'sol' ? 'SOL' : 'BNB'} 
                      style={{ 
                        width: `${scale * 1.6}rem`, 
                        height: `${scale * 1.6}rem`,
                        objectFit: 'contain',
                        verticalAlign: 'baseline'
                      }} 
                    />
                    <span className="font-bold leading-none">{pnlData.balanceUSD.toFixed(2)}</span>
                  </div>
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
          </div>
        </div>
      ) : (
        // Desktop: Draggable and resizable card
        <Rnd
          size={{ width: cardSize.width, height: cardSize.height }}
          position={{ x: cardPosition.x, y: cardPosition.y }}
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
          onDragStart={() => setIsDragging(true)}
          onDragStop={(e, d) => {
            setCardPosition({ x: d.x, y: d.y })
            setTimeout(() => setIsDragging(false), 100)
          }}
          onResize={(e, direction, ref, delta, position) => {
            setCardSize({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            })
            setCardPosition(position)
          }}
        >
        <div 
          ref={cardRef}
          className="relative overflow-hidden text-white h-full w-full border border-gray-700/30"
          style={{
            background: 'transparent',
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Background Image Layer */}
          <>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: isCustomBackground ? `blur(${blur}px)` : 'none',
                transform: isCustomBackground ? 'scale(1.1)' : 'none',
              }}
            />
            {isCustomBackground && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: `rgba(0,0,0,${1 - opacity/100})`,
                }}
              />
            )}
          </>
          
          {/* Content Layer */}
          <div className="relative z-10 h-full w-full">
          {/* Chain Toggle - Top Left */}
          {isHovering && (
            <div 
              className="absolute top-0 left-0 flex items-center gap-1 px-3 z-20 pointer-events-auto transition-opacity duration-200"
              style={{ 
                height: `${scale * 2.5}rem`,
                paddingTop: `${scale * 0.5}rem`
              }}
            >
              <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedChain('sol')
                  }}
                  className="transition-all duration-200 pointer-events-auto"
                  style={{
                    filter: selectedChain === 'sol' ? 'none' : 'grayscale(100%)',
                    opacity: selectedChain === 'sol' ? 1 : 0.5,
                  }}
                >
                  <img 
                    src="/sol-logo.png" 
                    alt="Solana" 
                    style={{ 
                      width: `${scale * 0.9}rem`, 
                      height: `${scale * 0.9}rem`,
                      objectFit: 'contain',
                    }} 
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedChain('bnb')
                  }}
                  className="transition-all duration-200 pointer-events-auto"
                  style={{
                    filter: selectedChain === 'bnb' ? 'none' : 'grayscale(100%)',
                    opacity: selectedChain === 'bnb' ? 1 : 0.5,
                  }}
                >
                  <img 
                    src="/bnb-chain-binance-smart-chain-logo.svg" 
                    alt="BNB Chain" 
                    style={{ 
                      width: `${scale * 0.9}rem`, 
                      height: `${scale * 0.9}rem`,
                      objectFit: 'contain',
                    }} 
                  />
                </button>
              </div>
            </div>
          )}

          {/* Drag Handle & Controls */}
          <div 
            className="drag-handle absolute top-0 left-0 right-0 cursor-move flex items-center justify-end px-3"
            style={{ 
              height: `${scale * 2.5}rem`,
              pointerEvents: 'auto'
            }}
          >
            {isHovering && (
              <div className="flex items-center gap-2 z-10 transition-opacity duration-200 pointer-events-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSettings(!showSettings)
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg bg-black/40 hover:bg-black/60 pointer-events-auto"
                >
                  <Settings style={{ width: `${scale * 1}rem`, height: `${scale * 1}rem` }} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg bg-black/40 hover:bg-black/60 pointer-events-auto"
                >
                  <X style={{ width: `${scale * 1}rem`, height: `${scale * 1}rem` }} />
                </button>
              </div>
            )}
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
              <span>Balance {selectedChain === 'sol' ? 'SOL' : 'BNB'}</span>
              <span className={pnlData.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                {pnlData.pnlPercentage >= 0 ? '+' : ''}{pnlData.pnlPercentage.toFixed(2)}%
              </span>
            </div>

            {/* Main Values */}
            <div 
              className="flex items-center justify-between w-full"
              style={{ 
                fontSize: `${scale * 2.0}rem`,
                maxWidth: `${scale * 28}rem`,
                gap: `${scale * 0.75}rem`
              }}
            >
              <div className="flex items-baseline flex-1" style={{ gap: `${scale * 0.5}rem` }}>
                <img 
                  src={selectedChain === 'sol' ? '/sol-logo.png' : '/bnb-chain-binance-smart-chain-logo.svg'} 
                  alt={selectedChain === 'sol' ? 'SOL' : 'BNB'} 
                  style={{ 
                    width: `${scale * 1.6}rem`, 
                    height: `${scale * 1.6}rem`,
                    objectFit: 'contain',
                    verticalAlign: 'baseline'
                  }} 
                />
                <span className="font-bold leading-none">{pnlData.balanceSOL.toFixed(3)}</span>
              </div>
              <div className="flex items-baseline flex-1 justify-end" style={{ gap: `${scale * 0.5}rem` }}>
                <img 
                  src={selectedChain === 'sol' ? '/sol-logo.png' : '/bnb-chain-binance-smart-chain-logo.svg'} 
                  alt={selectedChain === 'sol' ? 'SOL' : 'BNB'} 
                  style={{ 
                    width: `${scale * 1.6}rem`, 
                    height: `${scale * 1.6}rem`,
                    objectFit: 'contain',
                    verticalAlign: 'baseline'
                  }} 
                />
                <span className="font-bold leading-none">{pnlData.balanceUSD.toFixed(2)}</span>
              </div>
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
        </div>
      </Rnd>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Settings Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
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
                <div className="w-9 h-5 bg-gray-600 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
              </div>
              <span className="text-white">Show USD values</span>
            </label>

            {/* Custom Background */}
            <div>
              <div className="flex items-center justify-between text-white mb-2">
                <span>Custom Background</span>
                {isCustomBackground && (
                  <button
                    onClick={() => {
                      setCustomBackgroundImage(null)
                      setSelectedPreset('default')
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              {/* Preset Background Cards */}
              <div className="mb-3 flex gap-2">
                {/* Default Preset */}
                <button
                  onClick={() => handlePresetSelect('default')}
                  className={`relative flex-1 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPreset === 'default' && !isCustomBackground
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                      : 'border-[#1a1a1a] hover:border-gray-600'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${defaultBackground})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-xs text-white text-center">
                    Default
                  </div>
                </button>

                {/* GIF 1 Preset */}
                <button
                  onClick={() => handlePresetSelect('gif1')}
                  className={`relative flex-1 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPreset === 'gif1' && !isCustomBackground
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                      : 'border-[#1a1a1a] hover:border-gray-600'
                  }`}
                >
                  <img
                    src={presetGif1}
                    alt="Preset GIF 1"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-xs text-white text-center">
                    GIF 1
                  </div>
                </button>

                {/* GIF 2 Preset */}
                <button
                  onClick={() => handlePresetSelect('gif2')}
                  className={`relative flex-1 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPreset === 'gif2' && !isCustomBackground
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                      : 'border-[#1a1a1a] hover:border-gray-600'
                  }`}
                >
                  <img
                    src={presetGif2}
                    alt="Preset GIF 2"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-xs text-white text-center">
                    GIF 2
                  </div>
                </button>
              </div>
              
              {/* Upload/Preview Area */}
              <div className="mb-3">
                {isCustomBackground ? (
                  /* Image Preview with Blur and Opacity */
                  <div className="rounded-lg overflow-hidden h-32 relative bg-black">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: `blur(${blur}px)`,
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: `rgba(0,0,0,${1 - opacity/100})`,
                      }}
                    />
                  </div>
                ) : (
                  /* Upload Area */
                  <label 
                    className="border-2 border-dashed border-[#1a1a1a] hover:border-yellow-500 rounded-lg p-8 text-center cursor-pointer transition-colors block"
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
                    <span className="text-gray-400 text-sm">Select or drag and drop an image or GIF here</span>
                  </label>
                )}
              </div>
            </div>

            {/* Opacity Slider - For custom backgrounds only (not presets) */}
            {isCustomBackground && (
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
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            )}

            {/* Blur Slider - For custom backgrounds only (not presets) */}
            {isCustomBackground && (
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
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            )}

            {/* Export PNG Button */}
            <button 
              onClick={exportToPNG}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg font-semibold hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 flex items-center justify-center gap-2"
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
