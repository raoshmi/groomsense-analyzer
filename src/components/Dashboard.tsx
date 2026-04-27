'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, AreaChart, Area
} from 'recharts';
import { Droplets, Scissors, Shirt, Sparkles, Download, ChevronDown, ChevronUp, Sun, Moon, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalysisResult {
  score: number;
  scoreBreakdown: { skin: number; hair: number; style: number; hygiene: number };
  skinAnalysis: { type: string; concerns: string[]; hydrationLevel: string; status: string; advice: string };
  hairAnalysis: { type: string; condition: string; facialHair: string; status: string; advice: string };
  styleAnalysis: { status: string; advice: string };
  recommendations: {
    morningRoutine: string[];
    nightRoutine: string[];
    weeklyTips: string[];
    environmentAdjustments: string;
    products: { type: string; reason: string }[];
  };
  overall: string;
  improvementAreas: string[];
}

interface DashboardProps {
  result: AnalysisResult;
  historyData: { date: string; score: number }[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function ScoreRing({ score }: { score: number }) {
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

export default function Dashboard({ result, historyData }: DashboardProps) {
  const radarData = [
    { subject: 'Skin', value: result.scoreBreakdown?.skin ?? 70 },
    { subject: 'Hair', value: result.scoreBreakdown?.hair ?? 70 },
    { subject: 'Style', value: result.scoreBreakdown?.style ?? 70 },
    { subject: 'Hygiene', value: result.scoreBreakdown?.hygiene ?? 70 },
  ];

  const skinConcerns = result.skinAnalysis?.concerns ?? [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header: Score + Radar */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Groom Score</h2>
          <ScoreRing score={result.score} />
          <p className="text-gradient" style={{ fontWeight: 600 }}>
            {result.score >= 80 ? '🔥 Excellent Grooming' : result.score >= 60 ? '✨ Good — Room to Improve' : '💪 Let\'s Level Up'}
          </p>
        </div>
        <div>
          <h3 style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>Score Breakdown</h3>
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
      <ExpandableSection title="Dermatology Analysis" icon={<Droplets size={20} className="text-gradient" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Skin Type', value: result.skinAnalysis?.type },
            { label: 'Hydration', value: result.skinAnalysis?.hydrationLevel },
            { label: 'Score', value: `${result.scoreBreakdown?.skin}/100` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(0,240,255,0.06)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
              <p style={{ fontWeight: 700, textTransform: 'capitalize' }}>{value}</p>
            </div>
          ))}
        </div>
        {skinConcerns.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>Detected Concerns:</p>
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
      <ExpandableSection title="Hair & Style Analysis" icon={<Scissors size={20} className="text-gradient" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Hair Type', value: result.hairAnalysis?.type },
            { label: 'Condition', value: result.hairAnalysis?.condition },
            { label: 'Facial Hair', value: result.hairAnalysis?.facialHair },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(138,43,226,0.08)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
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
          <Sparkles size={20} className="text-gradient" /> Personalized Routine
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: 'var(--accent-cyan)' }}>
              <Sun size={16} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Morning Routine</span>
            </div>
            <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.recommendations?.morningRoutine?.map((step, i) => (
                <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: 'var(--accent-purple)' }}>
              <Moon size={16} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Night Routine</span>
            </div>
            <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.recommendations?.nightRoutine?.map((step, i) => (
                <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
        {result.recommendations?.environmentAdjustments && (
          <div style={{ marginTop: 20, background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: 6, fontWeight: 600 }}>🌍 Environment-Aware Tips</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.recommendations.environmentAdjustments}</p>
          </div>
        )}
      </motion.div>

      {/* Weekly Tips + Product Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={18} className="text-gradient" /> Weekly Tips
          </h4>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.recommendations?.weeklyTips?.map((tip, i) => (
              <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{tip}</li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shirt size={18} className="text-gradient" /> Recommended Products
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.recommendations?.products?.map((p, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
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
            <AlertCircle size={18} style={{ color: '#ff6b6b' }} /> Key Improvement Areas
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {result.improvementAreas.map((area, i) => (
              <span key={i} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem' }}>{area}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress Chart */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={20} className="text-gradient" /> Groom Score Progression
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={historyData}>
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
            <Area type="monotone" dataKey="score" stroke="var(--accent-cyan)" strokeWidth={3} fill="url(#scoreGrad)" dot={{ fill: 'var(--accent-purple)', r: 5 }} activeDot={{ r: 7 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Overall Verdict */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(138,43,226,0.05))' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} className="text-gradient" /> AI Verdict
        </h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{result.overall}</p>
      </motion.div>

    </motion.div>
  );
}
