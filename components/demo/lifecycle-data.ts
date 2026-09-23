/** Fictional sample company. No customer records or live product services. */
export const SAMPLE = {
  client: 'Alex Morgan', company: 'Morgan residence', project: '184 Cedar Lane',
  address: '184 Cedar Lane', owner: 'You', estimator: 'Mike', crew: 'Pete',
  visit: 'Tue, Sep 22 · 10:00 AM', workday: 'Thu, Sep 24 · 8:00 AM',
  scope: 'Replace worn cedar boards with composite decking and matching fascia. Retain the existing framing, stairs and railing.',
  measurement: '16 × 12 ft · 192 sq ft',
  access: 'Use the side gate. Keep the driveway clear.',
  task: 'Deck resurfacing', estimateNumber: 'EST-00142', invoiceNumber: 'INV-00142',
  preparation: 800, installation: 1600, labor: 2400, materials: 1800, total: 4200,
  beforePhoto: '/images/demo/deck-site.png', afterPhoto: '/images/demo/deck-complete.png',
  note: 'Composite decking and fascia finished. Fasteners checked and the site cleaned. Driveway clear.',
} as const
export const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
