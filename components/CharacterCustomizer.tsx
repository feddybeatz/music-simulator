import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Smile, TrendingUp } from 'lucide-react';
import { SaveData, CharacterCustomization } from '../types';

interface CharacterCustomizerProps {
  character: CharacterCustomization;
  onUpdate?: (character: CharacterCustomization) => void;
}

const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({ character, onUpdate }) => {
  const [customization, setCustomization] = useState<CharacterCustomization>(character);
  const [selectedCategory, setSelectedCategory] = useState<'hair' | 'body' | 'outfit'>('hair');

  const handleChange = (key: keyof CharacterCustomization, value: any) => {
    const updated = { ...customization, [key]: value };
    setCustomization(updated);
    onUpdate?.(updated);
  };

  const HAIR_STYLES = ['short', 'medium', 'long', 'curly', 'wavy', 'spiky'];
  const BODY_TYPES = ['athletic', 'lean', 'muscular', 'curvy', 'petite'];
  const GENDERS = ['Male', 'Female', 'Other'];
  const SKIN_MATERIALS = ['smooth', 'textured', 'glowing', 'matte'];
  const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Purple', value: '#9933FF' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Pink', value: '#FF69B4' },
    { name: 'Cyan', value: '#00FFFF' },
    { name: 'Orange', value: '#FF8800' },
    { name: 'Silver', value: '#C0C0C0' },
    { name: 'Brown', value: '#8B4513' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Palette className="text-violet-500" size={40} />
            Customize Your Artist
          </h1>
          <p className="text-zinc-400">Create your unique look and stand out on the charts</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Preview Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1 bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-700 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px]"
          >
            <div className="text-center">
              <Smile size={120} className="text-violet-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black mb-2">{customization.gender}</h3>
              <div className="space-y-1 text-sm text-zinc-400">
                <p>Hair: {customization.hair}</p>
                <p>Body: {customization.bodyType}</p>
                <p>Material: {customization.skinMaterial}</p>
              </div>
              <p className="text-xs text-zinc-500 mt-4 italic">(3D preview coming soon)</p>
            </div>
          </motion.div>

          {/* Customization Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6">
              {(['hair', 'body', 'outfit'] as const).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-violet-600 text-white border border-violet-400'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-violet-600'
                  }`}
                >
                  {category === 'hair' && '💇'} {category === 'body' && '💪'} {category === 'outfit' && '👔'} {category}
                </button>
              ))}
            </div>

            {/* Hair Customization */}
            {selectedCategory === 'hair' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Hair Style</label>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {HAIR_STYLES.map(style => (
                      <button
                        key={style}
                        onClick={() => handleChange('hair', style)}
                        className={`p-3 rounded-lg font-bold transition-all ${
                          customization.hair === style
                            ? 'bg-violet-600 text-white border-2 border-violet-400'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-violet-500'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Hair Color</label>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => handleChange('hairColor', color.value)}
                        className={`p-1 rounded-lg border-2 transition-all transform hover:scale-110 ${
                          customization.hairColor === color.value
                            ? 'border-white shadow-lg shadow-white'
                            : 'border-transparent'
                        }`}
                        title={color.name}
                      >
                        <div
                          className="w-full h-10 rounded"
                          style={{ backgroundColor: color.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Eyes</label>
                  <input
                    type="text"
                    value={customization.eyes}
                    onChange={(e) => handleChange('eyes', e.target.value)}
                    className="w-full mt-2 bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg focus:border-violet-500 focus:outline-none"
                    placeholder="e.g., brown, blue, green"
                  />
                </div>
              </motion.div>
            )}

            {/* Body Customization */}
            {selectedCategory === 'body' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Gender</label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {GENDERS.map(gender => (
                      <button
                        key={gender}
                        onClick={() => handleChange('gender', gender as any)}
                        className={`p-3 rounded-lg font-bold transition-all ${
                          customization.gender === gender
                            ? 'bg-violet-600 text-white border-2 border-violet-400'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-violet-500'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Body Type</label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {BODY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => handleChange('bodyType', type)}
                        className={`p-3 rounded-lg font-bold transition-all ${
                          customization.bodyType === type
                            ? 'bg-violet-600 text-white border-2 border-violet-400'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-violet-500'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Skin Material</label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {SKIN_MATERIALS.map(material => (
                      <button
                        key={material}
                        onClick={() => handleChange('skinMaterial', material)}
                        className={`p-3 rounded-lg font-bold transition-all ${
                          customization.skinMaterial === material
                            ? 'bg-violet-600 text-white border-2 border-violet-400'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-violet-500'
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Outfit Customization */}
            {selectedCategory === 'outfit' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Top Color</label>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {COLORS.map(color => (
                      <button
                        key={`top-${color.value}`}
                        onClick={() => handleChange('topColor', color.value)}
                        className={`p-1 rounded-lg border-2 transition-all transform hover:scale-110 ${
                          customization.topColor === color.value
                            ? 'border-white shadow-lg shadow-white'
                            : 'border-transparent'
                        }`}
                        title={color.name}
                      >
                        <div
                          className="w-full h-10 rounded"
                          style={{ backgroundColor: color.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Bottom Color</label>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {COLORS.map(color => (
                      <button
                        key={`bottom-${color.value}`}
                        onClick={() => handleChange('bottomColor', color.value)}
                        className={`p-1 rounded-lg border-2 transition-all transform hover:scale-110 ${
                          customization.bottomColor === color.value
                            ? 'border-white shadow-lg shadow-white'
                            : 'border-transparent'
                        }`}
                        title={color.name}
                      >
                        <div
                          className="w-full h-10 rounded"
                          style={{ backgroundColor: color.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Bottom Material</label>
                  <select
                    value={customization.bottomMat}
                    onChange={(e) => handleChange('bottomMat', e.target.value)}
                    className="w-full mt-3 bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg focus:border-violet-500 focus:outline-none"
                  >
                    <option>fabric</option>
                    <option>leather</option>
                    <option>denim</option>
                    <option>silk</option>
                  </select>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Usage Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-sm text-blue-200"
        >
          💡 Your character appearance will be displayed on playlist covers when your song charts!
        </motion.div>
      </div>
    </div>
  );
};

export default CharacterCustomizer;
