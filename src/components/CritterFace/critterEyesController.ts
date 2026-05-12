import type { EyeExpression, EyeExpressionPreset, EyeFrame, EyeSide } from "./types";
import { GRID_COLS, GRID_ROWS } from "./types";
import { eyeFramePresets } from "./pixelEyePresets";

const minimumVisibleOpacity = 0.06;
const blinkMinDelay = 2600;
const blinkMaxDelay = 6200;
const bufferLength = GRID_ROWS * GRID_COLS;
const halfScreenCols = GRID_COLS / 2;

interface EyeCenter {
  col: number;
  row: number;
}

interface EyeFrameSize {
  cols: number;
  rows: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampOpacity(value: number) {
  return clamp(value, 0, 1);
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

class CritterFaceController extends HTMLElement {
  private grid: (SVGRectElement | null)[][] = [];
  private displayBuffer = new Float32Array(bufferLength);
  private previousBuffer = new Float32Array(bufferLength);
  private baseBuffer = new Float32Array(bufferLength);
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
      this.startIdlePulse();
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

  // Public method for app code to switch the face expression manually.
  setExpression(expression: EyeExpression) {
    if (expression === "blink") {
      this.blink();
      return;
    }

    this.clearBlinkSequence();
    this.currentExpression = expression;
    this.applyExpression(expression);
    this.restartPulseIfAnimated();
  }

  // Public method for app code to move both eyes horizontally.
  // `offset` is clamped to -1..1 by the controller.
  setLookOffset(offset: number) {
    this.lookOffset = clamp(offset, -1, 1);
    this.applyExpression(this.currentExpression);
  }

  // Public method for app code to set a custom expression preset at runtime.
  setCustomPreset(preset: EyeExpressionPreset) {
    this.clearBlinkSequence();
    this.composePreset(preset, this.displayBuffer);
    this.baseBuffer.set(this.displayBuffer);
    this.flushBuffer({ force: true });
    this.restartPulseIfAnimated();
  }

  setPulseEnabled(enabled: boolean) {
    this.pulseGloballyEnabled = enabled;
    if (enabled) {
      this.restartPulseIfAnimated();
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
        this.startIdlePulse();
      } else {
        cancelAnimationFrame(this.animationFrame);
      }
    });

    this.observer.observe(this);
  }

  private startIdlePulse() {
    cancelAnimationFrame(this.animationFrame);

    const animate = (timestamp: number) => {
      if (!this.isVisible) return;

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
      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
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

    this.applyExpression("blink");

    this.blinkOpenTimer = window.setTimeout(() => {
      this.applyExpression("surprised");

      this.blinkRestoreTimer = window.setTimeout(() => {
        this.applyExpression(returnExpression);
        this.restartPulseIfAnimated();
      }, 500);
    }, 150);
  }

  private clearBlinkSequence() {
    window.clearTimeout(this.blinkOpenTimer);
    window.clearTimeout(this.blinkRestoreTimer);
    this.blinkOpenTimer = 0;
    this.blinkRestoreTimer = 0;
  }

  private restartPulseIfAnimated() {
    if (this.dataset.animate !== "false" && !this.reducedMotion) {
      this.startIdlePulse();
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
