#!/bin/bash
# DB確認スクリプト

echo "=== Sutemeado DB 確認 ==="
echo ""

# アドレス一覧（作成日時順）
echo "【作成されたアドレス一覧】"
sqlite3 /var/www/sutemeado.com/data.db "SELECT rowid, address, created_at, datetime(created_at/1000, 'unixepoch', 'localtime') as created_date FROM users ORDER BY created_at DESC;"

echo ""
echo "【件数確認】"
sqlite3 /var/www/sutemeado.com/data.db "SELECT 'アドレス数:' || COUNT(*) FROM users;"
sqlite3 /var/www/sutemeado.com/data.db "SELECT 'メール数:' || COUNT(*) FROM mails;"
