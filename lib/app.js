// TODO:レスポンシブ対応
// TODO:画像のサイズを可視化できるように
// TODO:カウント数が一定以上になったら送信するように
// TODO:スマホかどうかを判定し、処理を分岐する

const videoElement = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

let isUnderLine = false;
let count = 0;
let lastChangeTime = 0;
const debounceTime = 500;
const countThreshold = 10;
let notificationSent = false;

let detector;

//カメラのセットアップ
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
        console.error("Error accessing the camera: ", err);
        alert("Please check if camera access is allowed and if your device has a connected camera.");
    }
}

//MoveNetモデルの読み込み
async function setupMoveNet() {
    if (!detector) {
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        console.log("MoveNet model loaded.");
    }
}

function addCount() {
    count++;
    if (count >= countThreshold && !notificationSent) {
        alert(`Congratulations! You have completed ${countThreshold} push-ups!`);
        notificationSent = true;
    }
}

//肩の位置を評価
function evaluateShoulderPosition(avgY, lineY) {
    const currentTime = Date.now();

    if (avgY >= lineY && !isUnderLine && currentTime - lastChangeTime > debounceTime) {
        isUnderLine = true;
        lastChangeTime = currentTime;
    } else if (avgY < lineY && isUnderLine && currentTime - lastChangeTime > debounceTime) {
        isUnderLine = false;
        addCount();
        lastChangeTime = currentTime;
        console.log(`Count: ${count}`);
    }
}

//骨格描画
function drawSkeleton(poses) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const lineY = canvas.height * 2 / 3;

    if (poses && poses.length > 0) {
        const pose = poses[0];
        let avgY = null;
        let leftShoulder = null;
        let rightShoulder = null;

        pose.keypoints.forEach((keypoint) => {
            if (keypoint.score > 0.5) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            }

            if (keypoint.name === 'left_shoulder') {
                leftShoulder = keypoint;
            }
            if (keypoint.name === 'right_shoulder') {
                rightShoulder = keypoint;
            }
        });

        if (leftShoulder && rightShoulder) {
            avgY = (leftShoulder.y + rightShoulder.y) / 2;
            evaluateShoulderPosition(avgY, lineY);
        }
    }

    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(canvas.width, lineY);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.stroke();
}

async function loadAndPredict() {
    videoElement.play();
    detectPose();
}

//推論処理
async function detectPose() {
    const poses = await detector.estimatePoses(videoElement);
    drawSkeleton(poses);
    requestAnimationFrame(detectPose);
}

async function main() {
    await setupCamera();
    await setupMoveNet();
    await loadAndPredict();
}

main();
