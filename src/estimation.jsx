import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as posedetection from '@tensorflow-models/pose-detection';

const estimation = (videoRef, detector) => {
    const detect = async () => {
        const videoElement = videoRef.current;
        const result = await detector.estimatePoses(videoElement, {
            flipHorizontal: false,
            maxPoses: 1,
            scoreThreshold: 0.6,
        });
        return result;
    }
    detect();
}

export default estimation;