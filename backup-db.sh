#!/bin/bash
# DBバックアップスクリプト

DB_PATH="/var/www/sutemeado.com/data.db"
BACKUP_DIR="/var/www/sutemeado.com/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# バックアップディレクトリ作成
mkdir -p "$BACKUP_DIR"

# SQLiteバックアップ
cp "$DB_PATH" "$BACKUP_DIR/data_$DATE.db"

# 古いバックアップを削除（7日分保持）
find "$BACKUP_DIR" -name "data_*.db" -mtime +7 -delete

echo "Backup created: $BACKUP_DIR/data_$DATE.db"
