"use client";

import React, { useRef, useState, useEffect } from 'react';
import { MoralisMarketService } from '@/lib/services/moralis-market-service';
import { 
  X,
  Trophy, 
  Medal, 
  Award,
  Info,
  MoreVertical,
  ChevronDown,
  List,
  Grid3X3,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

interface RankingEntry {
  rank: number;
  userId: string;
  avatar: string;
  value: number;
  change: number;
}

interface TodaysRankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TodaysRankingsModal({ isOpen, onClose }: TodaysRankingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'value' | 'change'>('value');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Fetch real rankings data
  const fetchRankingsData = async (isManualRefresh: boolean = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const marketService = MoralisMarketService.getInstance();
      const marketData = await marketService.getMarketStats('24h');
      
      // Generate rankings from real market data
      const realRankings = generateRankingsFromMarketData(marketData);
      setRankings(realRankings);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching rankings data:', error);
      setRankings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Generate rankings from real market data
  const generateRankingsFromMarketData = (marketData: any): RankingEntry[] => {
    if (!marketData || !marketData.todaysRunners || marketData.todaysRunners.length === 0) {
      return [];
    }

    // Use real token data to create rankings
    return marketData.todaysRunners.map((token: any, index: number) => ({
      rank: index + 1,
      userId: token.symbol || `Token${index + 1}`,
      avatar: token.symbol?.charAt(0) || 'T',
      value: token.marketCap || 0,
      change: token.change24h || 0
    }));
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isOpen) {
      fetchRankingsData();
      const interval = setInterval(() => {
        console.log('Auto-refreshing rankings data...');
        fetchRankingsData();
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={20} className="text-yellow-500" />;
      case 2:
        return <Medal size={20} className="text-gray-400" />;
      case 3:
        return <Award size={20} className="text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{rank}</span>
          </div>
        );
    }
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-orange-500', 
      'bg-green-500',
      'bg-gray-500',
      'bg-purple-500',
      'bg-cyan-500',
      'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `+$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `+$${(value / 1000).toFixed(1)}K`;
    } else {
      return `+$${value.toFixed(0)}`;
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchRankingsData(true);
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortBy(sortBy === 'value' ? 'change' : 'value');
  };

  // Handle view mode toggle
  const handleViewModeToggle = (mode: 'list' | 'grid') => {
    setViewMode(mode);
  };

  // Handle pagination
  const handlePageChange = (direction: 'prev' | 'next') => {
    const totalPages = Math.ceil(rankings.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };



  const sortedRankings = [...rankings].sort((a, b) => {
    if (sortBy === 'value') {
      return b.value - a.value;
    } else {
      return b.change - a.change;
    }
  });

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
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-white">Today's Rankings</h2>
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh rankings"
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

          {/* Sub Header with Controls */}
          <div className="flex items-center justify-between p-3 border-b border-gray-800/30">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-white">Today's Rankings</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                title="Rankings information"
              >
                <Info size={14} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                title="More options"
              >
                <MoreVertical size={16} />
              </button>
              <button 
                onClick={handleSortToggle}
                className="text-gray-400 hover:text-white transition-colors"
                title={`Sort by ${sortBy === 'value' ? 'change' : 'value'}`}
              >
                <ChevronDown size={16} />
              </button>
              <button 
                onClick={() => handleViewModeToggle('list')}
                className={`transition-colors ${viewMode === 'list' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                title="List view"
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => handleViewModeToggle('grid')}
                className={`transition-colors ${viewMode === 'grid' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                title="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Previous page"
                >
                  <ChevronUp size={12} />
                </button>
                <span className="text-xs text-gray-300">{currentPage}</span>
                <button 
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage >= Math.ceil(rankings.length / itemsPerPage)}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Next page"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-900">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-sm">Loading rankings...</div>
              </div>
            ) : rankings.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-sm">No ranking data available</div>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedRankings
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((entry, index) => (
                  <div 
                    key={entry.rank}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.2) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {getRankIcon(entry.rank)}
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-bold text-sm`}>
                        {entry.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {entry.userId}
                        </div>
                        <div className="text-xs text-gray-400">
                          {sortBy === 'value' ? 'Market Cap' : '24h Change'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        {formatValue(sortBy === 'value' ? entry.value : entry.change)}
                      </div>
                      {sortBy === 'value' && (
                        <div className="text-xs text-gray-400">
                          {entry.change > 0 ? '+' : ''}{entry.change.toFixed(1)}%
                        </div>
                      )}
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
