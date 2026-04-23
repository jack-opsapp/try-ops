'use client'

import { motion } from 'framer-motion'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  onClick?: () => void
  href?: string
  className?: string
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  href,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const base = `font-mono uppercase tracking-[0.15em] text-xs rounded-[3px] cursor-pointer inline-flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''}`

  const variants = {
    primary:
      'bg-white text-[#0A0A0A] px-6 py-3 hover:bg-white/90',
    outline:
      'bg-transparent border border-ops-gray-300 text-ops-gray-200 px-6 py-3 hover:border-white hover:text-white',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  const motionProps = {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
  }

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        {...motionProps}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      className={classes}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
}
