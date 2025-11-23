import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceDetection = (videoRef, setInitializing) => {
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

  const handleVideoOnPlay = (canvasRef, setEmotions) => {
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

  return { handleVideoOnPlay };
};
