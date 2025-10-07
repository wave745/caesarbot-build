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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/">
                  <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105 animate-glow-pulse">
                    Start Trading
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 px-8 py-4 text-lg transition-all duration-300 animate-border-glow">
                  View Features
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-text-glow">
                Why Choose CaesarX?
              </h3>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto animate-fade-in-up">
                Built for professional traders, designed for everyone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 group animate-fade-in-up animate-border-glow"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-300 animate-bounce-gentle animate-glow-pulse">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-semibold mb-2 text-white animate-fade-in-up">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm animate-fade-in-up">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trading Tools Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-text-glow">
                Professional Trading Tools
              </h3>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto animate-fade-in-up">
                Everything you need to dominate the markets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow">
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-4 text-white">Discover</h4>
                  <p className="text-gray-400 mb-4">Explore new tokens and market opportunities</p>
                  <Link href="/">
                    <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-glow-pulse">
                      Start Exploring
                    </Button>
                  </Link>
                </CardContent>
              </Card>


              <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-200">
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-4 text-white">Tracker</h4>
                  <p className="text-gray-400 mb-4">Monitor wallet activities and token movements</p>
                  <Link href="/tracker">
                    <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-glow-pulse">
                      Start Tracking
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-400">
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-4 text-white">Token Sniper</h4>
                  <p className="text-gray-400 mb-4">Catch new tokens as they launch with lightning speed</p>
                  <Link href="/sniper">
                    <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-glow-pulse">
                      Start Sniping
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-600">
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-4 text-white">Portfolio</h4>
                  <p className="text-gray-400 mb-4">Monitor your positions and performance in real-time</p>
                  <Link href="/portfolio">
                    <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-glow-pulse">
                      View Portfolio
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-800">
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-4 text-white">Deployer</h4>
                  <p className="text-gray-400 mb-4">Deploy and manage your own tokens easily</p>
                  <Link href="/deployer">
                    <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-glow-pulse">
                      Deploy Token
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-1000">
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-4 text-white">Meta</h4>
                  <p className="text-gray-400 mb-4">Advanced metadata and token information</p>
                  <Link href="/meta">
                    <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-glow-pulse">
                      View Meta
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900/50 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-text-glow">
                Rewards
              </h3>
              <p className="text-xl text-gray-300 mb-4 animate-fade-in-up">
                Trade more. Climb higher. Earn rewards as you conquer.
              </p>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto animate-fade-in-up delay-200">
                Leaderboards rank the strongest. Monthly rewards in SOL for top performers. 
                Exclusive perks & badges for active traders.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Revenue Share System */}
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <h4 className="text-2xl font-bold text-white mb-4">
                    Revenue Share System
                  </h4>
                  <p className="text-lg text-gray-300 mb-6">
                    Win together, earn together.
                  </p>
                  <p className="text-gray-400 mb-8">
                    Caesar Bot doesn't just take fees — it gives back.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
                    <p className="text-gray-300">
                      A portion of all trading fees is redistributed to active users
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
                    <p className="text-gray-300">
                      The more you trade, the bigger your share of the rewards pool
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
                    <p className="text-gray-300">
                      Aligns community growth with individual profit
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 font-semibold text-center">
                    Result: You don't just profit from trades — you profit from the empire itself.
                  </p>
                </div>
              </div>

              {/* Visual Elements */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-gray-800/50 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2 animate-bounce-gentle">🏆</div>
                      <h5 className="text-lg font-semibold text-white mb-2">Leaderboards</h5>
                      <p className="text-sm text-gray-400">Rank the strongest traders</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-200">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2 animate-bounce-gentle">💰</div>
                      <h5 className="text-lg font-semibold text-white mb-2">SOL Rewards</h5>
                      <p className="text-sm text-gray-400">Monthly rewards for top performers</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-400">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2 animate-bounce-gentle">🎖️</div>
                      <h5 className="text-lg font-semibold text-white mb-2">Badges</h5>
                      <p className="text-sm text-gray-400">Exclusive perks for active traders</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animate-border-glow delay-600">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2 animate-bounce-gentle">📈</div>
                      <h5 className="text-lg font-semibold text-white mb-2">Revenue Share</h5>
                      <p className="text-sm text-gray-400">Profit from the empire itself</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Ready to Conquer the Markets?
            </h3>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of successful traders who trust CaesarX for their Solana trading needs.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold px-12 py-4 text-xl transition-all duration-300 hover:scale-105">
                Get Started Now
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
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
