'use client'
import { shouldCollectProductionAnalytics } from '@/lib/analytics/production-boundary'
export function sessionIdentity():string {
 try {const saved=sessionStorage.getItem('ops_ab_session');if(saved)return saved;const id=crypto.randomUUID();sessionStorage.setItem('ops_ab_session',id);return id}catch{return crypto.randomUUID()}
}
export function sendDiagnostic(variantId:string,assignmentId:string|undefined,eventType:string,extra:Record<string,unknown>={}):void {
 if(!shouldCollectProductionAnalytics())return
 const params=new URLSearchParams(window.location.search)
 if(['variant','preview','qa','ab_preview'].some(key=>params.has(key)))return
 const body=JSON.stringify({variant_id:variantId,assignment_id:assignmentId,event_id:crypto.randomUUID(),route:assignmentId?'/':undefined,session_id:sessionIdentity(),event_type:eventType,...extra})
 const send=()=>fetch('/api/ab-events',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true})
 // Reuse event identity on retry. No local token storage; opaque cookie is server-only.
 void send().then(response=>{if(response.status>=500)setTimeout(()=>void send().catch(()=>{}),1000)}).catch(()=>{setTimeout(()=>void send().catch(()=>{}),1000)})
}
