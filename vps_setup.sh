#!/bin/bash
# VPS上で実行されるセットアップスクリプト
set -e

APP_DIR="/var/www/sutemeado.com"
REPO_URL="https://github.com/supurikuto123-spec/-.git"
SERVICE_NAME="sutemeado"

echo "🚀 Sutemeado セットアップ開始..."

# Node.jsとnpmをインストール
if ! command -v node &> /dev/null; then
    echo "📦 Node.jsをインストール..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# PM2をインストール
npm install -g pm2

# アプリケーションディレクトリ準備
mkdir -p $APP_DIR
cd $APP_DIR

# リポジトリをクローン（既存なら削除して作り直し）
if [ -d ".git" ]; then
    git fetch origin
    git reset --hard origin/main
else
    rm -rf $APP_DIR/* $APP_DIR/.* 2>/dev/null || true
    git clone $REPO_URL $APP_DIR
fi

# 依存関係インストール
npm install

# 更新スクリプトに権限付与
chmod +x update.sh

# PM2で起動
if pm2 list | grep -q "$SERVICE_NAME"; then
    pm2 restart $SERVICE_NAME
else
    pm2 start server.js --name $SERVICE_NAME
fi

pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "🎉 セットアップ完了！"
echo "🌐 https://sutemeado.com"
pm2 status $SERVICE_NAME
