"use client"

export default function Sparkline({ points }: { points: number[] }) {
  if (points.length === 0) return null;
  
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  
  const path = points.map((v, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-8">
      <polyline 
        points={path} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        opacity={0.8}
        className="text-yellow-400"
      />
    </svg>
  );
}
