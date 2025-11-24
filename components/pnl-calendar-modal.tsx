"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, DollarSign } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths, subMonths } from "date-fns"

interface PNLCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  currency?: "SOL" | "BNB" | "USD"
  onCurrencyChange?: (currency: "SOL" | "BNB" | "USD") => void
  onDayClick?: (date: Date) => void
  onMonthlyPNLClick?: (month: Date) => void
}

interface DayPNL {
  date: Date
  pnl: number
}

export function PNLCalendarModal({ 
  isOpen, 
  onClose, 
  currency = "SOL",
  onCurrencyChange,
  onDayClick,
  onMonthlyPNLClick
}: PNLCalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCurrency, setSelectedCurrency] = useState<"SOL" | "BNB" | "USD">(currency)

  const handleCurrencySwitch = (newCurrency: "SOL" | "BNB" | "USD") => {
    setSelectedCurrency(newCurrency)
    onCurrencyChange?.(newCurrency)
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  if (!isOpen) return null

  // Mock PNL data - replace with actual data from your API
  const mockPNLData: DayPNL[] = []
  
  // Generate mock data for the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  daysInMonth.forEach(day => {
    mockPNLData.push({
      date: day,
      pnl: 0 // Replace with actual PNL data
    })
  })

  const getPNLForDate = (date: Date): number => {
    const dayData = mockPNLData.find(d => 
      format(d.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    return dayData?.pnl || 0
  }

  // Get calendar grid
  const calendarStart = new Date(monthStart)
  // Adjust to start on Monday (getDay() returns 0 for Sunday, 1 for Monday, etc.)
  const startDay = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1
  calendarStart.setDate(calendarStart.getDate() - startDay)
  
  const calendarEnd = new Date(monthEnd)
  const endDay = getDay(monthEnd) === 0 ? 6 : getDay(monthEnd) - 1
  const daysToAdd = 6 - endDay
  calendarEnd.setDate(calendarEnd.getDate() + daysToAdd)
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const getPNLColor = (pnl: number): string => {
    if (pnl > 0) return "bg-green-500/20 border-green-500/30"
    if (pnl < 0) return "bg-red-500/20 border-red-500/30"
    return "bg-[#1a1a1a] border-[#282828]"
  }

  const getPNLTextColor = (pnl: number): string => {
    if (pnl > 0) return "text-green-400"
    if (pnl < 0) return "text-red-400"
    return "text-gray-400"
  }

  const formatPNLValue = (pnl: number): string => {
    if (selectedCurrency === "SOL" || selectedCurrency === "BNB") {
      return pnl === 0 ? "0" : `${pnl.toFixed(4)}`
    } else {
      return pnl === 0 ? "$0" : `$${pnl.toFixed(2)}`
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#111111] border border-[#282828] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#282828]">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              PNL Calendar
            </h2>
            {/* Currency Logos */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCurrencySwitch("SOL")}
                className={`p-1.5 rounded-lg transition-all ${
                  selectedCurrency === "SOL"
                    ? "bg-[#1a1a1a] ring-2 ring-yellow-500/50"
                    : "hover:bg-[#1a1a1a] opacity-60 hover:opacity-100"
                }`}
                title="Switch to Solana"
              >
                <Image 
                  src="/sol-logo.png" 
                  alt="Solana" 
                  width={20} 
                  height={20} 
                  className="rounded"
                />
              </button>
              <button
                onClick={() => handleCurrencySwitch("BNB")}
                className={`p-1.5 rounded-lg transition-all ${
                  selectedCurrency === "BNB"
                    ? "bg-[#1a1a1a] ring-2 ring-yellow-500/50"
                    : "hover:bg-[#1a1a1a] opacity-60 hover:opacity-100"
                }`}
                title="Switch to BNB"
              >
                <Image 
                  src="/bnb-chain-binance-smart-chain-logo.svg" 
                  alt="BNB Chain" 
                  width={20} 
                  height={20} 
                />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              <h3 className="text-sm sm:text-base font-medium text-white">
                {format(currentMonth, "MMM yyyy")}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            {/* Currency Switch */}
            <button
              onClick={() => {
                // Switch to USD if on SOL or BNB, switch to SOL if on USD
                const newCurrency = selectedCurrency === "USD" ? "SOL" : "USD"
                handleCurrencySwitch(newCurrency)
              }}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              title={`Switch to ${selectedCurrency === "USD" ? "SOL" : "USD"}`}
            >
              <Image 
                src="/icons/ui/switchcurrency-icon.svg" 
                alt="Switch currency" 
                width={20} 
                height={20} 
                className="opacity-60 hover:opacity-100 transition-opacity"
                style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }}
              />
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-medium text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isCurrentDay = isToday(day)
              const pnl = isCurrentMonth ? getPNLForDate(day) : 0
              const pnlColor = getPNLColor(pnl)
              const pnlTextColor = getPNLTextColor(pnl)

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isCurrentMonth && onDayClick) {
                      onDayClick(day)
                    }
                  }}
                  className={`aspect-square rounded-lg border p-2 sm:p-3 flex flex-col items-center justify-center transition-colors ${
                    isCurrentMonth
                      ? `${pnlColor} cursor-pointer hover:opacity-80`
                      : "bg-[#0a0a0a] border-[#1a1a1a] opacity-50"
                  } ${isCurrentDay ? "ring-2 ring-yellow-500/50" : ""}`}
                >
                  <span
                    className={`text-xs sm:text-sm font-medium mb-1 ${
                      isCurrentMonth
                        ? isCurrentDay
                          ? "text-yellow-500"
                          : "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex items-center gap-1">
                    {selectedCurrency === "SOL" && (
                      <Image 
                        src="/sol-logo.png" 
                        alt="Solana" 
                        width={12} 
                        height={12} 
                        className="rounded"
                      />
                    )}
                    {selectedCurrency === "BNB" && (
                      <Image 
                        src="/bnb-chain-binance-smart-chain-logo.svg" 
                        alt="BNB Chain" 
                        width={12} 
                        height={12} 
                      />
                    )}
                    <span className={`text-xs font-medium ${pnlTextColor}`}>
                      {formatPNLValue(pnl)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State Message */}
          {mockPNLData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm sm:text-base">
                You don&apos;t have assets in any of the selected wallets
              </p>
            </div>
          )}
        </div>

        {/* Footer Glass Button */}
        <div className="p-3 border-t border-[#282828] bg-[#0a0a0a] flex items-center justify-center">
          <button 
            onClick={() => {
              if (onMonthlyPNLClick) {
                onMonthlyPNLClick(currentMonth)
              }
            }}
            className="px-4 py-1.5 bg-gradient-to-r from-gray-700/30 to-gray-600/30 backdrop-blur-md border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-all hover:from-gray-700/40 hover:to-gray-600/40 hover:border-white/20 shadow-lg hover:shadow-xl"
          >
            Flex your monthly PNL
          </button>
        </div>
      </div>
    </div>
  )
}

