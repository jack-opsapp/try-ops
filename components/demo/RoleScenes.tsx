'use client'

import { useId } from 'react'
import { ArrowRight, Briefcase, HardHat } from 'lucide-react'
import type { SceneProps } from './lifecycle-state'
import styles from './role-scenes.module.css'

const ROLES = [
  {
    role: 'operator',
    name: 'Operator',
    Icon: Briefcase,
    description: 'Run the business. Keep the work moving.',
    responsibilities: ['Manage leads and estimates', 'Assign visits and crew', 'See progress and job updates'],
  },
  {
    role: 'crew',
    name: 'Crew',
    Icon: HardHat,
    description: 'Know the job. Get it done.',
    responsibilities: ['See assigned work and site details', 'Complete tasks', 'Share photos and updates'],
  },
] as const

/** Role choice describes responsibilities, never a fictional person's history. */
export function RoleScenes({ state, dispatch }: SceneProps) {
  const descriptionId = useId()
  return <section className={styles.roleScene} aria-labelledby="demo-role-title">
    <header className={styles.roleHeading}>
      <h2 id="demo-role-title">Your side of the team.</h2>
      <p>Follow one job from your side of the team.</p>
    </header>
    <div className={styles.roleChoices} data-demo-next="true">
      {ROLES.map(({ role, name, Icon, description, responsibilities }) => <button
        type="button"
        key={role}
        className={styles.roleCard}
        aria-label={`Choose ${name}`}
        aria-describedby={`${descriptionId}-${role}-summary ${descriptionId}-${role}-responsibilities`}
        aria-pressed={state.role === role}
        onClick={() => dispatch({ type: 'SELECT_ROLE', role })}
      >
        <span className={styles.roleSymbol}><Icon aria-hidden="true" /></span>
        <span className={styles.roleInfo}>
          <span className={styles.roleName}>{name}</span>
          <span id={`${descriptionId}-${role}-summary`} className={styles.roleDescription}>{description}</span>
          <span id={`${descriptionId}-${role}-responsibilities`} className={styles.responsibilities}>
            {responsibilities.map(item => <span key={item}>{item}</span>)}
          </span>
        </span>
        <ArrowRight className={styles.roleArrow} aria-hidden="true" />
      </button>)}
    </div>
    <p className={styles.roleFootnote}>Sample job. Your role stays the same throughout.</p>
  </section>
}
