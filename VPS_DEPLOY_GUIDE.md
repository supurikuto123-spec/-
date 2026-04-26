# VPSデプロイ手順（ConoHa VPS）

## 前提条件

- VPS: ConoHa VPS（IP: 163.44.101.51）
- OS: Ubuntu 20.04/22.04 LTS
- ドメイン: sutemeado.com
- 必要なツール: Node.js, npm, PM2, Nginx, Git

---

## クイックスタート（VPS更新コマンド）

**この1コマンドでサイトを最新状態に更新します：**

```bash
ssh root@163.44.101.51 "cd /var/www/sutemeado.com && ./update.sh"
```

パスワード: `AAaa3982@@`

---

## 詳細手順

### 手順1: VPSにSSH接続

```bash
ssh root@163.44.101.51
# パスワード: AAaa3982@@
```

### 手順2: アプリケーションディレクトリに移動

```bash
cd /var/www/sutemeado.com
```

### 手順3: 最新コードを取得

```bash
git fetch origin
git reset --hard origin/main
```

### 手順4: 依存関係をインストール

```bash
npm install
```

### 手順5: サービスを再起動

```bash
pm2 restart sutemeado
pm2 save
```

または、新規起動時：

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### 手順6: Nginxを確認

```bash
nginx -t && systemctl reload nginx
```

---

## 🔄 更新コマンドまとめ

### 簡単更新（推奨）

```bash
cd /var/www/sutemeado.com && ./update.sh
```

### 手動更新

```bash
cd /var/www/sutemeado.com
git fetch origin && git reset --hard origin/main
npm install
pm2 restart sutemeado
```

### データベース確認

```bash
# DBファイル確認
ls -la /var/www/sutemeado.com/data.db

# バックアップ一覧
ls -la /var/backups/sutemeado/
```

---

## 📊 ステータス確認

```bash
# サービスステータス
pm2 status sutemeado

# ログ確認
pm2 logs sutemeado

# APIステータス確認
curl http://localhost:3000/api/status

# 統計情報確認
curl http://localhost:3000/api/status | jq '.stats'
```

---

## ⚠️ トラブルシューティング

### データベースが消えた場合

1. **バックアップから復元:**
   ```bash
   cd /var/backups/sutemeado
   ls -la  # バックアップ一覧
   cp data_YYYYMMDD_HHMMSS.db /var/www/sutemeado.com/data.db
   pm2 restart sutemeado
   ```

2. **ファイル権限確認:**
   ```bash
   ls -la /var/www/sutemeado.com/data.db
   chmod 644 /var/www/sutemeado.com/data.db
   ```

### サービスが起動しない場合

```bash
# ログ確認
pm2 logs sutemeado

# 手動起動テスト
cd /var/www/sutemeado.com && node server.js
```

---

## 📝 重要なファイル

| ファイル | 説明 |
|---------|------|
| `/var/www/sutemeado.com/data.db` | SQLiteデータベース（永続化対象） |
| `/var/www/sutemeado.com/ecosystem.config.js` | PM2設定（環境変数含む） |
| `/var/backups/sutemeado/` | DBバックアップ保存場所 |
| `/var/log/sutemeado/` | PM2ログ出力先 |

---

## 完了！

- 🌐 https://sutemeado.com でアクセス可能
- 更新時は `/var/www/sutemeado.com/update.sh` を実行
- DBは `/var/www/sutemeado.com/data.db` に永続化されます（再起動しても消えません）
