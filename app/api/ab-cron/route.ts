import {NextRequest,NextResponse} from 'next/server'
import {runOperator} from '@/lib/ab/operator'
export const maxDuration=120
export async function GET(req:NextRequest) {
 const secret=process.env.CRON_SECRET
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401})
 // Cron reconciles business outcomes/health only. Never invokes a model or publishes.
 try{const result=await runOperator({operation:'health',key:`health:${new Date().toISOString().slice(0,13)}`});return NextResponse.json(result.body,{status:result.status})}
 catch{return NextResponse.json({error:'Experiment infrastructure unavailable'},{status:503})}
}
