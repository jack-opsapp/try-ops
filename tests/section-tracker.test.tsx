// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest'
import {render,act,cleanup} from '@testing-library/react'
import {SectionTracker} from '@/components/ab/SectionTracker'
const {send}=vi.hoisted(()=>({send:vi.fn()}))
vi.mock('@/lib/ab/client-events',()=>({sendDiagnostic:send}))
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();send.mockReset()})
it('emits first section visibility immediately; hidden time and repeated unload never duplicate dwell',()=>{
 let callback:IntersectionObserverCallback=()=>{},time=0,visibility='visible'
 vi.spyOn(performance,'now').mockImplementation(()=>time)
 vi.spyOn(document,'visibilityState','get').mockImplementation(()=>visibility as DocumentVisibilityState)
 vi.stubGlobal('IntersectionObserver',class{constructor(cb:IntersectionObserverCallback){callback=cb}observe(){}disconnect(){}})
 render(<SectionTracker sectionName="Hero" variantId="arm" assignmentId="assignment"><p>Content</p></SectionTracker>)
 act(()=>callback([{isIntersecting:true}] as IntersectionObserverEntry[],{} as IntersectionObserver))
 expect(send).toHaveBeenCalledExactlyOnceWith('arm','assignment','section_view',{section_name:'Hero'})
 time=100;visibility='hidden';act(()=>document.dispatchEvent(new Event('visibilitychange')))
 expect(send).toHaveBeenLastCalledWith('arm','assignment','section_dwell',{section_name:'Hero',dwell_ms:100})
 time=10000;act(()=>window.dispatchEvent(new Event('pagehide')));expect(send).toHaveBeenCalledTimes(2)
 visibility='visible';act(()=>document.dispatchEvent(new Event('visibilitychange')))
 time=10050;act(()=>window.dispatchEvent(new Event('pagehide')))
 expect(send).toHaveBeenLastCalledWith('arm','assignment','section_dwell',{section_name:'Hero',dwell_ms:50})
 cleanup();expect(send).toHaveBeenCalledTimes(3)
})
