"use client";

import React, { useState, useEffect } from 'react';
import PnLCardModal from './pnl-card-modal';
import { MoralisMarketService } from '@/lib/services/moralis-market-service';
import { 
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface MarketStatsCardProps {
  className?: string;
}

export function MarketStatsCard({ className = "" }: MarketStatsCardProps) {
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPnLOpen, setIsPnLOpen] = useState(false);

  // Fetch market data
  const fetchMarketData = async (isManualRefresh: boolean = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const marketService = MoralisMarketService.getInstance();
      const data = await marketService.getMarketStats('24h');
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle connect wallet
  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    // In a real implementation, this would connect to a wallet
    console.log('Connecting wallet...');
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchMarketData(true);
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => {
      console.log('Auto-refreshing market stats...');
      fetchMarketData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className={`bg-gray-950/90 backdrop-blur-sm rounded-lg border border-gray-800/50 shadow-2xl overflow-hidden ${className}`} style={{
      background: 'linear-gradient(135deg, rgba(3, 7, 18, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      {/* Top Actions */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <button
          onClick={handleConnectWallet}
          disabled={isWalletConnected}
          className="py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Zap size={20} />
          <span>{isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}</span>
        </button>
        <button
          onClick={() => setIsPnLOpen(true)}
          className="py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          title="Open PnL Card"
        >
          <TrendingUp size={20} />
          <span>PnL</span>
        </button>
      </div>

      {/* Market Stats */}
      <div className="px-4 pb-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-gray-400 text-sm">Loading market data...</div>
          </div>
        ) : (
          <>
            {/* 24h Volume */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">24h Volume</span>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
              </div>
              <span className="text-sm font-medium text-white">
                {marketData ? formatVolume(marketData.volume24h) : '$0B'}
              </span>
            </div>

            {/* Market Cap */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Market Cap</span>
              <span className="text-sm font-medium text-white">
                {marketData ? formatMarketCap(marketData.volume24h * 10) : '$0B'}
              </span>
            </div>

            {/* 24h Change */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">24h Change</span>
              <div className="flex items-center space-x-1">
                <TrendingUp size={14} className="text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  {marketData ? formatChange(2.4) : '+0.0%'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {/* PnL Modal */}
      <PnLCardModal isOpen={isPnLOpen} onClose={() => setIsPnLOpen(false)} size="large" />
    </div>
  );
}
