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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="relative aspect-[4/5] bg-gray-200 dark:bg-gray-700" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  )
}

// デフォルト画像のコンポーネント
function DefaultPost() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <svg
          className="w-16 h-16 text-gray-300 dark:text-gray-600"
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
        <p className="text-sm text-gray-500 dark:text-gray-400">画像をアップロードしてください</p>
      </div>
    </div>
  )
}

// 画像コンポーネント
function PostImage({ imageUrl, createdAt }: { imageUrl: string; createdAt: string }) {
  return (
    <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={imageUrl}
          alt="投稿画像"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <p className="text-sm text-white">
          {new Date(createdAt).toLocaleString('ja-JP')}
        </p>
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
      <main className="flex min-h-screen flex-col items-center p-4 bg-white dark:bg-gray-900">
        <div className="w-[390px] mx-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Skill Shop
          </h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <SkeletonPost key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400 text-center p-4">{error}</div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 ? (
                // 投稿がない場合は4つのデフォルト画像を表示
                [...Array(4)].map((_, index) => (
                  <DefaultPost key={index} />
                ))
              ) : (
                // 投稿がある場合は最大4つまで表示
                posts.slice(0, 4).map((post) => (
                  <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <PostImage imageUrl={post.image_url} createdAt={post.created_at} />
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
