
import React from 'react';
import { Song } from '../types';
import { GENRE_COLORS } from '../constants';

interface BillboardProps {
  tracks: Song[];
}

const Billboard: React.FC<BillboardProps> = ({ tracks }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="bg-zinc-800/50 p-4 border-b border-zinc-700 flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-violet-500">🏆</span> Global Top 20
        </h2>
        <span className="text-xs text-zinc-400 font-mono">UPDATES WEEKLY</span>
      </div>
      <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
        {tracks.slice(0, 20).map((track, index) => (
          <div 
            key={track.id} 
            className={`p-4 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors ${track.isUser ? 'bg-violet-900/10' : ''}`}
          >
            <div className="w-8 font-black text-zinc-600 text-xl text-center">
              {index + 1}
            </div>
            <img 
              src={track.artwork || 'https://via.placeholder.com/150'} 
              alt={track.title} 
              className="w-12 h-12 rounded bg-zinc-700 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate text-sm">
                {track.title}
                {track.isUser && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-violet-500 text-white">YOU</span>}
              </h4>
              <p className="text-xs text-zinc-400 truncate">{track.artistName || 'Unknown Artist'}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${GENRE_COLORS[track.genre]}`}>
                {track.genre.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {(track.lastWeekSales ?? 0).toLocaleString()} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billboard;
