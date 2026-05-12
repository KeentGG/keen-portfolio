import type { CanvasOffset, EyeExpression, EyeExpressionPreset, EyeFrame } from "./types";

const defaultLeftEyeOffset: CanvasOffset = [2, 0];
const defaultRightEyeOffset: CanvasOffset = [-2, 0];

const idleFrameMap = [
    [0, 0.25, 0.45, 0.65, 0.8, 0.9, 0.9, 0.8, 0.65, 0.45, 0.25, 0],
    [0.25, 0.55, 0.8, 0.95, 1, 1, 1, 1, 0.95, 0.8, 0.55, 0.25],
    [0.4, 0.75, 0.95, 1, 1, 1, 1, 1, 1, 0.95, 0.75, 0.4],
    [0.25, 0.55, 0.8, 0.95, 1, 1, 1, 1, 0.95, 0.8, 0.55, 0.25],
    [0, 0.2, 0.4, 0.6, 0.75, 0.85, 0.85, 0.75, 0.6, 0.4, 0.2, 0],
];

const idleLeftFrame: EyeFrame = {
  canvasOffset: defaultLeftEyeOffset,
  map: idleFrameMap,
};
const idleRightFrame: EyeFrame = {
  canvasOffset: defaultRightEyeOffset,
  map: idleFrameMap,
};

const blinkFrameMap = [
  [0.25, 0.45, 0.65, 0.8, 0.9, 0.9, 0.9, 0.9, 0.8, 0.65, 0.45, 0.25],
];

const blinkLeftFrame: EyeFrame = {
  canvasOffset: defaultLeftEyeOffset,
  map: blinkFrameMap,
};
const blinkRightFrame: EyeFrame = {
  canvasOffset: defaultRightEyeOffset,
  map: blinkFrameMap,
};

const thinkingFrameMap = [
  [0, 0.2, 0.4, 0.6, 0.8, 0.95, 0.85, 0.7, 0.5, 0.35, 0.15, 0],
  [0.2, 0.5, 0.75, 0.95, 1, 1, 0.95, 0.8, 0.6, 0.45, 0.25, 0.1],
  [0.35, 0.7, 0.95, 1, 1, 1, 1, 0.9, 0.7, 0.5, 0.3, 0.15],
  [0.2, 0.5, 0.75, 0.95, 1, 0.95, 0.85, 0.7, 0.5, 0.35, 0.15, 0],
  [0, 0.15, 0.35, 0.55, 0.75, 0.85, 0.75, 0.6, 0.4, 0.25, 0.1, 0],
];

const thinkingLeftFrame: EyeFrame = {
  canvasOffset: defaultLeftEyeOffset,
  map: thinkingFrameMap,
};
const thinkingRightFrame: EyeFrame = {
  canvasOffset: defaultRightEyeOffset,
  map: thinkingFrameMap,
};

const surprisedFrameMap = [
  [0.2, 0.45, 0.7, 0.9, 1, 1, 1, 1, 1, 1, 0.9, 0.7, 0.45, 0.2],
  [0.35, 0.7, 0.95, 1, 1, 1, 0.8, 0.8, 1, 1, 1, 0.95, 0.7, 0.35],
  [0.45, 0.8, 1, 1, 1, 0.75, 0.45, 0.45, 0.75, 1, 1, 1, 0.8, 0.45],
  [0.35, 0.7, 0.95, 1, 1, 1, 0.85, 0.85, 1, 1, 1, 0.95, 0.7, 0.35],
  [0.15, 0.35, 0.6, 0.8, 0.95, 1, 1, 1, 1, 0.95, 0.8, 0.6, 0.35, 0.15],
];

const surprisedLeftFrame: EyeFrame = {
  canvasOffset: defaultLeftEyeOffset,
  map: surprisedFrameMap,
};
const surprisedRightFrame: EyeFrame = {
  canvasOffset: defaultRightEyeOffset,
  map: surprisedFrameMap,
};

export const eyeFramePresets: Record<EyeExpression, EyeExpressionPreset> = {
  idle: {
    left: idleLeftFrame,
    right: idleRightFrame,
  },
  blink: {
    left: blinkLeftFrame,
    right: blinkRightFrame,
  },
  thinking: {
    left: thinkingLeftFrame,
    right: thinkingRightFrame,
  },
  surprised: {
    left: surprisedLeftFrame,
    right: surprisedRightFrame,
  },
};
