const videoElement = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// カメラのセットアップ
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
        });
        videoElement.srcObject = stream;

        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                resolve(videoElement);
            };
        });
    } catch (err) {
        console.error("カメラのアクセス中にエラーが発生しました: ", err);
        alert("カメラのアクセスが許可されているか、デバイスにカメラが接続されているか確認してください。");
    }
}

// MoveNetのセットアップと推論処理
async function loadAndPredict() {
    let modelType = poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
    const detectorConfig = { modelType };
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

    // ビデオが準備できたら、リアルタイムで骨格を認識
    videoElement.play();
    async function detectPose() {
        const poses = await detector.estimatePoses(videoElement);

        // 描画クリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // 骨格認識のポイント描画
        if (poses && poses.length > 0) {
            const pose = poses[0];
            pose.keypoints.forEach((keypoint) => {
                if (keypoint.score > 0.5) {
                    ctx.beginPath();
                    ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                }

                // 肩の位置をログとして吐き出す
                if (keypoint.name === 'left_shoulder' || keypoint.name === 'right_shoulder') {
                    console.log(`${keypoint.name}: x=${keypoint.x}, y=${keypoint.y}`);
                }
            });
        }

        requestAnimationFrame(detectPose);
    }

    detectPose();
}

async function main() {
    await setupCamera();
    loadAndPredict();
}

main();
