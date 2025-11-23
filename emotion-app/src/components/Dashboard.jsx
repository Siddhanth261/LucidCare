import React from 'react';
import VideoMonitor from './VideoMonitor';
import EmotionStats from './EmotionStats';
import StableEmotionIndicator from './StableEmotionIndicator';
import ComfortAssistant from './ComfortAssistant';
import { Activity } from 'lucide-react';

function Dashboard({ 
  videoRef, 
  canvasRef, 
  onVideoPlay,
  emotions, 
  stableEmotion,
  messages,
  isActive,
  onNextSection,
  progress,
  isComplete
}) {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-3 overflow-hidden">
      <div className="max-w-full mx-auto h-full flex flex-col">
        {/* Dashboard Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            Patient Monitoring Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
          {/* Column 1: Camera (compact) */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 h-full">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-2 px-3">
                <h2 className="text-white text-xs font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  Camera
                </h2>
              </div>
              <div className="relative bg-black aspect-square w-full">
                <VideoMonitor 
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  onPlay={onVideoPlay}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Emotions (vertical) */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 h-full overflow-y-auto">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Emotions</h2>
              <EmotionStats 
                emotions={emotions}
                stableEmotion={stableEmotion}
              />
            </div>
          </div>

          {/* Column 3: Chat Assistant (wide horizontal) */}
          <div className="col-span-7 h-full">
            <ComfortAssistant 
              messages={messages}
              isActive={isActive}
              onNextSection={onNextSection}
              progress={progress}
              isComplete={isComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
