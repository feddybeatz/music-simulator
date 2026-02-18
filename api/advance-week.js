import supabase from '../lib/supabaseServer'

// Compute viral score for a song based on artist stats
const computeViralScore = (song, artist) => {
  const song_quality = Math.max(0, Math.min(100, song.quality || 0))
  const artist_popularity = Math.max(0, Math.min(100, artist.reputation || 0))
  const artist_hype = Math.max(0, Math.min(100, (artist.xp || 0) / 100)) // simplified hype
  const marketing_level = Math.max(0, Math.min(100, (artist.payola || 0) / 10))
  const trend_alignment = Math.max(0, Math.min(100, song.trendScore || 0))
  const social_media_activity = Math.max(0, Math.min(100, (artist.subscribers || 0) / Math.max(1, artist.fans || 1) * 10))
  const fan_loyalty = Math.max(0, Math.min(100, artist.reputation || 0))
  const random_factor = Math.random() * 100

  const viral_score = (
    (song_quality * 0.25) +
    (artist_popularity * 0.15) +
    (artist_hype * 0.15) +
    (marketing_level * 0.15) +
    (trend_alignment * 0.15) +
    (social_media_activity * 0.10) +
    (fan_loyalty * 0.10) +
    (random_factor * 0.10)
  ) / 1.15

  return Math.max(0, Math.min(100, viral_score))
}

// Pick a viral level when triggered
const pickViralLevel = () => {
  const r = Math.random()
  if (r < 0.60) return { level: 'minor', multiplier: 2, duration: 2, fansBoost: 100 }
  if (r < 0.85) return { level: 'medium', multiplier: 5, duration: 3, fansBoost: 2000 }
  if (r < 0.95) return { level: 'major', multiplier: 10, duration: 5, fansBoost: 50000 }
  if (r < 0.995) return { level: 'global', multiplier: 50, duration: 8, fansBoost: 500000 }
  return { level: 'legendary', multiplier: 100, duration: 12, fansBoost: 5000000 }
}

// Decay multiplier for viral effect over time
const viralDecayFactor = (weekIndex) => {
  if (weekIndex <= 1) return 1
  if (weekIndex === 2) return 0.8
  if (weekIndex === 3) return 0.6
  if (weekIndex === 4) return 0.4
  if (weekIndex === 5) return 0.2
  return 0.1
}

// Weekly simulation: full viral algorithm, streams, fans, revenue, merch, charts, bank
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    // Fetch all artists and their songs
    const { data: artists, error: aErr } = await supabase.from('artists').select('*')
    if (aErr) return res.status(500).json({ error: aErr.message })

    // For chart ranking this week
    const chartCandidates = []

    for (const artist of artists) {
      // Fetch released songs for artist
      const { data: songs, error: sErr } = await supabase.from('songs').select('*').eq('artist_id', artist.id).eq('released', true)
      if (sErr) return res.status(500).json({ error: sErr.message })

      // Process each song with full viral algorithm
      for (const song of songs) {
        // Compute viral score
        const viralScore = computeViralScore(song, artist)

        // Base calculation
        const base = (song.quality || 50) * 100 + (song.hype || 0) * 50 + Math.floor(Math.random() * 1000)
        const fanBoost = Math.floor((artist.fans || 0) * 0.001)
        let streamsThisWeek = Math.max(0, base + fanBoost + Math.floor((song.streams || 0) * 0.001))

        // --- Viral system: check trigger ---
        let updatedSong = { ...song }
        const viralProbability = viralScore / 100

        if (!updatedSong.is_viral && Math.random() < viralProbability) {
          // Trigger viral event
          const picked = pickViralLevel()
          updatedSong.is_viral = true
          updatedSong.viral_level = picked.level
          updatedSong.viral_total_weeks = picked.duration
          updatedSong.viral_remaining_weeks = picked.duration
          updatedSong.viral_peak_streams = 0

          // Immediate artist benefits
          await supabase.from('artists').update({
            fans: Math.max(0, (artist.fans || 0) + picked.fansBoost),
            reputation: Math.min(100, (artist.reputation || 0) + Math.min(20, Math.log10(picked.fansBoost + 1) * 8))
          }).eq('id', artist.id)
        }

        // --- Viral system: apply multiplier if active ---
        if (updatedSong.is_viral && updatedSong.viral_remaining_weeks && updatedSong.viral_remaining_weeks > 0) {
          const weekIndex = (updatedSong.viral_total_weeks - updatedSong.viral_remaining_weeks) + 1
          let baseMult = 1
          switch (updatedSong.viral_level) {
            case 'minor': baseMult = 2; break
            case 'medium': baseMult = 5; break
            case 'major': baseMult = 10; break
            case 'global': baseMult = 50; break
            case 'legendary': baseMult = 100; break
            default: baseMult = 1
          }
          const decay = viralDecayFactor(weekIndex)
          const appliedMult = Math.max(1, Math.floor(baseMult * decay))
          streamsThisWeek = Math.floor(streamsThisWeek * appliedMult)

          // Track peak streams
          updatedSong.viral_peak_streams = Math.max(updatedSong.viral_peak_streams || 0, streamsThisWeek)

          // Social media growth tied to viral effect
          const socialFans = Math.floor((streamsThisWeek / 1000) * (decay * 0.6))
          if (socialFans > 0) {
            await supabase.from('artists').update({
              fans: (artist.fans || 0) + socialFans
            }).eq('id', artist.id)
          }

          // Decrease remaining weeks
          updatedSong.viral_remaining_weeks = Math.max(0, updatedSong.viral_remaining_weeks - 1)

          // If viral period ended, mark as no longer viral (song stays in database)
          if (updatedSong.viral_remaining_weeks === 0) {
            updatedSong.is_viral = false
          }
        }

        // --- Flop detection (viral score < 15) ---
        if (viralScore < 15 && !updatedSong.is_viral) {
          streamsThisWeek = Math.floor(streamsThisWeek * 0.5)
        }

        // --- TikTok chance (1% new fans per week) ---
        if (Math.random() < 0.01) {
          const tiktokFans = Math.floor((artist.fans || 0) * 0.05)
          if (tiktokFans > 0) {
            await supabase.from('artists').update({
              fans: (artist.fans || 0) + tiktokFans
            }).eq('id', artist.id)
          }
        }

        // Update song with viral state and stats
        await supabase.from('songs').update({
          streams: (song.streams || 0) + streamsThisWeek,
          sales: (song.sales || 0) + Math.floor(streamsThisWeek * 0.02),
          viral_score: viralScore,
          is_viral: updatedSong.is_viral,
          viral_level: updatedSong.viral_level,
          viral_total_weeks: updatedSong.viral_total_weeks,
          viral_remaining_weeks: updatedSong.viral_remaining_weeks,
          viral_peak_streams: updatedSong.viral_peak_streams
        }).eq('id', song.id)

        // Distribute streams across platforms
        const platforms = [ ['spotify', 0.5], ['apple', 0.2], ['youtube', 0.15], ['amazon', 0.07], ['soundcloud', 0.05] ]
        for (const [platform, pct] of platforms) {
          const platformStreams = Math.floor(streamsThisWeek * pct)
          const { data: existing } = await supabase.from('streams').select('*').eq('song_id', song.id).eq('platform', platform).limit(1)
          if (existing && existing.length > 0) {
            await supabase.from('streams').update({ streams: existing[0].streams + platformStreams }).eq('id', existing[0].id)
          } else {
            await supabase.from('streams').insert([{ song_id: song.id, platform, streams: platformStreams }])
          }
        }

        // Money to artist (average $0.004 per stream)
        const revenue = Math.floor(streamsThisWeek * 0.004)
        await supabase.from('artists').update({ money: (artist.money || 0) + revenue }).eq('id', artist.id)

        // Fans growth (already done via viral/TikTok, so this is base growth)
        const fansGain = Math.floor(streamsThisWeek * 0.0005)
        await supabase.from('artists').update({ fans: (artist.fans || 0) + fansGain }).eq('id', artist.id)

        // Collect for charting
        chartCandidates.push({ song_id: song.id, streams: streamsThisWeek })
      }

      // Merchandise processing for artist
      const { data: merchItems } = await supabase.from('merch').select('*').eq('artist_id', artist.id)
      if (merchItems) {
        for (const item of merchItems) {
          const baseDemand = Math.floor((artist.fans || 0) * 0.0002)
          const sold = Math.min(item.stock || 0, baseDemand + Math.floor(Math.random() * 5))
          if (sold > 0) {
            await supabase.from('merch').update({ stock: (item.stock || 0) - sold, sold: (item.sold || 0) + sold }).eq('id', item.id)
            // profit (price) added to artist money
            await supabase.from('artists').update({ money: (artist.money || 0) + sold * (item.price || 0) }).eq('id', artist.id)
          }
        }
      }

      // Bank interest: simple weekly interest on debt, small interest on balance
      const { data: bankRecords } = await supabase.from('bank').select('*').eq('artist_id', artist.id).limit(1)
      if (bankRecords && bankRecords.length > 0) {
        const bank = bankRecords[0]
        const debtInterest = Math.floor((bank.debt || 0) * 0.005)
        const balanceInterest = Math.floor((bank.balance || 0) * 0.001)
        await supabase.from('bank').update({ debt: (bank.debt || 0) + debtInterest, balance: (bank.balance || 0) + balanceInterest }).eq('id', bank.id)
      }
    }

    // Rank charts by streamsThisWeek (desc)
    chartCandidates.sort((a, b) => b.streams - a.streams)
    // Delete existing charts for weekly snapshot
    await supabase.from('charts').delete().neq('id', '0')

    for (let i = 0; i < chartCandidates.length; i++) {
      const rank = i + 1
      const entry = { song_id: chartCandidates[i].song_id, rank, week: 1 }
      await supabase.from('charts').insert([entry])
    }

    return res.status(200).json({ ok: true, processed: chartCandidates.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
