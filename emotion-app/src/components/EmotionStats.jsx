import React from 'react';
import EmotionCard from './EmotionCard';
import StableEmotionIndicator from './StableEmotionIndicator';

function EmotionStats({ emotions, stableEmotion }) {
  return (
    <div className="space-y-2">
      {Object.entries(emotions).map(([emotion, score]) => (
        <EmotionCard
          key={emotion}
          emotion={emotion}
          score={score}
          isStable={emotion === stableEmotion}
        />
      ))}
      <div className="pt-2 border-t border-gray-200 mt-3">
        <StableEmotionIndicator stableEmotion={stableEmotion} />
      </div>
    </div>
  );
}

export default EmotionStats;
