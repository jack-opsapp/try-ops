'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AccordionItemProps {
  question: string
  answer: string
  onToggle?: (expanded: boolean) => void
}

export function AccordionItem({ question, answer, onToggle }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    onToggle?.(next)
  }

  return (
    <div
      className={`bg-ops-card border rounded-ops-card mb-2 lg:mb-4 cursor-pointer transition-colors duration-300 ${
        isOpen ? 'border-ops-gray-300' : 'border-ops-border hover:border-ops-gray-300'
      }`}
      onClick={toggle}
      role="button"
      aria-expanded={isOpen}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-5">
        <span className="font-mohave font-medium text-[14px] lg:text-[16px] text-ops-gray-50 pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-ops-gray-300 flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 2L8.5 6L4.5 10" />
          </svg>
        </motion.span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="font-kosugi text-[13px] lg:text-[16px] text-ops-text-secondary leading-relaxed px-4 pb-4 lg:px-6 lg:pb-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
