# Setting Up caesarbot-build Inside caesarx-trade

## Step-by-Step Setup

### 1. Clone caesarbot-build inside caesarx-trade

```bash
# Navigate to your caesarx-trade repository
cd /path/to/caesarx-trade

# Clone caesarbot-build as a subdirectory
git clone <caesarbot-build-repo-url> caesarbot-build-reference
# OR if you have it locally:
# git clone /home/caesa/caesarbot-build caesarbot-build-reference
```

### 2. Add to .gitignore

Add this to your `caesarx-trade/.gitignore`:

```gitignore
# Reference repository (don't commit this)
caesarbot-build-reference/
```

### 3. Open in Cursor

1. Open `caesarx-trade` as your main workspace in Cursor
2. The `caesarbot-build-reference` folder will be visible in the file explorer
3. You can now:
   - Reference files from `caesarbot-build-reference/` while coding
   - Use Cursor's codebase search to find code in both repos
   - Copy/adapt code from the reference repo

### 4. Use the Checklist

Keep `caesarbot-build-reference/ECHO_IMPLEMENTATION_CHECKLIST.md` open as a reference guide.

## File Structure After Setup

```
caesarx-trade/
├── .gitignore (with caesarbot-build-reference/ added)
├── app/
├── components/
├── lib/
├── ... (your existing files)
└── caesarbot-build-reference/  ← Reference repo
    ├── app/
    │   └── echo/
    ├── components/
    │   ├── trenches-page.tsx
    │   ├── trenches-column.tsx
    │   └── echo-customize-modal.tsx
    ├── ECHO_IMPLEMENTATION_CHECKLIST.md
    └── ... (reference files)
```

## Benefits

✅ Reference code available locally  
✅ No need to switch between repos  
✅ Cursor can search both codebases  
✅ Easy to compare implementations  
✅ Won't accidentally commit the reference repo  

## Quick Commands

```bash
# If you need to update the reference repo later
cd caesarx-trade/caesarbot-build-reference
git pull

# If you want to remove it later
cd caesarx-trade
rm -rf caesarbot-build-reference
```

## Alternative: Use a Different Folder Name

If you prefer a different name:

```bash
git clone <repo-url> echo-reference
# or
git clone <repo-url> .echo-ref
```

Just make sure to update `.gitignore` accordingly.

