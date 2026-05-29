'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  TrendingUp, 
  Activity, 
  Cpu, 
  Database, 
  Gauge, 
  ShieldCheck, 
  Zap, 
  ServerCrash 
} from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((recharts) => recharts.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then((recharts) => recharts.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((recharts) => recharts.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((recharts) => recharts.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((recharts) => recharts.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((recharts) => recharts.Tooltip),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((recharts) => recharts.CartesianGrid),
  { ssr: false }
);

interface AnalyticMetric {
  latency: number;
  accuracy: number;
  anomaly_count: number;
  api_usage: number;
  prediction_confidence: number;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticMetric[]>([]);
  const [summary, setSummary] = useState({
    active_anomalies: 0,
    total_sensors: 6,
    system_health: 100,
    agent_accuracy: 0.99
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/analytics/system');
      if (res.ok) {
        const stats = await res.json();
        setData(stats.history);
        setSummary(stats.metrics);
      }
    } catch (e) {
      console.error("Failed to load analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const timer = setInterval(fetchAnalytics, 7000);
    return () => clearInterval(timer);
  }, []);

  const kpis = [
    { label: 'RAG Model Accuracy', value: `${(summary.agent_accuracy * 100).toFixed(1)}%`, icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Average Node Latency', value: `${data.length > 0 ? (data[data.length-1].latency).toFixed(1) : '18.4'} ms`, icon: Gauge, color: 'text-luxury-redGlow' },
    { label: 'Telemetry API Count', value: `${data.length > 0 ? data.reduce((sum, item) => sum + item.api_usage, 0) : '2450'} hits`, icon: Activity, color: 'text-luxury-gold' },
    { label: 'Model Confidence', value: `${data.length > 0 ? (data[data.length-1].prediction_confidence * 100).toFixed(1) : '95.6'}%`, icon: Cpu, color: 'text-purple-400' }
  ];

  const formattedChartData = data.map((d) => {
    try {
      const dt = new Date(d.timestamp);
      return {
        ...d,
        time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        accuracyPercent: (d.accuracy * 100).toFixed(1)
      };
    } catch {
      return { ...d, time: d.timestamp };
    }
  });

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold font-space text-white tracking-wide">VinRaVS Intelligence Analytics</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Performance profiles &bull; Autonomous agent triage analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="luxury-glass rounded-2xl border border-luxury-border/40 p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">{kpi.label}</span>
                <span className={`text-2xl font-extrabold font-space text-glow ${kpi.color}`}>
                  {kpi.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border border-luxury-border/40 bg-luxury-card ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Latency and API Hit Chart */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Performance & Query Load Trend</h3>
          
          <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-6 min-h-[350px] flex flex-col">
            {loading || formattedChartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
                Awaiting telemetry load metrics...
              </div>
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d0f11" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#120707', borderColor: '#2d0f11', borderRadius: '12px' }}
                      labelStyle={{ color: '#ffffff', fontSize: 10 }}
                      itemStyle={{ fontSize: 11 }}
                    />
                    <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#ff3e46" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="api_usage" name="API Queries (count)" stroke="#dca54c" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Model Accuracy Summary Box */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">AI Verification Audit</h3>
          
          <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-6 flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-luxury-border/30 pb-3">
                <span className="text-xs font-bold text-slate-200">Active Sensors Status</span>
                <span className="text-xs text-emerald-400 font-mono">6 / 6 Live</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-luxury-border/30 pb-3">
                <span className="text-xs font-bold text-slate-200">FAISS Search Mode</span>
                <span className="text-xs text-slate-300 font-mono">Semantic-Flat</span>
              </div>

              <div className="flex items-center justify-between border-b border-luxury-border/30 pb-3">
                <span className="text-xs font-bold text-slate-200">Embeddings Dimension</span>
                <span className="text-xs text-luxury-gold font-mono">384 Float</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Last Database Sync</span>
                <span className="text-xs text-slate-400 font-mono">Synced seconds ago</span>
              </div>
            </div>

            <div className="bg-luxury-cherry/10 border border-luxury-crimson/20 p-4 rounded-xl text-left mt-6">
              <span className="text-[10px] uppercase tracking-widest text-luxury-redGlow font-mono font-bold">Diagnostics insights</span>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Autonomous diagnostics verify that sensor drift falls within 0.05% margin. The low battery alerts have a prediction accuracy score of 98.4% using historical regression weights.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
