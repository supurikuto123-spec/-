#!/bin/bash
# VPSで実行するサーバー診断スクリプト

cd /var/www/sutemeado.com

echo "=== PM2 エラーログ（最後30行）==="
pm2 logs sutemeado --err --lines 30

echo ""
echo "=== PM2 アウトプットログ（最後30行）==="
pm2 logs sutemeado --out --lines 30

echo ""
echo "=== backups ディレクトリ確認 ==="
ls -la backups/ 2>/dev/null || echo "backups/ ディレクトリなし"

echo ""
echo "=== ディスク容量確認 ==="
df -h .

echo ""
echo "=== サーバーがリッスンしているか確認 ==="
ss -tlnp | grep 3001

echo ""
echo "=== ローカルホストからの接続テスト ==="
timeout 5 curl -v http://localhost:3001/api/new-address 2>&1 | head -20
