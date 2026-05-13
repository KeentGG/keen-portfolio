import type {
  EyeExpression,
  EyeExpressionPreset,
  EyeFrame,
  EyeMorphMode,
  EyeSide,
  EyeTransitionOptions,
} from "./types";
import { GRID_COLS, GRID_ROWS } from "./types";
import { eyeFramePresets } from "./pixelEyePresets";

type EasingFunction = (t: number) => number;

const minimumVisibleOpacity = 0.06;
const blinkMinDelay = 2600;
const blinkMaxDelay = 6200;
const bufferLength = GRID_ROWS * GRID_COLS;
const halfScreenCols = GRID_COLS / 2;

const easingFunctions: Record<string, EasingFunction> = {
  linear: (t) => t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

const defaultTransitionOptions = {
  duration: 220,
  easing: "easeOutCubic" as const,
  mode: "sdf" as const,
  feather: 1.25,
  threshold: 0.12,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampOpacity(value: number) {
  return clamp(value, 0, 1);
}

function resolveEasing(easing?: EyeTransitionOptions["easing"]): EasingFunction {
  if (typeof easing === "function") return easing;
  if (easing && easing in easingFunctions) return easingFunctions[easing];
  return easingFunctions.easeOutCubic;
}

function applySteps(t: number, steps?: number) {
  if (!steps || steps <= 1) return t;
  return Math.round(t * steps) / steps;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function distanceToOpacity(distance: number, feather: number) {
  return 1 - smoothstep(-feather, feather, distance);
}

function getRow(index: number) {
  return Math.floor(index / GRID_COLS);
}

function getCol(index: number) {
  return index % GRID_COLS;
}

function squaredGridDistance(a: number, b: number) {
  const rowDelta = getRow(a) - getRow(b);
  const colDelta = getCol(a) - getCol(b);
  return rowDelta * rowDelta + colDelta * colDelta;
}

interface EyeCenter {
  col: number;
  row: number;
}

interface EyeFrameSize {
  cols: number;
  rows: number;
}

function getFrameSize(frame: EyeFrame): EyeFrameSize {
  return {
    rows: frame.map.length,
    cols: frame.map[0]?.length ?? 0,
  };
}

function getBufferIndex(row: number, col: number) {
  return row * GRID_COLS + col;
}

interface ActiveTransition {
  startedAt: number;
  duration: number;
  easing: EasingFunction;
  steps?: number;
  mode: EyeMorphMode;
  feather: number;
  threshold: number;
  onComplete?: () => void;
}

class CritterFaceController extends HTMLElement {
  private grid: (SVGRectElement | null)[][] = [];
  private displayBuffer = new Float32Array(bufferLength);
  private previousBuffer = new Float32Array(bufferLength);
  private baseBuffer = new Float32Array(bufferLength);
  private transitionFromBuffer = new Float32Array(bufferLength);
  private transitionToBuffer = new Float32Array(bufferLength);
  private transitionFromSdf = new Float32Array(bufferLength);
  private transitionToSdf = new Float32Array(bufferLength);
  private activeCells = new Set<number>();
  private pulsableCells = new Set<number>();
  private pulseGloballyEnabled = true;

  private animationFrame = 0;
  private blinkTimer = 0;
  private blinkOpenTimer = 0;
  private blinkRestoreTimer = 0;
  private reducedMotion = false;
  private observer?: IntersectionObserver;
  private isVisible = true;
  private currentExpression: EyeExpression = "idle";
  private lookOffset = 0;
  private transition?: ActiveTransition;

  // Web Component lifecycle hook: the browser calls this when
  // <critter-face-controller> is inserted into the DOM.
  connectedCallback() {
    this.buildGrid();

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    this.setupVisibilityObserver();
    this.applyExpression("idle");

    if (this.dataset.animate !== "false" && !this.reducedMotion) {
      this.startAnimationLoop();
      this.scheduleBlink();
    }
  }

  // Web Component lifecycle hook: the browser calls this when
  // <critter-face-controller> is removed from the DOM.
  disconnectedCallback() {
    cancelAnimationFrame(this.animationFrame);
    window.clearTimeout(this.blinkTimer);
    this.clearBlinkSequence();
    this.observer?.disconnect();
  }

  setExpression(expression: EyeExpression, options?: EyeTransitionOptions) {
    if (expression === "blink") {
      this.blink();
      return;
    }

    this.clearBlinkSequence();
    this.currentExpression = expression;

    if (this.reducedMotion) {
      this.applyExpression(expression);
      this.restartAnimationLoopIfAnimated();
      return;
    }

    this.startTransitionToPreset(eyeFramePresets[expression], options);
  }

  setLookOffset(offset: number) {
    this.lookOffset = clamp(offset, -1, 1);
    if (this.transition) {
      cancelAnimationFrame(this.animationFrame);
      this.transition = undefined;
    }
    this.applyExpression(this.currentExpression);
    this.restartAnimationLoopIfAnimated();
  }

  setCustomPreset(preset: EyeExpressionPreset, options?: EyeTransitionOptions) {
    this.clearBlinkSequence();

    if (this.reducedMotion) {
      this.composePreset(preset, this.displayBuffer);
      this.baseBuffer.set(this.displayBuffer);
      this.flushBuffer({ force: true });
      this.restartAnimationLoopIfAnimated();
      return;
    }

    this.startTransitionToPreset(preset, options);
  }

  setPulseEnabled(enabled: boolean) {
    this.pulseGloballyEnabled = enabled;
    if (enabled) {
      this.restartAnimationLoopIfAnimated();
    } else {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private buildGrid() {
    this.grid = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => null),
    );

    const pixels = this.querySelectorAll<SVGRectElement>(".critter-eye-pixel");

    for (const pixel of pixels) {
      const row = Number(pixel.dataset.row);
      const col = Number(pixel.dataset.col);

      if (
        Number.isInteger(row) &&
        Number.isInteger(col) &&
        row >= 0 &&
        row < GRID_ROWS &&
        col >= 0 &&
        col < GRID_COLS
      ) {
        this.grid[row][col] = pixel;
      }
    }
  }

  private applyExpression(expression: EyeExpression) {
    const preset = eyeFramePresets[expression];

    this.composePreset(preset, this.displayBuffer);
    this.baseBuffer.set(this.displayBuffer);
    this.flushBuffer({ force: true });
  }

  private composePreset(preset: EyeExpressionPreset, targetBuffer: Float32Array) {
    targetBuffer.fill(0);
    this.activeCells.clear();
    this.pulsableCells.clear();

    this.blitEyeFrame(preset.left, "left", targetBuffer);
    this.blitEyeFrame(preset.right, "right", targetBuffer);
  }

  private blitEyeFrame(
    frame: EyeFrame,
    side: EyeSide,
    targetBuffer: Float32Array,
  ) {
    const size = getFrameSize(frame);
    const cappedCols = Math.min(size.cols, halfScreenCols);
    const cappedRows = Math.min(size.rows, GRID_ROWS);
    const [offsetX, offsetY] = frame.canvasOffset ?? [0, 0];
    const center = this.getEyeCenter(side, cappedCols);
    const startCol = Math.round(center.col - cappedCols / 2 + offsetX);
    const startRow = Math.round(center.row - cappedRows / 2 + offsetY);
    const regionStart = side === "left" ? 0 : halfScreenCols;
    const regionEnd = side === "left" ? halfScreenCols - 1 : GRID_COLS - 1;

    for (let localRow = 0; localRow < cappedRows; localRow++) {
      const screenRow = startRow + localRow;
      if (screenRow < 0 || screenRow >= GRID_ROWS) continue;

      for (let localCol = 0; localCol < cappedCols; localCol++) {
        const opacity = frame.map[localRow]?.[localCol] ?? 0;
        if (opacity <= 0) continue;

        const screenCol = startCol + localCol;
        if (screenCol < regionStart || screenCol > regionEnd) continue;

        const index = getBufferIndex(screenRow, screenCol);
        targetBuffer[index] = Math.max(targetBuffer[index], opacity);
        this.activeCells.add(index);
        if (frame.pulse !== false) {
          this.pulsableCells.add(index);
        }
      }
    }
  }

  private getEyeCenter(side: EyeSide, frameCols: number): EyeCenter {
    const regionStart = side === "left" ? 0 : halfScreenCols;
    const regionEndExclusive = side === "left" ? halfScreenCols : GRID_COLS;
    const regionCenter = regionStart + halfScreenCols / 2;
    const horizontalTravel = Math.max(0, halfScreenCols - frameCols);
    const centerShift = Math.round((this.lookOffset * horizontalTravel) / 2);
    const minCenter = regionStart + frameCols / 2;
    const maxCenter = regionEndExclusive - frameCols / 2;

    return {
      col: clamp(regionCenter + centerShift, minCenter, maxCenter),
      row: Math.floor(GRID_ROWS / 2),
    };
  }

  private flushBuffer({ force = false } = {}) {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const index = getBufferIndex(row, col);
        const opacity = this.displayBuffer[index];

        if (!force && opacity === this.previousBuffer[index]) continue;

        const pixel = this.grid[row]?.[col];
        if (pixel) {
          pixel.style.opacity = String(opacity);
          pixel.setAttribute("opacity", String(opacity));
        }

        this.previousBuffer[index] = opacity;
      }
    }
  }

  private setupVisibilityObserver() {
    if (!("IntersectionObserver" in window)) return;

    // Browser API: IntersectionObserver notifies us when the face enters or
    // leaves the viewport, so animation work can pause while offscreen.
    this.observer = new IntersectionObserver(([entry]) => {
      this.isVisible = Boolean(entry?.isIntersecting);

      if (
        this.isVisible &&
        this.dataset.animate !== "false" &&
        !this.reducedMotion
      ) {
        this.startAnimationLoop();
      } else {
        cancelAnimationFrame(this.animationFrame);
      }
    });

    this.observer.observe(this);
  }

  private scheduleBlink() {
    window.clearTimeout(this.blinkTimer);

    const delay = blinkMinDelay + Math.random() * (blinkMaxDelay - blinkMinDelay);
    this.blinkTimer = window.setTimeout(() => {
      this.blink();
      this.scheduleBlink();
    }, delay);
  }

  private blink() {
    if (this.reducedMotion) return;

    cancelAnimationFrame(this.animationFrame);
    this.clearBlinkSequence();
    const returnExpression = this.currentExpression;

    this.startTransitionToPreset(
      eyeFramePresets.blink,
      { duration: 75, easing: "easeInCubic", mode: "sdf", feather: 1.0 },
      () => {
        this.blinkOpenTimer = window.setTimeout(() => {
          this.startTransitionToPreset(
            eyeFramePresets.surprised,
            { duration: 100, easing: "easeOutCubic", mode: "sdf", feather: 1.25 },
            () => {
              this.blinkRestoreTimer = window.setTimeout(() => {
                this.startTransitionToPreset(
                  eyeFramePresets[returnExpression],
                  { duration: 140, easing: "easeOutCubic", mode: "sdf", feather: 1.25 },
                  () => {
                    this.restartAnimationLoopIfAnimated();
                  },
                );
              }, 50);
            },
          );
        }, 35);
      },
    );
  }

  private startAnimationLoop() {
    cancelAnimationFrame(this.animationFrame);
    if (!this.isVisible) return;
    this.animationFrame = requestAnimationFrame(this.renderFrame);
  }

  private renderFrame = (timestamp: number) => {
    if (!this.isVisible) return;

    if (this.transition) {
      this.renderTransitionFrame(timestamp);
    } else {
      this.renderIdlePulseFrame(timestamp);
    }

    this.animationFrame = requestAnimationFrame(this.renderFrame);
  };

  private renderIdlePulseFrame(timestamp: number) {
    this.displayBuffer.set(this.baseBuffer);

    for (const index of this.activeCells) {
      const baseOpacity = this.baseBuffer[index];

      if (this.pulseGloballyEnabled && this.pulsableCells.has(index)) {
        const row = Math.floor(index / GRID_COLS);
        const col = index % GRID_COLS;
        const phase = row * 0.55 + col * 0.22;
        const pulse = Math.sin(timestamp * 0.0022 + phase) * 0.08;

        this.displayBuffer[index] = clampOpacity(
          Math.max(minimumVisibleOpacity, baseOpacity + pulse),
        );
      } else {
        this.displayBuffer[index] = Math.max(minimumVisibleOpacity, baseOpacity);
      }
    }

    this.flushBuffer();
  }

  private computeSdfFromBuffer(
    source: Float32Array,
    out: Float32Array,
    threshold: number,
  ) {
    const insideMask = new Uint8Array(bufferLength);
    let hasInside = false;

    for (let i = 0; i < bufferLength; i++) {
      if (source[i] >= threshold) {
        insideMask[i] = 1;
        hasInside = true;
      }
    }

    if (!hasInside) {
      const safeDistance = Math.sqrt(GRID_ROWS * GRID_ROWS + GRID_COLS * GRID_COLS);
      out.fill(safeDistance);
      return;
    }

    let allInside = true;
    for (let i = 0; i < bufferLength; i++) {
      if (insideMask[i] === 0) {
        allInside = false;
        break;
      }
    }

    if (allInside) {
      const safeDistance = Math.sqrt(GRID_ROWS * GRID_ROWS + GRID_COLS * GRID_COLS);
      out.fill(-safeDistance);
      return;
    }

    const boundaryIndices: number[] = [];
    const neighborOffsets = [
      -GRID_COLS - 1, -GRID_COLS, -GRID_COLS + 1,
      -1, 1,
      GRID_COLS - 1, GRID_COLS, GRID_COLS + 1,
    ];

    for (let i = 0; i < bufferLength; i++) {
      const row = getRow(i);
      const col = getCol(i);
      const isInside = insideMask[i] === 1;

      for (const offset of neighborOffsets) {
        const ni = i + offset;
        if (ni < 0 || ni >= bufferLength) continue;

        const nRow = getRow(ni);
        const nCol = getCol(ni);
        if (Math.abs(nRow - row) > 1 || Math.abs(nCol - col) > 1) continue;

        if (insideMask[ni] !== (isInside ? 1 : 0)) {
          boundaryIndices.push(i);
          break;
        }
      }
    }

    if (boundaryIndices.length === 0) {
      const safeDistance = Math.sqrt(GRID_ROWS * GRID_ROWS + GRID_COLS * GRID_COLS);
      for (let i = 0; i < bufferLength; i++) {
        out[i] = insideMask[i] === 1 ? -safeDistance : safeDistance;
      }
      return;
    }

    for (let i = 0; i < bufferLength; i++) {
      let minSqDist = Infinity;
      for (let b = 0; b < boundaryIndices.length; b++) {
        const sqDist = squaredGridDistance(i, boundaryIndices[b]);
        if (sqDist < minSqDist) minSqDist = sqDist;
      }
      const distance = Math.sqrt(minSqDist);
      out[i] = insideMask[i] === 1 ? -distance : distance;
    }
  }

  private morphSdfBuffer(
    out: Float32Array,
    fromSdf: Float32Array,
    toSdf: Float32Array,
    t: number,
    feather: number,
  ) {
    for (let i = 0; i < bufferLength; i++) {
      const interpolated = fromSdf[i] + (toSdf[i] - fromSdf[i]) * t;
      out[i] = distanceToOpacity(interpolated, feather);
    }
  }

  private lerpBuffer(
    out: Float32Array,
    from: Float32Array,
    to: Float32Array,
    t: number,
  ) {
    for (let i = 0; i < bufferLength; i++) {
      out[i] = from[i] + (to[i] - from[i]) * t;
    }
  }

  private startTransitionToPreset(
    preset: EyeExpressionPreset,
    options?: EyeTransitionOptions,
    onComplete?: () => void,
  ) {
    if (this.reducedMotion) {
      this.composePreset(preset, this.displayBuffer);
      this.baseBuffer.set(this.displayBuffer);
      this.flushBuffer({ force: true });
      onComplete?.();
      return;
    }

    cancelAnimationFrame(this.animationFrame);

    this.transitionFromBuffer.set(this.displayBuffer);
    this.composePreset(preset, this.transitionToBuffer);

    const resolvedOptions = {
      ...defaultTransitionOptions,
      ...options,
    };

    const mode = resolvedOptions.mode;
    if (mode === "sdf") {
      this.computeSdfFromBuffer(
        this.transitionFromBuffer,
        this.transitionFromSdf,
        resolvedOptions.threshold,
      );
      this.computeSdfFromBuffer(
        this.transitionToBuffer,
        this.transitionToSdf,
        resolvedOptions.threshold,
      );
    }

    this.transition = {
      startedAt: performance.now(),
      duration: resolvedOptions.duration,
      easing: resolveEasing(resolvedOptions.easing),
      steps: resolvedOptions.steps,
      mode,
      feather: resolvedOptions.feather,
      threshold: resolvedOptions.threshold,
      onComplete,
    };

    this.startAnimationLoop();
  }

  private renderTransitionFrame(timestamp: number) {
    const transition = this.transition;
    if (!transition) return;

    const rawProgress =
      transition.duration <= 0
        ? 1
        : (timestamp - transition.startedAt) / transition.duration;

    const clampedProgress = clamp(rawProgress, 0, 1);
    const easedProgress = transition.easing(clampedProgress);
    const steppedProgress = applySteps(easedProgress, transition.steps);
    const t = clamp(steppedProgress, 0, 1);

    if (transition.mode === "sdf") {
      this.morphSdfBuffer(
        this.displayBuffer,
        this.transitionFromSdf,
        this.transitionToSdf,
        t,
        transition.feather,
      );
    } else {
      this.lerpBuffer(
        this.displayBuffer,
        this.transitionFromBuffer,
        this.transitionToBuffer,
        t,
      );
    }

    this.flushBuffer();

    if (rawProgress >= 1) {
      this.completeTransition();
    }
  }

  private completeTransition() {
    this.displayBuffer.set(this.transitionToBuffer);
    this.baseBuffer.set(this.transitionToBuffer);
    this.flushBuffer({ force: true });

    const onComplete = this.transition?.onComplete;
    this.transition = undefined;
    onComplete?.();
  }

  private clearBlinkSequence() {
    window.clearTimeout(this.blinkOpenTimer);
    window.clearTimeout(this.blinkRestoreTimer);
    this.blinkOpenTimer = 0;
    this.blinkRestoreTimer = 0;
    if (this.transition) {
      cancelAnimationFrame(this.animationFrame);
      this.transition = undefined;
    }
  }

  private restartAnimationLoopIfAnimated() {
    if (this.dataset.animate !== "false" && !this.reducedMotion) {
      this.startAnimationLoop();
    }
  }
}

// Browser Custom Elements registry: this binds the HTML tag name to the class.
if (!customElements.get("critter-face-controller")) {
  customElements.define("critter-face-controller", CritterFaceController);
}

// TypeScript DOM typing only: lets querySelector/createElement know that
// "critter-face-controller" returns a CritterFaceController instance.
declare global {
  interface HTMLElementTagNameMap {
    "critter-face-controller": CritterFaceController;
  }
}

export {};
