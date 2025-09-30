#!/usr/bin/env node

/**
 * Add Token Icon Script
 * Helps add token icons to the system
 */

const fs = require('fs')
const path = require('path')

const TOKENS_ICONS_DIR = path.join(__dirname, '../public/tokens/icons')
const TOKENS_LOGO_DIR = path.join(__dirname, '../public/tokens/logos')

// Common Solana token addresses
const COMMON_TOKENS = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  'ORCA': 'orcaEKTdK7LKz57vaAYr9QeMU1kektZE',
  'MNGO': 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
  'SRM': 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'
}

function ensureDirectories() {
  [TOKENS_ICONS_DIR, TOKENS_LOGO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✓ Created directory: ${dir}`)
    }
  })
}

function addTokenIcon(iconPath, symbol, address) {
  if (!fs.existsSync(iconPath)) {
    console.error(`✗ Icon file not found: ${iconPath}`)
    return false
  }

  const ext = path.extname(iconPath)
  const isLogo = ext.toLowerCase() === '.svg' || iconPath.includes('logo')
  const targetDir = isLogo ? TOKENS_LOGO_DIR : TOKENS_ICONS_DIR
  
  // Create filename
  let filename
  if (address) {
    filename = `${address.toLowerCase()}${ext}`
  } else if (symbol) {
    filename = `${symbol.toLowerCase()}${ext}`
  } else {
    filename = path.basename(iconPath)
  }
  
  const targetPath = path.join(targetDir, filename)
  
  try {
    fs.copyFileSync(iconPath, targetPath)
    console.log(`✓ Added ${isLogo ? 'logo' : 'icon'}: ${filename}`)
    console.log(`  Source: ${iconPath}`)
    console.log(`  Target: ${targetPath}`)
    return true
  } catch (error) {
    console.error(`✗ Failed to copy icon:`, error.message)
    return false
  }
}

function showUsage() {
  console.log('🎨 Add Token Icon Script')
  console.log('========================')
  console.log('')
  console.log('Usage:')
  console.log('  node add-token-icon.js <icon-path> [symbol] [address]')
  console.log('')
  console.log('Examples:')
  console.log('  node add-token-icon.js ./my-sol-icon.png SOL')
  console.log('  node add-token-icon.js ./usdc-logo.svg USDC EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
  console.log('')
  console.log('Common Solana Token Addresses:')
  console.log('==============================')
  Object.entries(COMMON_TOKENS).forEach(([symbol, address]) => {
    console.log(`${symbol}: ${address}`)
  })
  console.log('')
  console.log('Notes:')
  console.log('- Icons go to /tokens/icons/ (64x64px PNG recommended)')
  console.log('- Logos go to /tokens/logos/ (256x256px+ PNG/SVG)')
  console.log('- SVG files are treated as logos')
  console.log('- PNG files are treated as icons unless filename contains "logo"')
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showUsage()
    return
  }
  
  const [iconPath, symbol, address] = args
  
  if (!iconPath) {
    console.error('✗ Icon path is required')
    showUsage()
    return
  }
  
  console.log('🎨 Adding Token Icon...')
  console.log('======================')
  console.log('')
  
  ensureDirectories()
  
  const success = addTokenIcon(iconPath, symbol, address)
  
  if (success) {
    console.log('')
    console.log('✅ Token icon added successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Test the icon in your application')
    console.log('2. Verify it appears in token displays')
    console.log('3. Add more icons as needed')
  } else {
    console.log('')
    console.log('❌ Failed to add token icon')
    console.log('Please check the file path and try again')
  }
}

if (require.main === module) {
  main()
}

module.exports = { addTokenIcon, ensureDirectories, COMMON_TOKENS }
