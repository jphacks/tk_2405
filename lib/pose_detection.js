// TensorFlow.jsとPose Detectionモジュールの読み込み
// import * as tf from '@tensorflow/tfjs';
// import * as poseDetection from '@tensorflow-models/pose-detection';

let videoPlayer;
let detector;
let overlayCanvas;
let overlayCtx;

// MoveNetモデルを読み込む関数
async function loadMoveNet() {
    try {
        await tf.setBackend('webgl');
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {//一人のみの姿勢を検出
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            }
        );
    } catch (error) {
        console.error('MoveNet モデルの読み込みに失敗しました:', error);
    }
}

// ビデオからポーズを推定する関数
async function estimatePoses(video) {
    try {
        const poses = await detector.estimatePoses(video);
        return poses;
    } catch (error) {
        console.error('姿勢推定に失敗しました:', error);
        return [];
    }
}

// カメラの読み込みを行う関数
async function loadCamera() {
    const constraints = {
        video: {
            width: 1980,
            height: 1080,
            aspectRatio: 1.77
        }
    };
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoPlayer.srcObject = stream;
    } catch (error) {
        console.error('カメラのアクセスに失敗:', error);
    }
}

// 選択した動画を再生し、ポーズ検出を開始する関数
async function playSelectedVideo() {
    await videoPlayer.play();
    detect();
}

// 画像を描画する関数（オーバーレイ用）
function drawKeypoints(poses, context) {
    poses.forEach((pose) => {
        pose.keypoints.forEach((keypoint) => {
            // キーポイントnoseの座標を取得し、追従する画像を描画
            console.log(pose);
            if (keypoint.name == 'nose') {
                drawTrackingImage(keypoint.x, keypoint.y, context);
            }
        });
    });
}

// 追従する画像を描画する関数
function drawTrackingImage(x, y, context) {
    if (trackingImage.complete) {
        const imageWidth = 600; // 描画する画像の幅
        const imageHeight = 600; // 描画する画像の高さ
        context.drawImage(trackingImage, x - imageWidth / 2, y - imageHeight / 2, imageWidth, imageHeight);
    }
}



// ポーズを検出し続ける関数
async function detect() {
    try {
        if (!videoPlayer.paused && !videoPlayer.ended) {
            const poses = await estimatePoses(videoPlayer);
            if (poses.length > 0) {
                // オーバーレイ用のキャンバスをクリアしてキーポイントを描画
                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                drawKeypoints(poses, overlayCtx);
            }
        }
    } catch (error) {
        console.error('姿勢推定に失敗しました:', error);
    }
    requestAnimationFrame(detect);
}

// ページの読み込みが完了したらMoveNetモデルを読み込み、要素を取得する
window.onload = async function () {
    await loadMoveNet();
    videoPlayer = document.getElementById('videoPlayer');
    overlayCanvas = document.getElementById('overlayCanvas');
    overlayCtx = overlayCanvas.getContext('2d');

    // カメラ映像の読み込み
    await loadCamera();

    videoPlayer.addEventListener('loadedmetadata', function () {
        playSelectedVideo();
    });
};