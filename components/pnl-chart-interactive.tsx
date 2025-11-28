"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Calendar } from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Dot
} from "recharts"
import { format, subDays, addDays, parse } from "date-fns"

interface PNLDataPoint {
  date: string
  pnl: number
  displayDate: string
}

interface PNLChartInteractiveProps {
  onCalendarClick?: () => void
  dateRange?: { start: Date; end: Date }
}

export function PNLChartInteractive({ 
  onCalendarClick, 
  dateRange 
}: PNLChartInteractiveProps) {
  const [chartData, setChartData] = useState<PNLDataPoint[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartHeight, setChartHeight] = useState(400)

  // Default date range: last 30 days
  const defaultStart = subDays(new Date(), 30)
  const defaultEnd = new Date()
  
  const [chartDateRange, setChartDateRange] = useState({
    start: dateRange?.start || defaultStart,
    end: dateRange?.end || defaultEnd
  })

  // Generate mock data - replace with real API data
  const generateMockData = useCallback((): PNLDataPoint[] => {
    const data: PNLDataPoint[] = []
    const days = Math.ceil((chartDateRange.end.getTime() - chartDateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= days; i++) {
      const date = addDays(chartDateRange.start, i)
      // Mock PNL data - replace with actual data
      const pnl = 0 // You can add variation here: Math.sin(i / 10) * 100
      
      data.push({
        date: format(date, "yyyy-MM-dd"),
        pnl: pnl,
        displayDate: format(date, "MMM d")
      })
    }
    
    return data
  }, [chartDateRange])

  // Initialize and update data
  useEffect(() => {
    const initialData = generateMockData()
    setChartData(initialData)

    // Simulate real-time updates (replace with actual WebSocket or polling)
    const interval = setInterval(() => {
      setChartData(prevData => {
        // Update the last data point with new PNL value
        // In real implementation, this would come from your API
        return prevData.map((point, index) => {
          if (index === prevData.length - 1) {
            // Update last point with slight variation (remove in production)
            return { ...point, pnl: point.pnl }
          }
          return point
        })
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [generateMockData])

  // Track chart height with ResizeObserver
  useEffect(() => {
    if (!chartContainerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const formatDateRange = () => {
    return `${format(chartDateRange.start, "MMM d, yyyy")} - ${format(chartDateRange.end, "MMM d, yyyy")}`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PNLDataPoint
      return (
        <div className="bg-[#1a1a1a] border border-[#282828] rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm font-medium mb-1">{data.displayDate}</p>
          <p className={`text-sm font-medium ${
            data.pnl >= 0 ? "text-green-400" : "text-red-400"
          }`}>
            PNL: ${data.pnl.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom dot for starting point
  const CustomStartDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload && payload.date === chartData[0]?.date) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#00d4aa" stroke="#0a0a0a" strokeWidth={2} />
          {/* Always show label for starting point */}
          <g>
            <rect
              x={cx - 25}
              y={cy - 30}
              width={50}
              height={20}
              fill="#1a1a1a"
              stroke="#282828"
              rx={4}
            />
            <text
              x={cx}
              y={cy - 15}
              textAnchor="middle"
              fill="#00d4aa"
              fontSize={10}
              fontWeight="medium"
            >
              ${payload.pnl.toFixed(2)}
            </text>
          </g>
        </g>
      )
    }
    return null
  }

  // Custom active dot - positioned on zero line
  const CustomActiveDot = (props: any) => {
    const { cx, payload } = props
    // The zero line is at 50% of chart height
    const zeroLineY = chartHeight / 2
    
    return (
      <g>
        <circle cx={cx} cy={zeroLineY} r={6} fill="#00d4aa" stroke="#0a0a0a" strokeWidth={2} />
        <rect
          x={cx - 25}
          y={zeroLineY - 30}
          width={50}
          height={20}
          fill="#1a1a1a"
          stroke="#282828"
          rx={4}
        />
        <text
          x={cx}
          y={zeroLineY - 15}
          textAnchor="middle"
          fill="#00d4aa"
          fontSize={10}
          fontWeight="medium"
        >
          ${payload.pnl.toFixed(2)}
        </text>
      </g>
    )
  }

  // Custom label for start date
  const CustomStartLabel = (props: any) => {
    const { x, y, payload } = props
    if (payload && payload.date === chartData[0]?.date) {
      return (
        <text
          x={x}
          y={y + 20}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={10}
          fontWeight="medium"
        >
          {format(parse(payload.date, "yyyy-MM-dd", new Date()), "dd MMM")}
        </text>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h3 className="text-base sm:text-lg font-medium text-white">PNL Chart</h3>
          <button
            onClick={onCalendarClick}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#1a1a1a] hover:bg-[#222222] border border-[#282828] rounded-lg transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-400">Calendar</span>
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
        {formatDateRange()}
      </div>

      {/* Chart Container */}
      <div 
        ref={chartContainerRef}
        className="flex-1 min-h-[250px] sm:min-h-[300px] md:min-h-[400px] relative overflow-hidden -mt-6 sm:-mt-8"
      >
        {chartData.length > 0 ? (
          <>
            {/* Chart with Recharts - hidden axes and grid */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    const index = typeof state.activeTooltipIndex === 'number' 
                      ? state.activeTooltipIndex 
                      : null
                    setHoveredIndex(index)
                    setIsHovering(true)
                  }
                }}
                onMouseLeave={() => {
                  setIsHovering(false)
                  setHoveredIndex(null)
                }}
              >
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* Hidden axes - no grid, no labels */}
                <XAxis hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#00d4aa" strokeWidth={2} strokeDasharray="0" />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#00d4aa"
                  strokeWidth={2}
                  fill="url(#pnlGradient)"
                  dot={false}
                  activeDot={<CustomActiveDot />}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Zero line - positioned absolutely */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#00d4aa] transform -translate-y-1/2 z-10 pointer-events-none"></div>

            {/* Gradient below zero line */}
            <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-gradient-to-b from-[#00d4aa]/10 to-transparent z-0 pointer-events-none"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              No PNL data available for this period
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

