'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hi! I'm AANAN, the AI assistant for Aanan Munna. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      
      const prompt = `
        You are AANAN, an AI assistant representing Aanan Munna, a Creative Front-End Developer based in Dhaka, Bangladesh.
        Aanan is passionate about building immersive web experiences, WebGL, React, Next.js, and GSAP.
        He has worked at Aljaami Technologies and CodeCareBD.
        Keep your answers concise, professional, yet friendly and welcoming to recruiters or potential clients.
        
        User: ${userMessage}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text as string }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't process that right now." }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-16 h-16 bg-gradient-to-tr from-accent to-[#00cc6a] text-bg rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.3)] z-[100] hover-target ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles size={24} className="absolute top-3 right-3 opacity-50" />
        <MessageSquare size={28} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] max-h-[80vh] bg-surface/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-bg/80 to-surface/80 p-5 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-[#00cc6a] flex items-center justify-center text-bg font-bold font-display text-lg shadow-lg">A</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-fg leading-none text-lg">AANAN</h3>
                  <p className="font-mono text-[10px] text-accent uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Sparkles size={10} /> AI Assistant
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted hover:text-fg transition-colors rounded-full hover:bg-white/10 relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth" data-lenis-prevent="true">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-tr from-accent to-[#00cc6a] text-bg rounded-tr-sm font-medium' 
                        : 'bg-bg/80 border border-white/5 text-fg/90 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-bg/80 border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-accent" />
                    <span className="font-mono text-xs text-muted animate-pulse">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-bg/50 border-t border-white/5 backdrop-blur-md">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full bg-surface/50 border border-white/10 rounded-full py-4 pl-5 pr-14 text-sm text-fg focus:outline-none focus:border-accent/50 focus:bg-surface transition-all placeholder:text-muted/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent text-bg rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
