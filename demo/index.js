// Import @tensorflow/tfjs-core
import * as tf from '@tensorflow/tfjs-core';
// Adds the WebGL backend to the global backend registry.
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';

import * as poseDetection from '@tensorflow-models/pose-detection';

// Create a detector.
const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

// Pass in a video stream to the model to detect poses.
const video = document.getElementById('video');
const poses = await detector.estimatePoses(video);