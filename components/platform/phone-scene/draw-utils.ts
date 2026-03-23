/**
 * Canvas 2D drawing utilities for wireframe screens.
 * Every function draws with a progress parameter (0-1) for draw-in animation.
 */

import { COLORS, LAYOUT } from './constants';

/** Draw a rounded rectangle outline */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  strokeColor: string,
  fillColor?: string,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();
}

/** Draw a horizontal content line (text placeholder) */
export function drawContentLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  weight: 'title' | 'body' | 'caption',
  progress = 1,
) {
  if (progress <= 0) return;
  const colorMap = {
    title: COLORS.titleLine,
    body: COLORS.bodyLine,
    caption: COLORS.captionLine,
  };
  const thicknessMap = { title: 4, body: 2.5, caption: 1.5 }; // Boosted for 3D texture

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.strokeStyle = colorMap[weight];
  ctx.lineWidth = thicknessMap[weight];
  ctx.beginPath();
  // Line draws from left to right based on progress
  ctx.moveTo(x, y);
  ctx.lineTo(x + width * Math.min(progress * 1.5, 1), y);
  ctx.stroke();
  ctx.restore();
}

/** Draw a colored left border on a card (kanban/schedule stage indicator) */
export function drawColoredLeftBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  color: string,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, LAYOUT.coloredBorderWidth, height * progress);
  ctx.restore();
}

/** Draw a circle (for icons, avatars, dots) */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  strokeColor: string,
  fillColor?: string,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();
}

/** Draw a project pin — matches iOS ProjectAnnotationRenderer exactly.
 *  Structure: solid center dot (task type color) + 2pt stroke ring (status color) with 2pt gap.
 *  iOS dims: dot 12pt, ring 20pt total → at canvas 2x scale: dot 24px, ring 40px.
 *  @param dotColor  Task type color (center fill — inner circle)
 *  @param ringColor Pipeline status color (ring stroke — outer circle), defaults to dotColor */
export function drawMapPin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dotColor: string,
  ringColor?: string,
  progress = 1,
) {
  if (progress <= 0) return;
  const ring = ringColor ?? dotColor;

  // iOS: dot diameter 12pt → 24px at 2x scale → radius 12
  const dotR = 12;
  // iOS: ring total diameter 20pt → 40px → radius 20, stroke 2pt → 4px
  const ringR = 20;
  const ringStroke = 4;

  ctx.save();
  ctx.globalAlpha = progress;

  // Ring — full opacity
  ctx.beginPath();
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = ring;
  ctx.lineWidth = ringStroke;
  ctx.stroke();

  // Center dot — solid fill, full opacity
  ctx.beginPath();
  ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();

  ctx.restore();
}

/** Draw a chevron (>) for list items */
export function drawChevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress * 0.4; // Chevrons are subtle
  ctx.strokeStyle = COLORS.bodyLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - size / 2);
  ctx.lineTo(x + size / 2, y);
  ctx.lineTo(x, y + size / 2);
  ctx.stroke();
  ctx.restore();
}

/** Draw a progress bar with colored segments */
export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  totalWidth: number,
  segments: { color: string; fraction: number }[],
  progress = 1,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  let offsetX = x;
  for (const seg of segments) {
    const segWidth = totalWidth * seg.fraction;
    ctx.fillStyle = seg.color;
    ctx.fillRect(offsetX, y, segWidth * progress, 3);
    offsetX += segWidth + 4; // 4px gap between segments
  }
  ctx.restore();
}

/** Draw tab bar with 4 icons and active indicator */
export function drawTabBar(
  ctx: CanvasRenderingContext2D,
  activeIndex: number,
  canvasWidth: number,
  tabBarY: number,
  progress = 1,
  hoverOpacities: number[] = [0, 0, 0, 0],
) {
  if (progress <= 0) return;
  const tabWidth = canvasWidth / 4;
  const iconY = tabBarY + 55;

  ctx.save();
  ctx.globalAlpha = progress;

  // Frosted glass background — taller than icon area, bleeds off bottom edge
  // Start 20px above tabBarY for extra height; extend 200px past canvas bottom
  const tabBgTop = tabBarY - 20;
  const tabBgBottom = tabBarY + 400; // Well past canvas height (1540), guarantees bleed
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, tabBgTop, canvasWidth, tabBgBottom - tabBgTop);
  ctx.clip();
  ctx.filter = 'blur(32px)';
  // Draw the full canvas into itself within the clip — use raw pixel dims for src
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(10, 10, 10, 0.50)';
  ctx.fillRect(0, tabBgTop, canvasWidth, tabBgBottom - tabBgTop);
  ctx.restore();

  // Top border of tab bar
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.beginPath();
  ctx.moveTo(0, tabBgTop);
  ctx.lineTo(canvasWidth, tabBgTop);
  ctx.stroke();

  for (let i = 0; i < 4; i++) {
    const cx = tabWidth * i + tabWidth / 2;
    const isActive = i === activeIndex;
    const hoverAlpha = isActive ? 0 : (hoverOpacities[i] || 0);

    // Hover highlight — animated rounded rect background behind icon
    if (hoverAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.08 * hoverAlpha).toFixed(3)})`;
      const hW = tabWidth * 0.7, hH = 70, hR = 12;
      ctx.beginPath();
      ctx.roundRect(cx - hW / 2, iconY - hH / 2, hW, hH, hR);
      ctx.fill();
      ctx.restore();
    }

    // Active indicator line above icon
    if (isActive) {
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 15, tabBarY + 15);
      ctx.lineTo(cx + 15, tabBarY + 15);
      ctx.stroke();
    }

    // Icon strokes — boosted line width for visibility
    ctx.strokeStyle = isActive ? COLORS.accent : COLORS.titleLine;
    ctx.lineWidth = 2;
    ctx.fillStyle = isActive ? COLORS.accent : COLORS.titleLine;

    drawTabIcon(ctx, i, cx, iconY);
  }

  ctx.restore();
}

/** Draw individual tab icons (simplified SF Symbol interpretations).
 *  Stroke color is set by the caller (drawTabBar) before invocation. */
function drawTabIcon(
  ctx: CanvasRenderingContext2D,
  index: number,
  cx: number,
  cy: number,
) {
  const s = 18; // Base icon half-size

  switch (index) {
    case 0: // Home — house outline
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);           // Roof peak
      ctx.lineTo(cx + s, cy - 2);       // Right eave
      ctx.lineTo(cx + s * 0.7, cy - 2); // Right wall top
      ctx.lineTo(cx + s * 0.7, cy + s); // Right wall bottom
      ctx.lineTo(cx - s * 0.7, cy + s); // Left wall bottom
      ctx.lineTo(cx - s * 0.7, cy - 2); // Left wall top
      ctx.lineTo(cx - s, cy - 2);       // Left eave
      ctx.closePath();
      ctx.stroke();
      break;

    case 1: // Job Board — briefcase outline
      // Main body
      ctx.strokeRect(cx - s, cy - s * 0.5, s * 2, s * 1.5);
      // Handle
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.4, cy - s * 0.5);
      ctx.lineTo(cx - s * 0.4, cy - s * 0.9);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.9);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.5);
      ctx.stroke();
      break;

    case 2: // Schedule — calendar outline (matches iOS calendar.badge SF Symbol)
      {
        const calW = s * 2;
        const calH = s * 2;
        const calX = cx - s;
        const calY = cy - s + 3;

        // Calendar body with rounded corners
        ctx.beginPath();
        ctx.roundRect(calX, calY, calW, calH - 2, 3);
        ctx.stroke();

        // Header bar line (separates month header from date grid)
        ctx.beginPath();
        ctx.moveTo(calX, calY + calH * 0.3);
        ctx.lineTo(calX + calW, calY + calH * 0.3);
        ctx.stroke();

        // Two pins sticking up from top edge
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(calX + calW * 0.3, calY - 3);
        ctx.lineTo(calX + calW * 0.3, calY + 4);
        ctx.moveTo(calX + calW * 0.7, calY - 3);
        ctx.lineTo(calX + calW * 0.7, calY + 4);
        ctx.stroke();
        ctx.lineWidth = 1.5;

        // Small grid dots in the date area (3×2 grid)
        const gridStartX = calX + calW * 0.2;
        const gridStartY = calY + calH * 0.42;
        const gridSpaceX = calW * 0.3;
        const gridSpaceY = (calH * 0.5) / 2;
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3; c++) {
            ctx.beginPath();
            ctx.arc(gridStartX + c * gridSpaceX, gridStartY + r * gridSpaceY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      break;

    case 3: // Settings — 5-tooth gear, each tooth a perfect rectangle
      {
        const teeth = 6;
        const innerR = s * 0.48;   // Valley radius (base of teeth)
        const outerR = s * 0.88;   // Tooth tip radius
        const halfW = s * 0.20;    // Half-width of each tooth (canvas units, not angular)
        const step = (Math.PI * 2) / teeth;

        // Each tooth is a true rectangle built from radial + tangent unit vectors.
        // Sides are parallel, top is perpendicular to sides — all corners 90°.
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
          const mid = step * i - Math.PI / 2;
          // Radial unit vector (points outward from center)
          const rx = Math.cos(mid), ry = Math.sin(mid);
          // Tangent unit vector (perpendicular to radial, 90° CCW)
          const tx = -Math.sin(mid), ty = Math.cos(mid);

          // 4 corners of the rectangular tooth
          const ilx = cx + rx * innerR - tx * halfW;
          const ily = cy + ry * innerR - ty * halfW;
          const olx = cx + rx * outerR - tx * halfW;
          const oly = cy + ry * outerR - ty * halfW;
          const orx = cx + rx * outerR + tx * halfW;
          const ory = cy + ry * outerR + ty * halfW;
          const irx = cx + rx * innerR + tx * halfW;
          const iry = cy + ry * innerR + ty * halfW;

          // Next tooth's inner-left corner (for valley floor line)
          const nMid = step * (i + 1) - Math.PI / 2;
          const nrx = Math.cos(nMid), nry = Math.sin(nMid);
          const ntx = -Math.sin(nMid), nty = Math.cos(nMid);
          const nilx = cx + nrx * innerR - ntx * halfW;
          const nily = cy + nry * innerR - nty * halfW;

          if (i === 0) ctx.moveTo(ilx, ily);
          ctx.lineTo(olx, oly); // Left side (radial — straight out)
          ctx.lineTo(orx, ory); // Top (tangential — perpendicular to sides)
          ctx.lineTo(irx, iry); // Right side (radial — straight in)
          ctx.lineTo(nilx, nily); // Valley floor (straight to next tooth)
        }
        ctx.closePath();
        ctx.stroke();

        // Center hole
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.22, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
  }
}

/** Calculate sub-phase progress for staggered draw-in animations.
 *  Returns 0 before `start`, 1 after `end`, linearly interpolated between. */
export function phase(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

// --- Dynamic Island dimensions (shared by status bar for alignment) ---
const ISLAND_W = 180;
const ISLAND_H = 48;
const ISLAND_Y = 16;
const ISLAND_CENTER_Y = ISLAND_Y + ISLAND_H / 2; // y = 40

/** Draw the iOS status bar — time, location arrow, cellular bars, wifi, battery.
 *  All icons ~half the island height (~24px). Vertically centered with island.
 *  Extra margin from screen edges for proper iOS inset. */
export function drawStatusBar(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  progress = 1,
) {
  if (progress <= 0) return;
  const SYS_FONT = '-apple-system, SF Pro Text, Helvetica Neue, sans-serif';
  const y = ISLAND_CENTER_Y + 4; // Nudged down to sit lower in status bar area
  const margin = LAYOUT.padding + 16; // Extra inset from screen edges
  const iconH = ISLAND_H / 2; // ~24px — target height for all icons

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.textBaseline = 'middle';

  // --- LEFT SIDE: Time + location arrow ---

  // Time — bold, sized to ~iconH
  ctx.font = `bold ${iconH + 4}px ${SYS_FONT}`;
  ctx.fillStyle = COLORS.titleLine;
  ctx.textAlign = 'left';
  ctx.fillText('1:29', margin, y);

  // Location services icon — iOS diagonal arrow, white, pointing upper-left
  const arrowX = margin + 86;
  const arrowS = 18; // Half-size — matches status bar icon scale
  ctx.save();
  ctx.translate(arrowX, y);
  ctx.scale(-1, 1); // Mirror on Y axis
  ctx.rotate(-Math.PI / 4); // Rotate 45°
  ctx.fillStyle = COLORS.titleLine; // White
  ctx.strokeStyle = COLORS.titleLine;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -arrowS);                  // Top point
  ctx.lineTo(arrowS * 0.55, arrowS * 0.4); // Right wing
  ctx.lineTo(0, arrowS * 0.05);            // Notch center
  ctx.lineTo(-arrowS * 0.55, arrowS * 0.4);// Left wing
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- RIGHT SIDE: cellular bars, wifi, battery ---
  // Matches reference: clean solid white iOS icons (signal, wifi, battery)
  const rightEdge = canvasWidth - margin;
  const iconGap = 14;

  // ── Battery icon ──
  // Wider proportions, visible gap between outline and fill, smooth nub
  const batShellW = 42;
  const batShellH = 20;
  const batShellX = rightEdge - batShellW - 6; // Room for nub
  const batShellY = y - batShellH / 2;
  const batCorner = 5;
  const batStroke = 2.4;

  // Nub (positive terminal) — smooth rounded bullet on right side
  const nubW = 5;
  const nubH = 8;
  const nubX = batShellX + batShellW + 0.5;
  const nubY = y - nubH / 2;
  ctx.fillStyle = COLORS.titleLine;
  ctx.beginPath();
  ctx.roundRect(nubX, nubY, nubW, nubH, [0, nubW / 2, nubW / 2, 0]);
  ctx.fill();

  // Shell outline
  ctx.strokeStyle = COLORS.titleLine;
  ctx.lineWidth = batStroke;
  ctx.beginPath();
  ctx.roundRect(batShellX, batShellY, batShellW, batShellH, batCorner);
  ctx.stroke();

  // Inner fill — inset enough to show dark gap on all sides
  const fillInset = 4.5;
  ctx.fillStyle = COLORS.titleLine;
  ctx.beginPath();
  ctx.roundRect(
    batShellX + fillInset,
    batShellY + fillInset,
    batShellW - fillInset * 2,
    batShellH - fillInset * 2,
    2,
  );
  ctx.fill();

  // ── WiFi icon ──
  // Pie-slice fan: bottom tapers to a point, 3 filled arc bands (no outer ring)
  // Use consistent gap: center offset = wifiOuterR + gap, so visual edges are equidistant
  const wifiGap = 12; // Visual gap between icon group edges
  const wifiOuterR = 26; // Outer band radius — used to compute visual extent
  const wifiCenterX = batShellX - wifiGap - Math.round(wifiOuterR * Math.sin(0.72));
  const wifiBaseY = y + iconH * 0.32;

  ctx.fillStyle = COLORS.titleLine;

  const sweep = 0.72; // Half-angle each side of vertical (~41°)
  // 3 elements: pie wedge (point) + 2 arc bands
  const bands = [
    { innerR: 0, outerR: 8 },    // Pie wedge — tapers to point
    { innerR: 10, outerR: 17 },  // Inner band
    { innerR: 19, outerR: 26 },  // Outer band
  ];

  for (const band of bands) {
    ctx.beginPath();
    if (band.innerR === 0) {
      ctx.moveTo(wifiCenterX, wifiBaseY);
      ctx.arc(wifiCenterX, wifiBaseY, band.outerR, -Math.PI / 2 - sweep, -Math.PI / 2 + sweep);
      ctx.closePath();
    } else {
      ctx.arc(wifiCenterX, wifiBaseY, band.outerR, -Math.PI / 2 - sweep, -Math.PI / 2 + sweep);
      ctx.arc(wifiCenterX, wifiBaseY, band.innerR, -Math.PI / 2 + sweep, -Math.PI / 2 - sweep, true);
      ctx.closePath();
    }
    ctx.fill();
  }

  // ── Cellular signal bars ──
  // 4 chunky ascending bars, bottom-aligned, pill-like rounding
  const barW = 7;
  const barGap = 3;
  const barsGroupW = 4 * barW + 3 * barGap;
  const barsStartX = wifiCenterX - Math.round(wifiOuterR * Math.sin(0.72)) - wifiGap - barsGroupW;
  const barBottom = y + iconH / 2;
  const barHeights = [0.28, 0.48, 0.72, 1.0];
  ctx.fillStyle = COLORS.titleLine;
  for (let i = 0; i < 4; i++) {
    const bh = iconH * barHeights[i];
    const bx = barsStartX + i * (barW + barGap);
    const by = barBottom - bh;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, bh, 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Draw the Dynamic Island pill at the top center of the canvas.
 *  Corner radius = half height for a perfect pill shape. */
export function drawDynamicIsland(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  progress = 1,
) {
  if (progress <= 0) return;
  const x = (canvasWidth - ISLAND_W) / 2;
  const r = ISLAND_H / 2; // Perfect pill: radius = half height

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.roundRect(x, ISLAND_Y, ISLAND_W, ISLAND_H, r);
  ctx.fillStyle = '#1A1A1A';
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();
}

/** Draw the floating action button (lightning bolt) — static across all tabs.
 *  Positioned bottom-right, just above the tab bar. */
export function drawFAB(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  tabBarY: number,
  progress = 1,
) {
  if (progress <= 0) return;

  const radius = 62;
  const cx = canvasWidth - LAYOUT.padding - radius - 8;
  const cy = tabBarY - radius - 60; // Overlaps content like the real app

  ctx.save();
  ctx.globalAlpha = progress;

  // Frosted glass circle background
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.filter = 'blur(16px)';
  const fabCanvasW = ctx.canvas.width;
  const fabCanvasH = ctx.canvas.height;
  const fabLogicalH = fabCanvasH / (fabCanvasW / canvasWidth);
  ctx.drawImage(ctx.canvas, 0, 0, fabCanvasW, fabCanvasH,
    0, 0, canvasWidth, fabLogicalH);
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();

  // Border ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Lightning bolt — scaled up for larger button
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 3, cy - 28);    // Top
  ctx.lineTo(cx - 13, cy + 3);    // Left mid
  ctx.lineTo(cx + 3, cy + 3);     // Center
  ctx.lineTo(cx - 3, cy + 28);    // Bottom
  ctx.lineTo(cx + 13, cy - 3);    // Right mid
  ctx.lineTo(cx - 3, cy - 3);     // Center
  ctx.closePath();
  ctx.stroke();

  // Notification badge — gold circle with count
  const badgeR = 18;
  const badgeX = cx + radius * 0.62;
  const badgeY = cy - radius * 0.62;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.stageInProgress; // Gold
  ctx.fill();

  // Badge count
  ctx.fillStyle = '#0A0A0A';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('16', badgeX, badgeY + 1);

  ctx.restore();
}

/** Clear the entire canvas with background color */
export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, w, h);
}
