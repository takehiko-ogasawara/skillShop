import { supabase } from './supabase'
import { hashPassword, verifyPassword } from './auth'

// 顧客ユーザーの型定義
export interface CustomerUser {
  id: string
  email: string
  name: string
  created_at: string
}

// テーブル名の定数
export const CUSTOMER_USERS_TABLE = 'customer_users'

/**
 * 顧客ユーザーログイン処理
 * @param {string} email メールアドレス
 * @param {string} password パスワード
 * @returns {Promise<CustomerUser>} 顧客ユーザー情報
 * @throws {Error} メールアドレスまたはパスワードが正しくありません
 */
export async function loginCustomerUser(
  email: string,
  password: string
): Promise<CustomerUser> {
  try {
    // ユーザーを検索
    const { data: user, error: userError } = await supabase
      .from('customer_users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError) {
      throw new Error('ユーザーが見つかりません')
    }

    // パスワードを検証
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      throw new Error('パスワードが正しくありません')
    }

    // パスワードハッシュを除外して返す
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error: any) {
    console.error('ログインエラー:', error)
    throw new Error(error.message || 'ログインに失敗しました')
  }
}

/**
 * 顧客ユーザー登録処理
 * @param {string} email メールアドレス
 * @param {string} password パスワード
 * @param {string} name ユーザー名
 * @returns {Promise<CustomerUser>} 登録された顧客ユーザー情報
 * @throws {Error} 登録に失敗した場合のエラーメッセージ
 */
export async function registerCustomerUser(
  email: string,
  password: string,
  name: string
): Promise<CustomerUser> {
  try {
    // メールアドレスの重複チェック
    const { data: existingUser } = await supabase
      .from('customer_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています')
    }

    // パスワードをハッシュ化
    const passwordHash = await hashPassword(password)

    // ユーザーを作成
    const { data: user, error: createError } = await supabase
      .from('customer_users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
        },
      ])
      .select()
      .single()

    if (createError) {
      throw new Error('ユーザーの作成に失敗しました')
    }

    // パスワードハッシュを除外して返す
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error: any) {
    console.error('登録エラー:', error)
    throw new Error(error.message || '登録に失敗しました')
  }
}

export async function logoutCustomerUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 顧客ユーザー情報取得処理
export async function getCustomerUserById(userId: string): Promise<CustomerUser> {
  const { data, error } = await supabase
    .from<CustomerUser>(CUSTOMER_USERS_TABLE)
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('ユーザー情報の取得に失敗しました: ' + (error?.message || '不明なエラー'));
  }

  return data;
}
