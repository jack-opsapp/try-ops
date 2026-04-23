'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer id="footer" className="relative border-t border-white/10 bg-ops-background py-16 lg:py-20 overflow-hidden">
      {/* Solar horizon glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]">
        <div className="absolute inset-0 rounded-full bg-ops-accent/[0.06] blur-[100px]" />
        <div className="absolute inset-[15%] rounded-full bg-ops-accent/[0.04] blur-[80px]" />
        <div className="absolute inset-[30%] rounded-full bg-ops-accent/[0.03] blur-[60px]" />
      </div>

      <motion.div
        className="relative max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Logo + tagline */}
          <div className="lg:flex-1">
            <Image
              src="/brand/ops-mark.svg"
              alt="OPS"
              width={60}
              height={24}
              className="object-contain mb-3"
            />
            <p className="font-mono text-[14px] text-ops-text-secondary italic">
              Built by trades, for trades.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ops-text-secondary mb-4">
              PRODUCT
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Features', action: () => scrollTo('solution') },
                { label: 'Pricing', action: () => scrollTo('pricing') },
                { label: 'Roadmap', action: () => scrollTo('roadmap') },
                { label: 'Download', href: 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078' },
              ].map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mohave text-[14px] text-ops-text-secondary hover:text-white hover:underline transition-colors leading-10"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={link.action}
                      className="font-mohave text-[14px] text-ops-text-secondary hover:text-white hover:underline transition-colors leading-10"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ops-text-secondary mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'About', href: 'https://opsapp.co/company' },
                { label: 'Support', href: 'https://opsapp.co/resources' },
                { label: 'Privacy Policy', href: 'https://opsapp.co/legal?page=privacy' },
                { label: 'Terms of Service', href: 'https://opsapp.co/legal?page=terms' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-mohave text-[14px] text-ops-text-secondary hover:text-white hover:underline transition-colors leading-10"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect links */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ops-text-secondary mb-4">
              CONNECT
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'App Store', href: 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078' },
                { label: 'Web App', href: 'https://try.opsapp.co/tutorial-intro' },
                { label: 'Instagram', href: 'https://instagram.com/opsapp.co' },
                { label: 'LinkedIn', href: 'https://linkedin.com/company/opsapp' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mohave text-[14px] text-ops-text-secondary hover:text-white hover:underline transition-colors leading-10"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/ops-mark.svg"
              alt="OPS"
              width={36}
              height={14}
              className="object-contain opacity-50"
            />
            <p className="font-mono text-[12px] text-ops-text-secondary">
              &copy; 2026 OPS. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <a href="https://opsapp.co/legal?page=privacy" className="font-mohave text-[12px] text-ops-text-secondary hover:text-white transition-colors">
              Privacy
            </a>
            <a href="https://opsapp.co/legal?page=terms" className="font-mohave text-[12px] text-ops-text-secondary hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}
