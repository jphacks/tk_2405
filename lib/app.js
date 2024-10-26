// TODO:レスポンシブ対応
// TODO:画像のサイズを可視化できるように
// TODO:カウント数が一定以上になったら送信するように

const videoElement = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

let isAboveLine = false;
let count = 0;
let lastChangeTime = 0;
const debounceTime = 400; // 1秒のデバウンス時間

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
    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
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
            let leftShoulder = null;
            let rightShoulder = null;
            pose.keypoints.forEach((keypoint) => {
                if (keypoint.score > 0.5) {
                    ctx.beginPath();
                    ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                }

                // 肩の位置をログとして吐き出す
                if (keypoint.name === 'left_shoulder') {
                    leftShoulder = keypoint;
                    // console.log(`left_shoulder: x=${keypoint.x}, y=${keypoint.y}`);
                }
                if (keypoint.name === 'right_shoulder') {
                    rightShoulder = keypoint;
                    // console.log(`right_shoulder: x=${keypoint.x}, y=${keypoint.y}`);
                }
            });

            // 左右の肩の平均位置を計算
            if (leftShoulder && rightShoulder) {
                const avgY = (leftShoulder.y + rightShoulder.y) / 2;
                const lineY = canvas.height / 2;
                const currentTime = Date.now();

                // フラグを立てたり下げたりしてカウントする（デバウンス処理追加）
                if (avgY < lineY && !isAboveLine && currentTime - lastChangeTime > debounceTime) {
                    isAboveLine = true;
                    lastChangeTime = currentTime;
                } else if (avgY >= lineY && isAboveLine && currentTime - lastChangeTime > debounceTime) {
                    isAboveLine = false;
                    count++;
                    lastChangeTime = currentTime;
                    console.log(`回数: ${count}`);
                }
            }
        }

        // 画面の右から左まで横棒を描画
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.stroke();

        requestAnimationFrame(detectPose);
    }

    detectPose();
}

async function main() {
    await setupCamera();
    loadAndPredict();
}

main();
