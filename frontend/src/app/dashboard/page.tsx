'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useVinStore, Sensor, Anomaly } from '../store';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  Flame, 
  Battery, 
  Zap, 
  ShieldAlert, 
  RefreshCw, 
  Wrench, 
  AlertTriangle,
  Play,
  FileCheck
} from 'lucide-react';

// Recharts components dynamically imported to bypass Next.js SSR hydration mismatches
const ResponsiveContainer = dynamic(
  () => import('recharts').then((recharts) => recharts.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import('recharts').then((recharts) => recharts.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((recharts) => recharts.Area),
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

export default function DashboardPage() {
  const {
    sensors,
    anomalies,
    telemetryHistory,
    fetchSensors,
    fetchAnomalies,
    fetchSensorLogs,
    resolveAnomaly,
    triggerSimulationStep,
    generateReport,
    reports,
    fetchReports
  } = useVinStore();

  const [selectedSensorId, setSelectedSensorId] = useState<string>('temp-01');
  const [forcing, setForcing] = useState(false);

  useEffect(() => {
    fetchSensors();
    fetchAnomalies();
    fetchReports();
  }, [fetchSensors, fetchAnomalies, fetchReports]);

  // Keep loading history for selected sensor
  useEffect(() => {
    if (selectedSensorId) {
      fetchSensorLogs(selectedSensorId);
    }
  }, [selectedSensorId, fetchSensorLogs]);

  // Periodic historical log loader
  useEffect(() => {
    const handle = setInterval(() => {
      if (selectedSensorId) {
        fetchSensorLogs(selectedSensorId);
      }
    }, 6000);
    return () => clearInterval(handle);
  }, [selectedSensorId, fetchSensorLogs]);

  const handleForceUpdate = async (injectAnomaly = false) => {
    setForcing(true);
    await triggerSimulationStep(injectAnomaly);
    if (selectedSensorId) {
      await fetchSensorLogs(selectedSensorId);
    }
    setForcing(false);
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'pressure': return Wind;
      case 'gas': return Flame;
      case 'battery': return Battery;
      case 'power': return Zap;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      case 'warning': return 'text-luxury-gold border-luxury-gold/20 bg-luxury-gold/5';
      case 'critical': return 'text-luxury-redGlow border-luxury-redGlow/20 bg-luxury-cherry/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/10';
    }
  };

  const activeWarnings = anomalies.filter(a => !a.resolved);
  const healthScore = Math.max(100 - (activeWarnings.length * 15), 35);
  const currentChartData = telemetryHistory[selectedSensorId] || [];

  // Formatting timestamp for Chart XAxis
  const formattedChartData = currentChartData.map((d: any) => {
    try {
      const dt = new Date(d.timestamp);
      return {
        ...d,
        time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } catch {
      return { ...d, time: d.timestamp };
    }
  });

  const selectedSensor = sensors.find(s => s.id === selectedSensorId);

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-space text-white tracking-wide">VinRaVS Telemetry Command</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Live Node: Server-Room-Alpha &bull; 6 IoT streams connected</p>
        </div>
        
        {/* Simulation Actions */}
        <div className="flex gap-3">
          <button 
            onClick={() => handleForceUpdate(false)}
            disabled={forcing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-luxury-border/60 bg-luxury-card hover:bg-luxury-cardHover text-slate-200 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${forcing ? 'animate-spin' : ''}`} />
            Tick Simulator
          </button>
          
          <button 
            onClick={() => handleForceUpdate(true)}
            disabled={forcing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-luxury-redGlow/30 bg-luxury-cherry/30 text-luxury-redGlow rounded-xl hover:bg-luxury-cherry/50 transition-all shadow-[0_0_10px_rgba(158,22,28,0.15)]"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-luxury-redGlow" />
            Inject Overheat/Discharge Anomaly
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">System Integrity</span>
          <span className={`text-2xl font-extrabold font-space text-glow ${healthScore > 80 ? 'text-emerald-400' : 'text-luxury-redGlow'}`}>
            {healthScore}%
          </span>
          <span className="text-[10px] text-slate-500">Deducted from warning counts</span>
        </div>

        <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Active Anomalies</span>
          <span className={`text-2xl font-extrabold font-space text-glow ${activeWarnings.length > 0 ? 'text-luxury-redGlow animate-pulse' : 'text-slate-300'}`}>
            {activeWarnings.length}
          </span>
          <span className="text-[10px] text-slate-500">Requiring technician validation</span>
        </div>

        <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Sensors Monitored</span>
          <span className="text-2xl font-extrabold font-space text-slate-200">
            {sensors.length}
          </span>
          <span className="text-[10px] text-slate-500">Active telemetry buses</span>
        </div>

        <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Autonomous reports</span>
          <span className="text-2xl font-extrabold font-space text-luxury-gold">
            {reports.length}
          </span>
          <button 
            onClick={generateReport}
            className="text-[9px] text-luxury-gold font-bold hover:underline self-start uppercase tracking-wider mt-1 flex items-center gap-1"
          >
            <Play className="w-2.5 h-2.5" /> Force Agent Scan
          </button>
        </div>
      </div>

      {/* Main telemetry grid & Charts */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Sensor Widgets Left */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Telemetry Streams</h3>
          
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {sensors.map((s) => {
              const Icon = getSensorIcon(s.type);
              const isSelected = selectedSensorId === s.id;
              const statusCol = getStatusColor(s.status);
              
              return (
                <div 
                  key={s.id}
                  onClick={() => setSelectedSensorId(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-luxury-crimson/10 border-luxury-redGlow/50 shadow-[0_0_12px_rgba(158,22,28,0.1)]' 
                      : 'bg-luxury-card border-luxury-border/30 hover:border-luxury-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${statusCol}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{s.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-extrabold text-white">
                      {s.current_value}
                      <span className="text-[10px] text-slate-400 ml-0.5">
                        {s.type === 'temperature' ? '°C' : s.type === 'humidity' ? '%' : s.type === 'battery' ? 'V' : s.type === 'power' ? 'W' : 'ppm'}
                      </span>
                    </span>
                    <div className={`text-[8px] font-mono uppercase font-semibold mt-1 px-1.5 py-0.5 rounded-md border ${statusCol} inline-block`}>
                      {s.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Middle */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">
              Telemetry Trend: {selectedSensor?.name || ''}
            </h3>
            <span className="text-[10px] text-luxury-gold font-mono uppercase">Streaming active</span>
          </div>

          <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-6 flex-1 min-h-[350px] flex flex-col">
            {formattedChartData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono">Loading telemetry stream buffers...</span>
              </div>
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9e161c" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#9e161c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#120707', borderColor: '#2d0f11', borderRadius: '12px' }}
                      labelStyle={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}
                      itemStyle={{ color: '#ff3e46', fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#ff3e46" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {selectedSensor && (
              <div className="mt-4 pt-4 border-t border-luxury-border/30 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Min Value</span>
                  <span className="text-xs font-bold text-slate-300">
                    {Math.min(...currentChartData.map(d => d.value), selectedSensor.current_value)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Max Value</span>
                  <span className="text-xs font-bold text-slate-300">
                    {Math.max(...currentChartData.map(d => d.value), selectedSensor.current_value)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Location Node</span>
                  <span className="text-xs font-semibold text-luxury-gold truncate">{selectedSensor.location}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Anomalies and reports section */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Active Anomalies Box */}
        <div className="flex flex-col gap-4 text-left">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Active Incident Queue</h3>
          
          <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-6 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
            {activeWarnings.length === 0 ? (
              <p className="text-center py-12 text-slate-500 text-xs font-mono">No active anomalies recorded. System secure.</p>
            ) : (
              activeWarnings.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-luxury-border/50 bg-luxury-cherry/10 flex items-start justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-luxury-redGlow shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{a.metric.toUpperCase()} Breach ({a.sensor_id})</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{a.description}</p>
                      <p className="text-[9px] text-slate-500 mt-1 font-mono">{new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => resolveAnomaly(a.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                  >
                    <Wrench className="w-3 h-3" />
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Autonomous Reports Box */}
        <div className="flex flex-col gap-4 text-left">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Autonomous AI Diagnostic Log</h3>
          
          <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-6 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
            {reports.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                <p className="text-slate-500 text-xs font-mono">No AI report logs generated.</p>
                <button 
                  onClick={generateReport}
                  className="px-3 py-1.5 text-[10px] font-bold border border-luxury-crimson/40 bg-luxury-crimson/10 text-slate-200 rounded-lg hover:bg-luxury-crimson/20"
                >
                  Generate First Audit
                </button>
              </div>
            ) : (
              reports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-xl border border-luxury-border/30 bg-luxury-card hover:bg-luxury-cardHover flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <FileCheck className="w-5 h-5 text-luxury-gold" />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-200">{rep.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{rep.summary}</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">{new Date(rep.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Modal Trigger for PDF / Report Details */}
                  <button 
                    onClick={() => {
                      alert(`--- REPORT DETAIL ---\n${rep.content}`);
                    }}
                    className="px-2.5 py-1.5 text-[10px] border border-luxury-border/50 text-slate-300 hover:border-luxury-crimson/60 hover:text-white rounded-lg transition-all"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
