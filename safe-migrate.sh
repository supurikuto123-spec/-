#!/bin/bash
# ============================================
# 【安全なデータ移行スクリプト】
# データを失わずにテーブル構造を変更
# ============================================

set -e

DB_PATH="/var/www/sutemeado.com/data.db"
BACKUP_DIR="/var/www/sutemeado.com/backups"
DATE=$(date +%Y%m%d_%H%M%S)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== 安全なデータ移行ツール ===${NC}"
echo ""
echo "${YELLOW}【警告】${NC}"
echo "このスクリプトはテーブルの再作成を行います。"
echo "必ずバックアップを確認してから実行してください。"
echo ""

# テーブル名入力
read -p "移行するテーブル名: " TABLE

if [ -z "$TABLE" ]; then
    echo -e "${RED}エラー: テーブル名を入力してください${NC}"
    exit 1
fi

# テーブル存在チェック
if ! sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' AND name='$TABLE';" | grep -q "$TABLE"; then
    echo -e "${RED}エラー: テーブル '$TABLE' が存在しません${NC}"
    exit 1
fi

# 現在のレコード数
COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM $TABLE;")
echo "テーブル '$TABLE' のレコード数: $COUNT"

# バックアップ作成
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/migrate_${TABLE}_$DATE.db"
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
echo -e "${GREEN}✓ バックアップ作成: $BACKUP_FILE${NC}"

# スキーマ確認
echo ""
echo "【現在のスキーマ】"
sqlite3 "$DB_PATH" "SELECT sql FROM sqlite_master WHERE type='table' AND name='$TABLE';"

echo ""
echo "${YELLOW}手動で以下を実行してください:${NC}"
echo ""
echo "1. テンポラリテーブルを作成"
echo "   CREATE TABLE ${TABLE}_new (...);"
echo ""
echo "2. データをコピー"
echo "   INSERT INTO ${TABLE}_new SELECT * FROM $TABLE;"
echo ""
echo "3. 元テーブルをリネームして退避"
echo "   ALTER TABLE $TABLE RENAME TO ${TABLE}_old;"
echo ""
echo "4. 新テーブルをリネーム"
echo "   ALTER TABLE ${TABLE}_new RENAME TO $TABLE;"
echo ""
echo "5. 検証"
echo "   SELECT COUNT(*) FROM $TABLE;"
echo ""
echo "6. 問題なければ旧テーブル削除"
echo "   DROP TABLE ${TABLE}_old;"
echo ""
echo "【ロールバック方法】"
echo "   sudo cp $BACKUP_FILE $DB_PATH"
