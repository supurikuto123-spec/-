#!/usr/bin/env node
/**
 * SQLite WALモード有効化スクリプト
 * 読み書き並行実行でロック問題を解消
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');

console.log('🔧 Enabling SQLite WAL mode...');
console.log('DB:', DB_PATH);

try {
  const db = new Database(DB_PATH);
  
  // WALモード有効化
  const result = db.prepare('PRAGMA journal_mode = WAL').get();
  console.log('✅ Journal mode:', result['journal_mode']);
  
  // 同期モード設定（NORMALでパフォーマンス向上）
  db.prepare('PRAGMA synchronous = NORMAL').run();
  
  // キャッシュサイズ増加
  db.prepare('PRAGMA cache_size = -64000').run(); // 64MB
  
  // 一時テーブルをメモリに
  db.prepare('PRAGMA temp_store = MEMORY').run();
  
  // 最適化: 自動VACUUM
  db.prepare('PRAGMA auto_vacuum = INCREMENTAL').run();
  
  // 現在の設定を表示
  const walAutoCheckpoint = db.prepare('PRAGMA wal_autocheckpoint').get();
  const cacheSize = db.prepare('PRAGMA cache_size').get();
  
  console.log('✅ WAL autocheckpoint:', walAutoCheckpoint['wal_autocheckpoint']);
  console.log('✅ Cache size:', cacheSize['cache_size'], 'pages');
  console.log('\n🎉 WAL mode enabled! Database locks should be reduced.');
  
  db.close();
  process.exit(0);
} catch (err) {
  console.error('❌ Failed:', err.message);
  process.exit(1);
}
