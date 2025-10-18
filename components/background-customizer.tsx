"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, X, Settings, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

export function BackgroundCustomizer() {
  const [settings, setSettings] = useState<BackgroundSettings>(DEFAULT_SETTINGS)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  }, [])

  // Save settings to localStorage and dispatch event whenever they change
  useEffect(() => {
    localStorage.setItem("caesarx-trenches-bg", JSON.stringify(settings))
    
    // Dispatch custom event to update TrenchesBackground
    const event = new CustomEvent("trenches-bg-update", { detail: settings })
    window.dispatchEvent(event)
  }, [settings])

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setSettings((prev) => ({ ...prev, imageUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image removal
  const handleRemoveImage = () => {
    setSettings((prev) => ({ ...prev, imageUrl: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle slider changes
  const handleSliderChange = (key: keyof BackgroundSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      <Card className="bg-black/40 backdrop-blur-xl border-yellow-600/30 overflow-hidden shadow-2xl">
        {/* Header - Always visible */}
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-yellow-600/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">Background</span>
          </div>
          <button className="text-yellow-600/70 hover:text-yellow-600 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expandable controls */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-4 pb-4 space-y-4 w-80">
            {/* Image upload section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-yellow-600/90">Upload Image</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-600 border border-yellow-600/30"
                >
                  <Upload className="w-3 h-3 mr-2" />
                  {settings.imageUrl ? "Change" : "Upload"}
                </Button>
                {settings.imageUrl && (
                  <Button
                    onClick={handleRemoveImage}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <X className="w-3 h-3" />
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
                <div className="relative h-20 rounded-md overflow-hidden border border-yellow-600/20">
                  <img 
                    src={settings.imageUrl} 
                    alt="Background preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-yellow-600/20" />

            {/* Filter controls */}
            <div className="space-y-3">
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
              onClick={() => {
                setSettings(DEFAULT_SETTINGS)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
              }}
              size="sm"
              variant="ghost"
              className="w-full text-yellow-600/70 hover:text-yellow-600 hover:bg-yellow-600/10 text-xs"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </Card>

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
