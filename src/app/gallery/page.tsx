'use client'
// Next.jsのクライアントコンポーネントを宣言

import { useEffect, useState } from 'react'
// Reactのフックをインポート
import { supabase } from '../../lib/supabase'
// Supabaseクライアントをインポート
import Link from 'next/link'
// ページ間のナビゲーション用のNextjsコンポーネント
import Image from 'next/image'
// Next.jsの最適化された画像コンポーネント

// 画像情報の型定義
type ImageInfo = {
  name: string
  url: string
  created_at: string
}

export default function GalleryPage() {
  // ギャラリーページのメインコンポーネント
  const [images, setImages] = useState<ImageInfo[]>([])
  // 画像リストを保存するstate
  const [loading, setLoading] = useState(true)
  // ローディング状態を示すstate
  const [error, setError] = useState<string | null>(null)
  // エラーメッセージを保存するstate

  // ページ読み込み時に画像リストを取得
  useEffect(() => {
    fetchImages()
  }, [])

  // Supabaseから画像リストを取得する関数
  const fetchImages = async () => {
    try {
      setLoading(true)
      // ローディング状態を設定
      setError(null)
      // エラーをリセット

      // Supabase Storageからファイルリストを取得
      const { data, error } = await supabase
        .storage
        .from('user_post_images')
        .list()

      if (error) {
        throw error
        // エラーがあれば例外をスロー
      }

      if (data) {
        // 各ファイルの公開URLを取得
        const imageList = await Promise.all(
          data.map(async (file) => {
            // 公開URLを取得
            const { data: publicUrl } = supabase
              .storage
              .from('user_post_images')
              .getPublicUrl(file.name)

            return {
              name: file.name,
              url: publicUrl.publicUrl,
              created_at: file.created_at || new Date().toISOString()
            }
          })
        )

        // 新しい順に並べ替え
        const sortedImages = imageList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        setImages(sortedImages)
        // 画像リストを更新
      }
    } catch (error: any) {
      setError(error.message || 'Error loading images')
      // エラーメッセージを設定
      console.error('Error loading images:', error)
      // コンソールにエラーを出力
    } finally {
      setLoading(false)
      // ローディング状態をリセット
    }
  }

  // 画像を削除する関数
  const handleDelete = async (imageName: string) => {
    try {
      // 削除の確認
      if (!confirm('この画像を削除してもよろしいですか？')) {
        return
      }

      // Supabase Storageからファイルを削除
      const { error } = await supabase
        .storage
        .from('user_post_images')
        .remove([imageName])

      if (error) {
        throw error
        // エラーがあれば例外をスロー
      }

      // 削除した画像をリストから除外
      setImages(images.filter(img => img.name !== imageName))
      // 画像リストを更新
    } catch (error: any) {
      alert(`削除エラー: ${error.message || 'Unknown error'}`)
      // エラーメッセージを表示
      console.error('Error deleting image:', error)
      // コンソールにエラーを出力
    }
  }

  // コンポーネントのレンダリング
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {/* メインコンテナ */}
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {/* コンテンツコンテナ */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Image Gallery
          {/* ページタイトル */}
        </h1>
        
        <div className="mb-6 flex justify-between">
          {/* ナビゲーションリンク */}
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            ← Back to Home
            {/* ホームページへのリンク */}
          </Link>
          <Link href="/upload" className="text-blue-500 hover:text-blue-700">
            Upload New Image →
            {/* アップロードページへのリンク */}
          </Link>
        </div>

        {loading && (
          // ローディング中の表示
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          // エラーがある場合の表示
          <div className="my-8 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
            {/* エラーメッセージ */}
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          // 画像がない場合の表示
          <div className="my-8 p-4 bg-gray-100 text-gray-700 rounded-md text-center">
            No images found. Please upload some images.
            {/* 画像がない場合のメッセージ */}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* 画像グリッド */}
          {images.map((image) => (
            <div key={image.name} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* 画像カード */}
              <div className="relative h-48 w-full">
                {/* 画像コンテナ */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  // 画像表示
                />
              </div>
              <div className="p-4">
                {/* 画像情報 */}
                <p className="text-sm text-gray-500 truncate" title={image.name}>
                  {image.name}
                  {/* ファイル名 */}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(image.created_at).toLocaleString()}
                  {/* アップロード日時 */}
                </p>
                <div className="mt-3 flex justify-between">
                  {/* アクションボタン */}
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View Full Size
                    {/* フルサイズ表示リンク */}
                  </a>
                  <button
                    onClick={() => handleDelete(image.name)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                    {/* 削除ボタン */}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
