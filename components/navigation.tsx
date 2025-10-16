"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Settings, Bell, Wallet, Menu, Copy, Zap, TrendingUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

const navItems = [
  { name: "Discover", href: "/" },
  { name: "Trending", href: "/trending" },
  { name: "Tracker", href: "/tracker" },
  { name: "Scanner", href: "/scanner" },
  { name: "Sniper", href: "/sniper" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Deployer", href: "/deployer" },
  { name: "Rewards", href: "/rewards" },
]

export function Navigation() {
  const pathname = usePathname()
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  interface ConnectedWallet {
    name: string
    address: string
    balance: number
    isConnected: boolean
  }

  const connectedWallets: ConnectedWallet[] = []
  const isWalletConnected = false

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-black border-b border-gray-800 px-4 py-3 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center">
              <Image
                src="/caesarx-logo.png"
                alt="CaesarX"
                width={44}
                height={44}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                priority
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.parentElement!.innerHTML = '<span class="text-white font-bold text-base sm:text-lg">C</span>'
                }}
              />
            </div>
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold text-base sm:text-lg lg:text-xl tracking-normal hidden sm:block">
              CaesarX
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1 mx-6 flex-1 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 whitespace-nowrap relative group ${
                pathname === item.href 
                  ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white shadow-lg shadow-yellow-500/20 border border-yellow-500/30" 
                  : "text-gray-400 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-orange-500/10 hover:shadow-lg hover:shadow-yellow-500/20"
              }`}
            >
              {item.name}
              <div className={`absolute inset-0 rounded-md transition-all duration-300 ${
                pathname === item.href 
                  ? "ring-2 ring-yellow-500 ring-opacity-50" 
                  : "group-hover:ring-2 group-hover:ring-yellow-500 group-hover:ring-opacity-30"
              }`}></div>
            </Link>
          ))}
        </div>

        {/* Desktop User Actions */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">

          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="bg-[#111111] border border-[#111111] rounded-md px-3 py-2 flex items-center gap-2 text-sm hover:bg-[#111111] hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
              >
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">0</span>
                <div className="w-px h-4 bg-gray-600"></div>
                <span className="text-white font-medium">0.00</span>
                <Menu className="w-4 h-4 text-gray-400" />
              </button>

              {isWalletDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#111111] border border-[#111111] rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    {!isWalletConnected ? (
                      <div className="text-center py-8">
                        <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-white font-medium mb-2">No Wallet Connected</h3>
                        <p className="text-gray-400 text-sm mb-4">Connect your wallet to get started</p>
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 w-full">Connect Wallet</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {connectedWallets.map((wallet, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-[#111111] rounded border border-[#111111]"></div>
                              <div>
                                <div className="text-gray-400 text-xs">{wallet.name}</div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm font-medium">{wallet.address}</span>
                                  <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-white text-sm font-medium">{wallet.balance}</span>
                              <Menu className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        ))}

                        {/* Quick Buy Settings */}
                        <div className="border-t border-[#282828] pt-3">
                          <div className="text-gray-400 text-xs mb-2">Clipboard quick buy settings</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Zap className="w-4 h-4 text-gray-400" />
                              <div className="flex items-center gap-1">
                                <span className="text-white text-sm font-medium">0</span>
                                <Menu className="w-3 h-3 text-gray-400" />
                              </div>
                              <span className="text-white text-sm font-medium">P1</span>
                              <TrendingUp className="w-4 h-4 text-gray-400" />
                            </div>
                            <Link href="/portfolio">
                                                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-[#282828] border-[#282828] text-white hover:bg-[#282828] text-xs px-3 py-1"
                                  onClick={() => setIsWalletDropdownOpen(false)}
                                >
                                Manage
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-300 w-9 h-9 group">
              <Bell className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-300 w-9 h-9 group">
              <Settings className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-300 w-9 h-9 group">
              <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </Button>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-yellow-400 hover:bg-gray-800/80 transition-all duration-300 w-9 h-9 group"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" /> : <Menu className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
          </Button>
        </div>
      </div>



      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden absolute top-full left-0 right-0 bg-[#282828] border-b border-[#282828] shadow-xl z-50"
        >
          <div className="px-4 py-3">
            {/* Mobile Navigation */}
            <div className="space-y-1 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-3 text-sm font-medium rounded-md transition-all duration-300 relative group ${
                    pathname === item.href 
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white shadow-lg shadow-yellow-500/20 border border-yellow-500/30" 
                      : "text-gray-400 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-orange-500/10 hover:shadow-lg hover:shadow-yellow-500/20"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                  <div className={`absolute inset-0 rounded-md transition-all duration-300 ${
                    pathname === item.href 
                      ? "ring-2 ring-yellow-500 ring-opacity-50" 
                      : "group-hover:ring-2 group-hover:ring-yellow-500 group-hover:ring-opacity-30"
                  }`}></div>
                </Link>
              ))}
            </div>

            {/* Mobile Wallet Section */}
                                        <div className="border-t border-[#111111] pt-4">
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg mb-3">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-white font-medium text-sm">Wallet</div>
                    <div className="text-gray-400 text-xs">Not connected</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 text-xs px-3 py-1"
                >
                  Connect
                </Button>
              </div>

              {/* Mobile Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 hover:bg-gray-700/80 transition-all duration-300 text-xs group">
                  <Bell className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                  Alerts
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 hover:bg-gray-700/80 transition-all duration-300 text-xs group">
                  <Settings className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 hover:bg-gray-700/80 transition-all duration-300 text-xs group">
                  <User className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
