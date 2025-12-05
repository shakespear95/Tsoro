# 🇿🇼 Tsoro - Zimbabwean Mancala Game

A beautiful, interactive implementation of Tsoro, a traditional Mancala-style board game from Zimbabwe, built with React and featuring online multiplayer.

**🎮 Play Now**: [https://tsoro-lpnixt8io-shakespears-projects.vercel.app/](https://tsoro-lpnixt8io-shakespears-projects.vercel.app/)

## ✨ Features

- **Traditional Wooden Board**: Authentic dark and light wood aesthetic
- **Customizable Gameplay**:
  - Choose your bank hole position
  - Select direction (clockwise/counter-clockwise)
  - Adjust starting pebbles (1-10 per hole)
- **Game Modes**:
  - Two-Player Local: Play on the same device
  - One-Player: Play against AI (coming soon)
  - Online Multiplayer: Play with friends remotely
- **Smooth Animations**: Watch the hand pick up and drop pebbles
- **Real-time Multiplayer**: Play with friends using shareable links
- **Google Authentication**: Secure login with Google OAuth

## 🚀 Deployment Instructions

### Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Account**: For version control

### Step 1: Set up Supabase

1. Create a new project on Supabase
2. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public key
3. Enable Google OAuth:
   - Go to **Authentication** → **Providers**
   - Enable **Google** provider
   - Add your OAuth credentials from Google Cloud Console

### Step 2: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 3: Set up Supabase Database

Run these SQL commands in your Supabase SQL editor:

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
  status TEXT DEFAULT 'waiting' -- 'waiting', 'active', 'finished'
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

### Step 4: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables when prompted
```

#### Option B: Using GitHub + Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Tsoro game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tsoro.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click **Deploy**

3. **Configure OAuth Redirect**:
   - Copy your Vercel deployment URL
   - In Supabase: **Authentication** → **URL Configuration**
   - Add your Vercel URL to **Site URL** and **Redirect URLs**

### Step 5: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase Google provider settings

## 🎮 How to Play

1. **Setup**: Choose game mode, bank positions, direction, and starting pebbles
2. **Play**: Click a hole on your side to pick up pebbles
3. **Relay**: If you land in a non-empty hole, pick up all pebbles and continue
4. **Win**: First to get all pebbles in their bank wins!

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Game Rules

- Each player has 7 regular holes + 1 bank
- Pebbles are sown in chosen direction (clockwise/counter-clockwise)
- **Relay mechanic**: Landing in a non-empty hole continues your turn
- Turn ends when landing in an empty hole or your bank
- First player to collect all their pebbles wins

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## 📄 License

MIT License - feel free to use this project for learning or fun!

## 🙏 Acknowledgments

- Traditional Zimbabwean game Tsoro
- Shona people of Zimbabwe
- Mancala game family

---

Built with ❤️ using React, Vite, Supabase, and Vercel
