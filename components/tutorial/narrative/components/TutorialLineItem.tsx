'use client'

import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { formatCurrency, STATUS_COLORS, type LineItem } from '../NarrativeTutorialData'

interface TutorialLineItemProps {
  item: LineItem
}

const STRIPE_COLORS: Record<string, string> = {
  labor: OPSStyle.Colors.successStatus,
  material: STATUS_COLORS.inactive,
}

/**
 * Estimate line item row.
 * Left color stripe (3px, rounded) → type badge → name → amount.
 * Labor gets green stripe. Material gets gray.
 */
export function TutorialLineItem({ item }: TutorialLineItemProps) {
  const stripeColor = STRIPE_COLORS[item.type] ?? OPSStyle.Colors.primaryAccent

  return (
    <div className="flex items-center gap-2.5" role="listitem">
      {/* Color stripe — 3px wide, 32px tall */}
      <div
        className="flex-shrink-0 rounded-sm"
        style={{
          width: 3,
          height: 32,
          backgroundColor: stripeColor,
        }}
      />

      {/* Type badge — uppercase, tinted background */}
      <span
        className="flex-shrink-0 uppercase"
        style={{
          ...fontStyle(OPSStyle.Typography.status),
          color: stripeColor,
          backgroundColor: `${stripeColor}26`,
          padding: '2px 6px',
          borderRadius: OPSStyle.Layout.smallCornerRadius,
        }}
      >
        {item.type === 'labor' ? 'LABOR' : 'MATERIAL'}
      </span>

      {/* Name */}
      <span
        className="flex-1"
        style={{
          ...fontStyle(OPSStyle.Typography.body),
          color: OPSStyle.Colors.primaryText,
        }}
      >
        {item.name}
      </span>

      {/* Amount — right-aligned, bold */}
      <span
        style={{
          ...fontStyle(OPSStyle.Typography.bodyBold),
          color: OPSStyle.Colors.primaryText,
        }}
      >
        {formatCurrency(item.amount)}
      </span>
    </div>
  )
}
