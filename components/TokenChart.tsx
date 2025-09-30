"use client"

interface TokenChartProps {
  contractAddress: string
}

export function TokenChart({ contractAddress }: TokenChartProps) {
  const getGmgnUrl = () => {
    return `https://www.gmgn.cc/kline/sol/${contractAddress}?theme=dark&interval=15`
  }

  return (
    <div className="w-full h-full">
      {/* GMGN Chart */}
      <div className="h-full w-full overflow-hidden">
        <iframe
          key={contractAddress}
          src={getGmgnUrl()}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          className="w-full h-full"
          style={{ 
            border: 'none',
            overflow: 'hidden',
            scrolling: 'no',
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }}
          title="GMGN Solana Chart"
        />
      </div>
    </div>
  )
}

