#!/bin/bash
# メールアドレス一覧表示スクリプト

DB_PATH="${DB_PATH:-/var/www/sutemeado.com/data.db}"

if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database not found at $DB_PATH"
    echo "Usage: DB_PATH=/path/to/data.db ./list_addresses.sh"
    exit 1
fi

echo "=== メールアドレス一覧 ==="
echo ""

# アドレス一覧を取得
sqlite3 "$DB_PATH" <<EOF
.header on
.mode column
SELECT 
    address as 'メールアドレス',
    datetime(created_at, 'localtime') as '作成日時',
    (SELECT COUNT(*) FROM mails WHERE mails.address = users.address) as '受信メール数'
FROM users
ORDER BY created_at DESC;
EOF

echo ""
echo "=== 統計 ==="
TOTAL=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;")
MAILS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM mails;")
echo "総アドレス数: $TOTAL"
echo "総メール数: $MAILS"
