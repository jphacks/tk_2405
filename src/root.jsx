import React, { useEffect, useRef, useState, createContext, useContext } from 'react';

import estimation from './estimation';
import draw from './draw';
import WebcamComponent from './webcam';

const Mappingdraw = (videoRef, detector, props) => {
    const [poseData, setPoseData] = useState(null);
    estimation(videoRef, detector, setPoseData());
    // return draw(poseData={poseData}, poses={poseData});
}

export default Mappingdraw;