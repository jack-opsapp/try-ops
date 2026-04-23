/**
 * OpsLogo — responsive lockup/mark with smooth collapse animation.
 *
 * Mirrors ops-site/src/components/brand/OpsLogo.tsx. Renders the full lockup
 * inside a width-constrained container; when `collapsed={true}` the container
 * shrinks to mark-only width and the SVG's own position doesn't move — so the
 * mark stays anchored at the left and the wordmark wipes in/out from the right.
 *
 * Inherits `fill="currentColor"` from parent CSS. Easing + duration per spec v2.
 */

'use client';

import * as React from 'react';

const LOCKUP_VB_W = 2405.66;
const LOCKUP_VB_H = 1511.21;
const LOCKUP_ASPECT = LOCKUP_VB_W / LOCKUP_VB_H; // ~1.591
const MARK_END_VB_X = 870; // mark ends at 827; +43 of gap for visual balance
const MARK_COLLAPSED_ASPECT = MARK_END_VB_X / LOCKUP_VB_H; // ~0.576

export interface OpsLogoProps {
  size?: number;
  collapsed?: boolean;
  durationMs?: number;
  title?: string;
  className?: string;
}

export const OpsLogo = React.forwardRef<HTMLSpanElement, OpsLogoProps>(
  (
    { size = 48, collapsed = false, durationMs = 300, title = 'OPS', className },
    ref
  ) => {
    const labelId = React.useId();
    const lockupWidth = size * LOCKUP_ASPECT;
    const markOnlyWidth = size * MARK_COLLAPSED_ASPECT;
    const containerWidth = collapsed ? markOnlyWidth : lockupWidth;

    return (
      <span
        ref={ref}
        role="img"
        aria-labelledby={labelId}
        className={className}
        style={{
          display: 'inline-block',
          width: `${containerWidth}px`,
          height: `${size}px`,
          overflow: 'hidden',
          transition: `width ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          verticalAlign: 'middle',
        }}
      >
        <span
          id={labelId}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {title}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${LOCKUP_VB_W} ${LOCKUP_VB_H}`}
          width={lockupWidth}
          height={size}
          fill="currentColor"
          aria-hidden
          focusable="false"
          style={{ display: 'block' }}
        >
          {/* Mark — always fully opaque, stays anchored at left */}
          <g>
            <path d="M826.84,778.71v-350.91s-233.86-116.97-233.86-116.97h0l-175.42,87.71.1.05,292.23,146.15v292.4s.04.02.04.02l116.92-58.46Z" />
            <path d="M707.58,1119.3h.02v-.06l-292.32-146.2-.08-292.37-116.66,58.43-.09.05-.2,350.79.09.05,233.83,116.94.06.04,175.36-87.67Z" />
          </g>
          {/* Wordmark "OPS" — fades opacity alongside the container wipe */}
          <g
            style={{
              opacity: collapsed ? 0 : 1,
              transition: `opacity ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            <path d="M1129.61,931.61v-344.67c0-69.09,41-97.18,110.84-97.18h74.4c69.84,0,110.84,28.09,110.84,97.18v344.67c0,69.09-41,97.18-110.84,97.18h-74.4c-69.84,0-110.84-28.09-110.84-97.18ZM1308.78,974.13c44.03,0,55.42-13.67,55.42-56.18v-317.34c0-42.51-11.39-56.18-55.42-56.18h-62.25c-44.03,0-55.42,13.67-55.42,56.18v317.34c0,42.51,11.39,56.18,55.42,56.18h62.25Z" />
            <path d="M1503.12,494.32h164.74c70.6,0,110.84,28.09,110.84,97.18v129.06c0,69.09-40.24,97.18-110.84,97.18h-103.25v208.02h-61.49V494.32ZM1663.31,763.83c40.24,0,54.66-15.18,54.66-53.9v-107.8c0-38.72-14.42-53.9-54.66-53.9h-98.69v215.61h98.69Z" />
            <path d="M1820.46,931.61v-70.6h61.49v56.94c0,42.51,11.39,56.18,55.42,56.18h53.14c44.03,0,55.42-13.67,55.42-56.18v-33.4c0-27.33-9.11-41.75-27.33-55.42l-139.69-94.9c-33.4-22.02-50.87-48.59-50.87-95.66v-51.62c0-69.09,40.24-97.18,110.84-97.18h51.62c69.85,0,110.84,28.09,110.84,97.18v70.6h-61.49v-56.94c0-42.51-11.39-56.18-55.42-56.18h-39.48c-44.03,0-56.18,13.67-56.18,56.18v31.13c0,27.33,9.11,41.76,28.09,54.66l138.93,94.9c33.4,22.78,51.62,49.35,51.62,96.42v53.9c0,69.09-41,97.18-110.84,97.18h-65.29c-69.85,0-110.84-28.09-110.84-97.18Z" />
          </g>
        </svg>
      </span>
    );
  }
);

OpsLogo.displayName = 'OpsLogo';
