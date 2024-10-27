import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as posedetection from '@tensorflow-models/pose-detection';

const PoseContext = createContext();

export const usePose = () => {
    return useContext(PoseContext);
};

// Custom hook to execute a callback when pose coordinates are updated
export const usePoseCoordinates = (callback) => {
    const poseData = usePose();
  
    useEffect(() => {
      if (poseData && poseData.length > 0) {
        const keypoints = poseData[0].keypoints;
        callback(keypoints); // Execute callback with the updated keypoints
      }
    }, [poseData, callback]);
  };
  

const estimation = (videoRef, detector, setPoseData) => {
    // const [poseData, setPoseData] = useState(null);
    const detect = async () => {
        if (videoRef.current) {
            const videoElement = videoRef.current;
            result = await detector.estimatePoses(videoElement);
            setPoseData(result);
            requestAnimationFrame(() => detect());
        }
    }
    detect();
}

export default estimation;