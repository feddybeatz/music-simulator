
export enum Genre {
  POP = 'Pop',
  ROCK = 'Rock',
  HIPHOP = 'Hip-Hop',
  RNB = 'R&B',
  ELECTRONIC = 'Electronic',
  INDIE = 'Indie',
  DANCE = 'Dance/Club',
  COUNTRY = 'Country',
  JAZZ = 'Jazz',
  KPOP = 'K-Pop',
  LATIN = 'Latin',
  REGGAE = 'Reggae',
  SOUL = 'Soul',
  RAP = 'Rap',
  ALTERNATIVE = 'Alternative'
}

export enum Region {
  AFRICA = 'Africa',
  EUROPE = 'Europe',
  UK = 'UK',
  USA = 'USA',
  CANADA = 'Canada',
  LATAM = 'Latin America',
  JAPAN = 'Japan',
  KOREA = 'South Korea',
  OCEANIA = 'Oceania'
}

export enum View {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  ACTIVITIES = 'activities',
  PROFILE = 'profile',
  RELEASES = 'releases',
  CHARTS = 'charts',
  STREAMING = 'streaming',
  WORLD = 'world',
  TOUR = 'tour',
  AWARDS = 'awards',
  BANK = 'bank',
  RHYTHM_GAME = 'rhythm_game',
  // Removed CHARACTER view (customizer removed)
  SHOP = 'shop',
  PLAYLISTS = 'playlists'
}

export interface ArtistStats {
  health: number;
  happiness: number;
  creativity: number;
  energy: number;
  vocals: number;
  stagePresence: number;
}

// Character customization removed — UI trimmed to focus on gameplay.
// If you need to reintroduce character customization later,
// add a `CharacterCustomization` interface here and a `character` field to `SaveData`.

export interface PlaylistMetadata {
  id: string;
  platform: string;
  category: 'Top 40' | 'New';
  name: string;
  active: boolean;
  totalWeeks?: number;
  weeksLeft?: number;
  style: Genre;
  location: Region;
  backgroundColor: string;
  shapeColor: string;
  pose: string;
  isPermanent: boolean;
  maxSongs: number;
  charLeft: number;
  charRight: number;
  charBttm: number;
  charTop: number;
  charMaterial: string;
  hasTrueShadow: boolean;
  creator: string;
  coverHasCharacter: boolean;
  isPlayerCreated: boolean;
}

export interface ChartPosition {
  playlistId: string;
  position: number;
  weeksOnChart: number;
  peakPosition: number;
  debutWeek: number;
}

export interface Song {
  id: string;
  title: string;
  genre: Genre;
  quality: number;
  trendScore: number;
  isReleased: boolean;
  releaseWeek?: number;
  releaseYear?: number;
  totalStreams: { [key: string]: number };
  totalSales: number;
  peakChartPosition?: number;
  artwork?: string;
  artistName?: string;
  isUser?: boolean;
  lastWeekSales?: number;
  chartPositions?: ChartPosition[];
  payolaSpent?: number;
  // Viral system fields
  viral_score?: number; // 0-100
  is_viral?: boolean;
  viral_level?: 'minor' | 'medium' | 'major' | 'global' | 'legendary' | null;
  viral_start_week?: number;
  viral_remaining_weeks?: number;
  viral_total_weeks?: number;
  viral_peak_streams?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  threshold: number;
  metric: 'sales' | 'streams' | 'chartPositions' | 'awards' | 'fans' | 'playstyles';
  icon: string;
  earned: boolean;
  earnedWeek?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'character' | 'cosmetic' | 'pass' | 'promotion';
  description: string;
  owned: boolean;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  isAI?: boolean;
}

export interface GameState {
  currentSave: SaveData | null;
  saves: SaveData[];
}

export interface ArtistAI {
  id: string;
  name: string;
  genre: Genre;
  region: Region;
  fans: number;
  popularity: number;
  careerLevel: number;
  label: string;
  catalog: Song[];
  isRival: boolean;
  relationship: number; // -100 to 100
}

export interface Trend {
  id: string;
  name: string;
  genre: Genre;
  strength: number; // 0-100 
  startWeek: number;
  endWeek: number;
  description: string;
}

export interface StreamingPlatform {
  id: string;
  name: string;
  marketShare: number; // 0-1 (percentage of streams)
  ratePerStream: number; // $ per stream
  icon: string;
}

export interface PlatformStreams {
  platformId: string;
  streams: number;
  revenue: number;
}

export interface MerchandiseItem {
  id: string;
  name: string;
  type: 'tshirt' | 'hoodie' | 'cap' | 'poster' | 'vinyl' | 'mug';
  price: number;
  productionCost: number;
  quality: number; // 0-100
  stock: number;
  unitsSoldThisWeek: number;
  totalUnitsSold: number;
  createdWeek: number;
  hypeMultiplier: number; // affected by trends
}

export interface SaveData {
  id: string;
  artistName: string;
  artistCode?: string;
  homeRegion: Region;
  funds: number;
  fans: number;
  popularity: number;
  listeners: number;
  careerLevel: number;
  xp: number;
  week: number;
  year: number;
  stats: ArtistStats;
  regionalPopularity: { [key in Region]?: number };
  catalog: Song[];
  awards: string[];
  subscribers: number;
  loan: number;
  // character removed — customization UI deleted per request
  achievements: Achievement[];
  shopItems: ShopItem[];
  playlistPresence: { [playlistId: string]: ChartPosition };
  payola: number;
  aiArtists: ArtistAI[];
  currentTrends: Trend[];
  lastAutoWriteWeek: number;
  merchandise: MerchandiseItem[];
  monthlyListeners: number;
  totalStreamingRevenue: number;
  totalMerchRevenue: number;
}
