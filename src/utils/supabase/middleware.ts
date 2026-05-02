// Updated middleware for PoxChka v1.1
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If environment variables are missing or malformed (like placeholder text),
    // don't crash the middleware. This allows the app to load so the user can see
    // configuration errors elsewhere.
    if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
        // #region agent log
        fetch('http://127.0.0.1:7529/ingest/5e4bced6-a7a8-453e-8158-9b9993b67a56',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce418e'},body:JSON.stringify({sessionId:'ce418e',runId:'pre-fix',hypothesisId:'B',location:'middleware.ts:earlyExit',message:'skipped supabase (env)',data:{pathname:request.nextUrl.pathname,hasUrl:!!supabaseUrl,urlPrefix:supabaseUrl?.slice?.(0,12)??null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 3. Get user session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // #region agent log
    fetch('http://127.0.0.1:7529/ingest/5e4bced6-a7a8-453e-8158-9b9993b67a56',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ce418e'},body:JSON.stringify({sessionId:'ce418e',runId:'pre-fix',hypothesisId:'C',location:'middleware.ts:afterGetUser',message:'session check',data:{pathname:request.nextUrl.pathname,hasUser:!!user,userId:user?.id?.slice?.(0,8)??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // 4. Protected routes logic
    // If no user and trying to access a protected route, redirect to login
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is authenticated and trying to access login or home, redirect to dashboard
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
