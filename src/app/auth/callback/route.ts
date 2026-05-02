import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/dashboard'

    // #region agent log
    fetch('http://127.0.0.1:7529/ingest/5e4bced6-a7a8-453e-8158-9b9993b67a56',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce418e'},body:JSON.stringify({sessionId:'ce418e',runId:'pre-fix',hypothesisId:'A',location:'auth/callback/route.ts:entry',message:'callback GET',data:{hasCode:!!code,nextParam:searchParams.get('next'),resolvedNext:next,origin},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        // #region agent log
        fetch('http://127.0.0.1:7529/ingest/5e4bced6-a7a8-453e-8158-9b9993b67a56',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce418e'},body:JSON.stringify({sessionId:'ce418e',runId:'pre-fix',hypothesisId:'D',location:'auth/callback/route.ts:afterExchange',message:'exchangeCodeForSession result',data:{exchangeError:error?.message??null,nextAfterExchange:next},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            let redirectUrl: string
            if (isLocalEnv) {
                // we can be sure that there is no proxy involved in local dev
                redirectUrl = `${origin}${next}`
            } else if (forwardedHost) {
                redirectUrl = `https://${forwardedHost}${next}`
            } else {
                redirectUrl = `${origin}${next}`
            }
            // #region agent log
            fetch('http://127.0.0.1:7529/ingest/5e4bced6-a7a8-453e-8158-9b9993b67a56',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce418e'},body:JSON.stringify({sessionId:'ce418e',runId:'pre-fix',hypothesisId:'E',location:'auth/callback/route.ts:redirect',message:'success redirect',data:{redirectUrl,isLocalEnv,hasForwardedHost:!!forwardedHost},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return NextResponse.redirect(redirectUrl)
        }
    }

    // #region agent log
    fetch('http://127.0.0.1:7529/ingest/5e4bced6-a7a8-453e-8158-9b9993b67a56',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce418e'},body:JSON.stringify({sessionId:'ce418e',runId:'pre-fix',hypothesisId:'D',location:'auth/callback/route.ts:fallback',message:'redirect login (no code or exchange failed)',data:{hasCode:!!code},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}
