'use client'
import { useState, type ReactNode, type ButtonHTMLAttributes, type Ref } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, ChevronRight, X } from 'lucide-react'
import ui from './demo-ui.module.css'
export { ui }
export function NumericText({ children }: { children: string }) { return <>{children.split(/(\d+(?:[,.]\d+)*)/g).map((part, index) => /\d/.test(part) ? <span className={ui.mono} key={index}>{part}</span> : part)}</> }
export function AppHeader({ title, left, right, titleRef }: { title: string; left?: ReactNode; right?: ReactNode; titleRef?: Ref<HTMLHeadingElement> }) { return <header className={ui.appHeader}><div>{left}</div><h2 ref={titleRef} tabIndex={titleRef ? -1 : undefined}>{title}</h2><div>{right}</div></header> }
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'olive' | 'tan' }) { return <span className={ui.badge} data-tone={tone}>{children}</span> }
export function Action({ children, secondary = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) { return <button type="button" className={`${secondary ? ui.secondary : ui.primary} ${className}`} {...props}>{children}</button> }
export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <section className={ui.section}><div className={ui.sectionHeading}><h3><span aria-hidden="true">// </span>{title}</h3>{action}</div>{children}</section> }
export function Avatar({ name, src }: { name: string; src?: string }) { return src ? <Image className={ui.avatar} src={src} width={36} height={36} alt={name} /> : <span className={ui.avatar} aria-label={name}>{name.split(' ').map(part=>part[0]).slice(0,2).join('')}</span> }
export function SamplePhoto({ src, alt, className = '', priority = false, sizes = '(max-width: 600px) 100vw, 520px' }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) { const [failed, setFailed] = useState(false); return failed ? <div className={`${ui.photoFallback} ${className}`}>Sample photo unavailable. You can continue.</div> : <Image className={`${ui.photo} ${className}`} src={src} alt={alt} width={1536} height={1024} sizes={sizes} priority={priority} onError={()=>setFailed(true)} /> }
export { ArrowLeft, ArrowRight, Check, ChevronRight, X }
