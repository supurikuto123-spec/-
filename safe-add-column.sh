#!/bin/bash
# ============================================
# 【安全なカラム追加スクリプト】
# 既存データを保持したまま新しいカラムを追加
# ============================================

set -e

DB_PATH="/var/www/sutemeado.com/data.db"
BACKUP_DIR="/var/www/sutemeado.com/backups"
DATE=$(date +%Y%m%d_%H%M%S)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ヘルプ
if [ $# -lt 3 ]; then
    echo "使用方法: $0 <テーブル名> <カラム名> <データ型>"
    echo "例: $0 users avatar_url TEXT"
    echo "例: $0 users notification_enabled INTEGER DEFAULT 0"
    exit 1
fi

TABLE=$1
COLUMN=$2
TYPE=$3

echo -e "${GREEN}=== カラム追加: $TABLE.$COLUMN ($TYPE) ===${NC}"

# 1. バックアップ
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/before_add_column_$DATE.db"
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
echo "✓ バックアップ作成: $BACKUP_FILE"

# 2. カラム存在チェック
EXISTING=$(sqlite3 "$DB_PATH" "PRAGMA table_info($TABLE);" | grep "^|$COLUMN|")
if [ ! -z "$EXISTING" ]; then
    echo -e "${YELLOW}警告: カラム '$COLUMN' は既に存在します${NC}"
    exit 0
fi

# 3. 安全にカラム追加
sqlite3 "$DB_PATH" "ALTER TABLE $TABLE ADD COLUMN $COLUMN $TYPE;"
echo "✓ カラム追加完了"

# 4. 検証
if sqlite3 "$DB_PATH" "PRAGMA table_info($TABLE);" | grep -q "|$COLUMN|"; then
    echo -e "${GREEN}✓ カラム追加検証成功${NC}"
else
    echo -e "${RED}✗ カラム追加に失敗しました${NC}"
    exit 1
fi

echo ""
echo "【ロールバック方法】"
echo "  sudo cp $BACKUP_FILE $DB_PATH"
