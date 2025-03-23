'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

type Customer = {
  id: number
  pass: string
  created_at: string  // timestamptz型はstring型として扱う
}

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...')
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    async function fetchCustomers() {
      try {
        console.log('Fetching data from Supabase...')
        const response = await supabase.from('customer_ids').select('*')
        console.log('Full Supabase response:', response)
        
        if (response.error) throw response.error
        
        if (response.data && response.data.length > 0) {
          console.log('Fetched data:', response.data)
          setCustomers(response.data)
          console.log('Customers state updated:', response.data.length, 'records')
          setConnectionStatus('Connected to Supabase successfully!')
        } else {
          console.log('No data found in customer_ids table')
          setConnectionStatus('Connected, but no data found')
        }
      } catch (error: any) {
        setConnectionStatus(`Connection error: ${error?.message || 'Unknown error'}`)
        console.error('Supabase connection error:', error)
      }
    }
    
    fetchCustomers()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Skill Shop
        </h1>
        <p className="text-center mb-4">
          スキルを売りたい人と買いたい人をつなぐマッチングプラットフォーム
        </p>

        {/* ログイン・登録リンク */}
        <div className="flex justify-center gap-4 my-8">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ログイン
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            新規登録
          </Link>
        </div>

        {/* 画像アップロードと表示機能へのリンク */}
        <div className="flex justify-center gap-4 my-4">
          <Link 
            href="/upload" 
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            画像をアップロード
          </Link>
          <Link 
            href="/gallery" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            画像ギャラリーを見る
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-center mb-4">
            Supabase Status: <span className={connectionStatus.includes('error') ? 'text-red-500' : 'text-green-500'}>{connectionStatus}</span>
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass</th>
                  <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.pass}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(customer.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
