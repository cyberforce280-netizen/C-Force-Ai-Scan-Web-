import React, { useState } from 'react';
import { 
  Search, Globe, Database, History, Link, Layout, 
  ShieldAlert, Server, Eye, FileText, CheckCircle, 
  Lock, AlertTriangle, Terminal, Activity, ChevronDown, ChevronUp
} from 'lucide-react';

// --- Types ---

type ModuleStatus = 'IDLE' | 'SCANNING' | 'COMPLETE' | 'ERROR';

interface OsintModule {
  id: string;
  title: string;
  icon: any;
  description: string;
  status: ModuleStatus;
  dataCount: number;
  details: string[];
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SAFE';
}

// --- Mock Data ---

const INITIAL_MODULES: OsintModule[] = [
  {
    id: 'ip-history',
    title: 'IP History',
    icon: History,
    description: 'Historical IP resolution records',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  },
  {
    id: 'whois',
    title: 'WHOIS History',
    icon: FileText,
    description: 'Ownership changes & registrar data',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  },
  {
    id: 'web-archive',
    title: 'Web Archives',
    icon: Database,
    description: 'Cached historical versions',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  },
  {
    id: 'backlinks',
    title: 'Backlinks',
    icon: Link,
    description: 'Incoming external references',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  },
  {
    id: 'subdomains',
    title: 'Subdomains',
    icon: Layout,
    description: 'Passive subdomain enumeration',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  },
  {
    id: 'threat-check',
    title: 'Threat Check',
    icon: ShieldAlert,
    description: 'Reputation & blacklist check',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  },
  {
    id: 'dns-hosting',
    title: 'DNS & Hosting',
    icon: Server,
    description: 'Nameservers, ASN, Provider',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  },
  {
    id: 'sitemap',
    title: 'Site Structure',
    icon: Eye,
    description: 'Indexed paths & public files',
    status: 'IDLE',
    dataCount: 0,
    details: [],
    severity: 'INFO'
  }
];

const MOCK_RESULTS: Record<string, Partial<OsintModule>> = {
  'ip-history': {
    dataCount: 12,
    details: [
      '2023-10-01: Resolved to 172.67.189.21 (Cloudflare)',
      '2022-05-15: Resolved to 104.21.55.2 (Cloudflare)',
      '2021-01-20: Resolved to 192.0.2.45 (AWS EC2)',
      '2019-11-05: Resolved to 203.0.113.10 (GoDaddy)'
    ],
    severity: 'INFO'
  },
  'whois': {
    dataCount: 5,
    details: [
      'Registrar: MarkMonitor Inc.',
      'Created: 1998-09-04',
      'Updated: 2023-08-11',
      'Registrant: Data Protected (Privacy Service)',
      'Name Servers: ns1.google.com, ns2.google.com'
    ],
    severity: 'SAFE'
  },
  'web-archive': {
    dataCount: 1540,
    details: [
      'First Snapshot: 2001-03-20',
      'Total Snapshots: 1,540',
      'Change Frequency: High',
      'Detected specific landing page change on 2023-04-01'
    ],
    severity: 'INFO'
  },
  'backlinks': {
    dataCount: 8500,
    details: [
      'Total Backlinks: ~8.5K',
      'Referring Domains: 420',
      'Top Source: techcrunch.com (High Authority)',
      'Top Source: github.com',
      'Suspicious Source: cheap-pharma-loans.xyz (Spam)'
    ],
    severity: 'WARNING'
  },
  'subdomains': {
    dataCount: 14,
    details: [
      'www.example.com',
      'api.example.com',
      'dev.example.com (Exposed)',
      'stage.example.com',
      'mail.example.com',
      'vpn.example.com'
    ],
    severity: 'WARNING'
  },
  'threat-check': {
    dataCount: 0,
    details: [
      'Google Safe Browsing: Clean',
      'VirusTotal Score: 0/88',
      'SpamHaus: Not Listed',
      'AbuseIPDB: Confidence 0%'
    ],
    severity: 'SAFE'
  },
  'dns-hosting': {
    dataCount: 8,
    details: [
      'Provider: Cloudflare, Inc.',
      'ASN: AS13335',
      'Location: United States (Anycast)',
      'MX Records: Valid (Google Workspace)',
      'SPF Record: Pass',
      'DMARC: Quarantine'
    ],
    severity: 'SAFE'
  },
  'sitemap': {
    dataCount: 45,
    details: [
      '/robots.txt detected',
      '/sitemap.xml detected',
      '/admin/ (403 Forbidden)',
      '/login/ (200 OK)',
      '/assets/docs/public_report.pdf'
    ],
    severity: 'INFO'
  }
};

export const Osint: React.FC = () => {
  const [target, setTarget] = useState('');
  const [modules, setModules] = useState<OsintModule[]>(INITIAL_MODULES);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const startAnalysis = () => {
    if (!target) return;
    setIsScanning(true);
    setScanComplete(false);
    setModules(INITIAL_MODULES.map(m => ({ ...m, status: 'SCANNING' })));
    setExpandedModule(null);

    // Simulate progressive scanning
    modules.forEach((mod, index) => {
      setTimeout(() => {
        setModules(prev => prev.map(m => {
          if (m.id === mod.id) {
            return {
              ...m,
              status: 'COMPLETE',
              ...MOCK_RESULTS[m.id]
            };
          }
          return m;
        }));
      }, 1000 + (index * 600)); // Staggered results
    });

    // Finalize
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1000 + (modules.length * 600) + 500);
  };

  const toggleExpand = (id: string) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  const getStatusColor = (mod: OsintModule) => {
    if (mod.status === 'SCANNING') return 'text-amber-500 animate-pulse';
    if (mod.status === 'IDLE') return 'text-slate-600';
    if (mod.severity === 'CRITICAL') return 'text-red-500';
    if (mod.severity === 'WARNING') return 'text-orange-500';
    if (mod.severity === 'SAFE') return 'text-emerald-500';
    return 'text-cyan-500';
  };

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* 1. Header */}
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0B0F19]">
        <div>
           <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide">OSINT INTELLIGENCE UNIT</h1>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Globe size={10} /> 100+ Sources
            </div>
          </div>
          <p className="text-slate-400 font-rajdhani font-medium">Analyze domains or IPs to extract intelligence from open sources.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Data Sources</span>
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold bg-cyan-950/30 px-3 py-1 rounded border border-cyan-900/50">
              <Database size={14} /> PUBLIC · PASSIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        
        {/* 2. Target Input (Search Engine) */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="p-1 bg-gradient-to-r from-slate-800 via-amber-900/40 to-slate-800 rounded-lg border border-slate-700 shadow-2xl">
            <div className="flex items-center bg-[#0F1623] rounded-md p-1">
              <Search className="text-slate-500 ml-4" size={20} />
              <input 
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter domain (e.g., example.com) or IP address..."
                className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none font-oxanium text-lg placeholder:text-slate-600"
                disabled={isScanning}
                onKeyDown={(e) => e.key === 'Enter' && startAnalysis()}
              />
              <button 
                onClick={startAnalysis}
                disabled={isScanning || !target}
                className={`px-8 py-3 rounded font-bold font-orbitron tracking-wider transition-all duration-300 flex items-center gap-2
                  ${isScanning 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                  }`}
              >
                {isScanning ? (
                  <><Activity className="animate-spin" size={18} /> ANALYZING</>
                ) : (
                  <><Eye size={18} /> ANALYZE</>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-3 gap-6 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-500"/> Passive Analysis</span>
            <span className="flex items-center gap-1"><Lock size={10} className="text-emerald-500"/> No Exploitation</span>
            <span className="flex items-center gap-1"><Globe size={10} className="text-emerald-500"/> Public Data Only</span>
          </div>
        </div>

        {/* 3. OSINT Modules Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {modules.map((mod) => (
            <div 
              key={mod.id}
              className={`
                bg-[#0F1623] border transition-all duration-300 rounded-lg overflow-hidden group
                ${mod.status === 'COMPLETE' ? 'border-slate-700 hover:border-amber-500/50' : 'border-slate-800'}
              `}
            >
              {/* Card Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => mod.status === 'COMPLETE' && toggleExpand(mod.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg bg-slate-900 ${getStatusColor(mod)}`}>
                    <mod.icon size={20} />
                  </div>
                  {mod.status === 'COMPLETE' && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      mod.severity === 'WARNING' ? 'bg-orange-950/30 text-orange-400 border-orange-500/30' :
                      mod.severity === 'SAFE' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {mod.dataCount > 0 ? `${mod.dataCount} Records` : 'No Data'}
                    </span>
                  )}
                  {mod.status === 'SCANNING' && <Activity size={16} className="text-amber-500 animate-spin" />}
                </div>
                
                <h3 className="text-slate-200 font-oxanium font-bold text-lg mb-1">{mod.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed h-8 line-clamp-2">{mod.description}</p>
                
                {mod.status === 'COMPLETE' && (
                  <div className="mt-4 flex justify-center">
                    {expandedModule === mod.id ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
                  </div>
                )}
              </div>

              {/* Expanded Details Panel */}
              {expandedModule === mod.id && mod.details.length > 0 && (
                <div className="bg-[#0A0E17] border-t border-slate-800 p-4 animate-in slide-in-from-top-2 duration-300">
                  <ul className="space-y-2">
                    {mod.details.map((detail, idx) => (
                      <li key={idx} className="text-xs font-mono text-slate-300 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">›</span>
                        <span className="break-all">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 5. Summary / Confidence Bar */}
        {scanComplete && (
          <div className="max-w-6xl mx-auto bg-slate-900/50 border border-slate-700 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                 <h4 className="text-white font-orbitron font-bold">INTELLIGENCE SUMMARY</h4>
                 <p className="text-slate-400 text-sm">Passive reconnaissance completed successfully.</p>
               </div>
               
               <div className="flex gap-8 text-center">
                 <div>
                   <div className="text-2xl font-bold font-oxanium text-amber-500">100+</div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest">Sources Queried</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold font-oxanium text-emerald-400">98%</div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest">Confidence</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold font-oxanium text-cyan-400">0.8s</div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest">Latency</div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Legal Footer */}
        <div className="mt-12 text-center border-t border-slate-800 pt-6">
          <p className="text-slate-600 text-[10px] max-w-2xl mx-auto leading-relaxed">
            <span className="text-amber-600 font-bold block mb-1">LEGAL NOTICE</span>
            OSINT data is collected from publicly available sources only. No authentication bypass, exploitation, denial-of-service, or active probing is conducted by this module. All intelligence is passive and compliant with standard reconnaissance frameworks.
          </p>
        </div>

      </div>
    </div>
  );
};