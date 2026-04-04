#!/bin/bash
# 502/DBロック問題修正適用スクリプト

cd /var/www/sutemeado.com

echo "=== 修正適用前のバックアップ ==="
cp lib/mailstore.js lib/mailstore.js.backup.$(date +%Y%m%d_%H%M%S)
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)

echo "=== lib/mailstore.jsにbusy_timeout追加 ==="
sed -i "/this.db = new Database(finalDbPath);/a\\    \\\n    // WALモード最適化設定（同時接続・ロック対策）\\n    this.db.pragma('journal_mode = WAL');\\n    this.db.pragma('synchronous = NORMAL');\\n    this.db.pragma('busy_timeout = 5000');  // 5秒待機してからエラー\\n    this.db.pragma('wal_autocheckpoint = 100'); // WALファイルの自動チェックポイント" lib/mailstore.js

echo "=== server.jsにbusy_timeout追加 ==="
sed -i "s/db.prepare('PRAGMA cache_size = -32000').run(); \/\/ 32MB/db.prepare('PRAGMA cache_size = -32000').run(); \/\/ 32MB\\n  db.prepare('PRAGMA busy_timeout = 5000').run(); \/\/ 5秒待機でロック競合を回避\\n  db.prepare('PRAGMA wal_autocheckpoint = 100').run(); \/\/ WAL自動チェックポイント/" server.js

echo "=== PM2再起動 ==="
pm2 restart sutemeado

echo "=== 状態確認 ==="
sleep 2
pm2 status
curl -s http://localhost:3001/api/status | head -c 200

echo ""
echo "=== 修正適用完了 ==="
echo "busy_timeout = 5000ms が設定されました"
