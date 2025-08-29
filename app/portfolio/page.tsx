import { Navigation } from "@/components/navigation"
import { PortfolioContent } from "@/components/portfolio-content"

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="p-6">
        <PortfolioContent />
      </main>
    </div>
  )
}
