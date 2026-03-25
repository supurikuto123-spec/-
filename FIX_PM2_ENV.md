# PM2環境変数修正手順

## 問題
`pm2 env sutemeado` がエラーになる = PM2が正しく環境変数を設定していない

## 解決手順

```bash
# 1. 現在のPM2状態確認
pm2 list
pm2 show sutemeado

# 2. 既存プロセスを停止・削除
pm2 stop sutemeado
pm2 delete sutemeado

# 3. ecosystem.config.js の内容確認
cat /var/www/sutemeado.com/ecosystem.config.js

# 4. 正しい環境変数で再起動
pm2 start /var/www/sutemeado.com/ecosystem.config.js --env production
pm2 save

# 5. 環境変数確認
pm2 env sutemeado | grep DB_PATH
```

## DBデータ確認

```bash
# SQLiteでデータ確認
sqlite3 /var/www/sutemeado.com/data.db ".tables"
sqlite3 /var/www/sutemeado.com/data.db "SELECT COUNT(*) FROM users;"
sqlite3 /var/www/sutemeado.com/data.db "SELECT address, created_at FROM users LIMIT 10;"
```

## もしデータが空の場合

バックアップがあるか確認：
```bash
find /var -name "*.db" -o -name "*backup*" 2>/dev/null | head -20
ls -la /var/www/sutemeado.com/*.db*
```
