import { Navigation } from "@/components/navigation"
import { TradingChart } from "@/components/trading-chart"

export default function ChartPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <TradingChart />
    </div>
  )
}
