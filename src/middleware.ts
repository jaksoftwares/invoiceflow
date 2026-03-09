import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Use getUser() for secure session validation
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define protected and public path rules
  const isAuthPage = pathname.startsWith('/auth')
  const isOnboardingPage = pathname === '/onboarding'
  const isPublicPage = pathname === '/' || pathname === '/pricing' || pathname === '/about' || pathname.startsWith('/invoice/view/')
  
  // Protected paths (anything not explicitly public, auth, or onboarding)
  const isProtectedPath = !isPublicPage && !isAuthPage && !isOnboardingPage && !pathname.startsWith('/api') && !pathname.includes('.')

  // Redirection logic
  if ((isProtectedPath || isOnboardingPage) && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if ((isAuthPage || isOnboardingPage) && user) {
    // Check onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_status')
      .eq('id', user.id)
      .single()

    const isFullyOnboarded = profile?.onboarding_status === 'active'

    if (isOnboardingPage && isFullyOnboarded) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isAuthPage) {
        const target = isFullyOnboarded ? '/dashboard' : '/onboarding'
        const authRedirect = NextResponse.redirect(new URL(target, request.url))
        response.cookies.getAll().forEach(cookie => {
          authRedirect.cookies.set(cookie.name, cookie.value)
        })
        return authRedirect
    }
  }

  // If user is on protected path but not fully onboarded
  if (isProtectedPath && user) {
     const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_status')
      .eq('id', user.id)
      .single()

    if (profile?.onboarding_status !== 'active') {
       return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

