'use client'

import Image from 'next/image'

export function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer id="footer" className="border-t border-ops-border bg-ops-background py-16 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Logo + tagline */}
          <div className="lg:flex-1">
            <Image
              src="/images/ops-logo-white.png"
              alt="OPS"
              width={60}
              height={24}
              className="object-contain mb-3"
            />
            <p className="font-kosugi text-[14px] text-ops-gray-300 italic">
              Built by trades, for trades.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-mohave font-medium text-[12px] uppercase text-ops-gray-300 tracking-wider mb-4">
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
                      className="font-kosugi text-[14px] text-ops-text-secondary hover:text-ops-text-primary hover:underline transition-colors leading-10"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={link.action}
                      className="font-kosugi text-[14px] text-ops-text-secondary hover:text-ops-text-primary hover:underline transition-colors leading-10"
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
            <h4 className="font-mohave font-medium text-[12px] uppercase text-ops-gray-300 tracking-wider mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'About', href: '#' },
                { label: 'Contact', href: 'mailto:jackson@opsapp.co' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-kosugi text-[14px] text-ops-text-secondary hover:text-ops-text-primary hover:underline transition-colors leading-10"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-ops-border mt-10 pt-6">
          <p className="font-kosugi text-[12px] text-ops-text-secondary">
            &copy; 2026 OPS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
