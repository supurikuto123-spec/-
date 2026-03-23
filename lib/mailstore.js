/**
 * メールストアクラス（インメモリ実装）
 * ログイン機能付き、自動削除なし
 */
class MailStore {
  constructor() {
    // アドレス -> メール配列 のマップ
    this.mailboxes = new Map();
    // アドレス -> パスワード のマップ
    this.passwords = new Map();
    // アドレス作成日時
    this.createdAt = new Map();
  }

  /**
   * ランダムな文字列を生成（英数字）
   */
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * ランダムなメールアドレスを生成（パスワード付き）
   * 戻り値: { address, password }
   */
  generateAddress() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let local = '';
    for (let i = 0; i < 10; i++) {
      local += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const address = `${local}@sutemeado.com`;
    const password = this.generateRandomString(10);
    const normalized = this.normalizeAddress(address);
    
    // パスワードを保存
    this.passwords.set(normalized, password);
    this.createdAt.set(normalized, Date.now());
    // 空のメールボックスを作成
    this.mailboxes.set(normalized, []);
    
    return { address, password };
  }

  /**
   * メールアドレスを正規化
   */
  normalizeAddress(address) {
    return address.toLowerCase().trim();
  }

  /**
   * パスワードを検証
   */
  verifyPassword(address, password) {
    const normalized = this.normalizeAddress(address);
    const storedPassword = this.passwords.get(normalized);
    return storedPassword && storedPassword === password;
  }

  /**
   * アドレスが存在するかチェック
   */
  addressExists(address) {
    const normalized = this.normalizeAddress(address);
    return this.passwords.has(normalized);
  }

  /**
   * アドレスのパスワードを取得（内部用）
   */
  getPassword(address) {
    const normalized = this.normalizeAddress(address);
    return this.passwords.get(normalized) || null;
  }

  /**
   * メールを追加
   */
  addMail(address, mailData) {
    const normalized = this.normalizeAddress(address);
    const now = Date.now();
    
    // メールオブジェクト作成
    const mail = {
      id: `mail_${now}_${Math.random().toString(36).substr(2, 9)}`,
      subject: mailData.subject || '(件名なし)',
      from: mailData.from || 'unknown@example.com',
      body: mailData.body || '',
      html: mailData.html || null,
      receivedAt: now,
      receivedAtFormatted: new Date(now).toLocaleString('ja-JP')
    };
    
    // ボックスが存在しない場合は作成
    if (!this.mailboxes.has(normalized)) {
      this.mailboxes.set(normalized, []);
    }
    
    // メールを追加（先頭に）
    const mails = this.mailboxes.get(normalized);
    mails.unshift(mail);
    
    // 最大100件制限
    if (mails.length > 100) {
      mails.pop();
    }
    
    return mail;
  }

  /**
   * アドレスの全メールを取得（パスワード必須）
   */
  getMails(address, password) {
    const normalized = this.normalizeAddress(address);
    
    // パスワード検証
    if (!this.verifyPassword(address, password)) {
      return null; // 認証失敗
    }
    
    return this.mailboxes.get(normalized) || [];
  }

  /**
   * 特定のメールを取得（パスワード必須）
   */
  getMail(address, password, mailId) {
    const mails = this.getMails(address, password);
    if (mails === null) return null; // 認証失敗
    return mails.find(m => m.id === mailId) || null;
  }

  /**
   * メールを削除（パスワード必須）
   */
  deleteMail(address, password, mailId) {
    const normalized = this.normalizeAddress(address);
    
    // パスワード検証
    if (!this.verifyPassword(address, password)) {
      return null; // 認証失敗
    }
    
    const mails = this.mailboxes.get(normalized);
    if (!mails) return false;
    
    const index = mails.findIndex(m => m.id === mailId);
    if (index === -1) return false;
    
    mails.splice(index, 1);
    return true;
  }

  /**
   * アドレスの全メールを削除（パスワード必須）
   */
  clearMails(address, password) {
    const normalized = this.normalizeAddress(address);
    
    // パスワード検証
    if (!this.verifyPassword(address, password)) {
      return null; // 認証失敗
    }
    
    this.mailboxes.set(normalized, []);
    return true;
  }

  /**
   * アドレスを完全に削除（パスワード必須）
   */
  deleteAddress(address, password) {
    const normalized = this.normalizeAddress(address);
    
    // パスワード検証
    if (!this.verifyPassword(address, password)) {
      return null; // 認証失敗
    }
    
    this.mailboxes.delete(normalized);
    this.passwords.delete(normalized);
    this.createdAt.delete(normalized);
    return true;
  }

  /**
   * パスワードを変更（現在のパスワード必須）
   */
  changePassword(address, currentPassword, newPassword) {
    const normalized = this.normalizeAddress(address);
    
    // 現在のパスワード検証
    if (!this.verifyPassword(address, currentPassword)) {
      return null; // 認証失敗
    }
    
    // アドレスが存在するか確認
    if (!this.passwords.has(normalized)) {
      return false; // アドレスが存在しない
    }
    
    // 新しいパスワードを保存
    this.passwords.set(normalized, newPassword);
    return true;
  }

  /**
   * 統計情報を取得
   */
  getStats() {
    let totalMails = 0;
    for (const mails of this.mailboxes.values()) {
      totalMails += mails.length;
    }

    return {
      mailboxes: this.mailboxes.size,
      totalMails: totalMails
    };
  }
}

module.exports = MailStore;
