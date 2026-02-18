
import { Region, Genre, SaveData, Achievement, ShopItem, Trend, ArtistAI, StreamingPlatform, MerchandiseItem } from './types';

export const CAREER_STAGES = [
  "Unknown Artist",
  "Local Talent",
  "Rising Star",
  "Regional Sensation",
  "National Icon",
  "International Artist",
  "Mainstream Star",
  "Chart Topper",
  "Superstar",
  "Global Legend"
];

export const LEVEL_REQUIREMENTS = [
  0, 100, 500, 2000, 10000, 50000, 200000, 1000000, 5000000, 20000000
];

export const REGIONS = Object.values(Region);

export const GENRES = Object.values(Genre);

export const STREAMING_PLATFORMS: StreamingPlatform[] = [
  { id: 'spotify', name: 'Spotify', marketShare: 0.50, ratePerStream: 0.004, icon: '🎵' },
  { id: 'apple', name: 'Apple Music', marketShare: 0.20, ratePerStream: 0.007, icon: '🍎' },
  { id: 'youtube', name: 'YouTube Music', marketShare: 0.15, ratePerStream: 0.002, icon: '▶️' },
  { id: 'amazon', name: 'Amazon Music', marketShare: 0.07, ratePerStream: 0.003, icon: '📦' },
  { id: 'soundcloud', name: 'SoundCloud', marketShare: 0.05, ratePerStream: 0.001, icon: '☁️' },
  { id: 'pandora', name: 'Pandora', marketShare: 0.03, ratePerStream: 0.0013, icon: '📻' }
];

export const GENRE_COLORS: { [key in Genre]: string } = {
  [Genre.POP]: 'bg-pink-500',
  [Genre.ROCK]: 'bg-red-600',
  [Genre.HIPHOP]: 'bg-yellow-600',
  [Genre.RNB]: 'bg-blue-600',
  [Genre.ELECTRONIC]: 'bg-purple-600',
  [Genre.INDIE]: 'bg-green-600',
  [Genre.DANCE]: 'bg-fuchsia-500',
  [Genre.COUNTRY]: 'bg-amber-700',
  [Genre.JAZZ]: 'bg-amber-600',
  [Genre.KPOP]: 'bg-rose-500',
  [Genre.LATIN]: 'bg-orange-600',
  [Genre.REGGAE]: 'bg-lime-600',
  [Genre.SOUL]: 'bg-sky-700',
  [Genre.RAP]: 'bg-zinc-700',
  [Genre.ALTERNATIVE]: 'bg-slate-600'
};

// Character customization removed — defaults omitted.

// ACHIEVEMENTS
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-release',
    name: 'First Release',
    description: 'Release your first song',
    threshold: 1,
    metric: 'sales',
    icon: '🎵',
    earned: false
  },
  {
    id: 'chart-debut',
    name: 'Chart Debut',
    description: 'Get on your first chart',
    threshold: 1,
    metric: 'chartPositions',
    icon: '📈',
    earned: false
  },
  {
    id: 'platinum-single',
    name: 'Platinum Single',
    description: 'Sell 1,000,000 copies of a single song',
    threshold: 1000000,
    metric: 'sales',
    icon: '💿',
    earned: false
  },
  {
    id: 'billion-streams',
    name: 'Billion Streams Club',
    description: 'Get 1 billion streams across all songs',
    threshold: 1000000000,
    metric: 'streams',
    icon: '🌍',
    earned: false
  },
  {
    id: 'grammy-winner',
    name: 'Grammy Winner',
    description: 'Win 5 awards',
    threshold: 5,
    metric: 'awards',
    icon: '🏆',
    earned: false
  },
  {
    id: 'fan-favorite',
    name: 'Fan Favorite',
    description: 'Get 1,000,000 fans',
    threshold: 1000000,
    metric: 'fans',
    icon: '👥',
    earned: false
  },
  {
    id: 'genre-master',
    name: 'Genre Master',
    description: 'Have a #1 in 3 different genres',
    threshold: 3,
    metric: 'playstyles',
    icon: '🎸',
    earned: false
  }
];

// SHOP ITEMS
export const SHOP_ITEMS: ShopItem[] = [
  // character items removed — customization feature deleted
  {
    id: 'guitar-gold',
    name: 'Gold Guitar',
    price: 5000,
    type: 'cosmetic',
    description: 'Show off with a gold guitar',
    owned: false
  },
  
  {
    id: 'outfit-diamond',
    name: 'Diamond Outfit',
    price: 10000,
    type: 'cosmetic',
    description: 'Wear exclusive diamond outfit',
    owned: false
  },
  {
    id: 'pass-vip',
    name: 'VIP Pass',
    price: 2000,
    type: 'pass',
    description: 'Access exclusive venues and features (monthly)',
    owned: false
  },
  {
    id: 'promotion-gold',
    name: 'Gold Promotion',
    price: 1500,
    type: 'promotion',
    description: 'Boost song on playlists (+10% chart performance)',
    owned: false
  }
];

// TRENDING TOPICS - MUST BE BEFORE INITIAL_SAVE
export const TRENDING_TOPICS = [
  { name: 'Afrobeats Wave', genre: Genre.LATIN, keywords: 'Afro' },
  { name: 'Sad Lo-Fi', genre: Genre.INDIE, keywords: 'Chill' },
  { name: 'Trap Energy', genre: Genre.RAP, keywords: 'Trap' },
  { name: 'Synthwave Vibes', genre: Genre.ELECTRONIC, keywords: 'Synth' },
  { name: 'Soul R&B', genre: Genre.RNB, keywords: 'Soul' },
  { name: 'Guitar Rock', genre: Genre.ROCK, keywords: 'Rock' },
  { name: 'Pop Euphoria', genre: Genre.POP, keywords: 'Pop' },
  { name: 'Reggae Summer', genre: Genre.REGGAE, keywords: 'Reggae' },
  { name: 'K-Pop Takeover', genre: Genre.KPOP, keywords: 'Korean' },
  { name: 'Country Romance', genre: Genre.COUNTRY, keywords: 'Country' }
];

export const SONG_NAME_PATTERNS = [
  'Midnight {adjective}',
  '{subject} Love',
  'Can\'t Stop {verb}',
  'Feel The {noun}',
  '{adjective} Dreams',
  'Lost In {location}',
  'Dancing {preposition} {time}',
  'My {noun}',
  '{subject} Gone',
  'Forever {adjective}',
  'Take Me {location}',
  '{verb} Your {noun}',
  'All Night {adjective}',
  'Soul {noun}',
  'Electric {noun}'
];

export const SONG_NAME_WORDS = {
  adjective: ['Electric', 'Neon', 'Golden', 'Blue', 'Burning', 'Frozen', 'Endless', 'Rising', 'Fading', 'Wild', 'Sweet', 'Broken'],
  subject: ['You', 'Me', 'Us', 'Love', 'Time', 'Rain', 'Sun', 'Moon', 'Heart', 'Soul', 'Fire', 'Sky'],
  verb: ['Falling', 'Flying', 'Running', 'Dancing', 'Crying', 'Laughing', 'Dreaming', 'Believing', 'Rising', 'Shining'],
  noun: ['Nights', 'Days', 'Love', 'Dreams', 'Hearts', 'Souls', 'Stars', 'Lights', 'Sounds', 'Vibes', 'Energy'],
  location: ['Home', 'Paradise', 'Heaven', 'Yesterday', 'Tomorrow', 'Your Arms', 'The City', 'The Ocean', 'The Sky'],
  preposition: ['In', 'Under', 'Through', 'With', 'Without'],
  time: ['Tonight', 'Forever', 'Always', 'Never', 'Today']
};

// Helper Functions MUST BE BEFORE INITIAL_SAVE
export function generateAIArtists(): ArtistAI[] {
  const aiNames = [
    'Echo Ridge', 'Luna Stone', 'Cipher Code', 'Aurora Sky', 'Nova Force',
    'Drift Soul', 'Phoenix Rise', 'Crystal Wave', 'Thunder Heart', 'Shadow Peak',
    'Stellar Mint', 'Gravity Pull', 'Cosmic Rain', 'Velocity Rush', 'Prism Light'
  ];
  
  return aiNames.map((name, i) => ({
    id: `ai-${i}`,
    name,
    genre: GENRES[i % GENRES.length],
    region: REGIONS[i % REGIONS.length],
    fans: 1000 + Math.random() * 50000,
    popularity: 30 + Math.random() * 40,
    careerLevel: 1 + Math.floor(Math.random() * 6),
    label: ['Universal', 'Sony', 'Warner', 'Independent'][Math.floor(Math.random() * 4)],
    catalog: [],
    isRival: Math.random() > 0.7,
    relationship: -50 + Math.random() * 100
  }));
}

export function generateInitialTrends(): Trend[] {
  const trends: Trend[] = [];
  const topicIndices = [0, 1, 2, 3, 4].map(() => Math.floor(Math.random() * TRENDING_TOPICS.length));
  
  topicIndices.forEach((idx, i) => {
    const topic = TRENDING_TOPICS[idx];
    trends.push({
      id: `trend-${i}`,
      name: topic.name,
      genre: topic.genre,
      strength: 60 + Math.random() * 40,
      startWeek: 1,
      endWeek: 12 + Math.floor(Math.random() * 20),
      description: `${topic.name} is trending this season`
    });
  });
  
  return trends;
}

export function generateSongName(): string {
  const patterns = SONG_NAME_PATTERNS;
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  let name = pattern;
  Object.entries(SONG_NAME_WORDS).forEach(([type, words]) => {
    const regex = new RegExp(`{${type}}`, 'g');
    const word = words[Math.floor(Math.random() * words.length)];
    name = name.replace(regex, word);
  });
  
  return name;
}

export function getTrendingGenre(trends: Trend[], week: number): Genre | null {
  const activeTrends = trends.filter(t => t.startWeek <= week && t.endWeek >= week);
  if (activeTrends.length === 0) return null;
  
  return activeTrends.reduce((best, current) => 
    current.strength > best.strength ? current : best
  ).genre;
}

// NOW SAFE TO CALL THESE IN INITIAL_SAVE
export const INITIAL_SAVE = (name: string, region: Region): SaveData => ({
  id: `save-${Date.now()}`,
  artistName: name,
  homeRegion: region,
  funds: 3000, // Reduced from 5000 - harder start
  fans: 50, // Reduced from 100
  popularity: 15,
  listeners: 300,
  careerLevel: 1,
  xp: 0,
  week: 1,
  year: 1,
  stats: {
    health: 100,
    happiness: 80,
    creativity: 50,
    energy: 100,
    vocals: 60,
    stagePresence: 55
  },
  regionalPopularity: REGIONS.reduce((acc, r) => ({ ...acc, [r]: r === region ? 15 : 5 }), {}),
  catalog: [],
  awards: [],
  subscribers: 1000,
  loan: 0,
  achievements: ACHIEVEMENTS.map(a => ({ ...a })),
  shopItems: SHOP_ITEMS.map(i => ({ ...i })),
  playlistPresence: {},
  payola: 0,
  aiArtists: generateAIArtists(),
  currentTrends: generateInitialTrends(),
  lastAutoWriteWeek: 0,
  merchandise: [],
  monthlyListeners: 300,
  totalStreamingRevenue: 0,
  totalMerchRevenue: 0
});
