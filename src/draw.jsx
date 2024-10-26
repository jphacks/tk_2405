import React, { useEffect, useRef, useState, createContext, useContext } from 'react';

const PoseContext = createContext();

export const usePose = () => {
  return useContext(PoseContext);
}

const draw = (poses, {children}) => {
  const canvasRef = useRef(null);

  const drawPose = (poses) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing

    if (poses && poses.length > 0) {
      const keypoints = poses[0].keypoints;
      keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.3) { // Only draw keypoints with a confidence score above 0.3
          const { x, y } = keypoint;
          // Adjust the keypoint coordinates to fit the canvas size
          const adjustedX = x * (canvas.width / videoRef.current.videoWidth);
          const adjustedY = y * (canvas.height / videoRef.current.videoHeight);
          ctx.beginPath();
          ctx.arc(adjustedX, adjustedY, 3, 0, 2 * Math.PI); // Draw a circle at the keypoint location
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });
    }
  };

  return (
    <PoseContext.Provider value={poseData}>
      <div style={{ position: 'relative', width: '640px', height: '480px' }}>
        {/* Video element to display the webcam feed */}
        <video ref={videoRef} autoPlay playsInline style={{ width: '640px', height: '480px' }} />
        {/* Canvas element to draw the pose on top of the video feed */}
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '640px', height: '480px' }} />
        {children}
      </div>
    </PoseContext.Provider>
  )
}

export default draw;