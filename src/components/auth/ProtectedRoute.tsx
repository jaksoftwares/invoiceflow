'use client'

import { useAuth } from '../providers/SupabaseAuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}