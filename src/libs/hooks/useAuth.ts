import { useState, useEffect } from 'react'
import { CustomerUser, getCustomerUserById } from '../customer_user'

export function useAuth() {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // セッションストレージからユーザー情報を取得
    const storedUser = sessionStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    }
    setLoading(false)
  }, [])

  const isAuthenticated = !!user

  const login = (userData: CustomerUser) => {
    setUser(userData)
    sessionStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('user')
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  }
} 