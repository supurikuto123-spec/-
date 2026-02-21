PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mailboxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    box_id TEXT NOT NULL UNIQUE,   -- APIで使うID（ランダム文字列）
    local_part TEXT NOT NULL,      -- メールアドレスのローカル部 (例: "abc-123")
    user_id INTEGER,               -- NULLならゲスト専用
    created_at TEXT NOT NULL,
    last_seen_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mailboxes_local_part ON mailboxes(local_part);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mailbox_id INTEGER NOT NULL,
    from_addr TEXT,
    subject TEXT,
    body_text TEXT,
    received_at TEXT NOT NULL,
    message_uid TEXT,
    FOREIGN KEY(mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_mailbox_time ON messages(mailbox_id, received_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_uid ON messages(message_uid);
-- =========================================================
-- 累計カウンター (総メールアドレス数 / 総受信メール数)
--   ・mailboxes に INSERT されたら total_boxes を +1
--   ・messages に INSERT されたら total_messages を +1
--   ・DELETE しても減らない（INSERT 時にしか増えない）
-- =========================================================

CREATE TABLE IF NOT EXISTS stats (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  total_boxes    INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO stats (id, total_boxes, total_messages)
VALUES (1, 0, 0);

CREATE TRIGGER IF NOT EXISTS trg_inc_total_boxes
AFTER INSERT ON mailboxes
BEGIN
  UPDATE stats
    SET total_boxes = total_boxes + 1
  WHERE id = 1;
END;

CREATE TRIGGER IF NOT EXISTS trg_inc_total_messages
AFTER INSERT ON messages
BEGIN
  UPDATE stats
    SET total_messages = total_messages + 1
  WHERE id = 1;
END;
