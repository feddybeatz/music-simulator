import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ShoppingCart, Lock, Check } from 'lucide-react';
import { SaveData } from '../types';
import { ACHIEVEMENTS, SHOP_ITEMS } from '../constants';

interface AchievementsShopProps {
  save: SaveData;
  onPurchase?: (itemId: string) => void;
}

const AchievementsShop: React.FC<AchievementsShopProps> = ({ save, onPurchase }) => {
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'shop'>('achievements');

  // Calculate achievement progress
  const getAchievementProgress = (achievementId: string) => {
    const achievement = save.achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    switch (achievement.metric) {
      case 'sales':
        return save.catalog.reduce((sum, s) => sum + s.totalSales, 0);
      case 'streams':
        return save.catalog.reduce((sum, s) => sum + (s.totalStreams['all'] || 0), 0);
      case 'chartPositions':
        return save.catalog.filter(s => s.chartPositions && s.chartPositions.length > 0).length;
      case 'awards':
        return save.awards.length;
      case 'fans':
        return save.fans;
      case 'playstyles':
        return 0; // TODO: Implement genre tracking
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-500" size={40} />
            Achievements & Shop
          </h1>
          <p className="text-zinc-400">Unlock rewards and customize your experience</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedTab('achievements')}
            className={`px-6 py-3 rounded-lg font-bold uppercase transition-all ${
              selectedTab === 'achievements'
                ? 'bg-yellow-600 text-white border border-yellow-500'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-yellow-600'
            }`}
          >
            🏆 Achievements
          </button>
          <button
            onClick={() => setSelectedTab('shop')}
            className={`px-6 py-3 rounded-lg font-bold uppercase transition-all ${
              selectedTab === 'shop'
                ? 'bg-green-600 text-white border border-green-500'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-green-600'
            }`}
          >
            🛍️ Shop
          </button>
        </div>

        {/* ACHIEVEMENTS TAB */}
        {selectedTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {save.achievements.map((achievement, idx) => {
              const progress = getAchievementProgress(achievement.id);
              const percentage = Math.min(100, (progress / achievement.threshold) * 100);
              const isEarned = achievement.earned || progress >= achievement.threshold;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative rounded-2xl border overflow-hidden transition-all transform hover:scale-105 ${
                    isEarned
                      ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 border-yellow-600'
                      : 'bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 border-zinc-700'
                  }`}
                >
                  {/* Background glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{
                      background: isEarned
                        ? 'radial-gradient(circle, #FCD34D 0%, transparent 100%)'
                        : 'radial-gradient(circle, #6B7280 0%, transparent 100%)'
                    }}
                  />

                  <div className="relative p-6">
                    {/* Icon & Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{achievement.icon}</div>
                      {isEarned ? (
                        <div className="bg-green-600 rounded-full p-2">
                          <Check size={20} className="text-white" />
                        </div>
                      ) : (
                        <div className="bg-zinc-700 rounded-full p-2">
                          <Lock size={20} className="text-zinc-400" />
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className={`text-lg font-black mb-2 ${isEarned ? 'text-yellow-300' : 'text-zinc-300'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">{achievement.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-zinc-400">{achievement.metric}</span>
                        <span className={`font-bold ${isEarned ? 'text-green-400' : 'text-zinc-400'}`}>
                          {progress.toLocaleString()} / {achievement.threshold.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            isEarned
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                              : 'bg-gradient-to-r from-blue-600 to-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Completion Percentage */}
                    <p className="text-xs text-zinc-500 text-right">
                      {Math.floor(percentage)}% complete
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* SHOP TAB */}
        {selectedTab === 'shop' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Budget */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm uppercase tracking-wider">Available Funds</p>
                  <p className="text-4xl font-black text-green-300">${save.funds.toLocaleString()}</p>
                </div>
                <ShoppingCart size={48} className="text-green-500" />
              </div>
            </motion.div>

            {/* Shop Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {save.shopItems.map((item, idx) => {
                const canAfford = save.funds >= item.price;
                const alreadyOwned = item.owned;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative rounded-2xl border overflow-hidden transition-all transform hover:scale-105 ${
                      alreadyOwned
                        ? 'bg-gradient-to-br from-green-900/30 to-green-950/30 border-green-600'
                        : canAfford
                        ? 'bg-gradient-to-br from-violet-900/30 to-violet-950/30 border-violet-600'
                        : 'bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 border-zinc-700 opacity-75'
                    }`}
                  >
                    <div className="relative p-6">
                      {/* Type Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          item.type === 'character' ? 'bg-blue-900/50 text-blue-300' :
                          item.type === 'cosmetic' ? 'bg-pink-900/50 text-pink-300' :
                          item.type === 'pass' ? 'bg-purple-900/50 text-purple-300' :
                          'bg-green-900/50 text-green-300'
                        }`}>
                          {item.type}
                        </span>
                        {alreadyOwned && (
                          <span className="text-lg">✅</span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-black mb-2">{item.name}</h3>
                      <p className="text-sm text-zinc-400 mb-4">{item.description}</p>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-t border-zinc-700/50">
                        <span className="text-2xl font-black text-green-400">${item.price.toLocaleString()}</span>
                      </div>

                      {/* Button */}
                      <button
                        onClick={() => !alreadyOwned && canAfford && onPurchase?.(item.id)}
                        disabled={alreadyOwned || !canAfford}
                        className={`w-full py-2 rounded-lg font-bold uppercase text-sm transition-all transform hover:scale-105 disabled:hover:scale-100 ${
                          alreadyOwned
                            ? 'bg-green-900/50 text-green-300 border border-green-600 cursor-default'
                            : canAfford
                            ? 'bg-violet-600 text-white border border-violet-500 hover:bg-violet-700'
                            : 'bg-zinc-700 text-zinc-400 border border-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        {alreadyOwned
                          ? '✓ OWNED'
                          : canAfford
                          ? `🛒 BUY`
                          : `💸 NEED $${(item.price - save.funds).toLocaleString()}`
                        }
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AchievementsShop;
