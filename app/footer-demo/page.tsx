import { CaesarXFooter } from "@/components/caesarx-footer"

export default function FooterDemoPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CaesarX Terminal Footer Demo</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Terminal Footer Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-green-400 mb-2">Status Indicators</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Network status (Stable/Unstable/Connecting)</li>
                  <li>• Live FPS counter (55-65 FPS)</li>
                  <li>• System latency monitoring</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-green-400 mb-2">Interactive Trackers</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Watchlist tracker</li>
                  <li>• Wallet tracker</li>
                  <li>• PnL tracker</li>
                  <li>• Price alerts</li>
                  <li>• X (Twitter) tracker</li>
                  <li>• Trenches tracker</li>
                  <li>• Alpha tracker</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-green-400 mb-2">Live System Stats</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Solana balance display</li>
                  <li>• USD value conversion</li>
                  <li>• Network latency</li>
                  <li>• Mainnet status</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-green-400 mb-2">Quick Actions</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Documentation access</li>
                  <li>• Social media links</li>
                  <li>• Language selector</li>
                  <li>• Network indicator</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Design Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-blue-400 mb-2">Layout</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Height: 44px (h-11)</li>
                  <li>• Fixed positioning</li>
                  <li>• Full width coverage</li>
                  <li>• Z-index: 50</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-blue-400 mb-2">Styling</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Background: rgba(10,10,10,0.95)</li>
                  <li>• Border: 1px solid #1a1a1a</li>
                  <li>• Backdrop blur effect</li>
                  <li>• Subtle shadow</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-blue-400 mb-2">Typography</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Font size: text-xs</li>
                  <li>• Font weight: medium</li>
                  <li>• Monospace for stats</li>
                  <li>• Color: gray-400</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Interactive Features</h2>
            <div className="text-sm text-gray-300 space-y-2">
              <p>• <strong>Click trackers</strong> to toggle active state (green when active)</p>
              <p>• <strong>Hover effects</strong> on all interactive elements</p>
              <p>• <strong>Live updates</strong> for FPS and latency every 2 seconds</p>
              <p>• <strong>Tooltips</strong> on social media buttons</p>
              <p>• <strong>Responsive design</strong> that adapts to different screen sizes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
