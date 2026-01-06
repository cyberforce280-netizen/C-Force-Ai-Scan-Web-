
import React, { useState } from 'react';
import { 
  Globe, Search, Database, FileText, 
  MapPin, Server, Shield, Link, Share2,
  Activity, Eye, Terminal, CheckCircle
} from 'lucide-react';
import { generateOsintReport } from '../services/geminiService';

export const Osint: React.FC = () => {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleScan = async () => {
    if (!target) return;
    setLoading(true);
    setReport(null);
    try {
      const data = await generateOsintReport(target);
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const RenderCard = ({ title, icon: Icon, data, color }: any) => {
    if (!data || !data.items || data.items.length === 0) return null;
    return (
      <div className="bg-[#0F1623] border border-slate-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/50 pb-2">
          <div className="flex items-center gap-2">
             <Icon size={16} className={color} />
             <h3 className="font-bold font-oxanium text-slate-200 text-sm uppercase">{title}</h3>
          </div>
          <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800">
            {data.count} Found
          </span>
        </div>
        <ul className="space-y-2">
          {data.items.slice(0, 5).map((item: string, i: number) => (
            <li key={i} className="text-xs font-mono text-slate-400 flex items-start gap-2">
               <span className="text-slate-600 mt-0.5">›</span> 
               <span className="break-all">{item}</span>
            </li>
          ))}
          {data.items.length > 5 && (
            <li className="text-[10px] text-slate-600 italic pt-1">
              + {data.items.length - 5} more entries...
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0B0F19]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide">OSINT SCANNER</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
              DEEP SEARCH
            </span>
          </div>
          <p className="text-slate-400 font-rajdhani font-medium">Passive reconnaissance and digital footprint analysis.</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        
        {/* Search Input */}
        <div className="w-full max-w-4xl mx-auto mb-8">
           <div className="flex bg-[#0F1623] border border-slate-700 rounded-lg overflow-hidden shadow-lg transition-all focus-within:border-blue-500 focus-within:shadow-blue-900/20">
              <div className="pl-4 py-4 flex items-center justify-center">
                 <Search className="text-slate-500" />
              </div>
              <input 
                type="text" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Enter Domain, IP, Username, or Phone Number..."
                className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:outline-none font-mono text-sm placeholder:text-slate-600"
              />
              <button 
                onClick={handleScan}
                disabled={loading || !target}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 font-bold font-orbitron tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                 {loading ? <Activity className="animate-spin" /> : <Globe />}
                 SCAN TARGET
              </button>
           </div>
           <div className="flex gap-4 mt-2 justify-center text-[10px] text-slate-500 font-mono uppercase">
              <span><CheckCircle size={10} className="inline text-emerald-500" /> Public Sources</span>
              <span><CheckCircle size={10} className="inline text-emerald-500" /> Passive Mode</span>
              <span><CheckCircle size={10} className="inline text-emerald-500" /> AI Correlated</span>
           </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Eye size={24} className="text-blue-500 animate-pulse" />
                   </div>
                </div>
                <div className="text-slate-400 font-mono text-xs animate-pulse">
                   GATHERING INTELLIGENCE ON {target.toUpperCase()}...
                </div>
             </div>
           ) : report ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                <RenderCard title="WHOIS Info" icon={FileText} data={report.whois} color="text-blue-400" />
                <RenderCard title="DNS Records" icon={Server} data={report.dns_hosting} color="text-indigo-400" />
                <RenderCard title="Subdomains" icon={Share2} data={report.subdomains} color="text-cyan-400" />
                <RenderCard title="IP History" icon={Activity} data={report.ip_history} color="text-slate-400" />
                <RenderCard title="Web Archive" icon={Database} data={report.web_archive} color="text-amber-400" />
                <RenderCard title="Backlinks" icon={Link} data={report.backlinks} color="text-emerald-400" />
                <RenderCard title="Threat Check" icon={Shield} data={report.threat_check} color="text-red-400" />
                <RenderCard title="Site Map" icon={MapPin} data={report.sitemap} color="text-purple-400" />
                <RenderCard title="Cloud & Tech" icon={Terminal} data={report.ghunt} color="text-pink-400" />
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <Globe size={64} className="mb-4" />
                <div className="text-xl font-orbitron">NO TARGET ACQUIRED</div>
                <p className="font-mono text-sm mt-2">Enter a target identifier to begin passive reconnaissance.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
