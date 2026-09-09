import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthBrand } from '@/components/AuthBrand'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/

interface FieldErrors {
  username: string | null
  password: string | null
  confirmPassword: string | null
}

const EMPTY_ERRORS: FieldErrors = {
  username: null,
  password: null,
  confirmPassword: null
}

function validateUsername(value: string): string | null {
  if (!value.trim()) return 'Username is required'
  if (value.length < 3) return 'Username must be at least 3 characters'
  if (value.length > 50) return 'Username must be at most 50 characters'
  if (!USERNAME_PATTERN.test(value)) {
    return 'Only letters, numbers, dots, dashes and underscores are allowed'
  }
  return null
}

function validatePassword(value: string): string | null {
  if (!value) return 'Password is required'
  if (value.length < 6) return 'Password must be at least 6 characters'
  if (value.length > 72) return 'Password must be at most 72 characters'
  return null
}

function validateConfirmPassword(
  password: string,
  value: string
): string | null {
  if (!value) return 'Please confirm your password'
  if (password !== value) return 'Passwords do not match'
  return null
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>(EMPTY_ERRORS)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleBlurUsername = () =>
    setErrors(prev => ({ ...prev, username: validateUsername(username) }))

  const handleBlurPassword = () =>
    setErrors(prev => ({ ...prev, password: validatePassword(password) }))

  const handleBlurConfirmPassword = () =>
    setErrors(prev => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, confirmPassword)
    }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const nextErrors: FieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword)
    }
    setErrors(nextErrors)

    if (nextErrors.username) {
      usernameRef.current?.focus()
      return
    }
    if (nextErrors.password) {
      passwordRef.current?.focus()
      return
    }
    if (nextErrors.confirmPassword) {
      confirmPasswordRef.current?.focus()
      return
    }

    await register({ username, password })

    if (useAuthStore.getState().user) {
      navigate('/')
    }
  }

  const invalidInputClass = 'aria-[invalid=true]:border-destructive'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-[min(88vw,32rem)] sm:min-w-[28rem]">
        <CardHeader className="px-10 pt-8 pb-6">
          <AuthBrand />
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Register to start writing clinical notes
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pt-2 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={e => {
                  setUsername(e.target.value)
                  clearError('username')
                }}
                onBlur={handleBlurUsername}
                placeholder="Choose a username"
                autoComplete="username"
                aria-invalid={Boolean(errors.username)}
                className={invalidInputClass}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setErrors(prev => ({
                    ...prev,
                    password: null,
                    confirmPassword: null
                  }))
                }}
                onBlur={handleBlurPassword}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                className={invalidInputClass}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm password</label>
              <Input
                ref={confirmPasswordRef}
                type="password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value)
                  clearError('confirmPassword')
                }}
                onBlur={handleBlurConfirmPassword}
                placeholder="Repeat your password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                className={invalidInputClass}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
