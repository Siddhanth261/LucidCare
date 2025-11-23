import React, { useRef, useState } from 'react';
import './App.css';
import Header from './components/Header';
import VideoMonitor from './components/VideoMonitor';
import EmotionStats from './components/EmotionStats';
import StableEmotionIndicator from './components/StableEmotionIndicator';
import FileUploadCard from './components/FileUploadCard';
import MedicalSummary from './components/MedicalSummary';
import ComfortAssistant from './components/ComfortAssistant';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useEmotionTracking } from './hooks/useEmotionTracking';
import { useWebSocket } from './hooks/useWebSocket';
import { useFileUpload } from './hooks/useFileUpload';

function App() {
  // Refs
  const videoRef = useRef();
  const canvasRef = useRef();
  
  // State
  const [initializing, setInitializing] = useState(true);
  const [emotions, setEmotions] = useState({});
  
  // Custom Hooks
  const { handleVideoOnPlay } = useFaceDetection(videoRef, setInitializing);
  const { stableEmotion } = useEmotionTracking(emotions);
  const { 
    messages, 
    isActive, 
    progress, 
    isComplete,
    startComfortStream,
    requestNextSection 
  } = useWebSocket(null, stableEmotion);
  const { file, summary, isAnalyzing, handleFileUpload } = useFileUpload(startComfortStream);

  const onVideoPlay = () => handleVideoOnPlay(canvasRef, setEmotions);

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 font-sans min-w-full">
      <Header initializing={initializing} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* LEFT COLUMN: Patient Monitor */}
        <div className="flex flex-col gap-4">
          <VideoMonitor 
            videoRef={videoRef}
            canvasRef={canvasRef}
            onPlay={onVideoPlay}
          />
          
          <EmotionStats 
            emotions={emotions}
            stableEmotion={stableEmotion}
          />
          
          <StableEmotionIndicator stableEmotion={stableEmotion} />
        </div>

        {/* RIGHT COLUMN: AI Control Center */}
        <div className="flex flex-col gap-6 h-full">
          <FileUploadCard 
            file={file}
            onFileUpload={handleFileUpload}
          />

          <MedicalSummary 
            summary={summary}
            isAnalyzing={isAnalyzing}
          />

          <ComfortAssistant 
            messages={messages}
            isActive={isActive}
            onNextSection={requestNextSection}
            progress={progress}
            isComplete={isComplete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
