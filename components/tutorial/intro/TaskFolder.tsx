'use client'

import { motion } from 'framer-motion'

interface TaskFolderProps {
  color?: string
  isActive?: boolean
  scale?: number
  className?: string
}

export function TaskFolder({
  color = '#888888',
  isActive = false,
  scale = 1,
  className = '',
}: TaskFolderProps) {
  return (
    <motion.svg
      width="60"
      height="50"
      viewBox="0 0 60 50"
      fill="none"
      className={className}
      initial={false}
      animate={{
        scale: isActive ? 1.2 * scale : scale,
      }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      {/* Small folder */}
      <motion.rect
        x="5"
        y="15"
        width="50"
        height="30"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={false}
        animate={{
          stroke: color,
          opacity: 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Folder tab */}
      <motion.path
        d="M 5 15 L 5 10 L 25 10 L 28 15 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={false}
        animate={{
          stroke: color,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  )
}
