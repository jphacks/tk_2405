import React, { useEffect, useRef } from 'react';

let videoRef = null;

const initializeVideoRef = () => {
  if (!videoRef) {
    videoRef = React.createRef();
  }
};

initializeVideoRef();

const WebcamStreamComponent = () => {
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

    getVideoStream();
  }, []);
  console.log(videoRef);

  return videoRef.current ? videoRef : null;
};

export default WebcamStreamComponent;
