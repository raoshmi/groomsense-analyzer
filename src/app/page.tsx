'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Uploader from '@/components/Uploader';
import Dashboard from '@/components/Dashboard';
import { LogOut, User as UserIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

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
      // Create a dummy history if firestore isn't configured by user yet
      const dummyHistory = [
        { date: 'Jan 10', score: 65 },
        { date: 'Feb 15', score: 72 },
        { date: 'Mar 20', score: 78 },
        { date: 'Apr 25', score: 85 }
      ];
      setHistory(dummyHistory);

      // In a real scenario with proper rules:
      // const q = query(collection(db, `users/${user.uid}/history`), orderBy('createdAt', 'asc'), limit(10));
      // const snapshot = await getDocs(q);
      // const data = snapshot.docs.map(doc => doc.data());
      // setHistory(data);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handleImageSelected = async (base64Image: string) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Parse the JSON string returned by Gemini
      let parsedResult;
      try {
        const cleanedStr = data.result.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleanedStr);
      } catch (e) {
        console.error("Failed to parse Gemini JSON", e);
        throw new Error("Invalid response format from AI.");
      }

      setResult(parsedResult);
      
      // Update history
      const newEntry = { date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: parsedResult.score };
      setHistory(prev => [...prev, newEntry]);

      // Save to firestore (if configured)
      // await addDoc(collection(db, `users/${user.uid}/history`), { ...newEntry, createdAt: new Date() });

    } catch (error: any) {
      console.error('Error analyzing image:', error);
      alert(error.message || "An error occurred during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !user) {
    return <div className="layout-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="layout-container">
      <nav className="top-nav">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Groom<span className="text-gradient">Sense</span> Analyzer
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            ) : (
              <UserIcon size={20} />
            )}
            <span style={{ fontSize: '0.9rem' }}>{user.displayName || user.email}</span>
          </div>
          <button className="btn-secondary" onClick={logout} style={{ padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {!result && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Uploader onImageSelected={handleImageSelected} isLoading={analyzing} />
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button className="btn-secondary" onClick={() => setResult(null)} style={{ alignSelf: 'flex-start' }}>
              ← Start New Analysis
            </button>
            <Dashboard result={result} historyData={history} />
          </div>
        )}
      </main>
    </div>
  );
}
