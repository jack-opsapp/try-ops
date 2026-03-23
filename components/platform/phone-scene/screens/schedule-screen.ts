/**
 * Schedule wireframe — Daily view with week strip and task list.
 * Reference: ref-schedule.png + iOS source (schedule-reference.md)
 * Data: Pete Mitchell / MAVERICK PROJECTS LTD — Top Gun themed
 *
 * Layout matches actual iOS code:
 *   AppHeader.swift       → title + 4 toolbar circles
 *   CalendarDaySelector   → week strip, spanning bars (weekBarsOverlay)
 *   WeekDayCell           → day abbreviation + day number, today/selected states
 *   DayCanvasView         → day header + task list (filtered to today)
 *   CalendarEventCard     → cards with color stripe, cardBackgroundDark bg
 *
 * SINGLE SOURCE OF TRUTH: ALL_TASKS defines both spanning bars AND the day task list.
 * Bars are generated from multi-day tasks; the task list filters to tasks overlapping today.
 */

import { COLORS, LAYOUT, TIMING } from '../constants';
import {
  drawRoundedRect,
  drawCircle,
  phase,
} from '../draw-utils';
import type { ScreenDrawParams } from './types';

// --- Fonts ---
const MOHAVE = 'Mohave, sans-serif';
const KOSUGI = 'Kosugi, sans-serif';

// --- Scale: iPhone ~393pt → canvas 750px ---
const S = 750 / 393;

// --- Helpers ---

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

// --- Dynamic date ---

const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function getWeekData() {
  const now = new Date();
  const today = now.getDay();
  const todayDate = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  const mondayOffset = today === 0 ? -6 : 1 - today;
  const monday = new Date(now);
  monday.setDate(todayDate + mondayOffset);

  const days: { abbr: string; num: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({ abbr: DAY_ABBRS[d.getDay()], num: String(d.getDate()) });
  }

  const todayIndex = today === 0 ? 6 : today - 1;
  return {
    days,
    todayIndex,
    headerDate: `${MONTH_NAMES[month]} ${todayDate}`,
    dayName: DAY_NAMES[today],
    fullDate: `${MONTH_NAMES[month].toUpperCase()} ${todayDate},  ${year}`,
  };
}

// --- Toolbar icons ---

function drawCalendarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = COLORS.titleLine; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  const s = 12;
  ctx.beginPath(); ctx.roundRect(cx - s, cy - s + 3, s * 2, s * 2 - 2, 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - s, cy - s + 9); ctx.lineTo(cx + s, cy - s + 9); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, cy - s); ctx.lineTo(cx - s * 0.5, cy - s + 5);
  ctx.moveTo(cx + s * 0.5, cy - s); ctx.lineTo(cx + s * 0.5, cy - s + 5);
  ctx.stroke();
}

function drawFilterIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = COLORS.titleLine; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 6); ctx.lineTo(cx + 7, cy - 6);
  ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy);
  ctx.moveTo(cx - 3, cy + 6); ctx.lineTo(cx + 3, cy + 6);
  ctx.stroke();
}

function drawPeopleIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = COLORS.titleLine; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx - 4, cy - 6, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 10); ctx.quadraticCurveTo(cx - 12, cy + 2, cx - 4, cy + 1);
  ctx.quadraticCurveTo(cx + 4, cy + 2, cx + 4, cy + 10); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 8, cy - 6, 4.5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 7, cy + 1); ctx.quadraticCurveTo(cx + 15, cy + 2, cx + 15, cy + 9); ctx.stroke();
}

function drawSearchIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = COLORS.titleLine; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 4.5, cy + 4.5); ctx.lineTo(cx + 9, cy + 9); ctx.stroke();
}

// =============================================================================
// UNIFIED TASK DATA — single source of truth for bars AND task list
// Day range as offsets from today: 0 = today, -1 = yesterday, +1 = tomorrow
// =============================================================================

interface ScheduleTask {
  name: string;
  client: string;
  address: string;
  badge: string;
  color: string;
  completed?: boolean;
  startOffset: number;
  endOffset: number;
}

const ALL_TASKS: ScheduleTask[] = [
  // Multi-day tasks (show as spanning bars + in task list on overlapping days)
  { name: 'FLIGHT DECK COATING', client: 'Miramar Flight Academy', address: '9800 Anderson St, San Diego', badge: 'COATING', color: COLORS.accent, startOffset: -1, endOffset: 1 },
  { name: "O'CLUB PATIO RESURFACE", client: "O'Club Bar & Grill", address: '8080 Miraloni Dr, San Diego', badge: 'PAVING', color: COLORS.stageAccepted, startOffset: -3, endOffset: 0 },
  { name: "CHARLIE'S HOME OFFICE REMODEL", client: 'Charlie Blackwood', address: '10452 Scripps Lake Dr, San Diego', badge: 'PAINTING', color: COLORS.stageInProgress, startOffset: -2, endOffset: 2 },
  { name: 'HANGAR SIDING REPAIR', client: 'Fightertown Hangars LLC', address: '5015 Mira Mesa Blvd, San Diego', badge: 'INSTALLATION', color: COLORS.stageCompleted, completed: true, startOffset: 0, endOffset: 1 },
  // Single-day task (no spanning bar — iOS skips single-day tasks in weekBarsOverlay)
  { name: 'PARKING LOT STRIPING', client: 'Miramar Flight Academy', address: '9800 Anderson St, San Diego', badge: 'STRIPING', color: COLORS.accent, startOffset: 0, endOffset: 0 },
  // Tasks that DON'T overlap today (only show as bars, not in the day list)
  { name: 'LOCKER ROOM RENOVATION', client: 'Fightertown Hangars LLC', address: '5015 Mira Mesa Blvd, San Diego', badge: 'RENOVATION', color: COLORS.stageEstimated, startOffset: -5, endOffset: -2 },
  { name: 'TAXIWAY REPAINT', client: 'Miramar Flight Academy', address: '9800 Anderson St, San Diego', badge: 'PAINTING', color: COLORS.stageInProgress, startOffset: 2, endOffset: 5 },
];

interface WeekBarSpan {
  startDay: number;
  endDay: number;
  row: number;
  color: string;
  isFirst: boolean;
  isLast: boolean;
}

function buildScheduleData(todayIdx: number) {
  // Build spans from multi-day tasks
  const rawSpans: { task: ScheduleTask; startDay: number; endDay: number }[] = [];
  for (const task of ALL_TASKS) {
    const absStart = todayIdx + task.startOffset;
    const absEnd = todayIdx + task.endOffset;
    if (absEnd < 0 || absStart > 6) continue;
    if (task.startOffset === task.endOffset) continue; // single-day → no bar
    rawSpans.push({ task, startDay: Math.max(absStart, 0), endDay: Math.min(absEnd, 6) });
  }

  // Sort: wider spans first, then by start day
  rawSpans.sort((a, b) => {
    const aW = a.endDay - a.startDay, bW = b.endDay - b.startDay;
    if (aW !== bW) return bW - aW;
    return a.startDay - b.startDay;
  });

  // Greedy slot packing (max 4 rows)
  const maxRows = 4;
  const occupied: boolean[][] = Array.from({ length: 7 }, () => Array(maxRows).fill(false));
  const weekSpans: WeekBarSpan[] = [];

  for (const span of rawSpans) {
    let row = -1;
    for (let r = 0; r < maxRows; r++) {
      let ok = true;
      for (let d = span.startDay; d <= span.endDay; d++) { if (occupied[d][r]) { ok = false; break; } }
      if (ok) { row = r; for (let d = span.startDay; d <= span.endDay; d++) occupied[d][r] = true; break; }
    }
    if (row < 0) continue;
    const absStart = todayIdx + span.task.startOffset;
    const absEnd = todayIdx + span.task.endOffset;
    weekSpans.push({
      startDay: span.startDay, endDay: span.endDay, row,
      color: span.task.color,
      isFirst: absStart >= 0,
      isLast: absEnd <= 6,
    });
  }

  // Today's task list: tasks whose offset range includes 0
  const todayTasks = ALL_TASKS.filter(t => t.startOffset <= 0 && t.endOffset >= 0);

  return { weekSpans, todayTasks };
}

// =============================================================================
// DRAW
// =============================================================================

export function drawScheduleScreen({ ctx, width, height, progress }: ScreenDrawParams) {
  const p = LAYOUT.padding;
  const contentWidth = width - p * 2;

  const structP = phase(progress, TIMING.structurePhase[0], TIMING.structurePhase[1]);
  const contentP = phase(progress, TIMING.contentPhase[0], TIMING.contentPhase[1]);
  const accentP = phase(progress, TIMING.accentPhase[0], TIMING.accentPhase[1]);

  const week = getWeekData();
  const schedule = buildScheduleData(week.todayIndex);

  // ===== HEADER =====
  const headerY = 120;
  const titleSize = Math.round(28 * S);
  const captionSize = Math.round(14 * S);

  drawText(ctx, 'SCHEDULE', p, headerY, `600 ${titleSize}px ${MOHAVE}`, COLORS.titleLine, structP);
  drawText(ctx, 'TODAY', p, headerY + 38, `bold ${captionSize}px ${KOSUGI}`, COLORS.bodyLine, structP);
  drawText(ctx, '|', p + 90, headerY + 38, `${captionSize}px ${KOSUGI}`, COLORS.bodyLine, structP);
  drawText(ctx, week.headerDate, p + 110, headerY + 38, `${captionSize}px ${KOSUGI}`, COLORS.bodyLine, structP);

  const iconSize = LAYOUT.iconCircleSize;
  const iconGap = 10;
  const iconFns = [drawCalendarIcon, drawFilterIcon, drawPeopleIcon, drawSearchIcon];
  for (let i = 0; i < 4; i++) {
    const cx = width - p - iconSize / 2 - (3 - i) * (iconSize + iconGap);
    drawCircle(ctx, cx, headerY, iconSize / 2, COLORS.border, COLORS.cardFill, structP);
    if (structP > 0) { ctx.save(); ctx.globalAlpha = structP; iconFns[i](ctx, cx, headerY); ctx.restore(); }
  }

  // ===== WEEK STRIP =====
  const stripY = headerY + 60;
  const stripPadV = Math.round(12 * S);
  const stripPadH = Math.round(6 * S);
  const cellH = Math.round(86 * S);
  const stripH = cellH + stripPadV * 2;

  const innerWidth = contentWidth - stripPadH * 2;
  const cellWidth = innerWidth / 7;
  const abbrSize = Math.round(14 * S);
  const numSize = Math.round(18 * S);

  for (let i = 0; i < 7; i++) {
    const cellX = p + stripPadH + i * cellWidth;
    const cellInnerX = cellX + 4;
    const cellInnerW = cellWidth - 8;
    const cellTop = stripY + stripPadV;
    const isToday = i === week.todayIndex;

    if (isToday && structP > 0) {
      ctx.save(); ctx.globalAlpha = structP * 0.15; ctx.fillStyle = COLORS.accent;
      ctx.beginPath(); ctx.roundRect(cellInnerX, cellTop, cellInnerW, cellH, 4); ctx.fill(); ctx.restore();
    }
    if (isToday && structP > 0) {
      ctx.save(); ctx.globalAlpha = structP; ctx.strokeStyle = COLORS.titleLine; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(cellInnerX, cellTop, cellInnerW, cellH, 6); ctx.stroke(); ctx.restore();
    }

    const abbrColor = isToday ? COLORS.titleLine : COLORS.bodyLine;
    drawText(ctx, week.days[i].abbr, cellInnerX + cellInnerW / 2, cellTop + cellH * 0.22, `${abbrSize}px ${KOSUGI}`, abbrColor, structP, 'center');
    drawText(ctx, week.days[i].num, cellInnerX + cellInnerW / 2, cellTop + cellH * 0.48, `600 ${numSize}px ${MOHAVE}`, COLORS.titleLine, structP, 'center');
  }

  // ===== SPANNING BARS =====
  const barsY = stripY + stripPadV + Math.round(cellH * 0.68);
  const barH = Math.round(3 * S);
  const barSpacing = Math.round(2 * S);
  const edgeInset = Math.round(6 * S);
  const barBaseX = p + stripPadH;

  for (const span of schedule.weekSpans) {
    if (accentP <= 0) continue;
    const fullWidth = cellWidth * (span.endDay - span.startDay + 1);
    const lI = span.isFirst ? edgeInset : 0;
    const tI = span.isLast ? edgeInset : 0;
    const bw = fullWidth - lI - tI;
    const xPos = barBaseX + cellWidth * span.startDay + lI;
    const yPos = barsY + span.row * (barH + barSpacing);
    const rL = span.isFirst ? Math.round(1.5 * S) : 0;
    const rR = span.isLast ? Math.round(1.5 * S) : 0;

    ctx.save(); ctx.globalAlpha = accentP * 0.85; ctx.fillStyle = span.color;
    ctx.beginPath(); ctx.roundRect(xPos, yPos, Math.max(bw, 0), barH, [rL, rR, rR, rL]); ctx.fill(); ctx.restore();
  }

  // ===== DAY HEADER =====
  const dayHeaderY = stripY + stripH + 24;
  const headingSize = Math.round(22 * S);
  const smallCaptionSize = Math.round(12 * S);

  drawText(ctx, week.dayName, p, dayHeaderY, `bold ${headingSize}px ${MOHAVE}`, COLORS.titleLine, contentP);
  drawText(ctx, week.fullDate, p, dayHeaderY + headingSize + 6, `${smallCaptionSize}px ${KOSUGI}`, COLORS.bodyLine, contentP);

  // Event count badge — dynamic count from today's tasks
  const evCount = schedule.todayTasks.length;
  const evText = `[ EVENTS — ${evCount} ]`;
  const evBadgeW = 180;
  const evBadgeH = Math.round(smallCaptionSize + 16);
  const evBadgeX = width - p - evBadgeW;
  drawRoundedRect(ctx, evBadgeX, dayHeaderY - 8, evBadgeW, evBadgeH, 2, 'rgba(255,255,255,0.10)', COLORS.cardFill, contentP);
  drawText(ctx, evText, evBadgeX + evBadgeW / 2, dayHeaderY + evBadgeH / 2 - 8, `bold ${smallCaptionSize}px ${KOSUGI}`, COLORS.titleLine, contentP, 'center');

  // ===== TASK LIST (derived from schedule.todayTasks) =====
  const taskStartY = dayHeaderY + headingSize + smallCaptionSize + 30;
  const canvasCardH = Math.round(64 * S);
  const cardRowH = Math.round(72 * S);
  const titleFontSize = Math.round(16 * S);
  const clientFontSize = Math.round(12 * S);
  const addressFontSize = Math.round(11 * S);
  const badgeFontSize = Math.round(10 * S);
  const compFontSize = Math.round(14 * S);

  for (let i = 0; i < schedule.todayTasks.length; i++) {
    const task = schedule.todayTasks[i];
    const cardY = taskStartY + i * cardRowH;
    if (cardY + canvasCardH > LAYOUT.tabBarY - 10) break;

    const isCompleted = task.completed === true;
    const rowAlpha = isCompleted ? 0.55 : 1;

    // Card background
    drawRoundedRect(ctx, p, cardY, contentWidth, canvasCardH, 4, 'rgba(255,255,255,0.10)', COLORS.cardFill, contentP * rowAlpha);

    // Color stripe
    const stripeW = Math.round(4 * S);
    if (accentP > 0) {
      ctx.save(); ctx.globalAlpha = accentP * rowAlpha; ctx.fillStyle = task.color;
      ctx.beginPath(); ctx.roundRect(p, cardY, stripeW, canvasCardH, [4, 0, 0, 4]); ctx.fill(); ctx.restore();
    }

    // Completed dimming
    if (isCompleted && contentP > 0) {
      ctx.save(); ctx.globalAlpha = contentP * 0.35; ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.roundRect(p, cardY, contentWidth, canvasCardH, 4); ctx.fill(); ctx.restore();
    }

    const textX = p + stripeW + Math.round(14 * S);

    drawText(ctx, task.name, textX, cardY + canvasCardH * 0.26, `600 ${titleFontSize}px ${MOHAVE}`, COLORS.titleLine, contentP * rowAlpha);
    drawText(ctx, task.client, textX, cardY + canvasCardH * 0.50, `${clientFontSize}px ${KOSUGI}`, COLORS.bodyLine, contentP * rowAlpha);
    drawText(ctx, task.address, textX, cardY + canvasCardH * 0.72, `${addressFontSize}px ${KOSUGI}`, 'rgba(255,255,255,0.36)', contentP * rowAlpha);

    // Task type badge
    if (contentP > 0) {
      ctx.save(); ctx.font = `bold ${badgeFontSize}px ${KOSUGI}`;
      const btw = ctx.measureText(task.badge).width; ctx.restore();

      const bph = Math.round(7 * S);
      const bw = btw + bph * 2;
      const bh = Math.round(badgeFontSize + 8 * S);
      const bx = width - p - bw - Math.round(14 * S);
      const by = cardY + Math.round(14 * S);

      ctx.save(); ctx.globalAlpha = contentP * rowAlpha * 0.12; ctx.fillStyle = task.color;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 4); ctx.fill(); ctx.restore();

      ctx.save(); ctx.globalAlpha = contentP * rowAlpha * 0.35; ctx.strokeStyle = task.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 4); ctx.stroke(); ctx.restore();

      drawText(ctx, task.badge, bx + bw / 2, by + bh / 2, `bold ${badgeFontSize}px ${KOSUGI}`, task.color, contentP * rowAlpha, 'center');

      // COMPLETED badge
      if (isCompleted) {
        const ct = 'COMPLETED';
        ctx.save(); ctx.font = `bold ${compFontSize}px ${KOSUGI}`;
        const ctw = ctx.measureText(ct).width; ctx.restore();

        const cw = ctw + Math.round(16 * S);
        const ch = Math.round(compFontSize + 8 * S);
        const cx2 = width - p - cw - Math.round(14 * S);
        const cy2 = cardY + canvasCardH - ch - Math.round(8 * S);

        if (accentP > 0) {
          ctx.save(); ctx.globalAlpha = accentP * 0.8; ctx.fillStyle = COLORS.stageCompleted;
          ctx.beginPath(); ctx.roundRect(cx2, cy2, cw, ch, 4); ctx.fill(); ctx.restore();
        }
        drawText(ctx, ct, cx2 + cw / 2, cy2 + ch / 2, `bold ${compFontSize}px ${KOSUGI}`, COLORS.titleLine, accentP * 0.8, 'center');
      }
    }
  }
}
