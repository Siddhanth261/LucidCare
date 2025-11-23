import React from 'react';
import { Target } from 'lucide-react';

function StableEmotionIndicator({ stableEmotion }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-sm text-gray-500 mb-1">Stable Emotion (10s+)</div>
      <div className="text-xl font-semibold text-slate-800 uppercase flex items-center gap-2">
        <Target size={18} className="text-indigo-500" /> {stableEmotion}
      </div>
    </div>
  );
}

export default StableEmotionIndicator;
