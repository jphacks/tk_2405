import React, { useEffect, useRef, useState, createContext, useContext } from 'react';

import estimation from './estimation';
import draw from './draw';
import WebcamComponent from './webcam';

export const mappingdraw = (videoRef, props) => {
    const poseData = estimation(videoRef, props.detector);
    return draw(poseData, props);
}