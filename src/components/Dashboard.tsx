'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Sparkles, Download, Droplets, Scissors, Shirt } from 'lucide-react';

interface AnalysisResult {
  score: number;
  skin: { status: string; advice: string };
  hair: { status: string; advice: string };
  style: { status: string; advice: string };
  overall: string;
}

interface DashboardProps {
  result: AnalysisResult;
  historyData: any[];
}

export default function Dashboard({ result, historyData }: DashboardProps) {
  
  const generatePDF = async () => {
    // In a real app, use html2canvas and jspdf here
    alert("PDF generation is mocked for this demo.");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Stats */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Analysis Complete</h2>
          <p className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Grooming Score: {result.score}/100</p>
        </div>
        <button className="btn-secondary" onClick={generatePDF}>
          <Download size={18} /> Export Report
        </button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Skin Agent */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Droplets className="text-gradient" />
            <h3 style={{ fontSize: '1.2rem' }}>Dermatology Agent</h3>
          </div>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Status: {result.skin.status}</p>
          <p style={{ color: 'var(--text-muted)' }}>{result.skin.advice}</p>
        </motion.div>

        {/* Hair Agent */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Scissors className="text-gradient" />
            <h3 style={{ fontSize: '1.2rem' }}>Stylist Agent</h3>
          </div>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Status: {result.hair.status}</p>
          <p style={{ color: 'var(--text-muted)' }}>{result.hair.advice}</p>
        </motion.div>

        {/* Fashion Agent */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Shirt className="text-gradient" />
            <h3 style={{ fontSize: '1.2rem' }}>Fashion Agent</h3>
          </div>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Status: {result.style.status}</p>
          <p style={{ color: 'var(--text-muted)' }}>{result.style.advice}</p>
        </motion.div>

      </div>

      {/* Overall Summary */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles className="text-gradient"/> Overall Verdict
        </h3>
        <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>{result.overall}</p>
      </motion.div>

      {/* Progress Chart */}
      <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '24px', height: '350px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Grooming Score Progression</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" />
            <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="score" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ fill: 'var(--accent-purple)', strokeWidth: 2, r: 6 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

    </motion.div>
  );
}
