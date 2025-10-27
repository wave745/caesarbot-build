# CaesarX Terminal Footer

A professional terminal-style footer bar inspired by Padre's design, providing real-time system status, interactive trackers, and quick access to essential trading tools.

## 🎯 Features

### Status Indicators
- **Network Status**: Real-time connection status (Stable/Unstable/Connecting)
- **FPS Counter**: Live performance monitoring (55-65 FPS)
- **System Latency**: Network response time tracking

### Interactive Trackers
- **Watchlist**: Track favorite tokens
- **Wallet Tracker**: Monitor wallet balances
- **Price Alerts**: Set up price notifications
- **X Tracker**: Social media monitoring
- **Trenches**: Advanced tracking features
- **α Tracker**: Alpha signal tracking

### Live System Stats
- **Solana Balance**: Real-time SOL balance display
- **USD Value**: Current portfolio value
- **Network Latency**: Connection performance
- **Mainnet Status**: Blockchain network indicator

### Quick Actions
- **Documentation**: Access help and guides
- **Social Links**: X (Twitter), Discord, Telegram
- **Language Selector**: Multi-language support
- **Network Indicator**: Blockchain network status

## 🎨 Design Specifications

### Layout
- **Height**: 44px (`h-11` in Tailwind)
- **Position**: Fixed bottom
- **Width**: Full width
- **Z-index**: 50

### Styling
- **Background**: `rgba(10,10,10,0.95)` with backdrop blur
- **Border**: 1px solid `#1a1a1a` at top
- **Shadow**: Subtle bottom shadow for depth
- **Typography**: `text-xs` with `font-medium`

### Colors
- **Default**: `text-gray-400`
- **Active**: `text-green-400`
- **Hover**: `text-white`
- **Status**: Dynamic based on connection state

## 🔧 Implementation

### Component Structure
```tsx
<CaesarXFooter />
```

### Integration
The footer is integrated into the main layout (`app/layout.tsx`) and appears on all pages:

```tsx
import { CaesarXFooter } from "@/components/caesarx-footer"

// In layout
<main className="p-3 sm:p-6 pb-16">
  {children}
</main>
<CaesarXFooter />
```

### State Management
- **System Stats**: Live FPS and latency updates
- **Active Trackers**: Toggle-able tracker states
- **Connection Status**: Dynamic network state

## 🚀 Usage

### Basic Implementation
```tsx
import { CaesarXFooter } from "@/components/caesarx-footer"

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <CaesarXFooter />
    </div>
  )
}
```

### Customization
The footer automatically adapts to different screen sizes and provides:
- Responsive design for mobile and desktop
- Hover effects on interactive elements
- Tooltips for better UX
- Live data updates every 2 seconds

## 📱 Responsive Design

The footer is optimized for:
- **Desktop**: Full feature set with all trackers visible
- **Tablet**: Condensed layout with essential features
- **Mobile**: Touch-friendly buttons with appropriate spacing

## 🎯 Future Enhancements

### Planned Features
- Real wallet integration with Solana
- Live price data from Jupiter API
- Customizable tracker preferences
- Advanced notification system
- Multi-language support
- Theme customization

### Integration Points
- Portfolio system for wallet data
- Scanner for token tracking
- Sniper for automation status
- Meta AI for insights display

## 🔍 Demo

Visit `/footer-demo` to see the footer in action with detailed feature explanations and design specifications.

## 📋 Technical Details

### Dependencies
- React 18+
- Next.js 14+
- Tailwind CSS
- Lucide React (icons)

### Performance
- Lightweight implementation
- Minimal re-renders
- Efficient state management
- Optimized for 60 FPS

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode compatible
- Focus indicators

---

*Built with ❤️ for the CaesarX trading platform*
