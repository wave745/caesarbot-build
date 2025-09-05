"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { 
  Trophy, 
  Users, 
  Award, 
  Crown, 
  Share2, 
  ChevronUp,
  Activity,
  BarChart3
} from "lucide-react"

export function RewardsDashboard() {
  const [activeTab, setActiveTab] = useState("rewards")

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Sub-navigation */}
      <div className="mb-8">
        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeTab === "rewards" ? "default" : "ghost"}
            className={`text-lg font-semibold px-6 py-3 ${activeTab === "rewards" ? "bg-[#d7ab54] hover:bg-[#c49730] text-black" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("rewards")}
          >
            Rewards
          </Button>
          <Button 
            variant={activeTab === "leaderboard" ? "default" : "ghost"}
            className={`text-lg font-semibold px-6 py-3 ${activeTab === "leaderboard" ? "bg-[#d7ab54] hover:bg-[#c49730] text-black" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leaderboard
          </Button>
          <Button 
            variant={activeTab === "benefits" ? "default" : "ghost"}
            className={`text-lg font-semibold px-6 py-3 ${activeTab === "benefits" ? "bg-[#d7ab54] hover:bg-[#c49730] text-black" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("benefits")}
          >
            Benefits
          </Button>
        </div>
      </div>

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="flex justify-center mb-8">
            <Card className="bg-black border-zinc-800 w-64 text-center">
              <CardContent className="p-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                </div>
                <h3 className="text-white font-semibold mb-1 text-sm">Username</h3>
                <div className="text-orange-500 font-bold text-base mb-1">1X Rewards</div>
                <div className="text-gray-400 text-xs mb-1">0% Referral Rate</div>
                <div className="text-gray-400 text-xs mb-3">0 referrals</div>
                <Badge className="bg-gray-600 text-white mb-3 text-xs">No Tier</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">Edit Referral</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">Share Referral</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress and Claim Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SOL Rewards Graph Card */}
            <Card className="bg-black border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">SOL Rewards</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="h-32 bg-[#282828] rounded-lg mb-4 flex items-end justify-between px-4 py-2">
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7ab54] rounded-t" style={{ height: '60%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 22</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7ab54] rounded-t" style={{ height: '80%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 23</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7ab54] rounded-t" style={{ height: '70%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 24</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7ab54] rounded-t" style={{ height: '90%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 25</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7ab54] rounded-t" style={{ height: '75%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 26</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7ab54] rounded-t" style={{ height: '85%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 27</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7ab54] rounded-t" style={{ height: '95%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 28</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 bg-[#d7a834] rounded-t" style={{ height: '100%' }}></div>
                    <span className="text-xs text-gray-400 mt-1">Aug 29</span>
                  </div>
                </div>
                <div className="text-center text-gray-400 text-xs">
                  <span>0 SOL</span>
                  <span className="float-right">0.02 SOL</span>
                </div>
              </CardContent>
            </Card>

            {/* Claim Card */}
            <Card className="bg-black border-zinc-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Claim</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-transparent rounded-full border-2 border-purple-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-green-500 rounded-full opacity-20"></div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <Image src="/sol-logo.png" alt="Solana" width={16} height={16} className="w-4 h-4" />
                      </div>
                      <span className="text-white font-semibold">+0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-transparent rounded-full border border-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center">
                        <Image src="/caesarx-logo.png" alt="CaesarX" width={16} height={16} className="w-4 h-4" />
                      </div>
                      <span className="text-white font-semibold">+0</span>
                    </div>
                  </div>
                  <Button className="w-full bg-black hover:bg-zinc-900 text-white border border-zinc-600">Nothing to Claim</Button>
                </div>
              </CardContent>
            </Card>

            {/* Quests Card */}
            <Card className="bg-black border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Quests</h3>
                  <Button variant="link" className="text-[#d7ab54] p-0 h-auto">Points Breakdown</Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-[#282828] rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#d7ab54] rounded-full border-t-transparent"></div>
                      </div>
                    <div className="flex-1">
                      <div className="text-white text-sm">+0</div>
                      <div className="text-gray-400 text-xs">No active quests</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-[#282828] rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#d7ab54] rounded-full border-t-transparent" style={{ transform: 'rotate(45deg)' }}></div>
                      </div>
                    <div className="flex-1">
                      <div className="text-white text-sm">+0</div>
                      <div className="text-gray-400 text-xs">No active quests</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-[#282828] rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#d7ab54] rounded-full border-t-transparent" style={{ transform: 'rotate(90deg)' }}></div>
                      </div>
                    <div className="flex-1">
                      <div className="text-white text-sm">+0</div>
                      <div className="text-gray-400 text-xs">No active quests</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Section */}
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Referrals</span>
                <Badge variant="INFO">0</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#282828]">
                      <th className="text-left py-3 text-gray-400 font-normal">Email/Wallet</th>
                      <th className="text-left py-3 text-gray-400 font-normal">Date Joined ↓</th>
                      <th className="text-left py-3 text-gray-400 font-normal">Type</th>
                      <th className="text-left py-3 text-gray-400 font-normal">Points Earned</th>
                      <th className="text-left py-3 text-gray-400 font-normal">SOL Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-gray-400 text-sm">
                      <td className="py-3">No data available</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          {/* User Summary Card */}
          <div className="flex justify-center mb-8">
            <Card className="bg-[#282828] border-[#282828] w-64 text-center">
              <CardContent className="p-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                </div>
                <h3 className="text-white font-semibold mb-1 text-sm">Username</h3>
                <div className="flex items-center justify-center gap-1 text-white font-semibold mb-1 text-sm">
                  <ChevronUp className="w-3 h-3 text-gray-500" />
                  0
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <span>No Rank</span>
                  <Share2 className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Table */}
          <Card className="bg-[#282828] border-[#282828]">
            <CardHeader>
              <CardTitle className="text-white">Points Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#282828]">
                      <th className="text-left py-3 text-gray-400 font-normal">Rank</th>
                      <th className="text-left py-3 text-gray-400 font-normal">User ID</th>
                      <th className="text-left py-3 text-gray-400 font-normal">Total Points</th>
                      <th className="text-left py-3 text-gray-400 font-normal">Trading</th>
                      <th className="text-left py-3 text-gray-400 font-normal">Referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#282828]">
                      <td className="py-4 text-white font-semibold">-</td>
                      <td className="py-4 text-gray-400">No data</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                          0
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                          0
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                          0
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">4</Button>
                <Button variant="outline" size="sm">YOU</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Benefits Tab */}
      {activeTab === "benefits" && (
        <div className="space-y-6">
          {/* Reward Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Raydium Rewards */}
            <Card className="bg-[#282828] border-[#282828]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">Raydium Rewards</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      No claimable rewards available. Trade Raydium and Launch Lab tokens to earn rewards.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600">
                      Claim All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sugar Rewards */}
            <Card className="bg-[#282828] border-[#282828]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">Sugar Rewards</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      No Sugar rewards available to claim.
                    </p>
                    <Button className="w-full bg-pink-500 hover:bg-pink-600">
                      Claim All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reward Tiers */}
          <Card className="bg-[#282828] border-[#282828]">
            <CardHeader>
              <CardTitle className="text-white">Reward Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-[#282828] rounded-lg">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Bronze</h3>
                  <p className="text-gray-400 text-sm mb-4">Current Tier</p>
                  <div className="text-yellow-500 font-semibold">2X Rewards</div>
                </div>
                
                <div className="text-center p-6 border border-[#282828] rounded-lg">
                  <div className="w-16 h-16 bg-[#282828] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-400 font-semibold mb-2">Silver</h3>
                  <p className="text-gray-500 text-sm mb-4">Next Tier</p>
                  <div className="text-gray-500 font-semibold">2.5X Rewards</div>
                </div>
                
                <div className="text-center p-6 border border-[#282828] rounded-lg">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-gray-400 font-semibold mb-2">Gold</h3>
                  <p className="text-gray-500 text-sm mb-4">Premium Tier</p>
                  <div className="text-gray-500 font-semibold">3X Rewards</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
