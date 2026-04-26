# DB永続化問題の修正ガイド

## 問題の概要
メールアドレスがVPS再起動後に消失する問題。

## 原因
PM2の起動方法により、DB_PATH環境変数が正しく設定されていない可能性があります。

### 正しい起動方法（ecosystem.config.jsを使用）
```bash
pm2 start ecosystem.config.js --env production
```

### 間違った起動方法（環境変数なし）
```bash
pm2 start server.js --name sutemeado
# → DB_PATHが設定されず、デフォルトパスが使用される
```

## 修正手順

### 1. 現在の状態を確認（VPS上で実行）
```bash
cd /var/www/sutemeado.com
./diagnose-db.sh
```

### 2. 正しく再起動
```bash
cd /var/www/sutemeado.com

# 現在のプロセスを停止
pm2 stop sutemeado
pm2 delete sutemeado

# ecosystem.config.js を使って正しく起動
pm2 start ecosystem.config.js --env production

# 確認
pm2 save
pm2 status

# 環境変数確認
pm2 env sutemeado | grep DB_PATH
# → DB_PATH: /var/www/sutemeado.com/data.db と表示されるべき
```

### 3. データ移行（DBが別の場所にあった場合）
もしデータが別の場所（例: /root/data.db）に保存されていた場合：
```bash
# データをコピー
sudo cp /root/data.db /var/www/sutemeado.com/data.db
sudo chown root:root /var/www/sutemeado.com/data.db
sudo chmod 644 /var/www/sutemeado.com/data.db

# PM2再起動
pm2 restart sutemeado
```

## 検証
再起動後に以下を確認：
```bash
# 1. DBファイル存在確認
ls -la /var/www/sutemeado.com/data.db

# 2. APIでアドレス作成
# ブラウザで https://sutemeado.com/ にアクセスし、新規アドレス作成

# 3. アドレスが保持されていることを確認
# ページをリロードしてもアドレスが表示されるはず

# 4. PM2再起動テスト
pm2 restart sutemeado
# 再度ブラウザでアドレスが保持されていることを確認
```

## 予防策
- update.sh で ecosystem.config.js を使用するように修正済み
- server.js で起動時にDBパスをログ出力
- diagnose-db.sh で定期的に確認
