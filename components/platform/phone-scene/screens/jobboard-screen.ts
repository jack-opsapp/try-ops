/**
 * Job Board wireframe — Kanban board view matching the real iOS app.
 * Reference: ref-jobboard-1.png (Accepted expanded), ref-jobboard-2.png (In Progress expanded),
 *            ref-jobboard-3.png (all collapsed + Completed expanded)
 *
 * Canvas = 750 × 1540. Scale ≈ 1.9× iOS pt.
 * All measurements derived from OPSStyle + AppHeader.swift + Fonts.swift.
 *
 * Header:
 *   title = Typography.title = Mohave-SemiBold 28pt → ~53px
 *   toolbar icons = 44pt circles → ~84px, spacing 8pt → ~16px
 *   header horizontal padding = 20pt → ~38px (close to LAYOUT.padding 40)
 *
 * Segment control:
 *   label = captionBold = Kosugi 14pt → ~27px
 *   height ≈ 36pt → ~68px
 *
 * Kanban bars:
 *   label = captionBold = Kosugi 14pt → ~27px
 *   count = title = Mohave-SemiBold 28pt → ~53px
 *   barHeight = 48pt → ~91px
 *
 * Compact cards:
 *   projectName = bodyBold = Mohave-Medium 16pt → ~30px
 *   client/addr  = caption = Kosugi 14pt → ~27px (but slightly smaller for wireframe ~22px)
 *   dates/count  = smallCaption = Kosugi 12pt → ~23px (wireframe ~18px)
 *   cardHeight = 72pt → ~137px but trimmed to fit screen ~120px
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawCircle,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

// --- Status color mapping (from Assets.xcassets/Colors/Job Status/) ---
const STATUS_COLORS = {
  rfq: '#BCBCBC',
  estimated: '#B5A381',
  accepted: '#9DB582',
  inProgress: '#8195B5',
  completed: '#B58289',
} as const;

// --- Font constants ---
const MOHAVE = 'Mohave, sans-serif';
const KOSUGI = 'Kosugi, sans-serif';

// --- Column data (from ref-jobboard-1.png: Accepted expanded) ---
interface KanbanColumn {
  label: string;
  statusKey: keyof typeof STATUS_COLORS;
  count: number;
  fillFraction: number;
  expanded: boolean;
  cards: CompactCard[];
}

interface CompactCard {
  projectName: string;
  clientName: string;
  address: string;
  dateRange: string;
  tasksCompleted: number;
  tasksTotal: number;
}

const COLUMNS: KanbanColumn[] = [
  {
    label: 'ESTIMATED',
    statusKey: 'estimated',
    count: 0,
    fillFraction: 0,
    expanded: false,
    cards: [],
  },
  {
    label: 'ACCEPTED',
    statusKey: 'accepted',
    count: 4,
    fillFraction: 0.25,
    expanded: true,
    cards: [
      {
        projectName: 'JET INTERIOR REUPHOLSTERY',
        clientName: 'Fightertown Hangars LLC',
        address: '5915 Mira Mesa Blvd',
        dateRange: 'Mar. 20 - Mar. 26',
        tasksCompleted: 2,
        tasksTotal: 3,
      },
      {
        projectName: 'POOL DECK SEALING',
        clientName: 'Miramar Officer Housing',
        address: '11056 Portobelo Dr',
        dateRange: 'Mar. 24 - Mar. 28',
        tasksCompleted: 0,
        tasksTotal: 2,
      },
      {
        projectName: "O'CLUB ENTRANCE LANDSCAPING",
        clientName: "O'Club Bar & Grill",
        address: '8680 Miralani Dr',
        dateRange: 'Mar. 22 - Mar. 30',
        tasksCompleted: 0,
        tasksTotal: 3,
      },
      {
        projectName: 'FLIGHT DECK COATING',
        clientName: 'Miramar Flight Academy',
        address: '9800 Anderson St',
        dateRange: 'Mar. 12 - Mar. 20',
        tasksCompleted: 0,
        tasksTotal: 0,
      },
    ],
  },
  {
    label: 'IN PROGRESS',
    statusKey: 'inProgress',
    count: 6,
    fillFraction: 0.375,
    expanded: false,
    cards: [],
  },
  {
    label: 'COMPLETED',
    statusKey: 'completed',
    count: 6,
    fillFraction: 0.375,
    expanded: false,
    cards: [],
  },
];

// --- Drawing helpers ---

/** Draw a status bar: colored border, proportional fill, label + count */
function drawStatusBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  col: KanbanColumn,
  structP: number,
  contentP: number,
  accentP: number,
) {
  if (structP <= 0) return;
  const color = STATUS_COLORS[col.statusKey];
  const r = LAYOUT.cardRadius;

  // Background tint
  ctx.save();
  ctx.globalAlpha = structP * 0.06;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // Proportional fill
  if (accentP > 0 && col.fillFraction > 0) {
    ctx.save();
    ctx.globalAlpha = accentP * 0.18;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * col.fillFraction * accentP, h);
    ctx.restore();
  }

  // Colored border
  ctx.save();
  ctx.globalAlpha = structP;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();

  // Label — captionBold (Kosugi 14pt → ~27px)
  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP;
    ctx.fillStyle = color;
    ctx.font = `27px ${KOSUGI}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(col.label, x + 28, y + h / 2 + 1);
    ctx.restore();
  }

  // Count — title (Mohave-SemiBold 28pt → ~53px)
  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP;
    ctx.fillStyle = color;
    ctx.font = `600 48px ${MOHAVE}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(col.count), x + w - 28, y + h / 2 + 2);
    ctx.restore();
  }
}

/** Draw a compact project card — border only, no fill */
function drawCompactCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  card: CompactCard,
  contentP: number,
  accentP: number,
) {
  if (contentP <= 0) return;

  const r = LAYOUT.cardRadius;
  const px = 20; // horizontal inset inside card

  // Border only — no background fill
  ctx.save();
  ctx.globalAlpha = contentP;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = LAYOUT.borderWidth;
  ctx.stroke();
  ctx.restore();

  // Clip to card bounds
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Row 1: Project name — bodyBold (Mohave-Medium 16pt → ~30px)
  ctx.save();
  ctx.globalAlpha = contentP;
  ctx.fillStyle = COLORS.titleLine;
  ctx.font = `500 26px ${MOHAVE}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.projectName, x + px, y + 14);
  ctx.restore();

  // Row 2: Client – Address — caption (Kosugi 14pt → ~22px for wireframe)
  ctx.save();
  ctx.globalAlpha = contentP;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const row2Y = y + 44;

  ctx.fillStyle = COLORS.bodyLine;
  ctx.font = `20px ${KOSUGI}`;
  const clientText = card.clientName;
  const clientW = ctx.measureText(clientText).width;
  ctx.fillText(clientText, x + px, row2Y);

  if (card.address) {
    ctx.fillStyle = COLORS.captionLine;
    ctx.fillText(` \u2013 ${card.address}`, x + px + clientW, row2Y);
  }
  ctx.restore();

  // Row 3: Calendar icon + dates (left), task segments + count (right)
  const row3Y = y + 74;

  // Calendar icon
  ctx.save();
  ctx.globalAlpha = contentP * 0.5;
  ctx.strokeStyle = COLORS.captionLine;
  ctx.lineWidth = 1.2;
  const calX = x + px;
  const calS = 14;
  ctx.strokeRect(calX, row3Y, calS, calS);
  ctx.beginPath();
  ctx.moveTo(calX + 3, row3Y - 2);
  ctx.lineTo(calX + 3, row3Y + 2);
  ctx.moveTo(calX + calS - 3, row3Y - 2);
  ctx.lineTo(calX + calS - 3, row3Y + 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(calX, row3Y + 5);
  ctx.lineTo(calX + calS, row3Y + 5);
  ctx.stroke();
  ctx.restore();

  // Date text — smallCaption (Kosugi 12pt → ~18px)
  ctx.save();
  ctx.globalAlpha = contentP;
  ctx.fillStyle = COLORS.captionLine;
  ctx.font = `18px ${KOSUGI}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.dateRange, calX + calS + 8, row3Y);
  ctx.restore();

  // Task progress segments
  if (accentP > 0 && card.tasksTotal > 0) {
    const segTotalW = 80;
    const segGap = 3;
    const segCount = card.tasksTotal;
    const segW = (segTotalW - segGap * (segCount - 1)) / segCount;
    const countStr = `${card.tasksCompleted}/${card.tasksTotal}`;

    ctx.save();
    ctx.font = `18px ${KOSUGI}`;
    const countW = ctx.measureText(countStr).width;
    ctx.restore();

    const countX = x + w - px - countW;
    const segStartX = countX - 10 - segTotalW;

    ctx.save();
    ctx.globalAlpha = accentP;

    for (let i = 0; i < segCount; i++) {
      const sx = segStartX + i * (segW + segGap);
      ctx.beginPath();
      ctx.roundRect(sx, row3Y + 4, segW, 5, 1);
      ctx.fillStyle = i < card.tasksCompleted ? '#9DB582' : COLORS.border;
      ctx.fill();
    }

    ctx.fillStyle = COLORS.captionLine;
    ctx.font = `18px ${KOSUGI}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(countStr, countX, row3Y);
    ctx.restore();
  }

  ctx.restore(); // end clip
}

// --- Toolbar icon: circle with SF Symbol-style outline glyph ---

function drawToolbarIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  glyphIndex: number,
  badgeCount: number,
  badgeColor: string,
  progress: number,
) {
  if (progress <= 0) return;

  // Circle background
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#141414';
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // SF Symbol-style outline glyph
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.strokeStyle = COLORS.titleLine;
  ctx.fillStyle = COLORS.titleLine;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = radius * 0.38; // icon half-size

  switch (glyphIndex) {
    case 0: {
      // calendar.badge.exclamationmark — calendar body + top pins + grid
      const calW = s * 1.8;
      const calH = s * 1.7;
      const calX = cx - calW / 2;
      const calY = cy - calH / 2 + 2;
      const calR = 3;

      // Calendar body
      ctx.beginPath();
      ctx.roundRect(calX, calY, calW, calH, calR);
      ctx.stroke();

      // Top bar (header area)
      ctx.beginPath();
      ctx.moveTo(calX, calY + calH * 0.3);
      ctx.lineTo(calX + calW, calY + calH * 0.3);
      ctx.stroke();

      // Two pins sticking up
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(calX + calW * 0.3, calY - 3);
      ctx.lineTo(calX + calW * 0.3, calY + 4);
      ctx.moveTo(calX + calW * 0.7, calY - 3);
      ctx.lineTo(calX + calW * 0.7, calY + 4);
      ctx.stroke();
      ctx.lineWidth = 1.6;

      // Small exclamation to bottom-right of calendar
      const exX = calX + calW + 3;
      const exY = calY + calH - 2;
      ctx.beginPath();
      ctx.moveTo(exX, exY - 7);
      ctx.lineTo(exX, exY - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(exX, exY + 1, 1.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 1: {
      // checklist — 3 rows: check mark + line
      const rowH = s * 0.65;
      const startY = cy - rowH * 1.3;
      const leftX = cx - s * 0.85;

      for (let i = 0; i < 3; i++) {
        const ry = startY + i * rowH;

        // Checkmark
        ctx.beginPath();
        ctx.moveTo(leftX, ry + 2);
        ctx.lineTo(leftX + 4, ry + 6);
        ctx.lineTo(leftX + 10, ry - 2);
        ctx.stroke();

        // Horizontal line (text placeholder)
        ctx.beginPath();
        ctx.moveTo(leftX + 16, ry + 2);
        ctx.lineTo(cx + s * 0.8, ry + 2);
        ctx.stroke();
      }
      break;
    }

    case 2: {
      // rectangle.stack — two overlapping rounded rects
      const rw = s * 1.5;
      const rh = s * 1.0;
      const rr = 3;

      // Back rect (offset up and narrower)
      ctx.beginPath();
      ctx.roundRect(cx - rw * 0.4, cy - rh * 0.8, rw * 0.8, rh * 0.6, rr);
      ctx.stroke();

      // Front rect (larger, below)
      ctx.beginPath();
      ctx.roundRect(cx - rw / 2, cy - rh * 0.2, rw, rh, rr);
      ctx.stroke();
      break;
    }

    case 3: {
      // magnifyingglass — circle + angled handle
      const glassR = s * 0.55;
      const glassCx = cx - 2;
      const glassCy = cy - 2;

      // Lens circle
      ctx.beginPath();
      ctx.arc(glassCx, glassCy, glassR, 0, Math.PI * 2);
      ctx.stroke();

      // Handle (angled down-right)
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(glassCx + glassR * 0.7, glassCy + glassR * 0.7);
      ctx.lineTo(glassCx + glassR * 1.8, glassCy + glassR * 1.8);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();

  // Badge
  if (badgeCount > 0) {
    const badgeR = 12;
    const bx = cx + radius * 0.6;
    const by = cy - radius * 0.6;

    ctx.save();
    ctx.globalAlpha = progress;
    ctx.beginPath();
    ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = badgeColor;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold 13px ${KOSUGI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(badgeCount), bx, by + 1);
    ctx.restore();
  }
}

// --- Main draw function ---

export function drawJobBoardScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  const structP = phase(progress, TIMING.structurePhase[0], TIMING.structurePhase[1]);
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);

  // ===== HEADER =====
  // Content starts at same Y as home screen
  const headerY = 120;

  // "JOB BOARD" — Typography.title = Mohave-SemiBold 28pt → ~53px
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.fillStyle = COLORS.titleLine;
    ctx.font = `600 53px ${MOHAVE}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('JOB BOARD', p, headerY);
    ctx.restore();
  }

  // 4 toolbar icons — uniform with schedule: iconCircleSize (56px diam), 10px gap
  const iconR = LAYOUT.iconCircleSize / 2; // 28px radius
  const iconGap = 10;
  const iconTotalW = iconR * 2 * 4 + iconGap * 3; // 4 icons + 3 gaps
  const iconsStartX = width - p - iconTotalW + iconR; // first icon center X

  const iconData = [
    { badge: 2, color: '#9DB582' },  // green badge (accepted color)
    { badge: 8, color: '#C4A868' },  // gold/warning badge
    { badge: 0, color: '' },
    { badge: 0, color: '' },
  ];

  for (let i = 0; i < 4; i++) {
    const cx = iconsStartX + i * (iconR * 2 + iconGap);
    drawToolbarIcon(ctx, cx, headerY, iconR, i, iconData[i].badge, iconData[i].color, structP);
  }

  // ===== SEGMENT CONTROL =====
  // Height ≈ 36pt → ~68px
  const segY = headerY + 65;
  const segH = 68;
  const segW = contentWidth / 3;

  drawRoundedRect(ctx, p, segY, contentWidth, segH, LAYOUT.smallRadius, COLORS.border, COLORS.cardFill, structP);

  // BOARD selected fill (third segment)
  if (structP > 0) {
    ctx.save();
    ctx.globalAlpha = structP;
    ctx.beginPath();
    ctx.roundRect(p + segW * 2 + 3, segY + 3, segW - 6, segH - 6, LAYOUT.smallRadius - 1);
    ctx.fillStyle = COLORS.segmentFill;
    ctx.fill();
    ctx.restore();
  }

  // Segment labels — Kosugi ~22px
  if (contentP > 0) {
    ctx.save();
    ctx.globalAlpha = contentP;
    ctx.font = `22px ${KOSUGI}`;
    ctx.textBaseline = 'middle';
    const segCY = segY + segH / 2;

    ctx.fillStyle = COLORS.captionLine;
    ctx.textAlign = 'center';
    ctx.fillText('PROJECTS', p + segW * 0.5, segCY);
    ctx.fillText('TASKS', p + segW * 1.5, segCY);

    ctx.fillStyle = COLORS.segmentText;
    ctx.fillText('BOARD', p + segW * 2.5, segCY);
    ctx.restore();
  }

  // ===== KANBAN STATUS ROWS =====
  let colY = segY + segH + 14;
  const barH = 86;    // ~45pt → compact status bar
  const cardH = 104;  // ~55pt → compact card (tighter than full 72pt)
  const barGap = 14;
  const cardGap = 10;
  const cardInset = 14;

  for (const col of COLUMNS) {
    if (col.expanded && col.cards.length > 0) {
      // --- EXPANDED ---
      const cardsAreaH = col.cards.length * cardH + (col.cards.length - 1) * cardGap + 20;
      const expandedH = barH + cardsAreaH;
      const color = STATUS_COLORS[col.statusKey];

      // Background tint for whole container
      if (structP > 0) {
        ctx.save();
        ctx.globalAlpha = structP * 0.04;
        ctx.beginPath();
        ctx.roundRect(p, colY, contentWidth, expandedH, LAYOUT.cardRadius);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }

      // Status bar header
      drawStatusBar(ctx, p, colY, contentWidth, barH, col, structP, contentP, accentP);

      // Full expanded border (overdraws bar border)
      if (structP > 0) {
        ctx.save();
        ctx.globalAlpha = structP;
        ctx.beginPath();
        ctx.roundRect(p, colY, contentWidth, expandedH, LAYOUT.cardRadius);
        ctx.strokeStyle = color;
        ctx.lineWidth = LAYOUT.borderWidth;
        ctx.stroke();
        ctx.restore();
      }

      // Divider
      if (contentP > 0) {
        ctx.save();
        ctx.globalAlpha = contentP * 0.25;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p + 14, colY + barH);
        ctx.lineTo(p + contentWidth - 14, colY + barH);
        ctx.stroke();
        ctx.restore();
      }

      // Cards
      let cardY = colY + barH + 10;
      for (const card of col.cards) {
        drawCompactCard(
          ctx,
          p + cardInset,
          cardY,
          contentWidth - cardInset * 2,
          cardH,
          card,
          contentP,
          accentP,
        );
        cardY += cardH + cardGap;
      }

      colY += expandedH + barGap;
    } else {
      // --- COLLAPSED ---
      drawStatusBar(ctx, p, colY, contentWidth, barH, col, structP, contentP, accentP);
      colY += barH + barGap;
    }
  }
}
