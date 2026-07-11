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
 const isAdminPath = pathname.startsWith('/admin')
 const isPublicPage = pathname === '/' || pathname === '/pricing' || pathname === '/about' || pathname.startsWith('/invoice/view/')
 
 // Protected paths (anything not explicitly public, auth, or onboarding)
 const isProtectedPath = !isPublicPage && !isAuthPage && !isOnboardingPage && !isAdminPath && !pathname.startsWith('/api') && !pathname.includes('.')

 // Redirection logic for unauthenticated users on protected paths
 if ((isProtectedPath || isOnboardingPage || isAdminPath) && !user) {
 const redirectUrl = request.nextUrl.clone()
 redirectUrl.pathname = '/auth/login'
 redirectUrl.searchParams.set('redirectedFrom', pathname)
 
 const redirectResponse = NextResponse.redirect(redirectUrl)
 // Forward cookies, which includes any cleared cookies from failed getUser() validation
 response.cookies.getAll().forEach(cookie => {
 redirectResponse.cookies.set(cookie.name, cookie.value)
 })
 return redirectResponse
 }

  if ((isAuthPage || isOnboardingPage) && user) {
    // Check onboarding status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_status, role')
      .eq('id', user.id)
      .single()

    const isFullyOnboarded = profile?.onboarding_status === 'active'
    const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

    if (isOnboardingPage && isFullyOnboarded) {
      const target = isAdmin ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(target, request.url))
    }

    if (isAuthPage) {
      let target = isFullyOnboarded ? '/dashboard' : '/onboarding'
      if (isAdmin) {
        target = '/admin'
      }
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

