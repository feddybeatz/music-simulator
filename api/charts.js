import supabase from '../lib/supabaseServer'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { song_id, week } = req.query
      let query = supabase.from('charts').select('*').order('rank', { ascending: true })

      if (song_id) query = query.eq('song_id', song_id)
      if (week) query = query.eq('week', parseInt(week))

      const { data, error } = await query
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { song_id, rank, week } = req.body
      if (!song_id || rank === undefined || !week) {
        return res.status(400).json({ error: 'Missing song_id, rank, or week' })
      }

      const payload = { song_id, rank: Math.floor(rank), week: Math.floor(week) }
      const { data, error } = await supabase.from('charts').insert([payload]).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
