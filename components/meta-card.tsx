"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame } from "lucide-react"
import Link from "next/link"
import { PumpApiService, MetaData } from "@/lib/pump-api"

export function MetaCard() {
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
        // If we have data (including fallback data), still show it
        if (response.data && response.data.length > 0) {
          setMetaData(response.data.slice(0, 5)) // Only get top 5
        }
      } else {
        setMetaData(response.data.slice(0, 5)) // Only get top 5
      }
    } catch (err) {
      console.error('Error in fetchMetaData:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
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

  return (
    <Card className="bg-[#111111] border-[#282828]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Meta
          </CardTitle>
          <Link href="/meta">
            <Button
              variant="outline"
              size="sm"
              className="w-fit bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-yellow-500 hover:from-yellow-400 hover:to-orange-400 text-xs sm:text-sm"
            >
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading meta data...</p>
            </div>
          </div>
        ) : error && metaData.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 mb-2">No meta analysis available</div>
            <p className="text-sm text-gray-500 mb-4">Analysis will appear here when data is available</p>
            <Link href="/meta">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 w-full sm:w-auto text-sm">
                View Full Analysis
              </Button>
            </Link>
          </div>
        ) : metaData.length > 0 ? (
          <div className="h-32 overflow-y-auto scrollbar-hide">
            {metaData.map((meta, index) => (
              <div key={meta.word} className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg mb-2 last:mb-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-xs truncate">{meta.word_with_strength}</h3>
                    <p className="text-gray-400 text-xs truncate">{meta.word}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{meta.score}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 mb-2">No meta analysis available</div>
            <p className="text-sm text-gray-500 mb-4">Analysis will appear here when data is available</p>
            <Link href="/meta">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 w-full sm:w-auto text-sm">
                View Full Analysis
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
