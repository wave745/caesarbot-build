# CaesarX Icon System

This document describes the organized icon system for the CaesarX platform.

## Directory Structure

```
public/
├── icons/
│   ├── social/          # Social media icons
│   │   ├── x-logo.svg
│   │   ├── facebook-logo.svg
│   │   ├── instagram-logo.svg
│   │   ├── telegram-logo.svg
│   │   ├── youtube-icon.svg
│   │   ├── tiktok-icon.svg
│   │   ├── twitch-logo.svg
│   │   └── github-logo.svg
│   ├── platforms/       # Platform logos
│   │   ├── dexscreener-logo.svg
│   │   ├── pump.fun-logo.svg
│   │   ├── bonk.fun-logo.svg
│   │   ├── letsbonk-logo.svg
│   │   └── caesarx-logo.svg
│   └── ui/              # UI icons
│       ├── search-icon.svg
│       ├── web-icon.svg
│       ├── graduation-cap.svg
│       ├── pumpfun-pill.svg
│       ├── youtube-icon.svg
│       └── tiktok-icon.svg
└── tokens/
    ├── icons/           # Token icons (64x64px PNG)
    └── logos/           # Token logos (256x256px+ PNG/SVG)
        ├── sol-logo.png
        └── caesarx-logo.png
```

## Icon Categories

### 1. Social Media Icons (`/icons/social/`)
- **Purpose**: Social media platform logos
- **Format**: SVG
- **Size**: 24x24px recommended
- **Usage**: Social links, sharing buttons

### 2. Platform Icons (`/icons/platforms/`)
- **Purpose**: Trading platform and service logos
- **Format**: SVG
- **Size**: 32x32px recommended
- **Usage**: Platform integrations, service badges

### 3. UI Icons (`/icons/ui/`)
- **Purpose**: Interface elements and actions
- **Format**: SVG
- **Size**: 16x16px to 24x24px
- **Usage**: Buttons, navigation, status indicators

### 4. Token Icons (`/tokens/icons/`)
- **Purpose**: Individual token logos
- **Format**: PNG (64x64px)
- **Naming**: `{symbol}.png` or `{address}.png`
- **Usage**: Token displays, trading pairs

### 5. Token Logos (`/tokens/logos/`)
- **Purpose**: High-resolution token logos
- **Format**: PNG/SVG (256x256px+)
- **Usage**: Detailed views, modals, documentation

## Usage Examples

### Token Icons
```typescript
import { getTokenIcon, getTokenFallbackIcon } from '@/lib/utils/icon-manager'

// Get token icon with fallback
const iconUrl = getTokenIcon({
  symbol: 'SOL',
  address: 'So11111111111111111111111111111111111111112',
  externalUrl: token.logo
})

// Get fallback configuration
const fallback = getTokenFallbackIcon('SOL')
// Returns: { text: 'S', gradient: 'from-blue-500 to-cyan-500' }
```

### Social Icons
```typescript
import { getSocialIcon } from '@/lib/utils/icon-manager'

const twitterIcon = getSocialIcon('twitter') // '/icons/social/x-logo.svg'
const facebookIcon = getSocialIcon('facebook') // '/icons/social/facebook-logo.svg'
```

### Platform Icons
```typescript
import { getPlatformIcon } from '@/lib/utils/icon-manager'

const dexIcon = getPlatformIcon('dexscreener') // '/icons/platforms/dexscreener-logo.svg'
const pumpIcon = getPlatformIcon('pumpfun') // '/icons/platforms/pump.fun-logo.svg'
```

### UI Icons
```typescript
import { getUIIcon } from '@/lib/utils/icon-manager'

const searchIcon = getUIIcon('search') // '/icons/ui/search-icon.svg'
const webIcon = getUIIcon('web') // '/icons/ui/web-icon.svg'
```

## Adding New Icons

### For Token Icons
1. Add PNG file to `/tokens/icons/`
2. Name: `{symbol}.png` (e.g., `usdc.png`)
3. Size: 64x64px, transparent background
4. The system will automatically detect and use them

### For Other Icons
1. Add SVG file to appropriate category directory
2. Follow naming convention: `{name}-{variant}.svg`
3. Use consistent sizing and styling
4. Update the icon manager if needed

## Fallback System

The icon system includes intelligent fallbacks:

1. **Local Icons**: Check for local files first
2. **External URLs**: Fall back to API-provided URLs
3. **Generated Fallbacks**: Create gradient backgrounds with initials
4. **Error Handling**: Graceful degradation for missing icons

## Icon Loading Priority

For token icons specifically:
1. Local icon by address (`/tokens/icons/{address}.png`)
2. Local icon by symbol (`/tokens/icons/{symbol}.png`)
3. External URL from API
4. Generated gradient fallback

## Best Practices

1. **Consistent Sizing**: Use standard sizes (16px, 24px, 32px, 64px)
2. **Transparent Backgrounds**: PNG icons should have transparent backgrounds
3. **SVG Optimization**: Optimize SVG files for web delivery
4. **Naming Conventions**: Use lowercase, hyphens for multi-word names
5. **File Organization**: Keep icons in appropriate category directories
6. **Fallback Testing**: Always test fallback behavior

## Integration

The icon system is designed to work seamlessly with your existing components. Simply import the utility functions and use them in your JSX:

```tsx
import { getTokenIcon, getTokenFallbackIcon } from '@/lib/utils/icon-manager'

function TokenCard({ token }) {
  const iconUrl = getTokenIcon({
    symbol: token.symbol,
    address: token.address,
    externalUrl: token.logo
  })
  
  if (iconUrl) {
    return <img src={iconUrl} alt={token.symbol} />
  }
  
  const fallback = getTokenFallbackIcon(token.symbol)
  return (
    <div className={`bg-gradient-to-br ${fallback.gradient}`}>
      {fallback.text}
    </div>
  )
}
```

This system provides a robust, scalable solution for managing all icons across your CaesarX platform.
