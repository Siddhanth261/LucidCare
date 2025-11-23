import { useEffect, useRef, useState } from 'react';

export const useEmotionTracking = (emotions) => {
  const [stableEmotion, setStableEmotion] = useState("neutral");
  const emotionHistory = useRef([]);

  useEffect(() => {
    if (Object.keys(emotions).length > 0) {
      const dominantEmotion = Object.keys(emotions).reduce((a, b) => 
        emotions[a] > emotions[b] ? a : b
      );
      
      emotionHistory.current.push({
        emotion: dominantEmotion,
        timestamp: Date.now()
      });
      
      const tenSecondsAgo = Date.now() - 10000;
      emotionHistory.current = emotionHistory.current.filter(
        entry => entry.timestamp > tenSecondsAgo
      );
      
      if (emotionHistory.current.length > 0) {
        const emotionCounts = {};
        emotionHistory.current.forEach(entry => {
          emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        });
        
        const mostFrequent = Object.keys(emotionCounts).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b
        );
        
        const consistencyRatio = emotionCounts[mostFrequent] / emotionHistory.current.length;
        if (consistencyRatio > 0.7 && mostFrequent !== stableEmotion) {
          setStableEmotion(mostFrequent);
        }
      }
    }
  }, [emotions, stableEmotion]);

  return { stableEmotion };
};
