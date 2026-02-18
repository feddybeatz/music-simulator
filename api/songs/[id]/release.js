import supabase from '../../../../lib/supabaseServer'

export default async function handler(req, res) {
  const { id } = req.query
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    // mark song as released and create initial chart entry
    const { data: song, error: songErr } = await supabase.from('songs').select('*').eq('id', id).single()
    if (songErr) return res.status(500).json({ error: songErr.message })

    const updates = { released: true }
    const { data, error } = await supabase.from('songs').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })

    // create initial chart record for week 1 (or current week) with low rank placeholder
    await supabase.from('charts').insert([{ song_id: id, rank: 100, week: 1 }])

    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
