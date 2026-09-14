import {NextRequest,NextResponse} from 'next/server'
import {OperatorRequest,runOperator} from '@/lib/ab/operator'
import {APPROVED_SECTIONS} from '@/lib/landing/page-configs'
import {CONTENT_REGISTRY_VERSION} from '@/lib/landing/content-registry'
export const maxDuration=120
export async function POST(req:NextRequest) {
 const secret=process.env.AB_ADMIN_SECRET
 if(!secret||req.headers.get('x-ab-admin-secret')!==secret)return NextResponse.json({error:'Unauthorized'},{status:401})
 if(Number(req.headers.get('content-length')??0)>16384)return NextResponse.json({error:'Request too large'},{status:413})
 const parsed=OperatorRequest.safeParse(await req.json().catch(()=>null))
 if(!parsed.success)return NextResponse.json({error:'Invalid operation'},{status:400})
 try{const result=await runOperator(parsed.data,{registry:APPROVED_SECTIONS,version:CONTENT_REGISTRY_VERSION});return NextResponse.json(result.body,{status:result.status})}
 catch{return NextResponse.json({error:'Experiment infrastructure unavailable'},{status:503})}
}
