#!/bin/bash
# VPSで実行するデータベース確認スクリプト

cd /var/www/sutemeado.com

echo "=== ユーザー数 ==="
sqlite3 data.db "SELECT COUNT(*) FROM users;"

echo ""
echo "=== 対象アドレスの存在確認 ==="
sqlite3 data.db "SELECT address, password FROM users WHERE address IN ('m0choma6qa@sutemeado.com', 'r9ves5fjck@sutemeado.com');"

echo ""
echo "=== 全アドレス一覧（最新10件）==="
sqlite3 data.db "SELECT address, password FROM users ORDER BY created_at DESC LIMIT 10;"

echo ""
echo "=== メール数 ==="
sqlite3 data.db "SELECT COUNT(*) FROM mails;"

echo ""
echo "=== mail_logs テーブル ==="
sqlite3 data.db "SELECT COUNT(*) FROM mail_logs;"
