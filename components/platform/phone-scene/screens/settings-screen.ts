/**
 * Settings wireframe — Real text, real icons, real data from iOS app.
 * Reference: ref-settings.png (Settings tab)
 * Data: Pete Mitchell / MAVERICK PROJECTS LTD
 *
 * iOS source files referenced:
 *   SettingsView.swift     → sections, rows, SF Symbol icon names
 *   OPSStyle.swift         → Typography, Colors, Layout tokens
 *   AppHeader.swift        → header layout (title + search circle)
 *   SettingsComponents.swift → settingsRow, settingsSection, sectionDivider
 *
 * Typography (iOS → canvas):
 *   title:       Mohave-SemiBold 28pt  → 53px
 *   bodyBold:    Mohave-Medium   16pt  → 31px
 *   body:        Mohave-Regular  16pt  → 31px
 *   captionBold: Kosugi          14pt  → 27px
 *   caption:     Kosugi          14pt  → 27px
 *
 * Colors (iOS → canvas mapping):
 *   primaryText   (White)   → titleLine  (rgba 255,255,255,0.80)
 *   secondaryText (#999)    → bodyLine   (rgba 255,255,255,0.50)
 *   tertiaryText  (#666)    → captionLine(rgba 255,255,255,0.30)
 *   cardBackgroundDark      → cardFill   (rgba 255,255,255,0.04)
 *   cardBorder (white 10%)  → border     (rgba 255,255,255,0.18) — boosted for 3D
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawCircle,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

// --- Fonts (loaded by next/font/google on the page) ---
const MOHAVE = 'Mohave, sans-serif';
const KOSUGI = 'Kosugi, sans-serif';

// --- Scale factor: iOS 393pt screen → 750px canvas ---
const S = 750 / 393; // ≈ 1.908

// --- Font sizes (iOS pt × S → canvas px) ---
const TITLE_SIZE = Math.round(28 * S);     // 53px — header
const BODY_SIZE = Math.round(16 * S);      // 31px — row labels, search text
const BODY_BOLD_SIZE = Math.round(16 * S); // 31px — profile name (medium weight)
const CAPTION_SIZE = Math.round(14 * S);   // 27px — section headers, role/email

// --- Icon drawing size (iOS 20pt md icon) ---
const ICON_DRAW = Math.round(20 * S);     // 38px

// --- Layout ---
const ROW_H = 118;        // Height per settings row (iOS ~50pt + generous touch)
const SEARCH_H = 58;      // Search bar height
const PROFILE_H = 120;    // Profile card height
const AVATAR_R = Math.round(24 * S); // ~46px radius (iOS 48pt diameter)

// --- Pete's avatar — loaded once at module level ---
let avatarImg: HTMLImageElement | null = null;
let avatarLoaded = false;
if (typeof window !== 'undefined') {
  avatarImg = new Image();
  avatarImg.crossOrigin = 'anonymous';
  avatarImg.src = '/dev/pete-avatar.jpg';
  avatarImg.onload = () => { avatarLoaded = true; };
}

// ============================================================
// Drawing helpers
// ============================================================

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

function drawChevronRight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  progress: number,
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = progress * 0.35; // tertiaryText opacity
  ctx.strokeStyle = COLORS.captionLine;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.45);
  ctx.lineTo(x + size * 0.25, y);
  ctx.lineTo(x - size * 0.25, y + size * 0.45);
  ctx.stroke();
  ctx.restore();
}

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
    // Subtle border ring
    ctx.save();
    ctx.globalAlpha = progress * 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  } else {
    drawCircle(ctx, cx, cy, radius, COLORS.border, COLORS.cardFill, progress);
  }
}

// ============================================================
// SF Symbol icon approximations (canvas 2D strokes)
// Each icon draws centered at (cx, cy) within a box of `s` px.
// Color and globalAlpha are set by the caller.
// ============================================================

/** magnifyingglass — circle + diagonal handle */
function iconSearch(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const r = s * 0.32;
  ctx.beginPath();
  ctx.arc(cx - s * 0.06, cy - s * 0.06, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.5, cy + r * 0.5);
  ctx.lineTo(cx + s * 0.4, cy + s * 0.4);
  ctx.stroke();
}

/** building.2 — two buildings, taller left + shorter right, window dots */
function iconBuilding(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left building (taller)
  const lw = s * 0.4, lh = s * 0.72;
  const lx = cx - s * 0.36;
  const ly = cy - lh / 2;
  ctx.strokeRect(lx, ly, lw, lh);

  // Windows on left building (2 cols × 3 rows)
  const ws = s * 0.07;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      ctx.fillRect(
        lx + s * 0.07 + c * (s * 0.18),
        ly + s * 0.1 + r * (s * 0.19),
        ws, ws,
      );
    }
  }

  // Right building (shorter)
  const rw = s * 0.35, rh = s * 0.5;
  const rx = cx + s * 0.04;
  const ry = cy - rh / 2 + s * 0.11;
  ctx.strokeRect(rx, ry, rw, rh);

  // Windows on right building (2 cols × 2 rows)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      ctx.fillRect(
        rx + s * 0.06 + c * (s * 0.16),
        ry + s * 0.08 + r * (s * 0.19),
        ws, ws,
      );
    }
  }
}

/** creditcard — rounded rectangle with magnetic stripe band */
function iconCreditCard(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const w = s * 0.78, h = s * 0.52;
  const x = cx - w / 2, y = cy - h / 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.stroke();
  // Magnetic stripe
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.3);
  ctx.lineTo(x + w, y + h * 0.3);
  ctx.stroke();
  // Chip rectangle (small)
  ctx.strokeRect(x + w * 0.12, y + h * 0.5, w * 0.18, h * 0.28);
}

/** bell.fill — filled bell body + clapper arc */
function iconBell(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Bell body (filled)
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.32, cy + s * 0.14);
  ctx.quadraticCurveTo(cx - s * 0.32, cy - s * 0.28, cx, cy - s * 0.4);
  ctx.quadraticCurveTo(cx + s * 0.32, cy - s * 0.28, cx + s * 0.32, cy + s * 0.14);
  ctx.lineTo(cx + s * 0.38, cy + s * 0.2);
  ctx.lineTo(cx - s * 0.38, cy + s * 0.2);
  ctx.closePath();
  ctx.fill();
  // Clapper
  ctx.beginPath();
  ctx.arc(cx, cy + s * 0.33, s * 0.09, 0, Math.PI);
  ctx.stroke();
}

/** map — folded map rectangle with two vertical fold lines */
function iconMap(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const w = s * 0.72, h = s * 0.58;
  const x = cx - w / 2, y = cy - h / 2;
  ctx.strokeRect(x, y, w, h);
  // Two fold lines (three panels)
  const f1 = x + w * 0.33;
  const f2 = x + w * 0.66;
  ctx.beginPath();
  ctx.moveTo(f1, y);
  ctx.lineTo(f1, y + h);
  ctx.moveTo(f2, y);
  ctx.lineTo(f2, y + h);
  ctx.stroke();
  // Small pin/dot on center panel
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

/** externaldrive — rounded rectangle with LED dot */
function iconDrive(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const w = s * 0.74, h = s * 0.38;
  const x = cx - w / 2, y = cy - h / 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.stroke();
  // LED dot (right side)
  ctx.beginPath();
  ctx.arc(x + w - s * 0.14, cy, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Bottom line detail
  ctx.beginPath();
  ctx.moveTo(x + s * 0.08, y + h - s * 0.04);
  ctx.lineTo(x + w * 0.5, y + h - s * 0.04);
  ctx.stroke();
}

/** lock — padlock body + shackle arc */
function iconLock(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Body rectangle
  const bw = s * 0.48, bh = s * 0.38;
  const bodyTop = cy + s * 0.02;
  ctx.beginPath();
  ctx.roundRect(cx - bw / 2, bodyTop, bw, bh, 3);
  ctx.stroke();
  // Shackle — semicircle sitting on top of body
  const shR = bw * 0.36;
  ctx.beginPath();
  ctx.arc(cx, bodyTop, shR, Math.PI, 0);
  ctx.stroke();
  // Keyhole dot
  ctx.beginPath();
  ctx.arc(cx, bodyTop + bh * 0.42, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
}

/** photo.on.rectangle.angled — landscape photo rectangle with mountain */
function iconPhoto(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const w = s * 0.68, h = s * 0.52;
  const x = cx - w / 2, y = cy - h / 2;
  // Main rectangle
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 2);
  ctx.stroke();
  // Mountain (triangle)
  ctx.beginPath();
  ctx.moveTo(x + w * 0.15, y + h * 0.78);
  ctx.lineTo(x + w * 0.38, y + h * 0.28);
  ctx.lineTo(x + w * 0.6, y + h * 0.78);
  ctx.stroke();
  // Sun circle (top right)
  ctx.beginPath();
  ctx.arc(x + w * 0.72, y + h * 0.3, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
// Section & row definitions (matching SettingsView.swift)
// ============================================================

type IconFn = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => void;

const SECTIONS: { label: string; rows: { icon: IconFn; title: string }[] }[] = [
  {
    label: 'ACCOUNT',
    rows: [
      { icon: iconBuilding, title: 'Organization' },    // SF: building.2
      { icon: iconCreditCard, title: 'Subscription' },  // SF: creditcard
    ],
  },
  {
    label: 'APP',
    rows: [
      { icon: iconBell, title: 'Notifications' },       // SF: bell.fill
      { icon: iconMap, title: 'Map Settings' },          // SF: map
      { icon: iconDrive, title: 'Data & Storage' },      // SF: externaldrive
      { icon: iconLock, title: 'Security & Privacy' },   // SF: lock
    ],
  },
];

// ============================================================
// Main draw function
// ============================================================

export function drawSettingsScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  const structP = phase(progress, TIMING.structurePhase[0], TIMING.structurePhase[1]);
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);

  // ================================================================
  // HEADER — "SETTINGS" title + search icon circle
  // iOS: AppHeader headerType .settings
  //   title: OPSStyle.Typography.title (Mohave-SemiBold 28pt)
  //   search circle: 44pt, cardBackground fill
  // ================================================================

  const headerY = 120;

  drawText(ctx, 'SETTINGS', p, headerY,
    `600 ${TITLE_SIZE}px ${MOHAVE}`, COLORS.titleLine, structP);

  // Search icon button (right side, same vertical center as title)
  const searchBtnR = LAYOUT.iconCircleSize / 2;
  const searchBtnCx = width - p - searchBtnR;
  drawCircle(ctx, searchBtnCx, headerY, searchBtnR, COLORS.border, COLORS.cardFill, structP);
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.strokeStyle = COLORS.titleLine;
    ctx.fillStyle = COLORS.titleLine;
    iconSearch(ctx, searchBtnCx, headerY, 26);
    ctx.restore();
  }

  // ================================================================
  // SEARCH BAR — magnifying glass + "Search settings..."
  // iOS: HStack spacing 12, padding .horizontal(16) .vertical(12)
  //   icon: sm 16pt, text: body Mohave-Regular 16pt
  //   bg: cardBackgroundDark, border: cardBorder 1pt
  // ================================================================

  const searchBarY = headerY + 64;
  drawRoundedRect(ctx, p, searchBarY, contentWidth, SEARCH_H,
    LAYOUT.smallRadius, COLORS.border, COLORS.cardFill, structP);

  const sbCy = searchBarY + SEARCH_H / 2;
  const sbIconX = p + Math.round(16 * S) + 12;

  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP;
    ctx.strokeStyle = COLORS.bodyLine;
    ctx.fillStyle = COLORS.bodyLine;
    iconSearch(ctx, sbIconX, sbCy, 20);
    ctx.restore();
  }

  drawText(ctx, 'Search settings...', sbIconX + 24, sbCy,
    `${BODY_SIZE}px ${MOHAVE}`, COLORS.bodyLine, contentP);

  // ================================================================
  // PROFILE CARD — avatar + name + role/email + chevron
  // iOS: HStack spacing 14
  //   avatar: 48×48 circle
  //   name: bodyBold (Mohave-Medium 16pt) .uppercased()
  //   role: caption (Kosugi 14pt) "Owner · email..."
  //   chevron: sm 16pt, tertiaryText
  //   padding: .vertical(14), .horizontal(16)
  //   bg: cardBackgroundDark, border: cardBorder 1pt, cornerRadius 3pt
  // ================================================================

  const profileY = searchBarY + SEARCH_H + 24;
  drawRoundedRect(ctx, p, profileY, contentWidth, PROFILE_H,
    LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

  // Avatar photo
  const avatarCx = p + Math.round(16 * S) + AVATAR_R;
  const avatarCy = profileY + PROFILE_H / 2;
  drawAvatar(ctx, avatarCx, avatarCy, AVATAR_R, contentP);

  // Name and role text
  const nameX = avatarCx + AVATAR_R + Math.round(14 * S);
  drawText(ctx, 'PETE MITCHELL', nameX, profileY + PROFILE_H * 0.38,
    `500 ${BODY_BOLD_SIZE}px ${MOHAVE}`, COLORS.titleLine, contentP);

  drawText(ctx, 'Owner · peter.jmitchell1988@gm\u2026', nameX, profileY + PROFILE_H * 0.64,
    `${CAPTION_SIZE}px ${KOSUGI}`, COLORS.bodyLine, contentP);

  // Chevron
  drawChevronRight(ctx, width - p - 28, profileY + PROFILE_H / 2, 20, contentP);

  // ================================================================
  // SETTINGS SECTIONS — ACCOUNT (2 rows), APP (4 rows)
  // iOS: settingsSection → VStack spacing 8 between label and card
  //   sectionDivider: 1px, .leading 58pt
  //   settingsRow: HStack spacing 14, padding .v(14) .h(16)
  //     icon: md 20pt, secondaryText
  //     title: body Mohave-Regular 16pt, primaryText
  //     chevron: sm 16pt, tertiaryText
  // ================================================================

  // Row layout measurements
  const rowPadH = Math.round(16 * S);       // ~31px from card edge
  const iconFrameW = Math.round(28 * S);    // ~54px icon frame
  const iconTextSpacing = Math.round(14 * S); // ~27px
  const iconCx = p + rowPadH + iconFrameW / 2;
  const textX = p + rowPadH + iconFrameW + iconTextSpacing;
  const chevronX = width - p - 28;
  const dividerX = textX - 8;               // iOS: .leading 58pt (~111px canvas)

  let cursorY = profileY + PROFILE_H + 42;  // Start of first section

  for (let si = 0; si < SECTIONS.length; si++) {
    const section = SECTIONS[si];
    const isLastSection = si === SECTIONS.length - 1;

    // Section header label (captionBold: Kosugi 14pt, secondaryText)
    drawText(ctx, section.label, p, cursorY,
      `bold ${CAPTION_SIZE}px ${KOSUGI}`, COLORS.bodyLine, contentP);

    // Card container
    const cardTop = cursorY + 30;
    const cardH = section.rows.length * ROW_H;
    drawRoundedRect(ctx, p, cardTop, contentWidth, cardH,
      LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, structP);

    // Draw rows
    for (let ri = 0; ri < section.rows.length; ri++) {
      const row = section.rows[ri];
      const rowCy = cardTop + ri * ROW_H + ROW_H / 2;

      // Icon (secondaryText color)
      if (contentP > 0) {
        ctx.save();
        ctx.globalAlpha = contentP;
        ctx.strokeStyle = COLORS.bodyLine;
        ctx.fillStyle = COLORS.bodyLine;
        row.icon(ctx, iconCx, rowCy, ICON_DRAW);
        ctx.restore();
      }

      // Title text (body: Mohave-Regular 16pt, primaryText)
      drawText(ctx, row.title, textX, rowCy,
        `${BODY_SIZE}px ${MOHAVE}`, COLORS.titleLine, contentP);

      // Chevron (tertiaryText)
      drawChevronRight(ctx, chevronX, rowCy, 18, contentP);

      // Divider between rows (not after last)
      // iOS: 1px, starts at .leading 58pt
      if (ri < section.rows.length - 1 && structP > 0) {
        const divY = cardTop + (ri + 1) * ROW_H;
        ctx.save();
        ctx.globalAlpha = structP;
        ctx.strokeStyle = COLORS.separator;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dividerX, divY);
        ctx.lineTo(width - p - 14, divY);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Advance cursor past this section
    cursorY = cardTop + cardH + 42;
  }

  // ================================================================
  // DATA SECTION — peek (label + partial first row)
  // Shows just enough to imply more content below the fold.
  // iOS: settingsSection("DATA") { settingsRow(icon: "photo.on.rectangle.angled", title: "Photos") ... }
  // ================================================================

  if (cursorY < LAYOUT.tabBarY - 60) {
    // Section label
    drawText(ctx, 'DATA', p, cursorY,
      `bold ${CAPTION_SIZE}px ${KOSUGI}`, COLORS.bodyLine, accentP);

    const dataCardTop = cursorY + 30;
    const maxVisible = LAYOUT.tabBarY - dataCardTop - 20;
    const visibleH = Math.min(ROW_H, maxVisible);

    if (visibleH > 30) {
      // Partial card
      drawRoundedRect(ctx, p, dataCardTop, contentWidth, visibleH,
        LAYOUT.cardRadius, COLORS.border, COLORS.cardFill, accentP);

      // First row content ("Photos") — only if enough space
      if (visibleH > ROW_H * 0.5) {
        const rowCy = dataCardTop + Math.min(visibleH, ROW_H) / 2;

        // Photo icon
        if (accentP > 0) {
          ctx.save();
          ctx.globalAlpha = accentP;
          ctx.strokeStyle = COLORS.bodyLine;
          ctx.fillStyle = COLORS.bodyLine;
          iconPhoto(ctx, iconCx, rowCy, ICON_DRAW);
          ctx.restore();
        }

        drawText(ctx, 'Photos', textX, rowCy,
          `${BODY_SIZE}px ${MOHAVE}`, COLORS.titleLine, accentP);

        drawChevronRight(ctx, chevronX, rowCy, 18, accentP);
      }
    }
  }
}
