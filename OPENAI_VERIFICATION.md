# ✅ OpenAI API Key Verification

## Your Current Setup

You've added the OpenAI API key to your `.env` file. Here's how to verify it works:

### 1️⃣ Check Your .env File

Your `.env` file should look like this:
```env
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

**Important**:
- The key must start with `sk-`
- No quotes around the key
- No spaces before or after the =

### 2️⃣ Restart Dev Server

Since you added the key, restart your dev server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3️⃣ Test the AI

1. Open http://localhost:5173
2. Click "Game Setup"
3. Select "One Player (vs Computer)"
4. Choose "Hard (ChatGPT Expert)" difficulty
5. Start the game
6. Make your first move
7. Watch for "Computer is thinking..." message
8. The AI should make a strategic move!

### 4️⃣ Verify It's Working

**Signs the API is working:**
- ✅ "Computer is thinking..." appears
- ✅ AI takes 1-2 seconds to move
- ✅ No error messages in browser console
- ✅ AI makes strategic moves (not random)

**Signs the API is NOT working:**
- ❌ Instant AI moves (falling back to rule-based)
- ❌ Warning message about API key
- ❌ Errors in browser console (F12 → Console tab)

### 5️⃣ Check Browser Console

Open Developer Tools (F12) and check the Console tab:

**Good (API working):**
```
No errors
```

**Bad (API not working):**
```
Error: Invalid API key
Error: Unauthorized
```

If you see errors, double-check your API key.

## For Vercel Deployment

To use ChatGPT AI on your live site (https://tsoro-lpnixt8io-shakespears-projects.vercel.app/):

### 1️⃣ Add to Vercel

1. Go to Vercel Dashboard
2. Select your Tsoro project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `VITE_OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with sk-)
   - **Environments**: Check all (Production, Preview, Development)
5. Click Save

### 2️⃣ Redeploy

Vercel will automatically redeploy. Wait ~1 minute.

### 3️⃣ Test Live Site

1. Visit https://tsoro-lpnixt8io-shakespears-projects.vercel.app/
2. Select "One Player" mode
3. Choose "Hard" difficulty
4. Test if AI works!

## API Key Safety

⚠️ **Current Setup (Browser-based)**:
- Your API key is exposed in the browser
- Anyone can see it in DevTools
- Fine for testing/personal use
- NOT recommended for public production

### Recommended for Production

Create a backend API endpoint to hide your key:

1. Create `/api/ai-move.js` (Vercel serverless function)
2. Move OpenAI calls to backend
3. Keep API key on server only
4. Frontend calls your API instead

**Example** (api/ai-move.js):
```javascript
import OpenAI from 'openai';

export default async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Server-side only!
  });

  // ... AI logic here

  res.json({ move });
}
```

Then update frontend to call `/api/ai-move` instead of OpenAI directly.

## Troubleshooting

### "Invalid API Key" Error

**Solutions:**
1. Check key starts with `sk-`
2. No extra spaces in .env file
3. Restart dev server after adding key
4. Make sure you're using the right key (from platform.openai.com)

### AI Still Makes Random Moves

**Possible causes:**
1. API key not loaded (check console)
2. Quota exceeded (check OpenAI dashboard)
3. Network error (check console for errors)

**Quick fix:**
- Select "Medium" difficulty instead
- Still strategic, no API needed!

### Rate Limit Errors

Free tier has limits:
- 3 requests per minute
- Wait 20 seconds between moves
- Or upgrade to paid tier

## Costs

**GPT-4o-mini pricing:**
- Input: $0.000150 per 1K tokens
- Output: $0.000600 per 1K tokens
- Average move: ~$0.0002
- 100 moves: ~$0.02
- Very affordable! 💰

**Free credits:**
- New accounts get $5 free
- That's ~25,000 moves!

## Summary

✅ Your `.env` file has the API key
✅ Game will use ChatGPT when you select "Hard" mode
✅ Falls back to strategic AI if API fails
✅ Safe to deploy (but consider backend for production)

**Next step**:
Restart your dev server and test it!

```bash
npm run dev
```

Then play a game on Hard mode! 🎮🤖
