'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationContent() {
  const [message, setMessage] = useState('Verifying your email...')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check for auth tokens in URL
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const type = searchParams.get('type')

      if (accessToken && refreshToken && type === 'signup') {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setError('Error verifying email. Please try again.')
          return
        }

        setMessage('Email verified successfully! Redirecting to dashboard...')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        // Check if already logged in
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          setMessage('Email verified successfully! Redirecting to dashboard...')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setMessage('Please check your email and click the verification link.')
        }
      }
    }

    handleEmailConfirmation()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Confirmation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}