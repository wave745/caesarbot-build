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

const STORAGE_KEY = 'jupiter-stats-cache';
const STORAGE_TTL = 10 * 60 * 1000; // 10 minutes (matches server cache)

// Load from localStorage cache
function loadFromCache(): JupiterStats[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age < STORAGE_TTL && Array.isArray(data) && data.length > 0) {
      return data;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
}

// Save to localStorage cache
function saveToCache(data: JupiterStats[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

export function useJupiterStats() {
  // Initialize with cached data if available
  const [data, setData] = useState<JupiterStats[]>(() => loadFromCache() || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsCached(false);
        
        // Clean up previous request if it exists
        if (controller) {
          controller.abort();
        }
        
        controller = new AbortController();
        timeoutId = setTimeout(() => {
          if (controller) {
            controller.abort();
          }
        }, 20000); // 20 second timeout (longer than server retries)
        
        // Fetch from our server-side API route
        const response = await fetch('/api/jupiter-stats', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (!response.ok) {
          // If 503, try to use cached data
          if (response.status === 503) {
            const cached = loadFromCache();
            if (cached && cached.length > 0) {
              if (isMounted) {
                setData(cached);
                setIsCached(true);
                setError('Using cached data - API temporarily unavailable');
              }
              return;
            }
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!isMounted) return;
        
        if (result.success && result.data && Array.isArray(result.data.launchpads)) {
          const launchpads = result.data.launchpads;
          
          // Update state with fresh data
          setData(launchpads);
          setIsCached(result.meta?.source === 'cache');
          
          // Save to localStorage cache
          saveToCache(launchpads);
          
          // Clear error if we got data
          if (result.meta?.source === 'jupiter-api') {
            setError(null);
          } else if (result.meta?.source === 'cache') {
            setError('Using cached data - API temporarily unavailable');
          }
        } else {
          throw new Error('Invalid response structure from server');
        }
      } catch (err) {
        if (!isMounted) return;
        
        // Don't log AbortError as it's expected when component unmounts
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error fetching Jupiter stats:', err);
          
          // Try to use cached data as last resort
          const cached = loadFromCache();
          if (cached && cached.length > 0) {
            setData(cached);
            setIsCached(true);
            setError('Using cached data - API request failed');
          } else {
            setError(err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        fetchData();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
      if (controller) {
        controller.abort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return { data, loading, error, isCached };
}
