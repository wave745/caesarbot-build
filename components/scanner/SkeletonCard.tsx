"use client"

export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      {/* Row 1: Symbol • Name • Risk Badge */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-zinc-900 rounded" />
        <div className="h-6 w-16 bg-zinc-900 rounded-md" />
      </div>

      {/* Row 2: MC / Vol / LP + Sparkline */}
      <div className="mt-2 grid grid-cols-2 text-sm">
        <div className="space-y-1">
          <div className="h-3 w-8 bg-zinc-900 rounded" />
          <div className="h-4 w-20 bg-zinc-900 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-12 bg-zinc-900 rounded" />
          <div className="h-4 w-24 bg-zinc-900 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-6 bg-zinc-900 rounded" />
          <div className="h-4 w-16 bg-zinc-900 rounded" />
        </div>
        <div className="flex items-end justify-end">
          <div className="w-24 h-8 bg-zinc-900 rounded-md" />
        </div>
      </div>

      {/* Row 3: Actions */}
      <div className="mt-3 flex gap-2">
        <div className="h-8 w-16 bg-zinc-900 rounded-lg" />
        <div className="h-8 w-16 bg-zinc-900 rounded-lg" />
        <div className="h-8 w-20 bg-zinc-900 rounded-lg" />
      </div>
    </div>
  );
}

