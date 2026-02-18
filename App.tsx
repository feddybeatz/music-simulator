
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Mic2, Users, Globe, Trophy, 
  Wallet, Music, Play, Activity, Star, Heart, 
  Smile, Zap, LogOut, Trash2, Plus, Palette, ShoppingCart, TrendingUp
} from 'lucide-react';
import { 
  SaveData, View, Genre, Region, Song 
} from './types';
import { 
  INITIAL_SAVE, CAREER_STAGES, REGIONS 
} from './constants';
import { simulateWeek, getAllChartsWithAI } from './services/gameEngine';
import PlaylistsView from './components/PlaylistsView';
import AchievementsShop from './components/AchievementsShop';
import PerformanceShow from './components/PerformanceShow';
import StreamingView from './components/StreamingView';
import MerchandiseView from './components/MerchandiseView';

const App: React.FC = () => {
  const [saves, setSaves] = useState<SaveData[]>(() => {
    const stored = localStorage.getItem('ms_online_saves');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Fix old saves that don't have new properties
    return parsed.map((s: any) => ({
      ...s,
      currentTrends: s.currentTrends || [],
      aiArtists: s.aiArtists || [],
      lastAutoWriteWeek: s.lastAutoWriteWeek || 0
    }));
  });
  const [currentSave, setCurrentSave] = useState<SaveData | null>(null);
  const [view, setView] = useState<View>(View.LOGIN);
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState<Region>(Region.USA);

  useEffect(() => {
    localStorage.setItem('ms_online_saves', JSON.stringify(saves));
  }, [saves]);

  const handleCreateSave = () => {
    if (!newName) return;
    const save = INITIAL_SAVE(newName, newRegion);
    setSaves(prev => [...prev, save]);
    setCurrentSave(save);
    setView(View.DASHBOARD);
  };

  const handleSelectSave = (save: SaveData) => {
    // Fix old saves missing new properties
    const fixedSave = {
      ...save,
      currentTrends: save.currentTrends || [],
      aiArtists: save.aiArtists || [],
      lastAutoWriteWeek: save.lastAutoWriteWeek || 0
    };
    setCurrentSave(fixedSave);
    setView(View.DASHBOARD);
  };

  const deleteSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaves(prev => prev.filter(s => s.id !== id));
    if (currentSave?.id === id) {
      setCurrentSave(null);
      setView(View.LOGIN);
    }
  };

  const handleAdvanceWeek = () => {
    if (!currentSave) return;
    const updated = simulateWeek(currentSave);
    setCurrentSave(updated);
    setSaves(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleRelease = (id: string) => {
    if (!currentSave) return;
    if (currentSave.funds < 2000) {
      alert("You need $2,000 to release a single! (Recording + Marketing)");
      return;
    }

    const nextSave = { ...currentSave };
    const songIndex = nextSave.catalog.findIndex(s => s.id === id);
    if (songIndex === -1) return;

    nextSave.catalog[songIndex] = {
      ...nextSave.catalog[songIndex],
      isReleased: true,
      releaseWeek: nextSave.week,
      releaseYear: nextSave.year,
      artistName: nextSave.artistName,
      isUser: true,
      lastWeekSales: Math.floor(nextSave.catalog[songIndex].quality * 10)
    };
    nextSave.funds -= 2000;
    nextSave.xp += 200;

    const updated = simulateWeek(nextSave);
    setCurrentSave(updated);
    setSaves(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleActivity = (type: 'relax' | 'practice' | 'write') => {
    if (!currentSave || currentSave.stats.energy < 20) return alert("Too tired!");
    let nextSave = { ...currentSave };
    nextSave.stats.energy -= 20;

    if (type === 'relax') {
      nextSave.stats.health = Math.min(100, nextSave.stats.health + 15);
      nextSave.stats.happiness = Math.min(100, nextSave.stats.happiness + 20);
    } else if (type === 'practice') {
      nextSave.stats.creativity = Math.min(100, nextSave.stats.creativity + 8);
      nextSave.xp += 100;
    } else if (type === 'write') {
      const newSong: Song = {
        id: `s-${Date.now()}`,
        title: `Draft ${nextSave.catalog.length + 1}`,
        genre: Genre.POP,
        quality: Math.floor(nextSave.stats.creativity * 0.8 + Math.random() * 20),
        trendScore: Math.floor(Math.random() * 100),
        isReleased: false,
        totalStreams: { spotify: 0, apple: 0 },
        totalSales: 0,
        artwork: `https://picsum.photos/seed/${Math.random()}/200/200`,
        viral_score: 0,
        is_viral: false,
        viral_level: null,
        viral_start_week: undefined,
        viral_remaining_weeks: 0,
        viral_total_weeks: 0,
        viral_peak_streams: 0
      };
      nextSave.catalog.push(newSong);
    }
    const simulated = simulateWeek(nextSave);
    setCurrentSave(simulated);
    setSaves(prev => prev.map(s => s.id === simulated.id ? simulated : s));
  };

  if (view !== View.LOGIN && !currentSave) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="text-center p-10 bg-zinc-900 rounded-3xl border border-zinc-800">
          <p className="text-zinc-400 mb-6">Session lost or save unavailable.</p>
          <button onClick={() => setView(View.LOGIN)} className="bg-violet-600 px-8 py-3 rounded-full font-black uppercase text-xs">Return to Main Menu</button>
        </div>
      </div>
    );
  }

  if (view === View.LOGIN) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-7xl font-black italic tracking-tighter neon-text">MUSIC SUPERSTAR</h1>
          <p className="text-violet-500 font-mono tracking-[0.5em] text-xs mt-4">ONLINE CAREER SIMULATOR</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl w-full">
          <section className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2.5rem] backdrop-blur-xl">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Plus className="text-violet-500" /> CREATE ARTIST</h2>
            <div className="space-y-6">
              <input 
                type="text" placeholder="STAGE NAME"
                className="w-full bg-zinc-800/50 border border-zinc-700 p-5 rounded-2xl outline-none focus:ring-2 ring-violet-500 font-bold transition-all"
                value={newName} onChange={e => setNewName(e.target.value)}
              />
              <select 
                className="w-full bg-zinc-800/50 border border-zinc-700 p-5 rounded-2xl outline-none font-bold"
                value={newRegion} onChange={e => setNewRegion(e.target.value as Region)}
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button 
                onClick={handleCreateSave}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-5 rounded-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-violet-500/20"
              >
                START CAREER
              </button>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2.5rem] flex flex-col">
            <h2 className="text-2xl font-black mb-8">SELECT SAVE</h2>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2">
              {saves.length === 0 ? (
                <div className="text-zinc-600 italic text-center py-20">No artists found...</div>
              ) : (
                saves.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => handleSelectSave(s)}
                    className="group relative flex items-center justify-between p-6 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl hover:border-violet-500 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="relative z-10">
                      <p className="font-black text-xl group-hover:text-violet-400 transition-colors">{s.artistName}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Year {s.year} • {CAREER_STAGES[s.careerLevel-1]}</p>
                    </div>
                    <button onClick={(e) => deleteSave(s.id, e)} className="relative z-10 p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    <div className="absolute inset-0 bg-violet-600/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const save = currentSave!;

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 flex overflow-hidden font-sans">
      <aside className="w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen hidden lg:flex shrink-0">
        <div className="p-10 border-b border-zinc-900 mb-6">
          <h1 className="text-2xl font-black tracking-tighter italic flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center not-italic text-sm">MS</div>
            SUPERSTAR
          </h1>
        </div>
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
          <NavItem active={view === View.DASHBOARD} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setView(View.DASHBOARD)} />
          <NavItem active={view === View.ACTIVITIES} icon={<Activity size={20}/>} label="Activities" onClick={() => setView(View.ACTIVITIES)} />
          {/* Customize removed */}
          <NavItem active={view === View.PLAYLISTS} icon={<Music size={20}/>} label="Playlists" onClick={() => setView(View.PLAYLISTS)} />
          <NavItem active={view === View.RHYTHM_GAME} icon={<Play size={20}/>} label="Perform Show" onClick={() => setView(View.RHYTHM_GAME)} />
          <NavItem active={view === View.RELEASES} icon={<Music size={20}/>} label="My Catalog" onClick={() => setView(View.RELEASES)} />
          <NavItem active={view === View.STREAMING} icon={<TrendingUp size={20}/>} label="Streaming" onClick={() => setView(View.STREAMING)} />
          <NavItem active={view === View.SHOP} icon={<ShoppingCart size={20}/>} label="Merchandise" onClick={() => setView(View.SHOP)} />
          <NavItem active={view === View.PROFILE} icon={<Users size={20}/>} label="Artist Profile" onClick={() => setView(View.PROFILE)} />
          <NavItem active={view === View.WORLD} icon={<Globe size={20}/>} label="World Charts" onClick={() => setView(View.WORLD)} />
          <NavItem active={view === View.BANK} icon={<Wallet size={20}/>} label="Finance" onClick={() => setView(View.BANK)} />
          <NavItem active={view === View.AWARDS} icon={<Trophy size={20}/>} label="Achievements" onClick={() => setView(View.AWARDS)} />
        </nav>
        <div className="p-8 border-t border-zinc-900">
          <button onClick={() => { setCurrentSave(null); setView(View.LOGIN); }} className="flex items-center gap-3 text-zinc-500 hover:text-white font-bold transition-colors w-full uppercase text-xs">
            <LogOut size={16} /> Logout Artist
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 px-10 flex items-center justify-between z-20 sticky top-0">
          <div className="flex gap-8 items-center">
            <StatHeader label="Funds" value={`$${save.funds.toLocaleString()}`} color="text-green-400" />
            <div className="h-8 w-px bg-zinc-800"></div>
            <StatHeader label="Fans" value={save.fans.toLocaleString()} color="text-pink-400" />
            <div className="h-8 w-px bg-zinc-800"></div>
            <StatHeader label="Energy" value={`${save.stats.energy}%`} color="text-yellow-400" />
            <div className="h-8 w-px bg-zinc-800"></div>
            <StatHeader label="XP" value={save.xp.toLocaleString()} color="text-violet-400" />
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
               <p className="text-[10px] font-black text-zinc-500 uppercase">Y{save.year} WEEK {save.week}</p>
               <p className="text-sm font-black text-white">{CAREER_STAGES[save.careerLevel-1]}</p>
             </div>
             <button onClick={handleAdvanceWeek} className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase hover:bg-violet-600 hover:text-white transition-all transform active:scale-95 shadow-lg shadow-white/5">NEXT WEEK ➔</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-[#080808]">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {view === View.DASHBOARD && <DashboardView save={save} onNav={setView}/>}
              {/* Character customizer removed */}
              {view === View.PLAYLISTS && <PlaylistsView save={save} />}
              {view === View.STREAMING && <StreamingView save={save} />}
              {view === View.SHOP && <MerchandiseView save={save} onCreateMerch={(item) => {
                const s = { ...save, merchandise: [...save.merchandise, item] };
                setCurrentSave(s);
                setSaves(prev => prev.map(x => x.id === s.id ? s : x));
              }} />}
              {view === View.AWARDS && <AchievementsShop save={save} onPurchase={(itemId) => {
                const item = save.shopItems.find(i => i.id === itemId);
                if (item && save.funds >= item.price) {
                  const updatedItems = save.shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i);
                  const s = { ...save, shopItems: updatedItems, funds: save.funds - item.price };
                  setCurrentSave(s);
                  setSaves(prev => prev.map(x => x.id === s.id ? s : x));
                }
              }} />}
              {view === View.ACTIVITIES && <ActivitiesView save={save} onAction={handleActivity} onNav={setView}/>}
              {view === View.RELEASES && <CatalogView save={save} onRelease={handleRelease} />}
              {view === View.PROFILE && <ProfileView save={save} />}
              {view === View.BANK && <BankView save={save} onLoan={(a: number) => {
                const s = { ...save, funds: save.funds + a, loan: save.loan + a };
                setCurrentSave(s);
                setSaves(prev => prev.map(x => x.id === s.id ? s : x));
              }} onRepay={(a: number) => {
                const actualRepay = Math.min(a, save.funds, save.loan);
                const s = { ...save, funds: save.funds - actualRepay, loan: save.loan - actualRepay };
                setCurrentSave(s);
                setSaves(prev => prev.map(x => x.id === s.id ? s : x));
              }} />}
              {view === View.RHYTHM_GAME && <PerformanceShow save={save} onComplete={(result: any) => {
                const s = { ...save, fans: save.fans + result.fansGained, funds: save.funds + result.moneyGained, xp: save.xp + Math.floor(result.fansGained * 0.5), stats: { ...save.stats, energy: Math.max(0, save.stats.energy - 30) } };
                setCurrentSave(s);
                setSaves(prev => prev.map(x => x.id === s.id ? s : x));
                setView(View.DASHBOARD);
              }}/>}
              {view === View.WORLD && <WorldCharts save={save} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
    {icon}
    <span className="text-sm font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatHeader = ({ label, value, color }: any) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</span>
    <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
  </div>
);

const DashboardView = ({ save, onNav }: any) => (
  <div className="space-y-10">
    <div className="bg-gradient-to-br from-zinc-900 to-black p-16 rounded-[4rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity"><Star size={240} className="text-violet-500 rotate-12" /></div>
      <div className="relative z-10"><h2 className="text-8xl font-black tracking-tighter mb-4 italic neon-text">{save.artistName}</h2><div className="flex items-center gap-6"><div className="px-6 py-2 bg-violet-600 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-600/30">LEVEL {save.careerLevel}</div><div className="text-zinc-500 font-mono text-sm uppercase font-bold">{CAREER_STAGES[save.careerLevel-1]}</div></div></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatBox label="Energy" value={save.stats.energy} max={100} icon={<Zap size={24}/>} color="yellow" />
      <StatBox label="Health" value={save.stats.health} max={100} icon={<Heart size={24}/>} color="red" />
      <StatBox label="Happiness" value={save.stats.happiness} max={100} icon={<Smile size={24}/>} color="pink" />
      <StatBox label="Creativity" value={save.stats.creativity} max={100} icon={<Activity size={24}/>} color="blue" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10">
        <div className="flex justify-between items-center mb-10"><h3 className="text-2xl font-black italic tracking-tight">TOP RELEASES</h3><button onClick={() => onNav(View.RELEASES)} className="text-violet-500 text-xs font-black uppercase tracking-widest hover:underline">View Catalog</button></div>
        <div className="space-y-4">
          {save.catalog.filter((s:any) => s.isReleased).slice(0,3).map((song:any) => (
            <div key={song.id} className="flex items-center justify-between p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800/50">
              <div className="flex items-center gap-6"><img src={song.artwork} className="w-16 h-16 rounded-2xl shadow-lg" alt="art" /><div><p className="font-black text-lg">{song.title}</p><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{song.genre}</p></div></div>
              <div className="text-right"><p className="text-sm font-mono font-bold">{(Object.values(song.totalStreams || {}).reduce((a:any,b:any)=>a+b, 0) as number).toLocaleString()} Streams</p></div>
            </div>
          ))}
          {save.catalog.filter((s:any) => s.isReleased).length === 0 && <div className="text-zinc-700 italic text-center py-20 border-2 border-dashed border-zinc-900 rounded-[2rem]">No music released yet...</div>}
        </div>
      </div>
      <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center">
        <Trophy size={64} className="text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" /><h3 className="text-xl font-black mb-2 uppercase tracking-tight">CAREER MILESTONE</h3><p className="text-zinc-500 text-sm mb-8 leading-relaxed max-w-[200px]">Reach 1 Million Fans to unlock the World Tour activities.</p>
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mb-4"><div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (save.fans / 1000000) * 100)}%` }}></div></div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{save.fans.toLocaleString()} / 1,000,000 FANS</p>
      </div>
    </div>
    <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10">
      <h3 className="text-2xl font-black italic tracking-tight mb-6">🔥 TRENDING THIS SEASON</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(save.currentTrends || []).filter((t:any) => t.startWeek <= save.week && t.endWeek >= save.week).slice(0, 3).map((trend:any) => (
          <div key={trend.id} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-2xl p-4">
            <p className="font-black text-purple-300 text-sm mb-2">{trend.name}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-zinc-400">{trend.genre}</span>
              <span className="text-xs font-bold text-purple-400">{Math.floor(trend.strength)}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${trend.strength}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-4">Auto-write songs every 4 weeks matching trending genres!</p>
    </div>
  </div>
);

const StatBox = ({ label, value, max, icon, color }: any) => {
  const colors: any = { yellow: 'text-yellow-400 bg-yellow-400/10', red: 'text-red-400 bg-red-400/10', pink: 'text-pink-400 bg-pink-400/10', blue: 'text-blue-400 bg-blue-400/10' };
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] flex flex-col justify-between hover:scale-[1.02] transition-all cursor-default">
      <div className="flex justify-between items-start mb-6"><span className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</span><span className="text-xs font-black text-zinc-600 uppercase tracking-widest">{label}</span></div>
      <div><p className="text-3xl font-mono font-black mb-4">{value}%</p><div className="h-1 bg-zinc-900 rounded-full overflow-hidden"><div className={`h-full ${colors[color].split(' ')[0]} transition-all duration-700`} style={{ width: `${(value/max)*100}%` }}></div></div></div>
    </div>
  );
};

const ActivitiesView = ({ save, onAction, onNav }: any) => (
  <div className="max-w-4xl mx-auto space-y-12">
    <div className="text-center mb-16"><h2 className="text-6xl font-black italic tracking-tighter">STUDIO & STAGE</h2><p className="text-zinc-500 font-mono tracking-widest text-xs uppercase mt-2">Professional Activities</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <ActivityBtn icon="🧘" title="RELAX" desc="Restore health and happiness. Skip the week's grind." color="from-green-600 to-emerald-600" onClick={() => onAction('relax')} />
      <ActivityBtn icon="🎹" title="PRACTICE" desc="Hone your songwriting and production skills. Gain XP." color="from-blue-600 to-indigo-600" onClick={() => onAction('practice')} />
      <ActivityBtn icon="✍️" title="WRITE SONG" desc="Draft a new track. Quality depends on creativity." color="from-violet-600 to-purple-600" onClick={() => onAction('write')} />
      <ActivityBtn icon="🎸" title="PERFORM" desc="Play a live show! Requires 30 energy. Builds fans." color="from-pink-600 to-rose-600" onClick={() => onNav(View.RHYTHM_GAME)} />
    </div>
  </div>
);

const ActivityBtn = ({ icon, title, desc, color, onClick }: any) => (
  <button onClick={onClick} className="text-left bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] hover:scale-[1.03] active:scale-95 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${color}`}></div>
    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
  </button>
);

const CatalogView = ({ save, onRelease }: any) => (
  <div className="space-y-12">
    <h2 className="text-4xl font-black tracking-tighter uppercase italic">Music Catalog</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Drafts & Recordings</h3>
        {save.catalog.filter((s:any) => !s.isReleased).map((song:any) => (
          <div key={song.id} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] flex items-center justify-between group">
             <div className="flex items-center gap-6"><div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎧</div><div><p className="font-black text-xl">{song.title}</p><p className="text-[10px] text-zinc-600 font-black uppercase mt-1">Quality: {song.quality}% • {song.genre}</p></div></div>
             <button onClick={() => onRelease(song.id)} className="bg-violet-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-500 transition-colors">Release ($2,000)</button>
          </div>
        ))}
        {save.catalog.filter((s:any) => !s.isReleased).length === 0 && <p className="text-zinc-800 italic text-center py-10">No unreleased work...</p>}
      </div>
      <div className="space-y-6">
        <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Released History</h3>
        {save.catalog.filter((s:any) => s.isReleased).map((song:any) => (
          <div key={song.id} className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Music size={64}/></div>
             <div className="flex gap-6 mb-6"><img src={song.artwork} className="w-20 h-20 rounded-2xl shadow-xl" alt="art" /><div><p className="font-black text-2xl">{song.title}</p><p className="text-xs text-violet-500 font-mono">Released Year {song.releaseYear} Week {song.releaseWeek}</p></div></div>
             <div className="grid grid-cols-3 gap-6 text-center border-t border-zinc-900 pt-6">
                <div><p className="text-[10px] text-zinc-600 font-black uppercase">Sales</p><p className="font-mono font-bold">{song.totalSales.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-zinc-600 font-black uppercase">Streams</p><p className="font-mono font-bold">{(Object.values(song.totalStreams || {}).reduce((a:any,b:any)=>a+b, 0) as number).toLocaleString()}</p></div>
                <div><p className="text-[10px] text-zinc-600 font-black uppercase">Quality</p><p className="font-mono font-bold text-violet-400">{song.quality}%</p></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProfileView = ({ save }: any) => (
  <div className="max-w-5xl mx-auto space-y-16">
    <div className="flex items-center gap-16"><div className="w-64 h-64 bg-zinc-950 rounded-[4rem] border-4 border-violet-600 flex items-center justify-center text-9xl shadow-2xl shadow-violet-600/10 grayscale group hover:grayscale-0 transition-all">🎤</div><div className="flex-1"><h2 className="text-8xl font-black italic tracking-tighter neon-text mb-4">{save.artistName}</h2><div className="flex gap-4"><ProfileBadge label="HOME" value={save.homeRegion} /><ProfileBadge label="LEVEL" value={save.careerLevel} /><ProfileBadge label="STATUS" value={CAREER_STAGES[save.careerLevel-1]} /></div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
       <div className="space-y-8"><h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.5em] mb-10">Regional Influence</h3>{REGIONS.map(r => (<div key={r}><div className="flex justify-between text-xs font-black uppercase mb-2"><span className="text-zinc-400">{r}</span><span>{save.regionalPopularity[r].toFixed(1)}%</span></div><div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900"><div className="h-full bg-violet-600 transition-all duration-1000" style={{ width: `${save.regionalPopularity[r]}%` }}></div></div></div>))}</div>
       <div className="bg-zinc-950 border border-zinc-900 p-16 rounded-[4rem] text-center"><Star size={48} className="text-yellow-500 mx-auto mb-6" /><h3 className="text-2xl font-black mb-10 uppercase tracking-tight">CAREER LIFETIME</h3><div className="grid grid-cols-2 gap-10"><CareerStat label="Total Streams" value={(save.listeners * 12).toLocaleString()} /><CareerStat label="Awards Won" value={save.awards.length} /><CareerStat label="XP Total" value={save.xp.toLocaleString()} /><CareerStat label="Subscribers" value={save.subscribers.toLocaleString()} /></div></div>
    </div>
  </div>
);

const ProfileBadge = ({ label, value }: any) => (<div className="bg-zinc-950 border border-zinc-900 px-6 py-3 rounded-2xl"><p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">{label}</p><p className="text-xs font-black text-white">{value}</p></div>);
const CareerStat = ({ label, value }: any) => (<div><p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">{label}</p><p className="text-xl font-mono font-black text-violet-400">{value}</p></div>);

const BankView = ({ save, onLoan, onRepay }: any) => (
  <div className="max-w-3xl mx-auto py-20">
    <div className="bg-zinc-950 border border-zinc-900 p-16 rounded-[4rem] text-center shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Wallet size={120} /></div>
       <h2 className="text-5xl font-black mb-2 italic tracking-tighter">CITY FINANCE</h2><p className="text-zinc-600 mb-12 uppercase font-black text-xs tracking-widest">Artist Capital & Credit</p>
       <div className="grid grid-cols-2 gap-10 mb-16"><div className="bg-zinc-900/50 p-10 rounded-[2.5rem] border border-zinc-800"><p className="text-[10px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Available Funds</p><p className="text-4xl font-mono font-black text-green-400">${save.funds.toLocaleString()}</p></div><div className="bg-zinc-900/50 p-10 rounded-[2.5rem] border border-zinc-800"><p className="text-[10px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Active Loan</p><p className={`text-4xl font-mono font-black ${save.loan > 0 ? 'text-red-500' : 'text-zinc-700'}`}>${save.loan.toLocaleString()}</p></div></div>
       <div className="grid grid-cols-2 gap-4"><BankBtn label="Borrow $2,000" onClick={() => onLoan(2000)} /><BankBtn label="Borrow $10,000" onClick={() => onLoan(10000)} /><BankBtn label="Repay $1,000" color="bg-violet-600" onClick={() => onRepay(1000)} /><BankBtn label="Repay All" color="bg-violet-600" onClick={() => onRepay(save.loan)} /></div>
       <p className="mt-10 text-[9px] text-zinc-700 font-black uppercase tracking-widest italic">Weekly loan interest rate: 2%</p>
    </div>
  </div>
);

const BankBtn = ({ label, onClick, color = "bg-zinc-900" }: any) => (<button onClick={onClick} className={`${color} py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all border border-zinc-800/50`}>{label}</button>);

const WorldCharts = ({ save }: any) => {
  const chartsData = getAllChartsWithAI(save);
  const trendingNow = (save.currentTrends || []).filter((t: any) => t.startWeek <= save.week && t.endWeek >= save.week).slice(0, 3);
  
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end mb-10"><h2 className="text-5xl font-black italic tracking-tighter uppercase">Global Billboard</h2><p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">Updated Weekly • Year {save.year}</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden">
          <div className="p-8 border-b border-zinc-900 bg-zinc-900/20 flex justify-between items-center"><h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Top 100 Singles (Player + AI)</h3><div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span className="text-[10px] text-zinc-600 font-black uppercase">Live Sync</span></div></div>
          <div className="divide-y divide-zinc-900 max-h-[800px] overflow-y-auto">
            {chartsData.length > 0 ? (
              chartsData.slice(0, 50).map((data: any, i: number) => (
                <div key={`${data.song.id}-${i}`} className="p-8 flex items-center gap-8 hover:bg-zinc-900/30 transition-colors">
                  <span className="w-10 text-3xl font-black italic text-zinc-800">#{i+1}</span>
                  <img src={data.song.artwork} className="w-20 h-20 rounded-2xl shadow-xl" alt="art" />
                  <div className="flex-1">
                    <p className="text-2xl font-black tracking-tight">{data.song.title}</p>
                    <p className="text-xs text-zinc-600 font-black uppercase tracking-widest">{data.artistName} • {data.song.genre}</p>
                    <p className="text-[10px] text-zinc-700 mt-1">Streams: {(data.song.totalStreams['total'] || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className={`font-black uppercase mb-1 ${data.artistName === save.artistName ? 'text-green-400' : 'text-blue-400'}`}>{data.artistName === save.artistName ? '⭐ YOU' : '🤖 AI'}</p>
                    <p className="text-sm font-mono font-bold text-zinc-600">#{data.chartPosition.position}</p>
                  </div>
                </div>
              ))
            ) : (<div className="p-32 text-center text-zinc-700 italic">No songs on charts yet. Compete globally!</div>)}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem]">
            <h4 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-8">🔥 Trending Now</h4>
            <div className="space-y-4">
              {trendingNow.length > 0 ? (
                trendingNow.map((trend: any) => (
                  <div key={trend.id} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                    <p className="font-black text-purple-300 text-sm">{trend.name}</p>
                    <div className="flex justify-between items-center mt-2 text-[10px]">
                      <span className="text-zinc-500">{trend.genre}</span>
                      <div className="w-16 bg-zinc-800 rounded-full h-1">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${trend.strength}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 text-sm italic">No active trends</p>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-600/20 p-10 rounded-[3rem]"><Star className="text-violet-500 mb-6" /><h4 className="text-lg font-black uppercase tracking-tight mb-2">Award Season</h4><p className="text-zinc-500 text-sm leading-relaxed">The Global Music Awards are coming in Week 52. Maintain high quality scores to be nominated.</p></div>
        </div>
      </div>
    </div>
  );
};

export default App;
