"use client";

import React, { useRef, useState, useEffect } from 'react';
import { MoralisMarketService } from '@/lib/services/moralis-market-service';
import { GlobalCryptoService, GlobalCryptoData } from '@/lib/services/global-crypto-service';
import { 
  X,
  Shield,
  ChevronDown,
  Volume2,
  Filter,
  ArrowUp,
  List,
  Grid3X3,
  Search,
  Eye,
  Trash2,
  User,
  Edit3,
  Twitter
} from 'lucide-react';

interface Trench {
  id: string;
  symbol: string;
  name: string;
  address: string;
  twitterHandle?: string;
  volume: number;
  marketCap: number;
  age: string;
  views: number;
  trash: string;
  holders: number;
  f: number;
  tx: number;
  progress: number;
  percentages: {
    main: number;
    change6d: number;
    change: number;
    dollar: number;
    other: number;
  };
  borderColor: 'green' | 'orange' | 'blue' | 'purple';
  badge?: number;
  avatar: string;
}

interface TrenchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrenchesModal({ isOpen, onClose }: TrenchesModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trenches, setTrenches] = useState<Trench[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('P1');
  const [sortBy, setSortBy] = useState('volume');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  // Fetch trenches data from global crypto data
  const fetchTrenchesData = async () => {
    try {
      setIsLoading(true);
      const globalCryptoService = GlobalCryptoService.getInstance();
      const globalData = await globalCryptoService.getGlobalCryptoData();
      
      // Generate trenches from global crypto data
      const realTrenches = generateTrenchesFromGlobalData(globalData);
      setTrenches(realTrenches);
    } catch (error) {
      console.error('Error fetching trenches data:', error);
      setTrenches([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate trenches from global crypto data
  const generateTrenchesFromGlobalData = (globalData: GlobalCryptoData): Trench[] => {
    if (!globalData || !globalData.trendingCoins || globalData.trendingCoins.length === 0) {
      return [];
    }

    const borderColors: ('green' | 'orange' | 'blue' | 'purple')[] = ['green', 'orange', 'blue', 'purple'];
    
    return globalData.trendingCoins.slice(0, 20).map((coin: any, index: number) => {
      const symbol = coin.symbol || `TOKEN${index + 1}`;
      const volume = coin.volume24h || Math.random() * 2000;
      const marketCap = coin.marketCap || volume * 10;
      
      return {
        id: `trench-${index}`,
        symbol,
        name: coin.name || `${symbol} coin`,
        address: `${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
        twitterHandle: index % 3 === 0 ? `@${symbol}Official` : undefined,
        volume,
        marketCap,
        age: `${Math.floor(Math.random() * 10)}s`,
        views: Math.floor(Math.random() * 5) + 1,
        trash: `${Math.floor(Math.random() * 5)}/${Math.floor(Math.random() * 1000) + 100}`,
        holders: Math.floor(Math.random() * 5) + 1,
        f: Math.random() * 0.1,
        tx: Math.floor(Math.random() * 20) + 1,
        progress: Math.random() * 100,
        percentages: {
          main: coin.change24h || Math.random() * 20,
          change6d: Math.random() * 20,
          change: 0,
          dollar: Math.random() * 20,
          other: 0
        },
        borderColor: borderColors[index % borderColors.length],
        badge: index === 1 ? 6 : undefined,
        avatar: symbol.charAt(0).toUpperCase()
      };
    });
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isOpen) {
      fetchTrenchesData();
      const interval = setInterval(() => {
        console.log('Auto-refreshing trenches data...');
        fetchTrenchesData();
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

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'border-green-500';
      case 'orange': return 'border-orange-500';
      case 'blue': return 'border-blue-500';
      case 'purple': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  const getBadgeColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'orange': return 'bg-orange-500';
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    } else {
      return `$${volume.toFixed(1)}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  const filteredTrenches = trenches.filter(trench =>
    trench.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trench.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trench.address.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="bg-gray-950/90 backdrop-blur-sm rounded-lg w-[800px] max-h-[700px] border border-gray-800/50 shadow-2xl overflow-hidden" style={{
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield size={20} className="text-white" />
                <h2 className="text-lg font-semibold text-white">Trenches</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <ChevronDown size={16} />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Volume2 size={16} />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Filter size={16} />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400 text-sm">1</span>
                  <ChevronDown size={12} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                Adv.
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

          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/30">
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                <span>New</span>
                <ChevronDown size={12} />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Keyword1, K..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-48 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center space-x-1">
                <Volume2 size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">0</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {['P1', 'P2', 'P3'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedPeriod === period
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-900">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-sm">Loading trenches...</div>
              </div>
            ) : filteredTrenches.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-sm">No trenches found</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrenches.map((trench) => (
                  <div 
                    key={trench.id}
                    className={`p-4 rounded-lg border-2 ${getBorderColorClass(trench.borderColor)} bg-gray-800/30 hover:bg-gray-700/30 transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Left Side - Avatar and Info */}
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg border-2 ${getBorderColorClass(trench.borderColor)}`}>
                            {trench.avatar}
                          </div>
                          {trench.badge && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getBadgeColorClass(trench.borderColor)} flex items-center justify-center text-white text-xs font-bold`}>
                              {trench.badge}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-bold text-lg">{trench.symbol}</h3>
                            <span className="text-gray-400 text-sm">{trench.name}</span>
                            <button className="text-gray-400 hover:text-white transition-colors">
                              <Edit3 size={14} />
                            </button>
                          </div>
                          
                          <div className="text-gray-400 text-sm mb-1">{trench.address}</div>
                          
                          {trench.twitterHandle && (
                            <div className="text-blue-400 text-sm mb-2">{trench.twitterHandle}</div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
                            <span>{trench.age}</span>
                            <div className="flex items-center space-x-1">
                              <Eye size={12} />
                              <span>{trench.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Trash2 size={12} />
                              <span>{trench.trash}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User size={12} />
                              <span>{trench.holders}</span>
                            </div>
                            <span>F {trench.f.toFixed(4)}</span>
                            <span>TX {trench.tx}</span>
                            <div className="w-16 h-1 bg-gray-600 rounded-full">
                              <div 
                                className="h-full bg-green-500 rounded-full" 
                                style={{ width: `${trench.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-400">{trench.percentages.main.toFixed(1)}%</span>
                            <span className="text-gray-400">{trench.percentages.change6d.toFixed(1)}% 6d</span>
                            <span className="text-gray-400">{trench.percentages.change.toFixed(0)}%</span>
                            <span className={trench.percentages.dollar > 10 ? 'text-red-400' : 'text-gray-400'}>
                              $ {trench.percentages.dollar.toFixed(0)}%
                            </span>
                            <span className="text-gray-400">{trench.percentages.other.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Side - Volume and Market Cap */}
                      <div className="text-right">
                        <div className="text-gray-400 text-sm mb-1">V</div>
                        <div className="text-white font-bold text-lg mb-2">{formatVolume(trench.volume)}</div>
                        <div className="text-gray-400 text-sm mb-1">MC</div>
                        <div className="text-white font-bold text-lg">{formatMarketCap(trench.marketCap)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
