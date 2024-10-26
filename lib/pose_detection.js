import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';

import * as mpPose from '@mediapipe/pose';
import * as tfjsWasm from '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

import * as posedetection from '@tensorflow-models/pose-detection';

import {Camera} from './camera';
import { RendererCanvas2d } from './render_canvas2d';
import { setupDatGui } from './option_panel';
import { STATE } from './params';
import { setupStats } from './stats_panel';
import { setBackendAndEnvFlags } from './util';

let detector, camera, stats;
let startInferenceTime, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;
let rafId;
let renderer = null;
let useGpuRenderer = false;

async function createDetector() {
    // 認識モデルの選択
    let modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
    const modelConfig = {modelType};
    
    return posedetection.createDetector(posedetection.SupportedModels.MoveNet, modelConfig)
}

//GUI設定が変更されないので無視
async function checkGuiUpdate() {}

// 推論開始時間
function beginEstimatePosesStats() {
    startInferenceTime = (performance || Date).now();
}

// 推論終了時間
function endEstimatePosesStats() {
    const endInferenceTime = (performance || Date).now();
    inferenceTimeSum += endInferenceTime - startInferenceTime;
    ++numInferences;
  
    const panelUpdateMilliseconds = 1000;
    if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
      const averageInferenceTime = inferenceTimeSum / numInferences;
      inferenceTimeSum = 0;
      numInferences = 0;
      stats.customFpsPanel.update(
          1000.0 / averageInferenceTime, 120 /* maxValue */);
      lastPanelUpdate = endInferenceTime;
    }
}

async function renderResult() {
    if (camera.video.readyState < 2) {
      await new Promise((resolve) => {
        camera.video.onloadeddata = () => {
          resolve(video);
        };
      });
    }
  
    let poses = null;
    let canvasInfo = null;
  
    // Detector can be null if initialization failed (for example when loading
    // from a URL that does not exist).
    if (detector != null) {
      // FPS only counts the time it takes to finish estimatePoses.
      beginEstimatePosesStats();
  
      if (useGpuRenderer && STATE.model !== 'PoseNet') {
        throw new Error('Only PoseNet supports GPU renderer!');
      }
      // Detectors can throw errors, for example when using custom URLs that
      // contain a model that doesn't provide the expected output.
      try {
        if (useGpuRenderer) {
          const [posesTemp, canvasInfoTemp] = await detector.estimatePosesGPU(
              camera.video,
              {maxPoses: STATE.modelConfig.maxPoses, flipHorizontal: false},
              true);
          poses = posesTemp;
          canvasInfo = canvasInfoTemp;
        } else {
          poses = await detector.estimatePoses(
              camera.video,
              {maxPoses: STATE.modelConfig.maxPoses, flipHorizontal: false});
        }
      } catch (error) {
        detector.dispose();
        detector = null;
        alert(error);
      }
  
      endEstimatePosesStats();
    }
    const rendererParams = useGpuRenderer ?
        [camera.video, poses, canvasInfo, STATE.modelConfig.scoreThreshold] :
        [camera.video, poses, STATE.isModelChanged];
    renderer.draw(rendererParams);
  }
  
  async function renderPrediction() {
    await checkGuiUpdate();
  
    if (!STATE.isModelChanged) {
      await renderResult();
    }
  
    rafId = requestAnimationFrame(renderPrediction);
  };

  async function app() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('model')) {
      STATE.model = urlParams.get('model');
    }
    await setupDatGui(urlParams);

    stats = setupStats();
  }