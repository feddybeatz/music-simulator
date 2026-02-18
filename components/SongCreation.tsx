
import React, { useState } from 'react';
import { Genre, ArtistStats } from '../types';

interface SongCreationProps {
  stats: ArtistStats;
  onRecord: (title: string, genre: Genre, focus: 'vocal' | 'writing' | 'production') => void;
  isRecording: boolean;
}

const SongCreation: React.FC<SongCreationProps> = ({ stats, onRecord, isRecording }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<Genre>(Genre.POP);
  const [focus, setFocus] = useState<'vocal' | 'writing' | 'production'>('writing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onRecord(title, genre, focus);
    setTitle('');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-violet-500">🎙️</span> Recording Studio
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Song Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter track name..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Genre</label>
            <select 
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm"
            >
              {Object.values(Genre).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Focus Area</label>
            <select 
              value={focus}
              onChange={(e) => setFocus(e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm"
            >
              <option value="writing">Songwriting</option>
              <option value="vocal">Vocals</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
        <button 
          disabled={isRecording || !title}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors mt-4 flex items-center justify-center gap-2"
        >
          {isRecording ? "WORKING..." : "RELEASE SINGLE (-$500)"}
        </button>
      </form>
    </div>
  );
};

export default SongCreation;
