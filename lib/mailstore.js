/**
 * メールストアクラス（インメモリ実装）
 * MVP版ではメモリ内にデータを保持
 */
class MailStore {
  constructor() {
    // アドレス -> メール配列 のマップ
    this.mailboxes = new Map();
    // アドレスごとの有効期限
    this.expiry = new Map();
    // デフォルトの有効期限（24時間）
    this.DEFAULT_TTL = 24 * 60 * 60 * 1000;
    
    // 期限切れクリーンアップ（1時間ごと）
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  /**
   * ランダムなメールアドレスを生成
   */
  generateAddress() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let local = '';
    for (let i = 0; i < 10; i++) {
      local += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${local}@sutemeado.com`;
  }

  /**
   * メールアドレスを正規化
   */
  normalizeAddress(address) {
    return address.toLowerCase().trim();
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
    
    // 有効期限を更新
    this.expiry.set(normalized, now + this.DEFAULT_TTL);
    
    return mail;
  }

  /**
   * アドレスの全メールを取得
   */
  getMails(address) {
    const normalized = this.normalizeAddress(address);
    const mails = this.mailboxes.get(normalized) || [];
    
    // 有効期限を更新（アクセス時に延長）
    if (this.mailboxes.has(normalized)) {
      this.expiry.set(normalized, Date.now() + this.DEFAULT_TTL);
    }
    
    return mails;
  }

  /**
   * 特定のメールを取得
   */
  getMail(address, mailId) {
    const mails = this.getMails(address);
    return mails.find(m => m.id === mailId) || null;
  }

  /**
   * メールを削除
   */
  deleteMail(address, mailId) {
    const normalized = this.normalizeAddress(address);
    const mails = this.mailboxes.get(normalized);
    
    if (!mails) return false;
    
    const index = mails.findIndex(m => m.id === mailId);
    if (index === -1) return false;
    
    mails.splice(index, 1);
    return true;
  }

  /**
   * アドレスの全メールを削除
   */
  clearMails(address) {
    const normalized = this.normalizeAddress(address);
    this.mailboxes.delete(normalized);
    this.expiry.delete(normalized);
  }

  /**
   * 期限切れデータのクリーンアップ
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [address, expiryTime] of this.expiry.entries()) {
      if (now > expiryTime) {
        this.mailboxes.delete(address);
        this.expiry.delete(address);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired mailboxes`);
    }
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
