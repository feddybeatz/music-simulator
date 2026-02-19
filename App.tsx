
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Globe, Trophy,
  Wallet, Music, Play, Activity, Star, Heart,
  Smile, Zap, LogOut, Trash2, Plus, ShoppingCart, TrendingUp, Menu, X, Copy, Check
} from 'lucide-react';
import { SaveData, View, Genre, Region, Song } from './types';
import { INITIAL_SAVE, CAREER_STAGES, REGIONS, GENRES } from './constants';
import { simulateWeek, getAllChartsWithAI } from './services/gameEngine';
import PlaylistsView from './components/PlaylistsView';
import AchievementsShop from './components/AchievementsShop';
import PerformanceShow from './components/PerformanceShow';
import StreamingView from './components/StreamingView';
import MerchandiseView from './components/MerchandiseView';

// --- Artist Code Generator ---
function generateArtistCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
  const rand = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4).padEnd(4, '0');
  return `${prefix}-${rand()}-${rand()}`;
}

// --- Song Write Dialog ---
const WriteSongDialog = ({ creativity, onWrite, onClose }: { creativity: number; onWrite: (title: string, genre: Genre) => void; onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<Genre>(Genre.POP);
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-violet-600/40 rounded-3xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-black mb-2">✍️ Write New Song</h2>
        <p className="text-zinc-500 text-sm mb-8">Creativity: <span className="text-violet-400 font-bold">{creativity}%</span> — affects quality</p>
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Song Title</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Neon Dreams"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl outline-none focus:ring-2 ring-violet-500 font-bold"
              onKeyDown={e => e.key === 'Enter' && title && onWrite(title, genre)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Genre</label>
            <select
              value={genre}
              onChange={e => setGenre(e.target.value as Genre)}
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl outline-none focus:ring-2 ring-violet-500 font-bold"
            >
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => title && onWrite(title, genre)}
              disabled={!title}
              className="flex-1 bg-violet-600 disabled:opacity-40 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-violet-500 transition-all"
            >Write Song</button>
            <button onClick={onClose} className="flex-1 bg-zinc-800 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Code reveal on first create ---
const CodeRevealDialog = ({ code, name, onClose }: { code: string; name: string; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); };
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-violet-600 rounded-3xl p-12 w-full max-w-lg text-center">
        <div className="text-6xl mb-6">🎤</div>
        <h2 className="text-3xl font-black mb-2">Welcome, {name}!</h2>
        <p className="text-zinc-400 mb-8">Save your Artist Code — you'll need it to log back in.</p>
        <div className="bg-black border border-violet-500 rounded-2xl p-6 mb-8">
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">Your Artist Code</p>
          <p className="text-4xl font-black font-mono tracking-widest text-white">{code}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">
            {copied ? <><Check size={16} className="text-green-400" /> Copied!</> : <><Copy size={16} /> Copy Code</>}
          </button>
          <button onClick={onClose} className="flex-1 bg-violet-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-violet-500 transition-all">Start Career →</button>
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [saves, setSaves] = useState<SaveData[]>(() => {
    const stored = localStorage.getItem('ms_online_saves');
    if (!stored) return [];
    return JSON.parse(stored).map((s: any) => ({
      ...s,
      currentTrends: s.currentTrends || [],
      aiArtists: s.aiArtists || [],
      lastAutoWriteWeek: s.lastAutoWriteWeek || 0,
      artistCode: s.artistCode || generateArtistCode(s.artistName || 'ART')
    }));
  });
  const [currentSave, setCurrentSave] = useState<SaveData | null>(null);
  const [view, setView] = useState<View>(View.LOGIN);
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState<Region>(Region.USA);
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newArtistCode, setNewArtistCode] = useState('');
  const [showCodeReveal, setShowCodeReveal] = useState(false);
  const [writeSongOpen, setWriteSongOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ms_online_saves', JSON.stringify(saves));
  }, [saves]);

  // Auto-login from localStorage
  useEffect(() => {
    const lastCode = localStorage.getItem('ms_last_code');
    if (lastCode) {
      const found = saves.find(s => s.artistCode === lastCode);
      if (found) { setCurrentSave(found); setView(View.DASHBOARD); }
    }
  }, []);

  const handleCreateSave = () => {
    if (!newName.trim()) return;
    const code = generateArtistCode(newName);
    const save: SaveData = { ...INITIAL_SAVE(newName.trim(), newRegion), artistCode: code } as any;
    setSaves(prev => [...prev, save]);
    setNewArtistCode(code);
    setShowCodeReveal(true);
    setCurrentSave(save);
    localStorage.setItem('ms_last_code', code);
  };

  const handleCodeLogin = () => {
    const found = saves.find(s => s.artistCode === loginCode.trim().toUpperCase());
    if (!found) { setLoginError('Code not found. Check and try again.'); return; }
    setCurrentSave({ ...found, currentTrends: found.currentTrends || [], aiArtists: found.aiArtists || [], lastAutoWriteWeek: found.lastAutoWriteWeek || 0 });
    setView(View.DASHBOARD);
    localStorage.setItem('ms_last_code', found.artistCode!);
    setLoginError('');
  };

  const deleteSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaves(prev => prev.filter(s => s.id !== id));
    if (currentSave?.id === id) { setCurrentSave(null); setView(View.LOGIN); }
  };

  const persistSave = (updated: SaveData) => {
    setCurrentSave(updated);
    setSaves(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleAdvanceWeek = () => {
    if (!currentSave) return;
    persistSave(simulateWeek(currentSave));
  };

  const handleRelease = (id: string) => {
    if (!currentSave) return;
    if (currentSave.funds < 2000) { alert('You need $2,000 to release a single!'); return; }
    const next = { ...currentSave };
    const idx = next.catalog.findIndex(s => s.id === id);
    if (idx === -1) return;
    next.catalog[idx] = { ...next.catalog[idx], isReleased: true, releaseWeek: next.week, releaseYear: next.year, artistName: next.artistName, isUser: true, lastWeekSales: 0 };
    next.funds -= 2000;
    next.xp += 200;
    persistSave(simulateWeek(next));
  };

  const handleActivity = (type: 'relax' | 'practice' | 'write' | 'record' | 'tour' | 'holiday') => {
    if (!currentSave) return;
    if (currentSave.stats.energy < 20) { alert('Too tired! Advance a week or relax first.'); return; }
    if (type === 'write') { setWriteSongOpen(true); return; }
    let next = { ...currentSave, stats: { ...currentSave.stats, energy: currentSave.stats.energy - 20 } };
    if (type === 'relax') {
      next.stats.health = Math.min(100, next.stats.health + 15);
      next.stats.happiness = Math.min(100, next.stats.happiness + 20);
    } else if (type === 'practice') {
      next.stats.creativity = Math.min(100, next.stats.creativity + 8);
      next.xp += 100;
    } else if (type === 'record') {
      const unreleased = next.catalog.filter(s => !s.isReleased);
      if (unreleased.length === 0) { alert('No songs to record! Write a song first.'); return; }
      const song = unreleased[unreleased.length - 1];
      next.catalog = next.catalog.map(s => s.id === song.id ? { ...s, quality: Math.min(100, s.quality + 10) } : s);
      next.xp += 150;
    } else if (type === 'tour') {
      const bonus = 1000 + Math.floor(next.fans * 0.05 + Math.random() * 2000);
      next.fans += Math.floor(next.fans * 0.1 + 500);
      next.funds += bonus;
      next.stats.health = Math.max(0, next.stats.health - 10);
      next.xp += 300;
    } else if (type === 'holiday') {
      if (next.funds < 5000) { alert('You need $5,000 for a holiday!'); return; }
      next.funds -= 5000;
      next.stats.happiness = Math.min(100, next.stats.happiness + 40);
      next.stats.health = Math.min(100, next.stats.health + 20);
      next.stats.energy = 100;
    }
    persistSave(simulateWeek(next));
  };

  const handleWriteSong = (title: string, genre: Genre) => {
    if (!currentSave) return;
    setWriteSongOpen(false);
    const q = Math.floor(currentSave.stats.creativity * 0.8 + Math.random() * 20);
    const newSong: Song = {
      id: `s-${Date.now()}`, title, genre, quality: Math.min(100, q),
      trendScore: Math.floor(Math.random() * 100), isReleased: false,
      totalStreams: {}, totalSales: 0,
      artwork: `https://picsum.photos/seed/${Math.random().toFixed(6)}/200/200`,
      viral_score: 0, is_viral: false, viral_level: null,
      viral_start_week: undefined, viral_remaining_weeks: 0, viral_total_weeks: 0, viral_peak_streams: 0
    };
    const next = { ...currentSave, stats: { ...currentSave.stats, energy: currentSave.stats.energy - 20 }, catalog: [...currentSave.catalog, newSong] };
    persistSave(simulateWeek(next));
  };

  if (view !== View.LOGIN && !currentSave) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center p-10 bg-zinc-900 rounded-3xl border border-zinc-800">
          <p className="text-zinc-400 mb-6">Session lost.</p>
          <button onClick={() => setView(View.LOGIN)} className="bg-violet-600 px-8 py-3 rounded-full font-black uppercase text-xs">Back to Login</button>
        </div>
      </div>
    );
  }

  if (view === View.LOGIN) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
        {showCodeReveal && newArtistCode && currentSave && (
          <CodeRevealDialog
            code={newArtistCode} name={currentSave.artistName}
            onClose={() => { setShowCodeReveal(false); setView(View.DASHBOARD); }}
          />
        )}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-6xl font-black italic tracking-tighter neon-text">MUSIC MOGUL</h1>
          <p className="text-violet-500 font-mono tracking-[0.5em] text-xs mt-4">CAREER SIMULATOR</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl w-full">
          {/* Create */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] backdrop-blur-xl">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Plus className="text-violet-500" size={20} />Create Artist</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Stage Name" className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl outline-none focus:ring-2 ring-violet-500 font-bold" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateSave()} />
              <select className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl outline-none font-bold" value={newRegion} onChange={e => setNewRegion(e.target.value as Region)}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={handleCreateSave} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 rounded-xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-violet-500/20">START CAREER</button>
            </div>
          </section>
          {/* Code Login */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] backdrop-blur-xl">
            <h2 className="text-xl font-black mb-6">🔑 Artist Code Login</h2>
            <div className="space-y-4">
              <input type="text" placeholder="FED-7K92-XPL4" className="w-full bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl outline-none focus:ring-2 ring-violet-500 font-mono font-bold uppercase tracking-widest" value={loginCode} onChange={e => { setLoginCode(e.target.value); setLoginError(''); }} onKeyDown={e => e.key === 'Enter' && handleCodeLogin()} />
              {loginError && <p className="text-red-400 text-xs font-bold">{loginError}</p>}
              <button onClick={handleCodeLogin} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-4 rounded-xl font-black hover:scale-[1.02] active:scale-95 transition-all">LOGIN</button>
              <p className="text-[10px] text-zinc-600 text-center">Enter your unique artist code to continue your career</p>
            </div>
          </section>
          {/* Saved artists */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem]">
            <h2 className="text-xl font-black mb-6">Saved Artists</h2>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {saves.length === 0 ? <div className="text-zinc-600 italic text-center py-10">No artists yet...</div> : saves.map(s => (
                <div key={s.id} onClick={() => { setCurrentSave(s); setView(View.DASHBOARD); localStorage.setItem('ms_last_code', s.artistCode || ''); }} className="group flex items-center justify-between p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl hover:border-violet-500 transition-all cursor-pointer">
                  <div>
                    <p className="font-black group-hover:text-violet-400 transition-colors">{s.artistName}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{s.artistCode || '—'}</p>
                  </div>
                  <button onClick={(e) => deleteSave(s.id, e)} className="p-1.5 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const save = currentSave!;

  const navItems = [
    { view: View.DASHBOARD, icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { view: View.ACTIVITIES, icon: <Activity size={18} />, label: 'Activities' },
    { view: View.PLAYLISTS, icon: <Music size={18} />, label: 'Playlists' },
    { view: View.RHYTHM_GAME, icon: <Play size={18} />, label: 'Perform' },
    { view: View.RELEASES, icon: <Music size={18} />, label: 'My Catalog' },
    { view: View.STREAMING, icon: <TrendingUp size={18} />, label: 'Streaming' },
    { view: View.SHOP, icon: <ShoppingCart size={18} />, label: 'Merchandise' },
    { view: View.PROFILE, icon: <Users size={18} />, label: 'Profile' },
    { view: View.WORLD, icon: <Globe size={18} />, label: 'Charts' },
    { view: View.BANK, icon: <Wallet size={18} />, label: 'Finance' },
    { view: View.AWARDS, icon: <Trophy size={18} />, label: 'Achievements' },
  ];

  const handleNav = (v: View) => { setView(v); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 flex overflow-hidden font-sans">
      {writeSongOpen && <WriteSongDialog creativity={save.stats.creativity} onWrite={handleWriteSong} onClose={() => setWriteSongOpen(false)} />}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen shrink-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-zinc-900 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-xs font-black">MM</div>
          <div>
            <h1 className="text-sm font-black tracking-tight">MUSIC MOGUL</h1>
            <p className="text-[9px] text-zinc-600 font-mono">{(save as any).artistCode || '—'}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(n => (
            <button key={n.view} onClick={() => handleNav(n.view)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${view === n.view ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
              {n.icon}
              <span className="text-xs font-black uppercase tracking-widest">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-zinc-900">
          <button onClick={() => { setCurrentSave(null); setView(View.LOGIN); localStorage.removeItem('ms_last_code'); }} className="flex items-center gap-3 text-zinc-500 hover:text-white font-bold transition-colors w-full text-xs uppercase">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header */}
        <header className="h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 px-4 lg:px-8 flex items-center justify-between z-20 sticky top-0 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(v => !v)} className="lg:hidden p-2 text-zinc-400 hover:text-white"><Menu size={20} /></button>
            <div className="flex gap-4 items-center overflow-x-auto">
              <StatHeader label="Funds" value={`$${save.funds.toLocaleString()}`} color="text-green-400" />
              <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
              <StatHeader label="Fans" value={save.fans.toLocaleString()} color="text-pink-400" />
              <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
              <StatHeader label="Energy" value={`${save.stats.energy}%`} color="text-yellow-400" />
              <div className="h-6 w-px bg-zinc-800 hidden lg:block" />
              <StatHeader label="XP" value={save.xp.toLocaleString()} color="text-violet-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-zinc-500 uppercase">Y{save.year} W{save.week}</p>
              <p className="text-xs font-black text-white">{CAREER_STAGES[save.careerLevel - 1]}</p>
            </div>
            <button onClick={handleAdvanceWeek} className="bg-white text-black px-5 py-2.5 rounded-full font-black text-xs uppercase hover:bg-violet-600 hover:text-white transition-all active:scale-95 shadow-lg whitespace-nowrap">NEXT WEEK ➔</button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#080808]">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
              {view === View.DASHBOARD && <DashboardView save={save} onNav={handleNav} />}
              {view === View.PLAYLISTS && <PlaylistsView save={save} />}
              {view === View.STREAMING && <StreamingView save={save} />}
              {view === View.SHOP && <MerchandiseView save={save} onCreateMerch={item => { const s = { ...save, merchandise: [...save.merchandise, item] }; persistSave(s); }} />}
              {view === View.AWARDS && <AchievementsShop save={save} onPurchase={itemId => { const item = save.shopItems.find(i => i.id === itemId); if (item && save.funds >= item.price) persistSave({ ...save, shopItems: save.shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i), funds: save.funds - item.price }); }} />}
              {view === View.ACTIVITIES && <ActivitiesView save={save} onAction={handleActivity} onNav={handleNav} />}
              {view === View.RELEASES && <CatalogView save={save} onRelease={handleRelease} />}
              {view === View.PROFILE && <ProfileView save={save} />}
              {view === View.BANK && <BankView save={save} onLoan={a => persistSave({ ...save, funds: save.funds + a, loan: save.loan + a })} onRepay={a => { const r = Math.min(a, save.funds, save.loan); persistSave({ ...save, funds: save.funds - r, loan: save.loan - r }); }} />}
              {view === View.RHYTHM_GAME && <PerformanceShow save={save} onComplete={(result: any) => { persistSave({ ...save, fans: save.fans + result.fansGained, funds: save.funds + result.moneyGained, xp: save.xp + Math.floor(result.fansGained * 0.5), stats: { ...save.stats, energy: Math.max(0, save.stats.energy - 30) } }); handleNav(View.DASHBOARD); }} />}
              {view === View.WORLD && <WorldCharts save={save} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
    {icon}<span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatHeader = ({ label, value, color }: any) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</span>
    <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>
  </div>
);

const DashboardView = ({ save, onNav }: any) => (
  <div className="space-y-8">
    <div className="bg-gradient-to-br from-zinc-900 to-black p-10 lg:p-16 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Star size={200} className="text-violet-500 rotate-12" /></div>
      <div className="relative z-10">
        <h2 className="text-5xl lg:text-8xl font-black tracking-tighter mb-4 italic neon-text">{save.artistName}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-6 py-2 bg-violet-600 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-600/30">LEVEL {save.careerLevel}</div>
          <div className="text-zinc-500 font-mono text-sm uppercase font-bold">{CAREER_STAGES[save.careerLevel - 1]}</div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatBox label="Energy" value={save.stats.energy} icon={<Zap size={20} />} color="yellow" />
      <StatBox label="Health" value={save.stats.health} icon={<Heart size={20} />} color="red" />
      <StatBox label="Happiness" value={save.stats.happiness} icon={<Smile size={20} />} color="pink" />
      <StatBox label="Creativity" value={save.stats.creativity} icon={<Activity size={20} />} color="blue" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8">
        <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-black italic">TOP RELEASES</h3><button onClick={() => onNav(View.RELEASES)} className="text-violet-500 text-xs font-black uppercase hover:underline">View All</button></div>
        <div className="space-y-3">
          {save.catalog.filter((s: any) => s.isReleased).slice(0, 3).map((song: any) => (
            <div key={song.id} className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-4">
                <img src={song.artwork} className="w-12 h-12 rounded-xl shadow-lg" alt="art" onError={e => (e.currentTarget.src = 'https://picsum.photos/seed/fallback/200/200')} />
                <div><p className="font-black">{song.title}</p><p className="text-[10px] text-zinc-500 font-black uppercase">{song.genre}</p></div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold">{((song.totalStreams?.all || 0) as number).toLocaleString()}</p>
                <p className="text-[9px] text-zinc-500">streams</p>
              </div>
            </div>
          ))}
          {save.catalog.filter((s: any) => s.isReleased).length === 0 && <div className="text-zinc-700 italic text-center py-12 border-2 border-dashed border-zinc-900 rounded-2xl">No music released yet...</div>}
        </div>
      </div>
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
        <Trophy size={56} className="text-yellow-500 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
        <h3 className="text-lg font-black mb-2 uppercase">CAREER GOAL</h3>
        <p className="text-zinc-500 text-xs mb-6 leading-relaxed">1 Million fans unlocks World Tour</p>
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mb-3"><div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (save.fans / 1000000) * 100)}%` }} /></div>
        <p className="text-[9px] font-black text-zinc-500 uppercase">{save.fans.toLocaleString()} / 1,000,000</p>
      </div>
    </div>
    {(save.currentTrends || []).filter((t: any) => t.startWeek <= save.week && t.endWeek >= save.week).length > 0 && (
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8">
        <h3 className="text-lg font-black italic mb-4">🔥 TRENDING THIS SEASON</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(save.currentTrends || []).filter((t: any) => t.startWeek <= save.week && t.endWeek >= save.week).slice(0, 3).map((trend: any) => (
            <div key={trend.id} className="bg-purple-900/20 border border-purple-600/30 rounded-2xl p-4">
              <p className="font-black text-purple-300 text-sm mb-1">{trend.name}</p>
              <p className="text-[10px] text-zinc-400 mb-2">{trend.genre}</p>
              <div className="w-full bg-zinc-800 rounded-full h-1.5"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${trend.strength}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const StatBox = ({ label, value, icon, color }: any) => {
  const colors: any = { yellow: 'text-yellow-400 bg-yellow-400/10', red: 'text-red-400 bg-red-400/10', pink: 'text-pink-400 bg-pink-400/10', blue: 'text-blue-400 bg-blue-400/10' };
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] flex flex-col justify-between hover:scale-[1.02] transition-all">
      <div className="flex justify-between items-start mb-4"><span className={`p-3 rounded-xl ${colors[color]}`}>{icon}</span><span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</span></div>
      <div><p className="text-2xl font-mono font-black mb-3">{value}%</p><div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className={`h-full ${colors[color].split(' ')[0]} transition-all duration-700`} style={{ width: `${value}%` }} /></div></div>
    </div>
  );
};

const ActivitiesView = ({ save, onAction, onNav }: any) => (
  <div className="max-w-4xl mx-auto space-y-10">
    <div className="text-center mb-12"><h2 className="text-5xl font-black italic tracking-tighter">STUDIO & STAGE</h2><p className="text-zinc-500 font-mono tracking-widest text-xs uppercase mt-2">Professional Activities</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <ActivityBtn icon="🧘" title="RELAX" desc="Restore health and happiness. +15 health, +20 happiness." color="from-green-600 to-emerald-600" onClick={() => onAction('relax')} />
      <ActivityBtn icon="🎹" title="PRACTICE" desc="Hone your skills. +8 creativity, +100 XP." color="from-blue-600 to-indigo-600" onClick={() => onAction('practice')} />
      <ActivityBtn icon="✍️" title="WRITE SONG" desc="Draft a new track. Opens song editor." color="from-violet-600 to-purple-600" onClick={() => onAction('write')} />
      <ActivityBtn icon="🎙️" title="RECORD" desc="Polish your latest draft. +10 quality to newest song." color="from-cyan-600 to-sky-600" onClick={() => onAction('record')} />
      <ActivityBtn icon="🎸" title="PERFORM SHOW" desc="Live performance. Builds fans & money." color="from-pink-600 to-rose-600" onClick={() => onNav(View.RHYTHM_GAME)} />
      <ActivityBtn icon="🚌" title="GO ON TOUR" desc="Regional tour. +fans, +money, -health." color="from-orange-600 to-amber-600" onClick={() => onAction('tour')} />
      <ActivityBtn icon="🏖️" title="HOLIDAY" desc="Take a break! Costs $5,000. Full energy restore." color="from-teal-600 to-cyan-600" onClick={() => onAction('holiday')} />
    </div>
  </div>
);

const ActivityBtn = ({ icon, title, desc, color, onClick }: any) => (
  <button onClick={onClick} className="text-left bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] hover:scale-[1.03] active:scale-95 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${color}`} />
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-black mb-1 uppercase tracking-tighter">{title}</h3>
    <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
  </button>
);

const CatalogView = ({ save, onRelease }: any) => (
  <div className="space-y-10">
    <h2 className="text-4xl font-black tracking-tighter uppercase italic">Music Catalog</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Drafts & Recordings</h3>
        {save.catalog.filter((s: any) => !s.isReleased).map((song: any) => (
          <div key={song.id} className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] flex items-center justify-between group">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🎧</div><div><p className="font-black">{song.title}</p><p className="text-[10px] text-zinc-600 font-black uppercase mt-1">Quality: {song.quality}% • {song.genre}</p></div></div>
            <button onClick={() => onRelease(song.id)} className="bg-violet-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-violet-500 transition-colors whitespace-nowrap">Release ($2k)</button>
          </div>
        ))}
        {save.catalog.filter((s: any) => !s.isReleased).length === 0 && <p className="text-zinc-800 italic text-center py-8">No unreleased work...</p>}
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Released</h3>
        {save.catalog.filter((s: any) => s.isReleased).map((song: any) => {
          const total = song.totalStreams?.all || 0;
          const cert = total >= 10000000 ? { label: '💎 DIAMOND', color: 'text-cyan-400' } : total >= 1000000 ? { label: '🪙 PLATINUM', color: 'text-zinc-300' } : total >= 500000 ? { label: '🥇 GOLD', color: 'text-yellow-400' } : null;
          return (
            <div key={song.id} className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] overflow-hidden relative">
              <div className="flex gap-4 mb-4">
                <img src={song.artwork} className="w-16 h-16 rounded-xl shadow-xl" alt="art" onError={e => (e.currentTarget.src = 'https://picsum.photos/seed/fallback/200/200')} />
                <div><p className="font-black text-xl">{song.title}</p><p className="text-xs text-violet-500 font-mono">Y{song.releaseYear} W{song.releaseWeek}</p>{cert && <p className={`text-xs font-black ${cert.color}`}>{cert.label}</p>}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center border-t border-zinc-900 pt-4">
                <div><p className="text-[9px] text-zinc-600 font-black uppercase">Sales</p><p className="font-mono font-bold text-sm">{song.totalSales.toLocaleString()}</p></div>
                <div><p className="text-[9px] text-zinc-600 font-black uppercase">Streams</p><p className="font-mono font-bold text-sm">{((total) as number).toLocaleString()}</p></div>
                <div><p className="text-[9px] text-zinc-600 font-black uppercase">Quality</p><p className="font-mono font-bold text-sm text-violet-400">{song.quality}%</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const ProfileView = ({ save }: any) => {
  const totalStreams = save.catalog.reduce((sum: number, s: any) => sum + (s.totalStreams?.all || 0), 0);
  const goldSongs = save.catalog.filter((s: any) => (s.totalStreams?.all || 0) >= 500000).length;
  const platSongs = save.catalog.filter((s: any) => (s.totalStreams?.all || 0) >= 1000000).length;
  const diamondSongs = save.catalog.filter((s: any) => (s.totalStreams?.all || 0) >= 10000000).length;
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col sm:flex-row items-start gap-10">
        <div className="w-40 h-40 bg-zinc-950 rounded-[3rem] border-4 border-violet-600 flex items-center justify-center text-7xl shadow-2xl shadow-violet-600/10">🎤</div>
        <div className="flex-1">
          <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter neon-text mb-4">{save.artistName}</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black uppercase">{save.homeRegion}</span>
            <span className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black uppercase">Level {save.careerLevel}</span>
            <span className="bg-violet-600/20 border border-violet-600/40 px-4 py-2 rounded-xl text-xs font-black uppercase text-violet-300">{CAREER_STAGES[save.careerLevel - 1]}</span>
          </div>
          {(save as any).artistCode && <p className="text-[10px] text-zinc-600 font-mono mt-3">Code: {(save as any).artistCode}</p>}
        </div>
      </div>
      {/* Certifications */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8">
        <h3 className="text-lg font-black uppercase mb-6">🏅 Certifications</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-6 rounded-2xl text-center border ${goldSongs > 0 ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-zinc-800 opacity-40'}`}>
            <p className="text-3xl mb-2">🥇</p><p className="font-black text-yellow-400">GOLD</p><p className="text-xs text-zinc-400 mt-1">500K streams</p><p className="text-xl font-black mt-2">{goldSongs}</p>
          </div>
          <div className={`p-6 rounded-2xl text-center border ${platSongs > 0 ? 'border-zinc-300/50 bg-zinc-300/10' : 'border-zinc-800 opacity-40'}`}>
            <p className="text-3xl mb-2">🪙</p><p className="font-black text-zinc-200">PLATINUM</p><p className="text-xs text-zinc-400 mt-1">1M streams</p><p className="text-xl font-black mt-2">{platSongs}</p>
          </div>
          <div className={`p-6 rounded-2xl text-center border ${diamondSongs > 0 ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-zinc-800 opacity-40'}`}>
            <p className="text-3xl mb-2">💎</p><p className="font-black text-cyan-400">DIAMOND</p><p className="text-xs text-zinc-400 mt-1">10M streams</p><p className="text-xl font-black mt-2">{diamondSongs}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.5em]">Regional Influence</h3>
          {REGIONS.map(r => (<div key={r}><div className="flex justify-between text-xs font-black uppercase mb-1"><span className="text-zinc-400">{r}</span><span>{(save.regionalPopularity[r] || 0).toFixed(1)}%</span></div><div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900"><div className="h-full bg-violet-600 transition-all" style={{ width: `${save.regionalPopularity[r] || 0}%` }} /></div></div>))}
        </div>
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] text-center">
          <Star size={40} className="text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-black mb-6 uppercase">Career Stats</h3>
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Total Streams</p><p className="text-lg font-mono font-black text-violet-400">{totalStreams.toLocaleString()}</p></div>
            <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Awards</p><p className="text-lg font-mono font-black text-violet-400">{save.awards.length}</p></div>
            <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">XP</p><p className="text-lg font-mono font-black text-violet-400">{save.xp.toLocaleString()}</p></div>
            <div><p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Subscribers</p><p className="text-lg font-mono font-black text-violet-400">{save.subscribers.toLocaleString()}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BankView = ({ save, onLoan, onRepay }: any) => (
  <div className="max-w-2xl mx-auto py-12">
    <div className="bg-zinc-950 border border-zinc-900 p-12 rounded-[3rem] text-center shadow-2xl">
      <h2 className="text-4xl font-black mb-1 italic tracking-tighter">CITY FINANCE</h2>
      <p className="text-zinc-600 mb-10 uppercase font-black text-xs tracking-widest">Artist Capital & Credit</p>
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800"><p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Funds</p><p className="text-3xl font-mono font-black text-green-400">${save.funds.toLocaleString()}</p></div>
        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800"><p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Active Loan</p><p className={`text-3xl font-mono font-black ${save.loan > 0 ? 'text-red-500' : 'text-zinc-700'}`}>${save.loan.toLocaleString()}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <BankBtn label="Borrow $2,000" onClick={() => onLoan(2000)} />
        <BankBtn label="Borrow $10,000" onClick={() => onLoan(10000)} />
        <BankBtn label="Repay $1,000" color="bg-violet-600" onClick={() => onRepay(1000)} />
        <BankBtn label="Repay All" color="bg-violet-600" onClick={() => onRepay(save.loan)} />
      </div>
      <p className="mt-6 text-[9px] text-zinc-700 font-black uppercase tracking-widest">Weekly loan interest: 3%</p>
    </div>
  </div>
);

const BankBtn = ({ label, onClick, color = 'bg-zinc-900' }: any) => (
  <button onClick={onClick} className={`${color} py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all border border-zinc-800/50`}>{label}</button>
);

const WorldCharts = ({ save }: any) => {
  const chartsData = getAllChartsWithAI(save);
  const trendingNow = (save.currentTrends || []).filter((t: any) => t.startWeek <= save.week && t.endWeek >= save.week).slice(0, 3);
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Global Billboard</h2>
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">Year {save.year} · Week {save.week}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/20 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Top 100 Singles</h3>
            <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] text-zinc-600 font-black uppercase">Stream Ranked</span></div>
          </div>
          <div className="divide-y divide-zinc-900 max-h-[700px] overflow-y-auto">
            {chartsData.length > 0 ? chartsData.slice(0, 50).map((data: any, i: number) => (
              <div key={`${data.song.id}-${i}`} className="p-5 flex items-center gap-5 hover:bg-zinc-900/30 transition-colors">
                <span className="w-8 text-2xl font-black italic text-zinc-800 shrink-0">#{i + 1}</span>
                <img src={data.song.artwork} className="w-14 h-14 rounded-xl shadow-lg shrink-0" alt="art" onError={e => (e.currentTarget.src = 'https://picsum.photos/seed/fallback/200/200')} />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black truncate">{data.song.title}</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase">{data.artistName} · {data.song.genre}</p>
                  <p className="text-[10px] text-zinc-600">{(data.totalStreams || 0).toLocaleString()} streams</p>
                </div>
                <p className={`font-black text-xs shrink-0 ${data.artistName === save.artistName ? 'text-green-400' : 'text-blue-400'}`}>{data.artistName === save.artistName ? '⭐ YOU' : '🤖 AI'}</p>
              </div>
            )) : <div className="p-24 text-center text-zinc-700 italic">No songs charting yet. Release music to compete!</div>}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          {trendingNow.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem]">
              <h4 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-5">🔥 Trending</h4>
              <div className="space-y-3">{trendingNow.map((trend: any) => (<div key={trend.id} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800"><p className="font-black text-purple-300 text-sm">{trend.name}</p><div className="flex justify-between items-center mt-2 text-[10px]"><span className="text-zinc-500">{trend.genre}</span><div className="w-16 bg-zinc-800 rounded-full h-1"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${trend.strength}%` }} /></div></div></div>))}</div>
            </div>
          )}
          <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-600/20 p-8 rounded-[2rem]">
            <Star className="text-violet-500 mb-4" size={28} />
            <h4 className="text-base font-black uppercase mb-2">Award Season</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">Global Music Awards are held at Week 52 each year. High-quality songs with massive streams earn nominations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
