'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/libs/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    console.log('AuthGuard: 認証状態の確認', { isAuthenticated, loading })
    if (!loading && !isAuthenticated) {
      console.log('AuthGuard: 未認証のためログインページにリダイレクト')
      const currentPath = window.location.pathname
      router.push(`/login?redirectedFrom=${encodeURIComponent(currentPath)}`)
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    console.log('AuthGuard: ローディング中')
    return null
  }

  if (!isAuthenticated) {
    console.log('AuthGuard: 未認証')
    return null
  }

  console.log('AuthGuard: 認証済み')
  return <>{children}</>
} 