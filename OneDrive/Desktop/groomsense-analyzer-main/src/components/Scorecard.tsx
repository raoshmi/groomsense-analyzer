'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Share2, X, ShieldAlert } from 'lucide-react';
import { AnalysisResult, Language } from '../types';
import html2canvas from 'html2canvas';

interface ScorecardProps {
  result: AnalysisResult;
  user: { displayName: string | null; photoURL: string | null; email: string | null };
  lang?: Language;
}

const translations = {
  en: {
    title: "GroomSense Premium Profile",
    subtitle: "Ensemble AI Grooming Analysis",
    overallScore: "Groom Score",
    skinRating: "Skin",
    hairRating: "Hair",
    styleRating: "Style",
    verdictTitle: "AI Final Verdict:",
    download: "Download Shareable Card",
    shareTitle: "Share Your Grooming Score Card",
    close: "Close",
    preparing: "Capturing Card...",
  },
  hi: {
    title: "ग्रूमसेंस प्रीमियम प्रोफाइल",
    subtitle: "संयुक्त एआई ग्रूमिंग विश्लेषण",
    overallScore: "ग्रूम स्कोर",
    skinRating: "त्वचा",
    hairRating: "बाल",
    styleRating: "स्टाइल",
    verdictTitle: "एआई अंतिम निष्कर्ष:",
    download: "शेयर करने योग्य कार्ड डाउनलोड करें",
    shareTitle: "अपना ग्रूमिंग स्कोर कार्ड साझा करें",
    close: "बंद करें",
    preparing: "कार्ड कैप्चर हो रहा है...",
  }
};

export default function Scorecard({ result, user, lang = 'en' }: ScorecardProps) {
  const t = translations[lang] || translations.en;
  
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setCapturing(true);

    try {
      // Small timeout to allow styles/layouts to settle
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High DPI capture
        useCORS: true,
        backgroundColor: '#050505',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `GroomSense-Scorecard-${user.displayName || 'User'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate scorecard image:", err);
    } finally {
      setCapturing(false);
    }
  };

  const color = result.score >= 75 ? '#00f0ff' : result.score >= 50 ? '#8a2be2' : '#ff6b6b';

  return (
    <>
      {/* Trigger Button */}
      <button 
        className="btn-secondary" 
        onClick={() => setOpen(true)}
        style={{ gap: 8, borderColor: 'rgba(138,43,226,0.3)', color: 'white' }}
      >
        <Share2 size={16} className="text-gradient" /> {t.shareTitle}
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {open && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: '420px', alignItems: 'center' }}
            >
              {/* Modal controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{t.shareTitle}</span>
                <button 
                  onClick={() => setOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#a0a0a0', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Shareable Card Target */}
              <div 
                ref={cardRef}
                style={{
                  width: '380px',
                  height: '480px',
                  background: '#050505',
                  backgroundImage: `
                    radial-gradient(circle at 15% 15%, rgba(0, 240, 255, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 85% 85%, rgba(138, 43, 226, 0.15) 0%, transparent 40%)
                  `,
                  border: '2px solid rgba(255,255,255,0.08)',
                  borderRadius: '24px',
                  padding: '28px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Neon glow borders */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #00f0ff, #8a2be2)' }} />

                {/* Card Header: Logo + App Name */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: 0.5, color: '#fff' }}>
                      Groom<span style={{ background: 'linear-gradient(135deg, #00f0ff, #8a2be2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sense</span>
                    </h3>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{t.subtitle}</p>
                  </div>
                  <Sparkles size={20} style={{ color: 'var(--accent-cyan)' }} />
                </div>

                {/* Card Body: User Avatar + Circular Ring */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '20px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '1.4rem', color: '#fff' }}>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.email}</span>
                  </div>

                  {/* Circular visual representation */}
                  <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', position: 'relative' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 42} strokeDashoffset={(2 * Math.PI * 42) - (result.score / 100) * (2 * Math.PI * 42)}
                          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{result.score}</span>
                        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{t.overallScore}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-ratings categories */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '8px 0' }}>
                  {[
                    { label: t.skinRating, val: result.scoreBreakdown?.skin ?? 70, barColor: 'var(--accent-cyan)' },
                    { label: t.hairRating, val: result.scoreBreakdown?.hair ?? 70, barColor: 'var(--accent-purple)' },
                    { label: t.styleRating, val: result.scoreBreakdown?.style ?? 70, barColor: '#ff6b6b' },
                  ].map(({ label, val, barColor }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{label}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{val}</span>
                      <div style={{ width: '80%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                        <div style={{ width: `${val}%`, height: '100%', background: barColor }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Synthesized verdict summary */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px 14px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.verdictTitle}</span>
                  <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {result.overall}
                  </p>
                </div>

                {/* Footer Web link */}
                <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
                    groomsense-analyzer.vercel.app
                  </span>
                </div>
              </div>

              {/* Download Trigger */}
              <button 
                className="btn-primary" 
                onClick={downloadCard} 
                disabled={capturing}
                style={{ width: '100%', gap: 8, padding: '14px' }}
              >
                <Download size={18} />
                {capturing ? t.preparing : t.download}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
