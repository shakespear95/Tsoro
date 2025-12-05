# 🚀 Quick Deployment Guide

Follow these steps to deploy your Tsoro game to Vercel with Supabase backend.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository named `tsoro`
2. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/tsoro.git`)

3. Add the remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tsoro.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **New Project**
3. Fill in:
   - **Name**: Tsoro Game
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

### Get Your Credentials

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public key** (starts with `eyJ...`)

### Create Database Tables

1. Click **SQL Editor** in left sidebar
2. Copy and paste this SQL:

```sql
-- Create games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  player1_id UUID REFERENCES auth.users(id),
  player2_id UUID REFERENCES auth.users(id),
  player1_bank INTEGER NOT NULL,
  player2_bank INTEGER NOT NULL,
  direction TEXT NOT NULL,
  starting_pebbles INTEGER NOT NULL,
  board JSONB NOT NULL,
  current_player INTEGER NOT NULL,
  game_over BOOLEAN DEFAULT FALSE,
  winner INTEGER,
  status TEXT DEFAULT 'waiting'
);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players can view their games"
  ON games FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Players can create games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their games"
  ON games FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;
```

3. Click **Run** (or press Ctrl+Enter)

## Step 3: Enable Google OAuth

### A. Set up Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. In the search bar, type "OAuth consent screen" and select it
4. Fill in:
   - **App name**: Tsoro Game
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click **Save and Continue**
6. Skip scopes, click **Save and Continue**
7. Add test users if needed, click **Save and Continue**

### B. Create OAuth Credentials

1. Go to **Credentials** in left sidebar
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Add Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR_PROJECT_REF` with your Supabase project reference)
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

### C. Enable in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** and toggle it on
3. Paste:
   - **Client ID** from Google
   - **Client Secret** from Google
4. Click **Save**

## Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **Add New** → **Project**
3. Import your GitHub repository (`tsoro`)
4. In **Environment Variables**, add:
   - **Name**: `VITE_SUPABASE_URL`
     **Value**: Your Supabase Project URL
   - **Name**: `VITE_SUPABASE_ANON_KEY`
     **Value**: Your Supabase Anon Key
5. Click **Deploy**
6. Wait for deployment (~2 minutes)
7. Copy your deployment URL (e.g., `https://tsoro.vercel.app`)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Push to production
vercel --prod
```

## Step 5: Configure OAuth Redirects

1. Copy your Vercel deployment URL
2. Go to Supabase → **Authentication** → **URL Configuration**
3. Update:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/**`
4. Click **Save**

5. Go back to Google Cloud Console → **Credentials**
6. Edit your OAuth 2.0 Client
7. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app
   ```
8. Save

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. You should see the Tsoro setup page
3. Try the game in local two-player mode
4. Everything should work!

## 🎉 You're Done!

Your Tsoro game is now live! Share the link with friends to play together.

## 📝 Next Steps (Optional)

- **Custom Domain**: Add a custom domain in Vercel settings
- **Analytics**: Enable Vercel Analytics
- **Monitoring**: Set up error tracking with Sentry

## 🐛 Troubleshooting

### "Unable to connect to Supabase"
- Check your environment variables are set correctly
- Verify Supabase URL and keys are correct

### "Google OAuth not working"
- Verify redirect URIs match exactly
- Check Google Cloud Console credentials
- Ensure Google provider is enabled in Supabase

### "Game not saving"
- Check Supabase SQL tables were created
- Verify RLS policies are enabled
- Check browser console for errors

## 💬 Need Help?

Open an issue on GitHub: `https://github.com/YOUR_USERNAME/tsoro/issues`

---

Happy deploying! 🚀
