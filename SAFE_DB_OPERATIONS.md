# 安全なDB更新ガイド

## ⚠️ 絶対にやらないで！

### ❌ 危険なコマンド（データ消失の原因）

```sql
-- 絶対に使わない！
DROP TABLE users;          -- データ全消去
DROP TABLE mails;          -- データ全消去
DELETE FROM users;         -- データ全消去（WHEREなし）
DELETE FROM mails;         -- データ全消去（WHEREなし）

-- 無条件UPDATEも危険
UPDATE users SET password = 'xxx';  -- 全パスワード変更
```

---

## ✅ 安全な更新コマンド

### 1. バックアップを必ず作成

```bash
# 方法1: SQLiteネイティブ（推奨）
sqlite3 /var/www/sutemeado.com/data.db ".backup '/var/www/sutemeado.com/backups/data_$(date +%Y%m%d_%H%M%S).db'"

# 方法2: 単純コピー（停止中のみ）
cp /var/www/sutemeado.com/data.db /var/www/sutemeado.com/backups/data_backup.db
```

### 2. カラム追加（既存データ保持）

```bash
# スクリプトを使用
./safe-add-column.sh users avatar_url TEXT

# または直接実行
sqlite3 /var/www/sutemeado.com/data.db "ALTER TABLE users ADD COLUMN avatar_url TEXT;"
```

### 3. データ挿入（UPSERT - 安全）

```sql
-- 存在しない場合のみ挿入、存在する場合は更新
INSERT INTO users (address, password, created_at) 
VALUES ('xxx@sutemeado.com', 'password', 1234567890)
ON CONFLICT(address) DO UPDATE SET password = excluded.password;

-- cumulative_statsの場合
INSERT INTO cumulative_stats (key, value) 
VALUES ('total_addresses', 1) 
ON CONFLICT(key) DO UPDATE SET value = value + 1;
```

### 4. データ更新（WHERE必須）

```sql
-- OK: 特定のアドレスのみ更新
UPDATE users SET password = 'newpass' WHERE address = 'xxx@sutemeado.com';

-- OK: 条件付き更新
UPDATE mails SET is_read = 1 WHERE id = 123;

-- NG: WHEREなし（全行更新される）
UPDATE users SET password = 'newpass';  -- ← 絶対にしない！
```

### 5. データ削除（慎重に）

```sql
-- OK: 特定レコードのみ
DELETE FROM mails WHERE id = 123;
DELETE FROM mails WHERE created_at < 1234567890;

-- OK: 特定アドレスのメールのみ
DELETE FROM mails WHERE address = 'xxx@sutemeado.com';

-- NG: 全削除
DELETE FROM mails;  -- ← 絶対にしない！
```

---

## 🛡️ スクリプト活用

### safe-db-update.sh
データを失わずにメンテナンスを実行
```bash
./safe-db-update.sh
```
- 自動バックアップ作成
- 整合性チェック
- 更新前後の検証
- 自動ロールバック（問題検出時）

### safe-add-column.sh
既存データを保持してカラム追加
```bash
./safe-add-column.sh <テーブル> <カラム名> <データ型>
./safe-add-column.sh users avatar_url TEXT
```

### safe-migrate.sh
テーブル構造を安全に変更
```bash
./safe-migrate.sh
# インタラクティブにガイド
```

### safe-stats-update.sh
カウンターを安全に修正
```bash
./safe-stats-update.sh
# 実データと統計の同期
```

---

## 🔄 ロールバック方法

万が一問題が発生した場合：

```bash
# 1. PM2停止
pm2 stop sutemeado

# 2. バックアップから復元
sudo cp /var/www/sutemeado.com/backups/data_YYYYMMDD_HHMMSS.db /var/www/sutemeado.com/data.db

# 3. パーミッション設定
sudo chown root:root /var/www/sutemeado.com/data.db
sudo chmod 644 /var/www/sutemeado.com/data.db

# 4. PM2再起動
pm2 restart sutemeado
```

---

## 📊 整合性チェック

```bash
# DB整合性確認
sqlite3 /var/www/sutemeado.com/data.db "PRAGMA integrity_check;"

# テーブル情報確認
sqlite3 /var/www/sutemeado.com/data.db ".tables"
sqlite3 /var/www/sutemeado.com/data.db "SELECT name, sql FROM sqlite_master WHERE type='table';"

# レコード数確認
sqlite3 /var/www/sutemeado.com/data.db "SELECT COUNT(*) FROM users;"
sqlite3 /var/www/sutemeado.com/data.db "SELECT COUNT(*) FROM mails;"
```

---

## ⚠️ 更新前のチェックリスト

- [ ] バックアップを作成したか？
- [ ] バックアップの整合性を確認したか？
- [ ] テスト環境で試したか？
- [ ] WHERE句を確認したか？（UPDATE/DELETE時）
- [ ] IF NOT EXISTSを使用したか？（CREATE時）
- [ ] 更新後にレコード数を確認したか？
- [ ] ロールバック手順を確認したか？
