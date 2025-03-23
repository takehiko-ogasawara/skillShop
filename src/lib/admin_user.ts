import { supabase } from './supabase';
import { hashPassword, verifyPassword } from './auth';

// 管理者ユーザーの型定義
export interface AdminUser {
  admin_user_id: number;
  created_at: string;
  username: string;
  admin_pass: string;
}

// テーブル名の定数
export const ADMIN_USERS_TABLE = 'admin_users';

// 管理者ユーザーログイン処理
export async function loginAdminUser(username: string, password: string): Promise<AdminUser> {
  // ユーザー名でユーザーを検索
  const { data, error: fetchError } = await supabase
    .from<AdminUser>(ADMIN_USERS_TABLE)
    .select('*')
    .eq('username', username)
    .limit(1)
    .single();

  if (fetchError || !data) {
    throw new Error('ユーザー名またはパスワードが正しくありません');
  }

  // パスワードを検証
  const isValid = await verifyPassword(password, data.admin_pass);
  if (!isValid) {
    throw new Error('ユーザー名またはパスワードが正しくありません');
  }

  return data;
}

// 管理者ユーザー登録処理
export async function registerAdminUser(username: string, password: string): Promise<AdminUser> {
  // ユーザー名が既に存在するか確認
  const { data: existingUser } = await supabase
    .from<AdminUser>(ADMIN_USERS_TABLE)
    .select('username')
    .eq('username', username)
    .limit(1)
    .single();

  if (existingUser) {
    throw new Error('このユーザー名は既に使用されています');
  }

  // パスワードをハッシュ化
  const hashedPassword = await hashPassword(password);
  
  // 新しいユーザーを作成
  const { data, error: insertError } = await supabase
    .from<AdminUser>(ADMIN_USERS_TABLE)
    .insert([
      { username, admin_pass: hashedPassword } as Partial<AdminUser>
    ])
    .single();

  if (insertError || !data) {
    throw new Error('ユーザー登録に失敗しました: ' + (insertError?.message || '不明なエラー'));
  }

  return data;
}

// 管理者ユーザー情報取得処理
export async function getAdminUserById(userId: number): Promise<AdminUser> {
  const { data, error } = await supabase
    .from<AdminUser>(ADMIN_USERS_TABLE)
    .select('*')
    .eq('admin_user_id', userId)
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('ユーザー情報の取得に失敗しました: ' + (error?.message || '不明なエラー'));
  }

  return data;
}
