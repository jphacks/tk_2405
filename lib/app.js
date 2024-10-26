// TODO:レスポンシブ対応
// TODO:画像のサイズを可視化できるように
// TODO:カウント数が一定以上になったら送信するように

const videoElement = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

let isAboveLine = false; // 肩がラインの上にあるかどうかを示すフラグ
let count = 0; // 上下運動の回数
let lastChangeTime = 0; // 最後にフラグが変更された時間
const debounceTime = 500; // デバウンス時間（ミリ秒）

let detector; // MoveNetモデルの変数を独立に宣言

// カメラのセットアップ
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }, // フロントカメラを使用
            audio: false, // オーディオは不要
        });
        videoElement.srcObject = stream;

        // ビデオメタデータが読み込まれたら解決するプロミスを返す
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

// MoveNetのセットアップ
async function setupMoveNet() {
    if (!detector) { // detectorが未定義の場合のみモデルを読み込む
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    }
}

// 推論処理
async function loadAndPredict() {
    // ビデオが準備できたら、リアルタイムで骨格を認識
    videoElement.play();
    async function detectPose() {
        // ビデオフレームから骨格を推定
        const poses = await detector.estimatePoses(videoElement);

        // 描画クリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // 骨格認識のポイント描画
        if (poses && poses.length > 0) {
            const pose = poses[0];
            let leftShoulder = null;
            let rightShoulder = null;

            // キーポイント（関節）の描画と肩の位置取得
            pose.keypoints.forEach((keypoint) => {
                if (keypoint.score > 0.5) { // 信頼度が0.5以上のキーポイントのみ描画
                    ctx.beginPath();
                    ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                }

                // 左肩と右肩の位置を取得
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
                const avgY = (leftShoulder.y + rightShoulder.y) / 2; // 左右の肩のy座標の平均
                const lineY = canvas.height / 2; // 画面中央のy座標
                const currentTime = Date.now();

                // フラグを立てたり下げたりしてカウントする（デバウンス処理追加）
                if (avgY < lineY && !isAboveLine && currentTime - lastChangeTime > debounceTime) {
                    // 肩がラインより上に移動した場合
                    isAboveLine = true;
                    lastChangeTime = currentTime;
                } else if (avgY >= lineY && isAboveLine && currentTime - lastChangeTime > debounceTime) {
                    // 肩がラインより下に移動した場合
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

        requestAnimationFrame(detectPose); // 次のフレームで再度呼び出し
    }

    detectPose();
}

async function main() {
    await setupCamera(); // カメラのセットアップ
    await setupMoveNet(); // MoveNetのセットアップ
    loadAndPredict(); // 推論開始
}

main();
