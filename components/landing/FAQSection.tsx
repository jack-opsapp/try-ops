import type { z } from 'zod'
import type { FAQSectionPropsSchema } from '@/lib/ab/types'

export function FAQSection({ heading = 'BEFORE YOU START.', faqs }: z.infer<typeof FAQSectionPropsSchema>) {
  return <section id="faq" className="landing-section"><div className="landing-container faq-layout"><h2>{heading}</h2><div className="faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div></section>
}
