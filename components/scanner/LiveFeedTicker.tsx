"use client"

export default function LiveFeedTicker({ items }:{ items:{ts:number, text:string}[] }) {
  if (items.length === 0) return null;
  
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 overflow-hidden">
      <div className="whitespace-nowrap animate-[marquee_18s_linear_infinite] text-sm text-zinc-300">
        {items.map((i, idx) => (
          <span key={idx} className="mx-6">• {i.text}</span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
