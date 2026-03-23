/**
 * Shared types for wireframe screen drawing functions.
 * Each screen exports a single `draw` function that takes a canvas context
 * and a progress value (0-1) for the draw-in animation.
 */

export interface ScreenDrawParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** 0-1 progress for draw-in animation. 1 = fully drawn. */
  progress: number;
}

export type ScreenDrawFn = (params: ScreenDrawParams) => void;
