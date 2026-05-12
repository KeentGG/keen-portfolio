export type EyeSide = "left" | "right";

export type EyeExpression = "idle" | "blink" | "thinking" | "surprised";

export type CanvasOffset = readonly [x: number, y: number];

/**
 * A local per-eye frame. The map describes only the eye artwork, not where it
 * appears on the screen. Placement is owned by the face controller.
 * `canvasOffset` nudges the artwork inside its eye canvas, where [0, 0] means
 * the frame is centered on the controller-owned eye center.
 */
export interface EyeFrame {
  map: number[][];
  canvasOffset?: CanvasOffset;
  pulse?: boolean;
}

export interface EyeExpressionPreset {
  left: EyeFrame;
  right: EyeFrame;
}

export const GRID_COLS = 40;
export const GRID_ROWS = 23;
export const PIXEL_SIZE = 2.2;
export const PIXEL_GAP = 1;
export const PIXEL_STEP = PIXEL_SIZE + PIXEL_GAP;
export const SCREEN_ORIGIN = { x: 36.5, y: 44 } as const;
