"use client"

import { useState, useEffect } from "react";
import { useScanner } from "@/stores/scanner";
import { ScannerService } from "@/lib/scanner-service";
import { Loader2, X, ExternalLink, Copy, Check } from "lucide-react";

export default function CommandResults() {
  const { selectedFeature, query } = useScanner();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const scannerService = ScannerService.getInstance();

  useEffect(() => {
    if (selectedFeature && query) {
      executeCommand();
    }
  }, [selectedFeature, query]);

  const executeCommand = async () => {
    if (!selectedFeature || !query) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const command = scannerService.getAvailableCommands().find(cmd => cmd.key === selectedFeature);
      if (!command) {
        setError("Command not found");
        return;
      }

      const result = await scannerService.executeCommand(command.key, query);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute command");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (!selectedFeature || !query) return null;

  const command = scannerService.getAvailableCommands().find(cmd => cmd.key === selectedFeature);

  return (
    <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {command?.label}
          </h3>
          <p className="text-sm text-zinc-400">{command?.description}</p>
        </div>
        <button
          onClick={() => setResults(null)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contract Address */}
      <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
        <div className="text-xs text-zinc-400 mb-1">Contract Address</div>
        <div className="flex items-center gap-2">
          <code className="text-sm text-yellow-400 font-mono break-all">{query}</code>
          <button
            onClick={() => copyToClipboard(query)}
            className="p-1 hover:bg-zinc-700 rounded transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
          <span className="ml-2 text-zinc-400">Executing {command?.label}...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
          <div className="text-red-400 font-medium">Error</div>
          <div className="text-sm text-red-300 mt-1">{error}</div>
        </div>
      )}

      {/* Results */}
      {results && !loading && !error && (
        <div className="space-y-4">
          {results.error ? (
            <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
              <div className="text-red-400 font-medium">Command Error</div>
              <div className="text-sm text-red-300 mt-1">{results.error}</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Display results based on command type */}
              {command?.key === 'whale_map' && results.whales && (
                <div>
                  <div className="text-sm font-medium text-white mb-2">Top Whale Holders</div>
                  <div className="space-y-2">
                    {results.whales.slice(0, 10).map((whale: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div className="flex-1">
                          <div className="text-sm text-white font-mono break-all">{whale.address}</div>
                          <div className="text-xs text-zinc-400">
                            {whale.percentage}% of supply ({whale.amount?.toLocaleString() || "0"} tokens)
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">#{whale.rank}</span>
                          <button
                            onClick={() => copyToClipboard(whale.address)}
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                            title="Copy address"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <a
                            href={`https://solscan.io/account/${whale.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                            title="View on Solscan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {command?.key === 'early_map' && results.earlyBuyers && (
                <div>
                  <div className="text-sm font-medium text-white mb-2">Early Buyers</div>
                  <div className="space-y-2">
                    {results.earlyBuyers.slice(0, 10).map((buyer: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div className="flex-1">
                          <div className="text-sm text-white font-mono break-all">{buyer.address}</div>
                          <div className="text-xs text-zinc-400">
                            Rank #{buyer.rank} • {buyer.percentage}% of supply
                          </div>
                        </div>
                        <div className="text-sm text-white">
                          {buyer.amount ? `$${buyer.amount.toLocaleString()}` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {command?.key === 'bundle' && results.bundles && (
                <div>
                  <div className="text-sm font-medium text-white mb-2">Bundle Transactions</div>
                  <div className="space-y-2">
                    {results.bundles.slice(0, 5).map((bundle: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div className="flex-1">
                          <div className="text-sm text-white font-mono break-all">{bundle.signature}</div>
                          <div className="text-xs text-zinc-400">
                            Block: {bundle.blockNumber} • {new Date(bundle.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(bundle.signature)}
                          className="ml-4 p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="Copy signature"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={`https://solscan.io/tx/${bundle.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="View on Solscan"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Holders Command */}
              {command?.key === 'th' && results && (
                <div>
                  <div className="text-sm font-medium text-white mb-2">Token Holders Analysis</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <div className="text-xs text-zinc-400 mb-1">Total Holders</div>
                      <div className="text-lg font-semibold text-white">{results.totalHolders?.toLocaleString() || 'N/A'}</div>
                    </div>
                    {results.holderDistribution && (
                      <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="text-xs text-zinc-400 mb-2">Holder Distribution</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Top 1%:</span>
                            <span className="text-white">{results.holderDistribution.top1}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Top 5%:</span>
                            <span className="text-white">{results.holderDistribution.top5?.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Top 10%:</span>
                            <span className="text-white">{results.holderDistribution.top10?.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {results.topHolders && results.topHolders.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-white mb-2">Top Holders</div>
                      <div className="space-y-2">
                        {results.topHolders.slice(0, 10).map((holder: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                            <div className="flex-1">
                              <div className="text-sm text-white font-mono break-all">{holder.address}</div>
                              <div className="text-xs text-zinc-400">
                                {holder.percentage?.toFixed(2) || "0.00"}% of supply ({holder.amount?.toLocaleString() || "0"} tokens)
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(holder.address)}
                              className="ml-4 p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                              title="Copy address"
                            >
                              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <a
                              href={`https://solscan.io/account/${holder.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Risk Score Command */}
              {command?.key === 'risk_score' && results && (
                <div>
                  <div className="text-sm font-medium text-white mb-2">Risk Assessment</div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-zinc-400">Risk Level:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        results.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                        results.riskLevel === 'med' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {results.riskLevel?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className="text-sm text-zinc-400">Score: {results.score || 0}/10</span>
                    </div>
                    
                    {results.riskFactors && results.riskFactors.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-white mb-2">Risk Factors:</div>
                        <ul className="space-y-1">
                          {results.riskFactors.map((factor: string, index: number) => (
                            <li key={index} className="text-xs text-zinc-400 flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.recommendations && results.recommendations.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-white mb-2">Recommendations:</div>
                        <ul className="space-y-1">
                          {results.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-xs text-zinc-400 flex items-center gap-2">
                              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generic results display */}
              {!['whale_map', 'early_map', 'bundle', 'th', 'risk_score'].includes(command?.key || '') && (
                <div className="space-y-2">
                  {Object.entries(results).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between p-2 bg-zinc-800/50 rounded">
                      <div className="text-sm text-zinc-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-sm text-white text-right max-w-xs break-words">
                        {formatValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Raw data toggle */}
              <details className="mt-4">
                <summary className="text-sm text-zinc-400 cursor-pointer hover:text-white">
                  View Raw Data
                </summary>
                <pre className="mt-2 p-3 bg-zinc-900 rounded text-xs text-zinc-300 overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={executeCommand}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all disabled:opacity-50"
        >
          {loading ? 'Executing...' : 'Re-run Command'}
        </button>
        <button
          onClick={() => window.open(`https://solscan.io/token/${query}`, '_blank')}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View on Solscan
        </button>
      </div>
    </div>
  );
}











