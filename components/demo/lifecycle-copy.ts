import type { Scene } from './lifecycle-state'
export const CHAPTERS = ['The inquiry', 'On site', 'Job ready', 'The crew', 'Your view'] as const
export const SCENE_COPY: Record<Scene, { chapter: number; role: string; time: string; title: string; body: string; hint: string }> = {
  inquiry: { chapter: 0, role: 'OWNER', time: 'MONDAY · THE INQUIRY', title: 'The job starts in your inbox.', body: 'Your customer emails. OPS brings the lead and conversation together.', hint: 'Open the visit agreed in this conversation.' },
  booked: { chapter: 0, role: 'OWNER', time: 'TUESDAY · VISIT BOOKED', title: 'You agreed a time. It’s on the schedule.', body: 'An agreed appointment becomes a site visit, with an estimator assigned.', hint: 'Step into Mike’s site visit.' },
  visit: { chapter: 1, role: 'ESTIMATOR · MIKE', time: 'TUESDAY · ON SITE', title: 'Capture it once.', body: 'The scope and access notes are ready. Add the site photo to complete the visit record.', hint: 'Tap PHOTO, then DONE.' },
  review: { chapter: 1, role: 'ESTIMATOR · MIKE', time: 'TUESDAY · VISIT REVIEW', title: 'A proper brief. Already together.', body: 'Photos, measurements and checklist answers stay attached to this job.', hint: 'Review the record, then complete the visit.' },
  estimate: { chapter: 2, role: 'OWNER', time: 'LATER · ESTIMATE PREPARED', title: 'The scope becomes the job.', body: 'You’ve prepared the quote. Alex has accepted. Mark it approved to open the project.', hint: 'Tap MARK APPROVED.' },
  project: { chapter: 2, role: 'OWNER', time: 'WEDNESDAY · PLANNING THE WORK', title: 'The crew gets the whole picture.', body: 'The visit record and labor tasks came with the project. Assign your installation crew in Details.', hint: 'Open DETAILS, then Patio installation to assign the crew.' },
  crew: { chapter: 3, role: 'CREW · PETE', time: 'THURSDAY · SCHEDULED WORKDAY', title: 'Now you’re on the crew.', body: 'Pete has the same site photo and instructions. The installation is finished.', hint: 'Mark the selected task COMPLETE.' },
  compose: { chapter: 3, role: 'CREW · PETE', time: 'THURSDAY · FINISHING UP', title: 'Show the work. Leave the proof.', body: 'Add the finished photo and post your update to the project.', hint: 'Attach the sample photo, then post the note.' },
  activity: { chapter: 4, role: 'OWNER', time: 'THURSDAY · BACK IN YOUR VIEW', title: 'You didn’t have to ask.', body: 'Pete’s photo. His update. The original visit. One project record, ready when you need it.', hint: 'That’s the handoff. Try it with your own crew.' },
  billing: { chapter: 4, role: 'OWNER', time: 'LATER · THE BOOKS', title: 'Close the loop.', body: 'The invoice belongs to the same job. Alex paid by bank transfer. Record it here.', hint: 'Record the payment received outside OPS.' },
}
