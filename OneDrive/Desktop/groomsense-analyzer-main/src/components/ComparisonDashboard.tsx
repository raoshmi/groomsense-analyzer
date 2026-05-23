'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend
} from 'recharts';
import { Droplets, Scissors, Shirt, Sparkles, Download, ArrowRight, TrendingUp, AlertCircle, RefreshCcw } from 'lucide-react';
import { ComparisonResult, Language } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ComparisonDashboardProps {
  result: ComparisonResult;
  lang?: Language;
  onNewAnalysis: () => void;
}

const translations = {
  en: {
    title: "Before & After Analysis",
    verdict: "AI Comparison Verdict",
    deltaTitle: "Grooming Progress Delta",
    skincare: "Dermatology Comparison",
    haircare: "Hair & Grooming Comparison",
    style: "Style & Aesthetic Comparison",
    improvements: "Observed Improvements:",
    expertAdvice: "Expert Ensemble Advice:",
    beforeLabel: "Before",
    afterLabel: "After",
    scoreBreakdown: "Score Comparison",
    downloadPDF: "Export PDF Comparison Report",
    newAnalysis: "← New Analysis",
    excellentProgress: "🔥 Outstanding Styling Progress!",
    goodProgress: "✨ Nice Improvements — Keep Styling!",
    gettingStarted: "💪 Strong Start — Consistency is Key!",
    beforeType: "Before Type",
    afterType: "After Type",
    beforeStyle: "Before Style",
    afterStyle: "After Style"
  },
  hi: {
    title: "तुलना विश्लेषण (Before & After)",
    verdict: "एआई तुलनात्मक निर्णय",
    deltaTitle: "ग्रूमिंग सुधार प्रगति",
    skincare: "त्वचा विज्ञान तुलना",
    haircare: "बाल और ग्रूमिंग तुलना",
    style: "कपड़े और स्टाइल की तुलना",
    improvements: "देखे गए सुधार:",
    expertAdvice: "विशेषज्ञ समूह की सलाह:",
    beforeLabel: "पहले (Before)",
    afterLabel: "बाद में (After)",
    scoreBreakdown: "स्कोर तुलनात्मक विवरण",
    downloadPDF: "पीडीएफ तुलनात्मक रिपोर्ट डाउनलोड करें",
    newAnalysis: "← नया विश्लेषण",
    excellentProgress: "🔥 शानदार स्टाइलिंग प्रगति!",
    goodProgress: "✨ बढ़िया सुधार — स्टाइल जारी रखें!",
    gettingStarted: "💪 अच्छी शुरुआत — निरंतरता जरूरी है!",
    beforeType: "पहले का प्रकार",
    afterType: "बाद का प्रकार",
    beforeStyle: "पहले का स्टाइल",
    afterStyle: "बाद का स्टाइल"
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function ComparisonScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 110, height: 110 }}>
        <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="55" cy="55" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 6px ${color}55)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{score}</span>
        </div>
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function ExpandableSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
        {icon} {title}
      </div>
      {children}
    </motion.div>
  );
}

export default function ComparisonDashboard({ result, lang = 'en', onNewAnalysis }: ComparisonDashboardProps) {
  const t = translations[lang] || translations.en;
  const [exporting, setExporting] = useState(false);

  const delta = result.scoreDelta ?? (result.scoreAfter - result.scoreBefore);
  const deltaColor = delta >= 5 ? '#00f0ff' : delta >= 0 ? '#8a2be2' : '#ff6b6b';

  const radarData = [
    { subject: 'Skin', Before: result.scoreBreakdownBefore?.skin ?? 70, After: result.scoreBreakdownAfter?.skin ?? 70 },
    { subject: 'Hair', Before: result.scoreBreakdownBefore?.hair ?? 70, After: result.scoreBreakdownAfter?.hair ?? 70 },
    { subject: 'Style', Before: result.scoreBreakdownBefore?.style ?? 70, After: result.scoreBreakdownAfter?.style ?? 70 },
    { subject: 'Hygiene', Before: result.scoreBreakdownBefore?.hygiene ?? 70, After: result.scoreBreakdownAfter?.hygiene ?? 70 },
  ];

  const downloadPDFReport = async () => {
    setExporting(true);
    const element = document.getElementById('comparison-pdf-report');
    if (!element) {
      setExporting(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050505'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 page width
      const pageHeight = 297; // A4 page height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`GroomSense-Comparison-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary" onClick={onNewAnalysis}>
          {t.newAnalysis}
        </button>
        <button className="btn-primary" onClick={downloadPDFReport} disabled={exporting}>
          <Download size={16} /> {exporting ? 'Exporting...' : t.downloadPDF}
        </button>
      </div>

      {/* PDF Target Container */}
      <motion.div 
        id="comparison-pdf-report"
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#050505', padding: exporting ? '24px' : '0' }}
      >
        {/* Dynamic header if printing */}
        {exporting && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Groom<span style={{ background: 'linear-gradient(135deg, #00f0ff, #8a2be2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sense</span> Analyzer</h1>
            <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Premium AI Grooming Comparison Report</span>
          </div>
        )}

        {/* Header: Score Ring + Progress Delta + Radar comparison */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.title}</h3>
            
            <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
              <ComparisonScoreRing score={result.scoreBefore} label={t.beforeLabel} color="#ff6b6b" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <ArrowRight size={22} style={{ color: deltaColor }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: deltaColor }}>
                  {delta >= 0 ? `+${delta}` : delta}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delta</span>
              </div>
              <ComparisonScoreRing score={result.scoreAfter} label={t.afterLabel} color="#00f0ff" />
            </div>

            <p className="text-gradient" style={{ fontWeight: 700, fontSize: '1.05rem', textAlign: 'center' }}>
              {delta >= 8 ? t.excellentProgress : delta >= 3 ? t.goodProgress : t.gettingStarted}
            </p>

            {/* Self-Evaluating Confidence meters */}
            {result.confidenceScores && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {[
                  { label: lang === 'hi' ? 'त्वचा' : 'Skin', val: result.confidenceScores.skin, color: 'var(--accent-cyan)' },
                  { label: lang === 'hi' ? 'बाल' : 'Hair', val: result.confidenceScores.hair, color: 'var(--accent-purple)' },
                  { label: lang === 'hi' ? 'स्टाइल' : 'Style', val: result.confidenceScores.style, color: '#ff6b6b' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '65px' }}>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color }}>{val}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>{t.scoreBreakdown}</h3>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Radar name={t.beforeLabel} dataKey="Before" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.06} strokeWidth={2} />
                <Radar name={t.afterLabel} dataKey="After" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.12} strokeWidth={2.5} />
                <Legend wrapperStyle={{ paddingTop: 8, color: 'white', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skincare Skincare comparison */}
        <ExpandableSection title={t.skincare} icon={<Droplets size={20} className="text-gradient" />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.1)', borderRadius: 12, padding: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{t.beforeType}</p>
              <p style={{ fontWeight: 700, textTransform: 'capitalize', color: '#ff6b6b' }}>{result.skinComparison?.beforeType}</p>
            </div>
            <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 12, padding: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{t.afterType}</p>
              <p style={{ fontWeight: 700, textTransform: 'capitalize', color: '#00f0ff' }}>{result.skinComparison?.afterType}</p>
            </div>
          </div>
          
          {result.skinComparison?.improvements?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 6, fontWeight: 600 }}>{t.improvements}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.skinComparison.improvements.map((imp, i) => (
                  <span key={i} style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem' }}>✓ {imp}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            <strong>{t.expertAdvice}</strong> {result.skinComparison?.advice}
          </p>
        </ExpandableSection>

        {/* Hair Styling Comparison */}
        <ExpandableSection title={t.haircare} icon={<Scissors size={20} className="text-gradient" />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.1)', borderRadius: 12, padding: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{t.beforeStyle}</p>
              <p style={{ fontWeight: 700, textTransform: 'capitalize', color: '#ff6b6b' }}>{result.hairComparison?.beforeStyle}</p>
            </div>
            <div style={{ background: 'rgba(138,43,226,0.05)', border: '1px solid rgba(138,43,226,0.15)', borderRadius: 12, padding: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{t.afterStyle}</p>
              <p style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--accent-purple)' }}>{result.hairComparison?.afterStyle}</p>
            </div>
          </div>
          
          {result.hairComparison?.improvements?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 6, fontWeight: 600 }}>{t.improvements}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.hairComparison.improvements.map((imp, i) => (
                  <span key={i} style={{ background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem' }}>✓ {imp}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            <strong>{t.expertAdvice}</strong> {result.hairComparison?.advice}
          </p>
        </ExpandableSection>

        {/* Fashion Clothing comparison */}
        <ExpandableSection title={t.style} icon={<Shirt size={20} className="text-gradient" />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.1)', borderRadius: 12, padding: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{t.beforeLabel}</p>
              <p style={{ fontWeight: 700, textTransform: 'capitalize', color: '#ff6b6b' }}>{result.styleComparison?.beforeStyle}</p>
            </div>
            <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 12, padding: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>{t.afterLabel}</p>
              <p style={{ fontWeight: 700, textTransform: 'capitalize', color: '#00f0ff' }}>{result.styleComparison?.afterStyle}</p>
            </div>
          </div>
          
          {result.styleComparison?.improvements?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 6, fontWeight: 600 }}>{t.improvements}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.styleComparison.improvements.map((imp, i) => (
                  <span key={i} style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem' }}>✓ {imp}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            <strong>{t.expertAdvice}</strong> {result.styleComparison?.advice}
          </p>
        </ExpandableSection>

        {/* Overall Comparative Verdict */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(138,43,226,0.05))' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} className="text-gradient" /> {t.verdict}
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.92rem' }}>{result.overallComparison}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
