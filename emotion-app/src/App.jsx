import React, { useRef, useState } from 'react';
import './App.css';
import Drawer from './components/Drawer';
import MenuButton from './components/MenuButton';
import Dashboard from './components/Dashboard';
import DiagnosticsPage from './components/DiagnosticsPage';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'diagnostics'
  
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

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Menu Button */}
      <MenuButton onClick={() => setIsDrawerOpen(true)} />

      {/* Drawer */}
      <Drawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Page Content - Use visibility to keep components mounted */}
      <div style={{ display: currentPage === 'dashboard' ? 'block' : 'none' }}>
        <Dashboard 
          videoRef={videoRef}
          canvasRef={canvasRef}
          onVideoPlay={onVideoPlay}
          emotions={emotions}
          stableEmotion={stableEmotion}
          messages={messages}
          isActive={isActive}
          onNextSection={requestNextSection}
          progress={progress}
          isComplete={isComplete}
        />
      </div>

      <div style={{ display: currentPage === 'diagnostics' ? 'block' : 'none' }}>
        <DiagnosticsPage 
          file={file}
          onFileUpload={handleFileUpload}
          summary={summary}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </div>
  );
}

export default App;
