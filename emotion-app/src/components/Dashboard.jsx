import React from 'react';
import VideoMonitor from './VideoMonitor';
import EmotionStats from './EmotionStats';
import StableEmotionIndicator from './StableEmotionIndicator';
import ComfortAssistant from './ComfortAssistant';
import { Activity, Camera } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-6 overflow-hidden">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gray-900 rounded-lg">
                  <Activity size={28} className="text-white" />
                </div>
                Patient Monitoring
              </h1>
              <p className="text-gray-600 ml-14">Real-time emotion and comfort analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-full border border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-700">System Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="bg-gray-800 p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="text-white text-lg font-medium flex items-center gap-2">
                    <Camera size={16} />
                    Live Camera Feed
                  </div>
                </div>
              </div>
              <div className="relative bg-black aspect-square w-full flex-1">
                <VideoMonitor 
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  onPlay={onVideoPlay}
                />
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full overflow-hidden flex flex-col">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                Emotion Analytics
              </h2>
              <div className="flex-1 overflow-y-auto">
                <EmotionStats 
                  emotions={emotions}
                  stableEmotion={stableEmotion}
                />
              </div>
            </div>
          </div>

          <div className="col-span-6 h-full">
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
