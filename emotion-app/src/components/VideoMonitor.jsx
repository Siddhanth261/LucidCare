import React from 'react';

function VideoMonitor({ videoRef, canvasRef, onPlay }) {
  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        onPlay={onPlay}
        className="w-full h-auto object-cover bg-black"
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}

export default VideoMonitor;
