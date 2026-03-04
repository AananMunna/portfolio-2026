'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, RotateCcw, Palette, Type, LayoutTemplate, X } from 'lucide-react';

const defaultTheme = {
  background: '#03050c',
  surface: '#070b16',
  text: '#ccdae8',
  accent: '#00ff88',
  fontSize: '16px',
};

export default function SystemPrefsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--void', theme.background);
    root.style.setProperty('--void2', theme.surface);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--phosphor', theme.accent);
    root.style.fontSize = theme.fontSize;
  }, [theme]);

  const handleReset = () => {
    setTheme(defaultTheme);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-40 w-14 h-14 rounded-full border border-border bg-surface flex items-center justify-center text-fg hover:text-accent hover:border-accent transition-all duration-300 hover-target shadow-lg"
        aria-label="Open System Preferences"
      >
        <Settings2 size={24} />
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full max-w-md bg-surface border-r border-border z-[101] overflow-y-auto hide-scrollbar shadow-2xl"
              data-lenis-prevent="true"
            >
              <div className="p-6 sm:p-8 pb-24 sm:pb-32">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl uppercase font-bold tracking-tighter">
                      System <span className="text-accent italic">Prefs</span>
                    </h2>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors hover-target"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-fg transition-colors hover-target px-4 py-2 border border-border rounded-full w-full justify-center"
                  >
                    <RotateCcw size={14} /> Reset to Default
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Colors */}
                  <div>
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                      <Palette className="text-accent" size={20} />
                      <h3 className="font-mono text-sm uppercase tracking-widest text-fg">Colors</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-xs text-muted uppercase tracking-wider">Background</label>
                        <div className="flex gap-3">
                          <input 
                            type="color" 
                            value={theme.background}
                            onChange={(e) => setTheme({...theme, background: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none p-0"
                          />
                          <input 
                            type="text" 
                            value={theme.background}
                            onChange={(e) => setTheme({...theme, background: e.target.value})}
                            className="bg-bg border border-border rounded px-3 font-mono text-sm text-fg flex-1 focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-xs text-muted uppercase tracking-wider">Primary Text</label>
                        <div className="flex gap-3">
                          <input 
                            type="color" 
                            value={theme.text}
                            onChange={(e) => setTheme({...theme, text: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none p-0"
                          />
                          <input 
                            type="text" 
                            value={theme.text}
                            onChange={(e) => setTheme({...theme, text: e.target.value})}
                            className="bg-bg border border-border rounded px-3 font-mono text-sm text-fg flex-1 focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-xs text-muted uppercase tracking-wider">Accent Color</label>
                        <div className="flex gap-3">
                          <input 
                            type="color" 
                            value={theme.accent}
                            onChange={(e) => setTheme({...theme, accent: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none p-0"
                          />
                          <input 
                            type="text" 
                            value={theme.accent}
                            onChange={(e) => setTheme({...theme, accent: e.target.value})}
                            className="bg-bg border border-border rounded px-3 font-mono text-sm text-fg flex-1 focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                      <Type className="text-accent" size={20} />
                      <h3 className="font-mono text-sm uppercase tracking-widest text-fg">Typography</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <label className="font-mono text-xs text-muted uppercase tracking-wider">Base Font Size</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['14px', '16px', '18px'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setTheme({...theme, fontSize: size})}
                              className={`py-2 rounded font-mono text-xs transition-colors ${
                                theme.fontSize === size 
                                  ? 'bg-accent text-bg font-bold' 
                                  : 'bg-bg border border-border text-muted hover:text-fg'
                              }`}
                            >
                              {size === '14px' ? 'Small' : size === '16px' ? 'Normal' : 'Large'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-bg border border-border rounded-lg mt-4">
                        <p className="text-base text-fg mb-2">The quick brown fox jumps over the lazy dog.</p>
                        <p className="font-mono text-xs text-accent">Preview text scaling across the entire interface.</p>
                      </div>
                    </div>
                  </div>

                  {/* Presets */}
                  <div>
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                      <LayoutTemplate className="text-accent" size={20} />
                      <h3 className="font-mono text-sm uppercase tracking-widest text-fg">Quick Presets</h3>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setTheme({ background: '#03050c', surface: '#070b16', text: '#ccdae8', accent: '#00ff88', fontSize: '16px' })}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg hover:border-accent/50 transition-colors group"
                      >
                        <span className="font-mono text-xs text-fg">Matrix (Default)</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#03050c] border border-white/20"></div>
                          <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setTheme({ background: '#0f0f11', surface: '#18181b', text: '#f4f4f5', accent: '#3b82f6', fontSize: '16px' })}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg hover:border-blue-500/50 transition-colors group"
                      >
                        <span className="font-mono text-xs text-fg">Ocean Blue</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#0f0f11] border border-white/20"></div>
                          <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                        </div>
                      </button>

                      <button 
                        onClick={() => setTheme({ background: '#1a1515', surface: '#241c1c', text: '#f5ebeb', accent: '#ef4444', fontSize: '16px' })}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg hover:border-red-500/50 transition-colors group"
                      >
                        <span className="font-mono text-xs text-fg">Crimson Dark</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#1a1515] border border-white/20"></div>
                          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => setTheme({ background: '#fafafa', surface: '#ffffff', text: '#18181b', accent: '#8b5cf6', fontSize: '16px' })}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg hover:border-purple-500/50 transition-colors group"
                      >
                        <span className="font-mono text-xs text-fg">Light Minimal</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#fafafa] border border-black/20"></div>
                          <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
