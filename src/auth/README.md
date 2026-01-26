# Authentication Module Documentation

## Overview

The InvoiceFlow authentication module provides a comprehensive, secure authentication system built on top of Supabase Auth. It supports user registration, login, logout, password reset, email verification, and session management. The module is designed to be easy to integrate into Next.js applications with React hooks and components.

## Setup

### Prerequisites

- Next.js 13+ application
- Supabase project with authentication enabled
- Required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Installation

The authentication module is already integrated into the InvoiceFlow project. To use it in a new project:

1. Install required dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

2. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Wrap your app with the `SupabaseAuthProvider` in `src/app/layout.tsx`:
```tsx
import { SupabaseAuthProvider } from '@/components/providers/SupabaseAuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}
```

## Configuration

### Supabase Client Setup

The module uses two Supabase clients:

- **Browser Client** (`src/lib/supabase/client.ts`): For client-side operations
- **Server Client** (`src/lib/supabase/server.ts`): For server-side operations and middleware

### Middleware Configuration

Authentication middleware is configured in `src/middleware.ts` to protect routes and handle redirects:

- Protected routes: `/dashboard`, `/client-management`, `/create-invoice`, `/invoice-management`, `/reports-analytics`, `/user-profile-settings`
- Auth routes: `/auth/*` (redirects logged-in users to dashboard)

## Usage

### Basic Authentication Flow

1. **Signup**: Users create an account with email and password
2. **Email Verification**: Users verify their email address
3. **Login**: Authenticated users can access protected routes
4. **Session Management**: Sessions are maintained across browser sessions
5. **Logout**: Users can securely log out

### Using the Auth Provider

Access authentication state anywhere in your app:

```tsx
import { useAuth } from '@/components/providers/SupabaseAuthProvider'

function MyComponent() {
  const { user, session } = useAuth()

  if (!user) {
    return <div>Please log in</div>
  }

  return <div>Welcome, {user.email}!</div>
}
```

### Protecting Routes

Use the `ProtectedRoute` component to guard pages:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is protected</div>
    </ProtectedRoute>
  )
}
```

## API Reference

### Supabase Client Methods

The module exposes Supabase Auth methods through the configured clients:

```typescript
import { supabase } from '@/lib/supabase/client'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
const { error } = await supabase.auth.signOut()

// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Reset password
const { error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: `${window.location.origin}/auth/reset-password`
})
```

## Hooks

The authentication module provides several React hooks for common auth operations:

### useLogin

Handles user login with email and password.

```tsx
import { useLogin } from '@/lib/hooks'

function LoginForm() {
  const { login, loading, error } = useLogin({
    onSuccess: () => {
      // Handle successful login
      router.push('/dashboard')
    }
  })

  const handleSubmit = async (email: string, password: string) => {
    await login(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

**Parameters:**
- `options.onSuccess?: () => void` - Callback executed on successful login

**Returns:**
- `login: (email: string, password: string) => Promise<void>`
- `loading: boolean`
- `error: string | null`

### useSignup

Handles user registration.

```tsx
import { useSignup } from '@/lib/hooks'

function SignupForm() {
  const { signup, loading, error } = useSignup({
    onSuccess: () => {
      // Handle successful signup
      router.push('/auth/confirmation')
    }
  })

  const handleSubmit = async (email: string, password: string) => {
    await signup(email, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

**Parameters:**
- `options.onSuccess?: () => void` - Callback executed on successful signup

**Returns:**
- `signup: (email: string, password: string) => Promise<void>`
- `loading: boolean`
- `error: string | null`

### useLogout

Handles user logout.

```tsx
import { useLogout } from '@/lib/hooks'

function LogoutButton() {
  const { logout, loading, error } = useLogout({
    onSuccess: () => {
      // Handle successful logout
      router.push('/auth/login')
    }
  })

  return (
    <button onClick={logout} disabled={loading}>
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
```

**Parameters:**
- `options.onSuccess?: () => void` - Callback executed on successful logout

**Returns:**
- `logout: () => Promise<void>`
- `loading: boolean`
- `error: string | null`

### usePasswordReset

Handles password reset requests.

```tsx
import { usePasswordReset } from '@/lib/hooks'

function ForgotPasswordForm() {
  const { resetPassword, loading, error } = usePasswordReset({
    onSuccess: () => {
      // Handle successful reset request
      setEmailSent(true)
    }
  })

  const handleSubmit = async (email: string) => {
    await resetPassword(email)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email input */}
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>
        {loading ? 'Sending...' : 'Reset Password'}
      </button>
    </form>
  )
}
```

**Parameters:**
- `options.onSuccess?: () => void` - Callback executed on successful reset request

**Returns:**
- `resetPassword: (email: string) => Promise<void>`
- `loading: boolean`
- `error: string | null`

### useEmailVerification

Handles email verification resend.

```tsx
import { useEmailVerification } from '@/lib/hooks'

function ResendVerificationButton() {
  const { resendVerification, loading, error } = useEmailVerification({
    onSuccess: () => {
      // Handle successful resend
      toast.success('Verification email sent!')
    }
  })

  return (
    <button onClick={() => resendVerification('user@example.com')} disabled={loading}>
      {loading ? 'Sending...' : 'Resend Verification'}
    </button>
  )
}
```

**Parameters:**
- `options.onSuccess?: () => void` - Callback executed on successful resend

**Returns:**
- `resendVerification: (email: string) => Promise<void>`
- `loading: boolean`
- `error: string | null`

## User Flows

### Registration Flow

1. User visits `/auth/signup`
2. Fills out registration form (email, password)
3. Submits form → `useSignup` hook calls Supabase
4. Success: Email verification sent, redirected to confirmation page
5. User clicks verification link in email
6. Redirected to login or dashboard

### Login Flow

1. User visits `/auth/login`
2. Fills out login form (email, password)
3. Submits form → `useLogin` hook calls Supabase
4. Success: Session created, redirected to dashboard
5. Middleware protects routes based on session

### Password Reset Flow

1. User visits `/auth/forgot-password`
2. Enters email address
3. Submits form → `usePasswordReset` hook sends reset email
4. User clicks reset link in email
5. Redirected to `/auth/reset-password` with token
6. User sets new password

### Logout Flow

1. User clicks logout button
2. `useLogout` hook calls Supabase signOut
3. Session cleared, redirected to login page

## Integration Details

### App Router Integration

The authentication module is fully integrated with Next.js App Router:

- Server components can access auth state via `createClient()`
- Client components use `useAuth()` hook
- Middleware handles route protection and redirects

### Session Persistence

Sessions are automatically persisted across browser sessions using Supabase's built-in session management. The `SupabaseAuthProvider` listens for auth state changes and updates the React context accordingly.

### Error Handling

All hooks include comprehensive error handling:

- Network errors
- Invalid credentials
- Email not verified
- Rate limiting

Errors are displayed using toast notifications and stored in hook state.

### Loading States

All authentication operations provide loading states to prevent multiple submissions and provide user feedback.

## Security Considerations

### Password Requirements

- Minimum 6 characters (Supabase default)
- Consider implementing additional client-side validation

### Email Verification

- Required for new accounts
- Prevents unauthorized access
- Use `useEmailVerification` to resend verification emails

### Session Security

- Sessions expire automatically (configurable in Supabase)
- Secure cookies used for session storage
- CSRF protection via Supabase

### Route Protection

- Middleware protects sensitive routes
- Client-side protection with `ProtectedRoute` component
- Server-side validation in API routes

### Environment Variables

- Never commit API keys to version control
- Use different Supabase projects for development/production
- Rotate keys regularly

## Troubleshooting

### Common Issues

#### "Invalid login credentials"

- Check email and password are correct
- Ensure email is verified
- Account may be disabled in Supabase dashboard

#### "Email not confirmed"

- User needs to verify email before logging in
- Check spam folder for verification email
- Use resend verification feature

#### "Session expired"

- User needs to log in again
- Check Supabase session configuration
- Clear browser cookies if issues persist

#### "Too many requests"

- Rate limiting triggered
- Wait before retrying
- Check Supabase rate limits

### Debugging

Enable Supabase debug logging:

```typescript
import { supabase } from '@/lib/supabase/client'

// Enable debug logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

### Testing Authentication

Use Supabase's test users or create test accounts for development:

```typescript
// In development, you can create test users
const { data, error } = await supabase.auth.admin.createUser({
  email: 'test@example.com',
  password: 'testpassword',
  email_confirm: true // Skip email verification for testing
})
```

### Environment Setup Issues

- Verify environment variables are loaded correctly
- Check Supabase project is active
- Ensure CORS is configured for your domain

### Migration from Other Auth Systems

When migrating from other authentication systems:

1. Export user data
2. Create users in Supabase (with verified emails)
3. Update password hashes if possible
4. Test login flow thoroughly
5. Update client applications to use new auth system

---

For additional support, refer to the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) or check the project's issue tracker.