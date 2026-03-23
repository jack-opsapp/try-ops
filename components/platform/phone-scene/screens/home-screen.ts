/**
 * Home screen wireframe — Map view with project carousel.
 * Reference: ref-home.png (Home tab screenshot)
 * Data: Pete Mitchell / MAVERICK PROJECTS LTD
 *
 * iOS source files audited:
 *   AppHeader.swift         → greeting (Kosugi 22pt), avatar (44×44pt, 2pt white stroke)
 *   EventCarousel.swift     → TabView page carousel, 120pt height
 *   EventCardView.swift     → 362×100pt card, Mohave cardTitle/cardBody fonts
 *   MapFilterChips.swift    → smallCaption 12pt, 0.5pt tracking, 8pt spacing
 *   OPSMapContainer.swift   → Mapbox dark-mode map
 *
 * Scale: canvas 750px ≈ iPhone 393pt → ~2x multiplier used throughout
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawCircle,
  drawColoredLeftBorder,
  drawMapPin,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

// --- Fonts (loaded by next/font/google on the page) ---
const MOHAVE = 'Mohave, sans-serif';
const KOSUGI = 'Kosugi, sans-serif';

// --- Pete's avatar — loaded once at module level ---
let avatarImg: HTMLImageElement | null = null;
let avatarLoaded = false;
if (typeof window !== 'undefined') {
  avatarImg = new Image();
  avatarImg.crossOrigin = 'anonymous';
  avatarImg.src = '/dev/pete-avatar.jpg';
  avatarImg.onload = () => { avatarLoaded = true; };
}

// --- Mapbox OPS Dark tile — custom style matching iOS MapStyleApplicator DARK profile ---
// Style: jacksonsweet/cmmzd20uw000801ps0acq6xba (land #0A0A0A, water #101820, roads #333-#666)
// Center: -117.14, 32.90 (San Diego), zoom 11, 750×912 @2x
let mapImg: HTMLImageElement | null = null;
let mapLoaded = false;
if (typeof window !== 'undefined') {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  mapImg = new Image();
  mapImg.crossOrigin = 'anonymous';
  mapImg.src = token
    ? `https://api.mapbox.com/styles/v1/jacksonsweet/cmmzd20uw000801ps0acq6xba/static/-117.14,32.90,11,0/750x912@2x?access_token=${token}`
    : '/dev/mapbox-dark.png';
  mapImg.onload = () => { mapLoaded = true; };
}

// --- Helper: draw text ---
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  progress: number,
  align: CanvasTextAlign = 'left',
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// --- Helper: draw avatar with circular clip ---
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  progress: number,
) {
  if (progress <= 0) return;
  if (avatarLoaded && avatarImg) {
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();
    // White border ring — iOS: 2pt primaryText stroke → 4px at canvas scale
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.titleLine;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  } else {
    // Fallback circle
    drawCircle(ctx, cx, cy, radius, COLORS.titleLine, COLORS.cardFill, progress);
  }
}

// --- Helper: draw notification bell badge overlaid on avatar ---
function drawNotificationBell(
  ctx: CanvasRenderingContext2D,
  avatarCx: number,
  avatarCy: number,
  avatarRadius: number,
  progress: number,
) {
  if (progress <= 0) return;
  // Position: bottom-left of avatar — iOS offset: (-14pt, +14pt)
  const bx = avatarCx - avatarRadius * 0.55;
  const by = avatarCy + avatarRadius * 0.55;
  const bellR = 22; // iOS: 22×22pt circle → 22px at canvas scale

  ctx.save();
  ctx.globalAlpha = progress;

  // Black circle background
  ctx.beginPath();
  ctx.arc(bx, by, bellR, 0, Math.PI * 2);
  ctx.fillStyle = '#0A0A0A';
  ctx.fill();

  // Bell icon — proper iOS bell.fill shape, white
  ctx.fillStyle = COLORS.titleLine;
  ctx.strokeStyle = COLORS.titleLine;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Small knob at top
  ctx.beginPath();
  ctx.arc(bx, by - 12, 2, 0, Math.PI * 2);
  ctx.fill();

  // Bell dome — starts narrow at top, widens to a flared brim
  ctx.beginPath();
  ctx.moveTo(bx - 3, by - 10);                          // Top-left of dome
  ctx.bezierCurveTo(bx - 10, by - 8, bx - 10, by - 2, bx - 10, by + 1); // Left curve widens
  ctx.lineTo(bx - 12, by + 4);                          // Flare out to brim
  ctx.lineTo(bx + 12, by + 4);                          // Flat brim bottom
  ctx.lineTo(bx + 10, by + 1);                          // Flare in from right
  ctx.bezierCurveTo(bx + 10, by - 2, bx + 10, by - 8, bx + 3, by - 10); // Right curve narrows
  ctx.closePath();
  ctx.fill();

  // Clapper — small arc below the brim
  ctx.beginPath();
  ctx.arc(bx, by + 7, 3, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

// --- Helper: draw unread notification badge (top-right of avatar) ---
function drawUnreadBadge(
  ctx: CanvasRenderingContext2D,
  avatarCx: number,
  avatarCy: number,
  avatarRadius: number,
  count: number,
  progress: number,
) {
  if (progress <= 0 || count <= 0) return;
  // Position: top-right of avatar — iOS offset: (+14pt, -14pt)
  const bx = avatarCx + avatarRadius * 0.55;
  const by = avatarCy - avatarRadius * 0.55;
  const badgeR = 16;

  ctx.save();
  ctx.globalAlpha = progress;

  // Badge circle — primaryAccent fill
  ctx.beginPath();
  ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.accent;
  ctx.fill();

  // Count text — iOS: bold 10pt → 20px at 2x
  ctx.fillStyle = COLORS.titleLine;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(count > 99 ? '99' : count), bx, by + 1);

  ctx.restore();
}

export function drawHomeScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  // --- Structure phase ---
  const structP = phase(progress, TIMING.structurePhase[0], TIMING.structurePhase[1]);

  // ===== FULL-BLEED MAP BACKGROUND =====
  // The Mapbox tile covers the entire screen — all UI elements layer on top.
  // Scaled with "cover" behavior: uniform scale, centered, bleeds off edges.
  const mapAlpha = phase(progress, 0.15, 0.65);
  if (mapAlpha > 0 && mapLoaded && mapImg) {
    // Cover scaling — maintain aspect ratio, fill canvas, clip overflow
    const imgW = mapImg.naturalWidth;
    const imgH = mapImg.naturalHeight;
    const scaleX = width / imgW;
    const scaleY = height / imgH;
    const coverScale = Math.max(scaleX, scaleY);
    const drawW = imgW * coverScale;
    const drawH = imgH * coverScale;
    const offsetX = (width - drawW) / 2;
    const offsetY = (height - drawH) / 2;

    // Draw custom OPS Dark style tile — colors match iOS MapStyleApplicator DARK natively
    ctx.save();
    ctx.globalAlpha = mapAlpha;
    ctx.drawImage(mapImg, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  }

  // --- Top gradient: black → transparent over status bar + greeting area ---
  // Ensures status bar icons and greeting text read clearly over the map
  if (mapAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = mapAlpha;
    const gradH = 280; // Covers status bar + greeting + company line, fades before card
    const grad = ctx.createLinearGradient(0, 0, 0, gradH);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, gradH);
    ctx.restore();
  }

  // --- Content starts below status bar (extra padding from island) ---
  const headerY = 120;

  // ===== APP HEADER =====
  // iOS: AppHeader.swift (.home variant)
  // Layout: HStack { VStack(greeting, company) Spacer() avatarButton }

  // Avatar with photo (top right) — vertically centered with greeting + company text block
  // Text block: greeting at headerY+14, company at headerY+68 → center = headerY+41
  const avatarR = 52;
  const avatarCx = width - p - avatarR - 4;
  const avatarCy = headerY + 41;
  drawAvatar(ctx, avatarCx, avatarCy, avatarR, structP);

  // Notification bell badge — overlaid bottom-left of avatar (no count badge)
  drawNotificationBell(ctx, avatarCx, avatarCy, avatarR, structP);

  // Greeting — Kosugi-Regular 22pt → 44px at 2x
  // iOS: Font.subtitle = Kosugi-Regular 22pt, primaryText color, UPPERCASED
  drawText(ctx, 'GOOD AFTERNOON, PETE', p, headerY + 14, `44px ${KOSUGI}`, COLORS.titleLine, structP);

  // Company info row — Kosugi-Regular 14pt → 28px at 2x
  // iOS: Font.caption = Kosugi-Regular 14pt, secondaryText color, UPPERCASED
  const companyY = headerY + 68;
  drawText(ctx, 'MAVERICK PROJECTS LTD', p, companyY, `28px ${KOSUGI}`, COLORS.captionLine, structP);
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    // Measure company text to position dot dynamically
    ctx.font = `28px ${KOSUGI}`;
    const companyW = ctx.measureText('MAVERICK PROJECTS LTD').width;
    const dotX = p + companyW + 16;
    // Trial status dot — iOS: 6×6pt circle in primaryAccent color
    ctx.beginPath();
    ctx.arc(dotX, companyY, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.accent;
    ctx.fill();
    // Trial text — Kosugi-Regular 12pt → 24px at 2x
    // iOS: Font.smallCaption = Kosugi-Regular 12pt
    ctx.font = `24px ${KOSUGI}`;
    ctx.fillStyle = COLORS.accent;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('TRIAL ENDS Apr 10', dotX + 14, companyY);
    ctx.restore();
  }

  // ===== EVENT CAROUSEL CARD =====
  // iOS: EventCardView.swift
  // Card: 362×100pt → ~191px height at 2x, full content width
  // Corner radius: 3pt → 6px (LAYOUT.cardRadius)
  // Background: frosted glass — blur the map beneath, then overlay semi-transparent dark
  const cardY = companyY + 44;
  const cardH = 191;

  // Frosted glass: clip to card shape, blur existing canvas content, overlay tint
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    // Clip to card rounded rect
    ctx.beginPath();
    ctx.roundRect(p, cardY, contentWidth, cardH, LAYOUT.cardRadius);
    ctx.clip();
    // Blur the already-drawn content (map + gradient) behind the card
    ctx.filter = 'blur(16px)';
    ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height,
      0, 0, width, height);
    ctx.filter = 'none';
    // Semi-transparent dark overlay on top of blur
    ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
    ctx.fillRect(p, cardY, contentWidth, cardH);
    ctx.restore();
  }

  // Card border
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = LAYOUT.borderWidth;
    ctx.beginPath();
    ctx.roundRect(p, cardY, contentWidth, cardH, LAYOUT.cardRadius);
    ctx.stroke();
    ctx.restore();
  }

  // Colored left border — iOS: 4pt wide → 8px at 2x, but needs to be chunkier for 3D
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);
  if (accentP > 0) {
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.fillStyle = COLORS.accent;
    // 12px wide border (thicker than default 8px for visibility on 3D phone)
    ctx.beginPath();
    ctx.roundRect(p, cardY, 12, cardH, [LAYOUT.cardRadius, 0, 0, LAYOUT.cardRadius]);
    ctx.fill();
    ctx.restore();
  }

  // --- Content phase ---
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);

  // Project title — Mohave-Medium 18pt → 36px at 2x
  // iOS: Font.cardTitle = Mohave-Medium 18pt, primaryText, UPPERCASED, lineLimit(1)
  drawText(ctx, 'RUNWAY CRACK REPAIR', p + 24, cardY + 52, `500 36px ${MOHAVE}`, COLORS.titleLine, contentP);

  // Client name — Mohave-Regular 14pt → 28px at 2x
  // iOS: Font.cardBody = Mohave-Regular 14pt, secondaryText, lineLimit(1)
  drawText(ctx, 'Miramar Flight Academy', p + 24, cardY + 100, `28px ${MOHAVE}`, COLORS.bodyLine, contentP);

  // Address — Mohave-Regular 14pt → 28px at 2x
  // iOS: Font.cardBody = Mohave-Regular 14pt, secondaryText (dimmer)
  drawText(ctx, '9800 Anderson St, San Diego', p + 24, cardY + 140, `28px ${MOHAVE}`, COLORS.captionLine, contentP);

  // Stage badge — "DIAGNOSTIC"
  // iOS: Font.tagLabel = Kosugi-Regular 12pt → 24px at 2x
  // Background: task color at 10% opacity
  // Border: task color at 30% opacity, 1pt stroke
  // Corner radius: cardCornerRadius (4pt) → 8px = LAYOUT.smallRadius
  const badgeW = 170;
  const badgeH = 38;
  const badgeX = width - p - badgeW - 18;
  const badgeY = cardY + cardH - 56;
  // Badge fill + border stroke
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, LAYOUT.smallRadius,
    'rgba(89, 119, 148, 0.30)', 'rgba(89, 119, 148, 0.10)', contentP);
  // Badge text
  drawText(ctx, 'DIAGNOSTIC', badgeX + badgeW / 2, badgeY + badgeH / 2,
    `24px ${KOSUGI}`, COLORS.accent, contentP, 'center');

  // Carousel page dots — top-right inside card
  // iOS: 13×13pt circles, active = primaryAccent, inactive = inputFieldBorder (white 10%)
  const dotSpacing = 22;
  const dotStartX = width - p - 28 - (4 * dotSpacing);
  const dotY = cardY + 32;
  for (let i = 0; i < 5; i++) {
    const isActive = i === 4;
    const dotColor = isActive ? COLORS.accent : 'rgba(255, 255, 255, 0.10)';
    drawCircle(ctx, dotStartX + i * dotSpacing, dotY, 7, dotColor, dotColor, contentP);
  }

  // ===== MAP FILTER CHIPS =====
  // iOS: MapFilterChips.swift
  // Font: smallCaption = Kosugi-Regular 12pt → 24px at 2x
  // Tracking: 0.5pt (not replicable in canvas — visual approximation)
  // Gap: 8pt → 16px at 2x
  // Corner radius: 3pt → 6px = LAYOUT.cardRadius
  // Padding: 12pt H → 24px, 8pt V → 16px at 2x
  // Active: primaryAccent border, primaryText text, cardBackgroundDark fill
  // Inactive: white 10% border, secondaryText text, cardBackgroundDark fill
  const chipY = cardY + cardH + 32;
  const chips = ['TODAY [TASKS]', 'ACTIVE', 'ALL'];
  const chipH = 44;
  let chipX = p;
  for (let i = 0; i < 3; i++) {
    const isSelected = i === 0;
    const stroke = isSelected ? COLORS.accent : 'rgba(255, 255, 255, 0.10)';
    const textColor = isSelected ? COLORS.titleLine : COLORS.captionLine;

    // Measure text to size chip dynamically (like iOS auto-layout)
    ctx.save();
    ctx.font = `24px ${KOSUGI}`;
    const textW = ctx.measureText(chips[i]).width;
    ctx.restore();
    const chipW = textW + 48; // 24px padding each side

    // Frosted glass chip background
    if (contentP > 0) {
      ctx.save();
      ctx.globalAlpha = contentP;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, LAYOUT.cardRadius);
      ctx.clip();
      ctx.filter = 'blur(16px)';
      ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height,
        0, 0, width, height);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
      ctx.fillRect(chipX, chipY, chipW, chipH);
      ctx.restore();

      // Chip border
      ctx.save();
      ctx.globalAlpha = contentP;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = LAYOUT.borderWidth;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, LAYOUT.cardRadius);
      ctx.stroke();
      ctx.restore();
    }

    drawText(ctx, chips[i], chipX + chipW / 2, chipY + chipH / 2,
      `24px ${KOSUGI}`, textColor, contentP, 'center');
    chipX += chipW + 16; // 8pt gap → 16px at 2x
  }

  // ===== MAP OVERLAY ELEMENTS =====
  // Pins, labels, and controls positioned in the lower portion of the screen
  // (the map is full-bleed behind everything)
  const mapContentY = chipY + 58; // Where map-specific UI starts
  const mapContentH = LAYOUT.tabBarY - mapContentY - 10;

  // --- Accent phase — pins with labels, map buttons ---
  // Each pin uses exact iOS ProjectAnnotationRenderer colors:
  //   dot = pipeline status color, ring = task type color
  //   label = project name (Kosugi 11pt → 22px at 2x), white 80%
  // iOS status colors from Assets.xcassets:
  //   rfq=#BCBCBC, estimated=#B5A381, accepted=#9DB582,
  //   inProgress=#8195B5, completed=#B58289

  // Helper: draw pin label with soft radial gradient backdrop + drop shadow
  const drawPinLabel = (text: string, x: number, y: number, prog: number) => {
    if (prog <= 0) return;
    const font = `22px ${KOSUGI}`;

    // Measure text width for gradient sizing
    ctx.save();
    ctx.font = font;
    const textW = ctx.measureText(text).width;
    ctx.restore();

    // Radial gradient backdrop — solid center fading to clear at edges
    const gradRx = textW / 2 + 30; // Horizontal radius
    const gradRy = 24;              // Vertical radius
    ctx.save();
    ctx.globalAlpha = prog;
    // Use an elliptical gradient by scaling the context
    ctx.translate(x, y);
    ctx.scale(gradRx / gradRy, 1);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, gradRy);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-gradRy, -gradRy, gradRy * 2, gradRy * 2);
    ctx.restore();

    // Text with drop shadow
    ctx.save();
    ctx.globalAlpha = prog;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // iOS pin label sits 4pt above ring → 8px gap + 20px ring radius = 28px above center
  // Plus half the text height (~11px) = ~40px above pin center
  const labelOffset = 44;

  // drawMapPin(ctx, cx, cy, dotColor=taskType, ringColor=status, progress)
  // Inner dot = task type color, Outer ring = pipeline status color
  // Status: estimated=#B5A381, accepted=#9DB582, inProgress=#8195B5, completed=#B58289
  // Task types use the project's assigned color (accent, various per-task)

  // Pin 1: Center-left — Estimated status, Diagnostic task type (accent blue)
  const pin1X = width * 0.38, pin1Y = mapContentY + mapContentH * 0.42;
  drawMapPin(ctx, pin1X, pin1Y, COLORS.accent, '#B5A381', accentP);
  drawPinLabel('Runway Crack Repair', pin1X, pin1Y - labelOffset, accentP);

  // Pin 2: Upper-center — In Progress status, Coating task type (gold)
  const pin2X = width * 0.58, pin2Y = mapContentY + mapContentH * 0.20;
  drawMapPin(ctx, pin2X, pin2Y, COLORS.stageInProgress, '#8195B5', accentP);
  drawPinLabel('Flight Deck Coating', pin2X, pin2Y - labelOffset, accentP);

  // Pin 3: Lower-left — Accepted status, Sealing task type (green)
  const pin3X = width * 0.25, pin3Y = mapContentY + mapContentH * 0.70;
  drawMapPin(ctx, pin3X, pin3Y, COLORS.stageAccepted, '#9DB582', accentP);
  drawPinLabel('Pool Deck Sealing', pin3X, pin3Y - labelOffset, accentP);

  // ===== MAP CONTROL BUTTONS =====
  const btnR = 32;
  const btnX = width - p - btnR - 8;
  const btnBaseY = mapContentY + mapContentH * 0.32;
  const btnGap = 76;

  // --- Location button (iOS: location.fill — solid navigation arrow) ---
  if (accentP > 0) {
    const lx = btnX, ly = btnBaseY;
    // Button circle — dark fill with subtle border
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.beginPath();
    ctx.arc(lx, ly, btnR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Filled navigation arrow — iOS location.fill: solid arrow pointing upper-right
    ctx.save();
    ctx.globalAlpha = accentP * 0.85;
    ctx.translate(lx, ly);
    ctx.rotate(-Math.PI / 4); // Rotate 45° so arrow points upper-right
    ctx.fillStyle = COLORS.titleLine;
    ctx.beginPath();
    ctx.moveTo(0, -14);       // Top point (sharp tip)
    ctx.lineTo(8, 10);        // Right wing
    ctx.lineTo(0, 4);         // Center notch
    ctx.lineTo(-8, 10);       // Left wing
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- Person button (iOS: person.fill — solid person silhouette) ---
  if (accentP > 0) {
    const px2 = btnX, py2 = btnBaseY + btnGap;
    // Button circle
    ctx.save();
    ctx.globalAlpha = accentP;
    ctx.beginPath();
    ctx.arc(px2, py2, btnR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Filled person silhouette — iOS person.fill
    ctx.save();
    ctx.globalAlpha = accentP * 0.85;
    ctx.fillStyle = COLORS.titleLine;
    // Head (solid circle)
    ctx.beginPath();
    ctx.arc(px2, py2 - 7, 7, 0, Math.PI * 2);
    ctx.fill();
    // Shoulders/torso (rounded trapezoid shape)
    ctx.beginPath();
    ctx.moveTo(px2 - 13, py2 + 14);
    ctx.quadraticCurveTo(px2 - 13, py2 + 3, px2, py2 + 2);
    ctx.quadraticCurveTo(px2 + 13, py2 + 3, px2 + 13, py2 + 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
