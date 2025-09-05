import { Navigation } from "@/components/navigation"
import { SniperContent } from "@/components/sniper-content"

export default function SniperPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="p-3 sm:p-6">
        <SniperContent />
      </main>
    </div>
  )
}
