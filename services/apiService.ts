/**
 * API Service - Handles all server-side communication
 * Replaces localStorage-based saves with Supabase persistence
 */

const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

// Artists API
export const artistsApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/api/artists`)
    if (!res.ok) throw new Error(`Failed to fetch artists: ${res.statusText}`)
    return res.json()
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/api/artist/${id}`)
    if (!res.ok) throw new Error(`Failed to fetch artist: ${res.statusText}`)
    return res.json()
  },

  create: async (name) => {
    const res = await fetch(`${API_BASE}/api/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    if (!res.ok) throw new Error(`Failed to create artist: ${res.statusText}`)
    return res.json()
  },

  update: async (id, updates) => {
    const res = await fetch(`${API_BASE}/api/artist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error(`Failed to update artist: ${res.statusText}`)
    return res.json()
  }
}

// Songs API
export const songsApi = {
  getByArtist: async (artistId) => {
    const res = await fetch(`${API_BASE}/api/songs?artist_id=${artistId}`)
    if (!res.ok) throw new Error(`Failed to fetch songs: ${res.statusText}`)
    return res.json()
  },

  create: async (name, artistId, quality = 50, genre = 'Pop') => {
    const res = await fetch(`${API_BASE}/api/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, artist_id: artistId, quality, genre, viral_score: 0, is_viral: false, viral_level: null, viral_remaining_weeks: 0, viral_total_weeks: 0, viral_peak_streams: 0 })
    })
    if (!res.ok) throw new Error(`Failed to create song: ${res.statusText}`)
    return res.json()
  },

  release: async (songId) => {
    const res = await fetch(`${API_BASE}/api/songs/${songId}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`Failed to release song: ${res.statusText}`)
    return res.json()
  }
}

// Merchandise API
export const merchApi = {
  getByArtist: async (artistId) => {
    const res = await fetch(`${API_BASE}/api/merch?artist_id=${artistId}`)
    if (!res.ok) throw new Error(`Failed to fetch merchandise: ${res.statusText}`)
    return res.json()
  },

  create: async (name, artistId, price = 10) => {
    const res = await fetch(`${API_BASE}/api/merch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, artist_id: artistId, price, stock: 100, sold: 0 })
    })
    if (!res.ok) throw new Error(`Failed to create merchandise: ${res.statusText}`)
    return res.json()
  }
}

// Bank API
export const bankApi = {
  getByArtist: async (artistId) => {
    const res = await fetch(`${API_BASE}/api/bank?artist_id=${artistId}`)
    if (!res.ok) throw new Error(`Failed to fetch bank record: ${res.statusText}`)
    return res.json()
  },

  create: async (artistId) => {
    const res = await fetch(`${API_BASE}/api/bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist_id: artistId })
    })
    if (!res.ok) throw new Error(`Failed to create bank account: ${res.statusText}`)
    return res.json()
  }
}

// Charts API
export const chartsApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/api/charts`)
    if (!res.ok) throw new Error(`Failed to fetch charts: ${res.statusText}`)
    return res.json()
  },

  getBySong: async (songId) => {
    const res = await fetch(`${API_BASE}/api/charts?song_id=${songId}`)
    if (!res.ok) throw new Error(`Failed to fetch song chart: ${res.statusText}`)
    return res.json()
  }
}

// Simulation API
export const simulationApi = {
  advanceWeek: async () => {
    const res = await fetch(`${API_BASE}/api/advance-week`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`Failed to advance week: ${res.statusText}`)
    return res.json()
  }
}
