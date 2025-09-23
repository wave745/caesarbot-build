"use client"

import { useState, useEffect } from "react";
import { TokenRow } from "@/stores/scanner";
import { ExternalLink, RefreshCw, Settings } from "lucide-react";

interface GMGNChartProps {
  token: TokenRow;
  theme?: "light" | "dark";
  interval?: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
}

export default function GMGNChart({ 
  token, 
  theme = "dark", 
  interval = "1h" 
}: GMGNChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [currentTheme, setCurrentTheme] = useState(theme);

  const intervals = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "1h", label: "1h" },
    { value: "4h", label: "4h" },
    { value: "1d", label: "1d" }
  ];

  const themes = [
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" }
  ];

  const chartUrl = `https://www.gmgn.cc/kline/sol/${token.ca}?theme=${currentTheme}&interval=${currentInterval}`;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentInterval, currentTheme, token.ca]);

  const handleIntervalChange = (newInterval: string) => {
    setCurrentInterval(newInterval as any);
  };

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme as any);
  };

  const refreshChart = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6 h-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            📈 Price Chart
          </h3>
          <p className="text-sm text-zinc-400">{token.name} ({token.ticker})</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refreshChart}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Refresh Chart"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
          
          <a
            href={chartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Open in GMGN"
          >
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">Interval:</span>
          <select
            value={currentInterval}
            onChange={(e) => handleIntervalChange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
          >
            {intervals.map((interval) => (
              <option key={interval.value} value={interval.value}>
                {interval.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Theme:</span>
          <select
            value={currentTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-zinc-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
              <p className="text-zinc-400 text-sm">Loading chart...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-400 text-4xl mb-2">⚠️</div>
              <p className="text-red-400 text-sm mb-2">Chart failed to load</p>
              <p className="text-zinc-400 text-xs">{error}</p>
            </div>
          </div>
        ) : (
          <iframe
            src={chartUrl}
            className="w-full h-full border-0"
            title={`${token.name} Price Chart`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError("Failed to load GMGN chart");
              setIsLoading(false);
            }}
          />
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
        <div className="text-xs text-zinc-400 mb-2">Chart Information</div>
        <div className="text-sm text-zinc-300">
          Powered by <span className="text-yellow-400 font-medium">GMGN</span> • 
          Real-time Solana price data • 
          Interval: <span className="text-white font-medium">{currentInterval}</span>
        </div>
      </div>

      {/* Fallback Chart (if iframe fails) */}
      <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
        <div className="text-sm text-zinc-400 mb-2">Alternative Chart Access</div>
        <div className="text-xs text-zinc-500">
          If the chart doesn't load, you can view it directly on GMGN:
        </div>
        <a
          href={chartUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium"
        >
          Open {token.ticker} Chart on GMGN →
        </a>
      </div>
    </div>
  );
}