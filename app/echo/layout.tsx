import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Echo - CaesarX Advanced Trading Platform',
  description: 'Real-time token tracking and analysis with advanced risk metrics. Monitor new tokens, market cap changes, and migrated tokens across multiple platforms.',
  keywords: 'echo, token tracking, solana tokens, pump.fun, bonk.fun, moon.it, trading, crypto, blockchain',
}

export default function EchoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
