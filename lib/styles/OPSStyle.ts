/**
 * OPSStyle.ts — Exact port of iOS OPSStyle.swift + Fonts.swift
 *
 * This is the single source of truth for design tokens on web.
 * Every value comes directly from the iOS codebase — do NOT improvise.
 */

export const OPSStyle = {
  // =====================================================================
  // COLORS  (from OPSStyle.swift → Colors enum + Asset Catalog comments)
  // =====================================================================
  Colors: {
    // Brand
    primaryAccent: '#59779F',        // Blue — web primary accent (per CLAUDE.md brand guide)
    secondaryAccent: '#417394',      // Blue   — AccentSecondary

    // Backgrounds
    background: '#000000',           // Main background (black)
    darkBackground: '#090C15',       // Darker background
    cardBackground: '#1A1A1A',       // Card background (dark gray)
    cardBackgroundDark: '#0D0D0D',   // Darker card background (used by section selector, etc.)

    // Text
    primaryText: '#FFFFFF',          // White  — TextPrimary
    secondaryText: '#AAAAAA',        // Light gray — TextSecondary
    tertiaryText: '#777777',         // Darker gray — TextTertiary
    inactiveText: '#555555',         // Dark gray — TextInactive
    placeholderText: '#999999',      // Medium gray

    // Borders
    cardBorder: 'rgba(255,255,255,0.2)',
    cardBorderSubtle: 'rgba(255,255,255,0.05)',
    inputFieldBorder: 'rgba(255,255,255,0.2)',
    separator: 'rgba(255,255,255,0.15)',
    subtleBackground: 'rgba(255,255,255,0.1)',

    // Status colors (from xcassets)
    status: {
      rfq: '#BCBCBC',
      estimated: '#B5A381',
      accepted: '#9DB582',
      inProgress: '#8195B5',
      completed: '#B58289',
      closed: '#E9E9E9',
      archived: '#A182B5',
    } as Record<string, string>,

    // Semantic status
    successStatus: '#A5B368',        // Muted green (app-specific)
    warningStatus: '#C4A868',        // Amber
    errorStatus: '#931A32',          // Deep red

    // Overlays
    modalOverlay: 'rgba(0,0,0,0.5)',
    imageOverlay: 'rgba(0,0,0,0.7)',

    // Calendar
    todayHighlight: 'rgba(255,119,51,0.5)', // primaryAccent at 0.5
  },

  // =====================================================================
  // TYPOGRAPHY  (from Fonts.swift — exact font-family, size, weight)
  // =====================================================================
  Typography: {
    // Title fonts (Mohave)
    largeTitle:   { family: 'var(--font-mohave)', size: 32, weight: 700 },   // Mohave-Bold
    title:        { family: 'var(--font-mohave)', size: 28, weight: 600 },   // Mohave-SemiBold
    subtitle:     { family: 'var(--font-kosugi)', size: 22, weight: 400 },   // Kosugi-Regular

    // Body fonts (Mohave)
    body:         { family: 'var(--font-mohave)', size: 16, weight: 400 },   // Mohave-Regular
    bodyBold:     { family: 'var(--font-mohave)', size: 16, weight: 500 },   // Mohave-Medium
    bodyEmphasis: { family: 'var(--font-mohave)', size: 16, weight: 600 },   // Mohave-SemiBold

    // Supporting text (Kosugi)
    caption:      { family: 'var(--font-kosugi)', size: 14, weight: 400 },   // Kosugi-Regular
    captionBold:  { family: 'var(--font-kosugi)', size: 14, weight: 400 },   // Kosugi-Regular (same as caption in iOS)
    smallCaption: { family: 'var(--font-kosugi)', size: 12, weight: 400 },   // Kosugi-Regular

    // Other
    smallBody:    { family: 'var(--font-mohave)', size: 14, weight: 300 },   // Mohave-Light
    cardTitle:    { family: 'var(--font-mohave)', size: 18, weight: 500 },   // Mohave-Medium
    cardSubtitle: { family: 'var(--font-kosugi)', size: 15, weight: 400 },   // Kosugi-Regular
    cardBody:     { family: 'var(--font-mohave)', size: 14, weight: 400 },   // Mohave-Regular
    status:       { family: 'var(--font-mohave)', size: 12, weight: 500 },   // Mohave-Medium
    button:       { family: 'var(--font-mohave)', size: 16, weight: 400 },   // Mohave-Regular
    smallButton:  { family: 'var(--font-mohave)', size: 14, weight: 500 },   // Mohave-Medium
  },

  // =====================================================================
  // LAYOUT  (from OPSStyle.swift → Layout enum)
  // =====================================================================
  Layout: {
    // Spacing scale
    spacing1: 4,
    spacing2: 8,
    spacing3: 16,
    spacing4: 24,
    spacing5: 32,

    // Touch targets
    touchTargetMin: 44,
    touchTargetStandard: 56,
    touchTargetLarge: 64,

    // Corner radius
    cornerRadius: 5,
    buttonRadius: 5,
    smallCornerRadius: 2.5,
    cardCornerRadius: 8,
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
  // ANIMATION  (from OPSStyle.swift → Animation enum)
  // =====================================================================
  Animation: {
    standard: '0.3s ease-in-out',
    quick: '0.15s ease-out',
  },

  // =====================================================================
  // STATUS LABELS  (from Status enum displayName)
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
  return OPSStyle.Colors.status[status] ?? '#417394'
}
