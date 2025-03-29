'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname
      router.push(`/login?redirectedFrom=${encodeURIComponent(currentPath)}`)
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 