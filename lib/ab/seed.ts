/** Legacy lifetime-counter seeding is retired. New tests require a declared
 * baseline/sample and exact approved section IDs through the authenticated
 * prepare operation. This script deliberately cannot enroll an experiment. */
throw new Error('Legacy A/B seed is retired. Use the authenticated experiment prepare operation with a measured baseline and approved content.')
export {}
