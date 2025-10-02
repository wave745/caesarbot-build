"use client"

import { useState, useEffect } from "react"
import { 
  ChevronDown, 
  Settings, 
  Zap, 
  RotateCcw
} from "lucide-react"
import BitqueryService from "@/lib/services/bitquery-service"

interface Trade {
  id: string
  age: string
  tipPrio: string
  side: 'Buy' | 'Sell'
  mcap: string
  amount: string
  totalUsd: string
  totalSol: string
  maker: string
  makerIcon: 'blue' | 'pink'
  hasDropdown?: boolean
}

interface TradesTableProps {
  contractAddress: string
}

export function TradesTable({ contractAddress }: TradesTableProps) {
  const [activeTab, setActiveTab] = useState('Trades')
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real trading data
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setIsLoading(true)
        
        // Use BitqueryService to fetch real trades
        const bitqueryService = BitqueryService.getInstance()
        const realTrades = await bitqueryService.getTokenTrades(contractAddress, 20)
        
        if (realTrades && realTrades.length > 0) {
          // Transform Bitquery data to our Trade interface
          const transformedTrades: Trade[] = realTrades.map((trade: any, index: number) => {
            const blockTime = new Date(trade.Block?.Time || Date.now())
            const now = new Date()
            const diffInSeconds = Math.floor((now.getTime() - blockTime.getTime()) / 1000)
            
            let age = '0s'
            if (diffInSeconds < 60) {
              age = `${diffInSeconds}s`
            } else if (diffInSeconds < 3600) {
              age = `${Math.floor(diffInSeconds / 60)}m`
            } else {
              age = `${Math.floor(diffInSeconds / 3600)}h`
            }
            
            return {
              id: `real-${index}`,
              age,
              tipPrio: '0.0000',
              side: trade.Trade?.Side?.Type === 'buy' ? 'Buy' : 'Sell',
              mcap: trade.Trade?.PriceInUSD ? `$${(trade.Trade.PriceInUSD * trade.Trade.Amount).toFixed(2)}` : '$0',
              amount: trade.Trade?.Amount ? `${(trade.Trade.Amount / 1000000).toFixed(2)}M` : '0',
              totalUsd: trade.Trade?.PriceInUSD ? `$${trade.Trade.PriceInUSD.toFixed(2)}` : '$0',
              totalSol: trade.Trade?.Price ? `SOL ${trade.Trade.Price.toFixed(4)}` : 'SOL 0',
              maker: trade.Transaction?.Signer ? `${trade.Transaction.Signer.slice(0, 8)}...` : 'Unknown',
              makerIcon: trade.Trade?.Side?.Type === 'buy' ? 'blue' : 'pink',
              hasDropdown: false
            }
          })
          
          setTrades(transformedTrades)
        } else {
          // Fallback to empty array if no real trades found
          setTrades([])
        }
      } catch (error) {
        console.error('Error fetching trades:', error)
        // Fallback to empty array on error
        setTrades([])
      } finally {
        setIsLoading(false)
      }
    }

    if (contractAddress) {
      fetchTrades()
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        fetchTrades()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [contractAddress])

  const tabs = [
    'Trades',
    'Positions', 
    'Orders',
    'Holders (3)',
    'Top Traders',
    'Dev Tokens (1)'
  ]


  const getMakerIcon = (type: 'blue' | 'pink') => {
    if (type === 'blue') {
      return (
        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )
    } else {
      return (
        <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )
    }
  }

  return (
    <div className="bg-[#0b0d0e] border-t border-zinc-800">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-md hover:from-yellow-300 hover:to-yellow-500 transition-all duration-200 shadow-lg shadow-yellow-500/25">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Instant trade</span>
          </button>
        </div>
      </div>

      {/* Feed is live indicator */}
      <div className="px-4 py-1">
        <span className="text-xs text-green-400">Feed is live</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4">
                <button className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                  Age <ChevronDown className="w-3 h-3" />
                </button>
              </th>
              
              <th className="text-left py-3 px-4">
                <span className="text-xs font-medium text-gray-400">Tip & Prio</span>
              </th>
              
              <th className="text-left py-3 px-4">
                <span className="text-xs font-medium text-gray-400">Side</span>
              </th>
              
              <th className="text-left py-3 px-4">
                <button className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                  MCap <RotateCcw className="w-3 h-3" />
                </button>
              </th>
              
              <th className="text-left py-3 px-4">
                <span className="text-xs font-medium text-gray-400">Amount</span>
              </th>
              
              <th className="text-left py-3 px-4">
                <button className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                  <ChevronDown className="w-3 h-3" /> Total USD
                </button>
              </th>
              
              <th className="text-left py-3 px-4">
                <span className="text-xs font-medium text-gray-400">Total SOL</span>
              </th>
              
              <th className="text-left py-3 px-4">
                <button className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                  <ChevronDown className="w-3 h-3" /> Maker
                </button>
              </th>
              
              <th className="text-right py-3 px-4">
                <button className="p-1 hover:bg-zinc-800 rounded transition-colors">
                  <Settings className="w-3 h-3 text-gray-400" />
                </button>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Loading trades...
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No trades found
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
              <tr key={trade.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/20 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-300">{trade.age}</span>
                </td>
                
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${
                    trade.side === 'Buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.tipPrio}
                  </span>
                </td>
                
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${
                    trade.side === 'Buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.side}
                  </span>
                </td>
                
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-300">{trade.mcap}</span>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{trade.amount}</span>
                    <div className={`w-1 h-6 rounded-full ${
                      trade.side === 'Buy' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${
                    trade.side === 'Buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.totalUsd}
                  </span>
                </td>
                
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-300">{trade.totalSol}</span>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getMakerIcon(trade.makerIcon)}
                    <span className="text-sm text-gray-300">{trade.maker}</span>
                    {trade.hasDropdown && (
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  {/* Empty cell for settings column */}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
