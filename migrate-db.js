#!/usr/bin/env node
/**
 * データベースマイグレーションスクリプト
 * password_version カラムを追加
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');

console.log('🔧 Database Migration Tool');
console.log('DB Path:', DB_PATH);

try {
  const db = new Database(DB_PATH);
  
  // users テーブルのカラム情報を取得
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const columns = tableInfo.map(c => c.name);
  
  console.log('Current users table columns:', columns.join(', '));
  
  // password_version カラムが存在しない場合は追加
  if (!columns.includes('password_version')) {
    console.log('➕ Adding password_version column...');
    db.prepare("ALTER TABLE users ADD COLUMN password_version INTEGER NOT NULL DEFAULT 1").run();
    console.log('✅ password_version column added');
    
    // 既存データのバージョンを設定
    const result = db.prepare("UPDATE users SET password_version = 1 WHERE password_version IS NULL").run();
    console.log(`📝 Updated ${result.changes} rows`);
  } else {
    console.log('✓ password_version column already exists');
  }
  
  // インデックス作成（存在しない場合）
  try {
    db.prepare("CREATE INDEX IF NOT EXISTS idx_mail_logs_address ON mail_logs(address)").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_mail_logs_received ON mail_logs(received_at)").run();
    console.log('✅ Indexes verified');
  } catch (e) {
    console.warn('⚠️ Index creation warning:', e.message);
  }
  
  db.close();
  console.log('\n🎉 Migration completed successfully!');
  process.exit(0);
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  console.error(err.stack);
  process.exit(1);
}
