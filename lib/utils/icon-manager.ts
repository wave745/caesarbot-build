/**
 * Icon Manager - Centralized icon management for CaesarX
 * Handles all icon types: tokens, social, platforms, UI
 */

export interface IconConfig {
  type: 'token' | 'social' | 'platform' | 'ui'
  name: string
  variant?: 'logo' | 'icon'
  size?: 'small' | 'medium' | 'large'
}

export interface TokenIconConfig {
  symbol: string
  address?: string
  name?: string
  externalUrl?: string
}

/**
 * Get icon path for any icon type
 */
export function getIconPath(config: IconConfig): string {
  const { type, name, variant = 'icon', size = 'medium' } = config
  
  const basePath = '/icons'
  const sizeMap = {
    small: '16x16',
    medium: '24x24', 
    large: '32x32'
  }
  
  switch (type) {
    case 'token':
      return `${basePath}/tokens/${name}.svg`
    case 'social':
      return `${basePath}/social/${name}-${variant}.svg`
    case 'platform':
      return `${basePath}/platforms/${name}-${variant}.svg`
    case 'ui':
      return `${basePath}/ui/${name}-${variant}.svg`
    default:
      return ''
  }
}

/**
 * Get token icon with smart fallback
 */
export function getTokenIcon(config: TokenIconConfig): string {
  const { symbol, address, externalUrl } = config
  
  // 1. Try local token icon by address
  if (address) {
    const addressPath = `/tokens/icons/${address.toLowerCase()}.png`
    return addressPath
  }
  
  // 2. Try local token icon by symbol
  if (symbol) {
    const symbolPath = `/tokens/icons/${symbol.toLowerCase()}.png`
    return symbolPath
  }
  
  // 3. Fallback to external URL
  if (externalUrl) {
    return externalUrl
  }
  
  // 4. Return empty string for fallback handling
  return ''
}

/**
 * Get social media icon
 */
export function getSocialIcon(platform: string): string {
  const socialIcons: Record<string, string> = {
    twitter: '/icons/social/x-logo.svg',
    x: '/icons/social/x-logo.svg',
    facebook: '/icons/social/facebook-logo.svg',
    instagram: '/icons/social/instagram-logo.svg',
    telegram: '/icons/social/telegram-logo.svg',
    youtube: '/icons/social/youtube-icon.svg',
    tiktok: '/icons/social/tiktok-icon.svg',
    twitch: '/icons/social/twitch-logo.svg',
    github: '/icons/social/github-logo.svg'
  }
  
  return socialIcons[platform.toLowerCase()] || ''
}

/**
 * Get platform icon
 */
export function getPlatformIcon(platform: string): string {
  const platformIcons: Record<string, string> = {
    dexscreener: '/icons/platforms/dexscreener-logo.svg',
    pumpfun: '/icons/platforms/pump.fun-logo.svg',
    'pump.fun': '/icons/platforms/pump.fun-logo.svg',
    bonkfun: '/icons/platforms/bonk.fun-logo.svg',
    'bonk.fun': '/icons/platforms/bonk.fun-logo.svg',
    letsbonk: '/icons/platforms/letsbonk-logo.svg',
    caesarx: '/icons/platforms/caesarx-logo.svg'
  }
  
  return platformIcons[platform.toLowerCase()] || ''
}

/**
 * Get UI icon
 */
export function getUIIcon(iconName: string): string {
  const uiIcons: Record<string, string> = {
    search: '/icons/ui/search-icon.svg',
    web: '/icons/ui/web-icon.svg',
    graduation: '/icons/ui/graduation-cap.svg',
    pumpfun: '/icons/ui/pumpfun-pill.svg',
    youtube: '/icons/ui/youtube-icon.svg',
    tiktok: '/icons/ui/tiktok-icon.svg'
  }
  
  return uiIcons[iconName.toLowerCase()] || ''
}

/**
 * Get token fallback configuration
 */
export function getTokenFallbackIcon(symbol: string): {
  text: string
  gradient: string
} {
  const firstChar = symbol.charAt(0).toUpperCase()
  
  const gradients: Record<string, string> = {
    'S': 'from-blue-500 to-cyan-500',
    'U': 'from-purple-500 to-pink-500', 
    'B': 'from-green-500 to-emerald-500',
    'M': 'from-orange-500 to-red-500',
    'D': 'from-yellow-500 to-orange-500',
    'P': 'from-pink-500 to-rose-500',
    'R': 'from-red-500 to-orange-500',
    'T': 'from-teal-500 to-cyan-500',
    'W': 'from-amber-500 to-yellow-500',
    'default': 'from-gray-500 to-gray-600'
  }
  
  const gradient = gradients[firstChar] || gradients.default
  
  return {
    text: firstChar,
    gradient
  }
}

/**
 * Check if icon exists locally
 */
export function hasLocalIcon(path: string): boolean {
  // In a real implementation, you'd check if the file exists
  // For now, we'll assume it exists if the path is provided
  return path.length > 0
}

/**
 * Get all available icon categories
 */
export function getIconCategories(): string[] {
  return ['tokens', 'social', 'platforms', 'ui']
}

/**
 * Get icons by category
 */
export function getIconsByCategory(category: string): string[] {
  const iconMap: Record<string, string[]> = {
    social: [
      'x-logo.svg', 'facebook-logo.svg', 'instagram-logo.svg',
      'telegram-logo.svg', 'youtube-icon.svg', 'tiktok-icon.svg',
      'twitch-logo.svg', 'github-logo.svg'
    ],
    platforms: [
      'dexscreener-logo.svg', 'pump.fun-logo.svg', 'bonk.fun-logo.svg',
      'letsbonk-logo.svg', 'caesarx-logo.svg'
    ],
    ui: [
      'search-icon.svg', 'web-icon.svg', 'graduation-cap.svg',
      'pumpfun-pill.svg', 'youtube-icon.svg', 'tiktok-icon.svg'
    ],
    tokens: [
      'sol-logo.png', 'caesarx-logo.png'
    ]
  }
  
  return iconMap[category] || []
}
