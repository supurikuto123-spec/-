const Database = require('better-sqlite3');
const path = require('path');

/**
 * メールストアクラス（SQLite実装）
 * ログイン機能付き、自動削除なし
 */
class MailStore {
  constructor(dbPath = null) {
    // 絶対パスでDBファイルを指定（VPS永続化対策）
    const finalDbPath = dbPath || process.env.DB_PATH || path.join(__dirname, '../data.db');
    this.db = new Database(finalDbPath);

    // DB initialized right away
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        address TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS mails (
        id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        subject TEXT,
        sender TEXT,
        body TEXT,
        html TEXT,
        received_at INTEGER NOT NULL,
        FOREIGN KEY(address) REFERENCES users(address) ON DELETE CASCADE
      );

      -- 削除済みも含む累計メール記録テーブル
      CREATE TABLE IF NOT EXISTS mail_logs (
        id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        subject TEXT,
        sender TEXT,
        received_at INTEGER NOT NULL
      );

      -- 削除されても減らない累計統計テーブル
      CREATE TABLE IF NOT EXISTS cumulative_stats (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      );

      -- インデックス作成
      CREATE INDEX IF NOT EXISTS idx_mail_logs_address ON mail_logs(address);
      CREATE INDEX IF NOT EXISTS idx_mail_logs_received ON mail_logs(received_at);
    `);

    // 初期値を設定（なければ作成）
    this.db.prepare(`INSERT OR IGNORE INTO cumulative_stats (key, value) VALUES ('total_addresses', 0)`).run();
    this.db.prepare(`INSERT OR IGNORE INTO cumulative_stats (key, value) VALUES ('total_mails', 0)`).run();
  }

  async init() {
    // Keep for compatibility with server.js
    return Promise.resolve();
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
  async generateAddress() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let local = '';
    for (let i = 0; i < 10; i++) {
      local += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const address = `${local}@sutemeado.com`;
    const password = this.generateRandomString(10);
    const normalized = this.normalizeAddress(address);
    const now = Date.now();
    
    const stmt = this.db.prepare('INSERT INTO users (address, password, created_at) VALUES (?, ?, ?)');
    stmt.run(normalized, password, now);
    
    // 累計アドレスカウンターを増加（削除されても減らない）
    this.db.prepare(`INSERT INTO cumulative_stats (key, value) VALUES ('total_addresses', 1) ON CONFLICT(key) DO UPDATE SET value = value + 1`).run();
    
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
  async verifyPassword(address, password) {
    const normalized = this.normalizeAddress(address);
    const stmt = this.db.prepare('SELECT password FROM users WHERE address = ?');
    const user = stmt.get(normalized);
    return user && user.password === password;
  }

  /**
   * アドレスが存在するかチェック
   */
  async addressExists(address) {
    const normalized = this.normalizeAddress(address);
    const stmt = this.db.prepare('SELECT address FROM users WHERE address = ?');
    const user = stmt.get(normalized);
    return !!user;
  }

  /**
   * メールを追加
   */
  async addMail(address, mailData) {
    const normalized = this.normalizeAddress(address);
    const now = Date.now();
    const id = `mail_${now}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if user exists
    const exists = await this.addressExists(normalized);
    if (!exists) {
      return null;
    }

    const insertStmt = this.db.prepare(
      'INSERT INTO mails (id, address, subject, sender, body, html, received_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    insertStmt.run(
      id,
      normalized,
      mailData.subject || '(件名なし)',
      mailData.from || 'unknown@example.com',
      mailData.body || '',
      mailData.html || null,
      now
    );

    // 累計ログにも追加（削除されても残る）
    const logStmt = this.db.prepare(
      'INSERT INTO mail_logs (id, address, subject, sender, received_at) VALUES (?, ?, ?, ?, ?)'
    );
    logStmt.run(
      id,
      normalized,
      mailData.subject || '(件名なし)',
      mailData.from || 'unknown@example.com',
      now
    );

    // 累計カウンターを増加（削除されても減らない）
    this.db.prepare(`INSERT INTO cumulative_stats (key, value) VALUES ('total_mails', 1) ON CONFLICT(key) DO UPDATE SET value = value + 1`).run();

    // Enforce 100 mails limit per user
    const selectStmt = this.db.prepare('SELECT id FROM mails WHERE address = ? ORDER BY received_at DESC');
    const mails = selectStmt.all(normalized);
    if (mails.length > 100) {
      const idsToDelete = mails.slice(100).map(m => m.id);
      const deleteStmt = this.db.prepare(`DELETE FROM mails WHERE id IN (${idsToDelete.map(() => '?').join(',')})`);
      deleteStmt.run(...idsToDelete);
    }

    return {
      id,
      subject: mailData.subject || '(件名なし)',
      from: mailData.from || 'unknown@example.com',
      body: mailData.body || '',
      html: mailData.html || null,
      receivedAt: now,
      receivedAtFormatted: new Date(now).toLocaleString('ja-JP')
    };
  }

  /**
   * アドレスの全メールを取得（パスワード必須）
   */
  async getMails(address, password) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    const stmt = this.db.prepare('SELECT * FROM mails WHERE address = ? ORDER BY received_at DESC');
    const rows = stmt.all(normalized);
    return rows.map(row => ({
      id: row.id,
      subject: row.subject,
      from: row.sender,
      body: row.body,
      html: row.html,
      receivedAt: row.received_at,
      receivedAtFormatted: new Date(row.received_at).toLocaleString('ja-JP')
    }));
  }

  /**
   * 特定のメールを取得（パスワード必須）
   */
  async getMail(address, password, mailId) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    const stmt = this.db.prepare('SELECT * FROM mails WHERE address = ? AND id = ?');
    const row = stmt.get(normalized, mailId);
    if (!row) return false;

    return {
      id: row.id,
      subject: row.subject,
      from: row.sender,
      body: row.body,
      html: row.html,
      receivedAt: row.received_at,
      receivedAtFormatted: new Date(row.received_at).toLocaleString('ja-JP')
    };
  }

  /**
   * メールを削除（パスワード必須）
   */
  async deleteMail(address, password, mailId) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    const stmt = this.db.prepare('DELETE FROM mails WHERE address = ? AND id = ?');
    const result = stmt.run(normalized, mailId);
    return result.changes > 0;
  }

  /**
   * アドレスの全メールを削除（パスワード必須）
   */
  async clearMails(address, password) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    const stmt = this.db.prepare('DELETE FROM mails WHERE address = ?');
    stmt.run(normalized);
    return true;
  }

  /**
   * アドレスを完全に削除（パスワード必須）
   */
  async deleteAddress(address, password) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    this.db.prepare('DELETE FROM mails WHERE address = ?').run(normalized);
    this.db.prepare('DELETE FROM users WHERE address = ?').run(normalized);
    return true;
  }

  /**
   * パスワードを変更（現在のパスワード必須）
   */
  async changePassword(address, currentPassword, newPassword) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, currentPassword))) {
      return null;
    }
    
    const stmt = this.db.prepare('UPDATE users SET password = ? WHERE address = ?');
    stmt.run(newPassword, normalized);
    return true;
  }

  /**
   * アドレスごとの累計受信メール数を取得（削除されても減らない）
   */
  async getCumulativeMailCount(address) {
    const normalized = this.normalizeAddress(address);
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM mail_logs WHERE address = ?');
    const result = stmt.get(normalized);
    return result ? result.count : 0;
  }

  /**
   * 統計情報を取得
   * 削除されても減らない累計カウンター
   */
  async getStats() {
    // 削除されても減らない累計値を取得
    const addrStat = this.db.prepare("SELECT value FROM cumulative_stats WHERE key = 'total_addresses'").get();
    const mailStat = this.db.prepare("SELECT value FROM cumulative_stats WHERE key = 'total_mails'").get();

    // 現在の値（減る可能性あり）
    const currentUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    const currentMails = this.db.prepare('SELECT COUNT(*) as count FROM mails').get();

    return {
      // 削除されても減らない累計値（メーター表示用）
      totalAddressesAllTime: addrStat ? addrStat.value : 0,
      totalMailsAllTime: mailStat ? mailStat.value : 0,
      // 現在の値
      currentMailboxes: currentUsers.count,
      currentMails: currentMails.count
    };
  }
}

module.exports = MailStore;
