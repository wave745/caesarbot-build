"use client"

import { TokenRow } from "@/stores/scanner";

interface TokenDetailsProps {
  token: TokenRow;
}

export default function TokenDetails({ token }: TokenDetailsProps) {
  const {
    ticker,
    name,
    price,
    mc,
    vol24h,
    lp,
    supply,
    ath,
    athTime,
    flags,
    tags
  } = token;

  return (
    <div className="space-y-6">
      {/* Token Stats - ASCII Tree Style */}
      <section>
        <div className="text-zinc-400 uppercase text-xs tracking-wide mb-3">Token Stats</div>
        <div className="font-mono text-sm space-y-1">
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> USD: <span className="text-white">${price}</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> MC: <span className="text-white underline cursor-pointer">${mc.toLocaleString()}</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> Vol: <span className="text-white">${vol24h.toLocaleString()}</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> LP: <span className="text-white">${lp.toLocaleString()}</span>
          </div>
          {supply && (
            <div className="text-zinc-300">
              <span className="text-zinc-400">├─</span> Supply: <span className="text-white">{supply.toLocaleString()}</span>
            </div>
          )}
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> 1H: <span className="text-green-400">+12.5%</span> <span className="text-zinc-500">(B: 45 S: 23)</span>
          </div>
          {ath && (
            <div className="text-zinc-300">
              <span className="text-zinc-400">└─</span> ATH: <span className="text-white">${ath}</span> <span className="text-zinc-500">({athTime})</span>
            </div>
          )}
        </div>
      </section>

      {/* Socials */}
      <section>
        <div className="text-zinc-400 uppercase text-xs tracking-wide mb-3">Socials</div>
        <div className="font-mono text-sm space-y-1">
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> Web: <span className="text-yellow-400 underline cursor-pointer">https://{ticker.toLowerCase()}.com</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> About: <span className="text-yellow-400 underline cursor-pointer">View Details</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">└─</span> X: <span className="text-yellow-400 underline cursor-pointer">@{ticker.toLowerCase()}</span>
          </div>
        </div>
      </section>

      {/* Security */}
      <section>
        <div className="text-zinc-400 uppercase text-xs tracking-wide mb-3">Security</div>
        <div className="font-mono text-sm space-y-1">
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> Freshies: <span className="text-white">13% 1D | 23% 7D</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> Top10: <span className="text-white underline cursor-pointer">9%</span> <span className="text-zinc-500">| 62 wallets</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> TH: <span className="text-white">2.1K</span> <span className="text-zinc-500">| 1.2K unique</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> Dev Toks: <span className="text-green-400">●</span> <span className="text-zinc-500">| Dev Sold: </span>
            <span className={flags?.devSold ? "text-red-400" : "text-green-400"}>●</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">├─</span> DEX Paid: <span className={flags?.dexUpdated ? "text-green-400" : "text-red-400"}>●</span>
          </div>
          <div className="text-zinc-300">
            <span className="text-zinc-400">└─</span> Site Reuse: <span className={flags?.siteReused ? "text-red-400" : "text-green-400"}>●</span>
          </div>
        </div>
        
        {/* Footer shortcuts */}
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="flex flex-wrap gap-2 text-xs">
            <button className="text-zinc-400 hover:text-white transition-colors">DEF</button>
            <button className="text-zinc-400 hover:text-white transition-colors">DS</button>
            <button className="text-zinc-400 hover:text-white transition-colors">GT</button>
            <button className="text-zinc-400 hover:text-white transition-colors">MOB</button>
            <button className="text-zinc-400 hover:text-white transition-colors">EXP</button>
            <button className="text-zinc-400 hover:text-white transition-colors">Xs</button>
          </div>
        </div>
      </section>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <section>
          <div className="text-zinc-400 uppercase text-xs tracking-wide mb-3">Tags</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs ${
                  tag === "whale-in" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                  tag === "early" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                  tag === "sniper" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                  "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
