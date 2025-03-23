'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

type AdminUser = {
  id: number
  username: string
  created_at: string
}

type CustomerUser = {
  id: number
  username: string
  created_at: string
}

export default function AdminDashboard() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [customerUsers, setCustomerUsers] = useState<CustomerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        // 管理者ユーザーを取得
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id, username, created_at')
          .order('created_at', { ascending: false })

        if (adminError) throw adminError

        // 一般ユーザーを取得
        const { data: customerData, error: customerError } = await supabase
          .from('customer_users')
          .select('id, username, created_at')
          .order('created_at', { ascending: false })

        if (customerError) throw customerError

        setAdminUsers(adminData || [])
        setCustomerUsers(customerData || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
            エラー: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">データを読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 管理者ユーザーテーブル */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">管理者ユーザー</h2>
              {adminUsers.length === 0 ? (
                <p className="text-gray-500">管理者ユーザーはまだ登録されていません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日時</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 一般ユーザーテーブル */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">一般ユーザー</h2>
              {customerUsers.length === 0 ? (
                <p className="text-gray-500">一般ユーザーはまだ登録されていません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日時</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
