import { Navigation } from "@/components/navigation"
import { RewardsDashboard } from "@/components/rewards-dashboard"

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <RewardsDashboard />
    </div>
  )
}
