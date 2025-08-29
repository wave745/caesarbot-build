"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Gift, TrendingUp, Users, Award, Crown } from "lucide-react"

export function RewardsDashboard() {
  const [activeTab, setActiveTab] = useState("rewards")

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">REWARDS</h1>
        <p className="text-gray-400">Follow site theme</p>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#d7a834] rounded-lg">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Your Rank</p>
                <p className="text-2xl font-bold text-white">--</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#d7a834] rounded-lg">
                <Star className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">CAESAR Points</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#d7a834] rounded-lg">
                <Users className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Referrals</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#d7a834] rounded-lg">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-900 border-gray-800 mb-6">
          <TabsTrigger value="rewards" className="data-[state=active]:bg-[#d7a834] data-[state=active]:text-black">
            Rewards
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#d7a834] data-[state=active]:text-black">
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="benefits" className="data-[state=active]:bg-[#d7a834] data-[state=active]:text-black">
            Benefits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Gift className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Active Rewards</h2>
              <p className="text-gray-400 mb-6">Start trading to unlock rewards and challenges</p>
              <Button className="bg-[#d7a834] text-black hover:bg-[#c49730]">Start Trading</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-[#d7a834]" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Leaderboard Coming Soon</h3>
                <p className="text-gray-400">Compete with other traders for the top spots</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Where Users can claim all of Caesar rewards</h2>
            <p className="text-gray-400">Unlock exclusive benefits with your CAESAR points</p>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Award className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Benefits Available</h2>
              <p className="text-gray-400 mb-6">Earn CAESAR points to unlock exclusive benefits</p>
              <Button className="bg-[#d7a834] text-black hover:bg-[#c49730]">Learn How to Earn</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
