"use client"

import { useState, useRef, useEffect } from "react";
import { useScanner } from "@/stores/scanner";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ScannerService } from "@/lib/scanner-service";

export default function TopControls() {
  const { query, setQuery, setSelectedFeature, setSelectedToken, setMode } = useScanner();
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scannerService = ScannerService.getInstance();

  // Load commands on component mount
  useEffect(() => {
    const availableCommands = scannerService.getAvailableCommands();
    setCommands(availableCommands);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStandardScan = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setMode("standard");
    setSelectedFeature(null);
    
    try {
      const token = await scannerService.searchToken(query.trim());
      if (token) {
        setSelectedToken(token);
      }
    } catch (error) {
      console.error("Error in standard scan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedScan = async (command: any) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setMode("advanced");
    setSelectedFeature(command.key);
    setIsOpen(false);
    
    try {
      const token = await scannerService.searchToken(query.trim());
      if (token) {
        setSelectedToken(token);
      }
    } catch (error) {
      console.error("Error in advanced scan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStandardScan();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="flex-1 min-w-80">
        <input
          placeholder="Enter Solana contract address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 text-white placeholder-zinc-400 focus:ring-1 focus:ring-yellow-500/40 focus:outline-none transition-all"
        />
      </div>

      {/* Standard Scan Button */}
      <button
        onClick={handleStandardScan}
        disabled={loading || !query.trim()}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
      >
        <Search className="w-4 h-4" />
        {loading ? "Scanning..." : "Scan"}
      </button>

      {/* Advanced Scan Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Advanced Scan
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2 px-2">
                CaesarX Commands ({commands.length})
              </div>
              {commands.map((command) => (
                <button
                  key={command.key}
                  onClick={() => handleAdvancedScan(command)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{command.label.split(' ')[0]}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                        {command.label.split(' ').slice(1).join(' ')}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {command.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

