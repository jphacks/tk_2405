import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as posedetection from '@tensorflow-models/pose-detection';
import { evaluateShoulderPosition } from './pushup_count';

let videoRef = null;

// Initialize the video reference if it hasn't been initialized already
const initializeVideoRef = () => {
  if (!videoRef) {
    videoRef = React.createRef();
  }
};

initializeVideoRef();

// Create a context to share pose data between components
const PoseContext = createContext();

// Custom hook to use pose data from context
export const usePose = () => {
  return useContext(PoseContext);
};

const calcurate = async (poseData, count, isUnderLine, lastChangeTime, debounceTime) => {
  // console.log('Pose data:', poseData);
  if(!poseData || poseData.length === 0) {
    return {count: count, isUnderLine: isUnderLine, lastChangeTime: lastChangeTime};
  }
  const lineY = 300; 
  let leftShoulder = null;
  let rightShoulder = null;
  const pose = poseData[0];
  pose.keypoints.forEach((keypoint) => {
      // console.log('Keypoint:', keypoint.name);
    if (keypoint.name === 'left_shoulder') {
        leftShoulder = keypoint;
        // console.log('Left shoulder:', leftShoulder);
    }
    if (keypoint.name === 'right_shoulder') {
        rightShoulder = keypoint;
    }
  });

  if (leftShoulder !== null && rightShoulder !== null) {
      const avgY = (leftShoulder.y + rightShoulder.y) / 2;
      const currentTime = Date.now();

      if (avgY >= lineY && !isUnderLine && currentTime - lastChangeTime > debounceTime) {
          isUnderLine = true;
          lastChangeTime = currentTime;
      } else if (avgY < lineY && isUnderLine && currentTime - lastChangeTime > debounceTime) {
          isUnderLine = false;
          count = count + 1;
          lastChangeTime = currentTime;
          console.log(`Count: ${count}`);
      }
      // console.log('isUnderLine:', isUnderLine);
    return {count: count, isUnderLine: isUnderLine, lastChangeTime: lastChangeTime};
  }
  return {count: count, isUnderLine: isUnderLine, lastChangeTime: lastChangeTime};
}


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

const WebcamStreamComponent = (decoder, { children }) => {
  const [poseData, setPoseData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Function to get the webcam stream
    const getVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream; // Set the video element's source to the webcam stream
        }
      } catch (err) {
        console.error('Error accessing webcam: ', err); // Handle errors if webcam access fails
      }
    };
    let result = { count: 0, isUnderLine: false, lastChangeTime: 0, debounceTime: 500 };
    // Function to detect poses from the video stream
    const detectPose = async () => {
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);

      // Recursive function to continuously detect poses
      const detect = async () => {
        if (videoRef.current) {
          const poses = await detector.estimatePoses(videoRef.current);
          setPoseData(poses); // Update pose data state
          drawPose(poses); // Draw the detected pose on the canvas
          const tmp = await calcurate(poses, result.count, result.isUnderLine, result.lastChangeTime, result.debounceTime);
          console.log('tmp:', tmp);
          result.count = tmp.count;
          result.isUnderLine = tmp.isUnderLine;
          result.lastChangeTime = tmp.lastChangeTime; 
        }
        requestAnimationFrame(detect); // Continue detecting in the next animation frame
      };
      detect();
    };

    // Function to draw the detected poses on the canvas
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

    // Start the video stream and pose detection
    getVideoStream().then(() => {
      detectPose();
    });
  }, []);

  // Use the custom hook to access pose coordinates and evaluate shoulder position
  // usePoseCoordinates((keypoints) => {
  //   console.log('Keypoints:', keypoints);
  //   const leftShoulder = keypoints.find(point => point.name === 'left_shoulder');
  //   const rightShoulder = keypoints.find(point => point.name === 'right_shoulder');
  //   let result = { count: 0, isUnderLine: false, lastChangeTime: 0, debounceTime: 500 };
  //   console.log('Left shoulder:', leftShoulder);
  //   console.log('Right shoulder:', rightShoulder);
  //   if (leftShoulder && rightShoulder && leftShoulder.score > 0.3 && rightShoulder.score > 0.3) {
  //     // Calculate the average Y position of both shoulders
  //     const avgY = (leftShoulder.y + rightShoulder.y) / 2;
  //     console.log('Average Y position:', avgY);
  //     const lineY = 300; // Threshold Y coordinate for push-up detection (e.g., the "down" position)
  //     let result = evaluateShoulderPosition(avgY, lineY, result);
  //     if (isUnderLine === false) {
  //       console.log('Push-up successful!'); // Log to console when a push-up is completed
  //     }
  //   }
  // });
    let result = { count: 0, isUnderLine: false, lastChangeTime: 0, debounceTime: 500 };


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
  );
};

export default WebcamStreamComponent;
