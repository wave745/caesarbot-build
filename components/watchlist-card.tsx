"use client"

import React, { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Move, 
  TrendingUp,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface WatchlistItem {
  id: string
  symbol: string
  name: string
  price: number
  marketCap: number
  change24h: number
  logo?: string
}

export function WatchlistCard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    e.preventDefault()
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        const newX = e.clientX - dragStartRef.current.x
        const newY = e.clientY - dragStartRef.current.y
        
        cardRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`
      }
    })
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Update position state for next drag
      if (cardRef.current) {
        const transform = cardRef.current.style.transform
        const match = transform.match(/translate3d\(([^,]+)px,\s*([^,]+)px/)
        if (match) {
          setPosition({
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
          })
        }
      }
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [isDragging])

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={cardRef}
        className={`bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg flex flex-col transition-all duration-300 ${
          isMinimized 
            ? 'w-80 h-48' 
            : 'w-full max-w-4xl h-[600px]'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          willChange: isDragging ? 'transform' : 'auto'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]" data-drag-handle>
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-gray-400 cursor-grab" />
            <h2 className="text-white font-medium">Watchlist</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMinimize}
              className="text-gray-400 hover:text-white transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Table Headers */}
            <div className="flex items-center px-4 py-3 border-b border-[#1a1a1a]">
              <div className="flex-1 text-gray-400 text-sm font-medium">Asset</div>
              <div className="w-24 text-gray-400 text-sm font-medium text-right">Price</div>
              <div className="w-24 text-gray-400 text-sm font-medium text-right">MCap</div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {watchlistItems.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">Your watchlist is empty</div>
                    <div className="text-gray-500 text-sm">
                      Add assets to track their performance
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {watchlistItems.map((item) => (
                    <div key={item.id} className="flex items-center py-3 border-b border-[#1a1a1a]/50 last:border-b-0">
                      <div className="flex-1 flex items-center gap-3">
                        {item.logo ? (
                          <img src={item.logo} alt={item.symbol} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{item.symbol[0]}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">{item.symbol}</div>
                          <div className="text-gray-400 text-sm">{item.name}</div>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-white font-medium">${item.price.toFixed(2)}</div>
                        <div className={`text-sm ${item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-white font-medium">
                          ${(item.marketCap / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <div className="text-gray-400 text-sm">
                  {watchlistItems.length} assets in watchlist
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors rounded text-sm">
                    Add Asset
                  </button>
                  <button className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 rounded text-sm">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Minimized Content */}
        {isMinimized && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">Watchlist</div>
              <div className="text-gray-500 text-xs">
                {watchlistItems.length} assets
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
