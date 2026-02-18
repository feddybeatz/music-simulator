import supabase from '../../lib/supabaseServer'

export default async function handler(req, res) {
  const { id } = req.query
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('artists').select('*').eq('id', id).single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    if (req.method === 'PUT') {
      const updates = req.body
      const { data, error } = await supabase.from('artists').update(updates).eq('id', id).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
