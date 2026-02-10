'use client'

import { motion } from 'framer-motion'

interface ProjectFolderProps {
  color?: string
  isOpen?: boolean
  label?: string
  subtitle?: string
  className?: string
}

export function ProjectFolder({ color = '#FFFFFF', isOpen = false, label, subtitle, className = '' }: ProjectFolderProps) {
  const svg = (
    <motion.svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={className}
      initial={false}
      animate={{
        scale: isOpen ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      {/* Folder body */}
      <motion.rect
        x="10"
        y="30"
        width="100"
        height="60"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={false}
        animate={{
          opacity: 1,
        }}
      />

      {/* Folder tab */}
      <motion.path
        d="M 10 30 L 10 20 L 50 20 L 55 30 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={false}
        animate={{
          opacity: 1,
        }}
      />

      {/* Label text centered on folder body */}
      {label && (
        <text
          x="60"
          y={subtitle ? 65 : 68}
          textAnchor="middle"
          fill={color}
          fontFamily="var(--font-mohave)"
          fontWeight="500"
          fontSize="11"
          letterSpacing="0.05em"
        >
          {label}
        </text>
      )}

      {/* Subtitle: task count with list icon (inside folder body, below label) */}
      {subtitle && (
        <>
          <g opacity="0.7">
            <rect x="49" y="73" width="7" height="8" rx="1" stroke={color} strokeWidth="0.7" fill="none" />
            <line x1="51" y1="75.5" x2="54.5" y2="75.5" stroke={color} strokeWidth="0.5" />
            <line x1="51" y1="78" x2="54.5" y2="78" stroke={color} strokeWidth="0.5" />
          </g>
          <text
            x="63"
            y="80"
            textAnchor="middle"
            fill={color}
            fontFamily="var(--font-kosugi)"
            fontSize="10"
            opacity="0.7"
          >
            {subtitle}
          </text>
        </>
      )}

      {/* Folder opening indicator (subtle lines inside when open) */}
      {isOpen && (
        <>
          <motion.line
            x1="20"
            y1="50"
            x2="30"
            y2="50"
            stroke={color}
            strokeWidth="1"
            opacity="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.2 }}
          />
          <motion.line
            x1="20"
            y1="60"
            x2="30"
            y2="60"
            stroke={color}
            strokeWidth="1"
            opacity="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.3 }}
          />
          <motion.line
            x1="20"
            y1="70"
            x2="30"
            y2="70"
            stroke={color}
            strokeWidth="1"
            opacity="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.4 }}
          />
        </>
      )}
    </motion.svg>
  )

  return svg
}
