"use client"

export default function TrendingPanel({ tokens }:{
  tokens: { rank:number; ticker:string; name:string; vol:number; change:number }[];
}) {
  return (
    <aside className="hidden lg:block sticky top-[64px] h-[calc(100vh-64px)]
                      w-[300px] border-l border-zinc-800 p-4">
      <div className="text-[11px] uppercase tracking-wider text-zinc-400 mb-4">Trending · 24h Vol</div>
      
      {tokens.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-sm text-zinc-500 mb-2">No trending data</div>
          <div className="text-xs text-zinc-600">Connect data source to see trending tokens</div>
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map(t => (
            <button key={t.rank}
              className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-950/60 p-3
                         hover:border-yellow-500/30 transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-xs font-medium text-zinc-400">#{t.rank}</span>
                  <div className="font-medium text-white text-sm">{t.ticker}</div>
                </div>
                <div className={`${t.change>=0?"text-emerald-400":"text-rose-400"} text-xs font-medium`}>
                  {t.change>=0?"+":""}{t.change.toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-zinc-500 mb-1 truncate">{t.name}</div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <div>Vol ${t.vol.toLocaleString()}</div>
                <div className="w-16 h-4 bg-zinc-900 rounded group-hover:bg-zinc-800 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 mb-3">Quick Actions</div>
        <div className="space-y-1">
          <button className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-950/60 p-2
                             hover:border-yellow-500/30 transition-colors text-sm">
            <div className="flex items-center gap-2">
              <span>🔥</span>
              <span>Hot Picks</span>
            </div>
          </button>
          <button className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-950/60 p-2
                             hover:border-yellow-500/30 transition-colors text-sm">
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>New Deploys</span>
            </div>
          </button>
          <button className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-950/60 p-2
                             hover:border-yellow-500/30 transition-colors text-sm">
            <div className="flex items-center gap-2">
              <span>🐋</span>
              <span>Whale Activity</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
