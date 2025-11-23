import React, { useRef, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import Drawer from "./components/Drawer";

import VideoMonitor from "./components/VideoMonitor";
import EmotionStats from "./components/EmotionStats";
import StableEmotionIndicator from "./components/StableEmotionIndicator";

import FileUploadCard from "./components/FileUploadCard";
import MedicalSummary from "./components/MedicalSummary";
import ComfortAssistant from "./components/ComfortAssistant";

import BillAnalyzer from "./pages/BillAnalyzer";
import MenuButton from "./components/MenuButton";  // ⭐ ADDED

import { useFaceDetection } from "./hooks/useFaceDetection";
import { useEmotionTracking } from "./hooks/useEmotionTracking";
import { useWebSocket } from "./hooks/useWebSocket";
import { useFileUpload } from "./hooks/useFileUpload";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState("dashboard");

  const videoRef = useRef();
  const canvasRef = useRef();

  const [initializing, setInitializing] = useState(true);
  const [emotions, setEmotions] = useState({});

  const { handleVideoOnPlay } = useFaceDetection(videoRef, setInitializing);
  const { stableEmotion } = useEmotionTracking(emotions);

  const {
    messages,
    isActive,
    progress,
    isComplete,
    startComfortStream,
    requestNextSection,
  } = useWebSocket(null, stableEmotion);

  const { file, summary, isAnalyzing, handleFileUpload } =
    useFileUpload(startComfortStream);

  const onVideoPlay = () => handleVideoOnPlay(canvasRef, setEmotions);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col gap-4">
              <VideoMonitor
                videoRef={videoRef}
                canvasRef={canvasRef}
                onPlay={onVideoPlay}
              />

              <EmotionStats emotions={emotions} stableEmotion={stableEmotion} />

              <StableEmotionIndicator stableEmotion={stableEmotion} />
            </div>

            <div className="flex flex-col gap-6 h-full">
              <FileUploadCard file={file} onFileUpload={handleFileUpload} />

              <MedicalSummary summary={summary} isAnalyzing={isAnalyzing} />

              <ComfortAssistant
                messages={messages}
                isActive={isActive}
                onNextSection={requestNextSection}
                progress={progress}
                isComplete={isComplete}
                mode={stableEmotion}
              />
            </div>
          </div>
        );

      case "bill":
        return <BillAnalyzer />;

      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 font-sans overflow-x-hidden">
      {/* Header */}
      <Header initializing={initializing} />

      {/* ⭐ Floating Menu Button to open Drawer */}
      <MenuButton onClick={() => setDrawerOpen(true)} />

      {/* Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(p) => {
          setPage(p);
          setDrawerOpen(false);
        }}
        currentPage={page}
      />

      {/* Main Content */}
      {renderPage()}
    </div>
  );
}

export default App;
