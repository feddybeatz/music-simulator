# Music Mogul Simulator - Setup & Deployment Guide

## Overview

The Music Mogul Simulator is a **Vite + React** frontend with **Vercel Serverless Functions** backend, connected to **Supabase PostgreSQL**.

### Tech Stack
- **Frontend**: React 18.2.0, TypeScript, Tailwind CSS 3.4.0
- **Backend**: Node.js 24.x on Vercel
- **Database**: Supabase PostgreSQL
- **Build**: Vite

## Prerequisites

- Node.js 24.x or higher
- npm 10+
- Git
- GitHub account
- Supabase account
- Vercel account

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/feddybeatz/music-simulator.git
cd "music mogul"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in project root:
```env
# These are PUBLIC (safe for browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Optional: For local serverless testing
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Run Development Server
```bash
# Frontend only (Vite dev server)
npm run dev

# This opens http://localhost:5173 with hot reload
```

### 5. Build for Production
```bash
npm run build

# Output: dist/ folder with optimized assets
```

## Database Setup (Supabase)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Choose region close to users
- Save connection string

### 2. Create Tables

Run this SQL in Supabase SQL editor:

```sql
-- Artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  fans INTEGER DEFAULT 50,
  money DECIMAL DEFAULT 3000,
  reputation INTEGER DEFAULT 15,
  health INTEGER DEFAULT 100,
  xp INTEGER DEFAULT 0,
  payola INTEGER DEFAULT 0,
  subscribers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Songs table (with viral fields)
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quality INTEGER DEFAULT 50,
  genre TEXT DEFAULT 'Pop',
  hype INTEGER DEFAULT 0,
  trendScore INTEGER DEFAULT 0,
  streams INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  released BOOLEAN DEFAULT false,
  viral_score DECIMAL DEFAULT 0,
  is_viral BOOLEAN DEFAULT false,
  viral_level TEXT,
  viral_total_weeks INTEGER DEFAULT 0,
  viral_remaining_weeks INTEGER DEFAULT 0,
  viral_peak_streams INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Streams table (platform-specific)
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  streams INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(song_id, platform)
);

-- Merchandise table
CREATE TABLE merch (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL DEFAULT 10,
  stock INTEGER DEFAULT 100,
  sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bank table
CREATE TABLE bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL UNIQUE REFERENCES artists(id) ON DELETE CASCADE,
  balance DECIMAL DEFAULT 0,
  debt DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Charts table
CREATE TABLE charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  week INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_released ON songs(released);
CREATE INDEX idx_streams_song_id ON streams(song_id);
CREATE INDEX idx_merch_artist_id ON merch(artist_id);
CREATE INDEX idx_charts_song_id ON charts(song_id);
```

### 3. Verify Tables
In Supabase SQL editor, run:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Should see: artists, songs, streams, merch, bank, charts

## Vercel Deployment

### 1. Create Vercel Project
- Go to [vercel.com](https://vercel.com)
- Import GitHub repository
- Select `music-simulator` repo
- Framework preset: "Other" (custom Vite setup)

### 2. Configure Environment Variables

In Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (get from Supabase Settings → API)
```

### 3. Configure Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Deploy

Push to main branch:
```bash
git push origin main
```

Vercel automatically:
1. Installs dependencies
2. Builds Vite project
3. Deploys static assets to CDN
4. Makes `/api/` functions available as serverless endpoints

**Your app is live at**: `https://your-app.vercel.app`

## Testing the API

### Test with cURL

```bash
# Create artist
curl -X POST https://your-app.vercel.app/api/artists \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Artist"}'

# Get artists
curl https://your-app.vercel.app/api/artists

# Advance week
curl -X POST https://your-app.vercel.app/api/advance-week \
  -H "Content-Type: application/json"
```

### Test with JavaScript

```javascript
// Create artist
const artist = await fetch('/api/artists', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My Band' })
}).then(r => r.json());

// Create song
const song = await fetch('/api/songs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Song',
    artist_id: artist.id,
    quality: 75
  })
}).then(r => r.json());

// Release and simulate
await fetch(`/api/songs/${song.id}/release`, { method: 'POST' });
await fetch('/api/advance-week', { method: 'POST' });

// Check results
const updated = await fetch(`/api/artist/${artist.id}`).then(r => r.json());
console.log('Artist fans:', updated.fans);
```

## File Structure

```
music mogul/
├── api/                          # Vercel serverless functions
│   ├── artists.js               # Artist CRUD
│   ├── artist/[id].js           # Get/update single artist
│   ├── songs.js                 # Song CRUD
│   ├── songs/[id]/release.js    # Release endpoint
│   ├── advance-week.js          # Weekly simulation (VIRAL ALGORITHM)
│   ├── merch.js                 # Merchandise CRUD
│   ├── bank.js                  # Bank operations
│   └── charts.js                # Chart rankings
├── components/                   # React components
│   ├── PlaylistsView.tsx
│   ├── StreamingView.tsx
│   ├── MerchandiseView.tsx
│   └── ...
├── services/
│   ├── gameEngine.ts            # Client-side simulation
│   ├── geminiService.ts         # AI integration
│   └── apiService.ts            # API client helper functions
├── lib/
│   ├── supabase.js              # Client-side Supabase
│   └── supabaseServer.js        # Server-side Supabase
├── App.tsx                       # Main React component
├── types.ts                      # TypeScript interfaces
├── constants.ts                  # Game constants
├── vite.config.ts              # Vite configuration
├── tailwind.config.cjs          # Tailwind CSS config
├── postcss.config.cjs           # PostCSS config
├── vercel.json                  # Vercel routing config
├── package.json                 # Dependencies
├── API.md                        # API documentation
└── tsconfig.json               # TypeScript config
```

## Key Features

### Viral Algorithm (Backend)
Every week the `/api/advance-week` endpoint:
1. Computes viral_score (0-100) for each song
2. Triggers viral event if score exceeds threshold
3. Applies multiplier (2x to 100x) based on level
4. Decays effect over 2-12 weeks
5. Handles flops (score < 15 = 50% penalty)
6. Random TikTok boost (1% chance, +5% fans)

### Platform Distribution
Streams automatically split:
- Spotify: 50%
- Apple Music: 20%
- YouTube: 15%
- Amazon Music: 7%
- SoundCloud: 5%

### Revenue Model
- $0.004 per stream
- Merchandise sales (based on fans × demand)
- Bank interest (0.5% debt, 0.1% balance weekly)

## Troubleshooting

### Blank Page on Vercel
**Solution**: Check `vercel.json` has correct routing config
```json
{
  "builds": [{ "src": "dist/**", "use": "@vercel/static" }],
  "routes": [
    { "src": "/api/.*", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/index.html", "status": 200 }
  ]
}
```

### API Returns 500 Error
**Solution**: Check environment variables are set on Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase Connection Fails
**Solution**: Verify Supabase URL and service role key:
```bash
# In Supabase dashboard:
# Settings → API → Project URL (copy to NEXT_PUBLIC_SUPABASE_URL)
# Settings → API → Service Role (copy to SUPABASE_SERVICE_ROLE_KEY)
```

### Cold Start Latency
Vercel functions ~100-500ms first call, then cached. Is normal.

## Performance Optimization

- **Client-side**: Vite bundle ~370KB (gzip ~107KB)
- **Tailwind CSS**: PostCSS compiled, only used classes included (~67KB)
- **API**: Serverless functions stay warm ~15 minutes
- **Database**: Indexes on artist_id, song_id, released status

## Security Notes

- ✅ Service role key only on Vercel (not in repo)
- ✅ ANON key only for public operations (if needed)
- ✅ All sensitive data in Supabase (encrypted at rest)
- ⚠️ No authentication layer (add if handling real users)
- ⚠️ No rate limiting (add for production)

## Next Steps

1. **Frontend Integration**: Wire React components to call `/api/` endpoints
2. **Authentication**: Add Supabase Auth for multi-player
3. **Real-time**: Use Supabase Realtime for live multiplayer
4. **Analytics**: Track player behavior and viral spread patterns
5. **Mobile**: Build React Native version sharing same backend

---

**Questions?** See [API.md](./API.md) for complete endpoint reference.
