"use client";

import React, { useState, useRef } from 'react';
import { BarChart2, Users2, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { useJupiterStats } from '../hooks/useJupiterStats';

export function VolumeCard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState("1d");
  const [selectedLaunchpad, setSelectedLaunchpad] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  const { data: jupiterData, loading, error } = useJupiterStats();

  const tabs = ["1d", "7d", "30d"];

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(0)}`;
    }
  };

  const formatPercentage = (num: number): string => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  // Get current time period data based on selection
  const getCurrentStats = () => {
    if (!jupiterData.length) return null;
    
    // If a specific launchpad is selected, show only that launchpad's data
    if (selectedLaunchpad) {
      const launchpad = jupiterData.find(lp => lp.launchpad === selectedLaunchpad);
      if (!launchpad) return null;
      
      const stats = selected === "1d" ? launchpad.stats1d :    // 1 day
                   selected === "7d" ? launchpad.stats7d :    // 7 days
                   launchpad.stats30d;                         // 30 days (default)
      
      return {
        volume: stats.volume,
        traders: stats.traders,
        mints: stats.mints,
        graduates: stats.graduates,
      };
    }
    
    // Otherwise, show combined data from all launchpads
    const totalStats = jupiterData.reduce((acc, launchpad) => {
      // Map time periods to correct Jupiter API stats
      const stats = selected === "1d" ? launchpad.stats1d :    // 1 day
                   selected === "7d" ? launchpad.stats7d :    // 7 days
                   launchpad.stats30d;                         // 30 days (default)
      
      return {
        volume: acc.volume + stats.volume,
        traders: acc.traders + stats.traders,
        mints: acc.mints + stats.mints,
        graduates: acc.graduates + stats.graduates,
      };
    }, { volume: 0, traders: 0, mints: 0, graduates: 0 });

    return totalStats;
  };

  // Map launchpad names to their icons
  const getLaunchpadIcon = (launchpadName: string) => {
    const iconMap: { [key: string]: string } = {
      'pump.fun': '/icons/platforms/pump.fun-logo.svg',
      'pumpfun': '/icons/platforms/pump.fun-logo.svg',
      'bonk': '/icons/platforms/bonk.fun-logo.svg',
      'raydium': '/icons/platforms/raydium-ray-logo.svg',
      'jupiter': '/icons/platforms/jupiter-ag-jup-logo.svg',
      'believe': '/icons/platforms/believe.app-logo.png',
      'bags': '/icons/platforms/bags.fm-logo.png',
      'moon': '/icons/platforms/moon.it-logo.png',
      'letsbonk': '/icons/platforms/bonk.fun-logo.svg',
      'dexscreener': '/icons/platforms/dexscreener-logo.svg',
      'caesarx': '/icons/platforms/caesarx-logo.svg',
      'meteora': '/icons/platforms/meteora.ag(met-dbc)-logo.png',
      'met-dbc': '/icons/platforms/meteora.ag(met-dbc)-logo.png'
    };
    
    // Try to find a match (case insensitive)
    const lowerName = launchpadName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return icon;
      }
    }
    
    // Default icon if no match found
    return '/icons/platforms/jupiter-ag-jup-logo.svg';
  };

  // Get launchpad brand color for hover effects
  const getLaunchpadBrandColor = (launchpadName: string) => {
    const colorMap: { [key: string]: string } = {
      'pump.fun': 'green',
      'pumpfun': 'green',
      'bonk': 'yellow',
      'raydium': 'blue',
      'jupiter': 'purple',
      'believe': 'pink',
      'bags': 'green',
      'moon': 'indigo',
      'letsbonk': 'yellow',
      'dexscreener': 'cyan',
      'caesarx': 'red',
      'meteora': 'neon',
      'met-dbc': 'neon'
    };
    
    const lowerName = launchpadName.toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return color;
      }
    }
    
    return 'gray'; // Default color
  };

  // Get all launchpads for display (always show all, highlight selected)
  const getTopLaunchpads = () => {
    if (!jupiterData.length) return [];
    
    return jupiterData
      .map(launchpad => {
        // Map time periods to correct Jupiter API stats
        const stats = selected === "1d" ? launchpad.stats1d :    // 1 day
                     selected === "7d" ? launchpad.stats7d :    // 7 days
                     launchpad.stats30d;                         // 30 days (default)
        
        // Calculate percentage change from newVolume (which is the change amount)
        const previousVolume = stats.volume - stats.newVolume;
        const percentageChange = previousVolume > 0 ? (stats.newVolume / previousVolume) * 100 : 0;
        
        return {
          name: launchpad.launchpad,
          value: formatNumber(stats.volume),
          change: formatPercentage(percentageChange),
          color: percentageChange >= 0 ? "text-green-400" : "text-red-400",
          icon: getLaunchpadIcon(launchpad.launchpad),
          isSelected: selectedLaunchpad === launchpad.launchpad,
          brandColor: getLaunchpadBrandColor(launchpad.launchpad)
        };
      })
      .sort((a, b) => {
        const aValue = parseFloat(a.value.replace(/[$,K,M]/g, '')) * (a.value.includes('M') ? 1000000 : a.value.includes('K') ? 1000 : 1);
        const bValue = parseFloat(b.value.replace(/[$,K,M]/g, '')) * (b.value.includes('M') ? 1000000 : b.value.includes('K') ? 1000 : 1);
        return bValue - aValue;
      })
      .slice(0, 3);
  };

  const currentStats = getCurrentStats();
  const topLaunchpads = getTopLaunchpads();

  // Handle launchpad selection
  const handleLaunchpadSelect = (launchpadName: string) => {
    if (selectedLaunchpad === launchpadName) {
      // If clicking the same launchpad, deselect it (show all)
      setSelectedLaunchpad(null);
    } else {
      // Select the clicked launchpad
      setSelectedLaunchpad(launchpadName);
    }
  };

  // Get all available launchpads for selection
  const getAllLaunchpads = () => {
    if (!jupiterData.length) return [];
    
    return jupiterData.map(launchpad => {
      const stats = selected === "1d" ? launchpad.stats1d :    // 1 day
                   selected === "7d" ? launchpad.stats7d :    // 7 days
                   launchpad.stats30d;                         // 30 days (default)
      
      const previousVolume = stats.volume - stats.newVolume;
      const percentageChange = previousVolume > 0 ? (stats.newVolume / previousVolume) * 100 : 0;
      
      return {
        name: launchpad.launchpad,
        value: formatNumber(stats.volume),
        change: formatPercentage(percentageChange),
        color: percentageChange >= 0 ? "text-green-400" : "text-red-400",
        icon: getLaunchpadIcon(launchpad.launchpad)
      };
    }).sort((a, b) => {
      const aValue = parseFloat(a.value.replace(/[$,K,M]/g, '')) * (a.value.includes('M') ? 1000000 : a.value.includes('K') ? 1000 : 1);
      const bValue = parseFloat(b.value.replace(/[$,K,M]/g, '')) * (b.value.includes('M') ? 1000000 : b.value.includes('K') ? 1000 : 1);
      return bValue - aValue;
    });
  };

  // Fallback data for testing
  const fallbackStats = {
    volume: 1250000,
    traders: 2500,
    mints: 45,
    graduates: 8
  };

  const fallbackLaunchpads = [
    { name: "Pumpfun", value: "$1.04M", change: "+8.53%", color: "text-green-400", icon: "/icons/platforms/pump.fun-logo.svg" },
    { name: "Bonk", value: "$530K", change: "+5.383%", color: "text-green-400", icon: "/icons/platforms/bonk.fun-logo.svg" },
    { name: "Raydium", value: "$42.8K", change: "+16.6%", color: "text-green-400", icon: "/icons/platforms/raydium-ray-logo.svg" },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        cardRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      }
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (cardRef.current) {
        const transform = cardRef.current.style.transform;
        const match = transform.match(/translate3d\(([^,]+)px,\s*([^,]+)px/);
        if (match) {
          setPosition({
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
          });
        }
      }
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={cardRef}
        className={`w-[380px] bg-white/95 dark:bg-[#0b0b0b]/95 border border-gray-200 dark:border-[#1e1e1e] rounded-2xl p-4 shadow-[0_0_25px_rgba(0,0,0,0.1)] dark:shadow-[0_0_25px_rgba(0,0,0,0.6)] text-gray-800 dark:text-gray-200 font-inter backdrop-blur-xl transition-all duration-300 ${
          isDragging ? 'cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          willChange: isDragging ? 'transform' : 'auto'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2" data-drag-handle>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <h2 className="text-sm font-semibold">Market Lighthouse</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                selected === t
                  ? "bg-[#1a1a1a] text-white border border-gray-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#0f0f0f] border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gray-50 dark:bg-[#101010] border border-gray-200 dark:border-[#1e1e1e] rounded-xl p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> Total Volume
            </p>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : error ? (
              <p className="text-sm text-red-400">Error loading data</p>
            ) : currentStats ? (
              <>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatNumber(currentStats.volume)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selected} period
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatNumber(fallbackStats.volume)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fallback data
                </p>
              </>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-[#101010] border border-gray-200 dark:border-[#1e1e1e] rounded-xl p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Users2 className="w-3 h-3" /> Traders
            </p>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : error ? (
              <p className="text-sm text-red-400">Error loading data</p>
            ) : currentStats ? (
              <>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {currentStats.traders.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active traders
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {fallbackStats.traders.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fallback data
                </p>
              </>
            )}
          </div>
        </div>

        {/* Volume Chart */}
        <div className="mb-3">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading volume data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-400">Error loading volume data</p>
            </div>
          ) : currentStats ? (
            <>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Volume: {formatNumber(currentStats.volume)}</span>
                <span>Traders: {currentStats.traders.toLocaleString()}</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 w-[60%]"></div>
                <div className="bg-blue-500 w-[40%]"></div>
              </div>
              <p className="text-right text-xs mt-1 text-gray-500 dark:text-gray-500">
                {formatNumber(currentStats.volume)} <span className="text-green-400">Live Data</span>
              </p>
            </>
          ) : (
            <>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Volume: {formatNumber(fallbackStats.volume)}</span>
                <span>Traders: {fallbackStats.traders.toLocaleString()}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 w-[60%]"></div>
                <div className="bg-blue-500 w-[40%]"></div>
          </div>
          <p className="text-right text-xs mt-1 text-gray-500 dark:text-gray-500">
                {formatNumber(fallbackStats.volume)} <span className="text-blue-400">Fallback Data</span>
          </p>
            </>
          )}
        </div>

        {/* Token Stats */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Token Stats</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-[#101010] border border-gray-200 dark:border-[#1e1e1e] rounded-xl p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Mints</p>
              {loading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : error ? (
                <p className="text-xs text-red-400">Error</p>
              ) : currentStats ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentStats.mints.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-400">+{currentStats.mints}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fallbackStats.mints.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-400">+{fallbackStats.mints}</p>
                </>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-[#101010] border border-gray-200 dark:border-[#1e1e1e] rounded-xl p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Graduates</p>
              {loading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : error ? (
                <p className="text-xs text-red-400">Error</p>
              ) : currentStats ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentStats.graduates.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-400">+{currentStats.graduates}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fallbackStats.graduates.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-400">+{fallbackStats.graduates}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Launchpads */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedLaunchpad ? `${selectedLaunchpad} Data` : 'Top Launchpads'}
            </p>
            {selectedLaunchpad && (
              <button
                onClick={() => setSelectedLaunchpad(null)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Show All
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading launchpads...</span>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-400">Error loading launchpads</p>
            </div>
          ) : topLaunchpads.length > 0 ? (
            <div className="flex gap-2">
              {topLaunchpads.map((l, i) => {
                // Get dynamic colors based on brand
                const getBrandClasses = (brandColor: string, isSelected: boolean) => {
                  const colorMap: { [key: string]: { border: string; text: string; hover: string } } = {
                    orange: { 
                      border: isSelected ? 'border-orange-400 ring-2 ring-orange-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-orange-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    },
                    yellow: { 
                      border: isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-yellow-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    },
                    blue: { 
                      border: isSelected ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-blue-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    },
                    purple: { 
                      border: isSelected ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-purple-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    },
                    pink: { 
                      border: isSelected ? 'border-pink-400 ring-2 ring-pink-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-pink-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20'
                    },
                    green: { 
                      border: isSelected ? 'border-green-400 ring-2 ring-green-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-green-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-green-50 dark:hover:bg-green-900/20'
                    },
                    indigo: { 
                      border: isSelected ? 'border-indigo-400 ring-2 ring-indigo-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-indigo-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    },
                    cyan: { 
                      border: isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-cyan-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                    },
                    red: { 
                      border: isSelected ? 'border-red-400 ring-2 ring-red-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-red-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-red-50 dark:hover:bg-red-900/20'
                    },
                    teal: { 
                      border: isSelected ? 'border-teal-400 ring-2 ring-teal-400/50' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-teal-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/20'
                    },
                    neon: { 
                      border: isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-400/25' : 'border-gray-200 dark:border-[#1e1e1e]',
                      text: isSelected ? 'text-cyan-400' : 'text-gray-900 dark:text-white',
                      hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:shadow-lg hover:shadow-cyan-400/25'
                    }
                  };
                  
                  return colorMap[brandColor] || colorMap.gray;
                };

                const brandClasses = getBrandClasses(l.brandColor, l.isSelected);

                return (
                  <div
                    key={i}
                    onClick={() => handleLaunchpadSelect(l.name)}
                    className={`bg-gray-50 dark:bg-[#101010] border rounded-xl px-2 py-1 flex flex-col items-center w-[110px] cursor-pointer transition-all ${brandClasses.hover} ${brandClasses.border}`}
                  >
                    <div className="w-6 h-6 mb-1 flex items-center justify-center">
                      <img 
                        src={l.icon} 
                        alt={l.name} 
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate w-full text-center">{l.name}</p>
                    <p className={`text-xs font-semibold ${brandClasses.text}`}>{l.value}</p>
                    <p className={`text-xs ${l.color}`}>{l.change}</p>
                  </div>
                );
              })}
            </div>
          ) : (
          <div className="flex gap-2">
              {fallbackLaunchpads.map((l, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-[#101010] border border-gray-200 dark:border-[#1e1e1e] rounded-xl px-2 py-1 flex flex-col items-center w-[110px]"
              >
                  <div className="w-6 h-6 mb-1 flex items-center justify-center">
                    <img 
                      src={l.icon} 
                      alt={l.name} 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate w-full text-center">{l.name}</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{l.value}</p>
                <p className={`text-xs ${l.color}`}>{l.change}</p>
              </div>
            ))}
          </div>
          )}
        </div>

      </div>
    </div>
  );
}