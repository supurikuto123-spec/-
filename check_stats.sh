#!/bin/bash
# サイト全体の統計カウンターを確認

cd /var/www/sutemeado.com

echo "=== /api/status レスポンス ==="
curl -s http://localhost:3001/api/status | python3 -m json.tool

echo ""
echo "=== cumulative_stats テーブル確認 ==="
sqlite3 data.db "SELECT * FROM cumulative_stats;"

echo ""
echo "=== ユーザー総数 ==="
sqlite3 data.db "SELECT COUNT(*) as total_addresses FROM users;"

echo ""
echo "=== メール総数 ==="
sqlite3 data.db "SELECT COUNT(*) as total_mails FROM mails;"

echo ""
echo "=== mail_logs テーブル総数 ==="
sqlite3 data.db "SELECT COUNT(*) as total_mail_logs FROM mail_logs;"
