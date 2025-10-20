"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
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

  const selectedLabel = SOUND_OPTIONS.find(opt => opt.value === selectedSound)?.label || 'None'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs hover:bg-zinc-700 transition-colors"
        title="Sound settings"
      >
        {selectedSound === 'none' ? (
          <VolumeX className="w-3 h-3 text-zinc-400" />
        ) : (
          <Volume2 className="w-3 h-3 text-yellow-400" />
        )}
        <span className="text-white font-medium">{selectedLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 min-w-[180px]">
          {/* Sound options */}
          <div className="py-1">
            <div className="px-3 py-1 text-xs text-zinc-400 font-medium">Sound</div>
            {SOUND_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSoundChange(option.value)
                  if (option.value !== 'none') {
                    setTimeout(() => onTestSound(), 100)
                  }
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors ${
                  selectedSound === option.value ? 'bg-zinc-700 text-yellow-400' : 'text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Volume slider (only show if sound is not 'none') */}
          {selectedSound !== 'none' && (
            <>
              <div className="border-t border-zinc-700 my-1" />
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-400">Volume</label>
                  <span className="text-xs text-zinc-400">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(234 179 8) 0%, rgb(234 179 8) ${volume}%, rgb(63 63 70) ${volume}%, rgb(63 63 70) 100%)`
                  }}
                />
              </div>
              <div className="px-3 pb-2">
                <button
                  onClick={onTestSound}
                  className="w-full px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  Test Sound
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
