"use client"

import React, { useState, useRef, useCallback } from "react"

interface ResizableSplitPanelProps {
  children: [React.ReactNode, React.ReactNode]
  initialSplit?: number // percentage (0-100)
  minSize?: number // minimum percentage for each panel
  maxSize?: number // maximum percentage for each panel
}

export function ResizableSplitPanel({ 
  children, 
  initialSplit = 70, 
  minSize = 20, 
  maxSize = 80 
}: ResizableSplitPanelProps) {
  const [split, setSplit] = useState(initialSplit)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const percentage = ((e.clientY - rect.top) / rect.height) * 100
    
    // Constrain the percentage within min/max bounds
    const constrainedPercentage = Math.max(minSize, Math.min(maxSize, percentage))
    setSplit(constrainedPercentage)
  }, [isDragging, minSize, maxSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="h-full flex flex-col relative">
      {/* Top Panel - Chart */}
      <div 
        className="flex-1 min-h-0"
        style={{ height: `${split}%` }}
      >
        {children[0]}
      </div>

      {/* Resizer Bar */}
      <div
        className={`h-1 bg-zinc-700 hover:bg-zinc-600 cursor-row-resize transition-colors relative group ${
          isDragging ? 'bg-yellow-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Resizer Handle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-1 bg-zinc-500 rounded-full group-hover:bg-zinc-400 transition-colors"></div>
        </div>
      </div>

      {/* Bottom Panel - Trades Table */}
      <div 
        className="flex-shrink-0"
        style={{ height: `${100 - split}%` }}
      >
        {children[1]}
      </div>
    </div>
  )
}
