"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { X, Settings, Download, Copy, Upload, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface PNLCardsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date
  currency?: "SOL" | "USD"
  isMonthly?: boolean
  monthData?: {
    month: Date
    totalPNL: number
    totalBought: number
    totalSold: number
    pnlPercentage: number
  }
}

interface DayPNLData {
  date: Date
  pnl: number
  totalBought: number
  totalSold: number
  pnlPercentage: number
  images: string[]
}

export function PNLCardsModal({ 
  isOpen, 
  onClose, 
  selectedDate = new Date(),
  currency = "SOL",
  isMonthly = false,
  monthData
}: PNLCardsModalProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showCustomize, setShowCustomize] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<'default' | 'gif1' | 'gif2'>('default')
  const [opacity, setOpacity] = useState(100)
  const [blur, setBlur] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Customization options
  const [textColor, setTextColor] = useState('#ffffff')
  const [profitColor, setProfitColor] = useState('#34d399')
  const [lossColor, setLossColor] = useState('#f43f5e')
  const [showUSDValues, setShowUSDValues] = useState(false)
  const [mainStatValue, setMainStatValue] = useState<'USD' | 'Native'>('Native')
  const [showTextShadow, setShowTextShadow] = useState(false)
  const [gradientColor, setGradientColor] = useState('#000000')
  const [gradientStrength, setGradientStrength] = useState(50)
  const [logoColor, setLogoColor] = useState('#ffffff')

  // Background images
  const defaultBackground = '/caesarxnewpnl-footer.png'
  const presetGif1 = '/custom-gif1.gif'
  const presetGif2 = '/custom-gif2.gif'

  const getBackgroundImage = () => {
    if (selectedPreset === 'gif1') return presetGif1
    if (selectedPreset === 'gif2') return presetGif2
    return defaultBackground
  }

  const backgroundImage = getBackgroundImage()

  if (!isOpen) return null

  // Mock PNL data - replace with actual API data
  const pnlData: DayPNLData = isMonthly && monthData ? {
    date: monthData.month,
    pnl: monthData.totalPNL,
    totalBought: monthData.totalBought,
    totalSold: monthData.totalSold,
    pnlPercentage: monthData.pnlPercentage,
    images: uploadedImages
  } : {
    date: selectedDate,
    pnl: 0.00,
    totalBought: 0.00,
    totalSold: 0.00,
    pnlPercentage: 0.00,
    images: uploadedImages
  }

  const formatCurrency = (value: number): string => {
    if (currency === "SOL") {
      return `${value.toFixed(2)}`
    } else {
      return `$${value.toFixed(2)}`
    }
  }

  // Convert hex color to CSS filter
  const hexToFilter = (hex: string): string => {
    // Remove # if present
    const cleanHex = hex.replace('#', '')
    
    // Parse RGB
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    
    // Convert to 0-1 range
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255
    
    // Calculate filter values
    // First make it white (brightness(0) saturate(100%) invert(1))
    // Then apply color using sepia and hue-rotate
    // This is a simplified approach - for exact color matching, we'd need more complex calculations
    
    // For white, just use invert
    if (hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#fff') {
      return 'brightness(0) saturate(100%) invert(1)'
    }
    
    // For other colors, we'll use a combination approach
    // Calculate hue from RGB
    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    let h = 0
    
    if (max !== min) {
      if (max === rNorm) {
        h = ((gNorm - bNorm) / (max - min)) % 6
      } else if (max === gNorm) {
        h = (bNorm - rNorm) / (max - min) + 2
      } else {
        h = (rNorm - gNorm) / (max - min) + 4
      }
    }
    h = h * 60
    
    // Calculate saturation
    const s = max === 0 ? 0 : (max - min) / max
    
    // Calculate lightness
    const l = (max + min) / 2
    
    // Convert to filter (approximate)
    // This is a simplified conversion
    const brightness = l * 100
    const saturate = s * 100
    const hueRotate = h
    
    return `brightness(0) saturate(100%) invert(1) sepia(100%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%)`
  }

  const handleCopy = async () => {
    if (!cardRef.current) {
      console.error('cardRef is not attached')
      return
    }

    try {
      const html2canvas = (await import('html2canvas')).default
      
      const cardContainer = cardRef.current
      const actionButtons = cardContainer.querySelector('.action-buttons') as HTMLElement
      const presetSection = cardContainer.querySelector('.preset-section') as HTMLElement
      const pnlHeader = cardContainer.querySelector('.pnl-header') as HTMLElement
      
      // Hide action buttons, preset section, and header
      const originalButtonVisibility = actionButtons?.style.visibility
      const originalPresetVisibility = presetSection?.style.visibility
      const originalHeaderVisibility = pnlHeader?.style.visibility
      
      if (actionButtons) {
        actionButtons.style.visibility = 'hidden'
      }
      if (presetSection) {
        presetSection.style.visibility = 'hidden'
      }
      if (pnlHeader) {
        pnlHeader.style.visibility = 'hidden'
      }
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const canvas = await html2canvas(cardContainer, {
        backgroundColor: '#111111',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        removeContainer: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded and positioned correctly
          const clonedContainer = clonedDoc.querySelector('[ref]') || clonedDoc.body.firstElementChild
          if (clonedContainer) {
            // Force layout recalculation and proper alignment
            const images = clonedContainer.querySelectorAll('img')
            images.forEach((img) => {
              const imgElement = img as HTMLImageElement
              imgElement.style.display = 'inline-block'
              imgElement.style.verticalAlign = 'middle'
              imgElement.style.margin = '0'
              imgElement.style.padding = '0'
            })
            
            // Ensure flex containers maintain alignment
            const flexContainers = clonedContainer.querySelectorAll('.inline-flex, .flex')
            flexContainers.forEach((container) => {
              const containerElement = container as HTMLElement
              containerElement.style.display = 'flex'
              containerElement.style.alignItems = 'center'
            })
          }
        }
      })
      
      // Restore visibility
      if (actionButtons) {
        actionButtons.style.visibility = originalButtonVisibility || 'visible'
      }
      if (presetSection) {
        presetSection.style.visibility = originalPresetVisibility || 'visible'
      }
      if (pnlHeader) {
        pnlHeader.style.visibility = originalHeaderVisibility || 'visible'
      }
      
      // Convert canvas to blob and copy
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob')
          alert('Failed to create image. Please try again.')
          return
        }
        
        try {
          const item = new ClipboardItem({
            'image/png': blob
          })
          await navigator.clipboard.write([item])
          alert('Image copied to clipboard!')
        } catch (err) {
          console.error('ClipboardItem failed:', err)
          // Fallback: use data URL
          try {
            const dataUrl = canvas.toDataURL('image/png')
            await navigator.clipboard.writeText(dataUrl)
            alert('Image data copied to clipboard!')
          } catch (fallbackErr) {
            console.error('Fallback copy failed:', fallbackErr)
            alert('Failed to copy image. Please try downloading instead.')
          }
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to copy PNL card:', error)
      alert(`Failed to copy image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) {
      console.error('cardRef is not attached')
      return
    }

    try {
      const html2canvas = (await import('html2canvas')).default
      
      const cardContainer = cardRef.current
      const actionButtons = cardContainer.querySelector('.action-buttons') as HTMLElement
      const presetSection = cardContainer.querySelector('.preset-section') as HTMLElement
      const pnlHeader = cardContainer.querySelector('.pnl-header') as HTMLElement
      
      // Hide action buttons, preset section, and header
      const originalButtonVisibility = actionButtons?.style.visibility
      const originalPresetVisibility = presetSection?.style.visibility
      const originalHeaderVisibility = pnlHeader?.style.visibility
      
      if (actionButtons) {
        actionButtons.style.visibility = 'hidden'
      }
      if (presetSection) {
        presetSection.style.visibility = 'hidden'
      }
      if (pnlHeader) {
        pnlHeader.style.visibility = 'hidden'
      }
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const canvas = await html2canvas(cardContainer, {
        backgroundColor: '#111111',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        removeContainer: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded and positioned correctly
          const clonedContainer = clonedDoc.querySelector('[ref]') || clonedDoc.body.firstElementChild
          if (clonedContainer) {
            // Force layout recalculation and proper alignment
            const images = clonedContainer.querySelectorAll('img')
            images.forEach((img) => {
              const imgElement = img as HTMLImageElement
              imgElement.style.display = 'inline-block'
              imgElement.style.verticalAlign = 'middle'
              imgElement.style.margin = '0'
              imgElement.style.padding = '0'
            })
            
            // Ensure flex containers maintain alignment
            const flexContainers = clonedContainer.querySelectorAll('.inline-flex, .flex')
            flexContainers.forEach((container) => {
              const containerElement = container as HTMLElement
              containerElement.style.display = 'flex'
              containerElement.style.alignItems = 'center'
            })
          }
        }
      })
      
      // Restore visibility
      if (actionButtons) {
        actionButtons.style.visibility = originalButtonVisibility || 'visible'
      }
      if (presetSection) {
        presetSection.style.visibility = originalPresetVisibility || 'visible'
      }
      if (pnlHeader) {
        pnlHeader.style.visibility = originalHeaderVisibility || 'visible'
      }
      
      // Create filename
      const extension = 'png'
      const filename = isMonthly 
        ? `pnl-card-${format(monthData?.month || selectedDate, 'MMMM-yyyy')}.${extension}`
        : `pnl-card-${format(selectedDate, 'd-MMM-yyyy')}.${extension}`
      
      // Download
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download PNL card:', error)
      alert(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages: string[] = []
      for (let i = 0; i < Math.min(files.length, 10 - uploadedImages.length); i++) {
        const file = files[i]
        if (file.size <= 2 * 1024 * 1024) { // Max 2MB
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              newImages.push(event.target.result as string)
              if (newImages.length === Math.min(files.length, 10 - uploadedImages.length)) {
                setUploadedImages([...uploadedImages, ...newImages])
              }
            }
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        ref={cardRef}
        className="bg-[#111111] border border-[#282828] rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl overflow-hidden flex flex-col relative mx-2 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: opacity / 100,
            filter: `blur(${blur}px)`,
            zIndex: 0
          }}
        />
        
        {/* Gradient Overlay */}
        {gradientStrength > 0 && (
          <div 
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${gradientColor}${Math.round(gradientStrength * 2.55).toString(16).padStart(2, '0')}, transparent)`,
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Content Overlay */}
        <div className="content-overlay relative z-10 flex flex-col h-full">
          {/* Floating CaesarX Logo */}
          <h2 className="absolute top-2 sm:top-4 left-2 sm:left-4 text-sm sm:text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent z-20">
            CaesarX
          </h2>
          
          {/* Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 hover:bg-[#1a1a1a]/80 rounded-lg transition-colors z-20"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
          </button>

          {/* Content - This is what gets captured for download */}
          <div className="card-content p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
          {/* Date */}
          <div className="text-center">
            <h3 
              className="text-lg sm:text-xl md:text-2xl font-semibold leading-none"
              style={{ 
                color: textColor,
                textShadow: showTextShadow ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}
            >
              {isMonthly 
                ? format(monthData?.month || selectedDate, "MMMM yyyy")
                : format(selectedDate, "d MMM yyyy")
              }
            </h3>
          </div>

          {/* Main PNL Value */}
          <div className="text-center">
            <div className="inline-flex flex-col items-center gap-1">
              <div className="inline-flex items-baseline justify-center gap-1.5 sm:gap-2">
                {(mainStatValue === 'Native' && currency === "SOL") && (
                  <Image 
                    src="/sol-logo.png" 
                    alt="Solana" 
                    width={20} 
                    height={20} 
                    className="rounded flex-shrink-0 align-middle sm:w-6 sm:h-6"
                    style={{ 
                      verticalAlign: 'middle',
                      filter: hexToFilter(logoColor),
                      backgroundColor: 'transparent'
                    }}
                  />
                )}
                <span 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none"
                  style={{ 
                    color: pnlData.pnl >= 0 ? profitColor : lossColor,
                    textShadow: showTextShadow ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  {mainStatValue === 'USD' ? `$${pnlData.pnl.toFixed(2)}` : formatCurrency(pnlData.pnl)}
                </span>
              </div>
              {showUSDValues && mainStatValue === 'Native' && currency === "SOL" && (
                <span 
                  className="text-sm sm:text-base md:text-lg font-semibold leading-none text-gray-400"
                  style={{ 
                    textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  ${(pnlData.pnl * 150).toFixed(2)} USD
                </span>
              )}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs sm:text-sm font-medium"
                style={{ 
                  color: textColor,
                  textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                Total Bought
              </span>
              <div className="inline-flex items-center gap-1 sm:gap-1.5 flex-col items-end">
                <div className="inline-flex items-center gap-1 sm:gap-1.5">
                  {(mainStatValue === 'Native' && currency === "SOL") && (
                    <Image 
                      src="/sol-logo.png" 
                      alt="Solana" 
                      width={14} 
                      height={14} 
                      className="rounded flex-shrink-0 align-middle sm:w-4 sm:h-4"
                      style={{ 
                        verticalAlign: 'middle',
                        filter: hexToFilter(logoColor),
                        backgroundColor: 'transparent'
                      }}
                    />
                  )}
                  <span 
                    className="text-xs sm:text-sm font-medium whitespace-nowrap leading-none"
                    style={{ 
                      color: textColor,
                      textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    {mainStatValue === 'USD' ? `$${pnlData.totalBought.toFixed(2)}` : formatCurrency(pnlData.totalBought)}
                  </span>
                </div>
                {showUSDValues && mainStatValue === 'Native' && currency === "SOL" && (
                  <span 
                    className="text-[10px] sm:text-xs font-medium whitespace-nowrap leading-none text-gray-400"
                    style={{ 
                      textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    ${(pnlData.totalBought * 150).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span 
                className="text-xs sm:text-sm font-medium"
                style={{ 
                  color: textColor,
                  textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                Total Sold
              </span>
              <div className="inline-flex items-center gap-1.5 flex-col items-end">
                <div className="inline-flex items-center gap-1 sm:gap-1.5">
                  {(mainStatValue === 'Native' && currency === "SOL") && (
                    <Image 
                      src="/sol-logo.png" 
                      alt="Solana" 
                      width={14} 
                      height={14} 
                      className="rounded flex-shrink-0 align-middle sm:w-4 sm:h-4"
                      style={{ 
                        verticalAlign: 'middle',
                        filter: hexToFilter(logoColor),
                        backgroundColor: 'transparent'
                      }}
                    />
                  )}
                  <span 
                    className="text-xs sm:text-sm font-medium whitespace-nowrap leading-none"
                    style={{ 
                      color: textColor,
                      textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    {mainStatValue === 'USD' ? `$${pnlData.totalSold.toFixed(2)}` : formatCurrency(pnlData.totalSold)}
                  </span>
                </div>
                {showUSDValues && mainStatValue === 'Native' && currency === "SOL" && (
                  <span 
                    className="text-[10px] sm:text-xs font-medium whitespace-nowrap leading-none text-gray-400"
                    style={{ 
                      textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    ${(pnlData.totalSold * 150).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span 
                className="text-xs sm:text-sm font-medium"
                style={{ 
                  color: textColor,
                  textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                PNL
              </span>
              <div className="inline-flex items-center gap-1.5 flex-col items-end">
                <span 
                  className="text-xs sm:text-sm font-medium whitespace-nowrap leading-none"
                  style={{ 
                    color: pnlData.pnlPercentage >= 0 ? profitColor : lossColor,
                    textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  {pnlData.pnlPercentage.toFixed(2)}%
                </span>
                {showUSDValues && mainStatValue === 'Native' && currency === "SOL" && (
                  <span 
                    className="text-[10px] sm:text-xs font-medium whitespace-nowrap leading-none text-gray-400"
                    style={{ 
                      textShadow: showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    ${(pnlData.pnl * 150).toFixed(2)} USD
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Background Presets and Upload */}
          <div className="preset-section flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
            <button
              onClick={() => setSelectedPreset('default')}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                selectedPreset === 'default'
                  ? "border-yellow-500 ring-2 ring-yellow-500/50"
                  : "border-[#282828] hover:border-[#383838]"
              }`}
            >
              <Image
                src={defaultBackground}
                alt="Default"
                fill
                className="object-cover"
                sizes="64px"
              />
              {selectedPreset === 'default' && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center z-10">
                  <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full"></div>
                </div>
              )}
            </button>
            <button
              onClick={() => setSelectedPreset('gif1')}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                selectedPreset === 'gif1'
                  ? "border-yellow-500 ring-2 ring-yellow-500/50"
                  : "border-[#282828] hover:border-[#383838]"
              }`}
            >
              <Image
                src={presetGif1}
                alt="GIF 1"
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
              {selectedPreset === 'gif1' && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center z-10">
                  <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full"></div>
                </div>
              )}
            </button>
            <button
              onClick={() => setSelectedPreset('gif2')}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                selectedPreset === 'gif2'
                  ? "border-yellow-500 ring-2 ring-yellow-500/50"
                  : "border-[#282828] hover:border-[#383838]"
              }`}
            >
              <Image
                src={presetGif2}
                alt="GIF 2"
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
              {selectedPreset === 'gif2' && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center z-10">
                  <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full"></div>
                </div>
              )}
            </button>
            
            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <>
                {uploadedImages.map((img, index) => (
                  <div key={index} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-[#282828]">
                    <Image 
                      src={img} 
                      alt={`Uploaded ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </>
            )}

            {/* Upload Section */}
            <div className="border border-[#282828] rounded-lg bg-[#0a0a0a] flex-shrink-0 w-16 h-16">
              <label className="flex flex-col items-center justify-center h-full cursor-pointer p-1">
                <Upload className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400 text-center leading-tight mt-0.5">Upload</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="text-[9px] text-gray-500">{uploadedImages.length}/10</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

          {/* Action Buttons */}
          <div className="action-buttons flex items-center justify-between px-4 py-3 border-t border-[#282828]/50 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <button
            onClick={() => setShowCustomize(!showCustomize)}
            className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#282828] rounded-lg text-sm text-white transition-colors"
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Customize
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#282828] rounded-lg text-sm text-white transition-colors"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#282828] rounded-lg text-sm text-white transition-colors"
            >
              <Copy className="w-4 h-4 inline mr-2" />
              Copy
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Customize Panel */}
      {showCustomize && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div 
            className="bg-[#111111] border border-[#282828] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#282828]">
              <h2 className="text-sm font-semibold text-white">Customize PNL card</h2>
              <button
                onClick={() => setShowCustomize(false)}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3 overflow-y-auto max-h-[60vh]">
              {/* Text color */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Text color</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTextColor('#ffffff')}
                    className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#282828] cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Profit color */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Profit color</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProfitColor('#34d399')}
                    className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                  <input
                    type="color"
                    value={profitColor}
                    onChange={(e) => setProfitColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#282828] cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Loss color */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Loss color</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLossColor('#f43f5e')}
                    className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                  <input
                    type="color"
                    value={lossColor}
                    onChange={(e) => setLossColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#282828] cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Show USD values */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Show USD values</span>
                <button
                  onClick={() => setShowUSDValues(!showUSDValues)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showUSDValues ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      showUSDValues ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Main stat value */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Main stat value</span>
                <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#282828] rounded-lg p-1">
                  <button
                    onClick={() => setMainStatValue('USD')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      mainStatValue === 'USD'
                        ? 'bg-[#0a0a0a] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setMainStatValue('Native')}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      mainStatValue === 'Native'
                        ? 'bg-[#0a0a0a] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Native
                  </button>
                </div>
              </div>

              {/* Show text shadow */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Show text shadow</span>
                <button
                  onClick={() => setShowTextShadow(!showTextShadow)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showTextShadow ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      showTextShadow ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Gradient color */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Gradient color</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGradientColor('#000000')}
                    className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                  <input
                    type="color"
                    value={gradientColor}
                    onChange={(e) => setGradientColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#282828] cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Gradient strength */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">Gradient strength</span>
                  <span className="text-xs text-gray-400">{gradientStrength}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gradientStrength}
                  onChange={(e) => setGradientStrength(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">Background opacity</span>
                  <span className="text-xs text-gray-400">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Blur */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">Background blur</span>
                  <span className="text-xs text-gray-400">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Logo color */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Logo color</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLogoColor('#ffffff')}
                    className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                  <input
                    type="color"
                    value={logoColor}
                    onChange={(e) => setLogoColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#282828] cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-3 py-2 border-t border-[#282828] bg-[#0a0a0a]">
              <button
                onClick={() => setShowCustomize(false)}
                className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222222] border border-[#282828] rounded-lg text-xs text-white transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

