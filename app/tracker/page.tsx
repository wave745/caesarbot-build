import { Navigation } from "@/components/navigation"
import { WalletTracker } from "@/components/wallet-tracker"

export default function TrackerPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <WalletTracker />
    </div>
  )
}
