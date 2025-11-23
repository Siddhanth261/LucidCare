import React from 'react';
import { Target } from 'lucide-react';

function EmotionCard({ emotion, score, isStable }) {
  return (
    <div 
      className={`p-3 rounded text-center border ${
        isStable 
          ? 'border-green-200 bg-green-50' 
          : score > 0.5 
            ? 'border-indigo-100 bg-indigo-50' 
            : 'border-gray-100 bg-white'
      }`}
    >
      <div className="text-xs uppercase text-gray-500 flex items-center justify-center gap-2">
        <span>{emotion}</span>
        {isStable && <Target size={12} className="text-green-500" />}
      </div>
      <div className="text-lg font-mono font-semibold text-slate-800">
        {(score * 100).toFixed(0)}%
      </div>
    </div>
  );
}

export default EmotionCard;
