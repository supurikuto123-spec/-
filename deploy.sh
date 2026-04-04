#!/bin/bash
# Sutemeado VPSデプロイスクリプト
# このスクリプトをVPSで実行してアプリをセットアップします

set -e

APP_DIR="/var/www/sutemeado.com"
REPO_URL="https://github.com/supurikuto123-spec/-.git"
SERVICE_NAME="sutemeado"
NODE_VERSION="18"
DB_FILE="/var/www/sutemeado.com/data.db"
LOG_DIR="/var/log/sutemeado"
BACKUP_DIR="/var/backups/sutemeado"

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

# ログディレクトリ作成
echo "📂 ログディレクトリを作成..."
mkdir -p $LOG_DIR
chmod 755 $LOG_DIR

# バックアップディレクトリ作成
echo "📂 バックアップディレクトリを作成..."
mkdir -p $BACKUP_DIR
chmod 755 $BACKUP_DIR

# アプリケーションディレクトリ作成
echo "📂 アプリケーションディレクトリを作成..."
mkdir -p $APP_DIR
cd $APP_DIR

# 既存のDBをバックアップ（存在する場合）
if [ -f "$DB_FILE" ]; then
    echo "💾 既存のデータベースをバックアップ..."
    cp $DB_FILE "$BACKUP_DIR/data_$(date +%Y%m%d_%H%M%S).db"
fi

# 既存のリポジトリがあれば削除、なければクローン
if [ -d ".git" ]; then
    echo "🔄 既存のリポジトリを更新..."
    git fetch origin
    # 完成版ブランチを使用
    git checkout genspark_ai_developer
    git reset --hard origin/genspark_ai_developer
else
    echo "📥 リポジトリをクローン..."
    rm -rf * .* 2>/dev/null || true
    # 完成版ブランチを指定してクローン
    git clone --branch genspark_ai_developer --single-branch $REPO_URL .
fi

# 依存関係をインストール
echo "📦 依存関係をインストール..."
npm install

# 更新スクリプトに実行権限を付与
chmod +x update.sh

# DBファイルの権限設定（永続化対策）
touch $DB_FILE
chmod 644 $DB_FILE
chown root:root $DB_FILE 2>/dev/null || true
echo "✅ DBファイル準備完了: $DB_FILE"

# PM2でサービスを起動・再起動（ecosystem.config.js使用）
echo "🔄 PM2サービスを起動..."
if [ -f "ecosystem.config.js" ]; then
    # ecosystem.config.jsを使用（環境変数含む設定）
    if pm2 list | grep -q "$SERVICE_NAME"; then
        echo "🔄 既存サービスを再起動..."
        pm2 restart ecosystem.config.js --env production
    else
        echo "🆕 新規サービスを起動..."
        pm2 start ecosystem.config.js --env production
    fi
else
    # 従来の方法
    if pm2 list | grep -q "$SERVICE_NAME"; then
        pm2 restart $SERVICE_NAME
    else
        pm2 start server.js --name $SERVICE_NAME -- --port 3000
    fi
fi
pm2 save

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
echo "💾 DBファイル: $DB_FILE"
echo "📊 サービスステータス:"
pm2 status $SERVICE_NAME
echo ""
echo "📋 便利なコマンド:"
echo "  pm2 logs $SERVICE_NAME              # ログ表示"
echo "  pm2 restart $SERVICE_NAME          # 再起動"
echo "  ./update.sh                        # サイト更新"
echo "  ls -la $DB_FILE                    # DBファイル確認"
echo "  ls -la $BACKUP_DIR                 # バックアップ一覧"
