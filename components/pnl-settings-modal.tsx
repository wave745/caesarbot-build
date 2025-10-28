"use client"

import React, { useState, useRef } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'

interface PnLSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  showUSDValues: boolean
  onToggleUSDValues: (value: boolean) => void
  backgroundImage: string | null
  onBackgroundImageChange: (image: string | null) => void
  opacity: number
  onOpacityChange: (value: number) => void
  blur: number
  onBlurChange: (value: number) => void
}

export function PnLSettingsModal({
  isOpen,
  onClose,
  showUSDValues,
  onToggleUSDValues,
  backgroundImage,
  onBackgroundImageChange,
  opacity,
  onOpacityChange,
  blur,
  onBlurChange
}: PnLSettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onBackgroundImageChange(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onBackgroundImageChange(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteImage = () => {
    onBackgroundImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Show USD Values Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Show USD values</span>
            <button
              onClick={() => onToggleUSDValues(!showUSDValues)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                showUSDValues ? 'bg-teal-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  showUSDValues ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Custom Background */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Custom Background</span>
              {backgroundImage && (
                <button
                  onClick={handleDeleteImage}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete background"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>

            {/* Image Upload Area */}
            {!backgroundImage ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Select or drag and drop an image here
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div 
                  className="w-full h-24 rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: opacity / 100,
                    filter: `blur(${blur}px)`
                  }}
                />

                {/* Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">Opacity</span>
                    <span className="text-gray-400 text-sm">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => onOpacityChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${opacity}%, #374151 ${opacity}%, #374151 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Blur Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">Blur</span>
                    <span className="text-gray-400 text-sm">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={blur}
                    onChange={(e) => onBlurChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(blur / 20) * 100}%, #374151 ${(blur / 20) * 100}%, #374151 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
