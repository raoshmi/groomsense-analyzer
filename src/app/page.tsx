'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Uploader from '@/components/Uploader';
import Dashboard from '@/components/Dashboard';
import Chatbot from '@/components/Chatbot';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';

interface UserProfile {
  skinType?: string;
  hairType?: string;
  concerns?: string[];
  latestScore?: number;
  weather?: string;
  pollution?: string;
  ageGroup?: string;
  gender?: string;
}

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<{ date: string; score: number }[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weather: 'moderate', pollution: 'medium', ageGroup: 'adult', gender: 'unspecified'
  });
  const [showProfilePanel, setShowProfilePanel] = useState(false);

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
        // Seed dummy history for new users
        setHistory([
          { date: 'Week 1', score: 60 },
          { date: 'Week 2', score: 67 },
          { date: 'Week 3', score: 73 },
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
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, userProfile }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let parsedResult;
      try {
        const cleaned = data.result.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleaned);
      } catch {
        throw new Error('Invalid response format from AI.');
      }

      setResult(parsedResult);

      // Update profile from analysis
      setUserProfile(prev => ({
        ...prev,
        skinType: parsedResult.skinAnalysis?.type,
        hairType: parsedResult.hairAnalysis?.type,
        concerns: parsedResult.skinAnalysis?.concerns,
        latestScore: parsedResult.score,
      }));

      // Add to history
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
        console.warn('Firestore write failed (check rules):', e);
      }

    } catch (error: any) {
      console.error('Error analyzing image:', error);
      alert(error.message || 'An error occurred during analysis.');
    } finally {
      setAnalyzing(false);
    }
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
      <nav className="top-nav">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Groom<span className="text-gradient">Sense</span> Analyzer
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            ) : (
              <UserIcon size={20} />
            )}
            <span style={{ fontSize: '0.9rem' }}>{user.displayName || user.email}</span>
          </div>
          <button
            className="btn-secondary"
            onClick={() => setShowProfilePanel(!showProfilePanel)}
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <Settings size={15} /> Profile
          </button>
          <button className="btn-secondary" onClick={logout} style={{ padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Personalization Profile Panel */}
      {showProfilePanel && (
        <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 40px' }}>
          <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
            ⚙️ Personalization Settings — helps AI adapt recommendations
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Weather', key: 'weather', options: ['hot', 'moderate', 'cold', 'humid'] },
              { label: 'Pollution', key: 'pollution', options: ['low', 'medium', 'high'] },
              { label: 'Age Group', key: 'ageGroup', options: ['teen', 'adult', 'middle-aged', 'senior'] },
              { label: 'Gender', key: 'gender', options: ['male', 'female', 'non-binary', 'unspecified'] },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                <select
                  value={(userProfile as any)[key]}
                  onChange={e => setUserProfile(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 10px', color: 'white', fontSize: '0.85rem' }}
                >
                  {options.map(o => <option key={o} value={o} style={{ background: '#111' }}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="main-content">
        {!result && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
                AI <span className="text-gradient">Grooming Analysis</span>
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Upload your photo — our multi-agent AI analyzes skin, hair & style with personalized recommendations
              </p>
            </div>
            <Uploader onImageSelected={handleImageSelected} isLoading={analyzing} />
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button className="btn-secondary" onClick={() => setResult(null)} style={{ alignSelf: 'flex-start' }}>
              ← New Analysis
            </button>
            <Dashboard result={result} historyData={history} />
          </div>
        )}
      </main>

      {/* Floating AI Chatbot */}
      <Chatbot userProfile={userProfile} analysisHistory={history} />
    </div>
  );
}
