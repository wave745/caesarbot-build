"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Rocket, Plus, Wallet, Settings, Info } from "lucide-react"

export function TokenDeployer() {
  const [launchpad, setLaunchpad] = useState("Pump.Fun")
  const [devBuy, setDevBuy] = useState("0.1")
  const [bundleWallets, setBundleWallets] = useState(0)
  const [totalBundleBuy, setTotalBundleBuy] = useState("0.000")
  const [network, setNetwork] = useState("Devnet")
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenDescription, setTokenDescription] = useState("")

  const caesarPointsReward = 100

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Deployer Page</h1>
        <p className="text-gray-400">Deploy and manage your tokens with advanced features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Token Configuration */}
        <div className="space-y-6">
          {/* Token Details */}
                  <Card className="bg-[#282828] border-[#282828]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#d7ab54]" />
              Token Configuration
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tokenName" className="text-white">
                    Token Name
                  </Label>
                  <Input
                    id="tokenName"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Enter token name"
                    className="bg-[#282828] border-[#282828] text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tokenSymbol" className="text-white">
                    Token Symbol
                  </Label>
                  <Input
                    id="tokenSymbol"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="e.g., CAESAR"
                    className="bg-[#282828] border-[#282828] text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tokenDescription" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="tokenDescription"
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  placeholder="Describe your token..."
                  className="bg-[#282828] border-[#282828] text-white mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="network" className="text-white">
                  Network
                </Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger className="bg-[#282828] border-[#282828] text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282828] border-[#282828]">
                    <SelectItem value="Devnet">Devnet</SelectItem>
                    <SelectItem value="Mainnet">Mainnet</SelectItem>
                    <SelectItem value="Testnet">Testnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
                  <Card className="bg-[#282828] border-[#282828]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#d7ab54]" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supply" className="text-white">
                  Total Supply
                </Label>
                <Input
                  id="supply"
                  placeholder="1,000,000,000"
                  className="bg-[#282828] border-[#282828] text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="decimals" className="text-white">
                  Decimals
                </Label>
                <Input id="decimals" placeholder="9" className="bg-[#282828] border-[#282828] text-white mt-1" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-white">Mint Authority</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-400 text-sm">Revoke mint authority</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-white">Freeze Authority</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-400 text-sm">Revoke freeze authority</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Deployment Summary */}
        <div className="space-y-6">
          {/* Deployment Summary */}
          <Card className="bg-[#282828] border-[#282828]">
            <CardHeader>
              <CardTitle className="text-white">Deployment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                  <span className="text-gray-400">Launchpad:</span>
                  <span className="text-white font-medium">{launchpad}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                  <span className="text-gray-400">Dev Buy:</span>
                  <span className="text-white font-medium">{devBuy} SOL</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                  <span className="text-gray-400">Bundle Wallets:</span>
                  <span className="text-white font-medium">{bundleWallets}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                  <span className="text-gray-400">Total Bundle Buy:</span>
                  <span className="text-white font-medium">{totalBundleBuy} SOL</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                  <span className="text-gray-400">Caesar Points Reward:</span>
                  <Badge className="bg-[#d7ab54] text-black">{caesarPointsReward}</Badge>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Network:</span>
                  <Badge variant="outline" className="border-[#d7ab54] text-[#d7ab54]">
                    {network}
                  </Badge>
                </div>
              </div>

              {/* Deploy Button */}
              <div className="pt-4">
                <Button
                  className="w-full bg-[#d7ab54] text-black hover:bg-[#c49730] font-semibold py-3 text-lg"
                  disabled={!tokenName || !tokenSymbol}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Deploy Token
                </Button>
                <p className="text-gray-400 text-sm mt-2 text-center">change Text to white so its readable</p>
              </div>
            </CardContent>
          </Card>

          {/* Bundle Wallets Management */}
          <Card className="bg-[#282828] border-[#282828]">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#d7ab54]" />
                  Bundle Wallets (min 2, max 5 total)
                </span>
                <Button
                  size="sm"
                  className="bg-[#d7ab54] text-black hover:bg-[#c49730]"
                  onClick={() => setBundleWallets(Math.min(5, bundleWallets + 1))}
                  disabled={bundleWallets >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Button>
              </CardTitle>
              <p className="text-gray-400 text-sm">Change buttons background to hex code- #d7ab54</p>
            </CardHeader>
            <CardContent>
              {bundleWallets === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No bundle wallets created yet</p>
                  <Button className="bg-[#d7ab54] text-black hover:bg-[#c49730]" onClick={() => setBundleWallets(2)}>
                    Create Bundle Wallets
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: bundleWallets }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#d7ab54] rounded-full flex items-center justify-center">
                          <span className="text-black font-semibold text-sm">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Wallet {i + 1}</p>
                          <p className="text-gray-400 text-sm">
                            {`${Math.random().toString(36).substring(2, 8)}...${Math.random()
                              .toString(36)
                              .substring(2, 8)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">0.1 SOL</p>
                        <p className="text-gray-400 text-sm">Ready</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#d7ab54] text-[#d7ab54] hover:bg-[#d7ab54] hover:text-black bg-transparent"
                      onClick={() => setBundleWallets(Math.max(0, bundleWallets - 1))}
                    >
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#d7ab54] text-black hover:bg-[#c49730]"
                      onClick={() => setBundleWallets(Math.min(5, bundleWallets + 1))}
                      disabled={bundleWallets >= 5}
                    >
                      Add More
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="bg-[#282828] border-[#282828]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#d7ab54] mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-2">Deployment Information</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Bundle wallets help distribute initial liquidity</li>
                    <li>• Dev buy creates initial market activity</li>
                    <li>• Caesar points are earned for successful deployments</li>
                    <li>• All transactions are secured and verified</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
