'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUp, Camera, CheckCircle2, ChevronRight, Circle, FileText, ImagePlus, MapPin, Receipt, X } from 'lucide-react'
import { NumericText, Action, Avatar, Badge, SamplePhoto, Section } from './DemoPrimitives'
import { SAMPLE } from './lifecycle-data'
import type { CrewMember, SceneProps } from './lifecycle-state'
import styles from './project-scenes.module.css'
import { CharacterCard } from './CharacterCard'

type ProjectTab = 'activity' | 'details' | 'expenses'
type GuidanceTarget = 'task' | 'detail' | 'assign' | 'picker' | 'done'
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
  const nextTask = useRef<HTMLButtonElement>(null)
  const taskDetail = useRef<HTMLDivElement>(null)
  const assignTeam = useRef<HTMLButtonElement>(null)
  const teamPicker = useRef<HTMLElement>(null)
  const teamCommit = useRef<HTMLDivElement>(null)
  const pendingGuidance = useRef<{ target: GuidanceTarget; focus: boolean } | null>(null)
  const [guidanceRequest, setGuidanceRequest] = useState(0)
  const photoDialog = useRef<HTMLDialogElement>(null)
  const photoOpener = useRef<HTMLButtonElement | null>(null)
  const photoClose = useRef<HTMLButtonElement>(null)
  const isCrew = state.scene === 'crew' || state.scene === 'compose'
  const isCompose = state.scene === 'compose'
  const nextProjectTab = state.scene === 'project' && !state.crewAssigned && tab !== 'details' ? 'details' : isCompose && tab !== 'activity' ? 'activity' : null
  const hasPosted = Boolean(state.postedNote)
  const isWorkday = state.role === 'crew' || state.visited.includes('calendar')
  const crewName = state.role === 'crew' ? 'You' : state.assignedCrew[0] || SAMPLE.crew
  const visitAuthor = state.visitAssignee || SAMPLE.estimator
  const crewNames = state.role === 'crew' ? 'You' : state.assignedCrew.join(' + ')
  const crewRail = <span className={styles.crewNames}>{state.role === 'crew' ? <Avatar name="You" /> : state.assignedCrew.map(name => <Avatar key={name} name={name} />)}<span>{crewNames}</span></span>

  useEffect(() => {
    pendingGuidance.current = null
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

  // A reveal request comes only from a visitor action. Ordinary rerenders,
  // restored progress and read-only tab changes never take over scrolling.
  function guideTo(target: GuidanceTarget, focus = true) {
    pendingGuidance.current = { target, focus }
    setGuidanceRequest(value => value + 1)
  }

  useEffect(() => {
    const request = pendingGuidance.current
    if (!request) return
    if (document.visibilityState === 'hidden') {
      pendingGuidance.current = null
      return
    }
    if (tab !== 'details') { pendingGuidance.current = null; return }
    const targets: Record<GuidanceTarget, HTMLElement | null> = {
      task: nextTask.current,
      detail: taskDetail.current,
      assign: assignTeam.current,
      picker: teamPicker.current,
      done: teamCommit.current?.querySelector<HTMLButtonElement>('[data-demo-next="true"]') ?? null,
    }
    const target = targets[request.target]
    if (!target) return
    pendingGuidance.current = null
    if (request.focus) target.focus({ preventScroll: true })
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    target.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: request.target === 'picker' ? 'start' : 'center', inline: 'nearest' })
  }, [guidanceRequest, tab, taskOpen, teamPickerOpen, state.crewAssigned])

  function selectTab(next: ProjectTab, keepTabFocus = false) {
    setTab(next)
    if (next === 'details' && state.scene === 'project' && !state.crewAssigned) {
      guideTo(teamPickerOpen ? 'picker' : taskOpen ? 'assign' : 'task', !keepTabFocus)
    }
  }

  function toggleTask() {
    setTaskOpen(value => !value)
    setTeamPickerOpen(false)
    if (!taskOpen) guideTo(state.crewAssigned ? 'detail' : 'assign')
  }

  function toggleTeamPicker() {
    if (!teamPickerOpen) {
      setCrewDraft([...state.assignedCrew])
      guideTo('picker')
    } else guideTo('assign')
    setTeamPickerOpen(value => !value)
  }

  function selectCrew(name: CrewMember) {
    const members = crewDraft.includes(name) ? crewDraft.filter(member => member !== name) : [...crewDraft, name]
    setCrewDraft(members)
    // Reveal the confirmation once, when the first person is selected. Further
    // roster edits stay under the visitor's control.
    if (crewDraft.length === 0 && members.length > 0) guideTo('done')
  }

  function commitTeam() {
    if (crewDraft.length === 0) return
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
    selectTab(TABS[next], true)
    tabButtons.current[next]?.focus()
  }

  const gallery = <div className={styles.gallery} aria-label="Project photos">
    <div className={styles.galleryHeading}><span>{hasPosted ? '2 photos' : '1 photo'}</span></div>
    <div className={styles.photoRail}>
      {hasPosted && <button className={styles.galleryTile} onClick={event => openPhoto('after', event.currentTarget)} aria-label="View completion photo">
        <SamplePhoto src={SAMPLE.afterPhoto} alt="Completed residential deck with composite boards and matching fascia" sizes="72px" />
      </button>}
      <button className={styles.galleryTile} onClick={event => openPhoto('before', event.currentTarget)} aria-label="View site visit photo">
        <SamplePhoto src={SAMPLE.beforePhoto} alt="The existing deck documented at the site visit" sizes="72px" />
      </button>
    </div>
  </div>

  const visitRecord = <details className={styles.visitRecord}>
    <summary>
      <Avatar name={visitAuthor} />
      <div className={styles.recordText}><div><strong>{visitAuthor}</strong><time>Sep 22</time></div><span>completed a site visit</span></div>
      <Badge tone="tan">Site visit</Badge>
      <div className={styles.recordSummary}><span>1 photo · Checklist · Notes</span><ChevronRight aria-hidden="true" /></div>
    </summary>
    <div className={styles.recordBody}>
      <p className={styles.recordLabel}>Site visit record</p>
      <dl className={styles.recordFields}><div><dt>Client</dt><dd>{SAMPLE.client}</dd></div><div><dt>Area</dt><dd className={styles.numeric}>{SAMPLE.measurement}</dd></div><div><dt>Scope</dt><dd>{SAMPLE.scope}</dd></div><div><dt>Access</dt><dd>{SAMPLE.access}</dd></div></dl>
      <div className={styles.recordChecks}><span><CheckCircle2 aria-hidden="true" /> Measurements recorded</span><span><CheckCircle2 aria-hidden="true" /> Access confirmed</span><span><CheckCircle2 aria-hidden="true" /> Site photo attached</span></div>
      <button className={styles.recordPhoto} onClick={event => openPhoto('before', event.currentTarget)} aria-label="Open photo from site visit record"><SamplePhoto src={SAMPLE.beforePhoto} alt="Original deck condition recorded at the site visit" /></button>
    </div>
  </details>

  const crewPost = <article className={styles.crewPost} aria-label={state.role === 'crew' ? 'Your completion update' : `${crewName}'s completion update`}>
    <div className={styles.author}><Avatar name={crewName} /><div><strong>{crewName}</strong><time>just now</time></div></div>
    <p className={styles.postText}>{state.postedNote}</p>
    <button className={styles.completionPhoto} onClick={event => openPhoto('after', event.currentTarget)} aria-label={state.role === 'crew' ? 'Open your completed deck photo' : `Open ${crewName}'s completed deck photo`}><SamplePhoto src={SAMPLE.afterPhoto} alt={`The completed deck ${state.role === 'crew' ? 'you' : crewName} shared with the team`} sizes="80px" /></button>
  </article>

  function openComposer() {
    setTab('activity')
    if (state.scene === 'crew' && state.taskCompleted) dispatch({ type: 'OPEN_COMPOSER' })
  }

  const composer = isCompose ? <section className={styles.composer} aria-label="Post a crew update">
    <div className={styles.composeAuthor}><Avatar name={crewName} /><span>Posting as {crewName}</span></div>
    {state.completionPhoto && <div className={styles.attachedPhoto}><SamplePhoto src={SAMPLE.afterPhoto} alt={`Completion photo attached to ${crewName}'s update`} sizes="80px" /><span><CheckCircle2 aria-hidden="true" /> Photo attached</span></div>}
    <label className={styles.noteLabel} htmlFor="crew-update">Project note</label>
    <textarea data-demo-next={state.completionPhoto && !state.noteDraft.trim()} id="crew-update" value={state.noteDraft} maxLength={280} rows={3} onChange={event => dispatch({ type: 'SET_NOTE', value: event.target.value })} aria-describedby="crew-note-help" />
    <div className={styles.composeActions}>
      <button data-demo-next={!state.completionPhoto} className={styles.attachButton} onClick={() => dispatch({ type: 'ADD_COMPLETION_PHOTO' })} disabled={state.completionPhoto}><Camera aria-hidden="true" /><span>{state.completionPhoto ? 'Photo attached' : 'Attach completion photo'}</span></button>
      <Action data-demo-next={state.completionPhoto && !!state.noteDraft.trim()} disabled={!state.completionPhoto || !state.noteDraft.trim()} onClick={() => dispatch({ type: 'POST_NOTE' })} aria-label="Post crew update"><ArrowUp aria-hidden="true" />Post</Action>
    </div>
    <p id="crew-note-help" className={styles.composeHelp}>{state.completionPhoto ? 'The photo and note stay together on this project.' : 'Use the sample job photo. No camera access needed.'}</p>
  </section> : isCrew && state.taskCompleted ? <button className={styles.composerEntry} onClick={openComposer}><Camera aria-hidden="true" /><span>Write a note...</span><ArrowUp aria-hidden="true" /></button> : <details className={styles.composerContext}><summary className={styles.composerEntry} aria-label="About project notes in this sample"><Camera aria-hidden="true" /><span>Write a note...</span><ArrowUp aria-hidden="true" /></summary><p>{hasPosted ? 'The crew’s note is below. In OPS, your team can keep the conversation going here.' : 'Your crew will use this field to post the finished photo and a note later in this sample.'}</p></details>

  return <div className={styles.project} data-project-scene={state.scene}>
    <header className={styles.header}>
      <div className={styles.navLine}><span>Project</span>{state.crewAssigned && <button className={styles.selectedTask} onClick={() => { setTab('details'); setTaskOpen(true); guideTo('detail') }} aria-label="View selected task"><span className={styles.taskBadges}><Badge>{SAMPLE.task}</Badge>{state.taskCompleted && <Badge tone="olive"><CheckCircle2 aria-hidden="true" />Complete</Badge>}</span><ChevronRight aria-hidden="true" /></button>}</div>
      <h2><NumericText>{SAMPLE.project}</NumericText></h2><p>{SAMPLE.company}</p>
      <div className={styles.location}><MapPin aria-hidden="true" /><span>{SAMPLE.address}</span></div>
    </header>

    <div className={styles.tabs} role="tablist" aria-label="Project sections">
      {TABS.map((item, index) => <button key={item} data-demo-next={item === nextProjectTab} ref={element => { tabButtons.current[index] = element }} id={`project-tab-${item}`} type="button" role="tab" aria-selected={tab === item} aria-controls={`project-panel-${item}`} tabIndex={tab === item ? 0 : -1} onClick={() => selectTab(item)} onKeyDown={event => navigateTabs(event, index)}>{item}</button>)}
    </div>

    <div className={styles.panel} id={`project-panel-${tab}`} role="tabpanel" aria-labelledby={`project-tab-${tab}`} tabIndex={0}>
      {tab === 'activity' && <div className={styles.activity}>
        {gallery}{composer}{hasPosted && crewPost}
        {visitRecord}
        {state.scene === 'project' && !state.crewAssigned && <Action className={styles.detailsAction} onClick={() => selectTab('details')}>Assign the installation crew<ChevronRight aria-hidden="true" /></Action>}
      </div>}

      {tab === 'details' && <div className={styles.details}>
        <Section title="Details"><dl className={styles.document}>
          <div><dt>Status</dt><dd><Badge>{state.taskCompleted && state.role === 'operator' ? 'Completed' : isWorkday ? 'In progress' : 'Accepted'}</Badge></dd></div>
          <div><dt>Client</dt><dd>{SAMPLE.client}<span>{SAMPLE.company}</span></dd></div>
          <div><dt>Address</dt><dd>{SAMPLE.address}</dd></div>
          <div><dt>Timeline</dt><dd className={styles.numeric}>{isWorkday ? SAMPLE.workday : 'Unscheduled'}</dd></div>
          <div><dt>Notes</dt><dd>—</dd></div>
          <div><dt>Team</dt><dd>{state.crewAssigned ? crewRail : '—'}</dd></div>
        </dl></Section>
        <Section title="Tasks"><div className={styles.tasks}>
          <div className={styles.taskRow}><div className={styles.taskName}><Badge>Deck preparation</Badge>{(state.taskCompleted || state.role === 'crew') && <Badge tone="olive">Complete</Badge>}<span>From approved estimate</span></div><FileText className={styles.taskSource} aria-hidden="true" /></div>
          <button ref={nextTask} data-demo-next={state.scene === 'project' && !state.crewAssigned && !taskOpen} className={`${styles.taskRow} ${styles.guidanceTarget}`} onClick={toggleTask} aria-label="Open resurfacing task" aria-expanded={taskOpen} aria-controls="installation-task-detail"><div className={styles.taskName}><Badge>{SAMPLE.task}</Badge>{state.taskCompleted && <Badge tone="olive">Complete</Badge>}<span>{state.crewAssigned ? crewNames : 'From approved estimate'}</span></div><div className={styles.taskDate}><span>{isWorkday ? 'Sep 24' : 'Unscheduled'}</span><ChevronRight aria-hidden="true" /></div></button>
          {taskOpen && <div ref={taskDetail} tabIndex={-1} id="installation-task-detail" className={`${styles.taskDetail} ${styles.guidanceTarget}`}>
            <dl><div><dt>Schedule</dt><dd>{isWorkday ? SAMPLE.workday : 'Unscheduled'}</dd></div><div><dt>Team</dt><dd>{state.crewAssigned ? crewRail : <button ref={assignTeam} data-demo-next={!teamPickerOpen} className={`${styles.assignTeam} ${styles.guidanceTarget}`} onClick={toggleTeamPicker} aria-label="Assign team to this task" aria-expanded={teamPickerOpen} aria-controls="installation-team-picker">Assign team<ChevronRight aria-hidden="true" /></button>}</dd></div><div><dt>Notes</dt><dd>—</dd></div></dl>
            {teamPickerOpen && <section ref={teamPicker} tabIndex={-1} data-demo-next={crewDraft.length === 0} id="installation-team-picker" className={`${styles.teamPicker} ${styles.guidanceTarget}`} aria-label="Choose installation crew">
              <div ref={teamCommit} className={styles.teamCommit}><Action secondary onClick={() => { setTeamPickerOpen(false); guideTo('assign') }}>Cancel</Action><Action data-demo-next={crewDraft.length > 0} className={styles.guidanceTarget} onClick={commitTeam} disabled={crewDraft.length === 0}>Done</Action></div>
              {ROSTER.map(name => <CharacterCard key={name} name={name} selected={crewDraft.includes(name)} onSelect={() => selectCrew(name)} />)}
            </section>}
          </div>}
          {state.crewAssigned && !isWorkday && <p className={styles.assignedFeedback} role="status"><CheckCircle2 aria-hidden="true" />Crew assigned. Ready to schedule.</p>}
        </div></Section>
      </div>}

      {tab === 'expenses' && <div className={styles.expenses}><Section title="Project expenses"><div className={styles.expenseEmpty}><Receipt aria-hidden="true" /><h3>No expenses recorded</h3><p>Receipts and job costs stay with this project.</p><p className={styles.expenseContext}>The approved estimate includes materials. An estimate is not an expense.</p></div></Section></div>}
    </div>

    {state.role === 'operator' && state.scene === 'activity' && <div className={styles.billingHandoff}>
      <div className={styles.billableSummary}><div><span>Ready to bill</span><p>2 of 2 tasks complete</p></div><CheckCircle2 aria-hidden="true" /></div>
      <Action data-demo-next="true" onClick={() => dispatch({ type: 'OPEN_BILLING' })}>View billing<ChevronRight aria-hidden="true" /></Action>
    </div>}

    {isCrew && !isCompose && <div className={styles.actionDock}>
      {state.taskCompleted ? <><span className={styles.completedStatus} role="status"><CheckCircle2 aria-hidden="true" />Task complete</span><Action data-demo-next="true" onClick={openComposer}><ImagePlus aria-hidden="true" />Post a photo update</Action></> : <><span className={styles.selectedLabel}>Selected task<span>{SAMPLE.task}</span></span><Action data-demo-next="true" onClick={() => dispatch({ type: 'COMPLETE_TASK' })}><CheckCircle2 aria-hidden="true" />Complete</Action></>}
    </div>}

    <dialog ref={photoDialog} className={styles.photoDialog} onCancel={() => setPhoto(null)} onClose={restorePhotoFocus} onKeyDown={event => { if (event.key === 'Tab') { event.preventDefault(); photoClose.current?.focus() } }} aria-label={photo === 'after' ? 'Completion photo' : 'Site visit photo'}>
      <div className={styles.viewerHeader}><span>{photo === 'after' ? 'Completion photo' : 'Site visit photo'}</span><button ref={photoClose} type="button" onClick={() => setPhoto(null)} aria-label="Close photo"><X aria-hidden="true" /></button></div>
      {photo && <SamplePhoto src={photo === 'after' ? SAMPLE.afterPhoto : SAMPLE.beforePhoto} alt={photo === 'after' ? 'Completed residential deck with composite boards and matching fascia' : 'Original deck recorded at the site visit'} />}
      <p>{photo === 'after' ? state.postedNote || SAMPLE.note : SAMPLE.scope}</p>
    </dialog>
  </div>
}
