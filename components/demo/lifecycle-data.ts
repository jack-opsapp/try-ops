/** Fictional sample company. No customer records or live product services. */
export const SAMPLE = {
  client: 'Alex Morgan', company: 'Cedar Lane Cafe', project: 'Cedar Lane patio',
  address: '184 Cedar Lane', owner: 'You', estimator: 'Mike', crew: 'Pete',
  visit: 'Tue, Sep 22 · 10:00 AM', workday: 'Thu, Sep 24 · 8:00 AM',
  scope: 'Replace the cracked patio with large-format pavers.',
  measurement: '24 × 12 ft · 288 sq ft',
  access: 'Use the side gate. Keep the cafe entrance clear.',
  task: 'Patio installation', estimateNumber: 'EST-00142', invoiceNumber: 'INV-00142',
  preparation: 800, installation: 1600, labor: 2400, materials: 1800, total: 4200,
  beforePhoto: '/images/demo/patio-site.png', afterPhoto: '/images/demo/patio-complete.png',
  note: 'Patio finished. Joints checked, site cleaned, and the cafe entrance is clear.',
} as const
export const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
