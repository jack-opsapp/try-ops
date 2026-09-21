'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUp, Camera, CheckCircle2, ChevronRight, Circle, FileText, ImagePlus, MapPin, Receipt, X } from 'lucide-react'
import { Action, Avatar, Badge, SamplePhoto, Section } from './DemoPrimitives'
import { SAMPLE } from './lifecycle-data'
import type { CrewMember, SceneProps } from './lifecycle-state'
import styles from './project-scenes.module.css'

type ProjectTab = 'activity' | 'details' | 'expenses'
const TABS: ProjectTab[] = ['activity', 'details', 'expenses']
const ROSTER: CrewMember[] = ['Pete', 'Nick']

/** Fixture-only rendering of native ProjectDetailsView and ActivityTabView.
 * Task state, photographs and the submitted note are owned by the lifecycle
 * reducer. Changing tabs never changes that durable work. */
export function ProjectScenes({ state, dispatch }: SceneProps) {
  const [tab, setTab] = useState<ProjectTab>('activity')
  const [photo, setPhoto] = useState<'before' | 'after' | null>(null)
  const [taskOpen, setTaskOpen] = useState(false)
  const [teamPickerOpen, setTeamPickerOpen] = useState(false)
  const [crewDraft, setCrewDraft] = useState<CrewMember[]>([])
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([])
  const photoDialog = useRef<HTMLDialogElement>(null)
  const photoOpener = useRef<HTMLButtonElement | null>(null)
  const photoClose = useRef<HTMLButtonElement>(null)
  const isCrew = state.scene === 'crew' || state.scene === 'compose'
  const isCompose = state.scene === 'compose'
  const hasPosted = Boolean(state.postedNote)
  const isWorkday = state.furthest >= 6
  const crewName = state.assignedCrew[0] || SAMPLE.crew
  const crewNames = state.assignedCrew.join(' + ')
  const crewRail = <span className={styles.crewNames}>{state.assignedCrew.map(name => <Avatar key={name} name={name} />)}<span>{crewNames}</span></span>

  useEffect(() => {
    setTab('activity')
    setTaskOpen(false)
    setTeamPickerOpen(false)
    setPhoto(null)
  }, [state.scene])

  useEffect(() => {
    if (photo && !photoDialog.current?.open) {
      photoDialog.current?.showModal()
      photoClose.current?.focus()
    }
    if (!photo && photoDialog.current?.open) photoDialog.current.close()
  }, [photo])

  function openPhoto(which: 'before' | 'after', opener: HTMLButtonElement) {
    photoOpener.current = opener
    setPhoto(which)
  }

  function restorePhotoFocus() {
    setPhoto(null)
    if (photoOpener.current?.isConnected) photoOpener.current.focus()
  }

  function toggleTeamPicker() {
    if (!teamPickerOpen) setCrewDraft([...state.assignedCrew])
    setTeamPickerOpen(value => !value)
  }

  function commitTeam() {
    dispatch({ type: 'ASSIGN_CREW', members: crewDraft })
    setTeamPickerOpen(false)
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    let next = (index + offset + TABS.length) % TABS.length
    if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = TABS.length - 1
    else if (!offset) return
    event.preventDefault()
    setTab(TABS[next])
    tabButtons.current[next]?.focus()
  }

  const gallery = <div className={styles.gallery} aria-label="Project photos">
    <div className={styles.galleryHeading}><span>{hasPosted ? '2 photos' : '1 photo'}</span></div>
    <div className={styles.photoRail}>
      {hasPosted && <button className={styles.galleryTile} onClick={event => openPhoto('after', event.currentTarget)} aria-label="View completion photo">
        <SamplePhoto src={SAMPLE.afterPhoto} alt="Completed cafe patio with new pavers" sizes="72px" />
      </button>}
      <button className={styles.galleryTile} onClick={event => openPhoto('before', event.currentTarget)} aria-label="View site visit photo">
        <SamplePhoto src={SAMPLE.beforePhoto} alt="The existing patio documented at the site visit" sizes="72px" />
      </button>
    </div>
  </div>

  const visitRecord = <details className={styles.visitRecord}>
    <summary>
      <Avatar name={SAMPLE.estimator} />
      <div className={styles.recordText}><div><strong>{SAMPLE.estimator}</strong><time>Sep 22</time></div><span>completed a site visit</span></div>
      <Badge tone="tan">Site visit</Badge>
      <div className={styles.recordSummary}><span>1 photo · Checklist · Notes</span><ChevronRight aria-hidden="true" /></div>
    </summary>
    <div className={styles.recordBody}>
      <p className={styles.recordLabel}>Site visit record</p>
      <dl className={styles.recordFields}><div><dt>Client</dt><dd>{SAMPLE.client}</dd></div><div><dt>Area</dt><dd className={styles.numeric}>{SAMPLE.measurement}</dd></div><div><dt>Scope</dt><dd>{SAMPLE.scope}</dd></div><div><dt>Access</dt><dd>{SAMPLE.access}</dd></div></dl>
      <div className={styles.recordChecks}><span><CheckCircle2 aria-hidden="true" /> Measurements recorded</span><span><CheckCircle2 aria-hidden="true" /> Access confirmed</span><span><CheckCircle2 aria-hidden="true" /> Site photo attached</span></div>
      <button className={styles.recordPhoto} onClick={event => openPhoto('before', event.currentTarget)} aria-label="Open photo from site visit record"><SamplePhoto src={SAMPLE.beforePhoto} alt="Original patio condition recorded by Mike" /></button>
    </div>
  </details>

  const crewPost = <article className={styles.crewPost} aria-label={`${crewName}'s completion update`}>
    <div className={styles.author}><Avatar name={crewName} /><div><strong>{crewName}</strong><time>just now</time></div></div>
    <p className={styles.postText}>{state.postedNote}</p>
    <button className={styles.completionPhoto} onClick={event => openPhoto('after', event.currentTarget)} aria-label={`Open ${crewName}'s completed patio photo`}><SamplePhoto src={SAMPLE.afterPhoto} alt={`The completed patio ${crewName} shared with the team`} sizes="80px" /></button>
  </article>

  function openComposer() {
    setTab('activity')
    if (state.scene === 'crew' && state.taskCompleted) dispatch({ type: 'OPEN_COMPOSER' })
  }

  const composer = isCompose ? <section className={styles.composer} aria-label="Post a crew update">
    <div className={styles.composeAuthor}><Avatar name={crewName} /><span>Posting as {crewName}</span></div>
    {state.completionPhoto && <div className={styles.attachedPhoto}><SamplePhoto src={SAMPLE.afterPhoto} alt={`Completion photo attached to ${crewName}'s update`} sizes="80px" /><span><CheckCircle2 aria-hidden="true" /> Photo attached</span></div>}
    <label className={styles.noteLabel} htmlFor="crew-update">Project note</label>
    <textarea id="crew-update" value={state.noteDraft} maxLength={280} rows={3} onChange={event => dispatch({ type: 'SET_NOTE', value: event.target.value })} aria-describedby="crew-note-help" />
    <div className={styles.composeActions}>
      <button className={styles.attachButton} onClick={() => dispatch({ type: 'ADD_COMPLETION_PHOTO' })} disabled={state.completionPhoto}><Camera aria-hidden="true" /><span>{state.completionPhoto ? 'Photo attached' : 'Attach completion photo'}</span></button>
      <Action disabled={!state.completionPhoto || !state.noteDraft.trim()} onClick={() => dispatch({ type: 'POST_NOTE' })} aria-label="Post crew update"><ArrowUp aria-hidden="true" />Post</Action>
    </div>
    <p id="crew-note-help" className={styles.composeHelp}>{state.completionPhoto ? 'The photo and note stay together on this project.' : 'Use the sample job photo. No camera access needed.'}</p>
  </section> : isCrew && state.taskCompleted ? <button className={styles.composerEntry} onClick={openComposer}><Camera aria-hidden="true" /><span>Write a note...</span><ArrowUp aria-hidden="true" /></button> : <details className={styles.composerContext}><summary className={styles.composerEntry} aria-label="About project notes in this sample"><Camera aria-hidden="true" /><span>Write a note...</span><ArrowUp aria-hidden="true" /></summary><p>{hasPosted ? 'The crew’s note is below. In OPS, your team can keep the conversation going here.' : 'Your crew will use this field to post the finished photo and a note later in this sample.'}</p></details>

  return <div className={styles.project} data-project-scene={state.scene}>
    <header className={styles.header}>
      <div className={styles.navLine}><span>Project</span>{state.crewAssigned && <button className={styles.selectedTask} onClick={() => { setTab('details'); setTaskOpen(true) }} aria-label="View selected task"><span className={styles.taskBadges}><Badge>{SAMPLE.task}</Badge>{state.taskCompleted && <Badge tone="olive"><CheckCircle2 aria-hidden="true" />Complete</Badge>}</span><ChevronRight aria-hidden="true" /></button>}</div>
      <h2>{SAMPLE.project}</h2><p>{SAMPLE.company}</p>
      <div className={styles.location}><MapPin aria-hidden="true" /><span>{SAMPLE.address}</span></div>
    </header>

    <div className={styles.tabs} role="tablist" aria-label="Project sections">
      {TABS.map((item, index) => <button key={item} ref={element => { tabButtons.current[index] = element }} id={`project-tab-${item}`} type="button" role="tab" aria-selected={tab === item} aria-controls={`project-panel-${item}`} tabIndex={tab === item ? 0 : -1} onClick={() => setTab(item)} onKeyDown={event => navigateTabs(event, index)}>{item}</button>)}
    </div>

    <div className={styles.panel} id={`project-panel-${tab}`} role="tabpanel" aria-labelledby={`project-tab-${tab}`} tabIndex={0}>
      {tab === 'activity' && <div className={styles.activity}>
        {gallery}{composer}{hasPosted && crewPost}{visitRecord}
        {state.scene === 'project' && !state.crewAssigned && <Action className={styles.detailsAction} onClick={() => setTab('details')}>Assign the installation crew<ChevronRight aria-hidden="true" /></Action>}
      </div>}

      {tab === 'details' && <div className={styles.details}>
        <Section title="Details"><dl className={styles.document}>
          <div><dt>Status</dt><dd><Badge>{isWorkday ? 'In progress' : 'Accepted'}</Badge></dd></div>
          <div><dt>Client</dt><dd>{SAMPLE.client}<span>{SAMPLE.company}</span></dd></div>
          <div><dt>Address</dt><dd>{SAMPLE.address}</dd></div>
          <div><dt>Timeline</dt><dd className={styles.numeric}>{isWorkday ? SAMPLE.workday : 'Unscheduled'}</dd></div>
          <div><dt>Notes</dt><dd>—</dd></div>
          <div><dt>Team</dt><dd>{state.crewAssigned ? crewRail : '—'}</dd></div>
        </dl></Section>
        <Section title="Tasks"><div className={styles.tasks}>
          <div className={styles.taskRow}><div className={styles.taskName}><Badge>Patio preparation</Badge>{isWorkday && <Badge tone="olive">Complete</Badge>}<span>From approved estimate</span></div><FileText className={styles.taskSource} aria-hidden="true" /></div>
          <button className={styles.taskRow} onClick={() => { setTaskOpen(value => !value); setTeamPickerOpen(false) }} aria-label="Open patio installation task" aria-expanded={taskOpen} aria-controls="installation-task-detail"><div className={styles.taskName}><Badge>{SAMPLE.task}</Badge>{state.taskCompleted && <Badge tone="olive">Complete</Badge>}<span>{state.crewAssigned ? crewNames : 'From approved estimate'}</span></div><div className={styles.taskDate}><span>{isWorkday ? 'Sep 24' : 'Unscheduled'}</span><ChevronRight aria-hidden="true" /></div></button>
          {taskOpen && <div id="installation-task-detail" className={styles.taskDetail}>
            <dl><div><dt>Schedule</dt><dd>{isWorkday ? SAMPLE.workday : 'Unscheduled'}</dd></div><div><dt>Team</dt><dd>{state.crewAssigned ? crewRail : <button className={styles.assignTeam} onClick={toggleTeamPicker} aria-label="Assign team to this task" aria-expanded={teamPickerOpen} aria-controls="installation-team-picker">Assign team<ChevronRight aria-hidden="true" /></button>}</dd></div><div><dt>Notes</dt><dd>—</dd></div></dl>
            {teamPickerOpen && <section id="installation-team-picker" className={styles.teamPicker} aria-label="Choose installation crew">
              <div className={styles.teamCommit}><Action secondary onClick={() => setTeamPickerOpen(false)}>Cancel</Action><Action onClick={commitTeam} disabled={crewDraft.length === 0}>Done</Action></div>
              {ROSTER.map(name => <button key={name} className={styles.teamMember} aria-label={name} aria-pressed={crewDraft.includes(name)} onClick={() => setCrewDraft(members => members.includes(name) ? members.filter(member => member !== name) : [...members, name])}>{crewDraft.includes(name) ? <CheckCircle2 aria-hidden="true" /> : <Circle aria-hidden="true" />}<Avatar name={name} /><span><strong>{name}</strong><span>Crew</span></span></button>)}
            </section>}
          </div>}
          {state.crewAssigned && !isWorkday && <p className={styles.assignedFeedback} role="status"><CheckCircle2 aria-hidden="true" />Crew assigned. Ready to schedule.</p>}
        </div></Section>
      </div>}

      {tab === 'expenses' && <div className={styles.expenses}><Section title="Project expenses"><div className={styles.expenseEmpty}><Receipt aria-hidden="true" /><h3>No expenses recorded</h3><p>Receipts and job costs stay with this project.</p><p className={styles.expenseContext}>The approved estimate includes materials. An estimate is not an expense.</p></div></Section></div>}
    </div>

    {isCrew && !isCompose && <div className={styles.actionDock}>
      {state.taskCompleted ? <><span className={styles.completedStatus} role="status"><CheckCircle2 aria-hidden="true" />Task complete</span><Action onClick={openComposer}><ImagePlus aria-hidden="true" />Post a photo update</Action></> : <><span className={styles.selectedLabel}>Selected task<span>{SAMPLE.task}</span></span><Action onClick={() => dispatch({ type: 'COMPLETE_TASK' })}><CheckCircle2 aria-hidden="true" />Complete</Action></>}
    </div>}

    <dialog ref={photoDialog} className={styles.photoDialog} onCancel={() => setPhoto(null)} onClose={restorePhotoFocus} onKeyDown={event => { if (event.key === 'Tab') { event.preventDefault(); photoClose.current?.focus() } }} aria-label={photo === 'after' ? 'Completion photo' : 'Site visit photo'}>
      <div className={styles.viewerHeader}><span>{photo === 'after' ? 'Completion photo' : 'Site visit photo'}</span><button ref={photoClose} type="button" onClick={() => setPhoto(null)} aria-label="Close photo"><X aria-hidden="true" /></button></div>
      {photo && <SamplePhoto src={photo === 'after' ? SAMPLE.afterPhoto : SAMPLE.beforePhoto} alt={photo === 'after' ? 'Completed cafe patio with new pavers' : 'Original patio recorded at the site visit'} />}
      <p>{photo === 'after' ? state.postedNote || SAMPLE.note : SAMPLE.scope}</p>
    </dialog>
  </div>
}
