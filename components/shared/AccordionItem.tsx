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
      className={`bg-ops-card border rounded-ops-card mb-4 cursor-pointer transition-colors duration-300 ${
        isOpen ? 'border-ops-accent' : 'border-ops-border hover:border-ops-accent'
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
      <div className="flex items-center justify-between px-6 py-5">
        <span className="font-mohave font-medium text-[16px] text-white pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-ops-accent text-[16px] flex-shrink-0"
        >
          &#9654;
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
            <p className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed px-6 pb-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
