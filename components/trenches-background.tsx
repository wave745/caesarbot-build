"use client"

import { useEffect, useState } from "react"

interface BackgroundSettings {
  imageUrl: string | null
  brightness: number
  contrast: number
  blur: number
  opacity: number
}

interface TrenchesBackgroundProps {
  children: React.ReactNode
}

export function TrenchesBackground({ children }: TrenchesBackgroundProps) {
  const [settings, setSettings] = useState<BackgroundSettings>({
    imageUrl: null,
    brightness: 100,
    contrast: 100,
    blur: 0,
    opacity: 100,
  })

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

  // Listen for settings updates from BackgroundCustomizer
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent<BackgroundSettings>) => {
      setSettings(event.detail)
    }

    window.addEventListener("trenches-bg-update" as any, handleSettingsUpdate)
    return () => {
      window.removeEventListener("trenches-bg-update" as any, handleSettingsUpdate)
    }
  }, [])

  // Build the filter string
  const filterStyle = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) blur(${settings.blur}px)`

  return (
    <div className="relative min-h-[calc(100vh-140px)]">
      {/* Background image layer - fills only the trenches content area */}
      {settings.imageUrl && (
        <div 
          className="absolute inset-0 z-0 transition-all duration-500 ease-out"
          style={{
            backgroundImage: `url(${settings.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: filterStyle,
            opacity: settings.opacity / 100,
          }}
        />
      )}

      {/* Content layer - sits on top of background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
