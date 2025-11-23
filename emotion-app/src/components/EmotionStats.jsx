import React from 'react';
import EmotionCard from './EmotionCard';

function EmotionStats({ emotions, stableEmotion }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Object.entries(emotions).map(([emotion, score]) => (
        <EmotionCard
          key={emotion}
          emotion={emotion}
          score={score}
          isStable={emotion === stableEmotion}
        />
      ))}
    </div>
  );
}

export default EmotionStats;
