"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, DollarSign, ChevronDown } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths, subMonths } from "date-fns"

export type Currency = "SOL" | "BNB" | "BTC" | "ETH" | "USDC" | "USDT" | "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "INR" | "MXN" | "NZD" | "SGD" | "ZAR" | "BRL" | "KRW" | "HKD" | "SEK" | "NOK" | "DKK" | "PLN" | "RUB" | "TRY" | "THB" | "IDR" | "PHP"

interface PNLCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  currency?: Currency
  onCurrencyChange?: (currency: Currency) => void
  onDayClick?: (date: Date) => void
  onMonthlyPNLClick?: (month: Date) => void
}

const CURRENCIES: { value: Currency; label: string; icon?: string }[] = [
  { value: "USD", label: "US Dollar" },
  { value: "EUR", label: "Euro" },
  { value: "GBP", label: "British Pound" },
  { value: "JPY", label: "Japanese Yen" },
  { value: "CAD", label: "Canadian Dollar" },
  { value: "AUD", label: "Australian Dollar" },
  { value: "CHF", label: "Swiss Franc" },
  { value: "CNY", label: "Chinese Yuan" },
  { value: "INR", label: "Indian Rupee" },
  { value: "MXN", label: "Mexican Peso" },
  { value: "NZD", label: "New Zealand Dollar" },
  { value: "SGD", label: "Singapore Dollar" },
  { value: "ZAR", label: "South African Rand" },
  { value: "BRL", label: "Brazilian Real" },
  { value: "KRW", label: "South Korean Won" },
  { value: "HKD", label: "Hong Kong Dollar" },
  { value: "SEK", label: "Swedish Krona" },
  { value: "NOK", label: "Norwegian Krone" },
  { value: "DKK", label: "Danish Krone" },
  { value: "PLN", label: "Polish Złoty" },
  { value: "RUB", label: "Russian Ruble" },
  { value: "TRY", label: "Turkish Lira" },
  { value: "THB", label: "Thai Baht" },
  { value: "IDR", label: "Indonesian Rupiah" },
  { value: "PHP", label: "Philippine Peso" },
]

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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency)
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleCurrencySwitch = (newCurrency: Currency) => {
    setSelectedCurrency(newCurrency)
    onCurrencyChange?.(newCurrency)
    setIsCurrencyDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false)
      }
    }

    if (isCurrencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCurrencyDropdownOpen])

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
    const cryptoCurrencies: Currency[] = ["SOL", "BNB", "BTC", "ETH", "USDC", "USDT"]
    const currencySymbols: Record<Currency, string> = {
      "SOL": "",
      "BNB": "",
      "BTC": "",
      "ETH": "",
      "USDC": "",
      "USDT": "",
      "USD": "$",
      "EUR": "€",
      "GBP": "£",
      "JPY": "¥",
      "CAD": "C$",
      "AUD": "A$",
      "CHF": "CHF",
      "CNY": "¥",
      "INR": "₹",
      "MXN": "$",
      "NZD": "NZ$",
      "SGD": "S$",
      "ZAR": "R",
      "BRL": "R$",
      "KRW": "₩",
      "HKD": "HK$",
      "SEK": "kr",
      "NOK": "kr",
      "DKK": "kr",
      "PLN": "zł",
      "RUB": "₽",
      "TRY": "₺",
      "THB": "฿",
      "IDR": "Rp",
      "PHP": "₱",
    }
    
    if (cryptoCurrencies.includes(selectedCurrency)) {
      return pnl === 0 ? "0" : `${pnl.toFixed(4)}`
    } else {
      const symbol = currencySymbols[selectedCurrency] || "$"
      return pnl === 0 ? `${symbol}0` : `${symbol}${pnl.toFixed(2)}`
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#111111] border border-[#282828] rounded-lg shadow-2xl w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col mx-2 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-4 py-3 border-b border-[#282828]">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white">
              PNL Calendar
          </h2>
            {/* Currency Logos */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => handleCurrencySwitch("SOL")}
                className={`p-0.5 sm:p-1 rounded-lg transition-all ${
                  selectedCurrency === "SOL"
                    ? "bg-[#1a1a1a] ring-2 ring-yellow-500/50"
                    : "hover:bg-[#1a1a1a] opacity-60 hover:opacity-100"
                }`}
                title="Switch to Solana"
              >
                <Image 
                  src="/sol-logo.png" 
                  alt="Solana" 
                  width={14} 
                  height={14} 
                  className="rounded sm:w-4 sm:h-4"
                />
              </button>
              <button
                onClick={() => handleCurrencySwitch("BNB")}
                className={`p-0.5 sm:p-1 rounded-lg transition-all ${
                  selectedCurrency === "BNB"
                    ? "bg-[#1a1a1a] ring-2 ring-yellow-500/50"
                    : "hover:bg-[#1a1a1a] opacity-60 hover:opacity-100"
                }`}
                title="Switch to BNB"
              >
                <Image 
                  src="/bnb-chain-binance-smart-chain-logo.svg" 
                  alt="BNB Chain" 
                  width={14} 
                  height={14} 
                  className="sm:w-4 sm:h-4"
                />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className={`p-0.5 sm:p-1 rounded-lg transition-all ${
                    isCurrencyDropdownOpen 
                      ? "bg-[#1a1a1a] ring-2 ring-yellow-500/50 opacity-100" 
                      : "hover:bg-[#1a1a1a] opacity-60 hover:opacity-100"
                  }`}
                  title="Select Currency"
                >
                  <Image 
                    src="/currencies-icon.svg" 
                    alt="Currencies" 
                    width={14} 
                    height={14} 
                    className="sm:w-4 sm:h-4"
                    style={{ 
                      filter: 'brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(2000%) hue-rotate(0deg) brightness(110%) contrast(150%) drop-shadow(0.5px 0 0.5px currentColor) drop-shadow(-0.5px 0 0.5px currentColor) drop-shadow(0 0.5px 0.5px currentColor) drop-shadow(0 -0.5px 0.5px currentColor) drop-shadow(0.5px 0.5px 0.5px currentColor) drop-shadow(-0.5px -0.5px 0.5px currentColor) drop-shadow(0.5px -0.5px 0.5px currentColor) drop-shadow(-0.5px 0.5px 0.5px currentColor)'
                    }}
                  />
                </button>
                
                {/* Currency Dropdown */}
                {isCurrencyDropdownOpen && (
                  <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 sm:mt-2 w-[calc(100vw-2rem)] sm:w-48 md:w-56 max-w-[280px] bg-[#111111] border border-[#282828] rounded-lg shadow-2xl z-50 max-h-[60vh] sm:max-h-80 overflow-y-auto">
                    <div className="p-1.5 sm:p-2">
                      {CURRENCIES.map((curr) => (
                        <button
                          key={curr.value}
                          onClick={() => handleCurrencySwitch(curr.value)}
                          className={`w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors text-left ${
                            selectedCurrency === curr.value
                              ? "bg-[#1a1a1a] text-yellow-500"
                              : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                          }`}
                        >
                          {curr.icon && (
                            <Image 
                              src={curr.icon} 
                              alt={curr.label} 
                              width={14} 
                              height={14} 
                              className="rounded flex-shrink-0 sm:w-4 sm:h-4"
                            />
                          )}
                          <span className="text-xs sm:text-sm font-medium flex-1 truncate">{curr.label}</span>
                          {selectedCurrency === curr.value && (
                            <span className="ml-auto text-yellow-500 text-xs sm:text-sm flex-shrink-0">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Month Navigation */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-1.5 sm:p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
              </button>
              <h3 className="text-xs sm:text-sm md:text-base font-medium text-white whitespace-nowrap">
                {format(currentMonth, "MMM yyyy")}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-1.5 sm:p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Currency Switch */}
            <button
              onClick={() => {
                // Switch to USD if on crypto, switch to SOL if on fiat
                const cryptoCurrencies: Currency[] = ["SOL", "BNB", "BTC", "ETH", "USDC", "USDT"]
                const fiatCurrencies: Currency[] = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "NZD", "SGD", "ZAR", "BRL", "KRW", "HKD", "SEK", "NOK", "DKK", "PLN", "RUB", "TRY", "THB", "IDR", "PHP"]
                const newCurrency = cryptoCurrencies.includes(selectedCurrency) ? "USD" : "SOL"
                handleCurrencySwitch(newCurrency)
              }}
              className="p-1.5 sm:p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              title={`Switch to ${["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "NZD", "SGD", "ZAR", "BRL", "KRW", "HKD", "SEK", "NOK", "DKK", "PLN", "RUB", "TRY", "THB", "IDR", "PHP"].includes(selectedCurrency) ? "SOL" : "USD"}`}
            >
              <Image 
                src="/icons/ui/switchcurrency-icon.svg" 
                alt="Switch currency" 
                  width={16} 
                  height={16} 
                  className="opacity-60 hover:opacity-100 transition-opacity sm:w-5 sm:h-5"
                style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }}
              />
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
            </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] xs:text-xs sm:text-sm font-medium text-gray-400 py-1 sm:py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                  className={`aspect-square rounded-lg border p-1 sm:p-2 md:p-3 flex flex-col items-center justify-center transition-colors ${
                    isCurrentMonth
                      ? `${pnlColor} cursor-pointer hover:opacity-80`
                      : "bg-[#0a0a0a] border-[#1a1a1a] opacity-50"
                  } ${isCurrentDay ? "ring-1 sm:ring-2 ring-yellow-500/50" : ""}`}
                >
                  <span
                    className={`text-[10px] xs:text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                      isCurrentMonth
                        ? isCurrentDay
                          ? "text-yellow-500"
                          : "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {selectedCurrency === "SOL" && (
                      <Image 
                        src="/sol-logo.png" 
                        alt="Solana" 
                        width={10} 
                        height={10} 
                        className="rounded sm:w-3 sm:h-3"
                      />
                    )}
                    {selectedCurrency === "BNB" && (
                      <Image 
                        src="/bnb-chain-binance-smart-chain-logo.svg" 
                        alt="BNB Chain" 
                        width={10} 
                        height={10} 
                        className="sm:w-3 sm:h-3"
                      />
                    )}
                    <span className={`text-[9px] xs:text-[10px] sm:text-xs font-medium ${pnlTextColor}`}>
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

