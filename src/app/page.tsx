'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/libs/supabase'
import { AuthGuard } from '../components/AuthGuard'

type Post = {
  id: string
  created_at: string
  image_url: string
}

type FileObject = {
  name: string
  created_at: string
}

// スケルトンUIのコンポーネント
function SkeletonPost() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="relative aspect-square bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

// デフォルト画像のコンポーネント
function DefaultPost() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500">画像をアップロードしてください</p>
      </div>
    </div>
  )
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
          (files as FileObject[]).map(async (file) => {
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
        posts.sort((a: Post, b: Post) => 
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
        <div className="w-[390px]">
          <h1 className="text-3xl font-bold text-center mb-8">
            Skill Shop
          </h1>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <SkeletonPost key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {posts.length === 0 ? (
                // 投稿がない場合は4つのデフォルト画像を表示
                [...Array(4)].map((_, index) => (
                  <DefaultPost key={index} />
                ))
              ) : (
                // 投稿がある場合は最大4つまで表示
                posts.slice(0, 4).map((post) => (
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
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
