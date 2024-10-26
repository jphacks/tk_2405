import { exp } from "@tensorflow/tfjs-core";

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

export { addCount, evaluateShoulderPosition };