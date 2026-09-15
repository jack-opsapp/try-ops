import {NextRequest,NextResponse} from 'next/server'
import {runOperator} from '@/lib/ab/operator'
import {reconcileDemo} from '@/lib/demo/reconcile'
export const maxDuration=120
export async function GET(req:NextRequest) {
 const secret=process.env.CRON_SECRET
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401})
 // Separate durable demo recovery runs even when experiment enrollment is dormant.
 const demoPromise=reconcileDemo()
 let result
 try { result=await runOperator({operation:'health',key:`health:${new Date().toISOString().slice(0,13)}`}) }
 catch { result={body:{error:'Experiment infrastructure unavailable'},status:503} }
 const demo=await demoPromise
 return NextResponse.json({...result.body,demo},{status:result.status>=400?result.status:demo.status==='unavailable'?503:result.status})
}
