'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useVinStore } from './store';
import { 
  Activity, 
  Terminal, 
  BrainCircuit, 
  ShieldAlert, 
  Settings, 
  Bell, 
  LogOut, 
  User as UserIcon, 
  TrendingUp, 
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    token, 
    user, 
    initApp, 
    logout, 
    notifications, 
    markNotificationRead,
    anomalies,
    wsConnected
  } = useVinStore();
  
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setMounted(true);
    initApp();
  }, [initApp]);

  // Telemetry simulation ticker: tick every 5 seconds to simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      useVinStore.getState().triggerSimulationStep(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read);
  const activeWarnings = anomalies.filter(a => !a.resolved);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { label: 'Intelligence Lab', path: '/', icon: Activity },
    { label: 'Telemetry', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Research Copilot', path: '/copilot', icon: BrainCircuit },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    ...(user?.role === 'Admin' ? [{ label: 'Admin Hub', path: '/admin', icon: Settings }] : []),
  ];

  return (
    <html lang="en">
      <head>
        <title>JKUAD VinRaVS 2502 — AI Research Copilot for Smart IoT Systems</title>
        <meta name="description" content="Premium, enterprise-grade AI Research Platform and IoT Anomaly Engine powered by VinRaVS Intelligence." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-luxury-black text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {mounted && (
          <>
            {/* Top Luxury Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-luxury-border/30 luxury-glass shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                
                {/* Branding / Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-luxury-crimson/50 rounded-lg blur-md animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-luxury-crimson to-luxury-burgundy border border-luxury-redGlow/40 w-10 h-10 rounded-lg flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="font-extrabold tracking-wider font-space text-lg text-glow bg-clip-text text-transparent bg-gradient-to-r from-white via-luxury-silver to-luxury-crimson">
                      JKUAD VINRAVS <span className="text-luxury-redGlow text-xs font-light">2502</span>
                    </h1>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-luxury-gold font-medium">Intelligence Engine</p>
                  </div>
                </div>

                {/* Main Navigation Links */}
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-luxury-crimson/15 text-luxury-redGlow border border-luxury-crimson/40 shadow-[0_0_15px_rgba(158,22,28,0.15)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-luxury-redGlow' : ''}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                {/* System Controls */}
                <div className="flex items-center gap-4">
                  {/* WebSocket Connection Glow */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-luxury-border/30 bg-luxury-cherry/30 text-[10px] font-mono">
                    <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                    <span className="text-slate-400">{wsConnected ? 'STREAMING' : 'POLLING'}</span>
                  </div>

                  {/* Theme Switcher */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg border border-luxury-border/40 hover:bg-luxury-card transition-all"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-luxury-gold" /> : <Moon className="w-4 h-4 text-luxury-burgundy" />}
                  </button>

                  {/* Active Warnings Indicator */}
                  {activeWarnings.length > 0 && (
                    <div className="relative cursor-pointer" onClick={() => router.push('/dashboard')}>
                      <div className="absolute inset-0 bg-luxury-redGlow/40 rounded-full blur-sm animate-ping"></div>
                      <div className="relative bg-luxury-crimson border border-luxury-redGlow text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* Notifications Bell */}
                  <div className="relative">
                    <button 
                      onClick={() => setNotifOpen(!notifOpen)}
                      className="relative p-2 rounded-lg border border-luxury-border/40 hover:bg-luxury-card transition-all"
                    >
                      <Bell className="w-4.5 h-4.5 text-slate-300" />
                      {unreadNotifs.length > 0 && (
                        <span className="absolute top-0.5 right-0.5 bg-luxury-redGlow w-2.5 h-2.5 rounded-full border border-luxury-dark"></span>
                      )}
                    </button>
                    
                    {notifOpen && (
                      <div className="absolute right-0 mt-3 w-80 luxury-glass rounded-xl shadow-2xl border border-luxury-border/60 overflow-hidden py-2 animate-in fade-in duration-200">
                        <div className="px-4 py-2 border-b border-luxury-border/30 flex justify-between items-center bg-luxury-cherry/20">
                          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">Alert Center</h4>
                          <span className="text-[10px] text-luxury-redGlow font-mono">{unreadNotifs.length} new</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-center py-6 text-xs text-slate-500">No recent alerts logged.</p>
                          ) : (
                            notifications.map(n => (
                              <div 
                                key={n.id} 
                                onClick={() => {
                                  markNotificationRead(n.id);
                                  setNotifOpen(false);
                                  router.push('/dashboard');
                                }}
                                className={`px-4 py-3 hover:bg-luxury-cardHover border-b border-luxury-border/20 cursor-pointer flex gap-3 ${n.read ? 'opacity-60' : 'bg-luxury-crimson/5'}`}
                              >
                                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'critical' ? 'bg-luxury-redGlow' : 'bg-luxury-gold'}`}></span>
                                <div>
                                  <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auth Actions */}
                  {token ? (
                    <div className="flex items-center gap-3">
                      <div className="hidden lg:flex flex-col text-right">
                        <span className="text-xs font-semibold text-slate-200">{user?.email}</span>
                        <span className="text-[10px] font-mono text-luxury-gold uppercase tracking-wider">{user?.role}</span>
                      </div>
                      <button 
                        onClick={logout}
                        className="p-2 rounded-lg border border-luxury-border/40 hover:bg-luxury-cherry/20 hover:text-luxury-redGlow transition-all text-slate-400"
                        title="Sign Out"
                      >
                        <LogOut className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => router.push('/login')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-luxury-crimson bg-gradient-to-r from-luxury-crimson to-luxury-burgundy text-white hover:shadow-[0_0_15px_rgba(158,22,28,0.4)] transition-all duration-300"
                    >
                      <UserIcon className="w-4 h-4" />
                      System Access
                    </button>
                  )}

                </div>
              </div>
            </header>

            {/* Main Application Shell */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
              {children}
            </main>

            {/* Premium Footer */}
            <footer className="border-t border-luxury-border/30 bg-luxury-black py-8 mt-auto">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-xs text-slate-500 tracking-wider font-space">
                  JKUAD VinRaVS 2502 &bull; Smart IoT AI Copilot &bull; Powered by <span className="text-luxury-gold text-glow font-semibold">VinRaVS Intelligence Engine</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-2">
                  All rights reserved. Simulated diagnostic vector-RAG database verified active.
                </p>
              </div>
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
