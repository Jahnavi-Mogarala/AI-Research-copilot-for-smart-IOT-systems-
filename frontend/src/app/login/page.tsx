'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVinStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldAlert, Sparkles, KeyRound, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { 
    token, 
    registerUser, 
    loginUser, 
    verifyOtpCode, 
    authLoading, 
    authError, 
    otpRequired, 
    otpEmail 
  } = useVinStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const ok = await loginUser(email, password);
      if (ok) {
        // If login does not require OTP, store token directs to dashboard
        // In our main.py, login requires OTP to demonstrate double authentication
      }
    } else if (mode === 'register') {
      await registerUser(email, password, role);
    } else if (mode === 'forgot') {
      alert("Password reset instructions sent. Demo complete.");
      setMode('login');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyOtpCode(otp);
    if (ok) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-luxury-crimson/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md">
        
        {/* Logo/Branding Header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <div className="bg-gradient-to-br from-luxury-crimson to-luxury-burgundy border border-luxury-redGlow/40 p-3 rounded-2xl shadow-[0_0_15px_rgba(158,22,28,0.3)]">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold font-space text-white tracking-wide">
            {otpRequired ? 'SECURE DUAL AUTHENTICATION' : 'ACCESS CONTROL CENTER'}
          </h2>
          <p className="text-xs text-slate-400">
            {otpRequired ? `Enter verification code dispatched to ${otpEmail}` : 'JKUAD VinRaVS 2502 AI Intelligence Node'}
          </p>
        </div>

        {/* Form Container */}
        <div className="luxury-glass border border-luxury-border/60 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-luxury-crimson/50 to-transparent"></div>
          
          {authError && (
            <div className="mb-6 px-4 py-3 rounded-xl border border-luxury-redGlow/30 bg-luxury-cherry/20 text-xs text-luxury-redGlow flex items-start gap-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {otpRequired ? (
              // OTP Form
              <motion.form 
                key="otp"
                onSubmit={handleVerifyOtp}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5 text-left"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-2">OTP Verification Code</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. 123456" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      className="w-full bg-luxury-black/60 border border-luxury-border/80 focus:border-luxury-crimson focus:outline-none rounded-xl py-3 px-4 text-center font-mono text-lg tracking-[0.4em] text-white transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 text-center">
                    Enter default verification code <span className="text-luxury-gold font-mono">123456</span> or <span className="text-luxury-gold font-mono">2502</span> to complete log-in.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-luxury-crimson to-luxury-burgundy hover:shadow-[0_0_15px_rgba(255,62,70,0.3)] text-white border border-luxury-redGlow/40 rounded-xl py-3.5 text-sm font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                >
                  {authLoading ? 'Verifying...' : 'VERIFY IDENTITY'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              // Login/Register Form
              <motion.form 
                key={mode}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-5 text-left"
              >
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-2">Email Identity</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="researcher@jkuad.edu" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-luxury-black/60 border border-luxury-border/80 focus:border-luxury-crimson focus:outline-none rounded-xl py-3 pl-12 pr-4 text-sm text-white transition-all"
                    />
                  </div>
                </div>

                {/* Password (only if not forgot) */}
                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-2">Access Keyphrase</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                      <input 
                        type="password" 
                        placeholder="••••••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-luxury-black/60 border border-luxury-border/80 focus:border-luxury-crimson focus:outline-none rounded-xl py-3 pl-12 pr-4 text-sm text-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Role Selector (only in register) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-2">Deployment Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-luxury-black/60 border border-luxury-border/80 focus:border-luxury-crimson focus:outline-none rounded-xl py-3 px-4 text-sm text-white transition-all"
                    >
                      <option value="Student">Hostel Student (Read telemetry)</option>
                      <option value="Researcher">Researcher (RAG Research access)</option>
                      <option value="Admin">System Administrator (Full panel controls)</option>
                    </select>
                  </div>
                )}

                {/* Additional controls */}
                {mode === 'login' && (
                  <div className="flex justify-between items-center text-xs mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded accent-luxury-crimson bg-luxury-black border-luxury-border" 
                      />
                      Remember node token
                    </label>
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-luxury-gold hover:text-white transition-all"
                    >
                      Recover credentials?
                    </button>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-luxury-crimson to-luxury-burgundy hover:shadow-[0_0_15px_rgba(255,62,70,0.3)] text-white border border-luxury-redGlow/40 rounded-xl py-3.5 text-sm font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                >
                  {authLoading ? 'Authorizing...' : (
                    mode === 'login' ? 'ESTABLISH LINK' : mode === 'register' ? 'CREATE PROFILE' : 'SEND DISCOVERY EMAIL'
                  )}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Mode Switcher */}
          {!otpRequired && (
            <div className="mt-6 pt-6 border-t border-luxury-border/30 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <p>
                  Deploying new terminal?{' '}
                  <button 
                    onClick={() => setMode('register')} 
                    className="text-luxury-redGlow font-bold hover:underline"
                  >
                    Register new profile
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button 
                    onClick={() => setMode('login')} 
                    className="text-luxury-redGlow font-bold hover:underline"
                  >
                    Sign in to node
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
