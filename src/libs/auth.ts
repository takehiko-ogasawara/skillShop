import { createHash } from 'crypto';

/**
 * パスワードをハッシュ化する
 * @param {string} password ハッシュ化するパスワード
 * @returns {Promise<string>} ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const hash = createHash('sha256');
      hash.update(password);
      resolve(hash.digest('hex'));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * パスワードが正しいか検証する
 * @param {string} password 検証するパスワード
 * @param {string} hashedPassword ハッシュ化されたパスワード
 * @returns {Promise<boolean>} パスワードが正しい場合はtrue
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
} 