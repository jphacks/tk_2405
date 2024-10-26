import React, { useRef, useEffect } from 'react';

function WebcamComponent() {
    const videoRef = useRef(null);

    useEffect(() => {
        const getVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing webcam: ', err);
            }
        };

        getVideo();
    }, []);

    return videoRef;
}

export default WebcamComponent;