#!/bin/bash
# DB診断スクリプト - VPS上で実行

echo "=========================================="
echo "Sutemeado DB 診断ツール"
echo "=========================================="
echo ""

# 現在のディレクトリ
echo "📂 現在のディレクトリ: $(pwd)"
echo ""

# PM2プロセス確認
echo "🔍 PM2プロセス状態:"
pm2 status sutemeado 2>/dev/null || echo "⚠️ sutemeadoプロセスが見つかりません"
echo ""

# PM2環境変数確認
echo "🔧 PM2環境変数:"
pm2 env sutemeado 2>/dev/null | grep -E "(DB_PATH|DB_DIR|NODE_ENV|PWD|HOME)" || echo "⚠️ PM2環境変数が取得できません"
echo ""

# 設定ファイル確認
echo "📋 ecosystem.config.js 確認:"
if [ -f ecosystem.config.js ]; then
    grep -A2 "DB_PATH" ecosystem.config.js || echo "DB_PATH設定なし"
else
    echo "⚠️ ecosystem.config.js が見つかりません"
fi
echo ""

# DBファイル検索（複数場所で検索）
echo "💾 DBファイル検索:"
echo "  1. /var/www/sutemeado.com/data.db"
ls -la /var/www/sutemeado.com/data.db 2>/dev/null || echo "     ❌ 見つかりません"

echo "  2. $(pwd)/data.db"
ls -la $(pwd)/data.db 2>/dev/null || echo "     ❌ 見つかりません"

echo "  3. /root/data.db"
ls -la /root/data.db 2>/dev/null || echo "     ❌ 見つかりません"

echo "  4. /root/.pm2/data.db"
ls -la /root/.pm2/data.db 2>/dev/null || echo "     ❌ 見つかりません"

echo "  5. $HOME/data.db"
ls -la $HOME/data.db 2>/dev/null || echo "     ❌ 見つかりません"
echo ""

# 全システムからdata.dbを検索
echo "🔎 全システム検索（data.db）:"
find /var/www /root /home -name "data.db" -type f 2>/dev/null | while read f; do
    echo "  ✅ 発見: $f ($(ls -lh $f | awk '{print $5}'))"
done
if [ $? -ne 0 ]; then
    echo "  ❌ 見つかりません"
fi
echo ""

# better-sqlite3パッケージ確認
echo "📦 パッケージ確認:"
ls -la node_modules/better-sqlite3 2>/dev/null | head -1 || echo "⚠️ better-sqlite3 が見つかりません"
echo ""

# ログ確認
echo "📜 最近のPM2ログ（最後10行）:"
pm2 logs sutemeado --nostream --lines 10 2>/dev/null || echo "⚠️ ログが取得できません"
echo ""

echo "=========================================="
echo "診断完了"
echo "=========================================="
