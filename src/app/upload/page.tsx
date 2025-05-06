'use client'
// Next.jsのクライアントコンポーネントを宣言。インタラクティブな機能を使用するため必要

import { useState } from 'react'
// Reactのstate管理のためのフックをインポート
import { supabase } from '../../lib/supabase'
// Supabaseクライアントをインポート
import Link from 'next/link'
// ページ間のナビゲーション用のNextjsコンポーネント
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'

export default function UploadPage() {
  // アップロードページのメインコンポーネント
  const [file, setFile] = useState<File | null>(null)
  // 選択されたファイルを保存するstate
  const [uploading, setUploading] = useState(false)
  // アップロード中かどうかを示すstate
  const [uploadError, setUploadError] = useState<string | null>(null)
  // エラーメッセージを保存するstate
  const [uploadSuccess, setUploadSuccess] = useState(false)
  // アップロード成功を示すstate
  const [preview, setPreview] = useState<string | null>(null)
  // 画像プレビュー用のstate
  const router = useRouter()

  // ファイル選択時のハンドラー関数
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // プレビュー画像の作成
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // アップロードボタンクリック時のハンドラー関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      // ファイル名を一意にするためにタイムスタンプを追加
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('customer.post.images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // アップロード成功後、トップページにリダイレクト
      router.push('/')
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  // コンポーネントのレンダリング
  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">画像をアップロード</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="プレビュー"
                    className="max-h-96 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2">クリックして画像を選択</p>
                  </div>
                )}
              </label>
            </div>

            {uploadError && (
              <div className="text-red-500 text-center">{uploadError}</div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                !file || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </form>
        </div>
      </main>
    </AuthGuard>
  )
}
