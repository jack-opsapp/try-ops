# Account Type Decision Screen — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a post-auth decision screen at `/signup/account-type` that forks new users into "Run a Crew" (company creation, owner role) or "Join a Crew" (crew code entry, join existing company).

**Architecture:** Canvas 2D particle field (ported from ops-web `ForcedChoiceResponse.tsx`) with two interactive nodes. Selection reveals typewriter headlines and staggered feature bullets. "Join a Crew" includes inline crew code input with company preview. Backend changes: fix sync-user role, add crew code validation API, add join-company API.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Canvas 2D API, Zustand, Supabase, Firebase Auth, Tailwind CSS.

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `components/signup/AccountTypeCanvas.tsx` | Canvas 2D particle field with two nodes, hover/select states, labels |
| `components/signup/AccountTypeScreen.tsx` | Orchestrator: canvas + typewriter + feature reveals + crew code input |
| `app/signup/account-type/page.tsx` | Next.js page wrapper |
| `app/api/auth/validate-code/route.ts` | GET: validate company code, return company preview |
| `app/api/auth/join-company/route.ts` | POST: join user to company via code, assign role from invite or unassigned |

### Modified Files
| File | Change |
|------|--------|
| `app/api/auth/sync-user/route.ts` | Change `role: "field_crew"` → `"unassigned"`, remove `is_company_admin: true` |
| `app/signup/credentials/page.tsx` | Route new users to `/signup/account-type` instead of `/signup/profile` |
| `app/signup/layout.tsx` | Add `account-type` path to centered layout condition |
| `lib/stores/signup-store.ts` | Add `accountType: "company" \| "join" \| null` field + setter |

---

## Chunk 1: Backend — Supabase + sync-user + stores

### Task 1: Add `unassigned` to Supabase role constraint + fix sync-user

**Files:**
- Modify: `app/api/auth/sync-user/route.ts:115-128`

The Supabase `users_role_check` constraint currently allows: `admin, owner, office_crew, field_crew, operator, crew`. The ops-web `UserRole` enum already has `unassigned` and the `roles` table has the preset UNASSIGNED row (`00000000-0000-0000-0000-000000000006`). We need to add `unassigned` to the check constraint via SQL, then fix sync-user.

- [ ] **Step 1: Fix sync-user to use `unassigned` role and remove admin flag**

In `app/api/auth/sync-user/route.ts`, replace the `newRow` object (lines 115-128):

```typescript
// BEFORE:
const newRow = {
  auth_id: firebaseUid,
  firebase_uid: firebaseUid,
  email,
  first_name: derivedFirst,
  last_name: derivedLast,
  profile_image_url: photoURL ?? null,
  role: "field_crew",
  is_active: true,
  is_company_admin: true,
  has_completed_onboarding: false,
  has_completed_tutorial: false,
  dev_permission: false,
};

// AFTER:
const newRow = {
  auth_id: firebaseUid,
  firebase_uid: firebaseUid,
  email,
  first_name: derivedFirst,
  last_name: derivedLast,
  profile_image_url: photoURL ?? null,
  role: "unassigned",
  is_active: true,
  is_company_admin: false,
  has_completed_onboarding: false,
  has_completed_tutorial: false,
  dev_permission: false,
};
```

Key changes:
- `role: "unassigned"` — user has no role until they choose account type
- `is_company_admin: false` — not an admin until they create a company

- [ ] **Step 2: Verify sync-user still returns correct shape**

The response shape `{ user, company, isNewUser }` remains unchanged. `isNewUser: true` triggers the redirect to `/signup/account-type`.

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/sync-user/route.ts
git commit -m "fix(sync-user): use unassigned role for new users, remove auto-admin"
```

### Task 2: Add accountType to signup store

**Files:**
- Modify: `lib/stores/signup-store.ts`

- [ ] **Step 1: Add accountType field and setter to SignupState interface**

Add to the `SignupState` interface after `isNewUser: boolean;`:

```typescript
// Account type (set on decision screen)
accountType: "company" | "join" | null;
```

Add to the actions section:

```typescript
setAccountType: (type: "company" | "join") => void;
```

- [ ] **Step 2: Add to initialState**

```typescript
accountType: null as SignupState["accountType"],
```

- [ ] **Step 3: Add setter implementation**

Inside the `create` callback, after `setAuth`:

```typescript
setAccountType: (type) => set({ accountType: type }),
```

- [ ] **Step 4: Commit**

```bash
git add lib/stores/signup-store.ts
git commit -m "feat(signup-store): add accountType field for decision screen"
```

### Task 3: Create validate-code API

**Files:**
- Create: `app/api/auth/validate-code/route.ts`

This public endpoint validates a company code and returns a preview (name + logo). No auth required — identical pattern to ops-web's `/api/invites/[code]/route.ts` but simpler.

- [ ] **Step 1: Create the API route**

```typescript
/**
 * GET /api/auth/validate-code?code=XXXX
 *
 * Validates a company code (external_id) and returns a preview.
 * Public endpoint — no auth required.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/server-client";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json(
      { valid: false, error: "Missing code parameter" },
      { status: 400 }
    );
  }

  const db = getServiceRoleClient();

  // Look up company by external_id (the shareable crew code)
  const { data: company } = await db
    .from("companies")
    .select("id, name, logo_url, external_id")
    .eq("external_id", code)
    .is("deleted_at", null)
    .maybeSingle();

  if (!company) {
    return NextResponse.json(
      { valid: false, error: "No company found with this code" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    valid: true,
    companyId: company.id,
    companyName: company.name,
    companyLogo: company.logo_url,
    companyCode: company.external_id,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/validate-code/route.ts
git commit -m "feat(api): add validate-code endpoint for crew code lookup"
```

### Task 4: Create join-company API

**Files:**
- Create: `app/api/auth/join-company/route.ts`

Ported from ops-web's `/api/auth/join-company/route.ts` but simplified — no full model mappers needed, just update user's company_id and assign role.

- [ ] **Step 1: Create the API route**

```typescript
/**
 * POST /api/auth/join-company
 *
 * Associates a Firebase-authenticated user with a company via crew code.
 * - Verifies Firebase ID token
 * - Looks up company by external_id
 * - Updates user's company_id
 * - Auto-assigns role from pending team_invitation, or falls back to Unassigned
 *
 * Body: { idToken, companyCode }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/admin-verify";
import { getServiceRoleClient } from "@/lib/supabase/server-client";

const PRESET_UNASSIGNED_ROLE_ID = "00000000-0000-0000-0000-000000000006";

interface JoinCompanyBody {
  idToken: string;
  companyCode: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as JoinCompanyBody;
    const { idToken, companyCode } = body;

    if (!idToken || !companyCode) {
      return NextResponse.json(
        { error: "Missing required fields: idToken, companyCode" },
        { status: 400 }
      );
    }

    const firebaseUser = await verifyFirebaseToken(idToken);
    const db = getServiceRoleClient();

    // Find company by external_id
    const { data: company } = await db
      .from("companies")
      .select("id, name, logo_url, external_id")
      .eq("external_id", companyCode.trim().toUpperCase())
      .is("deleted_at", null)
      .maybeSingle();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found. Check the code and try again." },
        { status: 404 }
      );
    }

    // Find user by auth_id or firebase_uid or email
    const { data: user } = await db
      .from("users")
      .select("id, email, phone")
      .or(`auth_id.eq.${firebaseUser.uid},firebase_uid.eq.${firebaseUser.uid}`)
      .is("deleted_at", null)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    // Update user's company_id
    const { error: updateError } = await db
      .from("users")
      .update({
        company_id: company.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to join company: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Check for pending invitation to auto-assign role
    let roleAssigned = false;

    if (user.email) {
      const { data: invite } = await db
        .from("team_invitations")
        .select("id, role_id")
        .eq("company_id", company.id)
        .eq("email", user.email)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (invite) {
        // Mark invitation accepted
        await db
          .from("team_invitations")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", invite.id);

        if (invite.role_id) {
          await db.from("user_roles").upsert(
            {
              user_id: user.id,
              role_id: invite.role_id,
              assigned_at: new Date().toISOString(),
              assigned_by: null,
            },
            { onConflict: "user_id" }
          );
          roleAssigned = true;
        }
      }
    }

    // Fall back to Unassigned role
    if (!roleAssigned) {
      const { data: existingRole } = await db
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingRole) {
        await db.from("user_roles").upsert(
          {
            user_id: user.id,
            role_id: PRESET_UNASSIGNED_ROLE_ID,
            assigned_at: new Date().toISOString(),
            assigned_by: null,
          },
          { onConflict: "user_id" }
        );
      }
    }

    return NextResponse.json({
      success: true,
      companyId: company.id,
      companyName: company.name,
    });
  } catch (error) {
    console.error("[api/auth/join-company] Error:", error);

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/join-company/route.ts
git commit -m "feat(api): add join-company endpoint for crew code joining"
```

---

## Chunk 2: Canvas Particle System

### Task 5: Create AccountTypeCanvas component

**Files:**
- Create: `components/signup/AccountTypeCanvas.tsx`

This is the core visual component — a Canvas 2D particle field ported from `ops-web/src/components/setup/starfield/ForcedChoiceResponse.tsx`. Key differences from the original:

1. **Colors**: OPS blue `#597794` (89,119,148) and amber `#C4A868` (196,168,104) instead of blue/orange
2. **Particle count**: 120 (up from 80) for denser field
3. **Particle brightness**: Higher `baseAlpha` range (0.25–0.45 vs 0.15–0.30)
4. **Smoother movement**: Lower velocity magnitudes, higher damping
5. **Both nodes always clickable**: When one is selected, hovering the other shows it at increased size/alpha and slows particle flow (exactly matching `hoveringUnselected` behavior from ForcedChoiceResponse)
6. **Node positions**: Centered vertically at 40% height (vs 45%)
7. **Labels**: Mohave font (instead of Kosugi) for node labels

- [ ] **Step 1: Create the component**

```typescript
/**
 * AccountTypeCanvas — Canvas 2D particle field with two selectable nodes
 *
 * Ported from ops-web ForcedChoiceResponse.tsx with OPS brand colors,
 * more particles, brighter rendering, and smoother physics.
 *
 * Both nodes remain clickable at all times. When one is selected and
 * the user hovers the other, particles slow down and the hovered node
 * becomes more prominent (hover-while-selected behavior).
 */

"use client";

import { useRef, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AccountTypeCanvasProps {
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  phase: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 120;
const HIT_RADIUS = 70;
const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LEFT_NODE = { nx: 0.25, ny: 0.40 };
const RIGHT_NODE = { nx: 0.75, ny: 0.40 };

const NEUTRAL = { r: 160, g: 160, b: 160 };
const BLUE = { r: 89, g: 119, b: 148 };   // #597794
const AMBER = { r: 196, g: 168, b: 104 };  // #C4A868

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: -0.5 + Math.random() * 2.0,
      y: -0.5 + Math.random() * 2.0,
      vx: (Math.random() - 0.5) * 0.00004,
      vy: (Math.random() - 0.5) * 0.00004,
      size: 2 + Math.random() * 3,
      baseAlpha: 0.25 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

function edgeTaper(x: number, y: number): number {
  const EDGE = 0.5;
  let taper = 1;
  if (x < 0) taper = Math.min(taper, 1 - Math.min(1, -x / EDGE));
  if (x > 1) taper = Math.min(taper, 1 - Math.min(1, (x - 1) / EDGE));
  if (y < 0) taper = Math.min(taper, 1 - Math.min(1, -y / EDGE));
  if (y > 1) taper = Math.min(taper, 1 - Math.min(1, (y - 1) / EDGE));
  return taper * taper;
}

function lerpColor(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AccountTypeCanvas({
  options,
  selected,
  onSelect,
}: AccountTypeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<number>(-1);
  const selectedRef = useRef<number>(-1);
  const onSelectRef = useRef(onSelect);
  const optionsRef = useRef(options);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[] | null>(null);
  const selProgressRef = useRef(0);

  onSelectRef.current = onSelect;
  optionsRef.current = options;

  // Sync external selected prop
  if (selected !== null && selectedRef.current < 0) {
    const idx = options.findIndex((o) => o.id === selected);
    if (idx >= 0) {
      selectedRef.current = idx;
      selProgressRef.current = 1;
    }
  }
  // Allow switching selection via prop
  if (selected !== null) {
    const idx = options.findIndex((o) => o.id === selected);
    if (idx >= 0 && idx !== selectedRef.current) {
      selectedRef.current = idx;
      selProgressRef.current = 0;
    }
  }

  if (!particlesRef.current) particlesRef.current = generateParticles();

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
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    const container = containerRef.current!;
    let observer: ResizeObserver | null = null;
    if (container) {
      observer = new ResizeObserver(() => resize());
      observer.observe(container);
    }

    const mousePos = { x: -9999, y: -9999 };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const nodes = [
        { x: LEFT_NODE.nx * w, y: LEFT_NODE.ny * h },
        { x: RIGHT_NODE.nx * w, y: RIGHT_NODE.ny * h },
      ];
      let closest = -1;
      let closestDist = HIT_RADIUS;
      for (let i = 0; i < nodes.length; i++) {
        const dx = mx - nodes[i].x;
        const dy = my - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      if (closest >= 0 && closest < optionsRef.current.length) {
        if (selectedRef.current !== closest) {
          selectedRef.current = closest;
          selProgressRef.current = 0;
        }
        onSelectRef.current(optionsRef.current[closest].id);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mousePos.x = -9999;
      mousePos.y = -9999;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      const rect = container.getBoundingClientRect();
      const mx = t.clientX - rect.left;
      const my = t.clientY - rect.top;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const nodes = [
        { x: LEFT_NODE.nx * w, y: LEFT_NODE.ny * h },
        { x: RIGHT_NODE.nx * w, y: RIGHT_NODE.ny * h },
      ];
      let closest = -1;
      let closestDist = HIT_RADIUS;
      for (let i = 0; i < nodes.length; i++) {
        const dx = mx - nodes[i].x;
        const dy = my - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      if (closest >= 0 && closest < optionsRef.current.length) {
        if (selectedRef.current !== closest) {
          selectedRef.current = closest;
          selProgressRef.current = 0;
        }
        onSelectRef.current(optionsRef.current[closest].id);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchend", handleTouchEnd);

    const particles = particlesRef.current!;
    let prevTimestamp: number | null = null;

    function draw(timestamp: number) {
      if (prevTimestamp === null) prevTimestamp = timestamp;
      const rawDt = (timestamp - prevTimestamp) / 1000;
      // Cap delta to prevent jumps on tab switch
      const dt = Math.min(rawDt, 0.05);
      prevTimestamp = timestamp;
      timeRef.current += dt;

      const canvas = canvasRef.current;
      if (!canvas) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = parseFloat(canvas.style.width) || canvas.width;
      const h = parseFloat(canvas.style.height) || canvas.height;
      const time = timeRef.current;
      const sel = selectedRef.current;

      ctx.clearRect(0, 0, w, h);

      const leftX = LEFT_NODE.nx * w;
      const leftY = LEFT_NODE.ny * h;
      const rightX = RIGHT_NODE.nx * w;
      const rightY = RIGHT_NODE.ny * h;

      // ── Hover detection ──
      let hoverIdx = -1;
      if (mousePos.x > -9000) {
        const nodes = [
          { x: leftX, y: leftY },
          { x: rightX, y: rightY },
        ];
        let closestDist = HIT_RADIUS;
        for (let i = 0; i < nodes.length; i++) {
          const dx = mousePos.x - nodes[i].x;
          const dy = mousePos.y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            hoverIdx = i;
          }
        }
      }
      hoveredRef.current = hoverIdx;
      container.style.cursor = hoverIdx >= 0 ? "pointer" : "default";

      // ── Selection progress ──
      if (sel >= 0 && selProgressRef.current < 1) {
        selProgressRef.current = Math.min(1, selProgressRef.current + dt * 1.8);
      }
      const selProgress = selProgressRef.current;
      const flowDir = sel === 0 ? -1 : 1;
      const selNode = sel === 0 ? LEFT_NODE : RIGHT_NODE;
      const selColor = sel === 0 ? BLUE : AMBER;

      // CRITICAL: hover-while-selected behavior
      const hoveringUnselected =
        sel >= 0 && hoverIdx >= 0 && hoverIdx !== sel;
      const flowSpeedMult = hoveringUnselected ? 0.2 : 1.0;

      // ── Update + draw particles ──
      for (const p of particles) {
        // Reduced motion: skip physics, just draw at current position
        if (!REDUCED_MOTION && sel >= 0) {
          // Selected state: particles flow toward selected node
          const baseFlowSpeed =
            0.0018 * (0.3 + selProgress * 0.7) * flowSpeedMult;
          const flowVx = flowDir * baseFlowSpeed;
          const distToNode =
            flowDir < 0 ? selNode.nx - p.x : p.x - selNode.nx;
          const approachT = Math.max(
            0,
            Math.min(1, (distToNode + 0.5) / 0.5),
          );
          const funnelStrength =
            (0.0002 + approachT * 0.0025) * selProgress;

          p.vy += (selNode.ny - p.y) * funnelStrength;
          p.vy *= 0.94;
          p.vx +=
            (flowVx * (0.4 + approachT * 0.6) - p.vx) *
            (0.025 + selProgress * 0.05);

          // Oscillation before entering node
          if (distToNode < -0.1) {
            p.vy +=
              Math.sin(time * 1.2 + p.phase) *
              0.00015 *
              (1 - approachT);
            p.vx +=
              Math.cos(time * 0.6 + p.phase * 2) *
              0.00004 *
              (1 - approachT);
          } else {
            p.vy += Math.sin(time * 1.5 + p.phase) * 0.00002;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Recycle particles that pass the node
          if (flowDir < 0 && p.x < -0.5) {
            p.x = 1.2 + Math.random() * 0.3;
            p.y = selNode.ny + (Math.random() - 0.5) * 1.0;
            p.vx = flowDir * baseFlowSpeed * 0.3;
            p.vy = (Math.random() - 0.5) * 0.0003;
          } else if (flowDir > 0 && p.x > 1.5) {
            p.x = -0.5 + Math.random() * 0.3;
            p.y = selNode.ny + (Math.random() - 0.5) * 1.0;
            p.vx = flowDir * baseFlowSpeed * 0.3;
            p.vy = (Math.random() - 0.5) * 0.0003;
          }
          if (p.y < -0.5) p.y = 1.5;
          if (p.y > 1.5) p.y = -0.5;
        } else if (!REDUCED_MOTION && hoverIdx >= 0) {
          // Hover state: gravitate toward hovered node with orbital motion
          const hovNode = hoverIdx === 0 ? LEFT_NODE : RIGHT_NODE;
          const dx = hovNode.nx - p.x;
          const dy = hovNode.ny - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.01) {
            p.vx += (dx / dist) * 0.00012;
            p.vy += (dy / dist) * 0.00012;
            // Tangential (orbital) component
            p.vx += (-dy / dist) * 0.00007;
            p.vy += (dx / dist) * 0.00007;
          }
          p.vx += Math.sin(time * 0.12 + p.phase) * 0.000008;
          p.vy += Math.cos(time * 0.08 + p.phase * 1.3) * 0.000008;
          p.vx *= 0.988;
          p.vy *= 0.988;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -0.5) p.x = 1.5;
          if (p.x > 1.5) p.x = -0.5;
          if (p.y < -0.5) p.y = 1.5;
          if (p.y > 1.5) p.y = -0.5;
        } else if (!REDUCED_MOTION) {
          // Neutral state: gentle drift
          p.vx += Math.sin(time * 0.12 + p.phase) * 0.00002;
          p.vy += Math.cos(time * 0.08 + p.phase * 1.3) * 0.00002;
          p.vx *= 0.992;
          p.vy *= 0.992;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -0.5) p.x = 1.5;
          if (p.x > 1.5) p.x = -0.5;
          if (p.y < -0.5) p.y = 1.5;
          if (p.y > 1.5) p.y = -0.5;
        }

        // ── Color + alpha ──
        const px = p.x * w;
        const py = p.y * h;
        let cr: number, cg: number, cb: number;
        let alpha = p.baseAlpha;

        if (sel >= 0) {
          const passedNode =
            flowDir < 0 ? selNode.nx - p.x : p.x - selNode.nx;
          const dNode = Math.sqrt(
            (p.x - selNode.nx) ** 2 + (p.y - selNode.ny) ** 2,
          );
          const proximity = Math.max(0, 1 - dNode / 0.25);
          let colorT =
            passedNode > 0
              ? Math.min(1, 0.6 + passedNode * 2)
              : Math.max(0, 1 + passedNode * 3) * 0.5;
          colorT *= selProgress;
          const c = lerpColor(NEUTRAL, selColor, colorT);
          cr = c.r;
          cg = c.g;
          cb = c.b;
          alpha = Math.max(
            p.baseAlpha * 0.6,
            p.baseAlpha * 0.8 + proximity * selProgress * 0.5,
          );
        } else if (hoverIdx >= 0) {
          const hovNode = hoverIdx === 0 ? LEFT_NODE : RIGHT_NODE;
          const dHov = Math.sqrt(
            (p.x - hovNode.nx) ** 2 + (p.y - hovNode.ny) ** 2,
          );
          const proximity = Math.max(0, 1 - dHov / 0.45);
          const hovColor = hoverIdx === 0 ? BLUE : AMBER;
          const c = lerpColor(NEUTRAL, hovColor, proximity * 0.8);
          cr = c.r;
          cg = c.g;
          cb = c.b;
          alpha = p.baseAlpha + proximity * 0.25;
        } else {
          cr = NEUTRAL.r;
          cg = NEUTRAL.g;
          cb = NEUTRAL.b;
          alpha =
            p.baseAlpha + Math.sin(time * 0.5 + p.phase) * 0.04;
        }

        alpha *= edgeTaper(p.x, p.y);
        ctx.fillStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
      }

      // ── Draw nodes ──
      for (let i = 0; i < 2; i++) {
        const nodeX = i === 0 ? leftX : rightX;
        const nodeY = i === 0 ? leftY : rightY;
        const isHovered = hoverIdx === i;
        const isSelected = sel === i;
        const hasSelection = sel >= 0;
        const nodeColor = i === 0 ? BLUE : AMBER;

        let nodeSize: number;
        let nodeAlpha: number;

        if (isSelected) {
          nodeSize = 12;
          nodeAlpha = 0.95;
        } else if (isHovered && hasSelection) {
          // Hover-while-selected: enlarged, semi-visible
          nodeSize = 9;
          nodeAlpha = 0.45;
        } else if (isHovered) {
          nodeSize = 10;
          nodeAlpha = 0.65;
        } else if (hasSelection) {
          // Unselected, not hovered: dimmed
          nodeSize = 6;
          nodeAlpha = 0.15;
        } else {
          nodeSize = 7;
          nodeAlpha = 0.4;
        }

        // Glow on selected node
        if (isSelected) {
          ctx.shadowColor = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, 0.6)`;
          ctx.shadowBlur = 18;
        }

        const drawColor =
          isSelected || isHovered ? nodeColor : NEUTRAL;
        ctx.fillStyle = `rgba(${drawColor.r}, ${drawColor.g}, ${drawColor.b}, ${nodeAlpha})`;
        ctx.fillRect(
          nodeX - nodeSize / 2,
          nodeY - nodeSize / 2,
          nodeSize,
          nodeSize,
        );

        if (isSelected) {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
      }

      // ── Draw labels ──
      ctx.textBaseline = "top";
      for (let i = 0; i < Math.min(2, optionsRef.current.length); i++) {
        const nodeX = i === 0 ? leftX : rightX;
        const nodeY = i === 0 ? leftY : rightY;
        const isHovered = hoverIdx === i;
        const isSelected = sel === i;
        const hasSelection = sel >= 0;

        let labelAlpha: number;
        if (isSelected) labelAlpha = 0.95;
        else if (isHovered && hasSelection) labelAlpha = 0.75;
        else if (isHovered) labelAlpha = 0.9;
        else if (hasSelection) labelAlpha = 0.3;
        else labelAlpha = 0.65;

        ctx.font = '600 18px "Mohave", sans-serif';
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;

        const lines = wrapText(
          ctx,
          optionsRef.current[i].label.toUpperCase(),
          w * 0.3,
        );
        for (let l = 0; l < lines.length; l++) {
          ctx.fillText(lines[l], nodeX, nodeY + 22 + l * 22);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (observer) observer.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [resize]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/signup/AccountTypeCanvas.tsx
git commit -m "feat: add AccountTypeCanvas particle field component"
```

---

## Chunk 3: Decision Screen Page + Orchestrator

### Task 6: Create AccountTypeScreen component

**Files:**
- Create: `components/signup/AccountTypeScreen.tsx`

This component orchestrates the full decision screen:
1. Canvas particle field (fills background)
2. Typewriter headline reveal on selection
3. Staggered feature bullet cascade
4. Inline crew code input for "Join a Crew" path
5. Company preview after code validation
6. Continue button to proceed

**Copy from iOS `UserTypeSelectionContent.swift`:**
- Run a Crew headline: "REGISTER YOUR COMPANY. RUN YOUR JOBS."
- Run a Crew features: "Create projects in seconds", "Assign crew with one tap", "See progress from the truck", "Works offline, syncs later"
- Join a Crew headline: "SEE YOUR JOBS. GET TO WORK."
- Join a Crew features: "Stay briefed on all your jobs", "One-tap directions to the site", "No more missed details", "Mark complete when done"

- [ ] **Step 1: Create the orchestrator component**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AccountTypeCanvas } from "./AccountTypeCanvas";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { useSignupStore } from "@/lib/stores/signup-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { getCurrentUser, getIdToken } from "@/lib/firebase/auth";

/* ------------------------------------------------------------------ */
/*  Content data                                                       */
/* ------------------------------------------------------------------ */

const OPTIONS = [
  { id: "company", label: "Run a Crew" },
  { id: "join", label: "Join a Crew" },
];

const CONTENT: Record<
  string,
  { headline: string; features: string[] }
> = {
  company: {
    headline: "REGISTER YOUR COMPANY. RUN YOUR JOBS.",
    features: [
      "Create projects in seconds",
      "Assign crew with one tap",
      "See progress from the truck",
      "Works offline, syncs later",
    ],
  },
  join: {
    headline: "SEE YOUR JOBS. GET TO WORK.",
    features: [
      "Stay briefed on all your jobs",
      "One-tap directions to the site",
      "No more missed details",
      "Mark complete when done",
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AccountTypeScreen() {
  const router = useRouter();
  const signupStore = useSignupStore();
  const onboardingStore = useOnboardingStore();

  const [selected, setSelected] = useState<string | null>(null);
  const [crewCode, setCrewCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [companyPreview, setCompanyPreview] = useState<{
    name: string;
    logo: string | null;
    id: string;
  } | null>(null);
  const [joining, setJoining] = useState(false);
  const [headlineDone, setHeadlineDone] = useState(false);
  const [visibleFeatures, setVisibleFeatures] = useState<number>(0);

  const content = selected ? CONTENT[selected] : null;

  // Reset headline completion on selection change
  useEffect(() => {
    setHeadlineDone(false);
  }, [selected]);

  // Staggered feature reveal after headline completes
  useEffect(() => {
    if (!headlineDone || !content) {
      setVisibleFeatures(0);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleFeatures(count);
      if (count >= content.features.length) clearInterval(interval);
    }, 80);

    return () => clearInterval(interval);
  }, [headlineDone, content]);

  // Reset reveals on selection change
  useEffect(() => {
    setVisibleFeatures(0);
    setCompanyPreview(null);
    setCrewCode("");
    setCodeError("");
  }, [selected]);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const validateCode = async () => {
    const code = crewCode.trim().toUpperCase();
    if (!code) {
      setCodeError("Enter your crew code");
      return;
    }

    setCodeLoading(true);
    setCodeError("");

    try {
      const res = await fetch(
        `/api/auth/validate-code?code=${encodeURIComponent(code)}`,
      );
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCodeError(data.error || "Invalid code");
        setCompanyPreview(null);
        return;
      }

      setCompanyPreview({
        name: data.companyName,
        logo: data.companyLogo,
        id: data.companyId,
      });
    } catch {
      setCodeError("Failed to validate code. Try again.");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selected) return;

    signupStore.setAccountType(selected as "company" | "join");

    if (selected === "company") {
      // Company creator path — go to profile setup
      router.push("/signup/profile");
    } else if (selected === "join" && companyPreview) {
      // Join path — call join-company API then redirect
      setJoining(true);
      try {
        const firebaseUser = await getCurrentUser();
        if (!firebaseUser) {
          router.push("/signup/credentials");
          return;
        }

        const idToken = await getIdToken();
        const res = await fetch("/api/auth/join-company", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            companyCode: crewCode.trim().toUpperCase(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setCodeError(data.error || "Failed to join. Try again.");
          return;
        }

        signupStore.setCompanyId(data.companyId);
        onboardingStore.setCompanyId(data.companyId);

        // Joined — go to tutorial/app
        router.push("/tutorial");
      } catch {
        setCodeError("Something went wrong. Try again.");
      } finally {
        setJoining(false);
      }
    }
  };

  const canContinue =
    selected === "company" ||
    (selected === "join" && companyPreview !== null);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col">
      {/* Canvas background */}
      <div className="absolute inset-0 z-0">
        <AccountTypeCanvas
          options={OPTIONS}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-end flex-1 pb-12 px-6 pointer-events-none">
        {/* Welcome line */}
        <div className="absolute top-8 left-0 right-0 text-center">
          <p className="font-kosugi text-[11px] text-text-disabled tracking-wider">
            [welcome, <span className="text-text-secondary">{signupStore.firstName || "there"}</span>]
          </p>
        </div>

        {/* Header — visible always */}
        <div className="absolute top-16 left-0 right-0 text-center">
          <h1 className="font-mohave text-[28px] font-semibold uppercase tracking-wide text-text-primary">
            HOW ARE YOU USING OPS?
          </h1>
          <p className="font-kosugi text-[12px] text-text-tertiary mt-1">
            [choose one to get started]
          </p>
        </div>

        {/* Reveal panel — bottom area */}
        {selected && content && (
          <div className="w-full max-w-[400px] pointer-events-auto">
            {/* Typewriter headline — uses existing TypewriterText component */}
            <p className="font-mohave text-[20px] font-semibold text-text-primary uppercase tracking-wide text-center mb-4">
              <TypewriterText
                text={content.headline}
                typingSpeed={30}
                onComplete={() => setHeadlineDone(true)}
              />
            </p>

            {/* Feature bullets */}
            <div className="space-y-2 mb-6">
              {content.features.map((feature, i) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 transition-all duration-200"
                  style={{
                    opacity: i < visibleFeatures ? 1 : 0,
                    transform:
                      i < visibleFeatures
                        ? "translateY(0)"
                        : "translateY(8px)",
                  }}
                >
                  <div className="w-1 h-1 bg-text-tertiary shrink-0" />
                  <span className="font-mohave text-[14px] text-text-secondary">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Crew code input (join path only) */}
            {selected === "join" && headlineDone && (
              <div
                className="mb-4 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <label className="font-kosugi text-[10px] text-text-tertiary uppercase tracking-widest block mb-2">
                  crew code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={crewCode}
                    onChange={(e) => {
                      setCrewCode(e.target.value.toUpperCase());
                      setCodeError("");
                      setCompanyPreview(null);
                    }}
                    placeholder="Enter code"
                    maxLength={20}
                    className="flex-1 bg-background-input border border-border rounded px-4 py-3 font-mohave text-[16px] font-medium text-text-primary tracking-widest uppercase outline-none transition-colors focus:border-ops-accent placeholder:text-text-disabled placeholder:tracking-wide placeholder:normal-case"
                  />
                  <button
                    onClick={validateCode}
                    disabled={codeLoading || !crewCode.trim()}
                    className="px-5 py-3 bg-ops-accent/15 border border-ops-accent/30 rounded font-mohave text-[14px] font-semibold text-ops-accent uppercase tracking-wide transition-colors hover:bg-ops-accent/25 hover:border-ops-accent/50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {codeLoading ? "..." : "JOIN"}
                  </button>
                </div>

                {codeError && (
                  <p className="font-kosugi text-[11px] text-ops-error mt-2">
                    {codeError}
                  </p>
                )}

                {/* Company preview */}
                {companyPreview && (
                  <div className="mt-3 p-3 bg-ops-accent/5 border border-ops-accent/15 rounded flex items-center gap-3 animate-fade-in">
                    <div className="w-9 h-9 rounded-md bg-ops-accent/20 flex items-center justify-center font-mohave font-bold text-[14px] text-ops-accent shrink-0">
                      {companyPreview.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-mohave text-[14px] font-semibold text-text-primary">
                        {companyPreview.name}
                      </p>
                      <p className="font-kosugi text-[10px] text-text-tertiary">
                        [you'll join as unassigned until a role is set]
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Continue button */}
            {canContinue && (
              <button
                onClick={handleContinue}
                disabled={joining}
                className="w-full py-4 bg-text-primary rounded-lg font-mohave text-[16px] font-semibold text-background uppercase tracking-wide transition-all hover:bg-white disabled:opacity-60 animate-fade-up"
              >
                {joining ? "JOINING..." : "CONTINUE"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/signup/AccountTypeScreen.tsx
git commit -m "feat: add AccountTypeScreen orchestrator with typewriter + features + crew code"
```

### Task 7: Create account-type page and update routing

**Files:**
- Create: `app/signup/account-type/page.tsx`
- Modify: `app/signup/layout.tsx`
- Modify: `app/signup/credentials/page.tsx:109-114`

- [ ] **Step 1: Create the page with auth guard**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTypeScreen } from "@/components/signup/AccountTypeScreen";
import { getCurrentUser } from "@/lib/firebase/auth";

export default function AccountTypePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth guard: redirect to credentials if not authenticated
    getCurrentUser().then((user) => {
      if (!user) {
        router.replace("/signup/credentials");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  if (!ready) return null;

  return <AccountTypeScreen />;
}
```

- [ ] **Step 2: Update signup layout to handle account-type page**

The account-type page needs a full-screen layout (no centered container or split hero) because the canvas fills the entire viewport.

In `app/signup/layout.tsx`:

**Add after line 32** (`const isCredentials = pathname === "/signup/credentials";`):

```typescript
const isAccountType = pathname === "/signup/account-type";
```

**Replace the entire JSX return** (the `<>{...}</>` block) with:

```tsx
return (
  <>
    <RedirectHandler />

    {isAccountType ? (
      // ─── Full-Screen Layout (Account Type Decision) ───
      <div className="min-h-screen bg-background">
        {children}
      </div>
    ) : isCredentials ? (
      // ─── Split Hero Layout (Credentials) ───
      <div className="min-h-screen bg-background flex">
        {/* Left: Hero image — hidden on mobile */}
        <div className="hidden lg:block relative w-1/2 min-h-screen overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/auth-hero.jpg')",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.95) 90%, #000000 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)",
            }}
          />
          <div className="absolute bottom-8 left-8 z-10">
            <p className="font-bebas text-[40px] tracking-[0.2em] text-white/90 leading-none">
              OPS
            </p>
            <p className="font-mohave text-body-sm text-white/50 mt-1">
              Built for the field.
            </p>
          </div>
        </div>

        {/* Right: Auth form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[420px] animate-fade-in">
            {children}
          </div>
        </div>
      </div>
    ) : (
      // ─── Centered Setup Layout (Profile, Details) ───
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[600px] animate-fade-in">
          {children}
        </div>
      </div>
    )}
  </>
);
```

- [ ] **Step 3: Update credentials page routing**

In `app/signup/credentials/page.tsx`, change the new-user redirect from `/signup/profile` to `/signup/account-type`.

Replace line 113:

```typescript
// BEFORE:
router.push("/signup/profile");

// AFTER:
router.push("/signup/account-type");
```

- [ ] **Step 4: Commit**

```bash
git add app/signup/account-type/page.tsx app/signup/layout.tsx app/signup/credentials/page.tsx
git commit -m "feat: add account-type decision screen page and update routing"
```

---

## Chunk 4: Integration + Polish

### Task 8: Verify integration paths

**Files:**
- Read: `app/signup/profile/page.tsx`

- [ ] **Step 1: Verify profile page handles company-creator path**

The profile page at `/signup/profile` continues to work for company creators. When `accountType === "company"`, the profile flow proceeds normally (collecting name + company name + phone → company details). No changes needed if it doesn't reference accountType.

Read `app/signup/profile/page.tsx` to confirm. The existing flow already collects company name and proceeds to company-details — this is the correct path for "Run a Crew" users.

- [ ] **Step 2: Verify company creation sets owner role**

Check that the existing company creation API (likely `app/api/company/` routes) updates the user's role to `owner` and `is_company_admin` to `true`. Since sync-user now creates users with `role: "unassigned"` and `is_company_admin: false`, the company creation flow must handle the upgrade. If it doesn't, add those updates to the company creation API.

### Task 9: Run Supabase migration (add `unassigned` to role constraint)

This must be done BEFORE testing — the sync-user API now inserts `role: "unassigned"` which will fail the old check constraint.

- [ ] **Step 1: Execute the constraint migration**

Use the Supabase MCP tool or SQL editor to run against project `ijeekuhbatykdomumfjx`:

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'owner', 'office_crew', 'field_crew', 'operator', 'crew', 'unassigned'));
```

This keeps `office_crew` and `field_crew` for backward compatibility with existing records while adding `unassigned` for new users.

- [ ] **Step 2: Verify the constraint was applied**

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'users_role_check';
```

Expected output should show the new constraint including `'unassigned'`.

### Task 10: Test the full flow

- [ ] **Step 1: Start dev server**

```bash
cd /c/OPS/try-ops && npm run dev
```

- [ ] **Step 2: Test "Run a Crew" path**

1. Navigate to `/signup/credentials`
2. Sign up with a new email
3. Verify redirect to `/signup/account-type`
4. Click "Run a Crew" node — verify typewriter headline + feature cascade
5. Click "Continue" — verify redirect to `/signup/profile`

- [ ] **Step 3: Test "Join a Crew" path**

1. From `/signup/account-type`, click "Join a Crew" node
2. Verify typewriter headline + feature cascade + crew code input appears
3. Enter an invalid code — verify error message
4. Enter a valid company code — verify company preview appears
5. Click "Continue" — verify join-company API is called

- [ ] **Step 4: Test hover-while-selected**

1. Select "Run a Crew"
2. Hover over "Join a Crew" node — verify:
   - Particle flow slows down
   - "Join a Crew" node grows larger and brighter (size 9, alpha 0.45)
   - "Join a Crew" node is clickable (cursor: pointer)
3. Click "Join a Crew" — verify selection switches

- [ ] **Step 5: Test particle smoothness**

1. Observe ambient particles — should drift smoothly with no jitter
2. Hover a node — particles should gravitate smoothly with orbital motion
3. Select a node — particles should stream horizontally in a smooth funnel
4. Particles should be bright enough to be clearly visible against black background
