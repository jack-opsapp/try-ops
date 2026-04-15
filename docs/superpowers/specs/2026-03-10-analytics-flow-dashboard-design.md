# Analytics Flow Dashboard — Design Spec

**Date**: 2026-03-10
**Location**: ops-web admin panel at `/admin/analytics/flow`
**Stack**: Next.js 14, TypeScript, Tailwind, React Flow, TanStack Query, Supabase

---

## Problem

The admin panel shows aggregate metrics (conversion rate, visitor count, section views) but provides no visibility into **how users actually move through the landing page**. There's no way to see:
- Where users enter (UTM source, referrer, direct)
- Which sections they visit and in what order
- Where they drop off vs. where they convert
- Common user paths through the page

## Solution

An interactive node-based flow visualization using React Flow. Each landing page section is a node. Edges between nodes represent user transitions, with thickness proportional to traffic volume. Click any node to see detailed metrics in a slide-out panel.

---

## Architecture

### Page: `/admin/analytics/flow`

New page under the existing `/admin/analytics/` directory in ops-web.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [7d] [30d] [90d] [All]   |  Device: [All ▾]  |  Variant: [All ▾]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐                                           │
│  │ ENTRY    │──▶ ┌──────┐ ──▶ ┌──────────┐             │
│  │ (Sources)│    │ Hero │     │ PainSect │──▶ ...      │
│  └──────────┘    └──────┘     └──────────┘             │
│       │              │              │                   │
│       │         ┌────▼────┐    ┌───▼───┐               │
│       │         │ DROPOFF │    │DROPOFF│               │
│       │         └─────────┘    └───────┘               │
│                                           ┌────────┐   │
│                                      ──▶  │SIGNUP  │   │
│                                           │(Conv)  │   │
│                                           └────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Sessions: 1,247  |  Bounce: 34%  |  Avg sections: 4.2  |  Conv: 3.1%  │
└─────────────────────────────────────────────────────────┘
```

### Node Types

1. **Entry Node** (left side, green left border)
   - Aggregates all landing sources
   - Shows total sessions count
   - Click to see UTM/referrer breakdown

2. **Section Nodes** (center, vertically stacked in page order)
   - One node per section type that received views
   - Shows: section name, view count, avg dwell (seconds)
   - Border thickness proportional to view count relative to total sessions
   - Click to see detail panel

3. **Conversion Node** (right side, accent blue border + subtle glow)
   - Shows total signups
   - Shows conversion rate
   - Click to see signup source breakdown

4. **Dropoff Indicators** (below each section node)
   - Red-tinted edges leaving each section node downward
   - Label shows dropoff count and percentage
   - Dropoff = sessions that viewed this section but no subsequent section and didn't convert

### Edges

- **Forward edges**: Animated directional arrows from Entry → sections → sections
- **Thickness**: Proportional to transition count between nodes
- **Color**: Default border color, accent blue for paths that lead to conversion
- **Labels**: Show transition count on hover
- **Dropoff edges**: Red-tinted, fade out downward

### Detail Panel (slides in from right on node click)

For **Section Nodes**:
- Section name + total views
- Avg dwell time (seconds)
- Click breakdown (which CTAs, how many clicks each)
- Conversion rate from this section (users who saw this AND converted)
- Device breakdown (mobile/tablet/desktop bar)
- Dropoff rate from this section

For **Entry Node**:
- Total sessions
- UTM source breakdown (bar chart)
- UTM medium breakdown
- Referrer breakdown (bar chart)
- Device type breakdown
- Direct vs. referred ratio

For **Conversion Node**:
- Total signups
- Last section viewed before signup (which section drove the conversion)
- UTM source of converting users
- Device breakdown of converting users
- Avg sections viewed before converting

### Bottom Summary Strip

Always visible, shows:
- Total sessions in time range
- Bounce rate (sessions with only page_view, no section_view)
- Avg sections viewed per session
- Overall conversion rate

---

## Data Source

All data comes from the `ab_events` Supabase table. Relevant columns:

| Column | Usage |
|--------|-------|
| `session_id` | Links events into user journeys |
| `variant_id` | Filter by A/B variant |
| `event_type` | page_view, section_view, element_click, signup_complete |
| `section_name` | Which section was viewed/clicked |
| `element_id` | Which specific element was clicked |
| `dwell_ms` | Time spent in section |
| `device_type` | mobile/tablet/desktop |
| `referrer` | Traffic source URL |
| `utm_source` | Campaign source |
| `utm_medium` | Campaign medium |
| `utm_campaign` | Campaign name |
| `created_at` | Timestamp for ordering and time range filtering |

### Session Reconstruction Query

```sql
SELECT session_id, event_type, section_name, element_id,
       dwell_ms, device_type, referrer, utm_source, utm_medium,
       utm_campaign, created_at, variant_id
FROM ab_events
WHERE created_at >= NOW() - INTERVAL '{days} days'
  AND (variant_id = '{variantFilter}' OR '{variantFilter}' = 'all')
ORDER BY session_id, created_at
```

Client-side processing groups by `session_id` and reconstructs:
1. Entry source (first event's UTM/referrer)
2. Section sequence (ordered section_view events)
3. Clicks within sections (element_click events)
4. Outcome (signup_complete present → converted, otherwise dropped off after last section)
5. Transition counts between consecutive sections

### API Endpoint

`GET /api/admin/analytics/flow?days=30&device=all&variant=all`

Returns:
```typescript
interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
  summary: FlowSummary
  entryBreakdown: EntryBreakdown
}

interface FlowNode {
  id: string               // 'entry' | 'signup' | section name
  type: 'entry' | 'section' | 'conversion' | 'dropoff'
  label: string
  views: number
  avgDwellMs: number
  clickRate: number
  dropoffCount: number
  dropoffRate: number
  conversionRate: number   // % of viewers who eventually converted
}

interface FlowEdge {
  source: string
  target: string
  count: number
  isConversionPath: boolean
}

interface FlowSummary {
  totalSessions: number
  bounceRate: number
  avgSectionsViewed: number
  conversionRate: number
}

interface EntryBreakdown {
  utmSources: { name: string; count: number }[]
  utmMediums: { name: string; count: number }[]
  referrers: { name: string; count: number }[]
  devices: { name: string; count: number }[]
}
```

---

## Libraries

- **@xyflow/react** (React Flow v12) — node graph rendering, custom nodes/edges, viewport controls
- **recharts** (already installed) — bar/pie charts in detail panel

No other new dependencies needed.

---

## Component Structure

```
src/app/admin/analytics/flow/
  page.tsx                    — Server component, renders FlowDashboard
  _components/
    flow-dashboard.tsx        — Client component, orchestrates everything
    flow-canvas.tsx           — React Flow canvas with custom nodes/edges
    flow-controls.tsx         — Time range, device filter, variant selector
    flow-summary-strip.tsx    — Bottom summary metrics
    detail-panel.tsx          — Slide-out panel on node click
    nodes/
      entry-node.tsx          — Custom React Flow node for entry
      section-node.tsx        — Custom React Flow node for sections
      conversion-node.tsx     — Custom React Flow node for signup
      dropoff-node.tsx        — Custom React Flow node for dropoff
    edges/
      flow-edge.tsx           — Custom animated edge
      dropoff-edge.tsx        — Custom red fade-out edge

src/lib/admin/
  flow-queries.ts             — Supabase queries + session reconstruction
  flow-types.ts               — TypeScript types for flow data

src/app/api/admin/analytics/
  flow/route.ts               — API endpoint for flow data
```

---

## Design System Compliance

- Background: `#0D0D0D`
- Node surfaces: frosted glass (`rgba(10,10,10,0.70)` + backdrop-blur + `1px solid rgba(255,255,255,0.08)`)
- Accent: `#597794` — used only on conversion node border and conversion path edges
- Entry node: green-tinted left border (`#4A7C59`)
- Dropoff: red-tinted (`#7C4A4A`)
- Fonts: Mohave for node labels/metrics, Kosugi for captions
- All text left-aligned within nodes
- Border radius: 4px on nodes (sharp, per design system)
- No shadows — borders only
- Animations: `ease [0.22, 1, 0.36, 1]`, no spring/bounce
- Edge animations: subtle pulse using CSS keyframes on opacity

---

## Interaction Model

1. **Page load**: Fetch flow data for default range (30d), all devices, all variants
2. **Filter change**: Re-fetch with new params via TanStack Query
3. **Node click**: Slide detail panel from right (250ms, ease-smooth)
4. **Node hover**: Highlight connected edges, dim others
5. **Edge hover**: Show transition count tooltip
6. **Pan/zoom**: React Flow built-in viewport controls
7. **Detail panel close**: Click X or click canvas background

---

## Navigation Integration

Add "User Flow" tab to the existing analytics page's SubTabs, alongside "Website Traffic" and "Vercel Projects". This keeps all analytics in one place.

Alternatively, since the flow visualization needs full viewport width for the canvas, it may work better as a standalone page at `/admin/analytics/flow` linked from the analytics page header.

**Decision**: Standalone page. The canvas needs maximum screen space. Add a link/button on the main analytics page.
