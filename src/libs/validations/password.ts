/**
 * パスワードバリデーションのルール定義
 */
export interface PasswordValidationRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

/**
 * デフォルトのパスワードバリデーションルール
 */
export const defaultPasswordRules: PasswordValidationRules = {
  minLength: 5,
  requireLowercase: true,
  requireNumber: true,
};

/**
 * パスワードバリデーション関数
 * @param password バリデーション対象のパスワード
 * @param rules カスタムバリデーションルール（オプション）
 */
export const validatePassword = (
  password: string,
  rules: PasswordValidationRules = defaultPasswordRules
): void => {
  if (password.length < rules.minLength) {
    throw new Error(`パスワードは${rules.minLength}文字以上である必要があります`);
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    throw new Error('パスワードは少なくとも1つの小文字を含む必要があります');
  }

  if (rules.requireNumber && !/[0-9]/.test(password)) {
    throw new Error('パスワードは少なくとも1つの数字を含む必要があります');
  }
}; 