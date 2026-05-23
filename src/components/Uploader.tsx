'use client';

import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, UploadCloud, X, RefreshCcw, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploaderProps {
  onImageSelected: (base64Image: string) => void;
  onCompareSelected: (base64A: string, base64B: string) => void;
  isLoading: boolean;
  lang?: 'en' | 'hi';
}

const translations = {
  en: {
    singleMode: "Single Analysis",
    compareMode: "Before / After Compare",
    uploadTitle: "Upload or Capture Image",
    compareTitle: "Before & After Grooming Comparison",
    uploadDesc: "Provide a clear photo of your face and upper body for the best dermatology and styling analysis.",
    compareDesc: "Upload two photos—one before grooming and one after—to see your styling progression and get an ensemble delta feedback.",
    useWebcam: "Use Webcam",
    uploadFile: "Upload File",
    beforePhoto: "Before Photo (Image A)",
    afterPhoto: "After Photo (Image B)",
    retake: "Retake",
    reset: "Reset Both",
    analyzeSingle: "Analyze Grooming",
    analyzeCompare: "Analyze Comparison Journey",
    analyzing: "AI Ensemble Analyzing...",
    capturePhoto: "Capture Photo",
    cameraError: "Webcam Access Issue",
    cameraErrorDesc: "Camera permission denied or camera not found. Please enable camera access in your browser site settings and refresh the page.",
    back: "Back"
  },
  hi: {
    singleMode: "सिंगल विश्लेषण",
    compareMode: "तुलना मोड (पहले / बाद में)",
    uploadTitle: "फ़ोटो अपलोड करें या कैप्चर करें",
    compareTitle: "पहले और बाद की ग्रूमिंग तुलना",
    uploadDesc: "सर्वोत्तम त्वचाविज्ञान और स्टाइलिंग विश्लेषण के लिए अपने चेहरे और ऊपरी शरीर की एक स्पष्ट तस्वीर प्रदान करें।",
    compareDesc: "अपनी स्टाइलिंग प्रगति देखने और एक संयुक्त प्रतिक्रिया प्राप्त करने के लिए दो फ़ोटो अपलोड करें—एक संवारने से पहले और एक बाद में।",
    useWebcam: "वेबकैम का उपयोग करें",
    uploadFile: "फ़ाइल अपलोड करें",
    beforePhoto: "पहले की फ़ोटो (Image A)",
    afterPhoto: "बाद की फ़ोटो (Image B)",
    retake: "फिर से लें",
    reset: "दोनों रीसेट करें",
    analyzeSingle: "ग्रूमिंग का विश्लेषण करें",
    analyzeCompare: "तुलना यात्रा का विश्लेषण करें",
    analyzing: "एआई समूह विश्लेषण कर रहा है...",
    capturePhoto: "फ़ोटो कैप्चर करें",
    cameraError: "वेबकैम एक्सेस समस्या",
    cameraErrorDesc: "कैमरा अनुमति अस्वीकृत या कैमरा नहीं मिला। कृपया अपने ब्राउज़र साइट सेटिंग्स में कैमरा एक्सेस सक्षम करें और पेज को रीफ़्रेश करें।",
    back: "पीछे"
  }
};

export default function Uploader({ onImageSelected, onCompareSelected, isLoading, lang = 'en' }: UploaderProps) {
  const t = translations[lang] || translations.en;
  
  const [activeTab, setActiveTab] = useState<'single' | 'compare'>('single');
  const [cameraMode, setCameraMode] = useState<{ active: boolean; slot: 'single' | 'before' | 'after' | null }>({
    active: false, slot: null
  });
  
  const [previewSingle, setPreviewSingle] = useState<string | null>(null);
  const [previewBefore, setPreviewBefore] = useState<string | null>(null);
  const [previewAfter, setPreviewAfter] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<boolean>(false);
  
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      if (cameraMode.slot === 'single') {
        setPreviewSingle(imageSrc);
      } else if (cameraMode.slot === 'before') {
        setPreviewBefore(imageSrc);
      } else if (cameraMode.slot === 'after') {
        setPreviewAfter(imageSrc);
      }
      setCameraMode({ active: false, slot: null });
      setCameraError(false);
    }
  }, [webcamRef, cameraMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'single' | 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (slot === 'single') setPreviewSingle(result);
        else if (slot === 'before') setPreviewBefore(result);
        else if (slot === 'after') setPreviewAfter(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSingleAnalyze = () => {
    if (previewSingle) {
      const base64Data = previewSingle.split(',')[1];
      onImageSelected(base64Data);
    }
  };

  const handleCompareAnalyze = () => {
    if (previewBefore && previewAfter) {
      const base64Before = previewBefore.split(',')[1];
      const base64After = previewAfter.split(',')[1];
      onCompareSelected(base64Before, base64After);
    }
  };

  const resetAll = () => {
    setPreviewSingle(null);
    setPreviewBefore(null);
    setPreviewAfter(null);
    setCameraError(false);
    setCameraMode({ active: false, slot: null });
  };

  // Render Camera Mode Screen
  if (cameraMode.active) {
    return (
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <button 
          className="btn-secondary" 
          style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, padding: '8px' }} 
          onClick={() => { setCameraMode({ active: false, slot: null }); setCameraError(false); }}
        >
          <X size={16} />
        </button>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--accent-cyan)' }}>
          📸 {cameraMode.slot === 'before' ? t.beforePhoto : cameraMode.slot === 'after' ? t.afterPhoto : t.uploadTitle}
        </h3>
        
        {cameraError ? (
          <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={32} style={{ color: '#ff6b6b' }} />
            <h4 style={{ fontWeight: 600, color: '#ff6b6b' }}>{t.cameraError}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.cameraErrorDesc}</p>
          </div>
        ) : (
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#000', display: 'flex', justifyContent: 'center' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              onUserMediaError={() => setCameraError(true)}
              style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'contain' }}
            />
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button className="btn-secondary" onClick={() => { setCameraMode({ active: false, slot: null }); setCameraError(false); }}>
            {t.back}
          </button>
          {!cameraError && (
            <button className="btn-primary" onClick={handleCapture}>
              <Camera size={18} /> {t.capturePhoto}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Mode Tabs Selector */}
      <div className="glass-panel" style={{ padding: '6px', display: 'flex', borderRadius: '14px', background: 'rgba(255,255,255,0.03)' }}>
        <button
          onClick={() => { setActiveTab('single'); resetAll(); }}
          style={{
            flex: 1, padding: '10px 16px', border: 'none', borderRadius: '10px',
            background: activeTab === 'single' ? 'var(--accent-gradient)' : 'transparent',
            color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s ease', boxShadow: activeTab === 'single' ? '0 4px 15px rgba(0, 240, 255, 0.2)' : 'none'
          }}
        >
          <Camera size={16} /> {t.singleMode}
        </button>
        <button
          onClick={() => { setActiveTab('compare'); resetAll(); }}
          style={{
            flex: 1, padding: '10px 16px', border: 'none', borderRadius: '10px',
            background: activeTab === 'compare' ? 'var(--accent-gradient)' : 'transparent',
            color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s ease', boxShadow: activeTab === 'compare' ? '0 4px 15px rgba(138, 43, 226, 0.2)' : 'none'
          }}
        >
          <ArrowRightLeft size={16} /> {t.compareMode}
        </button>
      </div>

      {/* SINGLE PHOTO UPLOAD MODE */}
      {activeTab === 'single' && (
        <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {previewSingle ? (
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <img src={previewSingle} alt="Preview" style={{ width: '100%', borderRadius: '14px', maxHeight: '320px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
                <button className="btn-secondary" onClick={() => setPreviewSingle(null)} disabled={isLoading}>
                  <RefreshCcw size={16} /> {t.retake}
                </button>
                <button className="btn-primary" onClick={handleSingleAnalyze} disabled={isLoading}>
                  {isLoading ? t.analyzing : t.analyzeSingle}
                </button>
              </div>
            </div>
          ) : (
            <>
              <ScanFaceIcon />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{t.uploadTitle}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', lineHeight: 1.5 }}>{t.uploadDesc}</p>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button className="btn-secondary" onClick={() => setCameraMode({ active: true, slot: 'single' })}>
                  <Camera size={18} /> {t.useWebcam}
                </button>
                <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                  <UploadCloud size={18} /> {t.uploadFile}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'single')} />
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* BEFORE / AFTER COMPARISON UPLOAD MODE */}
      {activeTab === 'compare' && (
        <div className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>{t.compareTitle}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>{t.compareDesc}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Slot A: Before */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', alignItems: 'center', justifyContent: 'center', minHeight: '260px', position: 'relative' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '8px' }}>{t.beforePhoto}</span>
              {previewBefore ? (
                <div style={{ width: '100%', position: 'relative' }}>
                  <img src={previewBefore} alt="Before Preview" style={{ width: '100%', borderRadius: '10px', height: '180px', objectFit: 'cover' }} />
                  <button onClick={() => setPreviewBefore(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,240,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,240,255,0.2)' }}>
                    <UploadCloud size={24} style={{ color: 'var(--accent-cyan)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }} onClick={() => setCameraMode({ active: true, slot: 'before' })}>
                      <Camera size={14} />
                    </button>
                    <label className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <UploadCloud size={14} />
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'before')} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Slot B: After */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', alignItems: 'center', justifyContent: 'center', minHeight: '260px', position: 'relative' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '8px' }}>{t.afterPhoto}</span>
              {previewAfter ? (
                <div style={{ width: '100%', position: 'relative' }}>
                  <img src={previewAfter} alt="After Preview" style={{ width: '100%', borderRadius: '10px', height: '180px', objectFit: 'cover' }} />
                  <button onClick={() => setPreviewAfter(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(138,43,226,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(138,43,226,0.2)' }}>
                    <UploadCloud size={24} style={{ color: 'var(--accent-purple)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }} onClick={() => setCameraMode({ active: true, slot: 'after' })}>
                      <Camera size={14} />
                    </button>
                    <label className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <UploadCloud size={14} />
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'after')} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
            {(previewBefore || previewAfter) && (
              <button className="btn-secondary" onClick={resetAll} disabled={isLoading}>
                {t.reset}
              </button>
            )}
            <button
              className="btn-primary"
              onClick={handleCompareAnalyze}
              disabled={isLoading || !previewBefore || !previewAfter}
              style={{ minWidth: '220px' }}
            >
              {isLoading ? t.analyzing : t.analyzeCompare}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScanFaceIcon() {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
      style={{ 
        width: '100px', height: '100px', 
        borderRadius: '50%', 
        background: 'rgba(0, 240, 255, 0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--accent-cyan)'
      }}
    >
      <UploadCloud size={40} className="text-gradient" />
    </motion.div>
  );
}
