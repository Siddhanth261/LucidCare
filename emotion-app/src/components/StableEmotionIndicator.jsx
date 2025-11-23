import React from 'react';
import { Target } from 'lucide-react';

function StableEmotionIndicator({ stableEmotion }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-2 rounded-lg border border-indigo-200 text-center">
      <div className="text-xs text-indigo-700 font-medium mb-0.5 flex items-center justify-center gap-1">
        <Target size={12} className="text-indigo-500" />
        <span>Stable (10s+)</span>
      </div>
      <div className="text-sm font-bold text-slate-800 uppercase">
        {stableEmotion || 'Detecting...'}
      </div>
    </div>
  );
}

export default StableEmotionIndicator;
