'use client'
// Next.jsのクライアントコンポーネントを宣言。インタラクティブな機能を使用するため必要

import { useState } from 'react'
// Reactのstate管理のためのフックをインポート
import { supabase } from '../../lib/supabase'
// Supabaseクライアントをインポート
import Link from 'next/link'
// ページ間のナビゲーション用のNextjsコンポーネント

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

  // ファイル選択時のハンドラー関数
  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files?.[0] || null
    // 選択されたファイルを取得
    setFile(selectedFile)
    // fileステートを更新
    setUploadError(null)
    // エラーをリセット
    setUploadSuccess(false)
    // 成功状態をリセット
    
    // 選択された画像のプレビューを作成
    if (selectedFile) {
      const reader = new FileReader()
      // FileReaderオブジェクトを作成
      reader.onloadend = () => {
        setPreview(reader.result as string)
        // 読み込み完了時にプレビューを設定
      }
      reader.readAsDataURL(selectedFile)
      // ファイルをData URL形式で読み込み
    } else {
      setPreview(null)
      // ファイルがない場合はプレビューをクリア
    }
  }

  // アップロードボタンクリック時のハンドラー関数
  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload')
      // ファイルが選択されていない場合はエラー
      return
    }

    try {
      setUploading(true)
      // アップロード中フラグを設定
      setUploadError(null)
      // エラーをリセット
      
      // タイムスタンプとランダム文字列を使用してユニークなファイル名を生成
      const fileExt = file.name.split('.').pop()
      // ファイル拡張子を取得
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      // ユニークなファイル名を生成
      const filePath = `${fileName}`
      // ファイルパスを設定

      // Supabase Storageにファイルをアップロード
      const { error } = await supabase.storage
        .from('user_post_images')
        // バケット名を指定
        .upload(filePath, file)
        // ファイルをアップロード

      if (error) {
        throw error
        // エラーがあれば例外をスロー
      }

      setUploadSuccess(true)
      // アップロード成功フラグを設定
      setFile(null)
      // ファイル選択をリセット
      setPreview(null)
      // プレビューをリセット
      
      // ファイル入力フィールドをリセット
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
        // 入力値をクリア
      }
    } catch (error: any) {
      setUploadError(error.message || 'Error uploading file')
      // エラーメッセージを設定
      console.error('Error uploading file:', error)
      // コンソールにエラーを出力
    } finally {
      setUploading(false)
      // アップロード中フラグをリセット
    }
  }

  // コンポーネントのレンダリング
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {/* メインコンテナ */}
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {/* コンテンツコンテナ */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Upload Image
          {/* ページタイトル */}
        </h1>
        
        <div className="mb-6 flex justify-between">
          {/* ナビゲーションリンク */}
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            ← Back to Home
            {/* ホームページへのリンク */}
          </Link>
          <Link href="/gallery" className="text-blue-500 hover:text-blue-700">
            View Gallery →
            {/* ギャラリーページへのリンク */}
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* アップロードフォームコンテナ */}
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
              {/* ファイル選択ラベル */}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {/* 画像ファイルのみ許可、ファイル選択時のイベントハンドラー、スタイリング */}
          </div>

          {preview && (
            // プレビューが存在する場合のみ表示
            <div className="mt-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={preview}
                  alt="Preview" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
                {/* プレビュー画像のソース、画像のスタイリング */}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium 
              ${!file || uploading 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
            {/* アップロードボタンのクリックハンドラー、アップロード中またはファイルがない場合は無効化、ボタンテキスト */}
          </button>

          {uploadError && (
            // エラーがある場合のみ表示
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {uploadError}
              {/* エラーメッセージ */}
            </div>
          )}

          {uploadSuccess && (
            // アップロード成功時のみ表示
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              Image uploaded successfully!
              {/* 成功メッセージ */}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
