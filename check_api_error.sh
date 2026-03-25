#!/bin/bash
# VPSでAPIエラーを詳細確認

cd /var/www/sutemeado.com

echo "=== PM2 エラーログ（直近50行）==="
pm2 logs sutemeado --err --lines 50

echo ""
echo "=== server.js の該当部分確認 ==="
grep -n -A10 "app.*post.*mailbox" server.js | head -40

echo ""
echo "=== API直接テスト（生レスポンス）==="
timeout 10 curl -v "http://localhost:3001/api/mailbox/m0choma6qa@sutemeado.com?password=vFXKuJe46S" 2>&1
