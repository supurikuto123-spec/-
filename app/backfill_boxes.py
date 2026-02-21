#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sqlite3, json, os, sys
from pathlib import Path

DB_PATH  = Path("/var/www/tomy634.com/app/mail.db")
BOX_DIR  = Path("/var/www/tomy634.com/api/boxes")
MSG_DIR  = Path("/var/www/tomy634.com/api/messages")

def atomic_write(path: Path, data: str, mode: int = 0o664):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        f.write(data)
    os.replace(tmp, path)
    os.chmod(path, mode)

def main():
    conn = sqlite3.connect(str(DB_PATH))
    cur  = conn.cursor()

    # 全メールに .txt を作成
    for mid, body in cur.execute("SELECT id, COALESCE(body_text,'') FROM messages ORDER BY id"):
        out = MSG_DIR / f"{mid}.txt"
        if not out.exists():
            atomic_write(out, body)

    # 各 mailbox ごとに JSON を再生成（local_part.json）
    rows = cur.execute("SELECT id, local_part FROM mailboxes").fetchall()
    for mailbox_id, local in rows:
        items = []
        for mid, frm, sub, body, recv in cur.execute(
            "SELECT id, from_addr, subject, COALESCE(body_text,''), received_at "
            "FROM messages WHERE mailbox_id=? ORDER BY id DESC LIMIT 50",
            (mailbox_id,)
        ):
            snippet = (body or "").replace("\r","")[:240]
            items.append({
                "id": mid,
                "box_id": local,   # 旧UI互換：local を box_id として出す
                "subject": sub or "",
                "from": frm or "",
                "date": recv or "",
                "snippet": snippet,
            })
        atomic_write(BOX_DIR / f"{local}.json", json.dumps(items, ensure_ascii=False))
        print(f"rebuilt {local}.json ({len(items)} msgs)")

    conn.close()
    return 0

if __name__ == "__main__":
    sys.exit(main())
