#!/bin/bash
# Sutemeado サイト更新スクリプト
# ユーザーがVPSで実行してサイトを更新するためのスクリプト

set -e

APP_DIR="/var/www/sutemeado.com"
SERVICE_NAME="sutemeado"
DB_FILE="/var/www/sutemeado.com/data.db"
BACKUP_DIR="/var/backups/sutemeado"

echo "🔄 Sutemeado サイト更新を開始します..."

# アプリケーションディレクトリに移動
cd $APP_DIR

# DBバックアップを作成（念のため）
echo "💾 データベースをバックアップ..."
mkdir -p $BACKUP_DIR
if [ -f "$DB_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/data_$(date +%Y%m%d_%H%M%S).db"
    cp $DB_FILE $BACKUP_FILE
    echo "✅ バックアップ作成: $BACKUP_FILE"
fi

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

# PM2サービスを再起動（ecosystem.config.js使用）
echo "🔄 サービスを再起動..."
if [ -f "ecosystem.config.js" ]; then
    # 新しい設定ファイルを使用
    pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
else
    # 従来の方法
    pm2 restart $SERVICE_NAME || pm2 start server.js --name $SERVICE_NAME
fi
pm2 save

# DBファイルの権限確認（永続化対策）
if [ -f "$DB_FILE" ]; then
    chmod 644 $DB_FILE
    echo "✅ DBファイル権限を設定: $DB_FILE"
fi

# ステータス確認
echo "✅ サービスステータス:"
pm2 status $SERVICE_NAME

# 統計情報を表示
echo "📊 現在の統計情報:"
curl -s http://localhost:3000/api/status | grep -E '"mailboxes"|"totalMails"|"totalMailsAllTime"' || echo "統計取得失敗"

echo ""
echo "🎉 更新が完了しました！"
echo "🌐 https://sutemeado.com"
echo "💾 DBファイル: $DB_FILE"
echo ""
echo "📋 便利なコマンド:"
echo "  pm2 logs $SERVICE_NAME        # ログ表示"
echo "  pm2 restart $SERVICE_NAME     # 再起動"
echo "  ls -la $DB_FILE               # DBファイル確認"
echo "  ls -la $BACKUP_DIR            # バックアップ一覧"
echo ""
