#!/bin/bash
# Sutemeado VPSデプロイスクリプト
# このスクリプトをVPSで実行してアプリをセットアップします

set -e

APP_DIR="/var/www/sutemeado.com"
REPO_URL="https://github.com/supurikuto123-spec/-.git"
SERVICE_NAME="sutemeado"
NODE_VERSION="18"

echo "🚀 Sutemeado VPSデプロイを開始します..."

# Node.jsとnpmのインストール確認
echo "📦 Node.jsを確認..."
if ! command -v node &> /dev/null; then
    echo "Node.jsをインストールします..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# PM2のインストール
echo "📦 PM2をインストール..."
npm install -g pm2

# アプリケーションディレクトリ作成
echo "📂 アプリケーションディレクトリを作成..."
mkdir -p $APP_DIR
cd $APP_DIR

# 既存のリポジトリがあれば削除、なければクローン
if [ -d ".git" ]; then
    echo "🔄 既存のリポジトリを更新..."
    git fetch origin
    git reset --hard origin/main
else
    echo "📥 リポジトリをクローン..."
    rm -rf * .* 2>/dev/null || true
    git clone $REPO_URL .
fi

# 依存関係をインストール
echo "📦 依存関係をインストール..."
npm install

# 更新スクリプトに実行権限を付与
chmod +x update.sh

# PM2でサービスを起動・再起動
echo "🔄 PM2サービスを起動..."
if pm2 list | grep -q "$SERVICE_NAME"; then
    pm2 restart $SERVICE_NAME
else
    pm2 start server.js --name $SERVICE_NAME -- --port 3000
    pm2 save
fi

# PM2自動起動設定
echo "🔧 PM2自動起動を設定..."
pm2 startup systemd -u root --hp /root

# Nginx設定を確認・更新
echo "🔧 Nginx設定を確認..."
NGINX_CONF="/etc/nginx/sites-available/sutemeado.com"
if [ -f "$NGINX_CONF" ]; then
    echo "✅ Nginx設定ファイルが存在します"
    nginx -t && systemctl reload nginx
fi

echo ""
echo "🎉 デプロイが完了しました！"
echo "🌐 http://sutemeado.com"
echo "📊 サービスステータス:"
pm2 status $SERVICE_NAME
echo ""
echo "📋 便利なコマンド:"
echo "  pm2 logs $SERVICE_NAME    # ログ表示"
echo "  pm2 restart $SERVICE_NAME # 再起動"
echo "  ./update.sh               # サイト更新"
