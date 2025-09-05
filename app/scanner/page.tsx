import { Navigation } from "@/components/navigation"
import { ScannerContent } from "@/components/scanner-content"

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <ScannerContent />
    </div>
  )
}
