import { Navigation } from "@/components/navigation"
import { DashboardContent } from "@/components/dashboard-content"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="p-3 sm:p-6">
        <DashboardContent />
      </main>
    </div>
  )
}
