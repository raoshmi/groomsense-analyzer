'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ScanFace } from 'lucide-react';

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="layout-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        className="glass-panel"
        style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', width: '100%' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ScanFace size={64} className="text-gradient" style={{ margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          Groom<span className="text-gradient">Sense</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.1rem' }}>
          Advanced AI analysis for your hair, skin, and overall aesthetic. Get personalized, real-time insights.
        </p>
        
        <button 
          onClick={loginWithGoogle} 
          className="btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
        >
          <Sparkles size={20} />
          Continue with Google
        </button>

        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
