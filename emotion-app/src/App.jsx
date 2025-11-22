import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import './App.css';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [initializing, setInitializing] = useState(true);
  const [emotions, setEmotions] = useState({});

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
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };
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

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4 text-blue-400">Real-time Emotion AI</h1>
      
      <div className="relative flex justify-center items-center">
        {initializing && <div className="absolute z-20 text-xl">Loading Models...</div>}
        
        <video 
            ref={videoRef} 
            autoPlay 
            muted 
            onPlay={handleVideoOnPlay}
            className="rounded-lg shadow-2xl border-4 border-blue-500"
            width="720"
            height="560"
        />
        <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0"
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
          {Object.entries(emotions).map(([emotion, score]) => (
              <div key={emotion} className="bg-gray-800 p-3 rounded-lg text-center w-24">
                  <div className="text-sm uppercase text-gray-400">{emotion}</div>
                  <div className="text-xl font-mono text-green-400">
                      {(score * 100).toFixed(0)}%
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}

export default App;
