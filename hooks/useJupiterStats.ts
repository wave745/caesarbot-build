import { useState, useEffect } from 'react';

export interface JupiterStats {
  launchpad: string;
  stats1d: {
    newMarketShare: number;
    newVolume: number;
    newTraders: number;
    volume: number;
    traders: number;
    marketShare: number;
    runners: number;
    mints: number;
    graduates: number;
  };
  stats7d: {
    newMarketShare: number;
    newVolume: number;
    newTraders: number;
    volume: number;
    traders: number;
    marketShare: number;
    runners: number;
    mints: number;
    graduates: number;
  };
  stats30d: {
    newMarketShare: number;
    newVolume: number;
    newTraders: number;
    volume: number;
    traders: number;
    marketShare: number;
    runners: number;
    mints: number;
    graduates: number;
  };
  newDailyStats: Array<{
    date: string;
    marketShare: number;
    volume: number;
  }>;
  dailyStats: Array<{
    date: string;
    marketShare: number;
    volume: number;
  }>;
  runners: any[];
}

export interface JupiterApiResponse {
  launchpads: JupiterStats[];
}

export function useJupiterStats() {
  const [data, setData] = useState<JupiterStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback data for when API fails
  const fallbackData: JupiterStats[] = [
    {
      launchpad: "pump.fun",
      stats1d: {
        newMarketShare: 73.4,
        newVolume: 251624023,
        newTraders: 207835,
        volume: 486717790,
        traders: 325269,
        marketShare: 69.7,
        runners: 1,
        mints: 18813,
        graduates: 127
      },
      stats7d: {
        newMarketShare: 70.8,
        newVolume: 1608031147,
        newTraders: 692859,
        volume: 2841667366,
        traders: 1143389,
        marketShare: 67.1,
        runners: 5,
        mints: 127810,
        graduates: 740
      },
      stats30d: {
        newMarketShare: 80.3,
        newVolume: 9777224134,
        newTraders: 2719315,
        volume: 14579638771,
        traders: 3864615,
        marketShare: 75.1,
        runners: 23,
        mints: 645109,
        graduates: 3972
      },
      newDailyStats: [],
      dailyStats: [],
      runners: []
    },
    {
      launchpad: "raydium",
      stats1d: {
        newMarketShare: 15.2,
        newVolume: 45000000,
        newTraders: 25000,
        volume: 120000000,
        traders: 75000,
        marketShare: 18.5,
        runners: 0,
        mints: 500,
        graduates: 25
      },
      stats7d: {
        newMarketShare: 18.1,
        newVolume: 320000000,
        newTraders: 180000,
        volume: 850000000,
        traders: 450000,
        marketShare: 22.3,
        runners: 2,
        mints: 3500,
        graduates: 150
      },
      stats30d: {
        newMarketShare: 12.8,
        newVolume: 1200000000,
        newTraders: 650000,
        volume: 3500000000,
        traders: 1200000,
        marketShare: 18.2,
        runners: 8,
        mints: 15000,
        graduates: 800
      },
      newDailyStats: [],
      dailyStats: [],
      runners: []
    },
    {
      launchpad: "jupiter",
      stats1d: {
        newMarketShare: 8.1,
        newVolume: 25000000,
        newTraders: 15000,
        volume: 75000000,
        traders: 45000,
        marketShare: 9.8,
        runners: 0,
        mints: 300,
        graduates: 12
      },
      stats7d: {
        newMarketShare: 7.9,
        newVolume: 180000000,
        newTraders: 120000,
        volume: 520000000,
        traders: 280000,
        marketShare: 8.5,
        runners: 1,
        mints: 2200,
        graduates: 85
      },
      stats30d: {
        newMarketShare: 5.2,
        newVolume: 650000000,
        newTraders: 380000,
        volume: 1800000000,
        traders: 750000,
        marketShare: 6.8,
        runners: 3,
        mints: 8500,
        graduates: 420
      },
      newDailyStats: [],
      dailyStats: [],
      runners: []
    }
  ];

  useEffect(() => {
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clean up previous request if it exists
        if (controller) {
          controller.abort();
        }
        
        controller = new AbortController();
        timeoutId = setTimeout(() => {
          if (controller) {
            controller.abort();
          }
        }, 10000); // 10 second timeout
        
        // Use our server-side API route instead of direct external API call
        const response = await fetch('/api/jupiter-stats', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Jupiter API response:', result);
        
        if (result.success && result.data) {
          setData(result.data.launchpads || []);
          setError(result.error || null);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        // Don't log AbortError as it's expected when component unmounts
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error fetching Jupiter stats:', err);
          setError(err.message);
        }
        
        // Use fallback data when API fails (but not for AbortError)
        if (!(err instanceof Error && err.name === 'AbortError')) {
          console.log('Using fallback data due to API error');
          setData(fallbackData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(interval);
      if (controller) {
        controller.abort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return { data, loading, error };
}
