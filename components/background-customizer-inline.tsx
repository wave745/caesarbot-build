"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackgroundSettings {
  imageUrl: string | null
  brightness: number
  contrast: number
  blur: number
  opacity: number
}

const DEFAULT_SETTINGS: BackgroundSettings = {
  imageUrl: null,
  brightness: 100,
  contrast: 100,
  blur: 0,
  opacity: 100,
}

interface BackgroundCustomizerInlineProps {
  onClose?: () => void
}

export function BackgroundCustomizerInline({ onClose }: BackgroundCustomizerInlineProps) {
  const [settings, setSettings] = useState<BackgroundSettings>(DEFAULT_SETTINGS)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasLoadedFromStorage = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("caesarx-trenches-bg")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error("Failed to load background settings:", error)
      }
    }
    hasLoadedFromStorage.current = true
  }, [])

  // Debounced save to localStorage and dispatch event
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce the save operation for 150ms
    debounceTimerRef.current = setTimeout(() => {
      localStorage.setItem("caesarx-trenches-bg", JSON.stringify(settings))
      
      const event = new CustomEvent("trenches-bg-update", { detail: settings })
      window.dispatchEvent(event)
    }, 150)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [settings])

  // Compress and resize image using Canvas API
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Calculate new dimensions (max 1920x1080 for performance)
        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1080
        let width = img.width
        let height = img.height

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width
          width = MAX_WIDTH
        }
        
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height
          height = MAX_HEIGHT
        }

        canvas.width = width
        canvas.height = height

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to compressed JPEG (quality 0.85)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve(compressedDataUrl)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(file)
    })
  }, [])

  // Handle image upload with compression
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Show loading state (could add a loading indicator here)
    try {
      const compressedImageUrl = await compressImage(file)
      setSettings((prev) => ({ ...prev, imageUrl: compressedImageUrl }))
    } catch (error) {
      console.error('Failed to process image:', error)
    }
  }, [compressImage])

  // Handle image removal
  const handleRemoveImage = useCallback(() => {
    setSettings((prev) => ({ ...prev, imageUrl: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  // Handle slider changes with immediate UI feedback
  const handleSliderChange = useCallback((key: keyof BackgroundSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  return (
    <div className="space-y-4 w-full">
      {/* Image upload section */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-yellow-600/90">Upload Background Image</label>
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-600 border border-yellow-600/30"
          >
            <Upload className="w-3 h-3 mr-2" />
            {settings.imageUrl ? "Change Image" : "Upload Image"}
          </Button>
          {settings.imageUrl && (
            <Button
              onClick={handleRemoveImage}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <X className="w-3 h-3 mr-1" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {settings.imageUrl && (
          <div className="relative h-32 rounded-md overflow-hidden border border-yellow-600/20">
            <img 
              src={settings.imageUrl} 
              alt="Background preview" 
              className="w-full h-full object-cover"
              loading="lazy"
              style={{
                willChange: 'auto'
              }}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-yellow-600/20" />

      {/* Filter controls in grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-yellow-600/90">Brightness</label>
            <span className="text-xs text-yellow-600/60">{settings.brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={settings.brightness}
            onChange={(e) => handleSliderChange("brightness", Number(e.target.value))}
            className="w-full h-1.5 bg-yellow-600/20 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-yellow-600/90">Contrast</label>
            <span className="text-xs text-yellow-600/60">{settings.contrast}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={settings.contrast}
            onChange={(e) => handleSliderChange("contrast", Number(e.target.value))}
            className="w-full h-1.5 bg-yellow-600/20 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-yellow-600/90">Blur</label>
            <span className="text-xs text-yellow-600/60">{settings.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={settings.blur}
            onChange={(e) => handleSliderChange("blur", Number(e.target.value))}
            className="w-full h-1.5 bg-yellow-600/20 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-yellow-600/90">Opacity</label>
            <span className="text-xs text-yellow-600/60">{settings.opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.opacity}
            onChange={(e) => handleSliderChange("opacity", Number(e.target.value))}
            className="w-full h-1.5 bg-yellow-600/20 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>
      </div>

      {/* Reset button */}
      <Button
        onClick={handleReset}
        size="sm"
        variant="ghost"
        className="w-full text-yellow-600/70 hover:text-yellow-600 hover:bg-yellow-600/10 text-xs"
      >
        Reset to Default
      </Button>

      {/* Custom styles for the slider thumb */}
      <style jsx>{`
        input[type="range"].slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgb(202 138 4);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(202, 138, 4, 0.4);
          transition: all 0.2s ease;
        }

        input[type="range"].slider-thumb::-webkit-slider-thumb:hover {
          background: rgb(234 179 8);
          box-shadow: 0 0 12px rgba(234, 179, 8, 0.6);
          transform: scale(1.1);
        }

        input[type="range"].slider-thumb::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgb(202 138 4);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(202, 138, 4, 0.4);
          transition: all 0.2s ease;
          border: none;
        }

        input[type="range"].slider-thumb::-moz-range-thumb:hover {
          background: rgb(234 179 8);
          box-shadow: 0 0 12px rgba(234, 179, 8, 0.6);
          transform: scale(1.1);
        }

        input[type="range"].slider-thumb::-webkit-slider-runnable-track {
          background: rgba(202, 138, 4, 0.2);
          border-radius: 0.5rem;
        }

        input[type="range"].slider-thumb::-moz-range-track {
          background: rgba(202, 138, 4, 0.2);
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  )
}
