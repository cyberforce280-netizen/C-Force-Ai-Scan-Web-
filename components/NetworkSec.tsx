import React, { useState, useEffect } from 'react';
import { 
  Activity, Shield, Network, Globe, Server, 
  Wifi, Lock, AlertTriangle, Search, CheckCircle, 
  Zap, Navigation, Radio, Info, Layers
} from 'lucide-react';

// --- Types ---

interface PortService {
  port: number;
  protocol: string;
  service: string;
  state: 'OPEN' | 'FILTERED' | 'CLOSED';
  banner?: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface NetworkTarget {
  ip: string;
  domain?: string;
  asn: string;
  isp: string;
  location: string;
  ports: PortService[];
  firewallDetected: boolean;
  reputationScore: number; // 0-100 (100 = clean)
  lastSeen: string;
}

// --- Mock Data Generators ---

const generateMockData = (input: string): NetworkTarget => {
  return {
    ip: input.match(/^\d/) ? input : '104.21.55.2',
    domain: input.match(/^\d/) ? undefined : input,
    asn: 'AS13335 (Cloudflare, Inc.)',
    isp: 'Cloudflare',
    location: 'San Francisco, US',
    firewallDetected: true,
    reputationScore: 85,
    lastSeen: new Date().toISOString(),
    ports: [
      { port: 80, protocol: 'TCP', service: 'HTTP', state: 'OPEN', banner: 'nginx', risk: 'LOW' },
      { port: 443, protocol: 'TCP', service: 'HTTPS', state: 'OPEN', banner: 'TLSv1.3', risk: 'LOW' },
      { port: 22, protocol: 'TCP', service: 'SSH', state: 'FILTERED', risk: 'MEDIUM' },
      { port: 8080, protocol: 'TCP', service: 'HTTP-ALT', state: 'OPEN', banner: 'Jetty 9.4', risk: 'MEDIUM' },
      { port: 3389, protocol: 'TCP', service: 'RDP', state: 'FILTERED', risk: 'HIGH' }
    ]
  };
};

// --- Sub-Components ---

const TopologyNode = ({ x, y, label, type, status, risk }: any) => (
  <g className="cursor-pointer group hover:opacity-100 opacity-90 transition-opacity">
    <circle 
      cx={x} cy={y} 
      r={type === 'CORE' ? 25 : 12} 
      className={`
        ${type === 'CORE' ? 'fill-blue-900/40 stroke-blue-500' : 'fill-slate-900/80'}
        stroke-2 transition-all duration-300
        ${risk === 'HIGH' ? 'stroke-red-500' : risk === 'MEDIUM' ? 'stroke-amber-500' : 'stroke-cyan-500'}
      `}
    />
    {type === 'CORE' && (
      <circle cx={x} cy={y} r={35} className="fill-none stroke-blue-500/20 animate-pulse-slow stroke-1" />
    )}
    <text 
      x={x} y={y + (type === 'CORE' ? 45 : 25)} 
      textAnchor="middle" 
      className={`text-[10px] font-mono fill-slate-300 font-bold ${type === 'CORE' ? 'text-xs' : ''}`}
    >
      {label}
    </text>
    {status === 'OPEN' && (
      <circle cx={x+8} cy={y-8} r={3} className="fill-emerald-500 animate-pulse" />
    )}
  </g>
);

const TopologyLink = ({ start, end, active }: any) => (
  <line 
    x1={start.x} y1={start.y} 
    x2={end.x} y2={end.y} 
    className={`stroke-1 transition-all duration-1000 ${active ? 'stroke-cyan-500/50' : 'stroke-slate-700/30'}`} 
    strokeDasharray={active ? "4,4" : "0"}
  />
);

const NetworkTopology = ({ data, scanning }: { data: NetworkTarget | null, scanning: boolean }) => {
  if (!data && !scanning) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-lg bg-[#0F1623] border-dashed">
      <Network size={48} className="mb-4 opacity-50" />
      <p className="font-oxanium text-sm">Waiting for Target Analysis...</p>
    </div>
  );

  const cx = 300;
  const cy = 200;
  const radius = 120;
  
  // Create circular layout for ports
  const nodes = data?.ports.map((p, i, arr) => {
    const angle = (i / arr.length) * 2 * Math.PI - (Math.PI / 2);
    return {
      ...p,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }) || [];

  return (
    <div className="h-full bg-[#0F1623] border border-slate-800 rounded-lg relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Layers size={16} className="text-blue-500" />
        <span className="text-xs font-bold text-slate-300 font-oxanium">TOPOLOGY MAP</span>
      </div>
      
      <svg className="w-full h-full" viewBox="0 0 600 400">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Grid */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.4" />

        {/* Links */}
        {nodes.map((node, i) => (
          <TopologyLink key={i} start={{x: cx, y: cy}} end={node} active={!scanning} />
        ))}

        {/* Core Node (Target) */}
        <TopologyNode 
          x={cx} y={cy} 
          label={data?.ip || "TARGET"} 
          type="CORE" 
          risk={data?.reputationScore && data.reputationScore < 50 ? 'HIGH' : 'LOW'} 
        />

        {/* Service Nodes */}
        {nodes.map((node, i) => (
          <TopologyNode 
            key={i} 
            x={node.x} y={node.y} 
            label={`${node.port}/${node.service}`} 
            type="SERVICE" 
            status={node.state}
            risk={node.risk}
          />
        ))}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 p-2 rounded border border-slate-700 backdrop-blur text-[10px] text-slate-400">
        <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Open Service</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full border border-slate-500"></div> Filtered/Closed</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-red-500"></div> High Risk Port</div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const NetworkSec: React.FC = () => {
  const [targetInput, setTargetInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [networkData, setNetworkData] = useState<NetworkTarget | null>(null);

  const handleAnalyze = () => {
    if (!targetInput) return;
    setIsAnalyzing(true);
    setNetworkData(null);
    
    // Simulate scan delay
    setTimeout(() => {
      setNetworkData(generateMockData(targetInput));
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* 1. Header */}
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0B0F19]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide">NETWORK SECURITY MONITOR</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Live Visibility
            </span>
          </div>
          <p className="text-slate-400 font-rajdhani font-medium">Real-time visibility into network exposure and infrastructure risks.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Status</span>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-950/30 px-3 py-1 rounded border border-emerald-900/50">
              <Activity size={14} /> PASSIVE MONITORING ACTIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* 2. Target Input */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 shadow-xl">
             <div className="flex items-center bg-[#0F1623] rounded-md p-1">
               <Globe className="text-slate-500 ml-4" size={20} />
               <input 
                 type="text" 
                 value={targetInput}
                 onChange={(e) => setTargetInput(e.target.value)}
                 placeholder="Enter IP address (e.g. 192.168.1.5) or CIDR..."
                 className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none font-oxanium text-lg placeholder:text-slate-600"
                 onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
               />
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing || !targetInput}
                 className={`px-6 py-3 rounded font-bold font-orbitron tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    isAnalyzing ? 'bg-slate-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white'
                 }`}
               >
                 {isAnalyzing ? <Activity className="animate-spin" /> : <Wifi />}
                 {isAnalyzing ? 'SCANNING...' : 'ANALYZE NETWORK'}
               </button>
             </div>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-2 flex justify-center gap-4 font-mono">
             <span>:: PASSIVE INSPECTION ONLY</span>
             <span>:: NO PACKET INJECTION</span>
             <span>:: READ-ONLY MODE</span>
          </p>
        </div>

        {/* 3. Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          
          {/* Left: Visualization */}
          <div className="lg:col-span-2 flex flex-col gap-4">
             <div className="flex-1 min-h-[400px]">
               <NetworkTopology data={networkData} scanning={isAnalyzing} />
             </div>
             
             {/* Risk Summary Bar */}
             {networkData && (
                <div className="h-32 bg-[#0F1623] border border-slate-800 rounded-lg p-4 flex items-center justify-around animate-in fade-in slide-in-from-bottom-4">
                   <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Exposure Level</div>
                      <div className="text-2xl font-oxanium font-bold text-orange-500">MODERATE</div>
                      <div className="text-xs text-slate-400 mt-1">5 Exposed Ports</div>
                   </div>
                   <div className="w-px h-12 bg-slate-800"></div>
                   <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Reputation</div>
                      <div className="text-2xl font-oxanium font-bold text-emerald-500">{networkData.reputationScore}/100</div>
                      <div className="text-xs text-slate-400 mt-1">Clean Record</div>
                   </div>
                   <div className="w-px h-12 bg-slate-800"></div>
                   <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Firewall</div>
                      <div className={`text-2xl font-oxanium font-bold ${networkData.firewallDetected ? 'text-emerald-500' : 'text-red-500'}`}>
                         {networkData.firewallDetected ? 'DETECTED' : 'MISSING'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">WAF / Filtering</div>
                   </div>
                </div>
             )}
          </div>

          {/* Right: Modules */}
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            
            {/* Module 1: ASN & Geo */}
            <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-4">
               <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/50">
                  <Globe className="text-blue-500" size={18} />
                  <h3 className="font-oxanium font-bold text-slate-200">ASN & Routing</h3>
               </div>
               {networkData ? (
                 <div className="space-y-3 text-sm font-mono text-slate-300">
                    <div className="flex justify-between">
                       <span className="text-slate-500">Target IP:</span>
                       <span className="text-white">{networkData.ip}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500">Location:</span>
                       <span className="text-white flex items-center gap-1">
                          <Navigation size={12} /> {networkData.location}
                       </span>
                    </div>
                    <div className="flex flex-col gap-1 mt-2 p-2 bg-slate-900 rounded border border-slate-800">
                       <span className="text-[10px] text-slate-500 uppercase">Autonomous System</span>
                       <span className="text-amber-400">{networkData.asn}</span>
                       <span className="text-xs text-slate-400">{networkData.isp}</span>
                    </div>
                 </div>
               ) : (
                 <div className="text-center py-8 text-slate-600 text-xs italic">Awaiting analysis...</div>
               )}
            </div>

            {/* Module 2: Open Services */}
            <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-4 flex-1">
               <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/50">
                  <Server className="text-orange-500" size={18} />
                  <h3 className="font-oxanium font-bold text-slate-200">Detected Services</h3>
               </div>
               {networkData ? (
                  <div className="space-y-2">
                     {networkData.ports.map((p) => (
                        <div key={p.port} className="flex items-center justify-between p-2 bg-slate-900/50 rounded hover:bg-slate-800 transition-colors border border-slate-800/50">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                 p.state === 'OPEN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'
                              }`}></div>
                              <div>
                                 <div className="font-bold font-mono text-sm text-slate-200">{p.port} / {p.protocol}</div>
                                 <div className="text-[10px] text-slate-500 uppercase">{p.service} {p.banner && `· ${p.banner}`}</div>
                              </div>
                           </div>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              p.risk === 'HIGH' ? 'bg-red-950/30 text-red-500 border-red-900/50' :
                              p.risk === 'MEDIUM' ? 'bg-amber-950/30 text-amber-500 border-amber-900/50' :
                              'bg-blue-950/30 text-blue-400 border-blue-900/50'
                           }`}>
                              {p.risk}
                           </span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-8 text-slate-600 text-xs italic">Awaiting analysis...</div>
               )}
            </div>

            {/* Module 3: Signals */}
            <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-4">
               <div className="flex items-center gap-2 mb-3">
                  <Radio className="text-purple-500" size={18} />
                  <h3 className="font-oxanium font-bold text-slate-200">Signals</h3>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                     <Lock size={16} className="mx-auto text-slate-500 mb-1" />
                     <div className="text-[10px] text-slate-400">Encryption</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                     <AlertTriangle size={16} className="mx-auto text-amber-500 mb-1" />
                     <div className="text-[10px] text-slate-400">Misconfig</div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer Legal */}
      <div className="p-2 border-t border-slate-800 bg-[#05080F] text-center">
         <p className="text-[10px] text-slate-600 flex items-center justify-center gap-2">
            <Info size={10} /> Network analysis is based on publicly observable data only. No packet interception, injection, or intrusive scanning is performed.
         </p>
      </div>

    </div>
  );
};