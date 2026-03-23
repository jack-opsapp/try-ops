/**
 * ScreenRenderer — Canvas 2D orchestrator for wireframe screens.
 *
 * Manages an offscreen <canvas>, draws the active screen with animated
 * draw-in transitions, and provides the canvas as a texture source for R3F.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, TIMING, DEFAULT_TAB, TABS, LAYOUT } from './constants';
import { drawTabBar, drawStatusBar, drawFAB, clearCanvas } from './draw-utils';
import { drawHomeScreen } from './screens/home-screen';
import { drawJobBoardScreen } from './screens/jobboard-screen';
import { drawScheduleScreen } from './screens/schedule-screen';
import { drawSettingsScreen } from './screens/settings-screen';
import type { TabId } from './constants';
import type { ScreenDrawFn } from './screens/types';

const SCREEN_DRAW_MAP: Record<TabId, ScreenDrawFn> = {
  home: drawHomeScreen,
  jobboard: drawJobBoardScreen,
  schedule: drawScheduleScreen,
  settings: drawSettingsScreen,
};

export class ScreenRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private activeTab: TabId = DEFAULT_TAB;
  private animationProgress = 0; // 0 = nothing drawn, 1 = fully drawn
  private animationStartTime = 0;
  private isAnimating = false;
  private isFadingOut = false;
  private fadeProgress = 1; // 1 = fully visible, 0 = faded out
  private pendingTab: TabId | null = null;
  private rafId: number | null = null;
  private onFrameCallback: (() => void) | null = null;
  private paused = false;
  private hoveredTabIndex = -1;
  private hoverOpacities = [0, 0, 0, 0]; // Per-tab hover opacity (0-1), animated

  constructor() {
    // 2x DPR for sharp rendering when mapped to the 3D screen texture.
    // Drawing code still uses CANVAS_WIDTH/HEIGHT as logical coords;
    // ctx.scale(DPR, DPR) handles the upscaling transparently.
    const DPR = 2;
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH * DPR;
    this.canvas.height = CANVAS_HEIGHT * DPR;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    ctx.scale(DPR, DPR);
    this.ctx = ctx;

    // Canvas starts blank. PhoneInteraction calls drawStatic() or
    // startInitialDraw() after registering onFrame, so the texture
    // update propagates correctly through Three.js.
  }

  /** Get the canvas element (for use as CanvasTexture source) */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /** Get current active tab */
  getActiveTab(): TabId {
    return this.activeTab;
  }

  /** Set which tab icon is being hovered (-1 = none). Animates opacity. */
  setHoveredTab(index: number) {
    if (this.hoveredTabIndex === index) return;
    this.hoveredTabIndex = index;
    // Kick off animation loop if not already running
    if (!this.isAnimating && !this.rafId) {
      this.isAnimating = true;
      this.animate();
    }
  }

  /** Set a callback to fire every animation frame (for texture.needsUpdate) */
  onFrame(callback: () => void) {
    this.onFrameCallback = callback;
  }

  /** Start the initial draw-in animation for the default tab */
  startInitialDraw() {
    this.animationProgress = 0;
    this.fadeProgress = 1;
    this.isAnimating = true;
    this.animationStartTime = performance.now();
    this.animate();
  }

  /** Switch to a different tab with fade-out → draw-in transition.
   *  Rapid taps update the pending target instead of being dropped. */
  switchTab(newTab: TabId) {
    if (newTab === this.activeTab && !this.isFadingOut) return;

    if (this.isFadingOut) {
      // Mid-transition: update target — the fade will resolve to the latest tap
      this.pendingTab = newTab;
      return;
    }

    this.pendingTab = newTab;
    this.isFadingOut = true;
    this.animationStartTime = performance.now();
    this.isAnimating = true;

    if (!this.rafId) {
      this.animate();
    }
  }

  /** Pause/resume the RAF loop (e.g. when scrolled off-screen). */
  setPaused(paused: boolean) {
    if (this.paused === paused) return;
    this.paused = paused;

    if (paused && this.rafId) {
      // Cancel running RAF to stop wasting cycles off-screen
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    } else if (!paused && this.isAnimating && !this.rafId) {
      // Resume: restart the RAF loop from where we left off
      this.animationStartTime = performance.now();
      this.animate();
    }
  }

  /** Main animation loop */
  private animate = () => {
    // If paused (off-screen), stop scheduling frames
    if (this.paused) {
      this.rafId = null;
      return;
    }

    const now = performance.now();
    const elapsed = now - this.animationStartTime;

    if (this.isFadingOut) {
      // Fade out current screen
      this.fadeProgress = Math.max(0, 1 - elapsed / TIMING.fadeOutDuration);

      if (this.fadeProgress <= 0) {
        // Fade complete — switch to new tab and start draw-in
        this.isFadingOut = false;
        if (this.pendingTab) {
          this.activeTab = this.pendingTab;
          this.pendingTab = null;
        }
        this.animationProgress = 0;
        this.fadeProgress = 1;
        this.animationStartTime = performance.now();
      }
    } else if (this.animationProgress < 1) {
      // Draw-in animation
      const rawProgress = elapsed / TIMING.drawInDuration;
      this.animationProgress = Math.min(1, TIMING.easeOut(rawProgress));
    }

    // Render current frame
    this.renderFrame();

    // Continue or stop — also keep running while hover opacities are transitioning
    const hoverTransitioning = this.hoverOpacities.some((o, i) => {
      const target = i === this.hoveredTabIndex ? 1 : 0;
      return Math.abs(o - target) > 0.01;
    });
    if (this.isFadingOut || this.animationProgress < 1 || hoverTransitioning) {
      this.rafId = requestAnimationFrame(this.animate);
    } else {
      this.isAnimating = false;
      this.rafId = null;
      // One final render to ensure crisp final state
      this.renderFrame();
    }
  };

  /** Render a single frame of the current screen + tab bar */
  private renderFrame() {
    const { ctx } = this;
    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;

    clearCanvas(ctx, w, h);

    ctx.save();
    ctx.globalAlpha = this.fadeProgress;

    // Draw active screen (may include full-bleed background like the map)
    const drawFn = SCREEN_DRAW_MAP[this.activeTab];
    drawFn({ ctx, width: w, height: h, progress: this.animationProgress });

    // Animate hover opacities (lerp toward target)
    const lerpSpeed = 0.18;
    let hoverAnimating = false;
    for (let i = 0; i < 4; i++) {
      const target = i === this.hoveredTabIndex ? 1 : 0;
      const diff = target - this.hoverOpacities[i];
      if (Math.abs(diff) > 0.01) {
        this.hoverOpacities[i] += diff * lerpSpeed;
        hoverAnimating = true;
      } else {
        this.hoverOpacities[i] = target;
      }
    }
    // Keep animation loop alive while hover is transitioning
    if (hoverAnimating && !this.isAnimating) {
      this.isAnimating = true;
      if (!this.rafId) this.animate();
    }

    // Draw tab bar (always drawn with the screen's progress)
    const activeIndex = TABS.findIndex((t) => t.id === this.activeTab);
    drawTabBar(ctx, activeIndex, w, LAYOUT.tabBarY, this.animationProgress, this.hoverOpacities);

    ctx.restore();

    // Static chrome — status bar drawn AFTER screen content so full-bleed
    // backgrounds (like the home map) don't cover it
    drawStatusBar(ctx, w, this.animationProgress);

    // Static overlays — drawn outside the fade alpha so they persist across tab transitions
    // FAB is NOT shown on the settings tab (matches real iOS app behavior)
    if (this.activeTab !== 'settings') {
      drawFAB(ctx, w, LAYOUT.tabBarY, this.animationProgress);
    }

    // Notify listener (for Three.js texture update)
    this.onFrameCallback?.();
  }

  /** Switch tab with no draw-in animation (for reduced motion). */
  switchTabInstant(newTab: TabId) {
    if (newTab === this.activeTab) return;
    this.activeTab = newTab;
    this.animationProgress = 1;
    this.fadeProgress = 1;
    this.isFadingOut = false;
    this.pendingTab = null;
    this.isAnimating = false;
    this.renderFrame();
  }

  /** Draw a static frame at full progress (for fallback / no-animation mode) */
  drawStatic(tab?: TabId) {
    if (tab) this.activeTab = tab;
    this.animationProgress = 1;
    this.fadeProgress = 1;
    this.renderFrame();
  }

  /** Check if currently animating (for R3F frame loop demand) */
  isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  /** Clean up */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.onFrameCallback = null;
  }
}
