import React from 'react';

function VideoMonitor({ videoRef, canvasRef, onPlay }) {
  return (
    <div className="relative w-full h-full bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        onPlay={onPlay}
        className="w-full h-full object-cover"
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}

export default VideoMonitor;
