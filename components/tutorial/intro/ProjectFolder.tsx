'use client'

import { motion } from 'framer-motion'

interface ProjectFolderProps {
  color?: string
  label?: string
  className?: string
}

export function ProjectFolder({ color = '#FFFFFF', label, className = '' }: ProjectFolderProps) {
  return (
    <motion.svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={className}
      initial={false}
    >
      {/* Folder body */}
      <rect
        x="10"
        y="30"
        width="100"
        height="60"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Folder tab */}
      <path
        d="M 10 30 L 10 20 L 50 20 L 55 30 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Label text centered vertically in folder body */}
      {label && (
        <text
          x="60"
          y="63"
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
    </motion.svg>
  )
}
