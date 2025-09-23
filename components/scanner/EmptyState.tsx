"use client"

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="text-6xl mb-4">🔍</div>
      <div className="text-2xl font-semibold text-white mb-4">Solana Token Scanner</div>
      <p className="max-w-lg text-zinc-400 mb-6">
        Enter a Solana contract address to analyze any token with CaesarX's powerful command system.
        Get instant insights on whales, early buyers, security flags, and much more.
      </p>
      
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 max-w-2xl w-full">
        <div className="text-sm font-medium text-white mb-3">How it works:</div>
        <div className="space-y-2 text-sm text-zinc-400 text-left">
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 font-bold">1.</span>
            <span>Enter a Solana contract address in the search bar</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 font-bold">2.</span>
            <span>View basic token information and risk assessment</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 font-bold">3.</span>
            <span>Click "Advanced Scan" to access 40+ CaesarX commands</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 font-bold">4.</span>
            <span>Run deep analysis like whale maps, early buyers, bundle checks, and more</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-zinc-500">
        Example: <code className="bg-zinc-800 px-2 py-1 rounded text-yellow-400">So11111111111111111111111111111111111111112</code>
      </div>
    </div>
  );
}
