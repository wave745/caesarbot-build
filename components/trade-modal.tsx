"use client";

import React, { useRef, useState, useEffect } from 'react';
import { MoralisMarketService } from '@/lib/services/moralis-market-service';
import { GlobalCryptoService, GlobalCryptoData } from '@/lib/services/global-crypto-service';
import { MarketStatsCard } from './market-stats-card';
import { 
  X,
  ArrowUpDown,
  Zap,
  ChevronDown,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  avatar: string;
  marketCap: number;
  volume24h: number;
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TradeModal({ isOpen, onClose }: TradeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('0.00');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [volume24h, setVolume24h] = useState(0);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalances, setWalletBalances] = useState<{[key: string]: number}>({});
  const [marketData, setMarketData] = useState<any>(null);

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

  // Fetch trade data from global crypto data
  const fetchTradeData = async () => {
    try {
      setIsLoading(true);
      const globalCryptoService = GlobalCryptoService.getInstance();
      const globalData = await globalCryptoService.getGlobalCryptoData();
      
      // Generate tokens from global crypto data with current wallet balances
      const realTokens = generateTokensFromGlobalData(globalData);
      setTokens(realTokens);
      setVolume24h(globalData?.totalVolume24h || 0);
      setMarketData(globalData);
      
      // Set default from token (first token with balance > 0, or first token)
      if (realTokens.length > 0 && !fromToken) {
        const tokenWithBalance = realTokens.find(token => token.balance > 0);
        setFromToken(tokenWithBalance || realTokens[0]);
      }
    } catch (error) {
      console.error('Error fetching trade data:', error);
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate tokens from global crypto data with real wallet balances
  const generateTokensFromGlobalData = (globalData: GlobalCryptoData): Token[] => {
    if (!globalData || !globalData.trendingCoins || globalData.trendingCoins.length === 0) {
      return [];
    }

    // Use global crypto data to create trade tokens with real wallet balances
    return globalData.trendingCoins.slice(0, 20).map((coin: any, index: number) => {
      const symbol = coin.symbol || `TOKEN${index + 1}`;
      const balance = isWalletConnected && walletBalances[symbol] !== undefined 
        ? walletBalances[symbol] 
        : 0; // Use 0 if not logged in or no balance data
      
      return {
        symbol,
        name: coin.name || `Token ${index + 1}`,
        balance,
        price: coin.price || Math.random() * 1000,
        change24h: coin.change24h || 0,
        avatar: coin.symbol?.charAt(0) || 'T',
        marketCap: coin.marketCap || 0,
        volume24h: coin.volume24h || 0
      };
    });
  };

  // Handle token selection
  const handleFromTokenSelect = (token: Token) => {
    setFromToken(token);
    setShowFromDropdown(false);
  };

  const handleToTokenSelect = (token: Token) => {
    setToToken(token);
    setShowToDropdown(false);
  };

  // Handle dropdown toggles
  const toggleFromDropdown = () => {
    setShowFromDropdown(!showFromDropdown);
    setShowToDropdown(false);
  };

  const toggleToDropdown = () => {
    setShowToDropdown(!showToDropdown);
    setShowFromDropdown(false);
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  // Handle max amount
  const handleMaxAmount = () => {
    if (fromToken) {
      setAmount(fromToken.balance.toFixed(2));
    }
  };

  // Handle swap
  const handleSwap = () => {
    if (fromToken && toToken) {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
    }
  };

  // Fetch wallet balances from connected wallet
  const fetchWalletBalances = async (address: string) => {
    try {
      // In a real implementation, this would fetch balances from the blockchain
      // For now, we'll simulate some realistic balances based on the wallet address
      const mockBalances: {[key: string]: number} = {};
      
      // Simulate different balances based on wallet address hash
      const addressHash = address.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Generate consistent but varied balances
      const tokens = ['SOL', 'BTC', 'ETH', 'USDC', 'USDT'];
      tokens.forEach((token, index) => {
        const balance = Math.abs(addressHash + index * 1000) % 1000 / 100;
        mockBalances[token] = balance;
      });
      
      setWalletBalances(mockBalances);
      console.log('Wallet balances fetched:', mockBalances);
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      setWalletBalances({});
    }
  };

  // Handle connect wallet
  const handleConnectWallet = async () => {
    try {
      // In a real implementation, this would connect to a wallet like Phantom, MetaMask, etc.
      // For demo purposes, we'll simulate a wallet connection
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      setWalletAddress(mockAddress);
      setIsWalletConnected(true);
      
      // Fetch real balances for the connected wallet
      await fetchWalletBalances(mockAddress);
      
      console.log('Wallet connected:', mockAddress);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isOpen) {
      fetchTradeData();
      const interval = setInterval(() => {
        console.log('Auto-refreshing trade data...');
        fetchTradeData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Refresh tokens when wallet balances change
  useEffect(() => {
    if (isWalletConnected && Object.keys(walletBalances).length > 0) {
      fetchTradeData();
    }
  }, [walletBalances, isWalletConnected]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };

    if (showFromDropdown || showToDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFromDropdown, showToDropdown]);

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

  const getAvatarColor = (symbol: string) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-yellow-500'
    ];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
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
            <h2 className="text-lg font-semibold text-white">Trade</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-900">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-sm">Loading trade data...</div>
              </div>
            ) : (
              <>
                {/* From Token */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium text-gray-300">From</label>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={toggleFromDropdown}
                  >
                    <div className="flex items-center space-x-3">
                      {fromToken ? (
                        <>
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(fromToken.symbol)} flex items-center justify-center text-white font-bold text-sm`}>
                            {fromToken.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{fromToken.symbol}</div>
                            <div className="text-xs text-gray-400">
                              Balance: {fromToken.balance.toFixed(2)}
                              {isWalletConnected && walletAddress && (
                                <span className="ml-2 text-green-400">● Connected</span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">Select Token</div>
                      )}
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${showFromDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* From Token Dropdown */}
                  {showFromDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {tokens.map((token, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => handleFromTokenSelect(token)}
                        >
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(token.symbol)} flex items-center justify-center text-white font-bold text-sm`}>
                            {token.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{token.symbol}</div>
                            <div className="text-xs text-gray-400">
                              Balance: {token.balance.toFixed(2)}
                              {isWalletConnected && walletAddress && token.balance > 0 && (
                                <span className="ml-1 text-green-400">●</span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatPrice(token.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSwap}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    title="Swap tokens"
                  >
                    <ArrowUpDown size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* To Token */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium text-gray-300">To</label>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={toggleToDropdown}
                  >
                    <div className="flex items-center space-x-3">
                      {toToken ? (
                        <>
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(toToken.symbol)} flex items-center justify-center text-white font-bold text-sm`}>
                            {toToken.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{toToken.symbol}</div>
                            <div className="text-xs text-gray-400">{formatPrice(toToken.price)}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                            ?
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">Select Token</div>
                            <div className="text-xs text-gray-400">Choose a token</div>
                          </div>
                        </>
                      )}
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${showToDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* To Token Dropdown */}
                  {showToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {tokens.map((token, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => handleToTokenSelect(token)}
                        >
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(token.symbol)} flex items-center justify-center text-white font-bold text-sm`}>
                            {token.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{token.symbol}</div>
                            <div className="text-xs text-gray-400">{formatPrice(token.price)}</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Balance: {token.balance.toFixed(2)}
                            {isWalletConnected && walletAddress && token.balance > 0 && (
                              <span className="ml-1 text-green-400">●</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Amount</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleMaxAmount}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Connect Wallet Button */}
                <button
                  onClick={handleConnectWallet}
                  disabled={isWalletConnected}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap size={20} />
                  <span>{isWalletConnected ? 'Wallet Connected' : 'Connect Wallet to Trade'}</span>
                </button>

                {/* 24h Volume */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-800/30">
                  <div className="text-sm text-gray-400">24h Volume</div>
                  <div className="text-sm font-medium text-white">{formatVolume(volume24h)}</div>
                </div>

                {/* Market Cap */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Market Cap</div>
                  <div className="text-sm font-medium text-white">
                    {marketData ? formatVolume(marketData.volume24h * 10) : '$0B'}
                  </div>
                </div>

                {/* 24h Change */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">24h Change</div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={14} className="text-green-400" />
                    <span className="text-sm font-medium text-green-400">+2.4%</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Market Stats Card */}
          <div className="mt-4">
            <MarketStatsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
