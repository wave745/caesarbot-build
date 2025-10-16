"use client";

import React, { useRef, useState, useEffect } from 'react';
import { SimpleMoralisService, MoralisMarketStats } from '@/lib/services/simple-moralis-service';
import { 
  X, 
  BarChart3, 
  Users, 
  Rocket, 
  Link, 
  Star, 
  Send, 
  Hexagon,
  Info,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Circle
} from 'lucide-react';

interface MarketLighthouseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketLighthouseModal({ isOpen, onClose }: MarketLighthouseModalProps) {
  console.log('MarketLighthouseModal render - isOpen:', isOpen);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [marketData, setMarketData] = useState<MoralisMarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Fetch market data based on selected timeframe
  const fetchMarketData = async (timeframe: string = selectedTimeframe, isManualRefresh: boolean = false) => {
    try {
      console.log(`🔄 Fetching market data for ${timeframe} timeframe...`);
      
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      // Calculate time range based on timeframe
      const timeRange = getTimeRange(timeframe);
      console.log(`📊 Time range for ${timeframe}:`, timeRange);
      
      // Use only real data from DexScreener - no dummy/mock data
      const marketService = SimpleMoralisService.getInstance();
      const data = await marketService.getMarketStats(timeframe, timeRange);
      console.log('✅ Successfully fetched real data from DexScreener');
      
      console.log(`✅ Received data for ${timeframe}:`, {
        totalTxs: data.totalTxs,
        traders: data.traders,
        volume24h: data.volume24h,
        created: data.created
      });
      
      setMarketData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching market data:', error);
      // No fallback data - show empty state
      setMarketData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Get time range based on timeframe
  const getTimeRange = (timeframe: string) => {
    const now = new Date();
    const timeRanges = {
      '1h': {
        start: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
        end: now,
        label: '1h'
      },
      '6h': {
        start: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        end: now,
        label: '6h'
      },
      '24h': {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
        end: now,
        label: '24h'
      }
    };
    return timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['24h'];
  };



  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isOpen) {
      // Initial fetch
      fetchMarketData(selectedTimeframe);
      
      // Set up interval for auto-refresh every 30 seconds
      const interval = setInterval(() => {
        console.log(`Auto-refreshing Market Lighthouse data for ${selectedTimeframe} timeframe...`);
        fetchMarketData(selectedTimeframe);
      }, 30000);
      
      return () => {
        console.log('Clearing Market Lighthouse auto-refresh interval');
        clearInterval(interval);
      };
    }
  }, [isOpen, selectedTimeframe]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: string) => {
    console.log(`Switching timeframe from ${selectedTimeframe} to ${timeframe}`);
    setSelectedTimeframe(timeframe);
    setMarketData(null); // Clear current data
    setIsLoading(true); // Show loading state
    fetchMarketData(timeframe);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchMarketData(selectedTimeframe, true);
  };

  // Format numbers with K, M, B suffixes, rounded to nearest 10,000
  const formatNumber = (num: number): string => {
    // Round to nearest 10,000
    const rounded = Math.round(num / 10000) * 10000;
    
    if (rounded >= 1000000000) {
      return `${(rounded / 1000000000).toFixed(1)}B`;
    } else if (rounded >= 1000000) {
      return `${(rounded / 1000000).toFixed(1)}M`;
    } else if (rounded >= 1000) {
      return `${(rounded / 1000).toFixed(1)}K`;
    }
    return rounded.toString();
  };

  // Calculate inner market ratio (buy pressure vs sell pressure)
  const calculateInnerMarketRatio = (buys: number, sells: number): number => {
    const total = buys + sells;
    if (total === 0) return 0;
    return (buys / total) * 100;
  };

  // Detect pump behavior based on volume and price changes
  const detectPumpBehavior = (volume24h: number, volume1h: number, priceChange24h: number): {
    isPumping: boolean;
    pumpScore: number;
    alert: string;
  } => {
    const volumeSpike = volume1h / (volume24h / 24); // Hourly volume vs average
    const priceSpike = Math.abs(priceChange24h);
    
    let pumpScore = 0;
    let alert = '';
    
    if (volumeSpike > 3) pumpScore += 40; // 3x volume spike
    if (volumeSpike > 5) pumpScore += 30; // 5x volume spike
    if (priceSpike > 20) pumpScore += 30; // 20%+ price change
    if (priceSpike > 50) pumpScore += 20; // 50%+ price change
    
    if (pumpScore >= 70) alert = '🚨 HIGH PUMP ALERT';
    else if (pumpScore >= 50) alert = '⚠️ PUMP DETECTED';
    else if (pumpScore >= 30) alert = '📈 VOLUME SPIKE';
    
    return {
      isPumping: pumpScore >= 30,
      pumpScore: Math.min(pumpScore, 100),
      alert
    };
  };

  // Calculate smart money score based on transaction patterns
  const calculateSmartMoneyScore = (avgTxSize: number, txCount: number, uniqueWallets: number): number => {
    let score = 0;
    
    // High average transaction size indicates whales
    if (avgTxSize > 10000) score += 30;
    if (avgTxSize > 50000) score += 20;
    
    // High transaction frequency indicates bots/smart money
    if (txCount > 1000) score += 25;
    if (txCount > 5000) score += 15;
    
    // High unique wallet count indicates organic activity
    if (uniqueWallets > 100) score += 25;
    if (uniqueWallets > 500) score += 15;
    
    return Math.min(score, 100);
  };

  // Calculate composite market score
  const calculateMarketScore = (data: any): number => {
    let score = 0;
    
    // Volume score (0-25 points)
    const volumeScore = Math.min((data.volume24h || 0) / 1000000 * 25, 25);
    score += volumeScore;
    
    // Transaction score (0-25 points)
    const txScore = Math.min((data.totalTxs || 0) / 100000 * 25, 25);
    score += txScore;
    
    // Trader score (0-25 points)
    const traderScore = Math.min((data.traders || 0) / 10000 * 25, 25);
    score += traderScore;
    
    // Pump detection score (0-25 points)
    const pumpData = detectPumpBehavior(data.volume24h || 0, data.volume1h || 0, data.priceChange24h || 0);
    score += (pumpData.pumpScore / 100) * 25;
    
    return Math.min(Math.round(score), 100);
  };

  // Format volume with proper units, rounded to nearest 10,000
  const formatVolume = (num: number): string => {
    // Round to nearest 10,000
    const rounded = Math.round(num / 10000) * 10000;
    
    if (rounded >= 1000000000) {
      return `$${(rounded / 1000000000).toFixed(1)}B`;
    } else if (rounded >= 1000000) {
      return `$${(rounded / 1000000).toFixed(1)}M`;
    } else if (rounded >= 1000) {
      return `$${(rounded / 1000).toFixed(1)}K`;
    }
    return `$${rounded.toFixed(0)}`;
  };

  // Get icon component based on icon type
  const getIconComponent = (iconType: string, size: number = 16) => {
    switch (iconType) {
      case 'pill':
        return <div className="w-4 h-4 bg-green-500 rounded-full"></div>;
      case 'doge':
        return <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🐕</div>;
      case 'refresh':
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">↻</div>;
      case 's':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>;
      case 'hexagon':
        return <Hexagon size={size} className="text-blue-500" />;
      case 'zero':
        return <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg font-bold">0</div>;
      default:
        return <Circle size={size} className="text-gray-500" />;
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div 
        ref={modalRef}
        className="absolute pointer-events-auto"
        style={{
          left: position.x || '50%',
          top: position.y || 'calc(100vh - 20rem)',
          transform: position.x ? 'none' : 'translateX(-50%)',
        }}
      >
        <div className="bg-gray-950/90 backdrop-blur-sm rounded-lg w-[500px] max-h-[600px] border border-gray-800/50 shadow-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(3, 7, 18, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          {/* Header - Draggable */}
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-800/30 cursor-move select-none"
            onMouseDown={handleMouseDown}
            style={{
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)'
            }}
          >
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-white">Market Lighthouse</h2>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {lastUpdated && (
                    <span className="text-xs text-gray-400">
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  {marketData && (
                    <span className="text-xs text-gray-500">
                      {getTimeRange(selectedTimeframe).start.toLocaleTimeString()} - {getTimeRange(selectedTimeframe).end.toLocaleTimeString()}
                    </span>
                  )}
                </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

            {/* Time Frame Selector */}
            <div className="p-4 border-b border-gray-800/30">
              <div className="flex space-x-2">
                {['1h', '6h', '24h'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => handleTimeframeChange(timeframe)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      timeframe === selectedTimeframe
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {timeframe}
                    {timeframe === selectedTimeframe && (
                      <span className="ml-2 text-xs">●</span>
                    )}
                  </button>
                ))}
              </div>
              {isLoading && (
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Loading {selectedTimeframe} data...
                </div>
              )}
            </div>

        {/* Content - Scrollable */}
        <div key={selectedTimeframe} className="p-4 space-y-6 max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400 text-sm">Loading market data...</div>
            </div>
          ) : !marketData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 text-lg mb-2">No Data Available</div>
              <div className="text-gray-500 text-sm text-center mb-4">
                Unable to fetch market data from Moralis API.<br/>
                Please check your API key and try again.
              </div>
              <button
                onClick={() => fetchMarketData(selectedTimeframe, true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Market Intelligence Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Market Intelligence</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-400">Score</div>
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-bold">
                      {calculateMarketScore(marketData)}/100
                    </div>
                  </div>
                </div>
                
                {/* Pump Detection Alert */}
                {(() => {
                  const pumpData = detectPumpBehavior(marketData.volume24h || 0, marketData.volume1h || 0, marketData.priceChange24h || 0);
                  if (pumpData.isPumping) {
                    return (
                      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30">
                        <div className="flex items-center space-x-2">
                          <div className="text-red-400 font-bold">{pumpData.alert}</div>
                          <div className="text-sm text-gray-300">Pump Score: {pumpData.pumpScore}/100</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

            {/* Key Metrics - Match Image Layout */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Total TXs Card */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">Total TXs</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {marketData && marketData.totalTxsChange < 0 ? (
                      <TrendingDown size={12} className="text-red-400" />
                    ) : (
                      <TrendingUp size={12} className="text-green-400" />
                    )}
                    <span className={`text-xs ${marketData.totalTxsChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {marketData.totalTxsChange > 0 ? '+' : ''}{marketData.totalTxsChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatNumber(marketData.totalTxs)}
                </div>
              </div>

              {/* Traders Card */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">Traders</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {marketData && marketData.tradersChange < 0 ? (
                      <TrendingDown size={12} className="text-red-400" />
                    ) : (
                      <TrendingUp size={12} className="text-green-400" />
                    )}
                    <span className={`text-xs ${marketData.tradersChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {marketData.tradersChange > 0 ? '+' : ''}{marketData.tradersChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatNumber(marketData.traders)}
                </div>
              </div>
            </div>

            {/* 24h Volume Bar - Match Image */}
            <div className="mb-6">
              <div className="text-gray-300 text-sm mb-2">24h Vol</div>
              <div className="flex items-center space-x-2">
                {/* Green segment */}
                <div className="flex-1 bg-green-500/20 rounded-l-lg p-3 border border-green-500/30">
                  <div className="text-green-400 text-sm font-medium">
                    {formatNumber(marketData.volume24hBuys || 0)} / {formatVolume(marketData.volume24hBuys || 0)}
                  </div>
                </div>
                {/* Red segment */}
                <div className="flex-1 bg-red-500/20 rounded-r-lg p-3 border border-red-500/30">
                  <div className="text-red-400 text-sm font-medium">
                    {formatNumber(marketData.volume24hSells || 0)} / {formatVolume(marketData.volume24hSells || 0)}
                  </div>
                </div>
              </div>
              <div className="text-right mt-2">
                <span className="text-white font-medium">{formatVolume(marketData.volume24h)}</span>
                <span className={`ml-2 text-sm ${marketData.volume24hChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {marketData.volume24hChange > 0 ? '+' : ''}{marketData.volume24hChange.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Created & Migrations - Match Image */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🚀</span>
                  </div>
                  <span className="text-gray-300 text-sm">Created</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatNumber(marketData.created)}
                </div>
                <div className={`text-xs ${marketData.createdChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {marketData.createdChange > 0 ? '+' : ''}{marketData.createdChange.toFixed(2)}%
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔗</span>
                  </div>
                  <span className="text-gray-300 text-sm">Migrations</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatNumber(marketData.migrations)}
                </div>
                <div className={`text-xs ${marketData.migrationsChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {marketData.migrationsChange > 0 ? '+' : ''}{marketData.migrationsChange.toFixed(2)}%
                </div>
              </div>
            </div>

              {/* Volume Section */}
              <div className="rounded-lg p-4 min-w-0 overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{selectedTimeframe} Vol</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {formatVolume(marketData.volume24h)}
                    </div>
                    <div className="flex items-center space-x-1">
                      {marketData && marketData.volume24hChange < 0 ? (
                        <TrendingDown size={12} className="text-red-400" />
                      ) : (
                        <TrendingUp size={12} className="text-green-400" />
                      )}
                      <span className={`text-xs ${marketData.volume24hChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {marketData.volume24hChange > 0 ? '+' : ''}{marketData.volume24hChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                  <div className="flex h-full">
                    <div className="bg-green-500 rounded-l-full" style={{ 
                      width: `${(marketData.volume24hBuys / marketData.volume24h) * 100}%` 
                    }}></div>
                    <div className="bg-red-500 rounded-r-full" style={{ 
                      width: `${(marketData.volume24hSells / marketData.volume24h) * 100}%` 
                    }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-green-400">
                    {formatNumber(marketData.volume24hBuys / 1000)} / {formatVolume(marketData.volume24hBuys)}
                  </div>
                  <div className="text-red-400">
                    {formatNumber(marketData.volume24hSells / 1000)} / {formatVolume(marketData.volume24hSells)}
                  </div>
                </div>
              </div>

              {/* Created & Migrations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg p-4 min-w-0 overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Rocket size={16} className="text-gray-400" />
                      <span className="text-gray-300 text-sm">Created</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {marketData && marketData.createdChange < 0 ? (
                        <TrendingDown size={12} className="text-red-400" />
                      ) : (
                        <TrendingUp size={12} className="text-green-400" />
                      )}
                      <span className={`text-xs ${marketData.createdChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {marketData.createdChange > 0 ? '+' : ''}{marketData.createdChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(marketData.created)}
                  </div>
                </div>
                <div className="rounded-lg p-4 min-w-0 overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Link size={16} className="text-gray-400" />
                      <span className="text-gray-300 text-sm">Migrations</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {marketData && marketData.migrationsChange < 0 ? (
                        <TrendingDown size={12} className="text-red-400" />
                      ) : (
                        <TrendingUp size={12} className="text-green-400" />
                      )}
                      <span className={`text-xs ${marketData.migrationsChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {marketData.migrationsChange > 0 ? '+' : ''}{marketData.migrationsChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(marketData.migrations)}
                  </div>
                </div>
              </div>

              {/* Top Launchpads */}
              <div className="rounded-lg p-4 min-w-0 overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 className="text-sm font-semibold text-white mb-3">Top Launchpads</h3>
                <div className="space-y-3">
                  {marketData?.topLaunchpads && marketData.topLaunchpads.length > 0 ? (
                    marketData.topLaunchpads.map((launchpad, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center">
                            {getIconComponent(launchpad.icon, 16)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {formatVolume(launchpad.volume)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {launchpad.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {launchpad.change < 0 ? (
                            <TrendingDown size={12} className="text-red-400" />
                          ) : (
                            <TrendingUp size={12} className="text-green-400" />
                          )}
                          <span className={`text-sm ${launchpad.change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {launchpad.change > 0 ? '+' : ''}{launchpad.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                      No launchpad data available
                    </div>
                  )}
                </div>
              </div>

              {/* Top Protocols */}
              <div className="rounded-lg p-4 min-w-0 overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 className="text-sm font-semibold text-white mb-3">Top Protocols</h3>
                <div className="space-y-3">
                  {marketData?.topProtocols && marketData.topProtocols.length > 0 ? (
                    marketData.topProtocols.map((protocol, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center">
                            {getIconComponent(protocol.icon, 16)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {formatVolume(protocol.volume)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {protocol.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {protocol.change < 0 ? (
                            <TrendingDown size={12} className="text-red-400" />
                          ) : (
                            <TrendingUp size={12} className="text-green-400" />
                          )}
                          <span className={`text-sm ${protocol.change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {protocol.change > 0 ? '+' : ''}{protocol.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                      No protocol data available
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Runners */}
              <div className="rounded-lg p-4 min-w-0 overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white">Today's Runners (1)</h3>
                    <Info size={14} className="text-gray-400" />
                  </div>
                <div className="flex items-center space-x-2">
                  <ChevronLeft size={16} className="text-gray-400 cursor-pointer hover:text-white" />
                  <span className="text-gray-300 text-sm">
                    {marketData ? getTimeRange(selectedTimeframe).start.toLocaleDateString() : 'Loading...'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400 cursor-pointer hover:text-white" />
                </div>
                </div>
                <div className="text-sm text-gray-400 mb-3">MC / {selectedTimeframe}%</div>
                {marketData?.todaysRunners && marketData.todaysRunners.length > 0 ? (
                  marketData.todaysRunners.map((runner, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getIconComponent(runner.icon, 40)}
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium text-sm">{runner.symbol}</span>
                          <span className="text-gray-400 text-sm">{runner.age}</span>
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                          </div>
                          <Info size={14} className="text-gray-400" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-sm">
                          {formatVolume(runner.marketCap)}
                        </div>
                        <div className={`text-sm ${runner.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {runner.change24h >= 0 ? '+' : ''}{runner.change24h >= 1000 ? `${(runner.change24h / 1000).toFixed(1)}K` : runner.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">
                    No runners found in {selectedTimeframe}
                  </div>
                )}
              </div>

              {/* Smart Money Analysis */}
              <div className="rounded-lg p-4 min-w-0 overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white">Smart Money Analysis</h3>
                    <Info size={14} className="text-gray-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {calculateSmartMoneyScore(
                        (marketData.volume24h || 0) / (marketData.totalTxs || 1),
                        marketData.totalTxs || 0,
                        marketData.traders || 0
                      )}
                    </div>
                    <div className="text-xs text-gray-400">Smart Money Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round((marketData.volume24h || 0) / (marketData.totalTxs || 1))}
                    </div>
                    <div className="text-xs text-gray-400">Avg TX Size ($)</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round((marketData.traders || 0) / (marketData.totalTxs || 1) * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">Unique Wallet %</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-2">Market Health Indicators</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Whale Activity</span>
                      <span className={`text-sm font-medium ${
                        calculateSmartMoneyScore(
                          (marketData.volume24h || 0) / (marketData.totalTxs || 1),
                          marketData.totalTxs || 0,
                          marketData.traders || 0
                        ) > 50 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {calculateSmartMoneyScore(
                          (marketData.volume24h || 0) / (marketData.totalTxs || 1),
                          marketData.totalTxs || 0,
                          marketData.traders || 0
                        ) > 50 ? 'High' : 'Medium'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Bot Activity</span>
                      <span className={`text-sm font-medium ${
                        (marketData.totalTxs || 0) > 5000 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {(marketData.totalTxs || 0) > 5000 ? 'High' : 'Medium'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Organic Growth</span>
                      <span className={`text-sm font-medium ${
                        (marketData.traders || 0) > 500 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {(marketData.traders || 0) > 500 ? 'High' : 'Medium'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Active Traders</span>
                      <span className="text-sm font-medium text-blue-400">
                        {((marketData.traders || 0) / (marketData.totalTxs || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
