export const INDUSTRIES = [
  'Architecture',
  'Bricklaying',
  'Cabinetry',
  'Carpentry',
  'Ceiling Installations',
  'Concrete Finishing',
  'Consulting',
  'Crane Operation',
  'Deck Construction',
  'Deck Surfacing',
  'Demolition',
  'Drywall',
  'Electrical',
  'Excavation',
  'Flooring',
  'Glazing',
  'HVAC',
  'Insulation',
  'Landscaping',
  'Masonry',
  'Metal Fabrication',
  'Millwrighting',
  'Painting',
  'Plumbing',
  'Railings',
  'Rebar',
  'Renovations',
  'Roofing',
  'Scaffolding',
  'Sheet Metal',
  'Siding',
  'Stonework',
  'Surveying',
  'Tile Setting',
  'Vinyl Deck Membranes',
  'Waterproofing',
  'Welding',
  'Windows',
  'Other',
] as const

export type Industry = (typeof INDUSTRIES)[number]

export const COMPANY_SIZES = ['1-2', '3-5', '6-10', '11-20', '20+'] as const
export type CompanySize = (typeof COMPANY_SIZES)[number]

export const COMPANY_AGES = ['<1', '1-2', '2-5', '5-10', '10+'] as const
export type CompanyAge = (typeof COMPANY_AGES)[number]
