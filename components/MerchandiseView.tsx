import React, { useState } from 'react';
import { SaveData, MerchandiseItem } from '../types';
import { ShoppingCart, Plus, TrendingUp, DollarSign, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface MerchandiseViewProps {
  save: SaveData;
  onCreateMerch?: (item: MerchandiseItem) => void;
  onProduceStock?: (itemId: string, quantity: number) => void;
}

const MerchandiseView: React.FC<MerchandiseViewProps> = ({ save, onCreateMerch, onProduceStock }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'tshirt' as const,
    price: 30,
    productionCost: 10,
    quality: 75,
    initialStock: 100
  });

  const MERCH_TYPES = [
    { id: 'tshirt', name: 'T-Shirt', icon: '👕' },
    { id: 'hoodie', name: 'Hoodie', icon: '🧥' },
    { id: 'cap', name: 'Cap', icon: '🧢' },
    { id: 'poster', name: 'Poster', icon: '🎨' },
    { id: 'vinyl', name: 'Vinyl', icon: '💿' },
    { id: 'mug', name: 'Mug', icon: '☕' }
  ];

  const handleCreate = () => {
    if (!formData.name) return;
    
    const newItem: MerchandiseItem = {
      id: `merch-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      price: formData.price,
      productionCost: formData.productionCost,
      quality: formData.quality,
      stock: formData.initialStock,
      unitsSoldThisWeek: 0,
      totalUnitsSold: 0,
      createdWeek: save.week,
      hypeMultiplier: 1.0
    };

    onCreateMerch?.(newItem);
    setFormData({ name: '', type: 'tshirt', price: 30, productionCost: 10, quality: 75, initialStock: 100 });
    setShowCreateForm(false);
  };

  const totalMerchRevenue = save.merchandise.reduce((sum, item) => {
    return sum + (item.unitsSoldThisWeek * (item.price - item.productionCost));
  }, 0);

  const totalMerchStock = save.merchandise.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="space-y-12">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-pink-900/30 to-orange-900/30 border border-pink-600 rounded-[3rem] p-10">
        <h1 className="text-5xl font-black mb-4">🛍️ Merchandise Store</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-zinc-900/50 p-6 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">Active Items</p>
            <p className="text-3xl font-black text-pink-300">{save.merchandise.length}</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">Total Stock</p>
            <p className="text-3xl font-black text-blue-300">{totalMerchStock.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">This Week Revenue</p>
            <p className="text-3xl font-black text-green-300">${totalMerchRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-2">Total Earnings</p>
            <p className="text-3xl font-black text-yellow-300">${save.totalMerchRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      {/* Create New Merch */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white py-6 rounded-2xl font-black uppercase tracking-wider text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={24} />
          Create New Merchandise
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-900/20 to-orange-900/20 border border-pink-600/30 rounded-[2.5rem] p-10"
        >
          <h2 className="text-2xl font-black mb-8">Design Your Merch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl outline-none focus:ring-2 ring-pink-500 font-bold"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl outline-none focus:ring-2 ring-pink-500 font-bold"
            >
              {MERCH_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <div>
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Price: ${formData.price}</label>
              <input
                type="range"
                min="5"
                max="200"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Production Cost: ${formData.productionCost} (Profit: ${formData.price - formData.productionCost}/unit)</label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.productionCost}
                onChange={(e) => setFormData({ ...formData, productionCost: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Quality: {formData.quality}%</label>
              <input
                type="range"
                min="30"
                max="100"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Initial Stock: {formData.initialStock}</label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white py-4 rounded-2xl font-black uppercase tracking-wider transition-all"
            >
              Create Merch
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-black uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Merchandise Items */}
      {save.merchandise.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">Your Merchandise</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {save.merchandise.map((item) => {
              const profit = item.price - item.productionCost;
              const weekProfit = item.unitsSoldThisWeek * profit;
              const typeInfo = MERCH_TYPES.find(t => t.id === item.type);

              return (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-pink-600 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{typeInfo?.icon}</span>
                      <div>
                        <h3 className="text-2xl font-black">{item.name}</h3>
                        <p className="text-[10px] text-zinc-500 uppercase font-black">Quality: {item.quality}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-zinc-800 mb-6"></div>

                  {/* Price Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-black mb-1">Sale Price</p>
                      <p className="text-xl font-black text-pink-300">${item.price}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-black mb-1">Profit per Unit</p>
                      <p className="text-xl font-black text-green-300">${profit}</p>
                    </div>
                  </div>

                  {/* Sales This Week */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Units Sold This Week</span>
                      <span className="text-lg font-black text-purple-300">{item.unitsSoldThisWeek}</span>
                    </div>
                    <p className="text-xs text-green-400 font-bold">
                      Weekly Revenue: ${weekProfit.toLocaleString()}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Stock Remaining</span>
                      <span className="text-lg font-black text-blue-300">{item.stock}</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (item.stock / 500) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Total Sold</p>
                      <p className="font-black text-lg">{item.totalUnitsSold}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Created Week</p>
                      <p className="font-black text-lg">W{item.createdWeek}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {save.merchandise.length === 0 && !showCreateForm && (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[2rem]">
          <ShoppingCart size={64} className="text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-600 italic text-lg">No merchandise yet. Create your first item!</p>
        </div>
      )}
    </div>
  );
};

export default MerchandiseView;
