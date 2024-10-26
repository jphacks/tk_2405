import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as posedetection from '@tensorflow-models/pose-detection';

let videoRef = null;

const initializeVideoRef = () => {
  if (!videoRef) {
    videoRef = React.createRef();
  }
};

initializeVideoRef();

// Create a context to share pose data between components
const PoseContext = createContext();

export const usePose = () => {
  return useContext(PoseContext);
};

const WebcamStreamComponent = ({ children }) => {
  const [poseData, setPoseData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const getVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam: ', err);
      }
    };

    const detectPose = async () => {
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);

      const detect = async () => {
        if (videoRef.current) {
          const poses = await detector.estimatePoses(videoRef.current);
          setPoseData(poses);
          drawPose(poses);
        }
        requestAnimationFrame(detect);
      };
      detect();
    };

    const drawPose = (poses) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses && poses.length > 0) {
        const keypoints = poses[0].keypoints;
        keypoints.forEach((keypoint) => {
          if (keypoint.score > 0.3) {
            const { x, y } = keypoint;
            const adjustedX = x * (canvas.width / videoRef.current.videoWidth);
            const adjustedY = y * (canvas.height / videoRef.current.videoHeight);
            ctx.beginPath();
            ctx.arc(adjustedX, adjustedY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });
      }
    };

    getVideoStream().then(() => {
      detectPose();
    });
  }, []);

  return (
    <PoseContext.Provider value={poseData}>
      <div style={{ position: 'relative', width: '640px', height: '480px' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '640px', height: '480px' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '640px', height: '480px' }} />
        {children}
      </div>
    </PoseContext.Provider>
  );
};

export default WebcamStreamComponent;
