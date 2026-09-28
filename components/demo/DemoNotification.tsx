'use client'

import { X } from 'lucide-react'
import styles from './demo-notification.module.css'

export interface DemoNotificationMessage {
  id: string
  title: string
  body: string
  context?: string
}

export interface DemoNotificationProps {
  notification: DemoNotificationMessage | null
  onDismiss?: () => void
  onOpen?: () => void
  reduced?: boolean
}

function notificationBody(text: string) {
  const numeric = /^(?:(?:EST|INV)-\d+|\$[\d,]+(?:\.\d{2})?|\d{1,2}:\d{2}(?: [AP]M)?|\d+)$/
  return text.split(/((?:EST|INV)-\d+|\$[\d,]+(?:\.\d{2})?|\d{1,2}:\d{2}(?: [AP]M)?|\d+)/g)
    .map((part, index) => numeric.test(part) ? <span key={index} className={styles.numeric}>{part}</span> : part)
}

/** Sample notification only. The parent owns when it arrives and is dismissed.
 * Keep this slot above the app viewport: its content reserves its own height,
 * so an arriving notification never covers a control or sticky app header. */
export function DemoNotification({ notification, onDismiss, onOpen, reduced = false }: DemoNotificationProps) {
  return <div className={styles.slot} data-active={Boolean(notification)} data-demo-notification={notification?.id} data-reduced={reduced}>
    <div className={styles.surface}>
      {/* This status region stays mounted when empty. Updating its text announces
          each arrival once; the dismiss control is outside the announcement. */}
      <div className={styles.announcement} role="status" aria-live="polite" aria-atomic="true">
        {notification && <div className={styles.message} key={notification.id}>
          <span className={styles.mark} aria-hidden="true" />
          <div className={styles.copy}>
            <p className={styles.meta}><span>OPS</span>{notification.context && <span>{notification.context}</span>}</p>
            <p className={styles.title}>{notificationBody(notification.title)}</p>
            <p className={styles.body}>{notificationBody(notification.body)}</p>
          </div>
        </div>}
      </div>
      {notification && onOpen && <button type="button" className={styles.open} data-demo-next="true" aria-label={notification.title} onClick={onOpen}><span className={styles.openLabel}>Open project</span></button>}
      {notification && onDismiss && <button type="button" className={styles.dismiss} aria-label="Dismiss notification" onClick={onDismiss}><X aria-hidden="true" /></button>}
    </div>
  </div>
}
