import { sendDiagnostic } from '@/lib/ab/client-events'
/** Diagnostic only. Tracking failure must never prevent the primary action. */
export function trackABClick(sectionName:string,elementId:string) {
 if(typeof window==='undefined')return
 try {
  const variantId=sessionStorage.getItem('ops_ab_variant')
  if(variantId)sendDiagnostic(variantId,sessionStorage.getItem('ops_ab_assignment')??undefined,'element_click',{section_name:sectionName,element_id:elementId})
 }catch{/* Storage can be unavailable in privacy modes. */}
}
