import { supabase } from './supabase';
import { hashPassword, verifyPassword } from '../libs/auth';

// 顧客ユーザーの型定義
export interface CustomerUser {
  customer_user_id: number;
  created_at: string;
  email: string;
  pass: string;
}

// テーブル名の定数
export const CUSTOMER_USERS_TABLE = 'customer_users';

/**
 * 顧客ユーザーログイン処理
 * @param {string} email メールアドレス
 * @param {string} password パスワード
 * @returns {Promise<CustomerUser>} 顧客ユーザー情報
 * @throws {Error} メールアドレスまたはパスワードが正しくありません
 */
export async function loginCustomerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data.user
}

/**
 * 顧客ユーザー登録処理
 * @param {string} email メールアドレス
 * @param {string} password パスワード
 * @returns {Promise<CustomerUser>} 登録された顧客ユーザー情報
 * @throws {Error} 登録に失敗した場合のエラーメッセージ
 */
export async function registerCustomerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data.user
}

export async function logoutCustomerUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 顧客ユーザー情報取得処理
export async function getCustomerUserById(userId: number): Promise<CustomerUser> {
  const { data, error } = await supabase
    .from<CustomerUser>(CUSTOMER_USERS_TABLE)
    .select('*')
    .eq('customer_user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('ユーザー情報の取得に失敗しました: ' + (error?.message || '不明なエラー'));
  }

  return data;
}
