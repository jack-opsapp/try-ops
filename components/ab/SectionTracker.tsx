'use client'
import { useEffect,useRef } from 'react'
import { sendDiagnostic } from '@/lib/ab/client-events'
import { VisibleDwell } from '@/lib/ab/visible-dwell'
interface Props {children:React.ReactNode;sectionName:string;variantId:string;assignmentId?:string;isInterstitial?:boolean}
export function SectionTracker({children,sectionName,variantId,assignmentId}:Props) {
 const ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  const el=ref.current;if(!el)return
  const dwell=new VisibleDwell();let inView=false,seen=false
  const update=(exit=false)=>{
   const visible=!exit&&inView&&document.visibilityState==='visible'
   if(visible&&!seen){seen=true;sendDiagnostic(variantId,assignmentId,'section_view',{section_name:sectionName})}
   const elapsed=dwell.update(visible,performance.now())
   if(elapsed>0)sendDiagnostic(variantId,assignmentId,'section_dwell',{section_name:sectionName,dwell_ms:elapsed})
  }
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update()},{threshold:.3})
  const visibility=()=>update(),exit=()=>update(true)
  observer.observe(el);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',exit)
  return ()=>{exit();observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',exit)}
 },[sectionName,variantId,assignmentId])
 return <div ref={ref}>{children}</div>
}
