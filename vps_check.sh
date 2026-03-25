#!/bin/bash
# VPSで実行してサーバー状態を確認

echo "=== サーバープロセス確認 ==="
ps aux | grep -E "(node|pm2)" | grep -v grep | head -10

echo ""
echo "=== PM2 ステータス ==="
pm2 status

echo ""
echo "=== リスニングポート確認 ==="
netstat -tlnp 2>/dev/null | grep -E "(3000|3001)" || ss -tlnp | grep -E "(3000|3001)"

echo ""
echo "=== デプロイされたコードのバージョン確認 ==="
cd /var/www/sutemeado.com
git log --oneline -3

echo ""
echo "=== public/app.js の該当行確認（?? が含まれているか）==="
grep -n "state.totalReceived ??" public/app.js | head -5 || echo "?? 演算子が見つからない（古いコードかも）"
grep -n "state.totalReceived ||" public/app.js | head -5 || echo "|| 演算子は見つからない（正常）"

echo ""
echo "=== server.js の totalReceived 確認 ==="
grep -n "totalReceived" server.js | head -5
