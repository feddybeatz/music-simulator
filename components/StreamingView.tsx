import React from 'react';
import { SaveData, StreamingPlatform } from '../types';
import { STREAMING_PLATFORMS } from '../constants';
import { TrendingUp, Music, Users } from 'lucide-react';

interface StreamingViewProps {
  save: SaveData;
}

const StreamingView: React.FC<StreamingViewProps> = ({ save }) => {
  const calculatePlatformStats = (platformId: string) => {
    let totalStreams = 0;

    save.catalog.forEach(song => {
      if (song.isReleased && song.totalStreams) {
        // Use platform-specific key if available, otherwise estimate from 'all' using market share
        const platformStreams = song.totalStreams[platformId];
        if (platformStreams !== undefined) {
          totalStreams += platformStreams;
        } else {
          // fallback for old saves: estimate from total using market share
          const platform = STREAMING_PLATFORMS.find(p => p.id === platformId);
          const allStreams = song.totalStreams['all'] || 0;
          totalStreams += Math.floor(allStreams * (platform?.marketShare || 0));
        }
      }
    });

    const platform = STREAMING_PLATFORMS.find(p => p.id === platformId);
    const revenue = totalStreams * (platform?.ratePerStream || 0.004);

    return { totalStreams, revenue };
  };

  const platformStats = STREAMING_PLATFORMS.map(platform => ({
    ...platform,
    ...calculatePlatformStats(platform.id)
  }));

  const totalAllStreams = platformStats.reduce((sum, p) => sum + p.totalStreams, 0);
  const totalAllRevenue = platformStats.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600 rounded-[3rem] p-10">
        <h1 className="text-5xl font-black mb-4">🎵 Streaming Platforms</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-zinc-900/50 p-6 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">Total Streams</p>
            <p className="text-3xl font-black text-purple-300">{totalAllStreams.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">Monthly Listeners</p>
            <p className="text-3xl font-black text-blue-300">{save.monthlyListeners.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">Total Revenue</p>
            <p className="text-3xl font-black text-green-300">${totalAllRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tight">Distribution Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {platformStats.map((platform) => {
            const percentage = totalAllStreams > 0 ? (platform.totalStreams / totalAllStreams * 100) : 0;

            return (
              <div
                key={platform.id}
                className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-purple-600 transition-all"
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{platform.icon}</span>
                    <div>
                      <h3 className="text-2xl font-black">{platform.name}</h3>
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Market Share: {(platform.marketShare * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 mb-1">Rate per stream</p>
                    <p className="font-black text-green-400">${platform.ratePerStream.toFixed(4)}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-zinc-800 mb-6"></div>

                {/* Stats */}
                <div className="space-y-4 mb-6">
                  {/* Streams Stat */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total Streams</span>
                      <span className="text-sm font-black text-purple-300">{platform.totalStreams.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Revenue Stat */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Revenue Earned</span>
                      <span className="text-sm font-black text-green-300">${platform.revenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (platform.revenue / (totalAllRevenue || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[10px] text-zinc-500 italic">
                  {platform.id === 'spotify' && 'Largest market share with highest volume of listeners.'}
                  {platform.id === 'apple' && 'Premium listeners with strong paying base.'}
                  {platform.id === 'youtube' && 'Video-based streaming with viral potential.'}
                  {platform.id === 'amazon' && 'Growing platform with Prime subscriber base.'}
                  {platform.id === 'soundcloud' && 'Independent artists platform with emerging listeners.'}
                  {platform.id === 'pandora' && 'Radio-style platform with loyal listeners.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Streamed Songs */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
          <TrendingUp size={28} className="text-purple-400" />
          Top Streamed Songs
        </h2>
        <div className="space-y-4">
          {save.catalog
            .filter(s => s.isReleased)
            .sort((a, b) => {
              const aStreams = Object.values(a.totalStreams || {}).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
              const bStreams = Object.values(b.totalStreams || {}).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
              return (bStreams as number) - (aStreams as number);
            })
            .slice(0, 10)
            .map((song, idx) => {
              const totalSongs = Object.values(song.totalStreams || {}).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0) as number;
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-zinc-700 w-8">#{idx + 1}</span>
                    <div>
                      <p className="font-black text-lg">{song.title}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-black">{song.genre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-purple-400 mb-1">
                      {totalSongs.toLocaleString()} streams
                    </p>
                    <p className="text-xs font-bold text-zinc-500">
                      ${(((totalSongs as number) / 1000000) * 3000).toLocaleString('en-US', { maximumFractionDigits: 0 })} est.
                    </p>
                  </div>
                </div>
              );
            })}
          {save.catalog.filter(s => s.isReleased).length === 0 && (
            <p className="text-center text-zinc-600 italic py-10">No released songs yet...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingView;
