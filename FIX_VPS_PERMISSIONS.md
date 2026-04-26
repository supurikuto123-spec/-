# VPSパーミッション問題修正手順

## 問題
`SQLITE_READONLY_DBMOVED: attempt to write a readonly database`

## 原因
PM2/Systemdが実行しているユーザーと、データベースファイルの所有者が異なる

## 修正手順

### 1. 現在の状況確認
```bash
# プロジェクトディレクトリの所有者確認
ls -la /var/www/sutemeado.com/

# PM2の実行ユーザー確認
pm2 list
grep -r "user" ~/.pm2/dump.pm2 2>/dev/null || echo "dump.pm2 not found"

# データベースファイルの詳細
ls -la /var/www/sutemeado.com/data.db
file /var/www/sutemeado.com/data.db
```

### 2. パーミッション修正（方法A: PM2ユーザーを確認して修正）
```bash
cd /var/www/sutemeado.com

# 現在のユーザーを確認
whoami  # おそらく root または www-data

# 方法1: 現在のユーザーで所有権を変更
sudo chown -R $(whoami):$(whoami) /var/www/sutemeado.com

# 方法2: www-dataユーザーで実行している場合
sudo chown -R www-data:www-data /var/www/sutemeado.com

# データベースファイルのパーミッションを修正
sudo chmod 664 /var/www/sutemeado.com/data.db
sudo chmod 775 /var/www/sutemeado.com

# SELinux/AppArmorが有効な場合（Ubuntuでは通常無効）
ls -Z /var/www/sutemeado.com/data.db 2>/dev/null || echo "SELinux not active"
```

### 3. PM2再起動
```bash
# PM2プロセス停止
pm2 stop sutemeado
pm2 delete sutemeado

# キャッシュクリア
rm -rf /var/www/sutemeado.com/node_modules/.cache 2>/dev/null

# データベースのロックファイルがあれば削除
rm -f /var/www/sutemeado.com/data.db-journal
rm -f /var/www/sutemeado.com/data.db-shm
rm -f /var/www/sutemeado.com/data.db-wal

# PM2で再起動
cd /var/www/sutemeado.com
pm2 start server.js --name sutemeado

# ログ確認
pm2 logs sutemeado --lines 20
```

### 4. 検証
```bash
# APIテスト
curl -s http://localhost:3000/api/status | jq .
curl -s http://localhost:3000/api/new-address | jq .

# ログでエラーが出ていないか確認
pm2 logs sutemeado --lines 10
```

### 5. 永続化（PM2 startup設定）
```bash
# PM2の設定を保存
pm2 save

# Systemdに登録済みの場合
sudo systemctl restart sutemeado
```

## 根本原因の調査

### PM2がどのユーザーで実行されているか確認
```bash
# プロセス一覧
ps aux | grep -E "(PM2|node|sutemeado)" | grep -v grep

# 特定のプロセスのユーザー確認
pm2 pid sutemeado | xargs ps -o user= -p
```

### ディスク容量確認
```bash
df -h /var/www
```

## 参考: エラーコード
- `SQLITE_READONLY_DBMOVED` - データベースファイルが移動されたか、読み取り専用になっている
- `SQLITE_CANTOPEN` - ファイルを開けない（パーミッション問題）
- `SQLITE_IOERR` - ディスクI/Oエラー
