'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Uploader from '@/components/Uploader';
import Dashboard from '@/components/Dashboard';
import ComparisonDashboard from '@/components/ComparisonDashboard';
import DebugConsole from '@/components/DebugConsole';
import Chatbot from '@/components/Chatbot';
import { LogOut, User as UserIcon, Settings, Globe } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { Language, UserProfile, AnalysisResult, ComparisonResult, DebugData, ConfidenceScores } from '@/types';

const translations = {
  en: {
    title: "AI Grooming Analysis",
    desc: "Upload or capture your photos — our multi-agent AI analyzes skin, hair & style with personalized recommendations",
    settingsTitle: "⚙️ Personalization Settings — helps AI adapt recommendations",
    weather: "Weather",
    pollution: "Pollution",
    ageGroup: "Age Group",
    gender: "Gender",
    logout: "Logout",
    profile: "Profile Settings",
    newAnalysis: "← New Analysis",
    analyzingText: "Ensemble AI Analyzing your files...",
  },
  hi: {
    title: "एआई ग्रूमिंग विश्लेषण",
    desc: "अपनी तस्वीरें अपलोड या कैप्चर करें — हमारा संयुक्त एआई त्वचा, बाल और स्टाइल का सटीक विश्लेषण प्रदान करता है",
    settingsTitle: "⚙️ वैयक्तिकरण सेटिंग्स — एआई सिफारिशों को और बेहतर बनाने के लिए",
    weather: "मौसम (Weather)",
    pollution: "प्रदूषण (Pollution)",
    ageGroup: "आयु वर्ग",
    gender: "लिंग (Gender)",
    logout: "लॉगआउट",
    profile: "प्रोफ़ाइल सेटिंग",
    newAnalysis: "← नया विश्लेषण",
    analyzingText: "संयुक्त एआई विश्लेषण कर रहा है...",
  }
};

const optionTranslations = {
  en: {
    hot: 'Hot', moderate: 'Moderate', cold: 'Cold', humid: 'Humid',
    low: 'Low', medium: 'Medium', high: 'High',
    teen: 'Teenager', adult: 'Adult', 'middle-aged': 'Middle-Aged', senior: 'Senior',
    male: 'Male', female: 'Female', 'non-binary': 'Non-Binary', unspecified: 'Unspecified'
  },
  hi: {
    hot: 'गर्म', moderate: 'मध्यम', cold: 'ठंडा', humid: 'आर्द्र / उमस',
    low: 'कम', medium: 'मध्यम', high: 'अधिक',
    teen: 'किशोर (Teen)', adult: 'वयस्क (Adult)', 'middle-aged': 'अधेड़ (Middle-aged)', senior: 'बुजुर्ग (Senior)',
    male: 'पुरुष', female: 'महिला', 'non-binary': 'गैर-द्विआधारी', unspecified: 'अनिर्दिष्ट'
  }
};

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [compareResult, setCompareResult] = useState<ComparisonResult | null>(null);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScores | undefined>(undefined);
  
  const [history, setHistory] = useState<{ date: string; score: number }[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weather: 'moderate', pollution: 'medium', ageGroup: 'adult', gender: 'unspecified'
  });
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  const t = translations[lang] || translations.en;
  const opt = optionTranslations[lang] || optionTranslations.en;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadHistory();
    }
  }, [user, loading, router]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, `users/${user.uid}/history`),
        orderBy('createdAt', 'asc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setHistory([
          { date: 'Week 1', score: 62 },
          { date: 'Week 2', score: 68 },
          { date: 'Week 3', score: 74 },
        ]);
      } else {
        const data = snapshot.docs.map(doc => doc.data() as { date: string; score: number });
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to load history', e);
      setHistory([{ date: 'Today', score: 70 }]);
    }
  };

  const handleImageSelected = async (base64Image: string) => {
    setAnalyzing(true);
    setResult(null);
    setCompareResult(null);
    setDebugData(null);
    setConfidenceScores(undefined);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, userProfile, lang }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let parsedResult: AnalysisResult;
      try {
        const cleaned = data.result.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleaned);
      } catch {
        throw new Error('Invalid response format from AI.');
      }

      setResult(parsedResult);
      setDebugData(data.debug);
      if (parsedResult.confidenceScores) {
        setConfidenceScores(parsedResult.confidenceScores);
      }

      // Update profile locally based on new findings
      setUserProfile(prev => ({
        ...prev,
        skinType: parsedResult.skinAnalysis?.type,
        hairType: parsedResult.hairAnalysis?.type,
        concerns: parsedResult.skinAnalysis?.concerns,
        latestScore: parsedResult.score,
      }));

      // Add to history state
      const newEntry = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: parsedResult.score
      };
      setHistory(prev => [...prev, newEntry]);

      // Save to Firestore
      try {
        await addDoc(collection(db, `users/${user!.uid}/history`), {
          ...newEntry,
          skinType: parsedResult.skinAnalysis?.type,
          createdAt: new Date()
        });
      } catch (e) {
        console.warn('Firestore write skipped or failed:', e);
      }

    } catch (error: any) {
      console.error('Error analyzing image:', error);
      alert(error.message || 'An error occurred during analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCompareSelected = async (base64A: string, base64B: string) => {
    setAnalyzing(true);
    setResult(null);
    setCompareResult(null);
    setDebugData(null);
    setConfidenceScores(undefined);
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageA: base64A, imageB: base64B, userProfile, lang }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let parsedResult: ComparisonResult;
      try {
        const cleaned = data.result.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleaned);
      } catch {
        throw new Error('Invalid comparison response format from AI.');
      }

      setCompareResult(parsedResult);
      setDebugData(data.debug);
      if (parsedResult.confidenceScores) {
        setConfidenceScores(parsedResult.confidenceScores);
      }

      // Add after-score to history state
      const newEntry = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: parsedResult.scoreAfter
      };
      setHistory(prev => [...prev, newEntry]);

      // Save to Firestore
      try {
        await addDoc(collection(db, `users/${user!.uid}/history`), {
          ...newEntry,
          createdAt: new Date(),
          isComparison: true
        });
      } catch (e) {
        console.warn('Firestore comparison write skipped or failed:', e);
      }

    } catch (error: any) {
      console.error('Error in side-by-side comparison:', error);
      alert(error.message || 'An error occurred during comparison analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  if (loading || !user) {
    return (
      <div className="layout-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="layout-container">
      {/* Dynamic Navigation */}
      <nav className="top-nav">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => { setResult(null); setCompareResult(null); }}>
          Groom<span className="text-gradient">Sense</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Bilingual Language Switcher */}
          <button 
            className="btn-secondary" 
            onClick={toggleLanguage}
            style={{ padding: '8px 12px', fontSize: '0.82rem', gap: '6px', fontWeight: 600, borderColor: 'rgba(0, 240, 255, 0.2)' }}
          >
            <Globe size={14} style={{ color: 'var(--accent-cyan)' }} />
            {lang === 'en' ? '🌐 English' : '🌐 हिन्दी'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
            ) : (
              <UserIcon size={18} />
            )}
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }} className="desktop-only">{user.displayName || user.email}</span>
          </div>

          <button
            className="btn-secondary"
            onClick={() => setShowProfilePanel(!showProfilePanel)}
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <Settings size={14} /> {t.profile}
          </button>
          
          <button className="btn-secondary" onClick={logout} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
            <LogOut size={14} /> {t.logout}
          </button>
        </div>
      </nav>

      {/* Personalization Profile Panel */}
      {showProfilePanel && (
        <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 40px' }}>
          <p style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
            {t.settingsTitle}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: t.weather, key: 'weather', options: ['hot', 'moderate', 'cold', 'humid'] },
              { label: t.pollution, key: 'pollution', options: ['low', 'medium', 'high'] },
              { label: t.ageGroup, key: 'ageGroup', options: ['teen', 'adult', 'middle-aged', 'senior'] },
              { label: t.gender, key: 'gender', options: ['male', 'female', 'non-binary', 'unspecified'] },
            ].map(({ label, key, options }) => (
              <div key={key} style={{ minWidth: '120px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                <select
                  value={(userProfile as any)[key]}
                  onChange={e => setUserProfile(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{ 
                    background: 'rgba(255,255,255,0.07)', 
                    border: '1px solid rgba(255,255,255,0.12)', 
                    borderRadius: 8, 
                    padding: '8px 12px', 
                    color: 'white', 
                    fontSize: '0.82rem',
                    width: '100%'
                  }}
                >
                  {options.map(o => (
                    <option key={o} value={o} style={{ background: '#111' }}>
                      {(opt as any)[o] || o}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main dashboard contents */}
      <main className="main-content">
        {analyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', minHeight: '300px' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{t.analyzingText}</p>
          </div>
        )}

        {!analyzing && !result && !compareResult && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 12 }}>
                {lang === 'en' ? (
                  <>AI <span className="text-gradient">Grooming Analysis</span></>
                ) : (
                  <>एआई <span className="text-gradient">ग्रूमिंग विश्लेषण</span></>
                )}
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {t.desc}
              </p>
            </div>
            
            <Uploader 
              onImageSelected={handleImageSelected} 
              onCompareSelected={handleCompareSelected}
              isLoading={analyzing} 
              lang={lang}
            />
          </div>
        )}

        {/* Display Single Analysis Dashboard */}
        {!analyzing && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button className="btn-secondary" onClick={() => setResult(null)} style={{ alignSelf: 'flex-start' }}>
              {t.newAnalysis}
            </button>
            <Dashboard result={result} historyData={history} lang={lang} />
          </div>
        )}

        {/* Display Before/After Comparison Dashboard */}
        {!analyzing && compareResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ComparisonDashboard 
              result={compareResult} 
              lang={lang} 
              onNewAnalysis={() => setCompareResult(null)} 
            />
          </div>
        )}
      </main>

      {/* Explainable AI Debug Console drawer */}
      <DebugConsole debugData={debugData} confidenceScores={confidenceScores} lang={lang} />

      {/* Floating AI Chatbot */}
      <Chatbot userProfile={userProfile} analysisHistory={history} lang={lang} />
    </div>
  );
}
