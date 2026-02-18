# Music Mogul API Documentation

This document describes the complete Supabase-backed REST API for the Music Mogul Simulator.

## Architecture

- **Frontend**: Vite + React 18.2.0 (runs on Vercel static CDN)
- **Backend**: Vercel Serverless Functions (Node.js 24.x)
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (automatic via git push)

## Environment Variables (Required on Vercel)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## API Endpoints

### Artists

#### Get All Artists
```
GET /api/artists
Response: Artist[]
```

#### Get Single Artist
```
GET /api/artist/[id]
Response: Artist
```

#### Create Artist
```
POST /api/artists
Body: { name: string }
Response: Artist
{
  id: UUID,
  name: string,
  fans: number,
  money: number,
  reputation: number,
  health: number,
  xp: number,
  payola: number,
  subscribers: number,
  created_at: timestamp
}
```

#### Update Artist
```
PUT /api/artist/[id]
Body: { fans?, money?, reputation?, health?, xp?, payola?, subscribers? }
Response: Artist
```

### Songs

#### Get Songs by Artist
```
GET /api/songs?artist_id=[id]
Response: Song[]
```

#### Create Song
```
POST /api/songs
Body: {
  name: string,
  artist_id: UUID,
  quality?: number (0-100, default 50),
  genre?: string (default 'Pop'),
  viral_score?: number,
  is_viral?: boolean,
  viral_level?: 'minor'|'medium'|'major'|'global'|'legendary'|null,
  viral_remaining_weeks?: number,
  viral_total_weeks?: number,
  viral_peak_streams?: number
}
Response: Song
{
  id: UUID,
  artist_id: UUID,
  name: string,
  quality: number,
  genre: string,
  hype: number,
  trendScore: number,
  streams: number,
  sales: number,
  released: boolean,
  viral_score: number,
  is_viral: boolean,
  viral_level: string|null,
  viral_total_weeks: number,
  viral_remaining_weeks: number,
  viral_peak_streams: number,
  created_at: timestamp
}
```

#### Release Song
```
POST /api/songs/[id]/release
Response: Song (updated)
```

### Merchandise

#### Get Merchandise by Artist
```
GET /api/merch?artist_id=[id]
Response: Merch[]
```

#### Create Merchandise
```
POST /api/merch
Body: {
  name: string,
  artist_id: UUID,
  price?: number (default 10),
  stock?: number (default 100)
}
Response: Merch
{
  id: UUID,
  artist_id: UUID,
  name: string,
  price: number,
  stock: number,
  sold: number,
  created_at: timestamp
}
```

### Bank

#### Get Bank Record
```
GET /api/bank?artist_id=[id]
Response: Bank
{
  id: UUID,
  artist_id: UUID,
  balance: number,
  debt: number
}
```

#### Create Bank Account
```
POST /api/bank
Body: { artist_id: UUID }
Response: Bank
```

### Charts

#### Get All Chart Entries
```
GET /api/charts
Response: ChartEntry[]
```

#### Get Chart by Song
```
GET /api/charts?song_id=[id]
Response: ChartEntry[]
```

#### Get Chart by Week
```
GET /api/charts?week=[number]
Response: ChartEntry[]
```

#### Create Chart Entry (Admin)
```
POST /api/charts
Body: { song_id: UUID, rank: number, week: number }
Response: ChartEntry
{
  id: UUID,
  song_id: UUID,
  rank: number,
  week: number
}
```

### Simulation

#### Advance One Week
```
POST /api/advance-week
Response: {
  ok: boolean,
  processed: number (songs processed)
}
```

**What happens during advance-week:**
1. Computes viral score for each song (0-100) based on:
   - Song quality (25%)
   - Artist popularity/reputation (15%)
   - Artist hype/XP (15%)
   - Marketing budget (15%)
   - Trend alignment (15%)
   - Social media activity (10%)
   - Fan loyalty (10%)
   - Random factor (10%)

2. Checks if song goes viral (probability = viral_score/100):
   - Picks viral level: minor (2x), medium (5x), major (10x), global (50x), legendary (100x)
   - Duration: 2-12 weeks with decay
   - Multiplies streams accordingly

3. Applies flop system (viral_score < 15 → 50% stream reduction)

4. Applies TikTok chance (1% probability of +5% fan boost)

5. Distributes streams across platforms:
   - Spotify 50%
   - Apple Music 20%
   - YouTube 15%
   - Amazon Music 7%
   - SoundCloud 5%

6. Calculates revenue ($0.004/stream)

7. Grows artist fans based on streams and viral state

8. Processes merchandise sales

9. Applies bank interest:
   - Debt: 0.5% weekly
   - Balance: 0.1% weekly

10. Ranks songs and updates charts

## Code Examples

### Creating an Artist and Song
```javascript
// Create artist
const artist = await fetch('/api/artists', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Taylor Swift' })
}).then(r => r.json());

// Create song
const song = await fetch('/api/songs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Anti-Hero',
    artist_id: artist.id,
    quality: 85,
    genre: 'Pop'
  })
}).then(r => r.json());

// Release song
await fetch(`/api/songs/${song.id}/release`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
```

### Running Weekly Simulation
```javascript
const result = await fetch('/api/advance-week', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json());

console.log(`Processed ${result.processed} songs`);
```

## Error Handling

All endpoints return standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (missing required fields)
- `404` - Not found
- `405` - Method not allowed
- `500` - Server error

Error responses include a message:
```json
{
  "error": "Description of error"
}
```

## Rate Limiting

No rate limiting currently implemented. Vercel serverless functions have:
- Max execution time: 10 seconds per request
- Memory: 512MB per function
- Cold start latency: ~100-500ms

## Database Schema

See Supabase dashboard for complete schema. Key tables:
- `artists` - Artist profiles
- `songs` - Song metadata and viral tracking
- `streams` - Platform-specific stream counts
- `merch` - Merchandise items  
- `bank` - Artist bank accounts (balance/debt)
- `charts` - Weekly chart rankings

## Deployment

1. Push to `main` branch on GitHub
2. Vercel automatically builds and deploys
3. API functions deployed as serverless handlers
4. Frontend served from Vercel CDN

## Local Development

```bash
# Install dependencies
npm install

# Run Vite dev server (frontend only)
npm run dev

# API endpoints require Vercel environment
# Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
# Then use vercel dev to test serverless functions locally
```

## Performance Notes

- Advance-week endpoint is heaviest (iterates all artists/songs)
- For 100 artists with 10 songs each: ~5-8 second execution
- Consider caching or pagination for large catalogs
- Database queries are optimized with proper indexing on artist_id, released, song_id

## Future Enhancements

- [ ] Implement caching layer (Redis)
- [ ] Add pagination to GET endpoints
- [ ] Create batch endpoints (/api/artists/batch)
- [ ] Add WebSocket support for real-time updates
- [ ] Implement proper authentication/authorization
- [ ] Add rate limiting per artist/user
