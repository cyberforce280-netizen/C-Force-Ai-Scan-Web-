
import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { LayoutDashboard, Shield, Globe, Network, Scan, Bell, Menu, User, LogOut, Lock, Fingerprint, CheckCircle, Database, Hexagon, RefreshCw, Zap } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ThreatIntel } from './components/ThreatIntel';
import { Osint } from './components/Osint';
import { NetworkSec } from './components/NetworkSec';
import { VulnScan } from './components/VulnScan';
import { DDoSAttack } from './components/DDoSAttack';
import { AiAssistant } from './components/AiAssistant';
import { AdminPanel } from './components/AdminPanel';

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`relative flex items-center gap-2 px-4 py-2 transition-all duration-300 group ${
      active 
        ? 'text-white' 
        : 'text-neutral-400 hover:text-red-400'
    }`}
  >
    {/* Top glowing line for active state */}
    {active && (
      <span className="absolute top-0 left-0 w-full h-[2px] bg-red-600 shadow-[0_0_10px_#ef4444]"></span>
    )}
    
    <Icon size={18} className={`${active ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'group-hover:text-red-400'}`} />
    <span className={`font-oxanium text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    
    {/* Bottom reflection for active state */}
    {active && (
      <span className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-red-900/10 pointer-events-none"></span>
    )}
  </button>
);

interface UserProfile {
  name: string;
  role: string;
  level: string;
}

// --- Sound Effect Utility ---
const playWelcomeSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // 1. High-tech Arpeggio (Access Granted)
    const notes = [660, 880, 1100]; // E5, A5, C#6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (i * 0.1));
      
      gain.gain.setValueAtTime(0, now + (i * 0.1));
      gain.gain.linearRampToValueAtTime(0.1, now + (i * 0.1) + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.1) + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + (i * 0.1));
      osc.stop(now + (i * 0.1) + 0.5);
    });

    // 2. Low Sci-Fi Hum/Swoosh
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(100, now);
    hum.frequency.linearRampToValueAtTime(50, now + 1.5); // Pitch Drop
    
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.05, now + 0.2);
    humGain.gain.linearRampToValueAtTime(0, now + 2.0);
    
    // Simple Lowpass Filter for the hum
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    hum.connect(filter);
    filter.connect(humGain);
    humGain.connect(ctx.destination);
    
    hum.start(now);
    hum.stop(now + 2.0);

  } catch (e) {
    console.error("Audio playback blocked or failed", e);
  }
};

// --- Futuristic Logo Component ---
const FuturisticLogo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center group">
    {/* Amber Glow Background */}
    <div className="absolute inset-0 bg-orange-600/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500 opacity-50 group-hover:opacity-100"></div>

    {/* Rotating Cyber Ring */}
    <div className="absolute inset-[-2px] border-2 border-orange-500/30 rounded-full border-t-transparent border-r-transparent animate-[spin_3s_linear_infinite]"></div>
    
    {/* Static Inner Ring */}
    <div className="absolute inset-[2px] border border-orange-400/20 rounded-full"></div>

    {/* Shield Icon */}
    <div className="relative z-10 flex items-center justify-center">
       <Shield 
         size={28} 
         className="text-orange-500 fill-orange-950/50 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] transition-transform duration-300 group-hover:scale-110" 
         strokeWidth={2}
       />
       
       {/* Central Energy Core (Zap) */}
       <div className="absolute inset-0 flex items-center justify-center">
          <Zap 
            size={12} 
            className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,1)] animate-pulse" 
            fill="currentColor" 
          />
       </div>
    </div>
  </div>
);

// --- Welcome Overlay Component ---
const WelcomeOverlay = ({ user, onComplete }: { user: UserProfile, onComplete: () => void }) => {
  useEffect(() => {
    // Play sound on mount
    playWelcomeSound();

    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // Display time
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-rajdhani">
      <div className="text-center animate-in fade-in duration-1000">
        <div className="flex justify-center mb-6">
           <div className="w-24 h-24 rounded-full border-2 border-emerald-500/50 flex items-center justify-center relative">
              <div className="absolute inset-0 border border-emerald-500 rounded-full animate-[ping_2s_infinite] opacity-30"></div>
              <Fingerprint size={48} className="text-emerald-500" />
           </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white font-orbitron tracking-[0.2em] mb-2 animate-in slide-in-from-bottom-5 duration-700 delay-300 fill-mode-both">
          SYSTEM INITIALIZED
        </h2>
        
        <div className="text-emerald-500 font-bold text-sm uppercase tracking-widest mb-8 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-5 duration-700 delay-500 fill-mode-both">
          <CheckCircle size={14} /> AUTO-LOGIN ACTIVE
        </div>
        
        <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-lg min-w-[300px] animate-in slide-in-from-bottom-5 duration-700 delay-700 fill-mode-both">
           <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">Authenticated As</p>
           <h1 className="text-4xl text-white font-bold font-oxanium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
             {user.name}
           </h1>
           <div className="inline-block px-3 py-1 bg-red-950/30 border border-red-900/50 rounded text-red-500 text-xs font-bold font-mono uppercase">
             {user.role} // {user.level}
           </div>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_USER: UserProfile = {
  name: 'System Commander',
  role: 'ADMINISTRATOR',
  level: 'LEVEL 5 (MAX)'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  // Initialize directly with the default user, bypassing login
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSystemReset = () => {
    // Simulates a logout/reset by reloading the page
    window.location.reload();
  };

  const renderContent = () => {
    switch(currentView) {
      case 'DASHBOARD': return <Dashboard />;
      case 'THREAT_INTEL': return <ThreatIntel />;
      case 'OSINT': return <Osint />;
      case 'NETWORK': return <NetworkSec />;
      case 'VULN_SCAN': return <VulnScan />;
      case 'DDOS': return <DDoSAttack />;
      case 'ADMIN_PANEL': return <AdminPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      {showWelcome && <WelcomeOverlay user={currentUser} onComplete={() => setShowWelcome(false)} />}
      
      <div className={`min-h-screen bg-black text-neutral-200 flex flex-col overflow-hidden font-sans selection:bg-red-900 selection:text-white transition-opacity duration-1000 ${showWelcome ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* TOP NAVIGATION HEADER */}
        <header className="h-16 border-b border-red-900/30 bg-black/90 backdrop-blur-md flex items-center justify-between px-6 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative">
          {/* Decorative thin red line at top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-800 to-transparent opacity-50"></div>

          {/* Left: Branding */}
          <div className="flex items-center gap-4">
             <div className="cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
                <FuturisticLogo />
             </div>
             
             <div className="leading-tight hidden sm:block">
               <h1 className="font-bold text-xl tracking-widest text-white font-orbitron uppercase flex items-center gap-2">
                 C-FORCE <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">AI</span>
               </h1>
             </div>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center h-full gap-1 mx-4">
            <NavItem 
              icon={LayoutDashboard} 
              label="DASHBOARD" 
              active={currentView === 'DASHBOARD'} 
              onClick={() => setCurrentView('DASHBOARD')} 
            />
            <NavItem 
              icon={Shield} 
              label="INTEL" 
              active={currentView === 'THREAT_INTEL'} 
              onClick={() => setCurrentView('THREAT_INTEL')} 
            />
            <NavItem 
              icon={Globe} 
              label="OSINT" 
              active={currentView === 'OSINT'} 
              onClick={() => setCurrentView('OSINT')} 
            />
            <NavItem 
              icon={Network} 
              label="NETWORK" 
              active={currentView === 'NETWORK'} 
              onClick={() => setCurrentView('NETWORK')} 
            />
            <NavItem 
              icon={Scan} 
              label="SCANS" 
              active={currentView === 'VULN_SCAN'} 
              onClick={() => setCurrentView('VULN_SCAN')} 
            />
            <NavItem 
              icon={Zap} 
              label="DDOS ATTACK" 
              active={currentView === 'DDOS'} 
              onClick={() => setCurrentView('DDOS')} 
            />
            
            {/* Admin Only Navigation */}
            {currentUser.role === 'ADMINISTRATOR' && (
              <>
                 <div className="w-px h-6 bg-red-900/50 mx-2"></div>
                 <NavItem 
                    icon={Database} 
                    label="SYSTEM DB" 
                    active={currentView === 'ADMIN_PANEL'} 
                    onClick={() => setCurrentView('ADMIN_PANEL')} 
                 />
              </>
            )}
          </nav>

          {/* Right: User/System Status */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-neutral-900/50 border border-neutral-800 rounded-full">
               <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_5px_#ef4444] animate-pulse"></div>
               <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">System Armed</span>
            </div>

            <button className="p-2 text-neutral-400 hover:text-white transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
            </button>
            
            <div className="w-px h-8 bg-neutral-800 mx-1"></div>
            
            <div className="flex items-center gap-3 group relative">
               <div className="text-right hidden sm:block">
                 <div className="text-xs font-bold text-white group-hover:text-red-500 transition-colors uppercase">{currentUser.name}</div>
                 <div className="text-[10px] text-neutral-500 font-mono flex items-center justify-end gap-1">
                   {currentUser.role === 'ADMINISTRATOR' && <Shield size={8} className="text-red-500" />}
                   {currentUser.level}
                 </div>
               </div>
               <div className={`w-9 h-9 rounded bg-neutral-800 border flex items-center justify-center transition-colors ${
                 currentUser.role === 'ADMINISTRATOR' ? 'border-red-900/50 text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'border-neutral-700 text-neutral-400'
               }`}>
                 <User size={18} />
               </div>

               {/* Logout Button turned into System Reset */}
               <button 
                 onClick={handleSystemReset}
                 className="absolute -bottom-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-900 text-white text-[10px] px-3 py-1 rounded flex items-center gap-1 border border-red-500 z-50"
               >
                 <RefreshCw size={10} /> RELOAD
               </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-black relative overflow-hidden">
          {/* Background Grid & Cyber Effects */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Dark Grid */}
             <div className="absolute inset-0 opacity-10" 
                  style={{ 
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                    backgroundSize: '30px 30px' 
                  }}>
             </div>
             {/* Red Ambient Glow from top center (like the eagle) */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-900/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex-1 overflow-auto">
            {renderContent()}
          </div>
        </main>

        {/* AI Assistant Overlay */}
        <AiAssistant />
      </div>
    </>
  );
};

export default App;
