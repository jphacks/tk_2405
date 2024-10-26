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
    const modelConfig = {posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
    
    return posedetection.createDetector(posedetection.SupportedModels.MoveNet, modelConfig)
}

async function checkGuiUpdate() {
    