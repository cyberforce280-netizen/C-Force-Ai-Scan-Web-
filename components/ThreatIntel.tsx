import React, { useState } from 'react';
import { 
  Shield, Search, Zap, Globe, AlertTriangle, 
  FileText, Activity, Map as MapIcon, Lock, Share2, 
  AlertOctagon, Info, CheckCircle, Database,
  Terminal, ChevronRight, X, Radar
} from 'lucide-react';
import { quickAnalyze } from '../services/geminiService';

// --- Types ---

interface ThreatIndicator {
  id: string;
  type: 'IP' | 'DOMAIN' | 'HASH' | 'URL';
  value: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number; // 0-100
  classification: string;
  campaign?: string;
  firstSeen: string;
  lastSeen: string;
  sources: number;
  region: string;
}

// --- Mock Data ---

const MOCK_FEED: ThreatIndicator[] = [
  {
    id: 'ioc-001',
    type: 'IP',
    value: '103.45.2.1',
    riskLevel: 'CRITICAL',
    confidence: 95,
    classification: 'C2 Infrastructure',
    campaign: 'Lazarus Group',
    firstSeen: '2023-10-25',
    lastSeen: '2m ago',
    sources: 12,
    region: 'APAC'
  },
  {
    id: 'ioc-002',
    type: 'HASH',
    value: '7f8d9c...a1b2',
    riskLevel: 'HIGH',
    confidence: 88,
    classification: 'Ransomware Payload',
    campaign: 'LockBit 3.0',
    firstSeen: '2023-10-27',
    lastSeen: '15m ago',
    sources: 8,
    region: 'Global'
  },
  {
    id: 'ioc-003',
    type: 'DOMAIN',
    value: 'update-win-sys.com',
    riskLevel: 'MEDIUM',
    confidence: 65,
    classification: 'Phishing Landing',
    firstSeen: '2023-10-26',
    lastSeen: '1h ago',
    sources: 4,
    region: 'NA'
  },
  {
    id: 'ioc-004',
    type: 'IP',
    value: '45.33.22.11',
    riskLevel: 'LOW',
    confidence: 30,
    classification: 'Port Scanning',
    firstSeen: '2023-10-20',
    lastSeen: '4h ago',
    sources: 2,
    region: 'EU'
  }
];

// --- Sub-Components ---

const ThreatMap = ({ region }: { region?: string }) => (
  <div className="relative w-full h-48 bg-[#0F1623] rounded-lg border border-slate-800 overflow-hidden group">
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    <svg className="w-full h-full opacity-60" viewBox="0 0 400 200">
      <g fill="none" stroke="#475569" strokeWidth="1">
        <path d="M 20,60 L 70,50 L 100,70 L 80,100 L 40,90 Z" /> {/* NA */}
        <path d="M 90,120 L 120,115 L 130,160 L 100,170 Z" /> {/* SA */}
        <path d="M 170,50 L 220,45 L 210,80 L 230,120 L 190,160 L 160,90 Z" /> {/* EU/AF */}
        <path d="M 230,45 L 320,40 L 350,80 L 300,120 L 250,90 Z" /> {/* ASIA */}
        <path d="M 310,140 L 360,135 L 350,170 L 300,160 Z" /> {/* AUS */}
      </g>
      {/* Active Threat Pulsing */}
      <circle cx={region === 'APAC' ? 280 : region === 'NA' ? 60 : 190} cy={region === 'APAC' ? 70 : region === 'NA' ? 70 : 60} r="4" fill="#f59e0b" className="animate-pulse">
        <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
    <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
      GEO-INT VISUALIZATION
    </div>
  </div>
);

const ConfidenceGauge = ({ score }: { score: number }) => (
  <div className="relative flex items-center justify-center w-24 h-24">
    <svg className="w-full h-full" viewBox="0 0 36 36">
      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={score > 80 ? "#ef4444" : score > 50 ? "#f59e0b" : "#06b6d4"} strokeWidth="3" strokeDasharray={`${score}, 100`} className="animate-[spin_1s_ease-out_reverse]" />
    </svg>
    <div className="absolute flex flex-col items-center">
      <span className="text-xl font-bold font-oxanium text-white">{score}%</span>
      <span className="text-[8px] text-slate-500 uppercase tracking-widest">Confidence</span>
    </div>
  </div>
);

// --- Main Component ---

export const ThreatIntel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeIoc, setActiveIoc] = useState<ThreatIndicator | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleAnalyze = async (inputVal: string = query) => {
    if (!inputVal) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);

    // Simulate analysis delay
    setTimeout(async () => {
      // Find mock or generate generic
      const found = MOCK_FEED.find(m => m.value === inputVal) || {
        id: 'gen-' + Date.now(),
        type: inputVal.includes('.') ? 'DOMAIN' : 'HASH',
        value: inputVal,
        riskLevel: 'MEDIUM',
        confidence: 60,
        classification: 'Suspicious Artifact',
        firstSeen: '2023-11-01',
        lastSeen: 'Just now',
        sources: 2,
        region: 'Unknown'
      } as ThreatIndicator;

      setActiveIoc(found);
      
      // Call Gemini for context
      const analysis = await quickAnalyze(`Analyze risk for IOC: ${found.value} (${found.classification})`, 'risk');
      setAiAnalysis(analysis);
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const selectIoc = (ioc: ThreatIndicator) => {
    setQuery(ioc.value);
    handleAnalyze(ioc.value);
  };

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* 1. Threat Intelligence Header */}
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0B0F19]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide">THREAT INTELLIGENCE</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Shield size={10} className="inline mr-1" /> Passive CTI · Defensive
            </span>
          </div>
          <p className="text-slate-400 font-rajdhani font-medium">Defensive analysis of global cyber threats and indicators.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Threat Feed</span>
             <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold bg-cyan-950/30 px-3 py-1 rounded border border-cyan-900/50">
               <Activity size={14} /> LIVE STREAM ACTIVE
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT: Query & IOC List */}
        <div className="w-full lg:w-1/3 bg-[#0B0F19] border-r border-slate-800 flex flex-col">
          
          {/* 2. Intelligence Query Input */}
          <div className="p-6 border-b border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter IP, Domain, Hash..."
                className="w-full bg-[#0F1623] border border-slate-700 text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-amber-500 font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <Search className="absolute left-3 top-3.5 text-slate-500" size={16} />
              <button 
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || !query}
                className="absolute right-2 top-2 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? <Activity className="animate-spin" size={12} /> : <Zap size={12} />}
                ANALYZE
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
               <span>Passive Analysis · Read-only</span>
               <span>No Exploitation</span>
            </div>
          </div>

          {/* 3. IOC Feed */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="p-3 bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 sticky top-0 backdrop-blur">
                Recent Indicators (IOCs)
             </div>
             <div className="divide-y divide-slate-800">
               {MOCK_FEED.map((ioc) => (
                 <div 
                   key={ioc.id} 
                   onClick={() => selectIoc(ioc)}
                   className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors group ${activeIoc?.id === ioc.id ? 'bg-slate-800/80 border-l-2 border-amber-500' : 'border-l-2 border-transparent'}`}
                 >
                    <div className="flex justify-between items-start mb-1">
                       <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ioc.riskLevel === 'CRITICAL' ? 'bg-red-950/30 text-red-500' :
                          ioc.riskLevel === 'HIGH' ? 'bg-orange-950/30 text-orange-500' :
                          ioc.riskLevel === 'MEDIUM' ? 'bg-amber-950/30 text-amber-500' :
                          'bg-cyan-950/30 text-cyan-500'
                       }`}>
                          {ioc.riskLevel}
                       </span>
                       <span className="text-[10px] text-slate-500 font-mono">{ioc.lastSeen}</span>
                    </div>
                    <div className="font-mono text-sm text-slate-200 mb-1 truncate">{ioc.value}</div>
                    <div className="text-xs text-slate-500 flex justify-between items-center">
                       <span>{ioc.classification}</span>
                       <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* RIGHT: Intelligence Detail Panel */}
        <div className="flex-1 bg-[#080C14] overflow-y-auto custom-scrollbar p-6">
          {activeIoc ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* Header Info */}
              <div className="flex items-start justify-between">
                 <div>
                    <h2 className="text-2xl font-bold text-white font-oxanium mb-2 flex items-center gap-3">
                       {activeIoc.value}
                       <CopyButton text={activeIoc.value} />
                    </h2>
                    <div className="flex gap-4 text-xs text-slate-400 font-mono">
                       <span className="flex items-center gap-1"><Database size={12}/> {activeIoc.type}</span>
                       <span className="flex items-center gap-1"><Share2 size={12}/> {activeIoc.sources} Sources</span>
                       <span className="flex items-center gap-1"><MapIcon size={12}/> {activeIoc.region}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Risk Level</div>
                    <div className={`text-xl font-bold font-oxanium ${
                       activeIoc.riskLevel === 'CRITICAL' ? 'text-red-500' :
                       activeIoc.riskLevel === 'HIGH' ? 'text-orange-500' :
                       activeIoc.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-cyan-500'
                    }`}>
                       {activeIoc.riskLevel}
                    </div>
                 </div>
              </div>

              {/* 7. Risk & Confidence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                    <div>
                       <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Confidence Score</div>
                       <div className="text-sm text-slate-400">Based on source consensus</div>
                    </div>
                    <ConfidenceGauge score={activeIoc.confidence} />
                 </div>
                 
                 <div className="md:col-span-2 bg-[#0F1623] border border-slate-800 rounded-lg p-4">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Zap size={12} className="text-amber-500" /> AI Risk Assessment
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-mono border-l-2 border-amber-500/30 pl-3">
                       {aiAnalysis || <span className="animate-pulse">Analyzing intelligence context...</span>}
                    </p>
                 </div>
              </div>

              {/* 4. Attribution & Classification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-5">
                    <h3 className="text-slate-200 font-bold font-orbitron mb-4 flex items-center gap-2">
                       <AlertOctagon size={16} className="text-red-500" /> ATTRIBUTION
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-500 text-xs">Classification</span>
                          <span className="text-white text-sm font-bold">{activeIoc.classification}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-500 text-xs">Associated Campaign</span>
                          <span className="text-amber-400 text-sm font-bold">{activeIoc.campaign || 'Unknown / Generic'}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-500 text-xs">First Seen</span>
                          <span className="text-slate-300 text-sm font-mono">{activeIoc.firstSeen}</span>
                       </div>
                    </div>
                 </div>

                 {/* 5. Global Threat Landscape */}
                 <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-5">
                    <h3 className="text-slate-200 font-bold font-orbitron mb-4 flex items-center gap-2">
                       <Globe size={16} className="text-cyan-500" /> ORIGIN ANALYSIS
                    </h3>
                    <ThreatMap region={activeIoc.region} />
                    <div className="mt-3 text-xs text-slate-500">
                       <span className="font-bold text-slate-400">Region:</span> {activeIoc.region} (High Probability)
                    </div>
                 </div>
              </div>

              {/* 6. Sources */}
              <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-5">
                 <h3 className="text-slate-200 font-bold font-orbitron mb-4 flex items-center gap-2">
                    <Database size={16} className="text-emerald-500" /> CORRELATED SOURCES
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Public Feeds', 'OSINT Scrapers', 'Honeypot Network', 'Partner Exchange'].map((src, i) => (
                       <div key={i} className="bg-slate-900 border border-slate-800 p-2 rounded text-center">
                          <div className="text-emerald-500 mb-1 flex justify-center"><CheckCircle size={14} /></div>
                          <div className="text-[10px] text-slate-400">{src}</div>
                       </div>
                    ))}
                 </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
               <Radar size={64} className="mb-4 opacity-20 animate-spin-slow" />
               <h3 className="text-xl font-orbitron text-slate-500">AWAITING TARGET</h3>
               <p className="text-sm max-w-md text-center mt-2">
                  Select an indicator from the feed or enter a query to begin passive intelligence analysis.
               </p>
            </div>
          )}
        </div>

      </div>

      {/* Legal Footer */}
      <div className="p-2 border-t border-slate-800 bg-[#05080F] text-center">
         <p className="text-[10px] text-slate-600 flex items-center justify-center gap-2">
            <Info size={10} /> Threat intelligence is derived from publicly available sources and passive observation. No intrusion, exploitation, or unauthorized access is performed.
         </p>
      </div>

    </div>
  );
};

const CopyButton = ({ text }: { text: string }) => {
   const [copied, setCopied] = useState(false);
   const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };
   return (
      <button onClick={handleCopy} className="text-slate-500 hover:text-white transition-colors" title="Copy IOC">
         {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Share2 size={14} />}
      </button>
   )
}