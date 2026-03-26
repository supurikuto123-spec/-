const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * メールストアクラス（SQLite実装）
 * ログイン機能付き、自動削除なし
 * リアルタイムバックアップ機能付き
 */
class MailStore {
  constructor(dbPath = null) {
    // 絶対パスでDBファイルを指定（VPS永続化対策）
    const finalDbPath = dbPath || process.env.DB_PATH || path.join(__dirname, '../data.db');
    this.dbPath = finalDbPath;
    this.db = new Database(finalDbPath);
    
    // バックアップディレクトリ設定
    this.backupDir = process.env.BACKUP_DIR || path.join(path.dirname(finalDbPath), 'backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    // 最大バックアップ数（古いものから削除）
    this.maxBackups = 50;

    // DB initialized right away
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        address TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        password_version INTEGER NOT NULL DEFAULT 1,
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
    // Ensure mail_logs table exists (for databases created before this table was added)
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS mail_logs (
          id TEXT PRIMARY KEY,
          address TEXT NOT NULL,
          subject TEXT,
          sender TEXT,
          received_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_mail_logs_address ON mail_logs(address);
        CREATE INDEX IF NOT EXISTS idx_mail_logs_received ON mail_logs(received_at);
      `);
    } catch (err) {
      console.warn('Failed to create mail_logs table:', err.message);
    }
    return Promise.resolve();
  }

  /**
   * リアルタイムバックアップを作成
   * すべての書き込み操作後に呼び出す - 非同期で実行してブロックしない
   */
  createBackup(operation = 'write') {
    // 非同期で実行してAPIレスポンスをブロックしない
    setImmediate(() => {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupDir, `data.db.${operation}.${timestamp}`);
        
        // 単純コピー（確実で速い）
        fs.copyFile(this.dbPath, backupFile, (err) => {
          if (err) {
            console.error('[BACKUP] Failed:', err.message);
            return;
          }
          console.log(`[BACKUP] Created: ${backupFile}`);
          
          // 古いバックアップをクリーンアップ（非同期）
          setImmediate(() => this.cleanupOldBackups());
        });
      } catch (err) {
        console.error('[BACKUP] Error:', err.message);
      }
    });
  }
  
  /**
   * 古いバックアップをクリーンアップ
   */
  cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('data.db.'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // 新しい順
      
      // 最大数を超えた古いファイルを削除
      if (files.length > this.maxBackups) {
        const toDelete = files.slice(this.maxBackups);
        for (const file of toDelete) {
          fs.unlinkSync(file.path);
          console.log(`[BACKUP] Cleaned up old: ${file.name}`);
        }
      }
    } catch (err) {
      console.error('[BACKUP] Cleanup error:', err.message);
    }
  }
  
  /**
   * 最新のバックアップから復元
   */
  async restoreFromBackup() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('data.db.'))
        .map(f => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);
      
      if (files.length === 0) {
        throw new Error('No backup files found');
      }
      
      const latestBackup = files[0];
      
      // 現在のDBを閉じる
      this.db.close();
      
      // バックアップをコピー
      fs.copyFileSync(latestBackup.path, this.dbPath);
      
      // DBを再オープン
      this.db = new Database(this.dbPath);
      
      console.log(`[RESTORE] Restored from: ${latestBackup.name}`);
      return { success: true, backupFile: latestBackup.name };
    } catch (err) {
      console.error('[RESTORE] Failed:', err.message);
      return { success: false, error: err.message };
    }
  }
  
  /**
   * バックアップリストを取得
   */
  async listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(f => f.startsWith('data.db.'))
        .map(f => {
          const stat = fs.statSync(path.join(this.backupDir, f));
          return {
            name: f,
            size: stat.size,
            created: new Date(stat.mtime).toISOString()
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));
      
      return files;
    } catch (err) {
      console.error('[BACKUP] List error:', err.message);
      return [];
    }
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
    
    // リアルタイムバックアップ（非同期）
    this.createBackup('create-address');
    
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

    // リアルタイムバックアップ（メール着信時）
    this.createBackup('receive-mail');

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
    
    // リアルタイムバックアップ
    if (result.changes > 0) {
      this.createBackup('delete-mail');
    }
    
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
    
    // リアルタイムバックアップ
    this.createBackup('clear-mails');
    
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
    
    // リアルタイムバックアップ
    this.createBackup('delete-address');
    
    return true;
  }

  /**
   * パスワードを変更（現在のパスワード必須）
   * パスワード変更時にpassword_versionをインクリメントし、他セッションを無効化
   */
  async changePassword(address, currentPassword, newPassword) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, currentPassword))) {
      return null;
    }
    
    // パスワードとバージョンを同時に更新（バージョンをインクリメント）
    const stmt = this.db.prepare('UPDATE users SET password = ?, password_version = password_version + 1 WHERE address = ?');
    stmt.run(newPassword, normalized);
    
    // 新しいバージョンを取得
    const versionStmt = this.db.prepare('SELECT password_version FROM users WHERE address = ?');
    const result = versionStmt.get(normalized);
    
    // リアルタイムバックアップ
    this.createBackup('change-password');
    
    return { success: true, passwordVersion: result ? result.password_version : 1 };
  }

  /**
   * アドレスのパスワードバージョンを取得
   */
  async getPasswordVersion(address) {
    const normalized = this.normalizeAddress(address);
    const stmt = this.db.prepare('SELECT password_version FROM users WHERE address = ?');
    const result = stmt.get(normalized);
    return result ? result.password_version : 1;
  }

  /**
   * アドレスごとの累計受信メール数を取得（削除されても減らない）
   */
  async getCumulativeMailCount(address) {
    try {
      const normalized = this.normalizeAddress(address);
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM mail_logs WHERE address = ?');
      const result = stmt.get(normalized);
      return result ? result.count : 0;
    } catch (err) {
      // mail_logsテーブルが存在しない場合は0を返す
      console.warn('mail_logs table may not exist:', err.message);
      return 0;
    }
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
