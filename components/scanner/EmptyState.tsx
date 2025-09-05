"use client"

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="text-lg font-semibold text-white mb-2">No tokens found</div>
      <p className="max-w-md text-zinc-400">
        Connect your data source to start scanning tokens. The scanner is ready
        for real-time discovery and analysis.
      </p>
    </div>
  );
}
