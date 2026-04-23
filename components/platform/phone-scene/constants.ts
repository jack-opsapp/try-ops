/**
 * Wireframe constants — every value maps to OPSStyle tokens.
 * See design spec: docs/superpowers/specs/2026-03-19-3d-iphone-hero-design.md
 */

// --- Canvas Dimensions ---
// Arbitrary resolution chosen for sharp rendering on the 3D texture.
// Proportional to iPhone 15 Pro aspect ratio but not its literal resolution.
export const CANVAS_WIDTH = 750;
export const CANVAS_HEIGHT = 1540;
export const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT; // ~0.487

// --- Colors (from OPSStyle) ---
export const COLORS = {
  background: '#0A0A0A',
  cardFill: 'rgba(255, 255, 255, 0.06)',    // Subtle lift from background — boosted for 3D texture visibility
  border: 'rgba(255, 255, 255, 0.18)',       // Card outlines — boosted for 3D readability
  separator: 'rgba(255, 255, 255, 0.15)',    // Divider lines — boosted for 3D readability

  // Content line opacities (replacing text hierarchy)
  titleLine: 'rgba(255, 255, 255, 0.80)',    // textPrimary mapped — boosted
  bodyLine: 'rgba(255, 255, 255, 0.50)',     // textSecondary mapped — boosted
  captionLine: 'rgba(255, 255, 255, 0.30)', // tertiaryText mapped — boosted

  // Accent
  accent: '#6F94B0',                          // primaryAccent
  accentGlow: 'rgba(111, 148, 176, 0.3)',     // For pin radial glow

  // Status/stage colors (kanban columns, task borders)
  stageEstimated: '#8195B5',                  // Pipeline "Quoting" blue
  stageAccepted: '#A5B368',                   // StatusSuccess olive
  stageInProgress: '#C4A868',                 // StatusWarning gold
  stageCompleted: '#B58289',                  // AccountingCost rose

  // Carousel dots
  dotInactive: 'rgba(255, 255, 255, 0.50)',  // pageIndicatorInactive
  dotActive: 'rgba(255, 255, 255, 0.80)',    // pageIndicatorActive

  // Segment control
  segmentFill: 'rgba(255, 255, 255, 0.90)',  // Selected segment (white)
  segmentText: 'rgba(0, 0, 0, 0.80)',        // Text on selected segment
} as const;

// --- Layout Constants ---
export const LAYOUT = {
  padding: 40,             // Screen edge padding (~16pt at canvas scale)
  cardRadius: 6,           // 3pt * ~2x scale (OPSStyle.Layout.cornerRadius = 3pt)
  smallRadius: 8,          // ~3pt at canvas scale (OPSStyle standardCornerRadius)
  borderWidth: 1.5,           // Boosted for 3D readability
  thickBorder: 3,            // For title-weight lines — boosted
  coloredBorderWidth: 8,   // 4pt colored left borders at canvas scale
  iconCircleSize: 56,      // ~28pt icon button circles at canvas scale
  tabBarHeight: 120,       // Bottom tab bar zone height
  tabBarY: CANVAS_HEIGHT - 120, // Y position where tab bar starts
  tabIconSize: 44,         // Tab icon size at canvas scale
  dotSize: 10,             // Carousel dot diameter
  pinSize: 16,             // Map pin circle diameter
} as const;

// --- Timing (from OPSStyle animation curves) ---
export const TIMING = {
  drawInDuration: 600,     // Total draw-in animation (ms)
  fadeOutDuration: 150,    // Screen fade out on tab switch (ms)
  structurePhase: [0, 0.5],    // 0-300ms: structural lines
  contentPhase: [0.33, 0.83],  // 200-500ms: content lines
  accentPhase: [0.67, 1.0],   // 400-600ms: color accents
  // OPSStyle easeOut: [0.22, 1, 0.36, 1]
  easeOut: (t: number): number => {
    // Approximate cubic-bezier(0.22, 1, 0.36, 1) via easeOutQuart.
    // Fast departure, soft landing — matches OPSStyle standard entry.
    const clamped = Math.min(1, Math.max(0, t)); // Clamp input to [0,1] to prevent non-terminating loops
    const t1 = 1 - clamped;
    return 1 - t1 * t1 * t1 * t1;
  },
};

// --- Tab Definitions ---
export type TabId = 'home' | 'jobboard' | 'schedule' | 'settings';

export const TABS: { id: TabId; index: number }[] = [
  { id: 'home', index: 0 },
  { id: 'jobboard', index: 1 },
  { id: 'schedule', index: 2 },
  { id: 'settings', index: 3 },
];

export const DEFAULT_TAB: TabId = 'home';
