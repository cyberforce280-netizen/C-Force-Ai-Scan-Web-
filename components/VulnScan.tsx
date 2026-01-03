import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, ScanLine, AlertTriangle, CheckCircle, FileWarning, Terminal, 
  ShieldAlert, Lock, Server, Activity, ChevronRight, ChevronDown, 
  Info, AlertOctagon, Search, Shield 
} from 'lucide-react';

// --- Types ---

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type Category = 'MISCONFIG' | 'EXPOSED' | 'OUTDATED' | 'SSL' | 'CVE' | 'INFO_DISC';

interface VulnFinding {
  id: string;
  title: string;
  severity: Severity;
  cvss: number;
  component: string;
  description: string;
  category: Category;
  method: string;
}

interface ScanLog {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface CategoryGroup {
  id: Category;
  label: string;
  icon: any;
}

// --- Mock Data ---

const MOCK_FINDINGS: VulnFinding[] = [
  {
    id: 'V-102',
    title: 'Apache 2.4.49 Path Traversal',
    severity: 'CRITICAL',
    cvss: 9.8,
    component: 'Web Server (Apache)',
    description: 'Version 2.4.49 is vulnerable to path traversal (CVE-2021-41773). Immediate patching required.',
    category: 'CVE',
    method: 'Passive Banner Analysis'
  },
  {
    id: 'V-205',
    title: 'Exposed .git Directory',
    severity: 'HIGH',
    cvss: 7.5,
    component: 'Web Root',
    description: 'Publicly accessible .git repository allows reconstruction of source code.',
    category: 'INFO_DISC',
    method: 'Passive URI Check'
  },
  {
    id: 'V-310',
    title: 'Open Port 3389 (RDP)',
    severity: 'HIGH',
    cvss: 7.1,
    component: 'Network / Firewall',
    description: 'Remote Desktop Protocol exposed to public internet. High risk of brute-force attacks.',
    category: 'EXPOSED',
    method: 'Passive Port Sweep'
  },
  {
    id: 'V-401',
    title: 'Missing HSTS Header',
    severity: 'MEDIUM',
    cvss: 4.5,
    component: 'HTTP Response',
    description: 'Strict-Transport-Security header not present, allowing potential SSL stripping.',
    category: 'MISCONFIG',
    method: 'Header Analysis'
  },
  {
    id: 'V-505',
    title: 'TLS 1.0/1.1 Enabled',
    severity: 'MEDIUM',
    cvss: 4.3,
    component: 'SSL/TLS Config',
    description: 'Deprecated SSL/TLS protocols are supported by the server.',
    category: 'SSL',
    method: 'Handshake Simulation'
  },
  {
    id: 'V-600',
    title: 'Server Banner Disclosure',
    severity: 'LOW',
    cvss: 2.5,
    component: 'HTTP Header',
    description: 'Detailed server version information disclosed in HTTP headers.',
    category: 'MISCONFIG',
    method: 'Header Analysis'
  }
];

const CATEGORIES: CategoryGroup[] = [
  { id: 'MISCONFIG', label: 'Security Misconfigurations', icon: FileWarning },
  { id: 'EXPOSED', label: 'Exposed Services', icon: Server },
  { id: 'OUTDATED', label: 'Outdated Software', icon: Activity },
  { id: 'SSL', label: 'SSL / TLS Issues', icon: Lock },
  { id: 'CVE', label: 'Known CVEs', icon: AlertOctagon },
  { id: 'INFO_DISC', label: 'Information Disclosure', icon: Info },
];

// --- Helpers ---

const getSeverityStyles = (sev: Severity) => {
  switch (sev) {
    case 'CRITICAL': return 'text-red-500 bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    case 'HIGH': return 'text-orange-500 bg-orange-950/30 border-orange-500/50';
    case 'MEDIUM': return 'text-amber-500 bg-amber-950/30 border-amber-500/50';
    case 'LOW': return 'text-blue-500 bg-blue-950/30 border-blue-500/50';
    case 'INFO': return 'text-cyan-500 bg-cyan-950/30 border-cyan-500/50';
  }
};

const getSeverityBadge = (sev: Severity) => {
  switch (sev) {
    case 'CRITICAL': return 'bg-red-600 text-white';
    case 'HIGH': return 'bg-orange-600 text-white';
    case 'MEDIUM': return 'bg-amber-600 text-black';
    case 'LOW': return 'bg-blue-600 text-white';
    case 'INFO': return 'bg-cyan-600 text-black';
  }
};

// --- Component ---

export const VulnScan: React.FC = () => {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [findings, setFindings] = useState<VulnFinding[]>([]);
  const [expandedCats, setExpandedCats] = useState<Record<Category, boolean>>({
    'MISCONFIG': true, 'EXPOSED': true, 'OUTDATED': true, 'SSL': true, 'CVE': true, 'INFO_DISC': true
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: ScanLog['type'] = 'info') => {
    const now = new Date();
    // Manual formatting to include milliseconds while avoiding fractionalSecondDigits type error
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const msStr = now.getMilliseconds().toString().padStart(3, '0');
    const timestamp = `${timeStr}.${msStr}`;
    setLogs(prev => [...prev, { id: Date.now(), timestamp, message, type }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleCategory = (cat: Category) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const startScan = () => {
    if (!target) return;
    setIsScanning(true);
    setScanComplete(false);
    setLogs([]);
    setFindings([]);

    // Simulation Sequence
    const steps = [
      { delay: 500, msg: `Initializing passive scan for target: ${target}`, type: 'info' },
      { delay: 1200, msg: 'Resolving DNS and checking reachability...', type: 'info' },
      { delay: 2000, msg: 'Starting passive banner grabbing...', type: 'info' },
      { delay: 2800, msg: 'Analyzing HTTP security headers...', type: 'info' },
      { delay: 3500, msg: 'Checking SSL/TLS configuration chain...', type: 'info' },
      { delay: 4200, msg: 'WARN: Deprecated TLS protocol detected.', type: 'warning' },
      { delay: 5000, msg: 'Querying public CVE databases for known versions...', type: 'info' },
      { delay: 5800, msg: 'CRITICAL: Vulnerable Apache version identified.', type: 'error' },
      { delay: 6500, msg: 'Scanning for information leaks (OSINT)...', type: 'info' },
      { delay: 7200, msg: 'Correlating findings with C-Force AI Threat Database...', type: 'success' },
      { delay: 8000, msg: 'Scan completed. Generating report.', type: 'success' },
    ];

    let totalDelay = 0;
    steps.forEach((step, index) => {
      totalDelay += step.delay;
      setTimeout(() => {
        // @ts-ignore
        addLog(step.msg, step.type);
        if (index === steps.length - 1) {
          setIsScanning(false);
          setScanComplete(true);
          setFindings(MOCK_FINDINGS);
        }
      }, totalDelay);
    });
  };

  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const overallRiskScore = findings.length > 0 ? Math.min(100, (criticalCount * 25) + (highCount * 10) + 20) : 0;

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* 1. Header Section */}
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0B0F19]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide">VULNERABILITY ASSESSMENT</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
              C-Force AI
            </span>
          </div>
          <p className="text-slate-400 font-rajdhani font-medium">Passive, non-intrusive analysis of exposed security weaknesses.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Mode</span>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-950/30 px-3 py-1 rounded border border-emerald-900/50">
              <Shield size={14} /> PASSIVE · READ-ONLY
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Scan Controls & Findings */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8">
          
          {/* 2. Target Input */}
          <div className="mb-8 p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 shadow-xl max-w-4xl mx-auto w-full">
            <div className="flex items-center bg-[#0F1623] rounded-md p-1">
              <Search className="text-slate-500 ml-4" size={20} />
              <input 
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter domain, IP address or hostname (e.g., assets.corp.net)"
                className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none font-oxanium text-lg placeholder:text-slate-600"
                disabled={isScanning}
              />
              <button 
                onClick={startScan}
                disabled={isScanning || !target}
                className={`px-8 py-3 rounded font-bold font-orbitron tracking-wider transition-all duration-300 flex items-center gap-2
                  ${isScanning 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                  }`}
              >
                {isScanning ? (
                  <><Scan className="animate-spin" size={18} /> SCANNING</>
                ) : (
                  <><ScanLine size={18} /> START SCAN</>
                )}
              </button>
            </div>
          </div>

          {/* 3. Findings Panel */}
          <div className="max-w-4xl mx-auto w-full space-y-6 pb-20">
            {!scanComplete && !isScanning && (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                <ShieldAlert size={64} className="mx-auto text-slate-700 mb-4" />
                <h3 className="text-xl text-slate-500 font-orbitron">Ready for Assessment</h3>
                <p className="text-slate-600">Enter a target to begin passive vulnerability enumeration.</p>
              </div>
            )}

            {(scanComplete || isScanning) && CATEGORIES.map((cat) => {
              const catFindings = findings.filter(f => f.category === cat.id);
              if (catFindings.length === 0 && scanComplete) return null;
              if (catFindings.length === 0 && isScanning) return null; // Don't show empty cats during scan

              return (
                <div key={cat.id} className="border border-slate-800 bg-[#0F1623] rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors border-b border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon className="text-slate-400" size={20} />
                      <h3 className="font-bold text-slate-200 font-oxanium tracking-wide">{cat.label}</h3>
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">{catFindings.length}</span>
                    </div>
                    {expandedCats[cat.id] ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                  </button>
                  
                  {expandedCats[cat.id] && (
                    <div className="divide-y divide-slate-800/50">
                      {catFindings.map((vuln) => (
                        <div key={vuln.id} className="p-4 hover:bg-slate-800/30 transition-colors group relative border-l-4 border-transparent hover:border-l-4">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            vuln.severity === 'CRITICAL' ? 'bg-red-500' : 
                            vuln.severity === 'HIGH' ? 'bg-orange-500' : 'bg-transparent'
                          }`}></div>
                          
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-sm text-xs font-bold font-orbitron tracking-wider ${getSeverityBadge(vuln.severity)}`}>
                                {vuln.severity}
                              </span>
                              <h4 className="text-lg font-bold text-slate-100">{vuln.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">CVSS</span>
                              <div className={`px-2 py-1 rounded bg-slate-800 font-mono font-bold ${
                                vuln.cvss >= 9.0 ? 'text-red-500' : 
                                vuln.cvss >= 7.0 ? 'text-orange-500' : 'text-amber-500'
                              }`}>
                                {vuln.cvss}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-slate-400 text-sm mb-3 max-w-3xl leading-relaxed">
                            {vuln.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
                            <span className="flex items-center gap-1.5">
                              <Server size={12} /> {vuln.component}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Activity size={12} /> {vuln.method}
                            </span>
                            <span className="text-slate-600">ID: {vuln.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. System Analysis Log (Side Panel) */}
        <aside className="w-96 bg-[#05080F] border-l border-slate-800 flex flex-col z-20 shadow-2xl">
          <div className="p-4 border-b border-slate-800 bg-[#080C14] flex items-center justify-between">
            <h3 className="text-slate-300 font-oxanium font-bold flex items-center gap-2">
              <Terminal size={16} className="text-amber-500" /> SYSTEM LOG
            </h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
            {logs.length === 0 && (
              <div className="text-slate-600 italic mt-4 text-center">Waiting for scan initialization...</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 animate-in fade-in duration-300">
                <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
                <span className={`break-words ${
                  log.type === 'error' ? 'text-red-400 font-bold' : 
                  log.type === 'warning' ? 'text-amber-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  {log.type === 'info' && '> '}
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* 6. Risk Summary */}
          {scanComplete && (
            <div className="p-6 border-t border-slate-800 bg-[#080C14]">
              <h4 className="text-slate-400 text-xs uppercase font-bold mb-3 tracking-widest">Assessment Summary</h4>
              <div className="flex items-end justify-between mb-2">
                 <span className="text-3xl font-orbitron font-bold text-white">
                   {overallRiskScore}/100
                 </span>
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                   overallRiskScore > 75 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                 }`}>
                   {overallRiskScore > 75 ? 'Critical Risk' : 'Elevated Risk'}
                 </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full ${overallRiskScore > 75 ? 'bg-red-500' : 'bg-amber-500'}`} 
                  style={{ width: `${overallRiskScore}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <div className="text-red-500 font-bold text-lg font-oxanium">{criticalCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Critical</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <div className="text-orange-500 font-bold text-lg font-oxanium">{highCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase">High</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <div className="text-slate-300 font-bold text-lg font-oxanium">{findings.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Notice */}
          <div className="p-3 border-t border-slate-800 bg-[#05080F] text-[10px] text-slate-600 text-center leading-tight">
             All vulnerability data is derived from passive analysis. No exploitation or active probing performed.
          </div>
        </aside>

      </div>
    </div>
  );
};