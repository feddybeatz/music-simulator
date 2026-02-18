
import { SaveData, Song, ChartPosition, PlaylistMetadata, ArtistAI, Trend } from '../types';
import { PLAYLISTS } from '../data/playlists';
import { generateSongName, getTrendingGenre, STREAMING_PLATFORMS } from '../constants';

export const calculateXPForLevel = (level: number) => Math.pow(level, 2) * 500;

// Auto-generate a song based on current trends
export const autoGenerateSong = (save: SaveData): Song => {
  const trendingGenre = getTrendingGenre(save.currentTrends || [], save.week);
  const genre = trendingGenre || save.catalog[0]?.genre || 'Pop';
  
  const activeTrends = (save.currentTrends || []).filter(t => t.startWeek <= save.week && t.endWeek >= save.week);
  const trendBoost = activeTrends.length > 0 ? activeTrends[0].strength : 30;
  
  return {
    id: `song-${Date.now()}`,
    title: generateSongName(),
    genre: genre,
    quality: 45 + Math.random() * 35 + (save.stats.creativity / 100 * 20),
    trendScore: trendBoost,
    isReleased: false,
    totalStreams: {},
    totalSales: 0,
    artwork: `https://via.placeholder.com/200?text=${encodeURIComponent(generateSongName())}`,
    // viral defaults
    viral_score: 0,
    is_viral: false,
    viral_level: null,
    viral_start_week: undefined,
    viral_remaining_weeks: 0,
    viral_total_weeks: 0,
    viral_peak_streams: 0
  };
};

// Viral helpers
const computeViralScore = (song: Song, save: SaveData) => {
  const song_quality = Math.max(0, Math.min(100, song.quality || 0));
  const artist_popularity = Math.max(0, Math.min(100, save.popularity || 0));
  // artist_hype approximated by recent XP and career level
  const artist_hype = Math.max(0, Math.min(100, (save.xp / Math.max(1, (calculateXPForLevel(save.careerLevel) || 1))) * 100));
  const marketing_level = Math.max(0, Math.min(100, Math.min(100, save.payola || 0) / 10));
  const trend_alignment = Math.max(0, Math.min(100, song.trendScore || 0));
  const social_media_activity = Math.max(0, Math.min(100, (save.subscribers || 0) / Math.max(1, (save.fans || 1)) * 10));
  const fan_loyalty = Math.max(0, Math.min(100, (save.popularity || 0)));
  const random_factor = Math.random() * 100;

  const viral_score = (
    (song_quality * 0.25) +
    (artist_popularity * 0.15) +
    (artist_hype * 0.15) +
    (marketing_level * 0.15) +
    (trend_alignment * 0.15) +
    (social_media_activity * 0.10) +
    (fan_loyalty * 0.10) +
    (random_factor * 0.10)
  ) / 1.15; // normalize slightly

  return Math.max(0, Math.min(100, viral_score));
};

const pickViralLevel = (): { level: Song['viral_level']; multiplier: number; duration: number; fansBoost: number } => {
  const r = Math.random();
  if (r < 0.60) return { level: 'minor', multiplier: 2, duration: 2, fansBoost: 100 };
  if (r < 0.85) return { level: 'medium', multiplier: 5, duration: 3, fansBoost: 2000 };
  if (r < 0.95) return { level: 'major', multiplier: 10, duration: 5, fansBoost: 50000 };
  if (r < 0.995) return { level: 'global', multiplier: 50, duration: 8, fansBoost: 500000 };
  return { level: 'legendary', multiplier: 100, duration: 12, fansBoost: 5000000 };
};

const viralDecayFactor = (weekIndex: number) => {
  // weekIndex = 1 => 1.0, 2 => 0.8, 3 => 0.6, 4 => 0.4, 5 => 0.2, >5 => 0.1
  if (weekIndex <= 1) return 1;
  if (weekIndex === 2) return 0.8;
  if (weekIndex === 3) return 0.6;
  if (weekIndex === 4) return 0.4;
  if (weekIndex === 5) return 0.2;
  return 0.1;
};

// Simulate AI artists releasing songs and building career
export const simulateAIArtists = (save: SaveData): SaveData => {
  const newSave = JSON.parse(JSON.stringify(save)) as SaveData;
  
  // Each AI artist has chance to release a song
  newSave.aiArtists = (newSave.aiArtists || []).map(artist => {
    const updatedArtist = { ...artist };
    
    // 40% chance to release a song this week
    if (Math.random() < 0.4) {
      const trendingGenre = getTrendingGenre(newSave.currentTrends || [], newSave.week);
      const songGenre = trendingGenre || artist.genre;
      
      const newSong: Song = {
        id: `ai-song-${artist.id}-${newSave.week}`,
        title: generateSongName(),
        genre: songGenre,
        quality: 40 + Math.random() * 40 + (artist.careerLevel * 5),
        trendScore: 30 + Math.random() * 40,
        isReleased: true,
        releaseWeek: newSave.week,
        releaseYear: newSave.year,
        artistName: artist.name,
        isUser: false,
        totalStreams: {},
        totalSales: 0,
        artwork: `https://via.placeholder.com/200?text=${encodeURIComponent(artist.name)}`
      };

      // Initialize viral fields for AI songs
      newSong.viral_score = 0;
      newSong.is_viral = false;
      newSong.viral_level = null;
      newSong.viral_remaining_weeks = 0;
      newSong.viral_total_weeks = 0;
      newSong.viral_peak_streams = 0;
      
      // Generate streams for AI artist song
      const chartQuality = newSong.quality + newSong.trendScore;
      const streams = Math.floor((chartQuality * 50 + Math.random() * 5000) * (artist.careerLevel / 5));
      newSong.totalStreams = { 'total': streams };
      newSong.totalSales = Math.floor(streams * 0.02);
      
      updatedArtist.catalog.push(newSong);
      updatedArtist.fans += Math.floor(streams * 0.001);
      updatedArtist.popularity = Math.min(100, updatedArtist.popularity + Math.random() * 5);
    }
    
    // AI artists naturally gain/lose fans and popularity
    updatedArtist.fans = Math.max(100, updatedArtist.fans + (Math.random() * 2000 - 500));
    updatedArtist.popularity = Math.max(10, Math.min(100, updatedArtist.popularity + (Math.random() * 10 - 3)));
    
    return updatedArtist;
  });
  
  return newSave;
};

// Get all songs on charts (player + AI) for display
export const getAllChartsWithAI = (save: SaveData): { song: Song; chartPosition: ChartPosition; artistName: string }[] => {
  const chartsData: { song: Song; chartPosition: ChartPosition; artistName: string }[] = [];
  
  // Add player songs
  save.catalog.forEach(song => {
    if (song.isReleased && song.chartPositions) {
      song.chartPositions.forEach(chartPos => {
        chartsData.push({
          song,
          chartPosition: chartPos,
          artistName: save.artistName
        });
      });
    }
  });
  
  // Add AI artist songs
  (save.aiArtists || []).forEach(artist => {
    artist.catalog.forEach(song => {
      if (song.isReleased) {
        // AI songs always chart
        chartsData.push({
          song,
          chartPosition: {
            playlistId: 'ai-chart',
            position: Math.floor(Math.random() * 50) + 10,
            weeksOnChart: 1,
            peakPosition: Math.floor(Math.random() * 30) + 5,
            debutWeek: song.releaseWeek || 1
          },
          artistName: artist.name
        });
      }
    });
  });
  
  // Sort by position and return top 100
  return chartsData.sort((a, b) => a.chartPosition.position - b.chartPosition.position).slice(0, 100);
};

// Calculate chart positions for released songs
export const calculateChartPositions = (song: Song, save: SaveData): ChartPosition[] => {
  const positions: ChartPosition[] = [];
  if (!song.isReleased) return positions;

  // Each song can chart on multiple playlists based on genre and quality
  const qualityScore = song.quality + song.trendScore;
  const genreMatches = PLAYLISTS.filter(p => p.style === song.genre);
  
  genreMatches.forEach((playlist, idx) => {
    // Quality affects chart position (higher quality = better position)
    const basePosition = Math.floor(95 - (qualityScore * 0.5) + Math.random() * 30);
    const finalPosition = Math.max(1, Math.min(playlist.maxSongs, basePosition));
    
    if (Math.random() < 0.6 || qualityScore > 70) { // 60% chance or if quality is high
      positions.push({
        playlistId: playlist.id,
        position: finalPosition,
        weeksOnChart: 1,
        peakPosition: finalPosition,
        debutWeek: save.week
      });
    }
  });

  return positions;
};

// Update chart positions for songs already on charts
export const updateChartPositions = (song: Song, save: SaveData): ChartPosition[] => {
  if (!song.chartPositions) return [];
  
  return song.chartPositions.map(chart => {
    const weeksActive = save.week - chart.debutWeek;
    const decay = Math.pow(0.95, weeksActive); // Slight position decay over time
    const volatility = Math.random() * 10 - 5; // Random movement
    
    const newPosition = Math.max(
      1,
      Math.min(100, Math.floor(chart.position * (decay + volatility / 100)))
    );
    
    const newChartPosition: ChartPosition = {
      ...chart,
      position: newPosition,
      weeksOnChart: chart.weeksOnChart + 1,
      peakPosition: Math.min(chart.peakPosition, newPosition)
    };
    
    return newChartPosition;
  }).filter(c => c.position <= 100); // Remove songs that charted out
};

export const simulateWeek = (save: SaveData): SaveData => {
  let newSave = JSON.parse(JSON.stringify(save)) as SaveData;
  
  // 0. Simulate AI artists
  newSave = simulateAIArtists(newSave);
  
  // 1. Advance Time
  newSave.week += 1;
  if (newSave.week > 52) {
    newSave.week = 1;
    newSave.year += 1;
  }

  // 2. Auto-generate song every 4 weeks if not disabled
  if (newSave.week % 4 === 0 && newSave.lastAutoWriteWeek !== newSave.week) {
    const autoSong = autoGenerateSong(newSave);
    newSave.catalog.push(autoSong);
    newSave.lastAutoWriteWeek = newSave.week;
    // Auto-release the generated song if player has funds
    if (newSave.funds >= 2000) { // Higher cost
      const lastSong = newSave.catalog[newSave.catalog.length - 1];
      lastSong.isReleased = true;
      lastSong.releaseWeek = newSave.week;
      lastSong.releaseYear = newSave.year;
      lastSong.artistName = newSave.artistName;
      lastSong.isUser = true;
      lastSong.chartPositions = calculateChartPositions(lastSong, newSave);
      newSave.funds -= 2000; // Split release cost
    }
  }

  // 3. Stats Decay/Regen
  newSave.stats.energy = Math.min(100, newSave.stats.energy + 15);
  newSave.stats.health = Math.max(0, newSave.stats.health - 1);
  newSave.stats.happiness = Math.max(0, newSave.stats.happiness - 2);
  newSave.stats.creativity = Math.max(50, newSave.stats.creativity - 5);

  // 4. Process Catalog (Songs & Charts)
  let weeklyIncome = 0;
  let weeklyListeners = 0;
  let weeklyFans = 0;

  newSave.catalog = newSave.catalog.map(song => {
    if (!song.isReleased) return song;

    const updatedSong = { ...song } as Song;
    
    // Update chart positions
    if (updatedSong.chartPositions) {
      updatedSong.chartPositions = updateChartPositions(updatedSong, newSave);
      updatedSong.peakChartPosition = updatedSong.chartPositions.length > 0 
        ? Math.min(...updatedSong.chartPositions.map(c => c.position))
        : undefined;
    }

    // Calculate streams based on chart performance and quality
    const weeksActive = (newSave.week + newSave.year * 52) - (song.releaseWeek! + song.releaseYear! * 52);
    const decay = Math.pow(0.92, Math.max(0, weeksActive));
    
    let chartBonus = 1;
    if (updatedSong.chartPositions && updatedSong.chartPositions.length > 0) {
      const avgChartPos = updatedSong.chartPositions.reduce((a, c) => a + c.position, 0) / updatedSong.chartPositions.length;
      chartBonus = 1 + (100 - avgChartPos) / 200; // Better chart position = more streams
    }

    // Calculate base weekly points and streams
    const weeklyPoints = (
      (song.quality * 8 + song.trendScore * 4 + newSave.popularity * 10) * decay * chartBonus
    );

    let streamCount = Math.floor(weeklyPoints * 200);

    // --- Viral system integration ---
    // Ensure viral fields exist
    updatedSong.viral_score = computeViralScore(updatedSong, newSave);

    // Chance to trigger viral event this week
    const viralProbability = updatedSong.viral_score / 100;
    if (!updatedSong.is_viral && Math.random() < viralProbability) {
      const picked = pickViralLevel();
      updatedSong.is_viral = true;
      updatedSong.viral_level = picked.level;
      updatedSong.viral_total_weeks = picked.duration;
      updatedSong.viral_remaining_weeks = picked.duration;
      updatedSong.viral_start_week = newSave.week + (newSave.year * 52);
      // immediate fans boost
      newSave.fans += picked.fansBoost;
      // bump popularity a bit
      newSave.popularity = Math.min(100, newSave.popularity + Math.min(20, Math.log10(picked.fansBoost + 1) * 8));
    }

    // If currently viral, apply multiplier with decay
    if (updatedSong.is_viral && updatedSong.viral_remaining_weeks && updatedSong.viral_total_weeks) {
      const weekIndex = (updatedSong.viral_total_weeks - updatedSong.viral_remaining_weeks) + 1;
      let baseMult = 1;
      switch (updatedSong.viral_level) {
        case 'minor': baseMult = 2; break;
        case 'medium': baseMult = 5; break;
        case 'major': baseMult = 10; break;
        case 'global': baseMult = 50; break;
        case 'legendary': baseMult = 100; break;
        default: baseMult = 1;
      }
      const decay = viralDecayFactor(weekIndex);
      const appliedMult = Math.max(1, Math.floor(baseMult * decay));
      streamCount = Math.floor(streamCount * appliedMult);

      // track peak streams
      updatedSong.viral_peak_streams = Math.max(updatedSong.viral_peak_streams || 0, streamCount);

      // social media growth tied to viral level and decay
      const socialFans = Math.floor((streamCount / 1000) * (decay * 0.6));
      newSave.fans += socialFans;

      // decrease remaining weeks
      updatedSong.viral_remaining_weeks = Math.max(0, (updatedSong.viral_remaining_weeks || 0) - 1);
      if (updatedSong.viral_remaining_weeks === 0) {
        updatedSong.is_viral = false;
        updatedSong.viral_level = null;
        updatedSong.viral_total_weeks = 0;
      }
    }

    // Delayed TikTok chance: small separate trigger that can massively boost streams
    if (Math.random() < 0.01) { // 1% weekly chance per song
      const tiktokMult = 10 + Math.floor(Math.random() * 40); // 10x - 50x
      streamCount = Math.floor(streamCount * tiktokMult);
      newSave.fans += Math.floor(streamCount * 0.02);
      newSave.popularity = Math.min(100, newSave.popularity + 2);
      // mark as viral-ish
      updatedSong.is_viral = true;
      updatedSong.viral_level = 'major';
      updatedSong.viral_total_weeks = 3;
      updatedSong.viral_remaining_weeks = 2;
    }

    // FLOP system: if viral_score very low, chance to flop
    if (updatedSong.viral_score < 15 && Math.random() < 0.12) {
      // Flop: streams drop to a very low baseline
      streamCount = Math.floor(Math.random() * 400) + 50; // 50-449
      // fans decay slightly
      newSave.fans = Math.max(0, newSave.fans - Math.floor(streamCount * 0.01));
    }

    // Trend-match boost: if song genre matches a current trend, add small bump
    const currentTrend = getTrendingGenre(newSave.currentTrends || [], newSave.week);
    if (currentTrend && currentTrend === song.genre) {
      streamCount = Math.floor(streamCount * 1.2);
      updatedSong.viral_score = Math.min(100, (updatedSong.viral_score || 0) + 20);
    }
    const newSales = Math.floor(streamCount * 0.02); // Rough conversion: streams to sales
    
    weeklyListeners += streamCount;
    weeklyIncome += streamCount * 0.008; // $0.008 per stream on average
    weeklyFans += Math.floor(weeklyPoints * 0.08);
    
    updatedSong.totalSales += newSales;
    updatedSong.totalStreams['all'] = (updatedSong.totalStreams['all'] || 0) + streamCount;
    updatedSong.lastWeekSales = newSales;

    return updatedSong;
  });

  newSave.funds += Math.floor(weeklyIncome);
  newSave.fans += Math.floor(weeklyFans);
  newSave.listeners = weeklyListeners;

  // 5. Expenses - HARDER COSTS
  const costOfLiving = newSave.careerLevel * 500; // Increased from 300
  const loanInterest = newSave.loan * 0.03;
  const studioRent = 200; // Weekly studio rental
  newSave.funds = Math.max(0, newSave.funds - costOfLiving - loanInterest - studioRent);

  // 5. Popularity Calculation (0-100)
  newSave.popularity = Math.min(100, Math.max(0, (Math.log10(newSave.fans + 1) * 12)));

  // 6. Update regional popularity based on chart presence
  newSave.catalog.forEach(song => {
    if (!song.chartPositions) return;
    song.chartPositions.forEach(chart => {
      const playlist = PLAYLISTS.find(p => p.id === chart.playlistId);
      if (playlist) {
        newSave.regionalPopularity[playlist.location] = 
          Math.min(100, (newSave.regionalPopularity[playlist.location] || 0) + 2);
      }
    });
  });

  // 7. XP progression and leveling
  const nextLevelXP = calculateXPForLevel(newSave.careerLevel);
  if (newSave.xp >= nextLevelXP && newSave.careerLevel < 10) {
    newSave.careerLevel += 1;
    newSave.funds += 2000; // Level up bonus
    newSave.stats.creativity = Math.min(100, newSave.stats.creativity + 10);
  }

  // 8. Natural stat improvements
  newSave.stats.vocals = Math.min(100, newSave.stats.vocals + 0.5);
  newSave.stats.stagePresence = Math.min(100, newSave.stats.stagePresence + 0.3);

  // 9. Process Merchandise Sales (uncertainty/randomness built in)
  let merchandiseRevenue = 0;
  let totalMerchSold = 0;

  newSave.merchandise = (newSave.merchandise || []).map(item => {
    const updatedItem = { ...item };
    
    // Merchandise sales formula with uncertainty:
    // Base sales depends on fame, popularity, and item quality
    const baseSales = Math.floor(newSave.fans * 0.005 * (newSave.popularity / 100) * (item.quality / 100));
    
    // Hype multiplier: increases if recent viral songs, active trends affecting merch interest
    const recentHitSongs = newSave.catalog
      .filter(s => s.isReleased && s.isUser && 
              (newSave.week + newSave.year * 52) - (s.releaseWeek! + s.releaseYear! * 52) <= 12)
      .filter(s => s.chartPositions && s.chartPositions.some(c => c.position <= 50));
    
    const viralBoost = recentHitSongs.length > 0 ? 1.5 : 1.0;
    
    // Random variance: -60% to +150% variance to simulate uncertainty
    const randomVariance = (Math.random() * 2.1) - 0.6; // -0.6 to 1.5 multiplier
    const weeklyUnits = Math.max(0, Math.floor((baseSales * viralBoost) + (baseSales * randomVariance)));
    
    const profitPerUnit = item.price - item.productionCost;
    const weekRevenue = weeklyUnits * profitPerUnit;
    
    updatedItem.unitsSoldThisWeek = weeklyUnits;
    updatedItem.stock = Math.max(0, updatedItem.stock - weeklyUnits);
    updatedItem.totalUnitsSold += weeklyUnits;
    
    merchandiseRevenue += weekRevenue;
    totalMerchSold += weeklyUnits;
    
    return updatedItem;
  });

  newSave.funds += Math.floor(merchandiseRevenue);
  newSave.totalMerchRevenue += Math.floor(merchandiseRevenue);

  return newSave;
};

export const calculateRhythmPerformance = (accuracy: number, difficulty: number, comboMultiplier: number = 1) => {
  const baseScore = accuracy * 1000 * difficulty * comboMultiplier;
  const score = Math.floor(baseScore);
  const fansGained = Math.floor(score / 30);
  const xpGained = Math.floor(score / 80);
  const moneyGained = Math.floor(score * 0.5);
  
  return { score, fansGained, xpGained, moneyGained };
};

// Release a song to charts
export const releaseSongToCharts = (song: Song, save: SaveData, playlistIds?: string[]): Song => {
  const updatedSong = { ...song };
  
  if (!updatedSong.chartPositions) {
    updatedSong.chartPositions = [];
  }

  if (playlistIds) {
    // Release to specific playlists (with payola)
    playlistIds.forEach(id => {
      const playlist = PLAYLISTS.find(p => p.id === id);
      if (playlist) {
        const position = Math.max(1, Math.floor(50 + Math.random() * 50)); // Mid to lower chart
        updatedSong.chartPositions?.push({
          playlistId: id,
          position,
          weeksOnChart: 1,
          peakPosition: position,
          debutWeek: save.week
        });
      }
    });
  } else {
    // Organic chart placement based on genre match
    updatedSong.chartPositions = calculateChartPositions(updatedSong, save);
  }

  return updatedSong;
};

