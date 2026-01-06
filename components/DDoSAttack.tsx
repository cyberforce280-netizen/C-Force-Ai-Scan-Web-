
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Shield, Activity, Server, Globe, 
  Settings, Play, Square, RotateCcw, 
  Lock, AlertTriangle, Terminal as TerminalIcon, Code, Wifi
} from 'lucide-react';

type AttackType = 'HTTP_FLOOD' | 'TCP_SYN' | 'UDP_FLOOD' | 'VIP_METHOD' | 'TLS_HELLO' | 'GFLOOD_BYPASS';

interface AttackPacket {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
}

interface LogLine {
  id: number;
  text: string;
  color: string;
}

export const DDoSAttack: React.FC = () => {
  // Configuration State
  const [target, setTarget] = useState('10.0.0.5');
  const [attackType, setAttackType] = useState<AttackType>('VIP_METHOD');
  const [intensity, setIntensity] = useState(10); // 1-10
  const [isAttacking, setIsAttacking] = useState(false);
  
  // Terminal State
  const [logs, setLogs] = useState<LogLine[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Defense Systems
  const [defenses, setDefenses] = useState({
    firewall: false,
    loadBalancer: false,
    rateLimit: false
  });

  // Simulation State
  const [serverHealth, setServerHealth] = useState(100);
  const [packets, setPackets] = useState<AttackPacket[]>([]);
  const requestRef = useRef<number>(0);
  const healthInterval = useRef<number>(0);
  const logInterval = useRef<number>(0);
  const attackCountRef = useRef<number>(0);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // --- Visual Logic (Particles) ---

  const spawnPacket = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 300; // Start distance from center
    
    let color = '#3b82f6';
    if (attackType === 'VIP_METHOD') color = '#f59e0b'; // Gold
    else if (attackType === 'TLS_HELLO') color = '#10b981'; // Green
    else if (attackType === 'TCP_SYN') color = '#8b5cf6'; // Purple
    else if (attackType === 'UDP_FLOOD') color = '#ec4899'; // Pink
    
    return {
      id: Math.random(),
      x: Math.cos(angle) * distance + 300, // Center X is approx 300
      y: Math.sin(angle) * distance + 200, // Center Y is approx 200
      angle: angle + Math.PI, // Move towards center
      speed: 3 + (intensity * 0.8),
      color
    };
  };

  const animate = () => {
    setPackets(prev => {
      const nextPackets: AttackPacket[] = [];
      // Spawn new based on intensity
      if (isAttacking && Math.random() < (intensity / 8)) {
        nextPackets.push(spawnPacket());
        if (intensity > 5) nextPackets.push(spawnPacket()); 
        if (intensity > 8) nextPackets.push(spawnPacket()); 
        if (attackType === 'VIP_METHOD') nextPackets.push(spawnPacket()); // VIP has more packets
      }

      // Update positions
      for (const p of prev) {
        const dx = 300 - p.x;
        const dy = 200 - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 10) {
           nextPackets.push({
             ...p,
             x: p.x + Math.cos(p.angle) * p.speed,
             y: p.y + Math.sin(p.angle) * p.speed
           });
        }
      }
      return nextPackets;
    });
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isAttacking, intensity, attackType]);

  // --- Logic Implementation (EXADOS Python Script Simulation) ---

  const addLog = (text: string, color: string = 'text-slate-400') => {
    setLogs(prev => [...prev.slice(-50), { id: Math.random(), text, color }]);
  };

  const generateExadosLog = () => {
    const threadId = Math.floor(Math.random() * 50) + 1;
    attackCountRef.current += 1;
    const count = attackCountRef.current;

    switch (attackType) {
      case 'VIP_METHOD':
        return {
          text: `[Thread ${threadId}] VIP Method #${count} | Status: 200 | Proxy: True`,
          color: 'text-yellow-400'
        };
      case 'TLS_HELLO':
        return {
          text: `[Thread ${threadId}] TLS HELLO Flood #${count} | Handshakes: ${intensity * 5}`,
          color: 'text-emerald-400'
        };
      case 'GFLOOD_BYPASS':
        return {
          text: `[Thread ${threadId}] GFLOOD Bypass #${count} | Packets sent`,
          color: 'text-red-400'
        };
      case 'HTTP_FLOOD':
        return {
          text: `[Thread ${threadId}] GET Attack #${count} | Status: 200`,
          color: 'text-blue-400'
        };
      case 'TCP_SYN':
        return {
          text: `[Thread ${threadId}] TCP SYN Flood #${count} | Target: ${target}:80`,
          color: 'text-purple-400'
        };
      case 'UDP_FLOOD':
        return {
          text: `[Thread ${threadId}] UDP Flood #${count} | Packets: ${intensity * 10}`,
          color: 'text-pink-400'
        };
      default:
        return { text: 'Attack Packet Sent...', color: 'text-slate-400' };
    }
  };

  const startAttackSimulation = () => {
    if (isAttacking) {
      // STOP
      setIsAttacking(false);
      addLog('[+] Attack Stopped by User.', 'text-red-500 font-bold');
      return;
    }

    // START
    setIsAttacking(true);
    setLogs([]); // Clear logs on start
    attackCountRef.current = 0;

    // 1. Banner (EXADOS Style)
    addLog(`
╔══════════════════════════════════════════════════════════╗
║           E X A D O S   S U P E R   D D O S   V 3 0      ║
║           WITH VIP & TLS ADVANCED METHODS                ║
╚══════════════════════════════════════════════════════════╝`, 'text-red-500 font-bold font-mono whitespace-pre');
    
    setTimeout(() => addLog(`[+] Starting ${attackType} on ${target}...`, 'text-emerald-500'), 200);
    setTimeout(() => addLog(`[+] Power Level: ${intensity}/10`, 'text-emerald-500'), 400);
    if (['VIP_METHOD', 'TLS_HELLO'].includes(attackType)) {
       setTimeout(() => addLog(`[!] WARNING: ADVANCED METHOD SELECTED!`, 'text-yellow-500 font-bold'), 600);
    }
    setTimeout(() => addLog(`[+] Launching threads...`, 'text-slate-300'), 800);

    // 2. Log Loop
    logInterval.current = window.setInterval(() => {
      const logsPerTick = Math.floor(intensity / 2) + 1;
      for (let i = 0; i < logsPerTick; i++) {
        const log = generateExadosLog();
        addLog(log.text, log.color);
      }
    }, 100);

    // 3. Health Logic
    healthInterval.current = window.setInterval(() => {
        setServerHealth(prev => {
          if (prev <= 0) return 0;
          let damage = intensity * 1.5;
          // Defense Mitigation
          if (defenses.firewall) damage *= 0.7; 
          if (defenses.loadBalancer) damage *= 0.5; 
          if (defenses.rateLimit && intensity > 7) damage *= 0.2; 
          
          // Advanced methods bypass defenses more
          if (attackType === 'VIP_METHOD') damage *= 1.5;
          if (attackType === 'TLS_HELLO') damage *= 1.3;

          return Math.max(0, prev - damage);
        });
    }, 500);
  };

  // Cleanup intervals
  useEffect(() => {
    if (!isAttacking) {
      clearInterval(healthInterval.current);
      clearInterval(logInterval.current);
      // Regen health
      const regen = setInterval(() => {
         setServerHealth(prev => Math.min(100, prev + 5));
      }, 500);
      return () => clearInterval(regen);
    }
    return () => {
      clearInterval(healthInterval.current);
      clearInterval(logInterval.current);
    };
  }, [isAttacking, defenses, attackType, intensity]);

  const toggleDefense = (key: keyof typeof defenses) => {
    setDefenses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSimulation = () => {
    setIsAttacking(false);
    setServerHealth(100);
    setPackets([]);
    setLogs([]);
  };

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0B0F19]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide">DDoS SIMULATOR</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
              EXADOS v3.0 Core
            </span>
          </div>
          <p className="text-slate-400 font-rajdhani font-medium">Advanced stress testing featuring VIP & TLS attack vectors.</p>
        </div>
        <div className="flex items-center gap-4">
           {isAttacking && (
             <div className="flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]"></div>
                <span className="text-red-500 font-bold font-mono tracking-widest">ATTACK IN PROGRESS</span>
             </div>
           )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* LEFT PANEL: CONFIGURATION */}
        <div className="bg-[#0F1623] border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl h-fit">
           
           <div className="flex items-center gap-2 mb-2">
              <Settings className="text-slate-400" />
              <h2 className="text-xl font-bold text-white font-orbitron">Attack Configuration</h2>
           </div>
           
           {/* Target Input */}
           <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2 block">Target Host</label>
              <div className="relative">
                 <Globe className="absolute left-4 top-3 text-slate-500" size={18} />
                 <input 
                   type="text" 
                   value={target}
                   onChange={(e) => setTarget(e.target.value)}
                   className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                 />
              </div>
           </div>

           {/* Attack Type Selection */}
           <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3 block">Attack Vector (EXADOS Methods)</label>
              <div className="grid grid-cols-1 gap-3">
                 
                 {/* VIP Method (Gold) */}
                 <div 
                   onClick={() => setAttackType('VIP_METHOD')}
                   className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                     attackType === 'VIP_METHOD' ? 'bg-amber-900/20 border-amber-500' : 'bg-[#0B0F19] border-slate-700 hover:border-slate-500'
                   }`}
                 >
                    <div>
                       <div className={`font-bold ${attackType === 'VIP_METHOD' ? 'text-amber-400' : 'text-slate-300'}`}>VIP Method (Proxy Rotation)</div>
                       <div className="text-xs text-slate-500">High-end attack with proxy support</div>
                    </div>
                    {attackType === 'VIP_METHOD' && <Zap size={16} className="text-amber-500" />}
                 </div>

                 {/* TLS Hello (Green) */}
                 <div 
                   onClick={() => setAttackType('TLS_HELLO')}
                   className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                     attackType === 'TLS_HELLO' ? 'bg-emerald-900/20 border-emerald-500' : 'bg-[#0B0F19] border-slate-700 hover:border-slate-500'
                   }`}
                 >
                    <div>
                       <div className={`font-bold ${attackType === 'TLS_HELLO' ? 'text-emerald-400' : 'text-slate-300'}`}>TLS-Hello Flood</div>
                       <div className="text-xs text-slate-500">Overwhelm TLS handshake</div>
                    </div>
                    {attackType === 'TLS_HELLO' && <Lock size={16} className="text-emerald-500" />}
                 </div>

                 {/* GFLOOD (Red) */}
                 <div 
                   onClick={() => setAttackType('GFLOOD_BYPASS')}
                   className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                     attackType === 'GFLOOD_BYPASS' ? 'bg-red-900/20 border-red-500' : 'bg-[#0B0F19] border-slate-700 hover:border-slate-500'
                   }`}
                 >
                    <div>
                       <div className={`font-bold ${attackType === 'GFLOOD_BYPASS' ? 'text-red-400' : 'text-slate-300'}`}>GFLOOD Bypass</div>
                       <div className="text-xs text-slate-500">Advanced TCP Bypass</div>
                    </div>
                    {attackType === 'GFLOOD_BYPASS' && <Activity size={16} className="text-red-500" />}
                 </div>

                 {/* Standard Methods (Blue/Purple/Pink) */}
                 <div className="grid grid-cols-3 gap-2 mt-2">
                    {['HTTP_FLOOD', 'TCP_SYN', 'UDP_FLOOD'].map((type) => (
                       <button
                          key={type}
                          onClick={() => setAttackType(type as AttackType)}
                          className={`p-2 rounded border text-xs font-bold ${
                             attackType === type 
                             ? 'bg-slate-700 border-white text-white' 
                             : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                       >
                          {type.replace('_', ' ')}
                       </button>
                    ))}
                 </div>

              </div>
           </div>

           {/* Intensity Slider */}
           <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Power Level</label>
                 <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    intensity < 4 ? 'bg-emerald-900/30 text-emerald-500' :
                    intensity < 8 ? 'bg-amber-900/30 text-amber-500' :
                    'bg-red-900/30 text-red-500'
                 }`}>Level {intensity}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
           </div>

           {/* Defense Toggles */}
           <div>
              <div className="flex justify-between items-center mb-3">
                 <label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Target Defenses</label>
                 <span className="text-[10px] text-slate-600 font-mono">
                    {Object.values(defenses).filter(Boolean).length}/3 Active
                 </span>
              </div>
              <div className="space-y-2">
                 {[
                    { id: 'firewall', label: 'WAF / Firewall', desc: 'Blocks ~30% of attacks' },
                    { id: 'loadBalancer', label: 'Load Balancer', desc: 'Reduces damage by 50%' },
                    { id: 'rateLimit', label: 'Auto Rate Limit', desc: 'Auto-blocks high traffic' },
                 ].map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-[#0B0F19] rounded border border-slate-800">
                       <div>
                          <div className="text-sm font-bold text-slate-300">{d.label}</div>
                          <div className="text-[10px] text-slate-500">{d.desc}</div>
                       </div>
                       <button 
                         onClick={() => toggleDefense(d.id as any)}
                         className={`w-10 h-5 rounded-full relative transition-colors ${defenses[d.id as keyof typeof defenses] ? 'bg-emerald-600' : 'bg-slate-700'}`}
                       >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${defenses[d.id as keyof typeof defenses] ? 'left-6' : 'left-1'}`}></div>
                       </button>
                    </div>
                 ))}
              </div>
           </div>

           {/* Actions */}
           <div className="mt-auto flex gap-4">
              <button 
                onClick={startAttackSimulation}
                className={`flex-1 py-4 rounded-lg font-bold font-orbitron text-lg uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isAttacking 
                  ? 'bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900/40' 
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'
                }`}
              >
                 {isAttacking ? <><Square size={20} fill="currentColor" /> STOP ATTACK</> : <><Play size={20} fill="currentColor" /> START ATTACK</>}
              </button>
              <button 
                onClick={resetSimulation}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition-colors"
              >
                 <RotateCcw size={20} />
              </button>
           </div>

        </div>

        {/* RIGHT PANEL: VISUALIZATION & LOGS */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
           
           {/* 1. VISUALIZATION (Top Half) */}
           <div className="bg-[#0F1623] border border-slate-800 rounded-xl p-6 flex flex-col shadow-xl relative overflow-hidden h-1/2 min-h-[300px]">
              
              {/* Stats Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className="flex items-center gap-2">
                    <Activity className="text-emerald-500" />
                    <h2 className="text-lg font-bold text-white font-orbitron">Network Impact</h2>
                 </div>
                 <div className={`px-3 py-1 rounded text-xs font-bold border ${serverHealth > 50 ? 'bg-emerald-950/30 text-emerald-500 border-emerald-900' : 'bg-red-950/30 text-red-500 border-red-900'}`}>
                    {serverHealth > 0 ? 'ONLINE' : 'OFFLINE'}
                 </div>
              </div>

              {/* Health Bar */}
              <div className="mb-4 relative z-10">
                 <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                    <span>Server Integrity</span>
                    <span className={serverHealth < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}>{Math.floor(serverHealth)}%</span>
                 </div>
                 <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-300 ${
                         serverHealth > 70 ? 'bg-emerald-500' : 
                         serverHealth > 30 ? 'bg-yellow-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${serverHealth}%` }}
                    ></div>
                 </div>
              </div>

              {/* Grid Canvas */}
              <div className="flex-1 bg-[#05080F] border border-slate-800 rounded-lg relative overflow-hidden group">
                 {/* Grid Background */}
                 <div 
                   className="absolute inset-0 opacity-20" 
                   style={{ 
                      backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', 
                      backgroundSize: '40px 40px' 
                   }}
                 ></div>

                 {/* Target Server (Center) */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                       serverHealth <= 0 ? 'bg-red-950/50 border-red-500 shadow-[0_0_30px_#dc2626]' : 
                       isAttacking ? 'bg-slate-900/80 border-orange-500 shadow-[0_0_20px_#f97316]' : 
                       'bg-slate-900/80 border-emerald-500 shadow-[0_0_20px_#10b981]'
                    }`}>
                       <Server size={32} className={serverHealth <= 0 ? 'text-red-500' : isAttacking ? 'text-orange-500' : 'text-emerald-500'} />
                    </div>
                 </div>

                 {/* Attack Particles */}
                 {packets.map(p => (
                    <div 
                      key={p.id}
                      className="absolute w-1.5 h-1.5 rounded-full z-10"
                      style={{
                         backgroundColor: p.color,
                         left: p.x,
                         top: p.y,
                         boxShadow: `0 0 6px ${p.color}`
                      }}
                    ></div>
                 ))}

                 {/* Offline Overlay */}
                 {serverHealth <= 0 && (
                    <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm z-30 flex items-center justify-center">
                       <div className="text-center">
                          <AlertTriangle size={48} className="text-red-500 mx-auto mb-2 animate-bounce" />
                          <h2 className="text-2xl font-orbitron font-bold text-white">CONNECTION LOST</h2>
                          <p className="text-red-300 font-mono text-xs">Target Unresponsive (503)</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {/* 2. TERMINAL LOGS (Bottom Half) - Replaces empty space */}
           <div className="flex-1 bg-[#05080F] border border-slate-800 rounded-xl flex flex-col shadow-xl overflow-hidden min-h-[250px]">
              <div className="p-2 bg-[#0F1623] border-b border-slate-800 flex items-center gap-2">
                 <TerminalIcon size={14} className="text-slate-400" />
                 <span className="text-xs font-bold text-slate-300 font-mono">EXADOS_CONSOLE_OUTPUT</span>
              </div>
              <div 
                 ref={terminalRef}
                 className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-black/50 custom-scrollbar"
              >
                 {logs.length === 0 && !isAttacking && (
                    <div className="text-slate-600 italic">Ready to launch. Awaiting command...</div>
                 )}
                 {logs.map(log => (
                    <div key={log.id} className={`${log.color} break-all`}>
                       {log.text}
                    </div>
                 ))}
                 {/* Cursor Blinking */}
                 {isAttacking && <div className="animate-pulse text-emerald-500">_</div>}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
