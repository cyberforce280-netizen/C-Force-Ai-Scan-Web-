import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Activity, Scan, AlertTriangle, 
  Server, Wifi, Database, Lock, Clock, 
  AlertOctagon, CheckCircle, Info, Zap, 
  Target, Terminal, Cpu, Radio, Map as MapIcon,
  LayoutDashboard
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// --- Mock Data ---

const TREND_DATA = [
  { time: '00:00', level: 20 },
  { time: '04:00', level: 35 },
  { time: '08:00', level: 85 },
  { time: '12:00', level: 65 },
  { time: '16:00', level: 45 },
  { time: '20:00', level: 70 },
  { time: '23:59', level: 50 },
];

const EVENTS = [
  { id: 1, time: '10:42:05', source: 'Network Monitor', msg: 'Inbound Scan Detected (Port 445)', type: 'warning' },
  { id: 2, time: '10:41:50', source: 'Threat Intel', msg: 'IOC Match: Lazarus Group IP', type: 'critical' },
  { id: 3, time: '10:40:12', source: 'OSINT Unit', msg: 'New subdomain indexed: dev.corp.net', type: 'info' },
  { id: 4, time: '10:38:00', source: 'Vuln Scanner', msg: 'Passive Analysis Complete: 10.0.0.5', type: 'success' },
  { id: 5, time: '10:35:22', source: 'AI Analyst', msg: 'Correlation rule triggered: Brute Force', type: 'warning' },
];

// --- Sub-Components ---

const StatCard = ({ label, value, sub, icon: Icon, color, trend }: any) => (
  <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 p-4 rounded-sm relative overflow-hidden group hover:border-red-900/50 transition-all shadow-lg">
    {/* Hover Glow */}
    <div className="absolute inset-0 bg-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
      <Icon size={80} />
    </div>
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className={`p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 group-hover:text-white group-hover:border-red-900/50 transition-colors`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
          trend === 'up' ? 'text-red-400 bg-red-950/30 border border-red-900/30' : 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/30'
        }`}>
          {trend === 'up' ? '▲ RISING' : '▼ STABLE'}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <div className="text-3xl font-bold text-white font-oxanium tracking-wide drop-shadow-md">{value}</div>
      <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider mt-1">{label}</div>
      <div className="text-[10px] text-neutral-500 mt-1 font-mono">{sub}</div>
    </div>
  </div>
);

const CyberMap = () => {
  // A stylized SVG map
  return (
    <div className="relative w-full h-full bg-neutral-900/40 rounded-sm border border-neutral-800 overflow-hidden group">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" 
        style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>
      
      {/* Map SVG */}
      <svg className="w-full h-full opacity-50 grayscale hover:grayscale-0 transition-all duration-700" viewBox="0 0 800 450">
        <defs>
          <filter id="glow-map">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Simplified World Map Paths (Abstract) */}
        <g fill="none" stroke="#444" strokeWidth="1.5">
          {/* North America */}
          <path d="M 50,120 L 150,100 L 220,130 L 200,200 L 100,180 Z" className="hover:fill-red-900/20 hover:stroke-red-500 transition-colors" />
          {/* South America */}
          <path d="M 180,250 L 240,240 L 260,350 L 200,380 Z" className="hover:fill-red-900/20 hover:stroke-red-500 transition-colors" />
          {/* Europe/Africa */}
          <path d="M 350,110 L 450,100 L 420,150 L 440,250 L 380,350 L 320,200 Z" className="hover:fill-red-900/20 hover:stroke-red-500 transition-colors" />
          {/* Asia */}
          <path d="M 460,100 L 650,90 L 700,150 L 600,250 L 500,180 Z" className="hover:fill-red-900/20 hover:stroke-red-500 transition-colors" />
          {/* Australia */}
          <path d="M 620,300 L 720,290 L 700,380 L 600,360 Z" className="hover:fill-red-900/20 hover:stroke-red-500 transition-colors" />
        </g>

        {/* Attack Arcs */}
        <path d="M 200,150 Q 300,50 400,130" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse opacity-80">
           <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 600,180 Q 500,100 400,130" fill="none" stroke="#b91c1c" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse opacity-80">
           <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
        </path>
         <path d="M 400,130 Q 350,200 220,300" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse opacity-60">
           <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
        </path>

        {/* Threat Nodes */}
        <circle cx="400" cy="130" r="4" fill="#ef4444" className="animate-pulse">
           <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
           <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="150" r="3" fill="#ef4444" />
        <circle cx="600" cy="180" r="3" fill="#b91c1c" />
        <circle cx="220" cy="300" r="2" fill="#7f1d1d" />
      </svg>

      {/* Map Overlay Info */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-red-900/30 p-2 rounded text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={12} className="text-red-600" /> GLOBAL THREAT VIEW
        </div>
        <div className="text-[10px] text-neutral-600">PROJECTION: MERCATOR_DARK</div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex gap-4 text-[10px] font-bold bg-black/80 backdrop-blur p-2 rounded border border-neutral-800">
        <div className="flex items-center gap-1.5 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> CRITICAL</div>
        <div className="flex items-center gap-1.5 text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> SUSPICIOUS</div>
        <div className="flex items-center gap-1.5 text-neutral-400"><span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span> PASSIVE</div>
      </div>
    </div>
  );
};

const ModuleStatus = ({ name, status, lastUpdate, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-3 bg-neutral-900/30 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800`}>
        <Icon size={14} />
      </div>
      <div>
        <div className="text-xs font-bold text-neutral-300 font-oxanium">{name}</div>
        <div className="text-[10px] text-neutral-600 font-mono">{lastUpdate}</div>
      </div>
    </div>
    <div className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
      status === 'ACTIVE' ? 'bg-red-950/20 text-red-500 border-red-900/50' : 
      status === 'PROCESSING' ? 'bg-amber-950/20 text-amber-500 border-amber-900/50' :
      'bg-neutral-800 text-neutral-500 border-neutral-700'
    }`}>
      {status}
    </div>
  </div>
);

// --- Main Component ---

export const Dashboard: React.FC = () => {
  return (
    <div className="h-full bg-black text-neutral-200 font-rajdhani flex flex-col overflow-hidden">
      
      {/* 1. Global Dashboard Header */}
      <div className="px-8 py-6 flex justify-between items-center bg-black/50">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white font-orbitron tracking-wide">GLOBAL OVERVIEW</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-red-600/10 text-red-500 border border-red-600/20 animate-pulse">
              LIVE MONITORING
            </span>
          </div>
          <p className="text-neutral-500 font-rajdhani font-medium text-sm">Unified real-time visibility across threats, vulnerabilities, and intelligence.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-600 uppercase tracking-wider font-bold">System Status</span>
            <div className="flex items-center gap-2 text-red-500 text-sm font-bold shadow-red-500/20 drop-shadow-sm">
              <CheckCircle size={14} /> SECURE · OPERATIONAL
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0">
        
        {/* 2. Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard 
            label="Active Threats" 
            value="12" 
            sub="3 Critical Pending" 
            icon={Shield} 
            color="text-red-600" 
            trend="up"
          />
          <StatCard 
            label="Vuln Detected" 
            value="128" 
            sub="Passive Scan Results" 
            icon={Scan} 
            color="text-amber-600" 
            trend="stable"
          />
          <StatCard 
            label="OSINT Signals" 
            value="4.2K" 
            sub="Intel Gathered" 
            icon={Database} 
            color="text-slate-400" 
          />
          <StatCard 
            label="Network Alerts" 
            value="8" 
            sub="Suspicious Traffic" 
            icon={Activity} 
            color="text-red-400" 
          />
           <StatCard 
            label="Risk Score" 
            value="65" 
            sub="/ 100 (Elevated)" 
            icon={AlertTriangle} 
            color="text-orange-600" 
          />
        </div>

        {/* 3. Centerpiece Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px] mb-6">
          
          {/* Map Visualization (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <CyberMap />
            
            {/* Timeline Graph (Bottom of Map) */}
            <div className="h-32 bg-neutral-900/40 border border-neutral-800 rounded-sm p-4 relative">
              <div className="absolute top-2 left-4 z-10 text-[10px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity size={10} className="text-red-500" /> Threat Velocity
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#f5f5f5', fontSize: '12px' }}
                    itemStyle={{ color: '#ef4444' }}
                  />
                  <XAxis dataKey="time" hide />
                  <Area type="monotone" dataKey="level" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLevel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Panel (1/3 width) */}
          <div className="flex flex-col gap-4">
            
            {/* Risk Summary */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-sm p-5 relative overflow-hidden">
               {/* Red decorative line */}
               <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-900/20 to-transparent pointer-events-none"></div>

              <h3 className="text-neutral-200 font-bold font-orbitron mb-4 flex items-center gap-2">
                <AlertOctagon size={16} className="text-red-600" /> RISK EXPOSURE
              </h3>
              
              <div className="flex items-center justify-center mb-6 relative">
                 <svg viewBox="0 0 100 50" className="w-48 overflow-visible">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#262626" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 70 20" fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" strokeDasharray="100" strokeDashoffset="0" className="animate-in fade-in duration-1000 shadow-[0_0_10px_#dc2626]" />
                 </svg>
                 <div className="absolute bottom-0 text-center">
                   <div className="text-3xl font-bold text-white font-oxanium drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">MEDIUM</div>
                   <div className="text-xs text-neutral-500 uppercase tracking-widest">Exposure Level</div>
                 </div>
              </div>
              
              <div className="space-y-3 text-xs text-neutral-400">
                <div className="flex justify-between border-b border-neutral-800/50 pb-1">
                  <span>Attack Surface</span>
                  <span className="text-white font-mono">12 IPs Exposed</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/50 pb-1">
                  <span>Policy Compliance</span>
                  <span className="text-red-400 font-mono">92% Passing</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence Score</span>
                  <span className="text-neutral-300 font-mono">High (Passive)</span>
                </div>
              </div>
            </div>

            {/* Module Statuses */}
            <div className="flex-1 bg-neutral-900/40 border border-neutral-800 rounded-sm flex flex-col overflow-hidden">
               <div className="p-3 border-b border-neutral-800 bg-neutral-950">
                 <h3 className="text-xs font-bold text-neutral-400 font-orbitron uppercase tracking-widest">Module Status</h3>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                 <ModuleStatus name="Threat Intelligence" status="ACTIVE" lastUpdate="Live Stream" icon={Shield} />
                 <ModuleStatus name="OSINT Unit" status="PROCESSING" lastUpdate="2m ago" icon={Globe} />
                 <ModuleStatus name="Network Security" status="ACTIVE" lastUpdate="Live Stream" icon={Wifi} />
                 <ModuleStatus name="Vulnerability Scan" status="IDLE" lastUpdate="15m ago" icon={Scan} />
                 <ModuleStatus name="AI Analyst" status="ACTIVE" lastUpdate="Thinking..." icon={Cpu} />
               </div>
            </div>

          </div>
        </div>

        {/* 4. Activity Event Stream */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-sm p-4">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-neutral-200 font-bold font-orbitron flex items-center gap-2">
               <Terminal size={16} className="text-red-500" /> ACTIVITY STREAM
             </h3>
             <div className="flex gap-2 text-[10px]">
               <button className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700">All</button>
               <button className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700">Alerts</button>
             </div>
           </div>
           
           <div className="space-y-1">
             {EVENTS.map((evt) => (
               <div key={evt.id} className="grid grid-cols-12 gap-4 p-2 rounded hover:bg-neutral-800/50 border-l-2 border-transparent hover:border-red-600 transition-all items-center text-xs">
                 <div className="col-span-1 font-mono text-neutral-600">{evt.time}</div>
                 <div className="col-span-2 font-bold text-neutral-300 flex items-center gap-2">
                   {evt.type === 'critical' && <AlertTriangle size={12} className="text-red-600" />}
                   {evt.type === 'warning' && <AlertOctagon size={12} className="text-amber-600" />}
                   {evt.type === 'success' && <CheckCircle size={12} className="text-emerald-600" />}
                   {evt.type === 'info' && <Info size={12} className="text-blue-500" />}
                   {evt.source}
                 </div>
                 <div className="col-span-9 text-neutral-400 font-mono">{evt.msg}</div>
               </div>
             ))}
           </div>
        </div>

      </div>

      {/* Legal Footer */}
      <div className="p-2 border-t border-neutral-900 bg-black text-center">
         <p className="text-[10px] text-neutral-700 flex items-center justify-center gap-2">
            <Info size={10} /> This dashboard provides situational awareness based on passive intelligence.
         </p>
      </div>

    </div>
  );
};