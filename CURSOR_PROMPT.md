# Cursor Prompt for Implementing Echo Page

Copy and paste this prompt to Cursor in your **caesarx-trade** repository:

---

## Initial Setup Prompt

```
I need to implement the Echo page feature from the caesarbot-build-reference repository into this caesarx-trade codebase.

The reference implementation is located in: ./caesarbot-build-reference/

Please:
1. Review the ECHO_IMPLEMENTATION_CHECKLIST.md file in caesarbot-build-reference/
2. Review the echo page implementation files:
   - caesarbot-build-reference/app/echo/page.tsx
   - caesarbot-build-reference/app/echo/layout.tsx
   - caesarbot-build-reference/components/trenches-page.tsx
   - caesarbot-build-reference/components/trenches-column.tsx
   - caesarbot-build-reference/components/echo-customize-modal.tsx

3. Analyze the current caesarx-trade codebase structure to understand:
   - Where to place the echo page files
   - What dependencies already exist
   - What needs to be added

4. Create a step-by-step implementation plan adapted for this codebase structure.
```

---

## Follow-up Prompts (Use as Needed)

### Prompt 2: Copy Core Components
```
Now implement the core echo page components:

1. Copy and adapt app/echo/page.tsx and app/echo/layout.tsx from caesarbot-build-reference/
2. Copy and adapt the trenches-page.tsx component, adjusting imports to match this codebase's structure
3. Copy and adapt the trenches-column.tsx component
4. Copy and adapt the echo-customize-modal.tsx component

Make sure to:
- Update all import paths to match this codebase
- Check if UI components (button, input, card, tabs, checkbox) exist or need to be added
- Verify path aliases (@/) are configured correctly
```

### Prompt 3: Copy API Routes
```
Implement the required API routes for the echo page:

Copy and adapt these API routes from caesarbot-build-reference/app/api/:
- pump-fun/coins/route.ts
- pump-fun/coins-mc/route.ts
- pump-fun/coins-graduated/route.ts
- pump-fun/sol-price/route.ts
- pump-tokens-migrated/route.ts

Ensure they match this codebase's API route structure and any existing patterns.
```

### Prompt 4: Copy Library Files
```
Copy and adapt the library file:
- caesarbot-build-reference/lib/pump-api.ts

Check if any of these functions already exist in this codebase and merge/adapt as needed:
- fetchPumpFunTokens()
- fetchPumpFunMCTokens()
- fetchPumpFunGraduatedTokens()
- fetchBonkFunTokens()
- fetchBonkFunMCTokens()
- fetchBonkFunGraduatedTokens()
- fetchMoonItTokens()
- fetchMoonItMCTokens()
- fetchMoonItGraduatedTokens()
- formatMarketCap()
- formatVolume()
- formatTimeAgo()
- getContractAddress()
```

### Prompt 5: Copy Supporting Components
```
Copy and adapt supporting components:
- caesarbot-build-reference/components/trending-filter-modal.tsx
- caesarbot-build-reference/components/sound-selector.tsx
- caesarbot-build-reference/hooks/use-column-sound.ts

Check if these already exist and merge functionality if needed.
```

### Prompt 6: Verify Integration
```
Verify the echo page implementation:

1. Check that all imports resolve correctly
2. Verify all TypeScript types are properly defined
3. Test that the echo page route is accessible
4. Check that echoSettings flow through all components correctly
5. Verify API routes are working
6. Check for any missing dependencies or assets
```

### Prompt 7: Fix Issues
```
I'm getting [specific error]. Please:
1. Check the reference implementation in caesarbot-build-reference/
2. Compare with the current implementation
3. Fix the issue while maintaining compatibility with this codebase structure
```

---

## Quick Reference Commands

### To Search Reference Code:
```
Search for [function/component name] in caesarbot-build-reference/ to see how it's implemented
```

### To Compare Implementations:
```
Compare the implementation of [component] between this codebase and caesarbot-build-reference/
```

### To Check Dependencies:
```
Check if all required dependencies from caesarbot-build-reference/package.json are installed in this project
```

---

## Tips

- **Start with the checklist**: Always reference `caesarbot-build-reference/ECHO_IMPLEMENTATION_CHECKLIST.md`
- **One component at a time**: Implement components incrementally and test as you go
- **Adapt, don't copy blindly**: Adjust code to match your codebase's patterns and structure
- **Check for existing code**: Some components might already exist in caesarx-trade
- **Verify imports**: Make sure all import paths match your project structure

