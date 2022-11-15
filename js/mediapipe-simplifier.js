
// Our input frames will come from here.
import controls from "@mediapipe/control_utils"
import drawingUtils from "@mediapipe/drawing_utils"
import mpFaceDetection from "@mediapipe/face_detection"

export const videoElement =
    document.createElement('video');
export const debugCanvas =
    document.createElement('canvas');

debugCanvas.className = 'debugCanvas hidden'
document.body.appendChild(debugCanvas)
const canvasCtx = debugCanvas.getContext('2d');

export const controlsElement =
    document.createElement('div');


export function showDebug(enable) {
    debugCanvas.classList.toggle('hidden', !enable)
}

export const keys = {
    LEFT_EYE: 0,
    RIGHT_EYE: 1,
    NOSE: 2,
    MOUTH: 3,
    LEFT_EAR: 4,
    RIGHT_EAR: 5,
}

function onDebugResults(results) {
    // Hide the spinner.
    // console.log(results);
    // Update the frame rate.
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
    canvasCtx.drawImage(
        results.image, 0, 0, debugCanvas.width, debugCanvas.height);
    if (results.detections.length > 0) {
        drawingUtils.drawRectangle(
            canvasCtx, results.detections[0].boundingBox,
            { color: 'blue', lineWidth: 4, fillColor: '#00000000' });
        drawingUtils.drawLandmarks(canvasCtx, results.detections[0].landmarks, {
            color: 'red',
            radius: 5,
        });
    }
    canvasCtx.restore();
}

export const faceDetection = new mpFaceDetection.FaceDetection({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
    }
});

export function onResults(callback) {
    faceDetection.onResults((results) => { callback(results); onDebugResults(results) });
}

// Present a control panel through which the user can manipulate the solution
// // options.
new controls
    .ControlPanel(controlsElement, {
        selfieMode: true,
        model: 'short',
        minDetectionConfidence: 0.5,
    })
    .add([
        new controls.StaticText({ title: 'MediaPipe Face Detection' }),
        new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
        new controls.SourcePicker({
            onSourceChanged: () => {
                faceDetection.reset();
            },
            onFrame:
                async (input, size) => {
                    const aspect = size.height / size.width;
                    let width, height;
                    if (window.innerWidth > window.innerHeight) {
                        height = window.innerHeight;
                        width = height / aspect;
                    } else {
                        width = window.innerWidth;
                        height = width * aspect;
                    }
                    debugCanvas.width = width;
                    debugCanvas.height = height;
                    await faceDetection.send({ image: input });
                },
            examples: {
                images: [],
                videos: [],
            },
        }),
        new controls.Slider({
            title: 'Model Selection',
            field: 'model',
            discrete: { 'short': 'Short-Range', 'full': 'Full-Range' },
        }),
        new controls.Slider({
            title: 'Min Detection Confidence',
            field: 'minDetectionConfidence',
            range: [0, 1],
            step: 0.01
        }),
    ])
    .on(x => {
        const options = x;
        videoElement.classList.toggle('selfie', options.selfieMode);
        faceDetection.setOptions(options);
    });


export function setOptions(options) {
    faceDetection.setOptions(options);
}