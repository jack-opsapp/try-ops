'use client'

import { motion } from 'framer-motion'

interface ProjectFolderProps {
  color?: string
  label?: string
  className?: string
  dissolve?: boolean
}

export function ProjectFolder({ color = '#FFFFFF', label, className = '', dissolve = false }: ProjectFolderProps) {
  const dissolveTransition = { duration: 1.2, ease: [0.4, 0, 0.2, 1] as const }

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
        animate={{ pathLength: dissolve ? 0 : 1 }}
        transition={dissolveTransition}
      />

      {/* Folder tab */}
      <motion.path
        d="M 10 30 L 10 20 L 50 20 L 55 30 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={false}
        animate={{ pathLength: dissolve ? 0 : 1 }}
        transition={{ ...dissolveTransition, delay: dissolve ? 0.15 : 0 }}
      />

      {/* Label text centered vertically in folder body */}
      {label && (
        <motion.text
          x="60"
          y="63"
          textAnchor="middle"
          fill={color}
          fontFamily="var(--font-mohave)"
          fontWeight="500"
          fontSize="11"
          letterSpacing="0.05em"
          initial={false}
          animate={{ opacity: dissolve ? 0 : 1 }}
          transition={{ duration: 0.6, delay: dissolve ? 0.3 : 0 }}
        >
          {label}
        </motion.text>
      )}
    </motion.svg>
  )
}
