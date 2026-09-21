import type { LifecycleState, Scene } from './lifecycle-state'
export const CHAPTERS = ['The inquiry', 'Site visit', 'The estimate', 'Assign the work', 'Work complete', 'Get it billed']
const CREW_CHAPTERS = ['Your job', 'Your update', 'Team record']
const COPY: Record<Scene, { chapter: number; time: string; title: string; body: string; hint: string }> = {
  role: { chapter: 0, time: 'ONE SAMPLE JOB · YOUR SIDE OF THE TEAM', title: 'Choose your role.', body: 'A job from first contact to finished work. See the part you play.', hint: 'Choose Operator or Crew to begin.' },
  inquiry: { chapter: 0, time: 'MONDAY · CUSTOMER INQUIRY', title: 'The job starts in your inbox.', body: 'Alex needs the deck resurfaced. The conversation, lead and agreed visit are already together.', hint: 'Open the assignment for the booked visit.' },
  booked: { chapter: 1, time: 'TUESDAY · VISIT BOOKED', title: 'Put the right person on it.', body: 'Assign the visit to yourself or someone on your team.', hint: 'Choose a person, then confirm the assignment.' },
  visit: { chapter: 1, time: 'TUESDAY · YOUR SITE VISIT', title: 'Capture it once.', body: 'You’re at Alex’s home. Confirm the scope and add the site photo.', hint: 'Confirm the scope, then tap PHOTO.' },
  review: { chapter: 1, time: 'TUESDAY AFTERNOON · SITE RECORD', title: 'The site record is together.', body: 'The checklist, photo and measurements stay with this job.', hint: 'Review the record, then continue to the estimate.' },
  estimate: { chapter: 2, time: 'LATER · QUOTE PREPARED', title: 'Turn the scope into a quote.', body: 'The sample quote is prepared. Review it before sending it to Alex.', hint: 'Send the sample estimate when you’re ready.' },
  accepted: { chapter: 2, time: 'WEDNESDAY · CLIENT ACCEPTED', title: 'You’ve got the go-ahead.', body: 'Alex has accepted. Open the project with the original visit attached.', hint: 'Mark the estimate approved.' },
  project: { chapter: 3, time: 'WEDNESDAY · PLAN THE WORK', title: 'Give the crew the whole picture.', body: 'The visit record and labor tasks came with the project. Assign the resurfacing crew.', hint: 'Open DETAILS, then the resurfacing task.' },
  crew: { chapter: 0, time: 'THURSDAY · FINISHING THE WORK', title: 'The job. Right in front of you.', body: 'You have the original visit record and your assigned task. The resurfacing work is finished.', hint: 'Mark your task COMPLETE.' },
  compose: { chapter: 1, time: 'THURSDAY · YOUR UPDATE', title: 'Show the work. Leave the proof.', body: 'Attach the finished photo and post your update for the team.', hint: 'Attach the sample photo, then post your note.' },
  activity: { chapter: 4, time: 'THURSDAY AFTERNOON · WORK COMPLETE', title: 'You didn’t have to ask.', body: 'Your crew’s finished photo and update are here. Every task on this job is complete.', hint: 'The job is ready to bill. Review the amount.' },
  billing: { chapter: 5, time: 'LATER · READY TO BILL', title: 'Finished work. Ready to invoice.', body: 'The completed job and accepted estimate are together. Review the amount and create the invoice.', hint: 'Create the sample invoice from the approved estimate.' },
}
export function sceneCopy(state: LifecycleState) {
  const copy = { ...COPY[state.scene], role: state.role === 'crew' ? 'YOU · CREW' : state.role === 'operator' ? 'YOU · OPERATOR' : 'CHOOSE YOUR ROLE', chapters: state.role === 'crew' ? CREW_CHAPTERS : CHAPTERS }
  if (state.scene === 'review' && state.visitAssignee !== 'You') {
    copy.title = `${state.visitAssignee}’s visit is in.`
    copy.body = 'Your teammate completed the visit. Review the photo, checklist and measurements from your own screen.'
  }
  if (state.scene === 'activity' && state.role === 'crew') {
    copy.chapter = 2; copy.title = 'Your work. On the record.'
    copy.body = 'Your photo and update are together on the project, ready for the team.'
    copy.hint = 'That’s your part. Get OPS for your next job.'
  }
  if (state.scene === 'billing' && state.invoiceCreated) {
    copy.title = 'Ready for the client.'
    copy.body = 'The invoice was created from the job’s approved estimate. Your project record stays together.'
    copy.hint = state.paymentRecorded ? 'The sample payment is recorded. Try OPS with your own team.' : 'Try OPS with your own jobs. Payment recording and accounting are optional below.'
  }
  return copy
}
