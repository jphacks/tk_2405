import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';

import '@tensorflow/tfjs-backend-webgl';

import React, { useEffect, useRef } from 'react';
import WebcamStreamComponent from './webcam_old';

import WebcamComponent from './webcam';
import estimation from './estimation';

const App = () => {
    const [detector, setDetector] = React.useState(null);

    useEffect(() => {
        if (tf.getBackend()) {
            return;
        }
        const initLoad = async () => {
            tf.setBackend('webgl');

            console.log("Loading MoveNet model...");
            const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
            const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
            setDetector(detector);
            console.log("MoveNet model loaded.");
        }
        initLoad();
    }, []);

    const videoref = WebcamComponent();
    const result = estimation(videoref, detector);

    return (
        <>
            <h1>Push-up Counter</h1>
            {/* <WebcamStreamComponent /> */}
            <div>
                <video ref={videoref} autoPlay playsInline />
            </div>
        </>
    )
}

export default App;