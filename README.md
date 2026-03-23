# Sutemeado - シンプルな一時メールサービス

シンプルで使いやすい、登録不要の一時メールサービス。

## 機能

- 🎲 ワンクリックでランダムな一時メールアドレスを生成
- 📧 リアルタイムメール受信（自動更新）
- ⏰ 24時間後に自動削除
- 📱 モバイル対応のレスポンシブデザイン
- ✨ ネオン系ダークテーマ

## 技術スタック

- **バックエンド**: Node.js + Express
- **フロントエンド**: HTML + CSS + Vanilla JavaScript
- **データストア**: インメモリ（MVP版）

## 必要環境

- Node.js 16以上
- npmまたはyarn
- Nginx（リバースプロキシ用）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/supurikuto123-spec/-.git sutemeado
cd sutemeado

# 依存関係をインストール
npm install

# サーバーを起動
npm start
```

## デプロイ方法（VPS）

### 初回デプロイ

```bash
# VPSにSSH接続
ssh root@163.44.101.51

# アプリケーションディレクトリを作成
mkdir -p /var/www/sutemeado.com
cd /var/www/sutemeado.com

# リポジトリをクローン
git clone https://github.com/supurikuto123-spec/-.git .

# 依存関係をインストール
npm install

# PM2でサービスを起動
npm install -g pm2
pm2 start server.js --name "sutemeado"
pm2 save
pm2 startup
```

### 更新方法（ユーザーが実行するコマンド）

```bash
# 簡単更新スクリプトを実行
/var/www/sutemeado.com/update.sh
```

または手動で：

```bash
# VPSにSSH接続
ssh root@163.44.101.51

# アプリケーションディレクトリに移動
cd /var/www/sutemeado.com

# 最新コードを取得
git pull origin main

# 依存関係を更新（必要な場合）
npm install

# サービスを再起動
pm2 restart sutemeado
```

## Nginx設定

```nginx
server {
    listen 80;
    server_name sutemeado.com www.sutemeado.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## APIエンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /api/new-address | 新しいアドレスを生成 |
| GET | /api/mailbox/:address | メールボックスの内容を取得 |
| GET | /api/mailbox/:address/:mailId | 特定のメールを取得 |
| DELETE | /api/mailbox/:address/:mailId | メールを削除 |
| DELETE | /api/mailbox/:address | 全メールを削除 |
| POST | /api/simulate-mail | テストメールを送信（開発用） |

## ディレクトリ構造

```
sutemeado-new/
├── server.js          # Expressサーバー
├── package.json       # 依存関係
├── README.md          # このファイル
├── lib/
│   └── mailstore.js   # メールストアクラス
├── api/               # APIハンドラー（将来的に使用）
└── public/            # 静的ファイル
    ├── index.html     # メインページ
    ├── style.css      # スタイルシート
    └── app.js         # フロントエンドスクリプト
```

## ライセンス

MIT
