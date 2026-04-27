'use client';

import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, UploadCloud, X, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploaderProps {
  onImageSelected: (base64Image: string) => void;
  isLoading: boolean;
}

export default function Uploader({ onImageSelected, isLoading }: UploaderProps) {
  const [mode, setMode] = useState<'upload' | 'camera' | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (preview) {
      // Extract base64 part without mime type
      const base64Data = preview.split(',')[1];
      onImageSelected(base64Data);
    }
  };

  if (preview) {
    return (
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
        <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'cover' }} />
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
          <button className="btn-secondary" onClick={() => setPreview(null)} disabled={isLoading}>
            <RefreshCcw size={16} /> Retake
          </button>
          <button className="btn-primary" onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Grooming'}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'camera') {
    return (
      <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
        <button className="btn-secondary" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }} onClick={() => setMode(null)}>
          <X size={16} />
        </button>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          style={{ width: '100%', borderRadius: '12px' }}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="btn-primary" onClick={handleCapture}>
            <Camera size={20} /> Capture Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <ScanFaceIcon />
      <h3 style={{ fontSize: '1.5rem' }}>Upload or Capture Image</h3>
      <p style={{ color: 'var(--text-muted)' }}>Provide a clear photo of your face and upper body for the best analysis.</p>
      
      <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
        <button className="btn-secondary" onClick={() => setMode('camera')}>
          <Camera size={20} /> Use Webcam
        </button>
        
        <label className="btn-secondary" style={{ cursor: 'pointer' }}>
          <UploadCloud size={20} /> Upload File
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
      </div>
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
