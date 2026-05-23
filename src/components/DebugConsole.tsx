'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, X, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { DebugData, ConfidenceScores, Language } from '../types';

interface DebugConsoleProps {
  debugData: DebugData | null;
  confidenceScores?: ConfidenceScores;
  lang?: Language;
}

const translations = {
  en: {
    badge: "Explainable AI Debug Console",
    drawerTitle: "🛠️ Developer Explainable AI Console",
    promptTab: "Ensemble Prompt",
    responseTab: "Raw Gemini Completion",
    metadataTab: "Model Diagnostics",
    copy: "Copy Code",
    copied: "Copied!",
    agentConfidence: "Agent Self-Evaluating Confidence (Uncertainty Quantification)",
    agentSkin: "Dr. Skin (Dermatologist)",
    agentHair: "Alex (Master Barber)",
    agentStyle: "Vera (Fashion Coach)",
    empty: "Please run an analysis to populate explainability data.",
    conceptTitle: "Applied Prompt Engineering Techniques:"
  },
  hi: {
    badge: "व्याख्यात्मक एआई डीबग कंसोल",
    drawerTitle: "🛠️ डेवलपर एआई डीबग कंसोल",
    promptTab: "संयुक्त प्रॉम्प्ट",
    responseTab: "रॉ जेमिनी उत्तर",
    metadataTab: "मॉडल नैदानिक",
    copy: "कोड कॉपी करें",
    copied: "कॉपी किया गया!",
    agentConfidence: "एजेंट स्व-मूल्यांकन आत्मविश्वास (अनिश्चितता मात्रा निर्धारण)",
    agentSkin: "डॉ. स्किन (त्वचा विशेषज्ञ)",
    agentHair: "एलेक्स (हेयर स्टाइलिस्ट)",
    agentStyle: "वेरा (फैशन कोच)",
    empty: "व्याख्यात्मक डेटा देखने के लिए कृपया विश्लेषण चलाएं।",
    conceptTitle: "लागू तकनीकें (Prompt Engineering):"
  }
};

export default function DebugConsole({ debugData, confidenceScores, lang = 'en' }: DebugConsoleProps) {
  const t = translations[lang] || translations.en;
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'response' | 'meta'>('prompt');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scores = confidenceScores || { skin: 92, hair: 85, style: 89 };

  return (
    <>
      {/* Floating Developer Badge Trigger */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: 28, left: 28, zIndex: 997,
          background: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: 30,
          padding: '10px 18px',
          color: 'var(--accent-cyan)',
          fontWeight: 700,
          fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(0, 240, 255, 0.15)'
        }}
      >
        <Terminal size={14} /> {t.badge}
      </motion.button>

      {/* Slide-out Debug Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 1000,
              width: '100%', maxWidth: '520px',
              background: 'rgba(5, 5, 5, 0.98)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '20px 0 60px rgba(0,0,0,0.8)',
              display: 'flex', flexDirection: 'column',
              padding: '24px'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={18} style={{ color: 'var(--accent-cyan)' }} /> {t.drawerTitle}
              </h3>
              <button 
                onClick={() => setOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Debug Content */}
            {debugData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
                {/* Confidence Scores Panel */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldAlert size={15} /> {t.agentConfidence}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: t.agentSkin, val: scores.skin, color: 'var(--accent-cyan)' },
                      { label: t.agentHair, val: scores.hair, color: 'var(--accent-purple)' },
                      { label: t.agentStyle, val: scores.style, color: '#ff6b6b' },
                    ].map(({ label, val, color }) => (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                          <span style={{ fontWeight: 700, color }}>{val}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{ height: '100%', background: color, borderRadius: 3 }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Console tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 8 }}>
                  {(['prompt', 'response', 'meta'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1, border: 'none', borderRadius: 6, padding: '8px', fontSize: '0.76rem', fontWeight: 600,
                        background: activeTab === tab ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                        color: activeTab === tab ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.2s ease'
                      }}
                    >
                      {tab === 'prompt' ? t.promptTab : tab === 'response' ? t.responseTab : t.metadataTab}
                    </button>
                  ))}
                </div>

                {/* Code viewport container */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
                  {activeTab === 'prompt' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>system_prompt.txt</span>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.7rem', gap: 4 }}
                          onClick={() => handleCopy(debugData.prompt)}
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          {copied ? t.copied : t.copy}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={debugData.prompt}
                        style={{
                          flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                          padding: 12, color: '#39ff14', fontFamily: 'Courier New, monospace', fontSize: '0.78rem', resize: 'none', outline: 'none'
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'response' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>unparsed_completion.json</span>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.7rem', gap: 4 }}
                          onClick={() => handleCopy(debugData.rawResponse)}
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          {copied ? t.copied : t.copy}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={debugData.rawResponse}
                        style={{
                          flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                          padding: 12, color: 'var(--accent-cyan)', fontFamily: 'Courier New, monospace', fontSize: '0.78rem', resize: 'none', outline: 'none'
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'meta' && (
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} /> {t.conceptTitle}
                      </h4>
                      <ul style={{ paddingLeft: 16, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 1.4 }}>
                        <li><strong>System Instructions:</strong> Sets context constraint roleplaying Gemini directly as an ensemble of 3 distinct domain specialists.</li>
                        <li><strong>Uncertainty Quantifier:</strong> Explicit self-reflection parameters forced in schema returning scores evaluating its own accuracy based on image quality.</li>
                        <li><strong>Strict JSON Schema Output:</strong> Programmatic enforcement of valid parsable formats natively mapping inputs into frontend states.</li>
                        <li><strong>Dynamic Environment Context Injections:</strong> Dynamically weaves weather/pollution parameters before calling generation pipelines.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                <ShieldAlert size={36} style={{ color: 'var(--accent-purple)' }} />
                <p style={{ fontSize: '0.85rem' }}>{t.empty}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
