# 🚀 Supabase Edge Function Deployment Guide

This guide explains how to deploy the AI move Edge Function to Supabase.

## Prerequisites

1. Supabase account at https://supabase.com
2. Supabase CLI installed
3. OpenAI API key from https://platform.openai.com

## Step 1: Install Supabase CLI

If you haven't installed the Supabase CLI yet:

### Windows
```bash
npm install -g supabase
```

### Mac/Linux
```bash
npm install -g supabase
```

Or use Homebrew (Mac):
```bash
brew install supabase/tap/supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate.

## Step 3: Link Your Project

Get your project reference from Supabase Dashboard (Settings → General → Reference ID):

```bash
supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with your actual project reference ID.

## Step 4: Set Environment Variables

You need to set the OpenAI API key as a secret in Supabase:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-key-here
```

Replace `sk-your-actual-openai-key-here` with your actual OpenAI API key.

## Step 5: Deploy the Edge Function

From your project root directory:

```bash
supabase functions deploy ai-move
```

This will deploy the `supabase/functions/ai-move/index.ts` function to your Supabase project.

## Step 6: Verify Deployment

After deployment, you should see output like:

```
Deployed Function ai-move on project your-project-ref
Function URL: https://your-project-ref.supabase.co/functions/v1/ai-move
```

## Step 7: Test the Function

You can test the function using curl:

```bash
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/ai-move' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"board":[3,3,0,3,3,3,3,0,3,3,3,0,3,3,3,0],"currentPlayer":2,"player1Bank":7,"player2Bank":15,"direction":"clockwise","startingPebbles":3,"difficulty":"medium"}'
```

Replace:
- `your-project-ref` with your project reference
- `YOUR_SUPABASE_ANON_KEY` with your anon key from Supabase Dashboard (Settings → API)

## Step 8: Update Environment Variables for Local Frontend

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 9: Update Vercel Environment Variables

For your production deployment on Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Redeploy your site (Vercel will automatically redeploy)

## Troubleshooting

### Function Not Found Error

If you get "Function not found" error:
1. Check that you're linked to the correct project: `supabase projects list`
2. Re-deploy: `supabase functions deploy ai-move`

### CORS Errors

The function includes CORS headers for all origins (`'Access-Control-Allow-Origin': '*'`). If you still have CORS issues:
1. Check browser console for exact error
2. Verify the function URL is correct
3. Check that you're passing the Authorization header

### OpenAI API Errors

If the AI isn't working:
1. Check that your OpenAI API key is set: `supabase secrets list`
2. Verify your OpenAI account has credits: https://platform.openai.com/account/usage
3. Check function logs: `supabase functions logs ai-move`

### Rate Limiting

OpenAI free tier has rate limits:
- 3 requests per minute
- Consider upgrading to paid tier for production use

## Function Logs

To view function logs:

```bash
supabase functions logs ai-move --follow
```

This will show real-time logs of your function execution.

## Updating the Function

If you make changes to the function code:

1. Edit `supabase/functions/ai-move/index.ts`
2. Deploy again:
   ```bash
   supabase functions deploy ai-move
   ```
3. Changes are live immediately

## Cost Estimation

**Supabase Edge Functions:**
- Free tier: 500,000 invocations per month
- After that: $2 per 1 million invocations

**OpenAI API (GPT-4o-mini):**
- ~$0.0002 per move (Hard difficulty only)
- ~$0.02 per 100 moves
- Free tier gives $5 credit (≈25,000 moves)

## Architecture

```
User Browser
    ↓
    ↓ (clicks "One Player" → "Hard")
    ↓
React App (App.jsx)
    ↓
    ↓ calls getAIMove()
    ↓
aiPlayer.js
    ↓
    ↓ supabase.functions.invoke('ai-move')
    ↓
Supabase Edge Function (Deno runtime)
    ↓
    ↓ calls OpenAI API (if Hard/Medium)
    ↓
OpenAI GPT-4o-mini
    ↓
    ↓ returns move
    ↓
Back to React App
```

## Security Notes

✅ **Secure Setup:**
- OpenAI API key is stored as a Supabase secret (server-side only)
- Never exposed to browser
- Function uses CORS headers for security

⚠️ **Important:**
- Supabase anon key is safe to expose (it's public by design)
- OpenAI key is protected (never in frontend code)
- Edge Function handles all API calls securely

## Next Steps

After deploying:
1. Test the game locally with `npm run dev`
2. Play a game on "Hard" difficulty
3. Check browser console for any errors
4. Deploy to Vercel with updated environment variables
5. Test live site!

## Support

If you encounter issues:
1. Check Supabase function logs: `supabase functions logs ai-move`
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test with "Easy" or "Medium" difficulty first (no API calls)

---

**Status:** Ready for deployment! 🎮🤖

Run `supabase functions deploy ai-move` to get started!
