/**
 * OPSStyle.ts — web token mirror of the canonical OPS design system (spec v2, 2026-04-17).
 *
 * Canonical source: /.interface-design/system.md at the repo root. Keep this file
 * in sync with iOS OPSStyle.swift and ops-site/src/lib/theme.ts.
 *
 * Kosugi + Bebas Neue deprecated 2026-04-17. Former Kosugi roles now use
 * JetBrains Mono; Cake Mono Light carries the uppercase display voice.
 */

export const OPSStyle = {
  // =====================================================================
  // COLORS
  // =====================================================================
  Colors: {
    // Brand — primary CTA + focus ring ONLY
    primaryAccent: '#6F94B0',        // was #597794 — steel blue

    // Canvas
    background: '#000000',           // pure black, no off-black
    darkBackground: '#000000',
    cardBackground: '#0A0A0A',       // (legacy — prefer glass)
    cardBackgroundDark: '#000000',   // (legacy — prefer glass)

    // Text ladder
    primaryText: '#EDEDED',          // was #E5E5E5
    secondaryText: '#B5B5B5',        // was #A0A0A0
    tertiaryText: '#8A8A8A',         // was #6B6B6B
    inactiveText: '#6A6A6A',         // was #444444 — now aligns with textMute
    textMute: '#6A6A6A',             // decorative ONLY — // slashes, separators
    placeholderText: '#8A8A8A',      // was #6B6B6B

    // Borders
    cardBorder: 'rgba(255, 255, 255, 0.10)',      // was 0.12 — aligned to spec
    cardBorderSubtle: 'rgba(255, 255, 255, 0.09)', // glass-border
    inputFieldBorder: 'rgba(255, 255, 255, 0.10)',
    separator: 'rgba(255, 255, 255, 0.10)',
    subtleBackground: 'rgba(255, 255, 255, 0.05)',

    // Status colors — Thermal Map palette from spec v2
    status: {
      rfq: '#8F9AA3',         // was #BCBCBC
      estimated: '#B6AC97',   // was #B5A381
      accepted: '#8FA577',    // was #9DB582
      inProgress: '#D99A3E',  // was #8195B5
      completed: '#BA7458',   // was #B58289
      closed: '#8C6A57',      // was #E9E9E9
      archived: '#4E4B48',    // was #A1B582
    } as Record<string, string>,

    // Earth-tone semantic
    olive: '#9DB582',          // success / completed / nominal
    tan: '#C4A868',            // attention / warning / site visit
    rose: '#B58289',           // error / overdue / cost
    brick: '#93321A',          // destructive borders/dots ONLY

    // Legacy semantic aliases — values shifted to spec
    successStatus: '#9DB582',  // was #A5B368 — now olive
    warningStatus: '#C4A868',
    errorStatus: '#93321A',    // brick for borders; use `rose` for text

    // Financial
    finRevenue: '#C4A868',
    finProfit: '#9DB582',
    finCost: '#B58289',
    finReceivables: '#D4A574',
    finOverdue: '#93321A',

    // Surfaces (transparent fills)
    surfaceInput: 'rgba(255, 255, 255, 0.04)',
    surfaceHover: 'rgba(255, 255, 255, 0.05)',
    surfaceActive: 'rgba(255, 255, 255, 0.08)',

    // Overlays
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    imageOverlay: 'rgba(0, 0, 0, 0.7)',

    // Materials (glass per spec)
    materials: {
      ultraThin: {
        background: 'rgba(18, 18, 20, 0.58)',
        blur: 28,
        borderColor: 'rgba(255, 255, 255, 0.09)',
      },
      dense: {
        background: 'rgba(18, 18, 20, 0.78)',
        blur: 28,
        borderColor: 'rgba(255, 255, 255, 0.09)',
      },
    },

    // Calendar — today highlight uses accent at 0.5
    todayHighlight: 'rgba(111, 148, 176, 0.5)',
  },

  // =====================================================================
  // TYPOGRAPHY
  // =====================================================================
  Typography: {
    // Display voice — Cake Mono Light (always weight 300)
    pageTitle:    { family: 'var(--font-cakemono)', size: 22, weight: 300 },
    display:      { family: 'var(--font-cakemono)', size: 30, weight: 300 },
    section:      { family: 'var(--font-cakemono)', size: 18, weight: 300 },
    buttonLabel:  { family: 'var(--font-cakemono)', size: 14, weight: 300 },
    badgeCake:    { family: 'var(--font-cakemono)', size: 11, weight: 300 },

    // Tactical / data voice — JetBrains Mono
    panelTitle:   { family: 'var(--font-mono)', size: 11, weight: 400 },
    dataValueLg:  { family: 'var(--font-mono)', size: 20, weight: 500 },
    dataValue:    { family: 'var(--font-mono)', size: 13, weight: 400 },
    category:     { family: 'var(--font-mono)', size: 11, weight: 400 },
    metadata:     { family: 'var(--font-mono)', size: 11, weight: 400 },

    // Body / narrative — Mohave
    hero:         { family: 'var(--font-mohave)', size: 80, weight: 300 },
    largeTitle:   { family: 'var(--font-mohave)', size: 32, weight: 700 },
    title:        { family: 'var(--font-mohave)', size: 28, weight: 600 },
    body:         { family: 'var(--font-mohave)', size: 16, weight: 400 },
    bodyBold:     { family: 'var(--font-mohave)', size: 16, weight: 500 },
    bodyEmphasis: { family: 'var(--font-mohave)', size: 16, weight: 600 },
    smallBody:    { family: 'var(--font-mohave)', size: 14, weight: 300 },
    cardTitle:    { family: 'var(--font-mohave)', size: 18, weight: 500 },
    cardBody:     { family: 'var(--font-mohave)', size: 14, weight: 400 },

    // Legacy roles (value-updated) — Kosugi replaced by JetBrains Mono
    subtitle:     { family: 'var(--font-mono)', size: 22, weight: 400 },
    caption:      { family: 'var(--font-mono)', size: 14, weight: 400 },
    captionBold:  { family: 'var(--font-mono)', size: 14, weight: 500 },
    smallCaption: { family: 'var(--font-mono)', size: 12, weight: 400 },
    cardSubtitle: { family: 'var(--font-mono)', size: 15, weight: 400 },
    status:       { family: 'var(--font-mono)', size: 12, weight: 500 },
    button:       { family: 'var(--font-mohave)', size: 16, weight: 400 },
    smallButton:  { family: 'var(--font-mohave)', size: 14, weight: 500 },
  },

  // =====================================================================
  // LAYOUT
  // =====================================================================
  Layout: {
    // 8pt grid spacing
    spacing1: 4,
    spacing2: 8,
    spacing3: 16,
    spacing4: 24,
    spacing5: 32,

    // Touch targets — mobile 56pt minimum (spec)
    touchTargetMin: 44,
    touchTargetStandard: 56,
    touchTargetLarge: 64,

    // Radii — sharp, tactical
    panelRadius: 10,          // cards, widgets
    modalRadius: 12,          // modals, popovers, toasts
    buttonRadius: 5,          // buttons, inputs
    chipRadius: 4,            // tags, badges, chips
    progressBarRadius: 2,     // funnel bars, progress tracks
    sidebarHoverRadius: 6,    // sidebar hover background

    // Legacy radii aliases (values updated to spec v2)
    cornerRadius: 5,
    smallCornerRadius: 4,     // was 4 — chipRadius
    cardCornerRadius: 10,     // was 8 — panelRadius
    largeCornerRadius: 12,

    // Opacity presets
    Opacity: {
      subtle: 0.1,
      light: 0.3,
      medium: 0.5,
      strong: 0.7,
      heavy: 0.9,
    },
  },

  // =====================================================================
  // ANIMATION — single easing curve, no spring
  // =====================================================================
  Animation: {
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    // Durations (ms)
    durationHover: 150,
    durationPanel: 200,
    durationPage: 250,
    durationStagger: 300,
    durationFlip: 350,
    durationCountUp: 800,
    // Legacy CSS aliases
    standard: '0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    quick: '0.15s cubic-bezier(0.22, 1, 0.36, 1)',
  },

  // =====================================================================
  // STATUS LABELS
  // =====================================================================
  StatusLabels: {
    rfq: 'RFQ',
    estimated: 'ESTIMATED',
    accepted: 'ACCEPTED',
    inProgress: 'IN PROGRESS',
    completed: 'COMPLETED',
    closed: 'CLOSED',
    archived: 'ARCHIVED',
  } as Record<string, string>,
} as const

/** Helper: get CSS font properties from a Typography token */
export function fontStyle(token: { family: string; size: number; weight: number }) {
  return {
    fontFamily: token.family,
    fontSize: token.size,
    fontWeight: token.weight,
  } as const
}

/** Helper: get status color by key */
export function statusColor(status: string): string {
  return OPSStyle.Colors.status[status] ?? OPSStyle.Colors.textMute
}
