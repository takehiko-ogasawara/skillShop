'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthGuard } from '../components/AuthGuard'
import Image from 'next/image'

type Post = {
  id: string
  created_at: string
  image_url: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('customer.post.images')
          .list()

        if (listError) throw listError

        const posts = await Promise.all(
          files.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('customer.post.images')
              .getPublicUrl(file.name)

            return {
              id: file.name,
              created_at: file.created_at,
              image_url: publicUrl
            }
          })
        )

        // 作成日時の新しい順にソート
        posts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        setPosts(posts)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center p-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">
            Skill Shop
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              まだ投稿がありません。最初の投稿をしてみましょう！
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={post.image_url}
                      alt="投稿画像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
