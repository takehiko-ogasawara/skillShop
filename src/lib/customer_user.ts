import { supabase } from './supabase';
import { hashPassword } from './auth';

// 顧客ユーザーの型定義
export interface CustomerUser {
  customer_user_id: number;
  created_at: string;
  username: string;
  pass: string;
}

// テーブル名の定数
export const CUSTOMER_USERS_TABLE = 'customer_users';

/**
 * 顧客ユーザーログイン処理
 * @param {string} username ユーザー名
 * @param {string} password パスワード
 * @returns {Promise<CustomerUser>} 顧客ユーザー情報
 * @throws {Error} ユーザー名またはパスワードが正しくありません
 */
export async function loginCustomerUser(username: string, password: string): Promise<CustomerUser> {
  console.log('ログイン試行:', { username: username });

  try {
    // Supabaseの認証システムを使用してログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username, // ユーザー名をメールアドレスとして使用
      password: password
    });

    if (authError) {
      console.error('認証エラー:', authError);
      throw new Error('ユーザー名またはパスワードが正しくありません');
    }

    // 認証成功後、ユーザー情報を取得
    const { data, error: fetchError } = await supabase
      .from<CustomerUser>(CUSTOMER_USERS_TABLE)
      .select('*')
      .eq('username', username)
      .single();

    if (fetchError || !data) {
      console.error('ユーザー情報取得エラー:', fetchError);
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    return data;
  } catch (error: any) {
    console.error('ログインエラー:', error);
    throw new Error('ユーザー名またはパスワードが正しくありません');
  }
}

/**
 * 顧客ユーザー登録処理
 * @param {string} username ユーザー名
 * @param {string} password パスワード
 * @returns {Promise<CustomerUser>} 登録された顧客ユーザー情報
 * @throws {Error} 登録に失敗した場合のエラーメッセージ
 */
export async function registerCustomerUser(username: string, password: string): Promise<CustomerUser> {
  try {
    // ユーザー名が既に存在するか確認
    const { data: existingUser, error: checkError } = await supabase
      .from<CustomerUser>(CUSTOMER_USERS_TABLE)
      .select('*')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116は「データが見つからない」エラー
      console.error('ユーザー名確認エラー:', checkError);
      throw new Error('ユーザー名の確認に失敗しました');
    }

    if (existingUser) {
      throw new Error('このユーザー名は既に使用されています');
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // Supabaseの認証システムを使用してユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: username, // ユーザー名をメールアドレスとして使用
      password: password
    });

    if (authError) {
      console.error('認証エラー:', authError);
      throw new Error('ユーザー登録に失敗しました');
    }

    if (!authData.user) {
      throw new Error('ユーザー登録に失敗しました');
    }

    // 認証成功後、ユーザー情報を保存
    const { data, error: insertError } = await supabase
      .from<CustomerUser>(CUSTOMER_USERS_TABLE)
      .insert([
        { 
          username, 
          pass: hashedPassword,
          customer_user_id: parseInt(authData.user.id) // Supabaseの認証IDを使用
        } 
      ])
      .select()
      .single();

    if (insertError || !data) {
      console.error('ユーザー情報保存エラー:', insertError);
      // エラーが発生した場合、作成された認証ユーザーを削除
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('ユーザー情報の保存に失敗しました');
    }

    return data;
  } catch (error: any) {
    console.error('登録エラー:', error);
    throw new Error(error.message || 'ユーザー登録に失敗しました');
  }
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
