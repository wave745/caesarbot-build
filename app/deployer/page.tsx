import { Navigation } from "@/components/navigation"
import { TokenDeployer } from "@/components/token-deployer"

export default function DeployerPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <TokenDeployer />
    </div>
  )
}
