import { exp } from "@tensorflow/tfjs-core";

function addCount(cnt_count) {
    cnt_count = cnt_count + 1;
    if (count >= countThreshold && !notificationSent) {
        alert(`Congratulations! You have completed ${countThreshold} push-ups!`);
        notificationSent = true;
    }
    return cnt_count;
}

//肩の位置を評価
function evaluateShoulderPosition(avgY, lineY, count, isUnderLine, lastChangeTime, debounceTime) {
    const currentTime = Date.now();

    if (avgY >= lineY && !isUnderLine && currentTime - lastChangeTime > debounceTime) {
        isUnderLine = true;
        lastChangeTime = currentTime;
    } else if (avgY < lineY && isUnderLine && currentTime - lastChangeTime > debounceTime) {
        isUnderLine = false;
        count = addCount();
        lastChangeTime = currentTime;
        console.log(`Count: ${count}`);
    }
    return {count, isUnderLine, lastChangeTime};
}

export { addCount, evaluateShoulderPosition };