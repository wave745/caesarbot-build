"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Shield, TrendingUp, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Advanced Trading",
      description: "Professional-grade trading tools with real-time market data"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Ultra-low latency execution on Solana blockchain"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Safe",
      description: "Enterprise-grade security with non-custodial trading"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Join thousands of successful traders worldwide"
    }
  ]


  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Header */}
      <header className="relative z-20 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/caesarx-logo.png" 
              alt="CaesarX Logo" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              CaesarX
            </span>
          </div>
          
          {/* Trade Now Button */}
          <Link href="/">
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold px-6 py-2 transition-all duration-300 hover:scale-105">
              Trade Now
            </Button>
          </Link>
        </div>
      </header>

      {/* Animated Background Logo */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-96 h-96 opacity-20 animate-pulse">
            <img 
              src="/caesarXlogo3d2.gif" 
              alt="CaesarX Logo" 
              className="w-full h-full object-contain animate-spin-slow"
              style={{ animationDuration: '20s' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="mb-8">
                <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 px-4 py-2 text-sm font-medium">
                  The Future of Solana Trading
                </Badge>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent animate-text-glow">
                CaesarX
              </h1>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 text-gray-300">
                Conquer Solana Trading
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                The most advanced trading platform on Solana. Experience lightning-fast execution, 
                professional tools, and join the elite community of successful traders.
              </p>

              {/* Get Started Button */}
              <div className="flex justify-center mb-16">
                <Link href="/">
                  <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold px-12 py-4 text-xl transition-all duration-300 hover:scale-105 animate-glow-pulse">
                    Get Started Now
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </section>





        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a 
                  href="#" 
                  className="hover:text-yellow-400 transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                <div className="w-px h-4 bg-gray-600"></div>
                <a 
                  href="#" 
                  className="hover:text-yellow-400 transition-colors duration-300"
                >
                  Terms & Condition
                </a>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://x.com/caesarxtrade?s=21" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                    aria-label="Follow us on X (Twitter)"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://t.me/CaesarXtrade" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                    aria-label="Join our Telegram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
