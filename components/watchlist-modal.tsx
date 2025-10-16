"use client";

import React, { useRef, useState, useEffect } from 'react';
import { MoralisMarketService } from '@/lib/services/moralis-market-service';
import { GlobalCryptoService, GlobalCryptoData } from '@/lib/services/global-crypto-service';
import { 
  X,
  Search,
  Filter,
  Plus,
  Eye,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Trash2
} from 'lucide-react';

interface WatchlistToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  avatar: string;
  marketCap: number;
  volume24h: number;
}

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WatchlistModal({ isOpen, onClose }: WatchlistModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddToken, setShowAddToken] = useState(false);
  const [newTokenSymbol, setNewTokenSymbol] = useState('');

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

  // Fetch watchlist data from global crypto data
  const fetchWatchlistData = async () => {
    try {
      setIsLoading(true);
      const globalCryptoService = GlobalCryptoService.getInstance();
      const globalData = await globalCryptoService.getGlobalCryptoData();
      
      // Generate watchlist from global crypto data
      const realWatchlist = generateWatchlistFromGlobalData(globalData);
      setWatchlist(realWatchlist);
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
      setWatchlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate watchlist from global crypto data
  const generateWatchlistFromGlobalData = (globalData: GlobalCryptoData): WatchlistToken[] => {
    if (!globalData || !globalData.trendingCoins || globalData.trendingCoins.length === 0) {
      return [];
    }

    // Use global crypto data to create watchlist
    return globalData.trendingCoins.slice(0, 15).map((coin: any, index: number) => ({
      symbol: coin.symbol || `TOKEN${index + 1}`,
      name: coin.name || `Token ${index + 1}`,
      price: coin.price || Math.random() * 1000,
      change24h: coin.change24h || 0,
      avatar: coin.symbol?.charAt(0) || 'T',
      marketCap: coin.marketCap || 0,
      volume24h: coin.volume24h || 0
    }));
  };

  // Add token to watchlist
  const handleAddToken = async () => {
    if (!newTokenSymbol.trim()) return;
    
    try {
      // In a real implementation, you would fetch token data from an API
      // For now, we'll create a placeholder token
      const newToken: WatchlistToken = {
        symbol: newTokenSymbol.toUpperCase(),
        name: newTokenSymbol.toUpperCase(),
        price: Math.random() * 1000,
        change24h: (Math.random() - 0.5) * 20,
        avatar: newTokenSymbol.charAt(0).toUpperCase(),
        marketCap: Math.random() * 1000000000,
        volume24h: Math.random() * 100000000
      };
      
      setWatchlist(prev => [...prev, newToken]);
      setNewTokenSymbol('');
      setShowAddToken(false);
    } catch (error) {
      console.error('Error adding token:', error);
    }
  };

  // Remove token from watchlist
  const handleRemoveToken = (symbol: string) => {
    setWatchlist(prev => prev.filter(token => token.symbol !== symbol));
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isOpen) {
      fetchWatchlistData();
      const interval = setInterval(() => {
        console.log('Auto-refreshing watchlist data...');
        fetchWatchlistData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-yellow-500'
    ];
    return colors[index % colors.length];
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const filteredWatchlist = watchlist.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div 
        ref={modalRef}
        className="absolute pointer-events-auto"
        style={{
          left: position.x || '50%',
          top: position.y || '50%',
          transform: position.x ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-gray-950/90 backdrop-blur-sm rounded-lg w-96 max-h-[600px] border border-gray-800/50 shadow-2xl overflow-hidden" style={{
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
            <h2 className="text-lg font-semibold text-white">Watchlist</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-gray-800/30">
            <div className="flex items-center space-x-3">
              <button
                className="text-gray-400 hover:text-white transition-colors"
                title="Search tokens"
              >
                <Search size={18} />
              </button>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                title="Filter tokens"
              >
                <Filter size={18} />
              </button>
              <button
                onClick={() => setShowAddToken(true)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Add token"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-3 py-2 border-b border-gray-800/30">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded text-black placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-900">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-sm">Loading watchlist...</div>
              </div>
            ) : filteredWatchlist.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-sm">
                  {searchQuery ? 'No tokens found' : 'No tokens in watchlist'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredWatchlist.map((token, index) => (
                  <div 
                    key={token.symbol}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.2) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-bold text-sm`}>
                        {token.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {token.symbol}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {formatPrice(token.price)}
                        </div>
                        <div className={`text-xs flex items-center ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.change24h >= 0 ? (
                            <TrendingUp size={12} className="mr-1" />
                          ) : (
                            <TrendingDown size={12} className="mr-1" />
                          )}
                          {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View token details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveToken(token.symbol)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-white transition-colors"
                        title="More options"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Token Section */}
            {showAddToken && (
              <div className="mt-4 p-4 border-2 border-dashed border-gray-600 rounded-lg">
                <div className="text-center">
                  <Plus size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-3">Add tokens to your watchlist</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Token symbol (e.g., BTC)"
                      value={newTokenSymbol}
                      onChange={(e) => setNewTokenSymbol(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded text-black placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleAddToken}
                      className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center space-x-1"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowAddToken(false)}
                    className="mt-2 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add Token Button (when not showing form) */}
            {!showAddToken && (
              <div className="mt-4 p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors cursor-pointer" onClick={() => setShowAddToken(true)}>
                <div className="text-center">
                  <Plus size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-3">Add tokens to your watchlist</p>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-1 mx-auto">
                    <Plus size={16} />
                    <span>Add Token</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
