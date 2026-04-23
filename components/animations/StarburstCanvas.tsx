/**
 * StarburstCanvas — 3D rotating radial burst with depth-based styling
 *
 * Lines radiate from center in all 3D directions (Fibonacci sphere
 * distribution) with small square nodes on ~40% of lines. The entire
 * structure rotates around the Y-axis with a fixed X-axis tilt,
 * creating a true 3D orbital effect.
 *
 * Front-hemisphere nodes render in accent color and are hoverable.
 * Back-hemisphere nodes render in grey and are not interactive.
 *
 * Pure Canvas 2D API — no animation libraries.
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StarburstCanvasProps {
  className?: string;
}

interface SNode {
  /** 3D direction (from parent line) */
  dx: number;
  dy: number;
  dz: number;
  /** Distance from center as fraction of radius (0–1) */
  distance: number;
  size: number;
  text: string;
  /** Whether this node is hoverable */
  interactive: boolean;
  /** Special promo node — orange glow */
  promo: boolean;
  /* Computed each frame */
  screenX: number;
  screenY: number;
  depth: number;
}

interface SLine {
  /** 3D direction (unit vector on Fibonacci sphere) */
  dx: number;
  dy: number;
  dz: number;
  baseOpacity: number;
  hasNode: boolean;
  /** Furthest node distance, or decorative length for bare lines */
  endDistance: number;
  nodes: SNode[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const QUOTES = [
  'BUILD SOMETHING THAT LASTS',
  'WHAT WOULD YOU BUILD',
  'DISCIPLINE IS FREEDOM',
  'WHAT SURVIVES THE REST',
  'THE COST OF DOING NOTHING',
  'EXPERIENCE BECOMES INSTINCT',
  'PLANS ARE NOT PROMISES',
  'EARN THE NEXT HOUR',
  'THE WORK SPEAKS',
  'WHAT OUTLIVES YOU',
  'WHAT YOU TOLERATE YOU TEACH',
  'BE WHAT YOU NEEDED',
  'PATIENCE IS A POSITION',
  'KNOWLEDGE DIES UNSHARED',
  'THE WEIGHT OF A DECISION',
  'NO DECISION IS THE WRONG DECISION',
  'CONVICTION BEFORE CONSENSUS',
  'REPUTATION ARRIVES FIRST',
  'THE STANDARD OUTLIVES THE SETTER',
  'DOES CHARACTER COMPOUND',
  'BE THE PROOF',
  'THE COST OF COMFORT',
  'WHAT YOU IGNORE GROWS',
  'KNOWING IS NOT DOING',
  'SLOW IS SMOOTH, SMOOTH IS FAST',
  'HARD CHOICES, EASY LIFE',
  'FIRST IN, LAST OUT',
  'SHOW UP, SHUT UP, STEP UP',
  'RAISE THE FLOOR, THE CEILING FOLLOWS',
  'THE FEW CARRY THE MANY',
  'ROUGH HANDS, CLEAN WORK',
  'YOU FALL TO YOUR TRAINING',
  'TIGHT PLAN, LOOSE GRIP',
  'PRESSURE MAKES, COMFORT BREAKS',
  'PRACTICE PRIVATE, PERFORM PUBLIC',
  'EARN IT, OWN IT, PASS IT DOWN',
  'THE HARD WAY IS THE SHORTCUT',
  'TRUST IN DROPS, LOST IN FLOODS',
  'WHAT YOU REWARD YOU REPEAT',
  'SCARS KNOW MORE THAN SKIN',
  'DEFAULT TO ACTION',
  'FIND THE WHY, THE HOW FOLLOWS',
  'OWN THE OUTCOME',
  'LISTEN FIRST, SPEAK LAST',
  'LEARN IT, EARN IT, TEACH IT',
  'AMBITION WITHOUT EGO',
  'IRON SHARPENS IRON',
  'MOVE FAST AND BREAK THINGS',
  'ITERATE, ITERATE, ITERATE',
  'RELENTLESS ACTION',
  'WHAT YOU BUILD IN SILENCE SPEAKS LOUDEST',
  "DON'T TALK ABOUT IT, BE ABOUT IT",
  'DO NOTHING WHICH IS OF NO USE',
  'PERCEIVE WHAT CANNOT BE SEEN',
  'IT IS NOT THE CRITIC WHO COUNTS',
  'DARE MIGHTY THINGS',
  'NOT ALL WHO WANDER ARE LOST',
  'GOOD.',
  'FORTUNE FAVORS THE BOLD',
  'THE ONLY WAY OUT IS THROUGH',
  'THE ONLY EASY DAY WAS YESTERDAY',
  'IMPROVISE, ADAPT, OVERCOME',
  'BURN THE SHIPS',
  'JUST BUILD',
  'DO HARD THINGS',
  'START UGLY, FINISH CLEAN',
  'NOTHING CHANGES UNTIL YOU DO',
  'LEAVE IT BETTER',
  'ADAPT OR DIE',
  'ONE MORE',
  'NOTHING OWES YOU ANYTHING',
  'JUST DO IT',
  'IDEAS ARE CHEAP',
  'CREATE THE STANDARD',
  'IF NOT NOW, WHEN',
  'PER ASPERA AD ASTRA',
  'MAKE IT COUNT',
  'PLAN THE WORK, WORK THE PLAN',
  'SOMETHING FROM NOTHING',
];

const LINE_COUNT = 220;
const ROTATION_PERIOD_S = 90;
const HOVER_RADIUS = 22;
const TILT_ANGLE = 0.30; // ~17 degrees fixed X-axis tilt
const FOCAL_LENGTH = 2000;

const DRAG_SENSITIVITY = 0.005;  // radians per pixel
const SPRING_DECAY = 0.96;       // per-frame, ~60fps → settles in ~2s
const DRAG_THRESHOLD = 3;        // pixels before drag activates

const ACCENT = { r: 111, g: 148, b: 176 };  // #6F94B0
const ORANGE = { r: 214, g: 138, b: 52 };  // #D68A34
const GREY = { r: 100, g: 100, b: 100 };   // #646464

const PROMO_TEXT = 'FOR THOSE WHO [DIGDEEPER] 10% OFF';

/* ------------------------------------------------------------------ */
/*  Scene generation (stable across frames)                            */
/* ------------------------------------------------------------------ */

function generateScene(): SLine[] {
  const lines: SLine[] = [];
  const GOLDEN_ANGLE = Math.PI * (1 + Math.sqrt(5));

  // Shuffle quotes so every one is used before repeating
  const shuffled = [...QUOTES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let quoteIdx = 0;

  for (let i = 0; i < LINE_COUNT; i++) {
    // Fibonacci sphere: evenly distributed 3D directions
    const phi = Math.acos(1 - 2 * (i + 0.5) / LINE_COUNT);
    const theta = GOLDEN_ANGLE * i;

    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.sin(phi) * Math.sin(theta);
    const dz = Math.cos(phi);

    const baseOpacity = 0.18 + Math.random() * 0.16;
    const hasNode = Math.random() < 0.35;
    const nodes: SNode[] = [];
    let endDistance = 0;

    if (hasNode) {
      endDistance = 0.4 + Math.random() * 0.5;
      nodes.push({
        dx, dy, dz,
        distance: endDistance,
        size: 4 + Math.random() * 3,
        text: shuffled[quoteIdx % shuffled.length],
        interactive: Math.random() < 0.5,
        promo: false,
        screenX: 0,
        screenY: 0,
        depth: 0,
      });
      quoteIdx++;
    } else {
      endDistance = 0.3 + Math.random() * 0.2;
    }

    lines.push({ dx, dy, dz, baseOpacity, hasNode, endDistance, nodes });
  }

  // Promote one random interactive node to be the promo node
  const candidates = lines.flatMap(l => l.nodes).filter(n => n.interactive);
  if (candidates.length > 0) {
    const promo = candidates[Math.floor(Math.random() * candidates.length)];
    promo.promo = true;
    promo.text = PROMO_TEXT;
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  3D helpers                                                         */
/* ------------------------------------------------------------------ */

/** Rotate 3D point by yaw (Y-axis, time-varying) then tilt (X-axis, fixed). */
function rotate(
  px: number, py: number, pz: number,
  yaw: number, tilt: number,
): { x: number; y: number; z: number } {
  // Y-axis rotation
  const x1 = px * Math.cos(yaw) + pz * Math.sin(yaw);
  const z1 = -px * Math.sin(yaw) + pz * Math.cos(yaw);
  const y1 = py;
  // X-axis tilt
  return {
    x: x1,
    y: y1 * Math.cos(tilt) - z1 * Math.sin(tilt),
    z: y1 * Math.sin(tilt) + z1 * Math.cos(tilt),
  };
}

/** Perspective project. z > 0 = front (closer to viewer). */
function project(
  x: number, y: number, z: number,
  cx: number, cy: number,
): { sx: number; sy: number; scale: number } {
  const scale = FOCAL_LENGTH / (FOCAL_LENGTH - z);
  return { sx: cx + x * scale, sy: cy + y * scale, scale };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(
  back: { r: number; g: number; b: number },
  front: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: Math.round(lerp(back.r, front.r, t)),
    g: Math.round(lerp(back.g, front.g, t)),
    b: Math.round(lerp(back.b, front.b, t)),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StarburstCanvas({ className }: StarburstCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SLine[] | null>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const hoveredRef = useRef(false);
  const dragRef = useRef({
    active: false,
    didDrag: false,
    dismissed: false, // true when gesture is vertical-dominant → let scroll happen
    startX: 0,
    startY: 0,
    yawAtStart: 0,
    tiltAtStart: 0,
  });
  const dragYawOffsetRef = useRef(0);
  const dragTiltOffsetRef = useRef(0);

  // Tooltip rendered on canvas — no DOM state needed

  if (!sceneRef.current) {
    sceneRef.current = generateScene();
  }

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    drag.active = true;
    drag.didDrag = false;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.yawAtStart = dragYawOffsetRef.current;
    drag.tiltAtStart = dragTiltOffsetRef.current;
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const drag = dragRef.current;
    if (drag.active) {
      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;
      if (!drag.didDrag && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > DRAG_THRESHOLD) {
        drag.didDrag = true;
      }
      if (drag.didDrag) {
        dragYawOffsetRef.current = drag.yawAtStart + deltaX * DRAG_SENSITIVITY;
        dragTiltOffsetRef.current = drag.tiltAtStart - deltaY * DRAG_SENSITIVITY;
      }
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
    dragRef.current.active = false;
    dragRef.current.didDrag = false;
    dragRef.current.dismissed = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);

    const handleWindowMouseUp = () => {
      dragRef.current.active = false;
      dragRef.current.didDrag = false;
      dragRef.current.dismissed = false;
      if (containerRef.current) containerRef.current.style.cursor = 'grab';
    };
    window.addEventListener('mouseup', handleWindowMouseUp);

    /* ---- Touch support for mobile drag ---- */
    const container = containerRef.current!;

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const drag = dragRef.current;
      drag.active = true;
      drag.didDrag = false;
      drag.dismissed = false;
      drag.startX = t.clientX;
      drag.startY = t.clientY;
      drag.yawAtStart = dragYawOffsetRef.current;
      drag.tiltAtStart = dragTiltOffsetRef.current;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const drag = dragRef.current;
      if (!drag.active || drag.dismissed) return;
      const t = e.touches[0];
      const deltaX = t.clientX - drag.startX;
      const deltaY = t.clientY - drag.startY;
      if (!drag.didDrag && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > DRAG_THRESHOLD) {
        // If gesture is more vertical than horizontal, let scroll happen
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          drag.dismissed = true;
          drag.active = false;
          return;
        }
        drag.didDrag = true;
      }
      if (drag.didDrag) {
        e.preventDefault(); // prevent scroll only for horizontal-dominant drags
        dragYawOffsetRef.current = drag.yawAtStart + deltaX * DRAG_SENSITIVITY;
        dragTiltOffsetRef.current = drag.tiltAtStart - deltaY * DRAG_SENSITIVITY;
      }
    };

    const handleTouchEnd = () => {
      dragRef.current.active = false;
      dragRef.current.didDrag = false;
      dragRef.current.dismissed = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    const lines = sceneRef.current!;
    let prevTimestamp: number | null = null;
    let yaw = 0;
    const BASE_ANGULAR_SPEED = (Math.PI * 2) / ROTATION_PERIOD_S;
    const HOVER_SPEED_FACTOR = 0.15;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const dt = (timestamp - prevTimestamp) / 1000;
      prevTimestamp = timestamp;

      const drag = dragRef.current;

      // Pause auto-rotation while dragging
      if (!drag.active) {
        // Absorb yaw offset into base yaw so rotation continues from where user left it
        yaw = (yaw + dragYawOffsetRef.current) % (Math.PI * 2);
        dragYawOffsetRef.current = 0;

        const speedMul = hoveredRef.current ? HOVER_SPEED_FACTOR : 1;
        yaw = (yaw + BASE_ANGULAR_SPEED * dt * speedMul) % (Math.PI * 2);

        // Spring-back tilt only: trend back toward default axis of rotation
        dragTiltOffsetRef.current *= SPRING_DECAY;
        if (Math.abs(dragTiltOffsetRef.current) < 0.001) dragTiltOffsetRef.current = 0;
      }

      const finalYaw = yaw + dragYawOffsetRef.current;
      const finalTilt = TILT_ANGLE + dragTiltOffsetRef.current;

      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.55;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      /* ---- Phase 1: Compute all 3D positions ---- */

      interface ComputedNode {
        node: SNode;
        sx: number;
        sy: number;
        depth: number;
        depthNorm: number;
        isFront: boolean;
        scale: number;
        color: { r: number; g: number; b: number };
        opacity: number;
        raw: { x: number; y: number; z: number };
      }

      interface Computed {
        line: SLine;
        endSX: number;
        endSY: number;
        endDepth: number;
        depthNorm: number;
        lineColor: { r: number; g: number; b: number };
        lineOpacity: number;
        lineWidth: number;
        nodeData: ComputedNode[];
        raw: { x: number; y: number; z: number };
      }

      const computed: Computed[] = [];
      let maxZ = 1;

      for (const line of lines) {
        // 3D endpoint from direction vector
        const ex = line.dx * radius * line.endDistance;
        const ey = line.dy * radius * line.endDistance;
        const ez = line.dz * radius * line.endDistance;
        const r3 = rotate(ex, ey, ez, finalYaw, finalTilt);
        if (Math.abs(r3.z) > maxZ) maxZ = Math.abs(r3.z);

        const nodeData: Computed['nodeData'] = [];
        for (const node of line.nodes) {
          const nx = node.dx * radius * node.distance;
          const ny = node.dy * radius * node.distance;
          const nz = node.dz * radius * node.distance;
          const nr = rotate(nx, ny, nz, finalYaw, finalTilt);
          if (Math.abs(nr.z) > maxZ) maxZ = Math.abs(nr.z);
          nodeData.push({
            node,
            sx: 0, sy: 0,
            depth: nr.z,
            depthNorm: 0,
            isFront: nr.z > 0,
            scale: 1,
            color: GREY,
            opacity: 0,
            raw: nr,
          });
        }

        computed.push({
          line,
          endSX: 0, endSY: 0,
          endDepth: r3.z,
          depthNorm: 0,
          lineColor: GREY,
          lineOpacity: 0,
          lineWidth: 0.5,
          nodeData,
          raw: r3,
        });
      }

      /* ---- Phase 1b: Normalize depths and project ---- */

      for (const c of computed) {
        const p = project(c.raw.x, c.raw.y, c.raw.z, cx, cy);
        c.endSX = p.sx;
        c.endSY = p.sy;
        c.depthNorm = (c.raw.z / maxZ + 1) / 2;
        c.lineColor = lerpColor(GREY, ACCENT, c.depthNorm);
        c.lineOpacity = c.line.baseOpacity * (0.5 + c.depthNorm * 0.5);
        c.lineWidth = c.line.hasNode
          ? (0.5 + c.depthNorm * 0.8)
          : (0.3 + c.depthNorm * 0.4);

        for (const nd of c.nodeData) {
          const np = project(nd.raw.x, nd.raw.y, nd.raw.z, cx, cy);
          nd.sx = np.sx;
          nd.sy = np.sy;
          nd.scale = np.scale;
          nd.depthNorm = (nd.raw.z / maxZ + 1) / 2;
          nd.isFront = nd.raw.z > 0;
          const tintColor = nd.node.promo ? ORANGE : ACCENT;
          nd.color = nd.node.interactive
            ? lerpColor(GREY, tintColor, nd.depthNorm)
            : GREY;
          nd.opacity = nd.node.promo
            ? (nd.isFront ? lerp(0.20, 0.50, nd.depthNorm) : lerp(0.08, 0.20, nd.depthNorm))
            : nd.node.interactive
              ? (nd.isFront ? lerp(0.25, 0.65, nd.depthNorm) : lerp(0.10, 0.25, nd.depthNorm))
              : lerp(0.08, 0.20, nd.depthNorm);

          nd.node.screenX = nd.sx;
          nd.node.screenY = nd.sy;
          nd.node.depth = nd.raw.z;
        }
      }

      /* ---- Phase 2: Find closest hoverable (front-only) node ---- */

      let hoveredNode: SNode | null = null;
      let hoveredDist = HOVER_RADIUS;

      // Suppress hover detection while dragging to avoid tooltip flashes
      if (!drag.didDrag) {
        for (const c of computed) {
          for (const nd of c.nodeData) {
            if (!nd.isFront || !nd.node.interactive) continue;
            const dx = mouse.x - nd.sx;
            const dy = mouse.y - nd.sy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < hoveredDist) {
              hoveredDist = dist;
              hoveredNode = nd.node;
            }
          }
        }
      }

      /* ---- Phase 3: Sort back-to-front and draw ---- */

      computed.sort((a, b) => a.endDepth - b.endDepth);

      for (const c of computed) {
        const { r, g, b } = c.lineColor;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(c.endSX, c.endSY);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${c.lineOpacity})`;
        ctx.lineWidth = c.lineWidth;
        ctx.stroke();

        c.nodeData.sort((a, b) => a.depth - b.depth);

        for (const nd of c.nodeData) {
          const isHovered = nd.node === hoveredNode;
          const isPromo = nd.node.promo;
          const hoverColor = isPromo ? ORANGE : ACCENT;
          const drawSize = (isHovered ? nd.node.size * 1.8 : nd.node.size) * nd.scale;
          const { r: nr, g: ng, b: nb } = isHovered ? hoverColor : nd.color;
          const alpha = isHovered ? 0.85 : nd.opacity;

          // Persistent orange glow on promo node (even when not hovered)
          if (isPromo && nd.isFront && !isHovered) {
            ctx.shadowColor = `rgba(${ORANGE.r}, ${ORANGE.g}, ${ORANGE.b}, 0.45)`;
            ctx.shadowBlur = 14;
          }

          ctx.fillStyle = `rgba(${nr}, ${ng}, ${nb}, ${alpha})`;
          ctx.fillRect(
            nd.sx - drawSize / 2,
            nd.sy - drawSize / 2,
            drawSize,
            drawSize,
          );

          if (isPromo && !isHovered) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }

          if (isHovered) {
            ctx.shadowColor = `rgba(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b}, 0.4)`;
            ctx.shadowBlur = 12;
            ctx.fillRect(
              nd.sx - drawSize / 2,
              nd.sy - drawSize / 2,
              drawSize,
              drawSize,
            );
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
        }
      }

      /* ---- Draw hovered node text on canvas ---- */
      hoveredRef.current = !!hoveredNode;
      if (hoveredNode) {
        const textColor = hoveredNode.promo ? ORANGE : ACCENT;
        const tx = hoveredNode.screenX;
        const ty = hoveredNode.screenY - 16;
        ctx.font = '500 10px "Mohave", sans-serif';
        ctx.letterSpacing = '0.08em';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, 0.85)`;
        ctx.fillText(hoveredNode.text, tx, ty);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [resize]);

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', cursor: 'grab' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
