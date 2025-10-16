"use client";

import React, { useState } from 'react';
import { 
  Shovel, 
  Hand, 
  Star, 
  BarChart3, 
  Trophy, 
  Lightbulb, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { MarketLighthouseModal } from './market-lighthouse-modal';
import { TodaysRankingsModal } from './todays-rankings-modal';
import { WatchlistModal } from './watchlist-modal';
import { TradeModal } from './trade-modal';
import { TrenchesModal } from './trenches-modal';
import PnLCardModal from './pnl-card-modal';

export function Footer() {
  const [isMarketLighthouseOpen, setIsMarketLighthouseOpen] = useState(false);
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isPnLCardOpen, setIsPnLCardOpen] = useState(false);
  const [isTrenchesOpen, setIsTrenchesOpen] = useState(false);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-3 z-50">
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Navigation/Tools */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsTrenchesOpen(true)}
            className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <Shovel size={16} />
            <span className="text-sm">Trenches</span>
          </button>
          <div className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer transition-colors">
            <Hand size={16} />
            <span className="text-sm">Holding</span>
          </div>
          <button
            onClick={() => setIsWatchlistOpen(true)}
            className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <Star size={16} />
            <span className="text-sm">Watchlist</span>
          </button>
          <button
            onClick={() => setIsTradeOpen(true)}
            className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <BarChart3 size={16} />
            <span className="text-sm">Trade</span>
          </button>
          <button
            onClick={() => setIsRankingsOpen(true)}
            className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <Trophy size={16} />
            <span className="text-sm">Rank</span>
          </button>
          <button
            onClick={() => setIsPnLCardOpen(true)}
            className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <TrendingUp size={16} />
            <span className="text-sm">PnL</span>
          </button>
        </div>

        {/* Middle Section - Market Lighthouse */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMarketLighthouseOpen(true)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <Lightbulb size={16} />
            <span className="text-sm">Market Lighthouse</span>
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-purple-400">$219.03</span>
            <span className="text-sm font-medium text-green-400">$90K</span>
          </div>
        </div>

        {/* Right Section - Performance/Info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-green-400">
            Stable 195 MS | 59 FPS
          </div>
          <div className="flex items-center space-x-1 text-gray-300 hover:text-white cursor-pointer transition-colors">
            <HelpCircle size={16} />
            <span className="text-sm">About</span>
          </div>
        </div>
      </div>
      
      {/* Market Lighthouse Modal */}
      <MarketLighthouseModal 
        isOpen={isMarketLighthouseOpen} 
        onClose={() => setIsMarketLighthouseOpen(false)} 
      />

      {/* Today's Rankings Modal */}
      <TodaysRankingsModal
        isOpen={isRankingsOpen}
        onClose={() => setIsRankingsOpen(false)}
      />

      {/* Watchlist Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
      />

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
      />

      {/* Trenches Modal */}
      <TrenchesModal
        isOpen={isTrenchesOpen}
        onClose={() => setIsTrenchesOpen(false)}
      />

      {/* PnL Card Modal */}
      <PnLCardModal
        isOpen={isPnLCardOpen}
        onClose={() => setIsPnLCardOpen(false)}
        size="small"
      />
    </footer>
  );
}
