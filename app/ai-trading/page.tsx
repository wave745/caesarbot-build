import { Navigation } from "@/components/navigation"

export default function AITradingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">AI Trading</h1>
            <p className="text-xl text-gray-400">Coming Soon</p>
            <p className="text-gray-500 max-w-md mx-auto">
              Advanced AI-powered trading algorithms and automated strategies are being developed to enhance your
              trading experience.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
