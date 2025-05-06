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
export async function loginCustomerUser(email: string, password: string): Promise<CustomerUser> {
  console.log('ログイン試行:', { email: email });

  try {
    // メールアドレスでユーザーを検索
    const { data, error: fetchError } = await supabase
      .from<CustomerUser>(CUSTOMER_USERS_TABLE)
      .select('*')
      .eq('email', email);

    if (fetchError) {
      console.error('ユーザー検索エラー:', fetchError);
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    // レコードが0件または2件以上の場合はエラー
    if (!data || data.length !== 1) {
      console.error('ユーザー検索結果が不正:', data?.length);
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const user = data[0];

    // パスワードを検証
    const isValid = await verifyPassword(password, user.pass);
    if (!isValid) {
      console.error('パスワード検証エラー');
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    return user;
  } catch (error: any) {
    console.error('ログインエラー:', error);
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }
}

/**
 * 顧客ユーザー登録処理
 * @param {string} email メールアドレス
 * @param {string} password パスワード
 * @returns {Promise<CustomerUser>} 登録された顧客ユーザー情報
 * @throws {Error} 登録に失敗した場合のエラーメッセージ
 */
export async function registerCustomerUser(email: string, password: string): Promise<CustomerUser> {
  try {
    // メールアドレスが既に存在するか確認
    const { data: existingUser, error: checkError } = await supabase
      .from<CustomerUser>(CUSTOMER_USERS_TABLE)
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116は「データが見つからない」エラー
      console.error('メールアドレス確認エラー:', checkError);
      throw new Error('メールアドレスの確認に失敗しました');
    }

    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザー情報を保存
    const { data, error: insertError } = await supabase
      .from<CustomerUser>(CUSTOMER_USERS_TABLE)
      .insert([
        { 
          email, 
          pass: hashedPassword
          // customer_user_idは自動生成されるため指定しない
          // created_atはデフォルト値が設定されるため指定しない
        } 
      ])
      .select()
      .single();

    if (insertError || !data) {
      console.error('ユーザー情報保存エラー:', insertError);
      console.error('エラー詳細:', {
        code: insertError?.code,
        message: insertError?.message,
        details: insertError?.details,
        hint: insertError?.hint
      });
      throw new Error(`ユーザー情報の保存に失敗しました: ${insertError?.message || '不明なエラー'}`);
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
