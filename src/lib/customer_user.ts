import { supabase } from './supabase';
import { hashPassword, verifyPassword } from './auth';

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

  let data: CustomerUser | null = null;
  let fetchError: any = null;

  try {
    // ユーザー名でユーザーを検索
    const response = await supabase
      .from<CustomerUser>(CUSTOMER_USERS_TABLE)
      .select('*')
      .eq('username', username)
      .single();

    data = response.data;
    fetchError = response.error;
  } catch (error: any) {
    console.error('Supabaseエラー:', error);
    throw new Error('ユーザー名またはパスワードが正しくありません'); // Supabase APIエラーをキャッチ
  }

  if (fetchError || !data) {
    console.log('ユーザーが見つかりませんでした:', { fetchError: fetchError, data: data });
    throw new Error('ユーザー名またはパスワードが正しくありません');
  }

  console.log('ユーザーデータ:', { data: data });

  // パスワードを検証
  const isValid = await verifyPassword(password, data.pass);
  console.log('パスワード検証:', { isValid: isValid });
  if (!isValid) {
    throw new Error('ユーザー名またはパスワードが正しくありません');
  }

  return data;
}

// 顧客ユーザー登録処理
export async function registerCustomerUser(username: string, password: string): Promise<CustomerUser> {
  // ユーザー名が既に存在するか確認
  await new Promise(resolve => setTimeout(resolve, 500)); // 0.5秒待機

  const { data: existingUser, error } = await supabase
    .from<CustomerUser>(CUSTOMER_USERS_TABLE)
    .select('*')
    .eq('username', username)
    .limit(1)
    .single();

  console.log('existingUser:', existingUser);

  if (error) {
    console.error('ユーザー名確認エラー:', error);
    throw new Error('ユーザー名の確認に失敗しました');
  }

  if (existingUser !== null) {
    throw new Error('このユーザー名は既に使用されています');
  }

  // パスワードをハッシュ化
  const hashedPassword = await hashPassword(password);
  
  // 新しいユーザーを作成
  const { data, error: insertError } = await supabase
    .from<CustomerUser>(CUSTOMER_USERS_TABLE)
    .insert([
      { username, pass: hashedPassword } as Partial<CustomerUser>
    ])
    .single();

  if (insertError || !data) {
    throw new Error('ユーザー登録に失敗しました: ' + (insertError?.message || '不明なエラー'));
  }

  return data;
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
