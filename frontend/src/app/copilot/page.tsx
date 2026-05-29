'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useVinStore, ChatMessage } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  MessageSquarePlus, 
  Send, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Plus, 
  HelpCircle,
  Database,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CopilotPage() {
  const {
    chats,
    currentChatId,
    chatMessages,
    copilotLoading,
    fetchChats,
    createChat,
    setCurrentChatId,
    sendCopilotQuery,
    token
  } = useVinStore();

  const [input, setInput] = useState('');
  const [expandedReasoning, setExpandedReasoning] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      fetchChats();
    }
  }, [fetchChats, token]);

  // Keep messages scrolled to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCreateNewChat = async () => {
    const id = await createChat();
    if (id) {
      setCurrentChatId(id);
    }
  };

  const handleSend = async (e?: React.FormEvent, textQuery?: string) => {
    e?.preventDefault();
    const query = textQuery || input;
    if (!query.trim()) return;
    
    if (!textQuery) setInput('');
    await sendCopilotQuery(query);
  };

  const toggleReasoning = (id: number) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const suggestions = [
    "Why did temperature spike yesterday?",
    "Predict battery failure status",
    "Summarize current sensor anomalies",
    "Explain HVAC system behavior"
  ];

  return (
    <div className="flex-1 grid lg:grid-cols-12 gap-8 min-h-[550px] text-left">
      
      {/* Sidebar - Chat Conversations list */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Conversations</h3>
          <button 
            onClick={handleCreateNewChat}
            className="p-1.5 rounded-lg border border-luxury-crimson/40 hover:bg-luxury-crimson/15 text-luxury-redGlow transition-all"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="luxury-glass rounded-2xl border border-luxury-border/40 p-4 flex-1 flex flex-col gap-2 max-h-[500px] overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2">
              <MessageSquarePlus className="w-8 h-8 text-slate-600" />
              <p className="text-slate-500 text-xs font-mono">No active RAG threads.</p>
              <button 
                onClick={handleCreateNewChat}
                className="mt-2 px-3 py-1.5 text-[10px] font-bold border border-luxury-crimson/40 bg-luxury-crimson/10 text-white rounded-lg hover:bg-luxury-crimson/20"
              >
                Create Thread
              </button>
            </div>
          ) : (
            chats.map((c) => {
              const isSelected = currentChatId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCurrentChatId(c.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs truncate transition-all ${
                    isSelected
                      ? 'bg-luxury-crimson/10 border-luxury-redGlow/40 text-luxury-redGlow font-semibold shadow-[0_0_10px_rgba(158,22,28,0.1)]'
                      : 'bg-luxury-card border-luxury-border/30 hover:border-luxury-border/60 text-slate-300'
                  }`}
                >
                  {c.title}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-9 flex flex-col gap-4 h-[560px]">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-luxury-redGlow" />
          <h2 className="text-lg font-extrabold font-space text-white tracking-wide">VinRaVS AI Copilot</h2>
          <span className="text-[10px] bg-luxury-cherry/50 border border-luxury-crimson/20 text-luxury-gold font-mono px-2 py-0.5 rounded-md uppercase tracking-wider ml-auto">
            FAISS RAG ACTIVE
          </span>
        </div>

        {/* Chat Thread Container */}
        <div className="luxury-glass rounded-2xl border border-luxury-border/40 flex-1 flex flex-col overflow-hidden bg-luxury-black/60 relative">
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {chatMessages.length === 0 ? (
              // Welcome suggestions
              <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center gap-6 mt-6">
                <div className="bg-luxury-cherry/20 border border-luxury-crimson/20 p-4 rounded-3xl animate-bounce">
                  <BrainCircuit className="w-10 h-10 text-luxury-redGlow" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ask JKUAD VinRaVS Intelligence</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Query physical sensor states, retrieve system logs diagnostics, evaluate battery voltage curves, or explain historical anomalies using vector embeddings citations.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleSend(e, s)}
                      className="px-4 py-3 rounded-xl border border-luxury-border/40 hover:border-luxury-crimson/50 bg-luxury-card hover:bg-luxury-cardHover text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                    >
                      <span>{s}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-luxury-redGlow transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages list
              chatMessages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const isReasoningOpen = expandedReasoning[msg.id] || false;
                
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col gap-2.5 max-w-[85%] ${isAssistant ? 'self-start text-left' : 'self-end text-right'}`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1">
                      {isAssistant ? 'VinRaVS Copilot' : 'User Terminal'}
                    </span>
                    
                    <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                      isAssistant 
                        ? 'bg-luxury-card border-luxury-border/40 text-slate-100 rounded-tl-none' 
                        : 'bg-luxury-crimson/10 border-luxury-redGlow/30 text-white rounded-tr-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>

                    {/* Reasoning log & Citations for Assistant */}
                    {isAssistant && (msg.reasoning && msg.reasoning.length > 0 || msg.citations && msg.citations.length > 0) && (
                      <div className="flex flex-col gap-2 mt-1">
                        
                        {/* Accordion toggle */}
                        {msg.reasoning && msg.reasoning.length > 0 && (
                          <div className="self-start">
                            <button
                              onClick={() => toggleReasoning(msg.id)}
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-luxury-gold uppercase tracking-wider hover:text-white transition-all"
                            >
                              {isReasoningOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              {isReasoningOpen ? 'Hide Cognitive Reasoning' : 'Show Cognitive Reasoning'}
                            </button>
                            
                            <AnimatePresence>
                              {isReasoningOpen && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-2 bg-luxury-cherry/10 border border-luxury-crimson/10 rounded-xl p-3"
                                >
                                  <ul className="text-[10px] font-mono text-slate-400 space-y-1.5">
                                    {msg.reasoning.map((step, idx) => (
                                      <li key={idx} className="flex gap-2">
                                        <span className="text-luxury-crimson font-bold shrink-0">&gt;</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Citation bubbles */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-1">RAG Sources:</span>
                            {msg.citations.map((cit) => (
                              <div 
                                key={cit.id}
                                className="px-2 py-1 rounded-md bg-luxury-cardHover border border-luxury-border/50 text-[10px] text-slate-300 flex items-center gap-1 cursor-help hover:border-luxury-crimson/50"
                                title={cit.snippet}
                              >
                                <Database className="w-2.5 h-2.5 text-luxury-gold" />
                                <span>[{cit.id}] {cit.source}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })
            )}

            {copilotLoading && (
              <div className="self-start flex flex-col gap-2 max-w-[80%]">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">VinRaVS Copilot</span>
                <div className="p-4 rounded-2xl border bg-luxury-card border-luxury-border/40 rounded-tl-none flex items-center gap-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-luxury-redGlow rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-luxury-redGlow rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-luxury-redGlow rounded-full animate-bounce delay-300"></span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Embedding prompt query...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <div className="px-6 py-4 border-t border-luxury-border/40 bg-luxury-cherry/5">
            <form onSubmit={handleSend} className="flex gap-3">
              <input 
                type="text" 
                placeholder={currentChatId ? "Ask a telemetry query (e.g. 'Predict battery voltage')..." : "Start a new conversation thread using the plus icon..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={copilotLoading || !currentChatId}
                className="flex-1 bg-luxury-black/80 border border-luxury-border/80 focus:border-luxury-crimson focus:outline-none rounded-xl py-3 px-4 text-sm text-white transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={copilotLoading || !currentChatId || !input.trim()}
                className="bg-gradient-to-r from-luxury-crimson to-luxury-burgundy border border-luxury-redGlow/40 p-3.5 rounded-xl text-white hover:shadow-[0_0_15px_rgba(255,62,70,0.3)] transition-all duration-300 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
