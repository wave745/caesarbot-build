"use client"

import React, { useState, useRef, useEffect } from 'react'
import { 
  X, 
  TrendingUp,
  BarChart3
} from 'lucide-react'

export function PnLTrackerCard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 280, height: 110 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  
  const dragStartRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  // Constants
  const MIN_WIDTH = 200
  const MIN_HEIGHT = 80
  const MAX_WIDTH = 1920
  const MAX_HEIGHT = 1080
  const DEFAULT_WIDTH = 280
  const DEFAULT_HEIGHT = 110

  // Initialize position and size on first open
  useEffect(() => {
    if (isOpen && position.x === 0 && position.y === 0) {
      const centerX = window.innerWidth / 2 - DEFAULT_WIDTH / 2
      const centerY = window.innerHeight / 2 - DEFAULT_HEIGHT / 2
      setPosition({ x: centerX, y: centerY })
      setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
    }
  }, [isOpen])

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStartRef.current.x
      const newY = e.clientY - dragStartRef.current.y
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - size.width
      const maxY = window.innerHeight - size.height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y
      
      let newWidth = resizeStartRef.current.width
      let newHeight = resizeStartRef.current.height
      let newX = position.x
      let newY = position.y
      
      // Handle different resize directions
      if (resizeHandle.includes('right')) {
        newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStartRef.current.width + deltaX))
      }
      if (resizeHandle.includes('left')) {
        newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStartRef.current.width - deltaX))
        newX = position.x + (resizeStartRef.current.width - newWidth)
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStartRef.current.height + deltaY))
      }
      if (resizeHandle.includes('top')) {
        newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStartRef.current.height - deltaY))
        newY = position.y + (resizeStartRef.current.height - newHeight)
      }
      
      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, resizeHandle, position, size])

  if (!isOpen) return null

  return (
    <>
      {/* Semi-transparent background overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Floating PnL Card */}
      <div
        className="fixed z-50 bg-[#0a0a0a]/95 border border-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        }}
        onMouseDown={handleDragStart}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a] bg-[#0f0f0f]/80 cursor-move select-none"
          data-drag-handle
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <h3 className="text-xs font-medium text-white">PnL Tracker</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 h-full overflow-hidden">
          <div className="text-center text-gray-400">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <div className="text-sm font-medium mb-1">PnL Tracker</div>
            <div className="text-xs">Track your profit and loss</div>
            <div className="text-xs mt-1 opacity-75">Connect your wallet to get started</div>
          </div>
        </div>

        {/* Resize Handles */}
        {/* Top */}
        <div
          className="absolute top-0 left-0 right-0 h-1 cursor-n-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'top')}
        />
        {/* Right */}
        <div
          className="absolute top-0 right-0 bottom-0 w-1 cursor-e-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />
        {/* Bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        />
        {/* Left */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1 cursor-w-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'left')}
        />
        {/* Corner handles */}
        <div
          className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'top-left')}
        />
        <div
          className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'top-right')}
        />
        <div
          className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
        />
        <div
          className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize hover:bg-blue-500/50"
          onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
        />
      </div>
    </>
  )
}