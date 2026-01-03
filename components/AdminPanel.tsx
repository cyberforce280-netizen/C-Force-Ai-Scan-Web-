
import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Trash2, Search, Database, 
  Terminal, AlertTriangle, CheckCircle, ScanFace, 
  Lock, UserCheck
} from 'lucide-react';
import { authService, UserData } from '../services/authService';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');

  const loadUsers = () => {
    setUsers(authService.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (username: string) => {
    if (username === 'admin') {
      alert("Cannot delete the root administrator.");
      return;
    }
    if (confirm(`Are you sure you want to revoke access for operative: ${username}?`)) {
      authService.deleteUser(username);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full bg-[#0B0F19] text-slate-200 flex flex-col font-rajdhani overflow-hidden">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-red-900/30 flex justify-between items-center bg-[#05080F]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
              CLASSIFIED DATABASE
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-red-950/30 text-red-500 border border-red-900/50 flex items-center gap-1">
              <Lock size={10} /> TOP SECRET // ADMIN EYES ONLY
            </span>
          </div>
          <p className="text-red-400/60 font-mono text-xs">Access Control List & Identity Management.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="p-2 bg-red-900/10 border border-red-900/30 rounded flex items-center gap-2">
              <Database size={16} className="text-red-500" />
              <span className="text-xl font-oxanium font-bold text-white">{users.length}</span>
              <span className="text-[10px] text-slate-500 uppercase">Records</span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Operative ID or Name..."
              className="w-full bg-[#0F1623] border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded focus:outline-none focus:border-red-500 font-mono text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-red-900/20 border border-red-900/50 text-red-400 hover:text-white hover:bg-red-900/40 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
               <AlertTriangle size={14} /> Audit Log
             </button>
          </div>
        </div>

        {/* Database Table */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#0F1623]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Clearance Level</th>
                <th className="px-6 py-4">Biometrics</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.username} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded bg-slate-800 border flex items-center justify-center ${
                         user.role === 'ADMINISTRATOR' ? 'border-red-900/50 text-red-500' : 'border-slate-700 text-slate-400'
                      }`}>
                         {user.role === 'ADMINISTRATOR' ? <Shield size={18} /> : <Users size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white font-oxanium flex items-center gap-2">
                           {user.username}
                           {user.role === 'ADMINISTRATOR' && <span className="text-[9px] bg-red-600 text-white px-1 rounded">ADMIN</span>}
                        </div>
                        <div className="text-xs text-slate-500">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                        <span className={`text-xs font-mono font-bold ${
                           user.role === 'ADMINISTRATOR' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                           {user.role}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">{user.level}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     {user.hasFaceId ? (
                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-950/20 px-2 py-1 rounded w-fit border border-emerald-900/30">
                           <ScanFace size={14} /> ENROLLED
                        </div>
                     ) : (
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-800/50 px-2 py-1 rounded w-fit border border-slate-700">
                           <UserCheck size={14} /> PENDING
                        </div>
                     )}
                  </td>
                  <td className="px-6 py-4">
                     {user.lastLogin ? (
                        <div className="text-xs text-slate-300 font-mono">
                           {new Date(user.lastLogin).toLocaleString()}
                        </div>
                     ) : (
                        <span className="text-xs text-slate-600 italic">Never</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                     {user.username !== 'admin' && (
                        <button 
                           onClick={() => handleDelete(user.username)}
                           className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-950/30 rounded transition-all"
                           title="Revoke Access"
                        >
                           <Trash2 size={16} />
                        </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
             <div className="p-8 text-center text-slate-500">
                <Terminal size={32} className="mx-auto mb-2 opacity-50" />
                <p>No operatives found matching criteria.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
