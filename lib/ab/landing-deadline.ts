/** One budget for the entire landing lookup phase, including sequential queries. */
export const LANDING_LOOKUP_BUDGET_MS = 600
export async function withinLandingDeadline<T>(work:(signal:AbortSignal)=>Promise<T>):Promise<T> {
 const controller=new AbortController()
 let timer:ReturnType<typeof setTimeout>|undefined
 const timeout=new Promise<never>((_,reject)=>{
  timer=setTimeout(()=>{reject(new Error('Landing lookup deadline'));controller.abort()},LANDING_LOOKUP_BUDGET_MS)
 })
 try{return await Promise.race([work(controller.signal),timeout])}
 finally{clearTimeout(timer)}
}
