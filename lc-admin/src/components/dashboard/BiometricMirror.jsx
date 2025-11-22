import React, { useState, useEffect } from 'react';
import { Camera, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import WebcamControlHub from './WebcamControlHub';

export default function BiometricMirror() {
  const [stressLevel, setStressLevel] = useState(45);
  const [currentState, setCurrentState] = useState('CALM');
  const [webcamActive, setWebcamActive] = useState(false);

  useEffect(() => {
    // Simulate stress level changes
    const interval = setInterval(() => {
      setStressLevel(prev => {
        const newLevel = prev + (Math.random() - 0.5) * 10;
        return Math.max(20, Math.min(80, newLevel));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (stressLevel < 40) setCurrentState('CALM');
    else if (stressLevel < 60) setCurrentState('MODERATE');
    else setCurrentState('ELEVATED');
  }, [stressLevel]);

  const getStateColor = () => {
    if (currentState === 'CALM') return 'from-emerald-500 to-teal-500';
    if (currentState === 'MODERATE') return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const getGlowColor = () => {
    if (currentState === 'CALM') return 'shadow-emerald-500/30';
    if (currentState === 'MODERATE') return 'shadow-yellow-500/30';
    return 'shadow-red-500/30';
  };

  return (
    <Card className="relative overflow-hidden bg-white border border-slate-200 shadow-sm rounded-xl h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Biometric Mirror</h3>
        <div className={`w-2 h-2 rounded-full ${webcamActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
      </div>

      {/* Webcam Feed Area */}
      <div className="aspect-video bg-slate-50 relative overflow-hidden">
        {!webcamActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-3">
                <Camera className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Camera inactive</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-24 h-24 rounded-full border-2 border-slate-900/10 flex items-center justify-center">
              <Activity className="w-10 h-10 text-slate-900" />
            </div>
          </div>
        )}

        {/* Webcam Control Hub */}
        {webcamActive && (
          <WebcamControlHub 
            isActive={webcamActive} 
            onToggle={() => setWebcamActive(!webcamActive)} 
          />
        )}
      </div>

      {/* Stress Score */}
      <div className="p-6 flex-1 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="inline-flex items-baseline gap-2">
            <span className="text-7xl font-bold text-slate-900 tracking-tighter">
              {Math.round(stressLevel)}
            </span>
            <span className="text-xl text-slate-400 font-serif italic">/ 100</span>
          </div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-600 mt-2">
            Current Strain
          </p>
        </div>
        
        {!webcamActive && (
          <button
            onClick={() => setWebcamActive(true)}
            className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Enable Monitoring
          </button>
        )}
      </div>
    </Card>
  );
}