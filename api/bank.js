import supabase from '../lib/supabaseServer'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { artist_id } = req.query
      let query = supabase.from('bank').select('*')
      if (artist_id) query = query.eq('artist_id', artist_id).single()
      const { data, error } = await query
      if (error && !artist_id) return res.status(500).json({ error: error.message })
      if (!data && artist_id) return res.status(404).json({ error: 'Bank record not found' })
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const { artist_id } = req.body
      if (!artist_id) return res.status(400).json({ error: 'Missing artist_id' })

      // Create bank record for artist if not exists
      const { data: existing } = await supabase.from('bank').select('*').eq('artist_id', artist_id).limit(1)
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Bank account already exists' })
      }

      const payload = { artist_id, balance: 0, debt: 0 }
      const { data, error } = await supabase.from('bank').insert([payload]).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
