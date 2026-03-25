#!/bin/bash
# ============================================
# 【安全なDB更新スクリプト】
# データを消さずに安全にDBを更新・メンテナンス
# ============================================

set -e  # エラー時に停止

# 設定
DB_PATH="/var/www/sutemeado.com/data.db"
BACKUP_DIR="/var/www/sutemeado.com/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/data_backup_$DATE.db"

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Sutemeado 安全DB更新ツール ===${NC}"
echo ""

# ============================================
# 1. 事前チェック
# ============================================
echo -e "${YELLOW}[1/6] 事前チェック...${NC}"

if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}エラー: DBファイルが見つかりません: $DB_PATH${NC}"
    exit 1
fi

DB_SIZE=$(stat -f%z "$DB_PATH" 2>/dev/null || stat -c%s "$DB_PATH" 2>/dev/null)
echo "✓ DBファイル存在確認: $DB_PATH ($DB_SIZE bytes)"

# ============================================
# 2. 必ずバックアップ作成
# ============================================
echo ""
echo -e "${YELLOW}[2/6] バックアップ作成...${NC}"

mkdir -p "$BACKUP_DIR"

# SQLite固有のバックアップ（安全で確実）
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}エラー: バックアップ作成に失敗しました${NC}"
    exit 1
fi

BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
echo "✓ バックアップ作成完了: $BACKUP_FILE ($BACKUP_SIZE bytes)"

# バックアップ整合性チェック
if sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
    echo "✓ バックアップ整合性チェック: OK"
else
    echo -e "${RED}警告: バックアップの整合性に問題があります${NC}"
    exit 1
fi

# ============================================
# 3. 現在の状態を確認
# ============================================
echo ""
echo -e "${YELLOW}[3/6] 現在のDB状態確認...${NC}"

# アドレス数
ADDRESS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;")
echo "  アドレス数: $ADDRESS_COUNT"

# メール数
MAIL_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM mails;")
echo "  メール数: $MAIL_COUNT"

# テーブル一覧
echo "  テーブル一覧:"
sqlite3 "$DB_PATH" ".tables" | tr ' ' '\n' | while read table; do
    if [ ! -z "$table" ]; then
        count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM $table;")
        echo "    - $table: $count レコード"
    fi
done

# ============================================
# 4. 安全な更新実行（必要に応じて）
# ============================================
echo ""
echo -e "${YELLOW}[4/6] 更新操作...${NC}"

# ===== 安全な操作例 =====
# 【削除しないで！】DROP TABLE - 絶対に使わない！
# 【安全】ALTER TABLE ADD COLUMN - 新しいカラム追加
# 【安全】CREATE INDEX - インデックス作成
# 【安全】UPDATE - WHERE句必須
# 【安全】INSERT OR REPLACE - UPSERT
# 【安全】PRAGMA - 設定変更

# 安全な更新をここに記述
# 例1: 新しいカラム追加（存在しない場合のみ）
# sqlite3 "$DB_PATH" "ALTER TABLE users ADD COLUMN IF NOT EXISTS new_column TEXT;"

# 例2: インデックス作成（存在しない場合のみ）
# sqlite3 "$DB_PATH" "CREATE INDEX IF NOT EXISTS idx_mails_address ON mails(address);"

# 例3: 統計情報更新
sqlite3 "$DB_PATH" "INSERT OR REPLACE INTO stats (key, value, updated_at) VALUES ('last_maintenance', '$(date +%s)000', $(date +%s)000);"

echo "✓ 更新操作完了"

# ============================================
# 5. 更新後の検証
# ============================================
echo ""
echo -e "${YELLOW}[5/6] 更新後の検証...${NC}"

# 整合性チェック
INTEGRITY=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;")
if [ "$INTEGRITY" = "ok" ]; then
    echo "✓ DB整合性チェック: OK"
else
    echo -e "${RED}エラー: DB整合性に問題が検出されました${NC}"
    echo "$INTEGRITY"
    echo ""
    echo "ロールバックを実行します..."
    cp "$BACKUP_FILE" "$DB_PATH"
    echo -e "${GREEN}✓ ロールバック完了${NC}"
    exit 1
fi

# レコード数が極端に減っていないか確認
NEW_ADDRESS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;")
NEW_MAIL_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM mails;")

if [ "$NEW_ADDRESS_COUNT" -lt "$((ADDRESS_COUNT / 2))" ]; then
    echo -e "${RED}警告: アドレス数が大幅に減少しています ($ADDRESS_COUNT → $NEW_ADDRESS_COUNT)${NC}"
    echo "ロールバックを実行します..."
    cp "$BACKUP_FILE" "$DB_PATH"
    echo -e "${GREEN}✓ ロールバック完了${NC}"
    exit 1
fi

if [ "$NEW_MAIL_COUNT" -lt "$((MAIL_COUNT / 2))" ]; then
    echo -e "${RED}警告: メール数が大幅に減少しています ($MAIL_COUNT → $NEW_MAIL_COUNT)${NC}"
    echo "ロールバックを実行します..."
    cp "$BACKUP_FILE" "$DB_PATH"
    echo -e "${GREEN}✓ ロールバック完了${NC}"
    exit 1
fi

echo "✓ アドレス数: $ADDRESS_COUNT → $NEW_ADDRESS_COUNT"
echo "✓ メール数: $MAIL_COUNT → $NEW_MAIL_COUNT"

# ============================================
# 6. 古いバックアップを整理
# ============================================
echo ""
echo -e "${YELLOW}[6/6] 古いバックアップの整理...${NC}"

# 30日以上前のバックアップを削除
DELETED=$(find "$BACKUP_DIR" -name "data_backup_*.db" -mtime +30 -delete -print | wc -l)
echo "✓ $DELETED 個の古いバックアップを削除"

# 残りのバックアップ数
REMAINING=$(find "$BACKUP_DIR" -name "data_backup_*.db" | wc -l)
echo "  残りのバックアップ: $REMAINING 個"

# ============================================
# 完了
# ============================================
echo ""
echo -e "${GREEN}=== DB更新完了 ===${NC}"
echo "バックアップ: $BACKUP_FILE"
echo ""
echo "【もし問題があった場合のロールバック方法】"
echo "  sudo cp $BACKUP_FILE $DB_PATH"
echo "  sudo chown root:root $DB_PATH"
echo "  sudo chmod 644 $DB_PATH"
echo "  pm2 restart sutemeado"
