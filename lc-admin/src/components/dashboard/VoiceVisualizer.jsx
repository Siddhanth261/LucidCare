import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

export default function VoiceVisualizer({ isActive }) {
  const [bars, setBars] = useState(Array(24).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(24).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(24).fill(0).map(() => Math.random() * 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-center gap-1 h-12 px-2">
      {bars.map((height, index) => {
        const colors = ['#e2e8f0', '#94a3b8', '#64748b', '#475569', '#1e293b', '#0f766e', '#d97706', '#be123c'];
        const colorIndex = Math.floor((index / 24) * colors.length);
        return (
          <div
            key={index}
            className="flex-1 rounded-full transition-all duration-100"
            style={{
              height: `${Math.max(height, 15)}%`,
              backgroundColor: isActive ? colors[colorIndex] : '#e2e8f0',
              opacity: isActive ? 0.7 + (height / 100) * 0.3 : 0.4
            }}
          />
        );
      })}
    </div>
  );
}