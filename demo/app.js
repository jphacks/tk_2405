const videoElement = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// カメラのセットアップ
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });
}

// PoseNetのセットアップと推論処理
async function loadAndPredict() {
    // PoseNetモデルの読み込み
    const net = await posenet.load();

    // ビデオが準備できたら、リアルタイムで骨格を認識
    videoElement.play();
    async function detectPose() {
        const pose = await net.estimateSinglePose(videoElement, {
            flipHorizontal: false,
        });

        // 描画クリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // 骨格認識のポイント描画
        pose.keypoints.forEach((keypoint) => {
            if (keypoint.score > 0.5) {
                ctx.beginPath();
                ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            }
        });

        requestAnimationFrame(detectPose);
    }

    detectPose();
}

async function main() {
    await setupCamera();
    loadAndPredict();
}

main();
