import React, { useEffect, useRef, useState, createContext, useContext } from 'react';

import estimation from './estimation';
import draw from './draw';
import WebcamComponent from './webcam';

const RootFunction = (videoRef, detector) => {
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
    }, [detector]);
    const [poseData, setPoseData] = useState(null);
    estimation(videoRef, detector, setPoseData());
    // return draw(poseData={poseData}, poses={poseData});
}

export default RootFunction;