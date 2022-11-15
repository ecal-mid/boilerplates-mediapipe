import '/style.css'

import "p5"

import { onResults, setOptions, showDebug, keys } from "./mediapipe-simplifier"

const debugMode = true

let detected = false
let landmarks = []

window.setup = () => {
  createCanvas(0, 0)
  windowResized()
  showDebug(debugMode)
}

window.draw = () => {
  background('black')

  if (detected) {
    const leftEar = toCanvas(landmarks[keys.LEFT_EAR])
    const rightEar = toCanvas(landmarks[keys.RIGHT_EAR])
    ellipse(leftEar.x, leftEar.y, 10)
    ellipse(rightEar.x, rightEar.y, 10)
  }
}

window.windowResized = () => {
  resizeCanvas(windowWidth, windowHeight)
}

setOptions({
  selfieMode: true,
  model: 'short',
  minDetectionConfidence: 0.5,
});

onResults(({ detections }) => {
  const firstDetection = detections[0]
  detected = Boolean(firstDetection)

  if (detected) {
    landmarks = (firstDetection.landmarks);
  }
})

function toCanvas({ x, y }) {
  return {
    x: x * width,
    y: y * height
  }
}