"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Rocket, Plus, Wallet, Info } from "lucide-react"

export function TokenDeployer() {
  const [launchpad] = useState("Pump.Fun")
  const [devBuy] = useState("0.1")
  const [bundleWallets, setBundleWallets] = useState(0)
  const [totalBundleBuy] = useState("0.000")
  const [network, setNetwork] = useState("Devnet")
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenDescription, setTokenDescription] = useState("")
  
  // Tweet auto-post settings
  const [enableAutoTweet, setEnableAutoTweet] = useState(false)
  const [tweetText, setTweetText] = useState("")
  const [tweetHashtags, setTweetHashtags] = useState("")
  const [tweetSchedule, setTweetSchedule] = useState("immediate")
  const [tweetImage, setTweetImage] = useState("")
  const [tweetMentions, setTweetMentions] = useState("")

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



          {/* Tweet Auto-Post Settings */}
          <Card className="bg-[#282828] border-[#282828]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#d7ab54]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Tweet Auto-Post Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable Auto-Tweet Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Enable Auto-Tweet</Label>
                  <p className="text-gray-400 text-sm">Automatically post about your token launch</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded w-4 h-4 text-[#d7ab54] bg-[#282828] border-[#d7ab54] focus:ring-[#d7ab54] focus:ring-2"
                    checked={enableAutoTweet}
                    onChange={(e) => setEnableAutoTweet(e.target.checked)}
                  />
                </div>
              </div>

              {enableAutoTweet && (
                <>
                  {/* Tweet Text */}
                  <div>
                    <Label htmlFor="tweetText" className="text-white">
                      Tweet Content
                    </Label>
                    <Textarea
                      id="tweetText"
                      value={tweetText}
                      onChange={(e) => setTweetText(e.target.value)}
                      placeholder="🚀 Exciting news! Just launched $TOKEN on Solana! Join the revolution... #Solana #DeFi"
                      className="bg-[#282828] border-[#282828] text-white mt-1 min-h-[100px]"
                      maxLength={280}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400 text-xs">Use $TOKEN for symbol replacement</span>
                      <span className={`text-xs ${tweetText.length > 260 ? 'text-red-400' : 'text-gray-400'}`}>
                        {tweetText.length}/280
                      </span>
                    </div>
                  </div>

                  {/* Tweet Hashtags */}
                  <div>
                    <Label htmlFor="tweetHashtags" className="text-white">
                      Hashtags
                    </Label>
                    <Input
                      id="tweetHashtags"
                      value={tweetHashtags}
                      onChange={(e) => setTweetHashtags(e.target.value)}
                      placeholder="#Solana #DeFi #TokenLaunch #Crypto"
                      className="bg-[#282828] border-[#282828] text-white mt-1"
                    />
                    <p className="text-gray-400 text-xs mt-1">Separate hashtags with spaces</p>
                  </div>

                  {/* Tweet Mentions */}
                  <div>
                    <Label htmlFor="tweetMentions" className="text-white">
                      Mentions (@username)
                    </Label>
                    <Input
                      id="tweetMentions"
                      value={tweetMentions}
                      onChange={(e) => setTweetMentions(e.target.value)}
                      placeholder="@Solana @CaesarBot"
                      className="bg-[#282828] border-[#282828] text-white mt-1"
                    />
                    <p className="text-gray-400 text-xs mt-1">Separate usernames with spaces</p>
                  </div>

                  {/* Tweet Schedule */}
                  <div>
                    <Label htmlFor="tweetSchedule" className="text-white">
                      Post Schedule
                    </Label>
                    <Select value={tweetSchedule} onValueChange={setTweetSchedule}>
                      <SelectTrigger className="bg-[#282828] border-[#282828] text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#282828] border-[#282828]">
                        <SelectItem value="immediate">Immediate (after deployment)</SelectItem>
                        <SelectItem value="5min">5 minutes after deployment</SelectItem>
                        <SelectItem value="15min">15 minutes after deployment</SelectItem>
                        <SelectItem value="30min">30 minutes after deployment</SelectItem>
                        <SelectItem value="1hour">1 hour after deployment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tweet Image URL */}
                  <div>
                    <Label htmlFor="tweetImage" className="text-white">
                      Image URL (Optional)
                    </Label>
                    <Input
                      id="tweetImage"
                      value={tweetImage}
                      onChange={(e) => setTweetImage(e.target.value)}
                      placeholder="https://example.com/token-image.png"
                      className="bg-[#282828] border-[#282828] text-white mt-1"
                    />
                    <p className="text-gray-400 text-xs mt-1">Direct link to image (PNG, JPG, GIF)</p>
                  </div>

                  {/* Tweet Preview */}
                  <div className="border border-[#d7ab54]/20 rounded-lg p-3 bg-[#1a1a1a]">
                    <Label className="text-white text-sm mb-2">Tweet Preview</Label>
                    <div className="text-gray-300 text-sm">
                      {tweetText || "Your tweet will appear here..."}
                      {tweetHashtags && <span className="text-[#d7ab54]"> {tweetHashtags}</span>}
                      {tweetMentions && <span className="text-blue-400"> {tweetMentions}</span>}
                    </div>
                  </div>
                </>
              )}
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

                <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                  <span className="text-gray-400">Network:</span>
                  <Badge variant="INFO" className="border-[#d7ab54] text-[#d7ab54]">
                    {network}
                  </Badge>
                </div>

                {enableAutoTweet && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                      <span className="text-gray-400">Auto-Tweet:</span>
                      <Badge className="bg-green-600 text-white">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                      <span className="text-gray-400">Tweet Schedule:</span>
                      <span className="text-white font-medium capitalize">{tweetSchedule.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    {tweetImage && (
                      <div className="flex justify-between items-center py-2 border-b border-[#282828]">
                        <span className="text-gray-400">Tweet Image:</span>
                        <Badge className="bg-blue-600 text-white">Included</Badge>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Deploy Button */}
              <div className="pt-4">
                <Button
                  className="w-full bg-[#d7ab54] text-black hover:bg-[#c49730] font-semibold py-3 text-lg"
                  disabled={!tokenName || !tokenSymbol}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  {enableAutoTweet ? 'Deploy & Tweet' : 'Deploy Token'}
                </Button>
                {enableAutoTweet && (
                  <p className="text-gray-400 text-sm mt-2 text-center">
                    Token will be deployed and tweet will be posted {tweetSchedule === 'immediate' ? 'immediately' : `in ${tweetSchedule}`}
                  </p>
                )}
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
