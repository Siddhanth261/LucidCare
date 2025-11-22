import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import './App.css';

function App() {
  // --- Video & Emotion State ---
  const videoRef = useRef();
  const canvasRef = useRef();
  const [initializing, setInitializing] = useState(true);
  const [emotions, setEmotions] = useState({});
  const [stableEmotion, setStableEmotion] = useState("neutral");
  const emotionHistory = useRef([]);
  
  // --- Backend & AI State ---
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comfortMessage, setComfortMessage] = useState("AI waiting for patient data...");
  const websocket = useRef(null);

  // 1. Load Face Models on Mount
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      startVideo();
    };
    loadModels();
  }, []);

  // 2. Track Emotion Stability (10+ seconds of same emotion)
  useEffect(() => {
    if (Object.keys(emotions).length > 0) {
      // Find current dominant emotion
      const dominantEmotion = Object.keys(emotions).reduce((a, b) => 
        emotions[a] > emotions[b] ? a : b
      );
      
      // Add to history with timestamp
      emotionHistory.current.push({
        emotion: dominantEmotion,
        timestamp: Date.now()
      });
      
      // Keep only last 10 seconds of history
      const tenSecondsAgo = Date.now() - 10000;
      emotionHistory.current = emotionHistory.current.filter(
        entry => entry.timestamp > tenSecondsAgo
      );
      
      // Check if one emotion has been dominant for 10+ seconds
      if (emotionHistory.current.length > 0) {
        const emotionCounts = {};
        emotionHistory.current.forEach(entry => {
          emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        });
        
        // Find most frequent emotion in the window
        const mostFrequent = Object.keys(emotionCounts).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b
        );
        
        // Update stable emotion if it's been consistent (>70% of samples)
        const consistencyRatio = emotionCounts[mostFrequent] / emotionHistory.current.length;
        if (consistencyRatio > 0.7 && mostFrequent !== stableEmotion) {
          setStableEmotion(mostFrequent);
        }
      }
    }
  }, [emotions]);

  // 3. Setup WebSocket Logic (Send stable emotion every 15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN && summary) {
            console.log("Requesting comfort for stable emotion:", stableEmotion);
            
            // Clear old message to make way for new stream
            setComfortMessage(""); 
            
            websocket.current.send(JSON.stringify({
                emotion: stableEmotion,
                summary: summary
            }));
        }
    }, 15000); // 15 seconds - less frequent updates

    return () => clearInterval(interval);
  }, [summary, stableEmotion]);

  // 4. Start Webcam
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  // 5. Handle Video Processing Loop
  const handleVideoOnPlay = () => {
    setInitializing(false);
    setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const detections = await faceapi.detectAllFaces(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const canvas = canvasRef.current;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        if (detections.length > 0) {
            setEmotions(detections[0].expressions);
        }
      }
    }, 100);
  };

  // 6. Handle File Upload
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsAnalyzing(true);
    setSummary("Extracting text and analyzing report... please wait...");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
        const res = await fetch('http://localhost:8080/analyze-report', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        setSummary(data.summary);
        
        // Initialize WebSocket connection now that we have context
        startComfortStream();
    } catch (err) {
        console.error(err);
        setSummary("Error analyzing report. Ensure backend is running.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const startComfortStream = () => {
      if (websocket.current) websocket.current.close();
      websocket.current = new WebSocket("ws://localhost:8080/comfort-stream");
      
      websocket.current.onmessage = (event) => {
          const text = event.data;
          if (!text.includes("[END]")) {
              setComfortMessage(prev => prev + text);
          }
      };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <header className="mb-6 flex justify-between items-center border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-400">Med-Empathy AI</h1>
        <div className="text-gray-400 text-sm">Status: {initializing ? "Loading Models..." : "System Active"}</div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* LEFT COLUMN: Patient Monitor */}
        <div className="flex flex-col gap-4">
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    onPlay={handleVideoOnPlay}
                    className="w-full h-auto object-cover"
                />
                <canvas 
                    ref={canvasRef} 
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
            
            {/* Emotion Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
                {Object.entries(emotions).map(([emotion, score]) => (
                    <div key={emotion} className={`p-2 rounded text-center ${emotion === stableEmotion ? 'bg-green-900 ring-2 ring-green-400' : score > 0.5 ? 'bg-blue-900 ring-2 ring-blue-500' : 'bg-gray-800'}`}>
                        <div className="text-xs uppercase text-gray-400">
                            {emotion}
                            {emotion === stableEmotion && <span className="ml-1">🎯</span>}
                        </div>
                        <div className="text-lg font-mono font-bold">{(score * 100).toFixed(0)}%</div>
                    </div>
                ))}
            </div>
            
            {/* Stable Emotion Indicator */}
            <div className="bg-gray-800 p-3 rounded-lg border border-green-500">
                <div className="text-sm text-gray-400 mb-1">Stable Emotion (10s+)</div>
                <div className="text-xl font-bold text-green-400 uppercase">{stableEmotion}</div>
            </div>
        </div>

        {/* RIGHT COLUMN: AI Control Center */}
        <div className="flex flex-col gap-6 h-full">
            
            {/* 1. File Upload Card */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    📄 Medical Report Upload
                </h2>
                <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition">
                        Select PDF
                        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {file && (
                        <div className="text-sm text-gray-300 bg-gray-700 px-3 py-1 rounded">
                            {file.name}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Medical Summary (Scrollable) */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex-grow flex flex-col h-64">
                <h2 className="text-xl font-semibold mb-2 text-yellow-400">Run Diagnostics</h2>
                <div className="bg-gray-900 p-4 rounded-lg flex-grow overflow-y-auto font-mono text-sm leading-relaxed text-gray-300 border border-gray-700">
                    {isAnalyzing ? (
                        <div className="animate-pulse text-blue-400">Analyzing document structure...</div>
                    ) : (
                        summary || "Upload a report to generate a summary."
                    )}
                </div>
            </div>

            {/* 3. Real-time Comfort Assistant */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-xl border border-blue-500 shadow-2xl">
                <h2 className="text-xl font-semibold mb-2 text-white flex items-center gap-2">
                    🤖 AI Comfort Assistant
                    <span className="text-xs font-normal bg-blue-500 px-2 py-0.5 rounded-full">LIVE</span>
                </h2>
                <div className="text-lg text-blue-100 italic">
                    "{comfortMessage}"
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default App;
