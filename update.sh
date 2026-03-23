#!/bin/bash
# Sutemeado サイト更新スクリプト
# ユーザーがVPSで実行してサイトを更新するためのスクリプト

set -e

APP_DIR="/var/www/sutemeado.com"
SERVICE_NAME="sutemeado"

echo "🔄 Sutemeado サイト更新を開始します..."

# アプリケーションディレクトリに移動
cd $APP_DIR

# 現在のブランチを保存
CURRENT_BRANCH=$(git branch --show-current)
echo "📂 現在のブランチ: $CURRENT_BRANCH"

# 最新のコードを取得
echo "📥 GitHubから最新コードを取得..."
git fetch origin
git reset --hard origin/main

# 依存関係を更新
echo "📦 依存関係を確認..."
npm install

# PM2サービスを再起動
echo "🔄 サービスを再起動..."
pm2 restart $SERVICE_NAME

# ステータス確認
echo "✅ サービスステータス:"
pm2 status $SERVICE_NAME

echo ""
echo "🎉 更新が完了しました！"
echo "🌐 https://sutemeado.com"
echo ""
echo "問題があればログを確認してください: pm2 logs $SERVICE_NAME"
