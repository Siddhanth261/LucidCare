import React from 'react';
import BiometricMirror from '../components/dashboard/BiometricMirror';
import BillScanner from '../components/dashboard/BillScanner';
import DrLucidConsole from '../components/dashboard/DrLucidConsole';

export default function Home() {
  return (
    <div className="min-h-screen p-8 lg:p-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-500 font-sans">Overview of your medical analytics</p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - 4 columns wide */}
          <div className="lg:col-span-4 space-y-6">
            {/* Biometric Mirror - Top Left */}
            <BiometricMirror />
            
            {/* Bill Scanner - Bottom Left */}
            <BillScanner />
          </div>

          {/* Right Column - 8 columns wide */}
          <div className="lg:col-span-8 h-[800px] lg:h-auto">
            <DrLucidConsole />
          </div>
        </div>
      </div>
    </div>
  );
}