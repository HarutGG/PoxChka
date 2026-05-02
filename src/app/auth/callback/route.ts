import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_NEXT = '/dashboard'

/**
 * Public site URL for redirects. Set NEXT_PUBLIC_SITE_URL in Vercel to your
 * canonical origin (e.g. https://pox-chka.vercel.app). If unset, we derive
 * from proxy headers or the request URL (works for local dev).
 */
function getSiteUrl(request: Request): string {
    const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    if (env) return env

    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
    const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
    if (forwardedHost) {
        const proto = forwardedProto ?? 'https'
        return `${proto}://${forwardedHost}`
    }

    return new URL(request.url).origin
}

/**
 * Supabase may pass next=/ (matching Site URL). Treat that as invalid for post-login.
 */
function safeNextPath(raw: string | null): string {
    if (raw == null || raw === '' || raw === '/') return DEFAULT_NEXT
    if (!raw.startsWith('/') || raw.startsWith('//')) return DEFAULT_NEXT
    if (raw.includes('://')) return DEFAULT_NEXT
    if (raw.startsWith('/auth/callback')) return DEFAULT_NEXT
    return raw
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = safeNextPath(searchParams.get('next'))
    const siteUrl = getSiteUrl(request)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.redirect(`${siteUrl}/login?message=${encodeURIComponent('Server configuration error')}`)
    }

    if (code) {
        const redirectUrl = `${siteUrl}${next}`
        const redirectResponse = NextResponse.redirect(redirectUrl)
        const cookieStore = await cookies()

        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        redirectResponse.cookies.set(name, value, options)
                    )
                },
            },
        })

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return redirectResponse
        }
    }

    return NextResponse.redirect(
        `${siteUrl}/login?message=${encodeURIComponent('Could not authenticate user')}`
    )
}
