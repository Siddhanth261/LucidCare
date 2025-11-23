import React from 'react';
import { Target } from 'lucide-react';

function EmotionCard({ emotion, score, isStable }) {
  return (
    <div className={`p-3.5 rounded-lg border transition-all ${
      isStable 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs uppercase font-semibold tracking-wide ${
          isStable ? 'text-green-700' : 'text-gray-700'
        }`}>
          {emotion}
        </span>
        <div className="flex items-center gap-1.5">
          {isStable && <Target size={12} className="text-green-600" />}
          <span className="text-sm font-semibold text-gray-800">
            {(score * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
            isStable 
              ? 'bg-green-500' 
              : 'bg-gray-500'
          }`}
          style={{ width: `${score * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

export default EmotionCard;
