import React from 'react';
import { Target } from 'lucide-react';

function StableEmotionIndicator({ stableEmotion }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 text-center">
      <div className="text-xs text-gray-700 font-semibold mb-2 flex items-center justify-center gap-1.5 uppercase tracking-wide">
        <Target size={14} className="text-gray-600" />
        <span>Stable Emotion (10s+)</span>
      </div>
      <div className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
        {stableEmotion || 'Detecting...'}
      </div>
    </div>
  );
}

export default StableEmotionIndicator;
