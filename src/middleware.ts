import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ✅ Use session instead of getUser
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  const { pathname } = request.nextUrl

  // ✅ Public routes
  const publicRoutes = ['/', '/about', '/pricing']

  if (publicRoutes.includes(pathname)) {
    return response
  }

  // ✅ Redirect logged-in users away from auth
  if (pathname.startsWith('/auth') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ✅ Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/client-management',
    '/create-invoice',
    '/invoice-management',
    '/reports-analytics',
    '/reports-analytics',
    '/user-profile-settings',
  ]

  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|auth).*)',
  ],
}

