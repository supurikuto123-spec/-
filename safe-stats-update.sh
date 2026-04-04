#!/bin/bash
# ============================================
# 【安全な統計情報更新】
# カウンターを安全に更新・修正
# ============================================

set -e

DB_PATH="/var/www/sutemeado.com/data.db"
BACKUP_DIR="/var/www/sutemeado.com/backups"
DATE=$(date +%Y%m%d_%H%M%S)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=== 統計情報安全更新ツール ===${NC}"
echo ""

# バックアップ
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/stats_update_$DATE.db"
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
echo "✓ バックアップ作成: $BACKUP_FILE"
echo ""

# 現在の統計
echo -e "${BLUE}【現在の実データ】${NC}"
ACTUAL_ADDRESSES=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;")
ACTUAL_MAILS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM mails;")
echo "  実アドレス数: $ACTUAL_ADDRESSES"
echo "  実メール数: $ACTUAL_MAILS"
echo ""

echo -e "${BLUE}【累積統計(cumulative_stats)】${NC}"
sqlite3 "$DB_PATH" "SELECT key, value FROM cumulative_stats;" | while read line; do
    echo "  $line"
done
echo ""

echo -e "${BLUE}【現在の統計(stats)】${NC}"
sqlite3 "$DB_PATH" "SELECT key, value, datetime(updated_at/1000, 'unixepoch', 'localtime') as updated FROM stats;" | while read line; do
    echo "  $line"
done
echo ""

# メニュー
echo "操作を選択してください:"
echo "  1) 累積アドレスカウンターを実数に同期"
echo "  2) 累積メールカウンターを実数に同期"
echo "  3) 両方同期"
echo "  4) 特定のカウンター値を設定"
echo "  5) 終了"
echo ""
read -p "選択 (1-5): " CHOICE

case $CHOICE in
    1)
        echo -e "${YELLOW}アドレスカウンターを $ACTUAL_ADDRESSES に設定...${NC}"
        sqlite3 "$DB_PATH" "INSERT INTO cumulative_stats (key, value) VALUES ('total_addresses', $ACTUAL_ADDRESSES) ON CONFLICT(key) DO UPDATE SET value = $ACTUAL_ADDRESSES;"
        echo -e "${GREEN}✓ 完了${NC}"
        ;;
    2)
        echo -e "${YELLOW}メールカウンターを $ACTUAL_MAILS に設定...${NC}"
        sqlite3 "$DB_PATH" "INSERT INTO cumulative_stats (key, value) VALUES ('total_mails', $ACTUAL_MAILS) ON CONFLICT(key) DO UPDATE SET value = $ACTUAL_MAILS;"
        echo -e "${GREEN}✓ 完了${NC}"
        ;;
    3)
        echo -e "${YELLOW}両方のカウンターを同期...${NC}"
        sqlite3 "$DB_PATH" "INSERT INTO cumulative_stats (key, value) VALUES ('total_addresses', $ACTUAL_ADDRESSES) ON CONFLICT(key) DO UPDATE SET value = $ACTUAL_ADDRESSES;"
        sqlite3 "$DB_PATH" "INSERT INTO cumulative_stats (key, value) VALUES ('total_mails', $ACTUAL_MAILS) ON CONFLICT(key) DO UPDATE SET value = $ACTUAL_MAILS;"
        echo -e "${GREEN}✓ 完了${NC}"
        ;;
    4)
        read -p "カウンター名 (total_addresses/total_mails): " KEY
        read -p "新しい値: " VALUE
        sqlite3 "$DB_PATH" "INSERT INTO cumulative_stats (key, value) VALUES ('$KEY', $VALUE) ON CONFLICT(key) DO UPDATE SET value = $VALUE;"
        echo -e "${GREEN}✓ 完了${NC}"
        ;;
    5)
        echo "終了します"
        exit 0
        ;;
    *)
        echo -e "${RED}無効な選択です${NC}"
        exit 1
        ;;
esac

echo ""
echo "【更新後の統計】"
sqlite3 "$DB_PATH" "SELECT key, value FROM cumulative_stats;"
