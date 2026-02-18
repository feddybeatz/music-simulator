import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, TrendingUp, Users, Globe } from 'lucide-react';
import { SaveData } from '../types';
import { PLAYLISTS } from '../data/playlists';
import { GENRE_COLORS } from '../constants';

interface PlaylistsViewProps {
  save: SaveData;
}

const PlaylistsView: React.FC<PlaylistsViewProps> = ({ save }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Get unique platforms
  const platforms = Array.from(new Set(PLAYLISTS.map(p => p.platform)));
  
  // Filter playlists
  const filteredPlaylists = PLAYLISTS.filter(p => {
    const platformMatch = selectedPlatform === 'all' || p.platform === selectedPlatform;
    const genreMatch = selectedGenre === 'all' || p.style === selectedGenre;
    return platformMatch && genreMatch;
  });

  // Get user's playlist presence
  const userPlaylistPresence = save.playlistPresence || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Music className="text-violet-500" size={40} />
            Music Playlists
          </h1>
          <p className="text-zinc-400">Get your song on {PLAYLISTS.length}+ playlists across 7 platforms</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-violet-900 to-violet-950 border border-violet-700 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">CHARTS ACTIVE</p>
                <p className="text-3xl font-black text-violet-300">
                  {Object.keys(userPlaylistPresence).length}
                </p>
              </div>
              <TrendingUp size={32} className="text-violet-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">PLATFORMS</p>
                <p className="text-3xl font-black text-blue-300">{platforms.length}</p>
              </div>
              <Globe size={32} className="text-blue-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-900 to-pink-950 border border-pink-700 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">TOTAL PLAYLISTS</p>
                <p className="text-3xl font-black text-pink-300">{PLAYLISTS.length}</p>
              </div>
              <Music size={32} className="text-pink-400" />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-4"
        >
          <div className="flex-1 min-w-[250px]">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full mt-2 bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg focus:border-violet-500 focus:outline-none"
            >
              <option value="all">All Platforms</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[250px]">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full mt-2 bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg focus:border-violet-500 focus:outline-none"
            >
              <option value="all">All Genres</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="R&B">R&B</option>
              <option value="Dance/Club">Dance</option>
              <option value="Country">Country</option>
              <option value="K-Pop">K-Pop</option>
              <option value="Latin">Latin</option>
            </select>
          </div>
        </motion.div>

        {/* Playlists Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPlaylists.map((playlist, idx) => {
            const userOnPlaylist = userPlaylistPresence[playlist.id];
            const isOnChart = !!userOnPlaylist;

            return (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 hover:border-violet-500 transition-all duration-300"
              >
                {/* Background with gradient */}
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: playlist.backgroundColor }}
                />

                {/* Content */}
                <div className="relative p-6 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm">
                  {/* Platform & Category */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">{playlist.platform}</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">{playlist.category}</p>
                    </div>
                    {isOnChart && (
                      <span className="px-3 py-1 bg-green-900/50 border border-green-600 text-green-300 text-xs font-bold rounded-full">
                        ON CHART #{userOnPlaylist.position}
                      </span>
                    )}
                  </div>

                  {/* Playlist Title */}
                  <h3 className="text-lg font-black mb-4 group-hover:text-violet-300 transition-colors line-clamp-2">
                    {playlist.name}
                  </h3>

                  {/* Playlist Info */}
                  <div className="space-y-2 mb-4 text-sm text-zinc-400">
                    <div className="flex justify-between items-center">
                      <span>📍 {playlist.location}</span>
                      <span className="text-right">🎵 {playlist.maxSongs} slots</span>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${GENRE_COLORS[playlist.style] || 'bg-zinc-700'}`}>
                        {playlist.style}
                      </span>
                    </div>
                  </div>

                  {/* Chart Info if on chart */}
                  {isOnChart && (
                    <div className="bg-zinc-950/50 border border-zinc-700 rounded-lg p-3 mb-4 text-xs">
                      <p className="text-zinc-300">📊 Peak: #{userOnPlaylist.peakPosition}</p>
                      <p className="text-zinc-400">📈 Weeks: {userOnPlaylist.weeksOnChart}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className={`w-full py-2 rounded-lg font-bold transition-all transform group-hover:scale-105 ${
                    isOnChart
                      ? 'bg-green-900/50 text-green-300 border border-green-600'
                      : 'bg-violet-600 text-white border border-violet-500 hover:bg-violet-700'
                  }`}>
                    {isOnChart ? '🎵 ON CHART' : '+ ADD TO CHART'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredPlaylists.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-zinc-400"
          >
            <Music size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No playlists match your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsView;
