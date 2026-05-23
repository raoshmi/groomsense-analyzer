'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Droplets, Scissors, Shirt, Sparkles, Download, ChevronDown, ChevronUp, Sun, Moon, Calendar, TrendingUp, AlertCircle, Cpu } from 'lucide-react';
import { AnalysisResult, Language } from '../types';
import { predictNextScore } from '../utils/prediction';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '@/context/AuthContext';
import Scorecard from './Scorecard';

interface DashboardProps {
  result: AnalysisResult;
  historyData: { date: string; score: number }[];
  lang?: Language;
}

const translations = {
  en: {
    groomScore: "Your Groom Score",
    scoreBreakdown: "Score Breakdown",
    dermatology: "Dermatology Analysis",
    hairStyle: "Hair & Style Analysis",
    personalizedRoutine: "Personalized Routine",
    morningRoutine: "Morning Routine",
    nightRoutine: "Night Routine",
    envTips: "🌍 Environment-Aware Tips",
    weeklyTips: "Weekly Tips",
    recommendedProducts: "Recommended Products",
    keyImprovements: "Key Improvement Areas",
    scoreProgression: "Groom Score Progression",
    aiVerdict: "AI Verdict",
    exportPDF: "Export PDF Grooming Report",
    excellentGrooming: "🔥 Excellent Grooming",
    goodGrooming: "✨ Good — Room to Improve",
    needsWork: "💪 Let's Level Up",
    skinType: "Skin Type",
    hydration: "Hydration",
    skinScore: "Skin Score",
    hairType: "Hair Type",
    condition: "Condition",
    facialHair: "Facial Hair",
    detectedConcerns: "Detected Concerns:",
    confidenceLabel: "Confidence Level:"
  },
  hi: {
    groomScore: "आपका ग्रूम स्कोर",
    scoreBreakdown: "स्कोर विवरण",
    dermatology: "त्वचा विज्ञान विश्लेषण",
    hairStyle: "बाल और हेयर स्टाइल विश्लेषण",
    personalizedRoutine: "व्यक्तिगत दिनचर्या",
    morningRoutine: "सुबह की दिनचर्या",
    nightRoutine: "रात की दिनचर्या",
    envTips: "🌍 पर्यावरण अनुकूल टिप्स",
    weeklyTips: "साप्ताहिक टिप्स",
    recommendedProducts: "अनुशंसित उत्पाद",
    keyImprovements: "मुख्य सुधार क्षेत्र",
    scoreProgression: "ग्रूम स्कोर प्रगति",
    aiVerdict: "एआई अंतिम निष्कर्ष",
    exportPDF: "ग्रूमिंग पीडीएफ रिपोर्ट डाउनलोड करें",
    excellentGrooming: "🔥 उत्कृष्ट ग्रूमिंग - बहुत बढ़िया!",
    goodGrooming: "✨ अच्छा - और सुधार हो सकता है",
    needsWork: "💪 आइये इसे और बेहतर बनाएं",
    skinType: "त्वचा प्रकार",
    hydration: "नमी स्तर",
    skinScore: "त्वचा स्कोर",
    hairType: "बाल प्रकार",
    condition: "बालों की स्थिति",
    facialHair: "दाढ़ी/मूंछ",
    detectedConcerns: "देखी गई चिंताएं:",
    confidenceLabel: "आत्मविश्वास स्तर:"
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

function ScoreRing({ score, lang = 'en' }: { score: number; lang: Language }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#00f0ff' : score >= 50 ? '#8a2be2' : '#ff6b6b';

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
      </div>
    </div>
  );
}

function ExpandableSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '20px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: open ? '16px' : 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 600 }}>
          {icon} {title}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && children}
    </motion.div>
  );
}

export default function Dashboard({ result, historyData, lang = 'en' }: DashboardProps) {
  const { user } = useAuth();
  const t = translations[lang] || translations.en;
  const [exporting, setExporting] = useState(false);

  const radarData = [
    { subject: 'Skin', value: result.scoreBreakdown?.skin ?? 70 },
    { subject: 'Hair', value: result.scoreBreakdown?.hair ?? 70 },
    { subject: 'Style', value: result.scoreBreakdown?.style ?? 70 },
    { subject: 'Hygiene', value: result.scoreBreakdown?.hygiene ?? 70 },
  ];

  const skinConcerns = result.skinAnalysis?.concerns ?? [];

  // 1. Calculate linear trend scores
  const scoreHistory = historyData.map(h => h.score);
  const prediction = predictNextScore(scoreHistory, lang);

  // 2. Prepare forecast chart data
  let chartData = historyData.map(h => ({
    date: h.date,
    score: h.score,
    predictedScore: null as number | null
  }));

  if (prediction && historyData.length > 0) {
    const lastEntry = historyData[historyData.length - 1];
    
    // Connect historical line to the projection line
    chartData[chartData.length - 1] = {
      ...chartData[chartData.length - 1],
      predictedScore: lastEntry.score
    };

    // Push future forecast dot
    chartData.push({
      date: lang === 'hi' ? 'अगला हफ्ता' : 'Next Week',
      score: null as any,
      predictedScore: prediction.predictedScore
    });
  }

  const handleDownloadPDF = async () => {
    setExporting(true);
    const element = document.getElementById('dashboard-pdf-report');
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
      const imgWidth = 210;
      const pageHeight = 297;
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
      pdf.save(`GroomSense-Analysis-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Bar */}
      <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '12px' }}>
        {user && (
          <Scorecard result={result} user={user} lang={lang} />
        )}
        <button className="btn-primary" onClick={handleDownloadPDF} disabled={exporting}>
          <Download size={16} /> {exporting ? 'Exporting...' : t.exportPDF}
        </button>
      </div>

      {/* Printable Wrapper */}
      <motion.div 
        id="dashboard-pdf-report"
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#050505', padding: exporting ? '24px' : '0' }}
      >
        {/* Dynamic header if printing */}
        {exporting && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Groom<span style={{ background: 'linear-gradient(135deg, #00f0ff, #8a2be2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sense</span></h1>
            <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Premium AI Grooming Analysis Report</span>
          </div>
        )}

        {/* Header: Score + Radar + Confidence Scores */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t.groomScore}</h2>
            <ScoreRing score={result.score} lang={lang} />
            <p className="text-gradient" style={{ fontWeight: 700 }}>
              {result.score >= 80 ? t.excellentGrooming : result.score >= 60 ? t.goodGrooming : t.needsWork}
            </p>

            {/* Recruiter-Friendly Self-Evaluating Confidence meters */}
            {result.confidenceScores && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {[
                  { label: lang === 'hi' ? 'त्वचा' : 'Skin', val: result.confidenceScores.skin, color: 'var(--accent-cyan)' },
                  { label: lang === 'hi' ? 'बाल' : 'Hair', val: result.confidenceScores.hair, color: 'var(--accent-purple)' },
                  { label: lang === 'hi' ? 'स्टाइल' : 'Style', val: result.confidenceScores.style, color: '#ff6b6b' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}>{val}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>{t.scoreBreakdown}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Radar name="Score" dataKey="value" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skin Analysis */}
        <ExpandableSection title={t.dermatology} icon={<Droplets size={20} className="text-gradient" />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: t.skinType, value: result.skinAnalysis?.type },
              { label: t.hydration, value: result.skinAnalysis?.hydrationLevel },
              { label: t.skinScore, value: `${result.scoreBreakdown?.skin}/100` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
                <p style={{ fontWeight: 700, textTransform: 'capitalize' }}>{value}</p>
              </div>
            ))}
          </div>
          {skinConcerns.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>{t.detectedConcerns}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skinConcerns.map((c, i) => (
                  <span key={i} style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem' }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{result.skinAnalysis?.advice}</p>
        </ExpandableSection>

        {/* Hair Analysis */}
        <ExpandableSection title={t.hairStyle} icon={<Scissors size={20} className="text-gradient" />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: t.hairType, value: result.hairAnalysis?.type },
              { label: t.condition, value: result.hairAnalysis?.condition },
              { label: t.facialHair, value: result.hairAnalysis?.facialHair },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.1)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
                <p style={{ fontWeight: 700, textTransform: 'capitalize' }}>{value}</p>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{result.hairAnalysis?.advice}</p>
        </ExpandableSection>

        {/* Personalized Recommendations */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} className="text-gradient" /> {t.personalizedRoutine}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: 'var(--accent-cyan)' }}>
                <Sun size={16} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.morningRoutine}</span>
              </div>
              <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.recommendations?.morningRoutine?.map((step, i) => (
                  <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: 'var(--accent-purple)' }}>
                <Moon size={16} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.nightRoutine}</span>
              </div>
              <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.recommendations?.nightRoutine?.map((step, i) => (
                  <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
          {result.recommendations?.environmentAdjustments && (
            <div style={{ marginTop: 20, background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.12)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: 6, fontWeight: 600 }}>{t.envTips}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.recommendations.environmentAdjustments}</p>
            </div>
          )}
        </motion.div>

        {/* Weekly Tips + Product Suggestions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={18} className="text-gradient" /> {t.weeklyTips}
            </h4>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.recommendations?.weeklyTips?.map((tip, i) => (
                <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{tip}</li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shirt size={18} className="text-gradient" /> {t.recommendedProducts}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.recommendations?.products?.map((p, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{p.type}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{p.reason}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Improvement Areas */}
        {result.improvementAreas?.length > 0 && (
          <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={18} style={{ color: '#ff6b6b' }} /> {t.keyImprovements}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {result.improvementAreas.map((area, i) => (
                <span key={i} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem' }}>{area}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Predictive Scoring AreaChart */}
        {!exporting && (
          <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} className="text-gradient" /> {t.scoreProgression}
            </h3>
            
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                
                {/* Historical Area curve */}
                <Area type="monotone" dataKey="score" stroke="var(--accent-cyan)" strokeWidth={3} fill="url(#scoreGrad)" dot={{ fill: 'var(--accent-purple)', r: 5 }} activeDot={{ r: 7 }} name={lang === 'hi' ? 'वास्तविक स्कोर' : 'Actual Score'} />
                
                {/* ML Dashed linear regression prediction curve */}
                <Area type="monotone" dataKey="predictedScore" stroke="var(--accent-purple)" strokeWidth={3} strokeDasharray="5 5" fill="none" dot={{ fill: 'var(--accent-purple)', r: 5 }} name={lang === 'hi' ? 'पूर्वानुमानित स्कोर' : 'Predicted Forecast'} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Localized Predictive modeling resume-friendly explanation */}
            {prediction && (
              <div style={{ marginTop: 20, background: 'rgba(138,43,226,0.04)', border: '1px solid rgba(138,43,226,0.15)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Cpu size={20} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {prediction.message}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Overall Verdict */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(138,43,226,0.05))' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} className="text-gradient" /> {t.aiVerdict}
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{result.overall}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
