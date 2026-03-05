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
  const isPublicPage = pathname === '/' || pathname === '/pricing' || pathname === '/about' || pathname.startsWith('/invoice/view/')
  
  // Protected paths (anything not explicitly public or auth)
  const isProtectedPath = !isPublicPage && !isAuthPage && !pathname.startsWith('/api') && !pathname.includes('.')

  // Redirection logic
  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    
    const redirectResponse = NextResponse.redirect(redirectUrl)
    // Propagate cookie changes from the supabase client
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (isAuthPage && user) {
    const dashboardResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    // Propagate cookie changes
    response.cookies.getAll().forEach(cookie => {
      dashboardResponse.cookies.set(cookie.name, cookie.value)
    })
    return dashboardResponse
  }

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

