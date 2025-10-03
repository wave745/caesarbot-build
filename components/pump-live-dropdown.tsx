"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface PumpLiveDropdownProps {
  onOptionSelect: (option: 'live-tracker' | 'top-stream-tokens') => void
  activeOption?: 'live-tracker' | 'top-stream-tokens'
}

export function PumpLiveDropdown({ onOptionSelect, activeOption = 'live-tracker' }: PumpLiveDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options = [
    {
      key: 'live-tracker' as const,
      title: 'Live Tracker',
      description: 'New Streams and Top Streams'
    },
    {
      key: 'top-stream-tokens' as const,
      title: 'Top Stream Tokens',
      description: 'Highest Market Cap Streams'
    }
  ]

  const activeOptionData = options.find(option => option.key === activeOption)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionClick = (optionKey: 'live-tracker' | 'top-stream-tokens') => {
    onOptionSelect(optionKey)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 flex items-center gap-2 ${
          activeOption
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
            : "bg-[#111111] text-gray-400 hover:text-white border border-[#282828]"
        }`}
      >
        Pump Live
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleOptionClick(option.key)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                  activeOption === option.key ? 'bg-gray-700' : ''
                }`}
              >
                <div className="text-white font-medium text-sm">
                  {option.title}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
