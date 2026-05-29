'use client';

import React, { useEffect, useState } from 'react';
import { useVinStore } from '../store';
import { 
  Shield, 
  Users, 
  Settings, 
  Terminal, 
  Sliders, 
  Key, 
  Save, 
  UserCog, 
  BellRing,
  RefreshCw
} from 'lucide-react';

interface DBUser {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { token, user } = useVinStore();
  const [usersList, setUsersList] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings configs form states
  const [themeSetting, setThemeSetting] = useState('dark');
  const [notifState, setNotifState] = useState(true);
  const [scanInterval, setScanInterval] = useState(5);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const headers: Record<string, string> = {};
      const tk = useVinStore.getState().token;
      if (tk) headers['Authorization'] = `Bearer ${tk}`;
      
      const res = await fetch('http://localhost:8000/api/admin/users', { headers });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, currentRole: string) => {
    const nextRole = currentRole === 'Student' ? 'Researcher' : currentRole === 'Researcher' ? 'Admin' : 'Student';
    try {
      const headers: Record<string, string> = {};
      const tk = useVinStore.getState().token;
      if (tk) headers['Authorization'] = `Bearer ${tk}`;
      
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/role?new_role=${nextRole}`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error("Failed to change role", e);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings updated successfully!");
    }, 800);
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Shield className="w-12 h-12 text-luxury-redGlow animate-pulse" />
        <h2 className="text-xl font-extrabold font-space text-white">ACCESS DENIED</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          This secure terminal segment requires Administrator credentials. Please log in with an Admin account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold font-space text-white tracking-wide">VinRaVS Control Center</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">System Administrator Hub &bull; Configure sensors rules</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* User Role Management Left */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-luxury-redGlow" />
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">User Directory & Roles</h3>
          </div>

          <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-6 flex flex-col overflow-hidden bg-luxury-black/40">
            {loading ? (
              <p className="text-xs font-mono text-center text-slate-500 py-10">Querying user registry database...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-luxury-border/30 text-slate-400 uppercase tracking-wider font-mono">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Deployment Role</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} className="border-b border-luxury-border/20 hover:bg-luxury-card/30">
                        <td className="py-3.5 px-2 font-mono text-slate-500">{u.id}</td>
                        <td className="py-3.5 px-2 font-semibold text-slate-200">{u.email}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                            u.role === 'Admin' 
                              ? 'bg-luxury-crimson/15 text-luxury-redGlow border border-luxury-crimson/30'
                              : u.role === 'Researcher'
                              ? 'bg-luxury-cherry/10 text-luxury-gold border border-luxury-gold/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => handleRoleChange(u.id, u.role)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] border border-luxury-border/60 hover:border-luxury-crimson/60 hover:text-white rounded-lg transition-all"
                          >
                            <UserCog className="w-3 h-3 text-luxury-gold" />
                            Cycle Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Global Configurations Right */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-luxury-gold" />
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">System Parameters</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="luxury-glass rounded-2xl border border-luxury-border/40 p-6 flex flex-col gap-5 text-left bg-luxury-black/40">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-2">Simulation Scan Step Interval (Seconds)</label>
              <input 
                type="number" 
                min={1} 
                max={60} 
                value={scanInterval}
                onChange={(e) => setScanInterval(parseInt(e.target.value))}
                className="w-full bg-luxury-black/60 border border-luxury-border/80 focus:border-luxury-crimson focus:outline-none rounded-xl py-2.5 px-4 text-sm text-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-2">Telemetry Alert Broadcaster</label>
              <div className="flex items-center justify-between p-3 rounded-xl border border-luxury-border/40 bg-luxury-card/30">
                <span className="text-xs text-slate-300">Transmit Websocket notifications</span>
                <input 
                  type="checkbox" 
                  checked={notifState}
                  onChange={(e) => setNotifState(e.target.checked)}
                  className="w-4 h-4 accent-luxury-crimson" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-2">AI Reasoning Verbosity</label>
              <select 
                value={themeSetting}
                onChange={(e) => setThemeSetting(e.target.value)}
                className="w-full bg-luxury-black/60 border border-luxury-border/80 focus:border-luxury-crimson focus:outline-none rounded-xl py-2.5 px-4 text-sm text-white transition-all"
              >
                <option value="compact">Compact (Hide system queries)</option>
                <option value="detailed">Detailed (Standard diagnostic steps)</option>
                <option value="verbose">Verbose Debug (All FAISS scores and weights)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-luxury-crimson to-luxury-burgundy hover:shadow-[0_0_15px_rgba(255,62,70,0.3)] text-white border border-luxury-redGlow/40 rounded-xl py-3 text-xs font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating parameters...' : 'COMMIT PARAMETERS'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
