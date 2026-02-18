import supabase from '../lib/supabaseServer'

// Very small weekly simulation: updates streams, fans, revenue, merch, charts, bank.
// This is a simplified but persistent server-side simulation that writes results to Supabase.

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

      // Process each song
      for (const song of songs) {
        // Base calculation
        const base = (song.quality || 50) * 100 + (song.hype || 0) * 50 + Math.floor(Math.random() * 1000)
        const fanBoost = Math.floor((artist.fans || 0) * 0.001)
        let streamsThisWeek = Math.max(0, base + fanBoost + Math.floor((song.streams || 0) * 0.001))

        // Distribute across platforms (approximate)
        const platforms = [ ['spotify', 0.5], ['apple', 0.2], ['youtube', 0.15], ['amazon', 0.07], ['soundcloud', 0.05] ]
        for (const [platform, pct] of platforms) {
          const platformStreams = Math.floor(streamsThisWeek * pct)
          // upsert to streams table
          const { data: existing } = await supabase.from('streams').select('*').eq('song_id', song.id).eq('platform', platform).limit(1)
          if (existing && existing.length > 0) {
            await supabase.from('streams').update({ streams: existing[0].streams + platformStreams }).eq('id', existing[0].id)
          } else {
            await supabase.from('streams').insert([{ song_id: song.id, platform, streams: platformStreams }])
          }
        }

        // Update song totals
        await supabase.from('songs').update({ streams: (song.streams || 0) + streamsThisWeek, sales: (song.sales || 0) + Math.floor(streamsThisWeek * 0.02) }).eq('id', song.id)

        // Money to artist (average $0.004 per stream)
        const revenue = Math.floor(streamsThisWeek * 0.004)
        await supabase.from('artists').update({ money: (artist.money || 0) + revenue }).eq('id', artist.id)

        // Fans growth
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
    // Clear existing charts for new week (simple approach)
    await supabase.from('charts').delete().neq('id', '0') // delete all rows (assumes you want weekly snapshot)

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
