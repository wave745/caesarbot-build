'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface PnLData {
  tokenName: string;
  currentValue: number;
  bought: number;
  holding: number;
  pnl: number;
  pnlPercentage: number;
  entryPrice: number;
  exitPrice: number;
  wallet: string;
  timestamp: string;
}

interface PnLCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'small' | 'large';
  ca?: string | null;
}

const BACKGROUND_OPTIONS = [
  {
    id: 'golden',
    name: 'Golden Waves',
    preview: 'linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #daa520 100%)',
    type: 'gradient',
    isDefault: true
  },
  {
    id: 'default',
    name: 'Default Dark',
    preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    type: 'gradient'
  },
  {
    id: 'neon',
    name: 'Neon Cyber',
    preview: 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #330066 100%)',
    type: 'gradient'
  },
  {
    id: 'ocean',
    name: 'Ocean Deep',
    preview: 'linear-gradient(135deg, #001122 0%, #003366 50%, #0066cc 100%)',
    type: 'gradient'
  },
  {
    id: 'fire',
    name: 'Fire Storm',
    preview: 'linear-gradient(135deg, #2c0000 0%, #8b0000 50%, #ff4500 100%)',
    type: 'gradient'
  }
];

export default function PnLCardModal({ isOpen, onClose, size = 'small', ca }: PnLCardModalProps) {
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUND_OPTIONS.find(bg => bg.isDefault) || BACKGROUND_OPTIONS[0]);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideControlsTimer = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchPnLData = async () => {
    setIsLoading(true);
    try {
      const url = ca
        ? `/api/pnl-data?timeframe=24h&ca=${encodeURIComponent(ca)}`
        : `/api/pnl-data?wallet=YourWallet&timeframe=24h`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success && result.data) {
        setPnlData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch PnL data');
      }
    } catch (error) {
      console.error('Error fetching PnL data:', error);
      // Leave pnlData as-is on error; UI will not draw without data
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCard = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `pnl-card-${pnlData?.tokenName}-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const drawCard = () => {
    if (!canvasRef.current || !pnlData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (even more height)
    canvas.width = 1200;
    canvas.height = 800;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (customBackground) {
      const img = new Image();
      img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawContent(ctx, canvas);
    };
    img.src = customBackground;
  } else {
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (selectedBackground.id === 'default') {
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
    } else if (selectedBackground.id === 'golden') {
      gradient.addColorStop(0, '#2c1810');
      gradient.addColorStop(0.5, '#8b4513');
      gradient.addColorStop(1, '#daa520');
    } else if (selectedBackground.id === 'neon') {
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.5, '#1a0033');
      gradient.addColorStop(1, '#330066');
    } else if (selectedBackground.id === 'ocean') {
      gradient.addColorStop(0, '#001122');
      gradient.addColorStop(0.5, '#003366');
      gradient.addColorStop(1, '#0066cc');
    } else if (selectedBackground.id === 'fire') {
      gradient.addColorStop(0, '#2c0000');
      gradient.addColorStop(0.5, '#8b0000');
      gradient.addColorStop(1, '#ff4500');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawContent(ctx, canvas);
  }
  };

  const drawContent = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!pnlData) return;

    // Set text properties
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw token name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Arial, sans-serif';
    ctx.fillText(pnlData.tokenName, 50, 80);

    // Draw current value
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 100px Arial, sans-serif';
    ctx.fillText(`$${pnlData.currentValue.toLocaleString()}`, 50, 220);

    // Draw metrics
    ctx.fillStyle = '#ffffff';
    ctx.font = '72px Arial, sans-serif';
    
    // Bought
    ctx.fillText('Bought', 50, 380);
    ctx.fillText(`${pnlData.bought}`, 50, 460);
    
    // Holding
    ctx.fillText('Holding', 300, 380);
    ctx.fillText(`${pnlData.holding}`, 300, 460);
    
    // PNL
    ctx.fillText('PNL', 550, 380);
    const pnlColor = pnlData.pnlPercentage >= 0 ? '#00ff00' : '#ff0000';
    ctx.fillStyle = pnlColor;
    ctx.fillText(`+${pnlData.pnlPercentage.toFixed(1)}%`, 550, 460);
    
    // Reset color
    ctx.fillStyle = '#ffffff';
    
    // Draw timestamp
    ctx.fillStyle = '#888888';
    ctx.font = '40px Arial, sans-serif';
    ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 50, 600);
    
    // Draw Caesar X branding
    ctx.fillStyle = '#daa520';
    ctx.font = 'bold 70px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Caesar X', canvas.width - 50, 80);
  };

  const handleBackgroundChange = (background: typeof BACKGROUND_OPTIONS[0]) => {
    setSelectedBackground(background);
    setCustomBackground(null);
    setShowBackgroundSelector(false);
  };

  const handleCustomBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomBackground(e.target?.result as string);
        setShowBackgroundSelector(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (hideControlsTimer.current) {
      window.clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = window.setTimeout(() => setControlsVisible(false), 1200);
  };

  // Show controls briefly on open and on any hover/move
  const showControlsTemporarily = () => {
    setControlsVisible(true);
    if (hideControlsTimer.current) {
      window.clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = window.setTimeout(() => setControlsVisible(false), 1500);
  };

  useEffect(() => {
    if (isOpen) {
      fetchPnLData();
      // reveal controls briefly on open
      showControlsTemporarily();
      // center the modal on open
      requestAnimationFrame(() => {
        if (modalRef.current) {
          const rect = modalRef.current.getBoundingClientRect();
          const centeredX = Math.max(0, (window.innerWidth - rect.width) / 2);
          const centeredY = Math.max(0, (window.innerHeight - rect.height) / 2);
          setPosition({ x: centeredX, y: centeredY });
        }
      });
    }
  }, [isOpen, size, ca]);

  // Auto-refresh PnL every 30s while open
  useEffect(() => {
    if (!isOpen) return;
    const intervalId = window.setInterval(() => {
      fetchPnLData();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [isOpen, ca]);

  useEffect(() => {
    if (pnlData) {
      drawCard();
    }
  }, [pnlData, selectedBackground, customBackground]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`rounded-2xl ${size === 'large' ? 'w-[100vw] h-[99vh]' : 'w-[28rem]'} overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl`}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => {
          handleMouseDown(e);
          if (hideControlsTimer.current) {
            window.clearTimeout(hideControlsTimer.current);
          }
          setControlsVisible(true);
        }}
        onMouseMove={showControlsTemporarily}
        onMouseEnter={showControlsTemporarily}
      >
        {/* Header removed; controls moved onto the card, overlay style */}

        {/* Card Preview - Glassy canvas frame */}
        <div className="flex justify-center p-3">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-orange-500/10 blur-2xl" />
            {/* Overlay Controls - Left group (Background Image) */}
            <div className={`absolute top-2 left-2 z-20 flex items-center gap-3 transition-opacity duration-200 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button
                onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
                className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white transition-colors filter drop-shadow"
                title="Background Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
            {/* Overlay Controls - Right group (Close) */}
            <div className={`absolute top-2 right-2 z-20 flex items-center gap-3 transition-opacity duration-200 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white transition-colors filter drop-shadow"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <canvas
              ref={canvasRef}
              className="relative rounded-xl ring-1 ring-white/10 shadow-2xl block"
              style={{ width: '100%', height: size === 'large' ? 'calc(99vh - 70px)' : undefined, maxWidth: '100%', aspectRatio: size === 'large' ? undefined as any : '1.36' }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
              </div>
            )}
          </div>
        </div>

        {/* Background Selector - Glassy */}
        {showBackgroundSelector && (
          <div className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 mt-3">
            <h3 className="text-sm font-semibold text-white mb-2">Choose Background</h3>
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleBackgroundChange(bg)}
                  className={`p-2 rounded-lg border transition-all duration-200 backdrop-blur-sm ${
                    selectedBackground.id === bg.id
                      ? 'border-white/30 bg-white/10 shadow-lg'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded mb-1"
                    style={{ background: bg.preview }}
                  />
                  <p className="text-xs text-gray-300">{bg.name}</p>
                </button>
              ))}
              <label className="p-2 rounded-lg border border-dashed border-white/15 hover:border-white/25 hover:bg-white/5 cursor-pointer transition-all duration-200 backdrop-blur-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomBackgroundUpload}
                  className="hidden"
                />
                <div className="w-full h-8 rounded mb-1 bg-white/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white/70" />
                </div>
                <p className="text-xs text-gray-300">Custom</p>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
