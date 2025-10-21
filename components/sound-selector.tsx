"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Check } from "lucide-react"
import type { SoundOption } from "@/hooks/use-column-sound"

interface SoundSelectorProps {
  selectedSound: SoundOption
  volume: number
  onSoundChange: (sound: SoundOption) => void
  onVolumeChange: (volume: number) => void
  onTestSound: () => void
}

const SOUND_OPTIONS: { value: SoundOption; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'click', label: 'Click' },
  { value: 'ding', label: 'Ding' },
  { value: 'fart', label: 'Fart' },
  { value: 'lets-go', label: "Let's Go!" },
  { value: 'punch', label: 'Punch' },
  { value: 'swoosh', label: 'Swoosh' },
]

export function SoundSelector({ selectedSound, volume, onSoundChange, onVolumeChange, onTestSound }: SoundSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSoundSelect = (sound: SoundOption) => {
    onSoundChange(sound)
    setIsOpen(false)
    if (sound !== 'none') {
      setTimeout(() => onTestSound(), 100)
    }
  }

  const handleAddCustom = () => {
    setIsOpen(false)
    setShowCustomModal(true)
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
          title="Sound settings"
        >
          {selectedSound === 'none' ? (
            <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50 min-w-[140px] py-1">
            {SOUND_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSoundSelect(option.value)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors flex items-center justify-between group"
              >
                <span className="text-zinc-200">{option.label}</span>
                {selectedSound === option.value && (
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>
            ))}
            <div className="border-t border-zinc-800 my-1" />
            <button
              onClick={handleAddCustom}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors text-zinc-200"
            >
              Add custom
            </button>
          </div>
        )}
      </div>

      {/* Custom Sound Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setShowCustomModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 w-[400px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Custom sound</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors mb-4">
              Upload custom sound, max 0.2 MB
            </button>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-300">Custom sound volume</label>
                <span className="text-sm text-zinc-400">{volume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-zinc-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(96 165 250) 0%, rgb(96 165 250) ${volume}%, rgb(63 63 70) ${volume}%, rgb(63 63 70) 100%)`
                  }}
                />
                <span className="text-sm text-zinc-400 w-8 text-right">{volume}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
