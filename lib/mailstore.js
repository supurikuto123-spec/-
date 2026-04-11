const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const BCRYPT_SALT_ROUNDS = 10;

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
    this.db.pragma('busy_timeout = 5000');
    
    // バックアップディレクトリ設定
    this.backupDir = process.env.BACKUP_DIR || path.join(path.dirname(finalDbPath), 'backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    // 最大バックアップ数（古いものから削除）
    this.maxBackups = 20; // 減らしてディスクI/O負荷を軽減
    
    // バックアップロック（同時実行防止）
    this.backupLock = false;
    this.cleanupScheduled = false;

    // DB initialized right away
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        address TEXT PRIMARY KEY,
        password TEXT,  -- 旧：平文パスワード（移行完了後に削除予定）
        password_hash TEXT, -- 新：bcryptハッシュ化パスワード
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
        saved INTEGER NOT NULL DEFAULT 0,  -- 0=未保存, 1=保存済み
        saved_at INTEGER,  -- 保存された時刻
        expires_at INTEGER NOT NULL,  -- 自動削除予定時刻（30日後）
        FOREIGN KEY(address) REFERENCES users(address) ON DELETE CASCADE
      );

      -- 保存済みメールのインデックス
      CREATE INDEX IF NOT EXISTS idx_mails_saved ON mails(saved);
      CREATE INDEX IF NOT EXISTS idx_mails_expires ON mails(expires_at);

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
    
    // マイグレーション：既存のusersテーブルにpassword_hashカラムを追加し、passwordカラムをNULL許可に変更
    try {
      const tableInfo = this.db.prepare("PRAGMA table_info(users)").all();
      const hasPasswordHash = tableInfo.some(col => col.name === 'password_hash');
      const hasPasswordNotNull = tableInfo.some(col => col.name === 'password' && col.notnull === 1);
      
      if (!hasPasswordHash || hasPasswordNotNull) {
        console.log('[MIGRATION] Migrating users table schema...');
        // SQLiteでは制約変更できないため、テーブルを再作成
        // 外部キー制約を一時的に無効化して、mailsテーブルのデータを保護
        this.db.exec(`
          PRAGMA foreign_keys = OFF;
          
          CREATE TABLE users_new (
            address TEXT PRIMARY KEY,
            password TEXT,  -- NULL許可
            password_hash TEXT,
            password_version INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL
          );
          
          INSERT INTO users_new (address, password, password_hash, password_version, created_at)
          SELECT address, password, NULL, password_version, created_at FROM users;
          
          DROP TABLE users;
          ALTER TABLE users_new RENAME TO users;
          
          PRAGMA foreign_keys = ON;
        `);
        console.log('[MIGRATION] Migration completed');
      }
    } catch (err) {
      console.warn('Migration warning:', err.message);
    }
    
    return Promise.resolve();
  }

  /**
   * リアルタイムバックアップを作成
   * 非同期で実行してAPIレスポンスをブロックしない
   */
  createBackup(operation = 'write') {
    // ロックチェック（同時実行防止）
    if (this.backupLock) {
      console.log('[BACKUP] Skipped: another backup in progress');
      return;
    }
    
    this.backupLock = true;
    
    setImmediate(() => {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupDir, `data.db.${operation}.${timestamp}`);
        
        // ストリームベースで非同期コピー（メモリ効率が良い）
        const readStream = fs.createReadStream(this.dbPath);
        const writeStream = fs.createWriteStream(backupFile);
        
        readStream.on('error', (err) => {
          console.error('[BACKUP] Read error:', err.message);
          this.backupLock = false;
        });
        
        writeStream.on('error', (err) => {
          console.error('[BACKUP] Write error:', err.message);
          this.backupLock = false;
        });
        
        writeStream.on('finish', () => {
          console.log(`[BACKUP] Created: ${backupFile}`);
          this.backupLock = false;
          
          // クリーンアップをスケジュール（頻繁に実行しない）
          this.scheduleCleanup();
        });
        
        readStream.pipe(writeStream);
      } catch (err) {
        console.error('[BACKUP] Error:', err.message);
        this.backupLock = false;
      }
    });
  }
  
  /**
   * クリーンアップをスケジュール（重複実行防止）
   */
  scheduleCleanup() {
    if (this.cleanupScheduled) return;
    
    this.cleanupScheduled = true;
    setTimeout(() => {
      this.cleanupOldBackupsAsync().finally(() => {
        this.cleanupScheduled = false;
      });
    }, 5000); // 5秒後に実行
  }
  
  /**
   * 古いバックアップをクリーンアップ（完全非同期）
   */
  async cleanupOldBackupsAsync() {
    try {
      const { readdir, stat, unlink } = fs.promises;
      
      const files = (await readdir(this.backupDir))
        .filter(f => f.startsWith('data.db.'))
        .map(async f => {
          const filePath = path.join(this.backupDir, f);
          const stats = await stat(filePath);
          return {
            name: f,
            path: filePath,
            time: stats.mtime.getTime()
          };
        });
      
      const fileList = await Promise.all(files);
      fileList.sort((a, b) => b.time - a.time); // 新しい順
      
      // 最大数を超えた古いファイルを削除
      if (fileList.length > this.maxBackups) {
        const toDelete = fileList.slice(this.maxBackups);
        for (const file of toDelete) {
          try {
            await unlink(file.path);
            console.log(`[BACKUP] Cleaned up old: ${file.name}`);
          } catch (e) {
            console.error(`[BACKUP] Failed to delete ${file.name}:`, e.message);
          }
        }
      }
    } catch (err) {
      console.error('[BACKUP] Cleanup error:', err.message);
    }
  }
  
  /**
   * 後方互換: 旧cleanupOldBackupsは非同期版に委譲
   */
  cleanupOldBackups() {
    this.cleanupOldBackupsAsync();
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
   * ランダムなメールアドレスを生成（パスワード付き・ハッシュ化対応）
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
    
    // パスワードをbcryptでハッシュ化
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
    // ハッシュ化パスワードを保存（平文は保存しない）
    const stmt = this.db.prepare('INSERT INTO users (address, password_hash, created_at) VALUES (?, ?, ?)');
    stmt.run(normalized, passwordHash, now);
    
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
   * パスワードを検証（ハッシュ化対応 + 後方互換）
   */
  async verifyPassword(address, password) {
    const normalized = this.normalizeAddress(address);
    const stmt = this.db.prepare('SELECT password, password_hash FROM users WHERE address = ?');
    const user = stmt.get(normalized);
    
    if (!user) return false;
    
    // 新方式：bcryptハッシュ比較
    if (user.password_hash) {
      return await bcrypt.compare(password, user.password_hash);
    }
    
    // 旧方式：平文比較（移行用）
    if (user.password === password) {
      // 検証成功したら、自動的にハッシュ化して保存（移行）
      await this.migrateToHashedPassword(normalized, password);
      return true;
    }
    
    return false;
  }
  
  /**
   * 平文パスワードをハッシュ化に移行
   */
  async migrateToHashedPassword(address, plainPassword) {
    try {
      const hash = await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
      const stmt = this.db.prepare('UPDATE users SET password_hash = ?, password = NULL WHERE address = ?');
      stmt.run(hash, address);
      console.log(`[MIGRATION] Password hashed for ${address}`);
    } catch (err) {
      console.error('[MIGRATION] Failed:', err.message);
    }
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
    // 30日後のタイムスタンプ
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000);

    // Check if user exists
    const exists = await this.addressExists(normalized);
    if (!exists) {
      return null;
    }

    const insertStmt = this.db.prepare(
      'INSERT INTO mails (id, address, subject, sender, body, html, received_at, saved, saved_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insertStmt.run(
      id,
      normalized,
      mailData.subject || '(件名なし)',
      mailData.from || 'unknown@example.com',
      mailData.body || '',
      mailData.html || null,
      now,
      0,  // saved = false
      null,  // saved_at = null
      expiresAt
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
   * パフォーマンス最適化: 必要なカラムのみ取得
   */
  async getMails(address, password, limit = 100) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    // SELECT * ではなく必要なカラムのみ取得
    const stmt = this.db.prepare(
      'SELECT id, subject, sender, body, html, received_at, saved, saved_at, expires_at FROM mails WHERE address = ? ORDER BY received_at DESC LIMIT ?'
    );
    const rows = stmt.all(normalized, limit);
    return rows.map(row => ({
      id: row.id,
      subject: row.subject,
      from: row.sender,
      body: row.body,
      html: row.html,
      receivedAt: row.received_at,
      receivedAtFormatted: new Date(row.received_at).toLocaleString('ja-JP'),
      saved: row.saved === 1,
      savedAt: row.saved_at,
      expiresAt: row.expires_at,
      expiresAtFormatted: row.expires_at ? new Date(row.expires_at).toLocaleString('ja-JP') : null,
      // 認証コードを自動抽出
      authCode: this.extractAuthCode(row.body, row.html)
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
      receivedAtFormatted: new Date(row.received_at).toLocaleString('ja-JP'),
      saved: row.saved === 1,
      savedAt: row.saved_at,
      expiresAt: row.expires_at,
      expiresAtFormatted: new Date(row.expires_at).toLocaleString('ja-JP')
    };
  }

  /**
   * メールを保存（30日間保持）
   */
  async saveMail(address, password, mailId) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    const now = Date.now();
    // 保存時に新しい30日間の期限を設定
    const newExpiresAt = now + (30 * 24 * 60 * 60 * 1000);
    
    const stmt = this.db.prepare(
      'UPDATE mails SET saved = 1, saved_at = ?, expires_at = ? WHERE address = ? AND id = ?'
    );
    const result = stmt.run(now, newExpiresAt, normalized, mailId);
    
    if (result.changes > 0) {
      this.createBackup('save-mail');
      return { success: true, savedAt: now, expiresAt: newExpiresAt };
    }
    return false;
  }

  /**
   * メールの保存を解除
   */
  async unsaveMail(address, password, mailId) {
    const normalized = this.normalizeAddress(address);
    
    if (!(await this.verifyPassword(normalized, password))) {
      return null;
    }
    
    const stmt = this.db.prepare(
      'UPDATE mails SET saved = 0, saved_at = NULL WHERE address = ? AND id = ?'
    );
    const result = stmt.run(normalized, mailId);
    
    if (result.changes > 0) {
      this.createBackup('unsave-mail');
      return { success: true };
    }
    return false;
  }

  /**
   * 期限切れの未保存メールを自動削除（30日経過）
   * 累計カウンターは減少しない
   */
  async cleanupExpiredMails() {
    const now = Date.now();
    
    // 未保存(saved=0)かつ期限切れ(expires_at < now)のメールを削除
    const stmt = this.db.prepare(
      'DELETE FROM mails WHERE saved = 0 AND expires_at < ?'
    );
    const result = stmt.run(now);
    
    if (result.changes > 0) {
      console.log(`[CLEANUP] Deleted ${result.changes} expired unsaved mails`);
      this.createBackup('cleanup-expired');
    }
    
    return { deleted: result.changes };
  }

  /**
   * 認証コード（OTP）を抽出
   * 一般的なパターン: 6桁数字、英数字混合など
   */
  extractAuthCode(body, html) {
    if (!body && !html) return null;
    
    const text = (body || '') + ' ' + (html || '');
    
    // 一般的なOTPパターン
    const patterns = [
      // "認証コード: 123456" または "verification code: 123456"
      /(?:認証コード|verification code|auth code|one-time code|ワンタイムパスワード|OTP)[\s:：]+([0-9]{4,8})/i,
      // "code: 123456" または "コード: 123456"
      /(?:code|コード)[\s:：]+([0-9]{4,8})/i,
      // "123456 is your" または "your code is 123456"
      /\b([0-9]{6})\b[^\n]{0,30}(?:is your|あなたの)/i,
      // HTML内の6桁数字（strongタグやbタグ内など）
      />([0-9]{6})</,
      // "security code" パターン
      /(?:security|secure)[\s\w]*code[\s:：]+([0-9]{4,8})/i,
      // 2FA/二段階認証関連
      /(?:2FA|二段階|two.factor)[\s\w]*[:：]?\s*([0-9]{4,8})/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
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
    
    // 新パスワードをハッシュ化
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    
    // パスワードハッシュとバージョンを同時に更新（バージョンをインクリメント）
    const stmt = this.db.prepare('UPDATE users SET password_hash = ?, password = NULL, password_version = password_version + 1 WHERE address = ?');
    stmt.run(newPasswordHash, normalized);
    
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
    try {
      // 削除されても減らない累計値を取得
      let totalAddressesAllTime = 0;
      let totalMailsAllTime = 0;
      
      try {
        const addrStat = this.db.prepare("SELECT value FROM cumulative_stats WHERE key = 'total_addresses'").get();
        const mailStat = this.db.prepare("SELECT value FROM cumulative_stats WHERE key = 'total_mails'").get();
        totalAddressesAllTime = addrStat ? addrStat.value : 0;
        totalMailsAllTime = mailStat ? mailStat.value : 0;
      } catch (e) {
        console.warn('cumulative_stats table may not exist:', e.message);
      }

      // 現在の値（減る可能性あり）
      let currentMailboxes = 0;
      let currentMails = 0;
      
      try {
        const currentUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
        currentMailboxes = currentUsers ? currentUsers.count : 0;
      } catch (e) {
        console.warn('users table may not exist:', e.message);
      }
      
      try {
        const currentMailsResult = this.db.prepare('SELECT COUNT(*) as count FROM mails').get();
        currentMails = currentMailsResult ? currentMailsResult.count : 0;
      } catch (e) {
        console.warn('mails table may not exist:', e.message);
      }

      return {
        // 削除されても減らない累計値（メーター表示用）
        totalAddressesAllTime: totalAddressesAllTime,
        totalMailsAllTime: totalMailsAllTime,
        // 旧版互換フィールド名
        total_addresses: totalAddressesAllTime,
        total_mails: totalMailsAllTime,
        // 現在の値
        currentMailboxes: currentMailboxes,
        currentMails: currentMails,
        // 旧版互換フィールド名
        mailboxes: currentMailboxes,
        totalMails: currentMails
      };
    } catch (err) {
      console.error('getStats error:', err);
      // エラー時もデフォルト値を返す
      return {
        totalAddressesAllTime: 0,
        totalMailsAllTime: 0,
        total_addresses: 0,
        total_mails: 0,
        currentMailboxes: 0,
        currentMails: 0,
        mailboxes: 0,
        totalMails: 0
      };
    }
  }
}

module.exports = MailStore;
