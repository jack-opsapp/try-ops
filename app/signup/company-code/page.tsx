'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { PhasedOnboardingHeader } from '@/components/ui/PhasedOnboardingHeader'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { PhasedLabel } from '@/components/ui/PhasedLabel'
import { PhasedPrimaryButton } from '@/components/ui/PhasedPrimaryButton'
import { useOnboardingAnimation } from '@/lib/hooks/useOnboardingAnimation'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

function isValidEmail(email: string): boolean {
  return /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}$/.test(email)
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
}

function detectType(value: string): 'email' | 'phone' | 'unknown' {
  const trimmed = value.trim()
  if (!trimmed) return 'unknown'
  if (isValidEmail(trimmed)) return 'email'
  if (isValidPhone(trimmed)) return 'phone'
  // If it contains @ it's probably an incomplete email
  if (trimmed.includes('@')) return 'unknown'
  // If it has mostly digits, likely a phone being typed
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length >= 3 && digits.length / trimmed.replace(/\s/g, '').length > 0.5) return 'unknown'
  return 'unknown'
}

function isValidContact(value: string): boolean {
  const trimmed = value.trim()
  return isValidEmail(trimmed) || isValidPhone(trimmed)
}

// ─── Invite Sheet Modal ───────────────────────────────────────────────

interface InviteSheetProps {
  companyName: string
  companyCode: string
  companyId: string
  onClose: () => void
}

function InviteSheet({ companyName, companyCode, companyId, onClose }: InviteSheetProps) {
  const [showCopied, setShowCopied] = useState(false)
  const [showInviteSection, setShowInviteSection] = useState(false)
  const [contacts, setContacts] = useState([''])
  const [sending, setSending] = useState(false)
  const [sentContacts, setSentContacts] = useState<string[]>([])
  const [sendError, setSendError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const hasValidContacts = contacts.some((c) => isValidContact(c.trim()))

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(companyCode)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch {}
  }

  const handleInviteToggleOrSend = async () => {
    if (!showInviteSection) {
      setShowInviteSection(true)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
      return
    }

    const validContacts = contacts.filter((c) => isValidContact(c.trim())).map((c) => c.trim())
    if (validContacts.length === 0) return

    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: validContacts,
          company: companyId,
          companyName,
          companyCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSendError(data.detail || data.error || 'Failed to send invites')
      } else {
        setSentContacts((prev) => [...prev, ...validContacts])
        setContacts([''])
        setShowInviteSection(false)
        if (data.errors?.length) {
          setSendError(data.errors.join('; '))
        }
      }
    } catch {
      setSendError('Connection error. Try again.')
    }
    setSending(false)
  }

  const addContact = () => {
    if (contacts.length >= 10) return
    const newContacts = [...contacts, '']
    setContacts(newContacts)
    setTimeout(() => inputRefs.current[newContacts.length - 1]?.focus(), 100)
  }

  const removeContact = (index: number) => {
    if (contacts.length === 1) {
      setContacts([''])
      setShowInviteSection(false)
      return
    }
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const updateContact = (index: number, value: string) => {
    const updated = [...contacts]
    updated[index] = value
    setContacts(updated)
  }

  // Show type indicator for each input
  const getTypeIndicator = (value: string) => {
    const type = detectType(value.trim())
    if (type === 'email') return { label: 'EMAIL', color: '#597794' }
    if (type === 'phone') return { label: 'SMS', color: '#A5B368' }
    return null
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-ops-background border-t sm:border border-white/10 sm:rounded-ops"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="font-mohave font-medium text-ops-body text-white"
          >
            Done
          </button>
        </div>

        <div className="px-6 pb-8 space-y-6">
          {/* Title + description */}
          <div>
            <h2 className="font-mohave font-semibold text-[28px] text-white tracking-wide mb-2">
              GET YOUR CREW ON OPS
            </h2>
            <p className="font-mohave text-ops-body text-ops-text-secondary">
              Share this code. They&apos;ll download the app and enter it to join {companyName}.
            </p>
          </div>

          {/* Crew Code Card */}
          <div
            className="p-4 rounded-ops border border-white/10"
            style={{ backgroundColor: 'rgba(13, 13, 13, 0.8)' }}
          >
            <p className="font-kosugi text-ops-caption text-ops-text-tertiary mb-2">
              CREW CODE
            </p>
            <div className="flex items-center justify-between">
              <span className="font-kosugi font-medium text-ops-caption text-white tracking-[2px]">
                [{companyCode}]
              </span>
              <button onClick={handleCopy} className="flex items-center gap-1.5">
                {showCopied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#A5B368]">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-kosugi text-ops-caption text-[#A5B368]">COPIED</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-ops-accent">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="font-kosugi text-ops-caption text-ops-accent">COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* INVITE CREW button / SEND INVITES button */}
          <button
            onClick={handleInviteToggleOrSend}
            disabled={showInviteSection && (!hasValidContacts || sending)}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-ops border transition-all duration-200 disabled:opacity-40"
            style={{
              backgroundColor:
                showInviteSection && hasValidContacts
                  ? 'white'
                  : 'rgba(13, 13, 13, 0.8)',
              color: showInviteSection && hasValidContacts ? 'black' : 'white',
              borderColor: showInviteSection && hasValidContacts ? 'transparent' : 'rgba(255,255,255,0.1)',
            }}
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                {showInviteSection ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )}
                <span className="font-mohave font-medium text-ops-body">
                  {showInviteSection ? 'SEND INVITES' : 'INVITE CREW'}
                </span>
              </>
            )}
          </button>

          {/* Invite Section (expanded) */}
          {showInviteSection && (
            <div
              className="space-y-3"
              style={{ animation: 'fadeInUp 0.25s ease-out' }}
            >
              {/* Divider with label */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="font-kosugi text-ops-caption text-ops-text-tertiary">
                  EMAIL OR PHONE
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Contact inputs */}
              {contacts.map((contact, i) => {
                const indicator = getTypeIndicator(contact)
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={(el) => { inputRefs.current[i] = el }}
                        type="text"
                        inputMode={contact.includes('@') ? 'email' : 'text'}
                        value={contact}
                        onChange={(e) => updateContact(i, e.target.value)}
                        placeholder="email or phone number"
                        className="w-full h-12 px-4 pr-16 rounded-ops font-mohave text-ops-body text-white border border-white/10 outline-none focus:border-white/30 placeholder:text-[#999] transition-colors"
                        style={{ backgroundColor: 'rgba(13, 13, 13, 0.8)' }}
                      />
                      {indicator && (
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 font-kosugi text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{ color: indicator.color, backgroundColor: `${indicator.color}20` }}
                        >
                          {indicator.label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeContact(i)}
                      className="w-7 h-7 flex items-center justify-center"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-ops-text-tertiary">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )
              })}

              {/* Add contact button */}
              {contacts.length < 10 && (
                <button
                  onClick={addContact}
                  className="flex items-center gap-1.5 text-ops-accent"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                  </svg>
                  <span className="font-mohave text-ops-body">Add another</span>
                </button>
              )}
            </div>
          )}

          {/* Send error */}
          {sendError && (
            <p className="font-kosugi text-ops-caption text-ops-error">
              {sendError}
            </p>
          )}

          {/* Sent confirmation */}
          {sentContacts.length > 0 && (
            <p className="font-kosugi text-ops-caption text-[#A5B368]">
              Invite sent to {sentContacts.join(', ')}
            </p>
          )}

          {/* How it works */}
          <div>
            <p className="font-kosugi font-medium text-ops-caption text-ops-text-secondary mb-2">
              HOW IT WORKS
            </p>
            <div className="space-y-1">
              <p className="font-kosugi text-ops-caption text-ops-text-tertiary">1. They download OPS (free)</p>
              <p className="font-kosugi text-ops-caption text-ops-text-tertiary">2. They tap &quot;Join a Crew&quot;</p>
              <p className="font-kosugi text-ops-caption text-ops-text-tertiary">3. They enter the code above</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function CompanyCodePage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const { userId, companyName, companyCode, companyId, setSignupStep } =
    useOnboardingStore()
  const animation = useOnboardingAnimation()

  const [copied, setCopied] = useState(false)
  const [showInviteSheet, setShowInviteSheet] = useState(false)

  useEffect(() => {
    if (!userId) {
      router.push('/signup/credentials')
      return
    }
    setSignupStep(5)
    trackSignupStepView('company-code', 5)
    const t = setTimeout(() => animation.start(), 100)
    return () => clearTimeout(t)
  }, [userId, router, setSignupStep, trackSignupStepView])

  const handleCopy = async () => {
    if (!companyCode) return
    try {
      await navigator.clipboard.writeText(companyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleContinue = () => {
    trackSignupStepComplete('company-code', 5)
    router.push('/signup/ready')
  }

  return (
    <OnboardingScaffold>
      {/* Title — iOS: .padding(.horizontal, 40) .padding(.top, 60) */}
      <div className="px-10 pt-[60px]">
        <PhasedOnboardingHeader
          title="YOU'RE SET UP."
          subtitle={companyName ? `${companyName} is ready.` : 'Your company is ready.'}
          animation={animation}
        />
      </div>

      {/* Spacer — iOS: Spacer().frame(height: 48) */}
      <div className="h-12" />

      {/* Content — fades in upward during contentFadeIn */}
      <PhasedContent animation={animation}>
        <div className="px-10 space-y-0">
          {/* Crew Code Section */}
          <div className="flex flex-col gap-4">
            <PhasedLabel text="CREW CODE" index={0} isLast animation={animation} />

            {/* Code display — tappable copy button */}
            {companyCode && (
              <button onClick={handleCopy} className="w-full">
                <div
                  className="p-4 rounded-ops border transition-colors duration-200"
                  style={{
                    backgroundColor: 'rgba(13, 13, 13, 0.8)',
                    borderColor: copied ? 'rgba(165, 179, 104, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {copied ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#A5B368]">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                    <span
                      className="font-kosugi font-medium text-ops-caption tracking-[2px] transition-colors duration-200"
                      style={{ color: copied ? '#A5B368' : '#F5F5F5' }}
                    >
                      {copied ? 'CODE COPIED' : `[${companyCode}]`}
                    </span>
                  </div>
                </div>
              </button>
            )}

            <p className="font-kosugi text-ops-caption text-ops-text-tertiary">
              Share this with your crew so they can join.
            </p>
          </div>

          <div className="h-8" />

          {/* Invite Crew Button — opens sheet modal */}
          <button
            onClick={() => setShowInviteSheet(true)}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-ops border border-white/10"
            style={{ backgroundColor: 'rgba(13, 13, 13, 0.8)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="font-mohave font-medium text-ops-body text-white">
              INVITE CREW
            </span>
          </button>
        </div>
      </PhasedContent>

      {/* Spacer — pushes button to bottom */}
      <div className="flex-1" />

      {/* Info text */}
      <p className="px-10 font-kosugi text-ops-caption text-ops-text-tertiary pb-6">
        You&apos;ll find this code in Settings anytime.
      </p>

      {/* Continue button */}
      <PhasedPrimaryButton
        title="LET'S GO"
        animation={animation}
        onClick={handleContinue}
      />

      {/* Invite Sheet Modal */}
      {showInviteSheet && companyCode && companyId && (
        <InviteSheet
          companyName={companyName || 'your company'}
          companyCode={companyCode}
          companyId={companyId}
          onClose={() => setShowInviteSheet(false)}
        />
      )}
    </OnboardingScaffold>
  )
}
