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
  const base = `font-mohave font-medium text-ops-body uppercase tracking-[0.03em] rounded-ops cursor-pointer inline-flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''}`

  const variants = {
    primary:
      'bg-ops-accent text-ops-text-primary px-8 py-4 hover:brightness-110',
    outline:
      'bg-transparent border-2 border-ops-border-emphasis text-ops-text-secondary px-8 py-[14px] hover:border-ops-text-primary hover:text-ops-text-primary',
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
