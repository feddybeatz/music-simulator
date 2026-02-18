import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Heart, X, Radio, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { SaveData } from '../types';

interface PerformanceShowProps {
  save: SaveData;
  onComplete?: (result: { fansGained: number; hatorsGained: number; moneyGained: number }) => void;
}

const PerformanceShow: React.FC<PerformanceShowProps> = ({ save, onComplete }) => {
  const [showRunning, setShowRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState({
    fansGained: 0,
    hatorsGained: 0,
    moneyGained: 0,
    averageVibe: 0
  });

  // Calculate performance based on stats
  const calculatePerformance = () => {
    // Base performance from artist stats
    const stagePresence = save.stats.stagePresence;
    const vocals = save.stats.vocals;
    const creativity = save.stats.creativity;
    const energy = save.stats.energy;
    
    // Overall performance score (0-100)
    const performanceScore = (stagePresence + vocals + creativity + energy) / 4;
    
    // Fan generation (more performance = more fans)
    const baseFans = Math.floor(performanceScore * 50);
    const fansGained = baseFans + Math.floor(Math.random() * baseFans * 0.5);
    
    // Haters generation (inversely proportional to performance)
    const haterChance = 100 - performanceScore; // 0-100 scale
    const hatorsGained = Math.floor((haterChance / 100) * fansGained * 0.3) + Math.floor(Math.random() * 10);
    
    // Money from ticket sales and donations
    const moneyGained = Math.floor(fansGained * 2.5);
    
    return {
      fansGained,
      hatorsGained,
      moneyGained,
      averageVibe: Math.floor(performanceScore)
    };
  };

  const handleStartShow = () => {
    setShowRunning(true);
    // Simulate performance
    setTimeout(() => {
      const performanceResult = calculatePerformance();
      setResult(performanceResult);
      setCompleted(true);
      setShowRunning(false);
    }, 3000);
  };

  const handleClose = () => {
    if (completed && onComplete) {
      onComplete(result);
    }
  };

  if (!completed && !showRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600 rounded-3xl p-12 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🎤
            </motion.div>
            
            <h1 className="text-4xl font-black mb-4">Ready to Perform?</h1>
            <p className="text-zinc-300 text-lg mb-8">
              Take the stage and perform a free show for your fans! Your performance will gain you new supporters and possibly some haters too.
            </p>

            {/* Performance Stats Preview */}
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6 mb-8 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Stage Presence</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${save.stats.stagePresence}%` }}
                    />
                  </div>
                  <span className="font-bold">{Math.floor(save.stats.stagePresence)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Vocals</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${save.stats.vocals}%` }}
                    />
                  </div>
                  <span className="font-bold">{Math.floor(save.stats.vocals)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Creativity</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full"
                      style={{ width: `${save.stats.creativity}%` }}
                    />
                  </div>
                  <span className="font-bold">{Math.floor(save.stats.creativity)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Energy</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${save.stats.energy}%` }}
                    />
                  </div>
                  <span className="font-bold">{Math.floor(save.stats.energy)}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartShow}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-4 rounded-2xl uppercase tracking-wider text-lg transition-all transform hover:scale-105 active:scale-95"
            >
              🎸 Start Free Show
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showRunning) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl w-full text-center"
        >
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-9xl mb-8"
          >
            🎤
          </motion.div>
          
          <h1 className="text-5xl font-black mb-4 animate-pulse">NOW PERFORMING...</h1>
          <p className="text-2xl text-purple-400 mb-8">{save.artistName}</p>
          
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500 rounded-2xl p-8">
            <div className="space-y-4">
              <motion.div
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-6xl"
              >
                ♪ ♫ ♪
              </motion.div>
              <p className="text-zinc-400">The crowd is enjoying the show!</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1 }}
            className="text-8xl mb-6"
          >
            🌟
          </motion.div>
          <h1 className="text-5xl font-black mb-4">SHOW COMPLETE!</h1>
          <p className="text-2xl text-purple-300">{save.artistName} knocked it out of the park!</p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Fans Gained */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-600 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart size={32} className="text-green-400" />
              <h2 className="text-lg font-black text-green-300 uppercase">FANS GAINED</h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-black text-green-300"
            >
              +{result.fansGained.toLocaleString()}
            </motion.p>
            <p className="text-sm text-zinc-400 mt-2">People who loved your performance</p>
          </motion.div>

          {/* Haters Gained */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-600 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <X size={32} className="text-red-400" />
              <h2 className="text-lg font-black text-red-300 uppercase">HATERS</h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-black text-red-300"
            >
              +{result.hatorsGained.toLocaleString()}
            </motion.p>
            <p className="text-sm text-zinc-400 mt-2">People who weren't feeling it</p>
          </motion.div>

          {/* Money Earned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border border-yellow-600 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={32} className="text-yellow-400" />
              <h2 className="text-lg font-black text-yellow-300 uppercase">Tips & Donations</h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-black text-yellow-300"
            >
              ${result.moneyGained.toLocaleString()}
            </motion.p>
            <p className="text-sm text-zinc-400 mt-2">From grateful fans</p>
          </motion.div>
        </div>

        {/* Performance Vibe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Radio size={32} className="text-purple-400" />
            <h2 className="text-2xl font-black">Performance Vibe</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Crowd Energy</span>
                <span className="font-black text-lg text-purple-300">{result.averageVibe}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.averageVibe}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
            <div className="text-5xl">
              {result.averageVibe >= 80 ? '🔥' : result.averageVibe >= 60 ? '🎉' : result.averageVibe >= 40 ? '👍' : '😕'}
            </div>
          </div>

          {/* Vibe Description */}
          <p className="text-zinc-400 mt-4 text-sm">
            {result.averageVibe >= 80 && '🔥 The crowd was ABSOLUTELY FIRED UP! An unforgettable performance!'}
            {result.averageVibe >= 60 && result.averageVibe < 80 && '🎉 Great energy! The fans loved it!'}
            {result.averageVibe >= 40 && result.averageVibe < 60 && '👍 Good performance, but could use some polish.'}
            {result.averageVibe < 40 && '😕 It was okay, but not your best show. Keep improving!'}
          </p>
        </motion.div>

        {/* Summary Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-8 mb-8"
        >
          <h3 className="text-lg font-black mb-4">Session Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Fans:</span>
              <span className="font-bold text-green-400">{(save.fans + result.fansGained).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">New Haters:</span>
              <span className="font-bold text-red-400">{result.hatorsGained.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Earnings:</span>
              <span className="font-bold text-yellow-400">${result.moneyGained.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-700">
              <span className="text-zinc-400">Energy Used:</span>
              <span className="font-bold">-30%</span>
            </div>
          </div>
        </motion.div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl uppercase tracking-wider text-lg transition-all transform hover:scale-105 active:scale-95"
        >
          Return to Dashboard →
        </button>
      </motion.div>
    </div>
  );
};

export default PerformanceShow;
