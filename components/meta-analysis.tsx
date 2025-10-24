"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, BarChart3, AlertTriangle, Activity, Flame, RefreshCw, Brain } from "lucide-react"
import { PumpApiService, MetaData } from "@/lib/pump-api"
import { MetaAIChat } from "@/components/meta-ai-chat"
import { MetaContext } from "@/lib/services/grok-service"

export function MetaAnalysis() {
  const [activeTab, setActiveTab] = useState("overview")
  const [metaData, setMetaData] = useState<MetaData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetaData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await PumpApiService.getCurrentMetas()
      
      if (response.error) {
        setError(response.error)
        // Always show data if available, even if there's an error (fallback data)
        if (response.data && response.data.length > 0) {
          setMetaData(response.data)
        }
      } else {
        setMetaData(response.data)
      }
    } catch (err) {
      console.error('Error in fetchMetaData:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      
      // Try to get cached data as fallback
      const cachedData = PumpApiService.getCachedMetas()
      if (cachedData.length > 0) {
        setMetaData(cachedData)
        setError('Using cached data due to connection issues')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetaData()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchMetaData()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Calculate stats from meta data
  const totalMetas = metaData.length
  const topMeta = metaData[0]
  const averageScore = metaData.length > 0 ? Math.round(metaData.reduce((sum, meta) => sum + meta.score, 0) / metaData.length) : 0

  // Prepare meta context for AI
  const metaContext: MetaContext = {
    topMetas: metaData.slice(0, 10).map(meta => ({
      word: meta.word,
      score: meta.score,
      word_with_strength: meta.word_with_strength
    })),
    totalMetas,
    averageScore
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">META ANALYSIS</h1>
        <p className="text-gray-400">DAILY META FEATURE ANALYSIS - Advanced Market Intelligence</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-black border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-700 rounded-lg">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-400 text-xs">Top Meta</p>
                <p className="text-lg font-bold text-white truncate">
                  {loading ? '--' : topMeta?.word || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  {loading ? 'Loading...' : topMeta ? `Score: ${topMeta.score}` : 'No data'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-700 rounded-lg">
                <Activity className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Active Metas</p>
                <p className="text-lg font-bold text-white">
                  {loading ? '--' : totalMetas}
                </p>
                <p className="text-xs text-gray-500">
                  {loading ? 'Loading...' : 'Live data'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-700 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Avg Score</p>
                <p className="text-lg font-bold text-white">
                  {loading ? '--' : averageScore}
                </p>
                <p className="text-xs text-gray-500">
                  {loading ? 'Loading...' : 'Market strength'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black border-zinc-800 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black">
            Overview
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black">
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="rankings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-black">
            Meta Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {error && metaData.length === 0 && (
            <Card className="bg-red-900/20 border-red-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="text-red-500 font-semibold">Error Loading Data</h3>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {error && metaData.length > 0 && (
            <Card className="bg-yellow-900/20 border-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h3 className="text-yellow-500 font-semibold text-sm">Limited Data</h3>
                    <p className="text-yellow-400 text-xs">Showing limited data. Real-time updates unavailable.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {loading && !error && (
            <div className="min-h-[400px] bg-[#0a0a0a] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading meta data...</p>
              </div>
            </div>
          )}

          {!loading && !error && metaData.length > 0 && (
            <div className="space-y-6">
              <Card className="bg-black border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    Top Performing Metas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metaData.slice(0, 5).map((meta, index) => (
                      <div key={meta.word} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{meta.word_with_strength}</h3>
                            <p className="text-gray-400 text-sm">{meta.word}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{meta.score}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && !error && metaData.length === 0 && (
            <Card className="bg-black border-zinc-800">
              <CardContent className="p-12 text-center">
                <Brain className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No Meta Data Available</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Unable to fetch meta data at this time. Please try refreshing.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                Market Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="min-h-[300px] bg-[#0a0a0a] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading sentiment data...</p>
                  </div>
                </div>
              ) : metaData.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-zinc-900 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Bullish Signals</h3>
                      <p className="text-3xl font-bold text-green-500">
                        {metaData.filter(meta => meta.score >= 100).length}
                      </p>
                      <p className="text-sm text-gray-500">High confidence metas</p>
                    </div>
                    <div className="p-4 bg-zinc-900 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Market Strength</h3>
                      <p className="text-3xl font-bold text-blue-500">
                        {Math.round((metaData.filter(meta => meta.score >= 50).length / metaData.length) * 100)}%
                      </p>
                      <p className="text-sm text-gray-500">Above 50 score</p>
                    </div>
                    <div className="p-4 bg-zinc-900 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Volatility</h3>
                      <p className="text-3xl font-bold text-yellow-500">
                        {metaData.length > 1 ? Math.round(Math.max(...metaData.map(m => m.score)) - Math.min(...metaData.map(m => m.score))) : 0}
                      </p>
                      <p className="text-sm text-gray-500">Score range</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Score Distribution</h3>
                    {metaData.map((meta, index) => (
                      <div key={meta.word} className="flex items-center gap-4">
                        <div className="w-32 text-sm text-gray-400 truncate">{meta.word}</div>
                        <div className="flex-1 bg-zinc-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(meta.score / Math.max(...metaData.map(m => m.score))) * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm text-white font-semibold">{meta.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No sentiment data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-6">
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-orange-500" />
                Meta Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="min-h-[300px] bg-[#0a0a0a] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading rankings...</p>
                  </div>
                </div>
              ) : metaData.length > 0 ? (
                <div className="space-y-2">
                  {metaData.map((meta, index) => (
                    <div key={meta.word} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                        <span className="text-white">{meta.word_with_strength}</span>
                      </div>
                      <span className="text-white font-semibold">{meta.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No ranking data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {metaData.length > 0 && <MetaAIChat metaContext={metaContext} />}
    </div>
  )
}
