'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VisionAIResponse } from '../../types';
import { Camera, Upload, AlertTriangle, ShieldAlert, Sparkles, RefreshCw, X } from 'lucide-react';

export default function VisionContainer() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionAIResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  const startCamera = async () => {
    setErrorMsg('');
    setPhoto(null);
    setResult(null);
    setCameraPermission('pending');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Back camera for trigger identification
        audio: false
      });

      setStream(mediaStream);
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera permission denied or unavailable:', err);
      setCameraPermission('denied');
      setErrorMsg('Could not open camera. Reverting to photo upload.');
    }
  };

  // Stop camera feed
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Capture image frame
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhoto(dataUrl);
      stopCamera();
      
      // Auto analyze the captured frame
      handleAnalyze(dataUrl);
    }
  };

  // File Upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image file size must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setPhoto(dataUrl);
        handleAnalyze(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Call vision route
  const handleAnalyze = async (base64Data: string) => {
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze image');
      }

      const data: VisionAIResponse = await res.json();
      setResult(data);
    } catch (e) {
      setErrorMsg('Vision analysis failed. We returned a simulation response.');
      // Local fallback simulation
      setResult({
        confidence: 0.9,
        identifiedItem: 'A Prescription Pill Container',
        isTrigger: true,
        reason: 'Pill bottles can act as strong cues that prompt urges or represent medication risks.',
        harmReductionAdvice: 'Keep it closed, place it completely out of view, and focus on your breathing.',
        professionalVerificationAdvice: 'Do not consume any unidentified substance. Consult a professional physician.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 max-w-sm mx-auto w-full">
      <div className="flex justify-between items-center pb-2 border-b border-border/60">
        <h3 className="font-bold text-sm text-primary dark:text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4 h-4" /> Vision AI Analyzer
        </h3>
        {photo && (
          <button 
            onClick={() => {
              setPhoto(null);
              setResult(null);
              startCamera();
            }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-muted-foreground"
            aria-label="Restart camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Camera / Preview Box */}
      <div className="relative aspect-square w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Active Stream */}
        {cameraPermission === 'granted' && stream && !photo && (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
              <button
                onClick={captureFrame}
                className="w-14 h-14 bg-white rounded-full border-4 border-slate-300 hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer"
                aria-label="Capture snapshot"
              />
            </div>
          </>
        )}

        {/* Captured Photo / Uploaded File View */}
        {photo && (
          <img 
            src={photo} 
            alt="Captured substance or trigger" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Camera Permission Pending/Blocked or Upload Mode */}
        {(!stream && !photo) && (
          <div className="p-6 text-center space-y-4 text-white">
            <p className="text-xs text-slate-400">
              {cameraPermission === 'denied' 
                ? 'Camera access is blocked or unavailable on this device.' 
                : 'Requesting device camera feed...'}
            </p>
            
            <label className="inline-flex items-center space-x-2 py-2 px-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition select-none">
              <Upload className="w-4 h-4" />
              <span>Upload Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/75 flex flex-col items-center justify-center space-y-2.5 z-25 text-white">
            <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-300">Analyzing surrounding...</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Results Panel */}
      {result && !loading && (
        <div className="space-y-3.5 pt-2">
          {/* Substance / Trigger ID Banner */}
          <div className={`p-3.5 rounded-2xl border ${
            result.isTrigger 
              ? 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50' 
              : 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
                  Identified Object
                </p>
                <p className={`font-bold text-base ${result.isTrigger ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {result.identifiedItem}
                </p>
              </div>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold uppercase">
                {Math.round(result.confidence * 100)}% Conf
              </span>
            </div>
            
            <p className="text-xs text-foreground font-medium mt-2 leading-relaxed">
              {result.reason}
            </p>
          </div>

          {/* Harm Reduction Guidance */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-border/60 space-y-1">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-secondary flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" /> De-escalation Grounder
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground font-medium">
              {result.harmReductionAdvice}
            </p>
          </div>

          {/* Under confidence Safety Warning */}
          {result.confidence < 0.7 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60 rounded-2xl flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Substance Confidence Low
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {result.professionalVerificationAdvice || 'Never consume unknown substances. Seek professional verification.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/25 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex items-start space-x-2 text-xs text-amber-700 dark:text-amber-400">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
