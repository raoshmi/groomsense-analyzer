'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ChatbotProps {
  userProfile?: any;
  analysisHistory?: any[];
}

export default function Chatbot({ userProfile, analysisHistory }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm GroomSense AI 👋 Ask me anything about skincare, haircare, or grooming!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userProfile, analysisHistory }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || 'Sorry, I could not respond.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 999,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #00f0ff, #8a2be2)',
          color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,240,255,0.4)'
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: 96, right: 28, zIndex: 998,
              width: 340, height: 460,
              background: 'rgba(10,10,15,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bot size={20} style={{ color: '#00f0ff' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>GroomSense AI</p>
                <p style={{ color: '#00f0ff', fontSize: '0.72rem' }}>● Online</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #00f0ff, #8a2be2)' : 'rgba(255,255,255,0.07)',
                    fontSize: '0.83rem', lineHeight: 1.5, color: 'white'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: d }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f0ff' }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about grooming..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '8px 12px', color: 'white', fontSize: '0.85rem', outline: 'none'
                }}
              />
              <button onClick={sendMessage} disabled={loading}
                style={{ background: 'linear-gradient(135deg, #00f0ff, #8a2be2)', border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer', color: 'white' }}>
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
