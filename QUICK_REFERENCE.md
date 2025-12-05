# 🚀 Tsoro Deployment - Quick Reference Card

## ✅ What's Done

- ✅ Code pushed to GitHub: https://github.com/shakespear95/Tsoro.git
- ✅ Supabase client configured
- ✅ Vercel config ready
- ✅ Environment variables template created
- ✅ Complete documentation written

## 📝 Next: Deploy in 3 Steps

### 1️⃣ Create Supabase Project (5 min)

1. Go to https://supabase.com → Create project
2. Get your credentials:
   - Project URL
   - Anon key
3. Run SQL from `README.md` (lines 56-92)

### 2️⃣ Deploy to Vercel (3 min)

1. Go to https://vercel.com/new
2. Import: `shakespear95/Tsoro`
3. Add environment variables:
   ```
   VITE_SUPABASE_URL = your-project-url
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
4. Click Deploy!

### 3️⃣ Enable Google Login (7 min)

1. Google Cloud Console → Create OAuth credentials
2. Add redirect: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → Enable Google
4. Paste Google Client ID & Secret

## 🔗 Important Links

- **GitHub Repo**: https://github.com/shakespear95/Tsoro.git
- **Supabase**: https://supabase.com
- **Vercel**: https://vercel.com
- **Google Console**: https://console.cloud.google.com

## 📖 Full Guides

- `DEPLOYMENT.md` - Step-by-step deployment
- `README.md` - Complete documentation
- `SETUP_SUMMARY.md` - What's been built

## 🎮 Test Locally First

```bash
# 1. Create .env file
cp .env.example .env

# 2. Add your Supabase credentials to .env

# 3. Run dev server
npm run dev

# 4. Open http://localhost:5173
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect to Supabase | Check .env variables are set |
| Google OAuth fails | Verify redirect URIs match exactly |
| Build fails | Run `npm install` first |
| Game not saving | Check Supabase SQL tables exist |

## 📞 Support

Open an issue: https://github.com/shakespear95/Tsoro/issues

---

**Current Status**: Ready to deploy! 🚀
**Time to deploy**: ~15 minutes
**Difficulty**: Easy (follow the guides)

Good luck! 🇿🇼
