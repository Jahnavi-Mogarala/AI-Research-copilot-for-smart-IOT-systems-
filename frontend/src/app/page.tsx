'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BrainCircuit, 
  Cpu, 
  Database, 
  Globe, 
  ArrowRight, 
  ShieldAlert, 
  Gauge, 
  Zap, 
  Lock,
  Layers,
  Sparkles,
  FileCheck
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const statistics = [
    { value: '99.98%', label: 'Sensor Delivery SLA', desc: 'Enterprise data streams' },
    { value: '< 15ms', label: 'AI Inference Latency', desc: 'Real-time vector lookup' },
    { value: '1.2M+', label: 'Anomalies Filtered/Day', desc: 'Automated agent triage' },
    { value: '98.6%', label: 'Diagnostic Accuracy', desc: 'RAG verification rating' }
  ];

  const features = [
    {
      title: 'Autonomous Sentinel Agent',
      desc: 'Active background process constantly reasoning over logs, flagging pre-failure metrics, and triggering exhaust and cooldown utilities.',
      icon: Cpu,
      color: 'from-amber-500 to-luxury-gold'
    },
    {
      title: 'Semantic Vector Search (RAG)',
      desc: 'Indexes manuals, logs, and configurations into FAISS tables. Resolves diagnostic inquiries with concrete citations.',
      icon: Database,
      color: 'from-luxury-crimson to-luxury-redGlow'
    },
    {
      title: 'Telemetry Dashboard',
      desc: 'Websocket-enabled sensor monitoring featuring thermal maps, UPS batteries status, hum-points, and real-time alerts.',
      icon: Gauge,
      color: 'from-pink-600 to-purple-600'
    },
    {
      title: 'Explainable AI Engine',
      desc: 'No black-box alerts. Every flagged anomaly includes an step-by-step reasoning log, threshold data, and mitigation manuals.',
      icon: BrainCircuit,
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <div className="flex flex-col gap-24 relative overflow-hidden pb-16">
      
      {/* Background glow meshes */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-luxury-crimson/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-80 right-10 w-[300px] h-[300px] bg-luxury-gold/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20">
        <motion.div 
          className="grid lg:grid-cols-12 gap-12 items-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Branding badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border border-luxury-crimson/30 bg-luxury-cherry/30 text-xs font-semibold text-luxury-redGlow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Version 2502 Build Active</span>
            </motion.div>

            {/* Main title */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight font-space"
            >
              <span className="block text-white">JKUAD</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-luxury-redGlow via-white to-luxury-gold text-glow">
                VinRaVS 2502
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-slate-400 text-lg sm:text-xl font-light leading-relaxed max-w-2xl"
            >
              The ultimate AI Research Copilot and Autonomous Diagnostics Engine for Smart IoT environments. Monitor, explain, predict, and safeguard industrial systems with cyberpunk design standards and RAG intelligence.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mt-4"
            >
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-luxury-crimson to-luxury-burgundy text-white border border-luxury-redGlow/40 hover:shadow-[0_0_25px_rgba(255,62,70,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Launch Intelligence Telemetry
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => router.push('/copilot')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-luxury-border/60 hover:border-luxury-crimson/80 bg-luxury-card hover:bg-luxury-cardHover text-slate-300 hover:text-white transition-all duration-300"
              >
                Consult Research Copilot
              </button>
            </motion.div>
          </div>

          {/* Hero Right Visual Element */}
          <motion.div 
            className="lg:col-span-5 relative flex justify-center items-center"
            variants={itemVariants}
          >
            {/* Spinning Ring */}
            <div className="absolute w-80 h-80 rounded-full border border-luxury-crimson/20 border-dashed animate-[spin_40s_linear_infinite]"></div>
            <div className="absolute w-64 h-64 rounded-full border border-luxury-redGlow/10 border-double animate-[spin_20s_linear_infinite]"></div>
            
            {/* Glowing Orb */}
            <motion.div 
              className="relative w-56 h-56 rounded-3xl luxury-glass border border-luxury-border/50 flex flex-col items-center justify-center shadow-2xl p-6 overflow-hidden"
              variants={floatVariants}
              animate="animate"
            >
              {/* Particle flow lines inside box */}
              <div className="absolute inset-0 bg-glow-gradient opacity-40"></div>
              
              <BrainCircuit className="w-16 h-16 text-luxury-redGlow mb-4 animate-[pulse_3s_infinite]" />
              <h3 className="font-space font-bold text-white text-lg">VinRaVS AI Core</h3>
              <p className="text-[10px] text-luxury-gold tracking-widest font-mono uppercase mt-1">Status: Operational</p>
              
              <div className="flex gap-1.5 mt-4 items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[9px] text-slate-400 font-mono">Telemetry RAG Loaded</span>
              </div>
            </motion.div>

            {/* Orbiting Sensor Mini-nodes */}
            <motion.div 
              className="absolute -top-4 right-12 bg-luxury-card border border-luxury-border/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs shadow-lg"
              variants={floatVariants}
              animate="animate"
              transition={{ delay: 0.5 }}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <p className="font-mono text-slate-300">Temp: 24°C</p>
                <p className="text-[8px] text-slate-500">Rack Alpha</p>
              </div>
            </motion.div>

            <motion.div 
              className="absolute -bottom-8 left-8 bg-luxury-card border border-luxury-border/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs shadow-lg"
              variants={floatVariants}
              animate="animate"
              transition={{ delay: 1 }}
            >
              <Zap className="w-3.5 h-3.5 text-luxury-gold" />
              <div>
                <p className="font-mono text-slate-300">Battery: 12.6V</p>
                <p className="text-[8px] text-slate-500">UPS Bus</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* RAG Demo Console Preview */}
      <section className="relative max-w-5xl mx-auto w-full">
        <div className="gradient-line mb-1"></div>
        <div className="luxury-glass rounded-2xl border border-luxury-border/50 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-luxury-border/40 bg-luxury-cherry/20 flex justify-between items-center">
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-luxury-crimson rounded-full"></span>
              <span className="w-3 h-3 bg-luxury-gold rounded-full"></span>
              <span className="w-3 h-3 bg-slate-600 rounded-full"></span>
            </div>
            <span className="text-xs font-mono text-slate-500">Telemetry-QA RAG Console &bull; Sandbox</span>
            <div className="w-6"></div>
          </div>
          {/* Body */}
          <div className="p-6 md:p-8 font-mono text-sm grid md:grid-cols-2 gap-8 text-left bg-luxury-black/90">
            {/* User request */}
            <div className="flex flex-col gap-4">
              <span className="text-luxury-gold text-xs font-semibold tracking-wider">INPUT INQUIRY:</span>
              <div className="bg-luxury-card border border-luxury-border/40 p-4 rounded-lg">
                <p className="text-slate-300">"Why did UPS Battery voltage drop under 11V during high server loads last night, and how can we mitigate this?"</p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-slate-500 text-xs font-semibold">COGNITIVE STEPS:</span>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li className="flex items-center gap-2"><span className="text-luxury-crimson font-bold">&gt;</span> Query parsed: battery, voltage, threshold</li>
                  <li className="flex items-center gap-2"><span className="text-luxury-crimson font-bold">&gt;</span> Querying FAISS for battery charging logs...</li>
                  <li className="flex items-center gap-2"><span className="text-luxury-crimson font-bold">&gt;</span> Retrieved manual: Battery Preventive Maintenance Guide</li>
                  <li className="flex items-center gap-2"><span className="text-luxury-crimson font-bold">&gt;</span> Running prompt generation using retrieved context</li>
                </ul>
              </div>
            </div>
            {/* Assistant response */}
            <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-luxury-border/30 pt-6 md:pt-0 md:pl-8">
              <span className="text-luxury-redGlow text-xs font-semibold tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" /> RAG CITED DIAGNOSTICS:
              </span>
              <div className="bg-luxury-cherry/10 border border-luxury-crimson/20 p-4 rounded-lg text-slate-300 text-xs leading-relaxed space-y-3">
                <p>The battery voltage dipped to **10.8V** at 22:45 UTC during the main server load peak (3,450W draw) [1].</p>
                <p>According to the **UPS specifications manual** [2], voltage profiles dropping below 11.0V indicate high internal resistance. Replacing the batteries in the Power Distribution Room is recommended [3].</p>
                <p className="text-luxury-gold font-semibold">Citations: [1] Telemetry Log: bat-01, [2] Manual: UPS Maintenance Guide, [3] Preventive Actions Schedule v2.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="flex flex-col gap-12">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
          <h2 className="text-3xl font-extrabold font-space text-white">Engineered for Industrial Severity</h2>
          <p className="text-slate-400 text-base font-light">
            An enterprise-class monitoring core backed by contextual RAG capabilities. Simple visual interfaces combined with deep cognitive assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={index}
                className="luxury-glass rounded-2xl border border-luxury-border/40 p-8 text-left relative overflow-hidden"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feat.color} opacity-5 blur-[40px] rounded-full`}></div>
                <div className={`inline-flex p-3.5 rounded-xl bg-gradient-to-br ${feat.color} border border-white/10 text-white mb-6 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-space text-white mb-3">{feat.title}</h3>
                <p className="text-slate-400 text-sm font-light leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 border-y border-luxury-border/30 bg-luxury-card/30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {statistics.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 text-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-space bg-clip-text text-transparent bg-gradient-to-r from-luxury-redGlow via-white to-luxury-gold text-glow">
                {stat.value}
              </span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest mt-1">{stat.label}</span>
              <span className="text-[10px] text-slate-500">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive FAQ */}
      <section className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold font-space text-white">System FAQs</h2>
        </div>
        
        <div className="flex flex-col gap-4 text-left">
          <div className="luxury-glass border border-luxury-border/40 p-6 rounded-xl">
            <h4 className="font-bold text-white text-base">How does the vector database FAISS load context?</h4>
            <p className="text-slate-400 text-sm font-light mt-2 leading-relaxed">
              Upon query submission, JKUAD VinRaVS indexes all active sensors telemetry, historical anomaly events, and predefined HVAC/UPS operations manuals using a custom semantic vector embedder. It then stores them in a local FAISS-flat table to instantly fetch matching snippets.
            </p>
          </div>
          
          <div className="luxury-glass border border-luxury-border/40 p-6 rounded-xl">
            <h4 className="font-bold text-white text-base">Does this require an OpenAI connection?</h4>
            <p className="text-slate-400 text-sm font-light mt-2 leading-relaxed">
              No. VinRaVS has a dual operational intelligence mode. If an `OPENAI_API_KEY` environment variable is available, the copilot will leverage GPT models. Otherwise, it triggers the built-in offline diagnostics engine to generate authentic, context-derived analyses.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-5xl mx-auto w-full mt-8">
        <div className="relative rounded-3xl luxury-glass border border-luxury-crimson/30 p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-glow-gradient opacity-30"></div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-space text-white">Secure and Supervise Your Smart Infrastructure</h2>
            <p className="text-slate-400 max-w-2xl font-light text-base leading-relaxed">
              Deploy our Docker stack and connect your physical sensors via Websocket interfaces. Let JKUAD VinRaVS handle failure diagnostics autonomously.
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-luxury-crimson to-luxury-burgundy text-white border border-luxury-redGlow/40 hover:shadow-[0_0_25px_rgba(255,62,70,0.5)] transition-all duration-300"
            >
              Sign In to Command Center
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
