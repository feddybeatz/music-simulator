import supabase from '../lib/supabaseServer'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('artists').select('*')
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const { name } = req.body
      if (!name) return res.status(400).json({ error: 'Missing name' })

      const payload = {
        name,
        money: 3000,
        fans: 50,
        reputation: 15,
        hype: 0,
        health: 100
      }

      const { data, error } = await supabase.from('artists').insert([payload]).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json(data)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
