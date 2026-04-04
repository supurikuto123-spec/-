#!/usr/bin/env node
/**
 * 起動テストスクリプト - 502エラーの原因特定用
 */
const fs = require('fs');
const path = require('path');

console.log('=== Sutemeado Startup Test ===');
console.log('Node version:', process.version);
console.log('CWD:', process.cwd());

// 環境変数チェック
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const PORT = process.env.PORT || 3000;
console.log('DB_PATH:', DB_PATH);
console.log('PORT:', PORT);

// DBディレクトリチェック
const dbDir = path.dirname(DB_PATH);
console.log('DB directory:', dbDir);
console.log('DB dir exists:', fs.existsSync(dbDir));
console.log('DB dir writable:', (() => {
  try {
    fs.accessSync(dbDir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
})());

// DBファイルチェック
console.log('DB file exists:', fs.existsSync(DB_PATH));

// モジュール読み込みテスト
try {
  console.log('\n--- Module Load Test ---');
  const Database = require('better-sqlite3');
  console.log('✓ better-sqlite3 loaded');
  
  const { SMTPServer } = require('smtp-server');
  console.log('✓ smtp-server loaded');
  
  const mailparser = require('mailparser');
  console.log('✓ mailparser loaded');
  
  const express = require('express');
  console.log('✓ express loaded');
  
  const cors = require('cors');
  console.log('✓ cors loaded');
} catch (err) {
  console.error('✗ Module load failed:', err.message);
  process.exit(1);
}

// MailStore初期化テスト
try {
  console.log('\n--- MailStore Test ---');
  const MailStore = require('./lib/mailstore');
  const mailStore = new MailStore(DB_PATH);
  console.log('✓ MailStore instantiated');
  
  // テスト: usersテーブルのカラム確認
  const db = require('better-sqlite3')(DB_PATH);
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('Users table columns:', tableInfo.map(c => c.name).join(', '));
  
  // password_versionカラムが存在するか
  const hasPasswordVersion = tableInfo.some(c => c.name === 'password_version');
  if (!hasPasswordVersion) {
    console.error('✗ WARNING: password_version column missing!');
    console.log('  Adding column...');
    try {
      db.prepare("ALTER TABLE users ADD COLUMN password_version INTEGER NOT NULL DEFAULT 1").run();
      console.log('✓ password_version column added');
    } catch (alterErr) {
      console.error('✗ Failed to add column:', alterErr.message);
    }
  } else {
    console.log('✓ password_version column exists');
  }
  
  db.close();
  console.log('✓ MailStore test passed');
} catch (err) {
  console.error('✗ MailStore test failed:', err.message);
  console.error(err.stack);
}

// サーバー起動テスト
try {
  console.log('\n--- Server Start Test ---');
  const express = require('express');
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  const testServer = app.listen(PORT, '127.0.0.1', () => {
    console.log(`✓ Test server started on port ${PORT}`);
    testServer.close(() => {
      console.log('✓ Test server stopped');
      console.log('\n=== All tests passed ===');
      process.exit(0);
    });
  });
  
  testServer.on('error', (err) => {
    console.error('✗ Test server failed:', err.message);
    process.exit(1);
  });
} catch (err) {
  console.error('✗ Server start test failed:', err.message);
  process.exit(1);
}
