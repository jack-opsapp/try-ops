'use client'

import { useId } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { Avatar } from './DemoPrimitives'
import styles from './role-scenes.module.css'

export type DemoCharacterName = 'You' | 'Mike' | 'Nick' | 'Pete'

/** Fictional work history, used only in the sample assignment roster. */
const CHARACTERS: Record<DemoCharacterName, {
  position: string
  portrait?: string
  jobs: number
  task: string
  averageLabel: string
  average: string
}> = {
  You: { position: 'Operator', jobs: 36, task: 'Site visits', averageLabel: 'Avg. site visit', average: '48 min' },
  Mike: { position: 'Estimator', portrait: '/avatars/mike.png', jobs: 48, task: 'Site visits', averageLabel: 'Avg. site visit', average: '42 min' },
  Nick: { position: 'Crew lead', portrait: '/avatars/nick.png', jobs: 57, task: 'Site prep', averageLabel: 'Avg. site prep', average: '2 h 30 min' },
  Pete: { position: 'Installer', portrait: '/avatars/pete.png', jobs: 64, task: 'Installation', averageLabel: 'Avg. installation', average: '6 h' },
}

export interface CharacterCardProps {
  name: DemoCharacterName
  selected?: boolean
  onSelect?: () => void
  compact?: boolean
}

export function CharacterCard({ name, selected = false, onSelect, compact = false }: CharacterCardProps) {
  const descriptionId = useId()
  const describedBy = compact ? `${descriptionId}-position` : `${descriptionId}-position ${descriptionId}-history ${descriptionId}-stats`
  const person = CHARACTERS[name]
  const content = <>
    <span className={styles.characterHeader}>
      <Avatar name={name} src={person.portrait} />
      <span className={styles.characterIdentity}>
        <span className={styles.characterName}>{name}</span>
        <span id={`${descriptionId}-position`} className={styles.characterPosition}>{person.position}</span>
      </span>
      {selected ? <Check className={styles.characterSelection} aria-hidden="true" /> : onSelect ? <ChevronRight className={styles.characterChevron} aria-hidden="true" /> : null}
    </span>
    {!compact && <>
      <span id={`${descriptionId}-stats`} className={styles.characterStats}>
        <span><span className={styles.statLabel}>Jobs completed</span><span className={styles.statNumber}>{person.jobs}</span></span>
        <span><span className={styles.statLabel}>Most assigned</span><span className={styles.statTask}>{person.task}</span></span>
        <span><span className={styles.statLabel}>{person.averageLabel}</span><span className={styles.statNumber}>{person.average}</span></span>
      </span>
      <span id={`${descriptionId}-history`} className={styles.sampleHistory}>Sample work history</span>
    </>}
  </>

  return onSelect
    ? <button type="button" className={styles.characterCard} data-compact={compact} data-selected={selected} aria-label={`Select ${name}`} aria-describedby={describedBy} aria-pressed={selected} onClick={onSelect}>{content}</button>
    : <article className={styles.characterCard} data-compact={compact} data-selected={selected} aria-label={name} aria-describedby={describedBy}>{content}</article>
}
