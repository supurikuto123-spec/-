#!/bin/bash
# VPSでカウンター表示問題を診断

cd /var/www/sutemeado.com

echo "=== APIレスポンス確認（totalReceivedフィールド）==="
curl -s "http://localhost:3001/api/mailbox/m0choma6qa@sutemeado.com?password=vFXKuJe46S" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:3001/api/mailbox/m0choma6qa@sutemeado.com?password=vFXKuJe46S"

echo ""
echo ""
echo "=== 累計メール数API直接確認 ==="
sqlite3 data.db "SELECT COUNT(*) as total_mails FROM mail_logs WHERE address = 'm0choma6qa@sutemeado.com';"

echo ""
echo "=== cumulative_stats テーブル確認 ==="
sqlite3 data.db "SELECT * FROM cumulative_stats;"

echo ""
echo "=== public/app.js の該当行（カウンター表示部分）===""
grep -n -A2 -B2 "cumulativeCount" public/app.js | head -30
