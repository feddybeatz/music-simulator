import supabase from '../lib/supabaseServer'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { artist_id } = req.query
      let query = supabase.from('songs').select('*')
      if (artist_id) query = query.eq('artist_id', artist_id)
      const { data, error } = await query
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const { artist_id, title, genre, quality, hype } = req.body
      if (!artist_id || !title) return res.status(400).json({ error: 'Missing artist_id or title' })

      const payload = { artist_id, title, genre: genre || 'Pop', quality: quality || 50, hype: hype || 0 }
      const { data, error } = await supabase.from('songs').insert([payload]).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
