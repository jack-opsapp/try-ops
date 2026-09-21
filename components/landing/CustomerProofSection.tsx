import type { z } from 'zod'
import type { CustomerProofSectionPropsSchema } from '@/lib/ab/types'
import { getApprovedTestimonials } from '@/lib/landing/testimonials'

/** Copy and attribution can only come from the source-reviewed proof registry. */
export function CustomerProofSection({ heading, proofIds }: z.infer<typeof CustomerProofSectionPropsSchema>) {
  const testimonials = getApprovedTestimonials(proofIds)
  if (testimonials.length === 0) return null

  return <section id="customer-proof" className="landing-section landing-customer-proof" aria-labelledby="customer-proof-heading">
    <div className="landing-container customer-proof-layout">
      <h2 id="customer-proof-heading">{heading}</h2>
      <div className="customer-proof-list">
        {testimonials.map(proof => <figure className="customer-proof-quote" key={proof.id}>
          <blockquote cite={proof.sourceUrl}>
            <p>{proof.quote.split(/(\d+(?:[.,]\d+)*)/g).map((part, index) => index % 2 === 1
              ? <span className="landing-number" key={index}>{part}</span>
              : part)}</p>
          </blockquote>
          <figcaption>
            <div className="customer-proof-person">
              <span className="customer-proof-name">{proof.name}</span>
              <span className="customer-proof-role">{proof.role}</span>
            </div>
            {proof.sourceUrl && <a href={proof.sourceUrl} target="_blank" rel="noopener noreferrer">View source<span className="sr-only"> for {proof.name}’s quote</span></a>}
          </figcaption>
        </figure>)}
      </div>
    </div>
  </section>
}
