#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import re
import sqlite3
import time
import html
import argparse
import json
from pathlib import Path
from email import policy
from email.parser import BytesParser
from email.header import decode_header, make_header
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

DB_PATH   = Path("/var/www/tomy634.com/app/mail.db")
LOG_PATH  = Path("/var/www/tomy634.com/app/mail_receiver.log")
BOX_DIR   = Path("/var/www/tomy634.com/api/boxes")
MSG_DIR   = Path("/var/www/tomy634.com/api/messages")

ID_RE     = re.compile(r"^[a-z0-9]{6,64}$")
MAX_SNIP  = 240


def log(msg: str):
    try:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(time.strftime("[%Y-%m-%d %H:%M:%S] ") + str(msg) + "\n")
    except Exception:
        # ログに失敗してもメール処理は継続する
        pass


def decode_hdr(value: str | None) -> str:
    if not value:
        return ""
    try:
        return str(make_header(decode_header(value)))
    except Exception:
        return value or ""


# ---------- HTML -> text（URLもできるだけ残す版） ----------
def _html_to_text(s: str) -> str:
    if not isinstance(s, str):
        return ""

    # 1) <a href="URL">TEXT</a> を "TEXT URL" に展開
    def repl_anchor(m: re.Match) -> str:
        href = m.group(1) or ""
        text = m.group(2) or ""
        text = html.unescape(text.strip())
        href = html.unescape(href.strip())
        if text and href:
            return f"{text} {href}"
        return text or href

    s = re.sub(
        r'(?is)<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        repl_anchor,
        s,
    )

    # 2) script/style を削除
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", "", s)

    # 3) 改行整形
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = re.sub(r"(?i)<br\s*/?>", "\n", s)
    s = re.sub(r"(?i)</p\s*>", "\n\n", s)

    # 4) 残りのタグ削除
    s = re.sub(r"(?is)<[^>]+>", "", s)

    # 5) HTMLエンティティ復元
    s = html.unescape(s)

    # 6) 余分な空白・改行の圧縮
    s = re.sub(r"[ \t]+\n", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s)

    return s.strip()


# ---------- プレーンテキスト本文抽出 ----------
def extract_text(msg):
    """
    EmailMessage -> プレーンテキスト抽出
      1) get_body('plain')
      2) walk で text/plain 結合
      3) get_body('html') or walk で text/html → テキスト化
      4) 単一パート get_content()（必要ならHTMLをテキスト化）
    """
    # 1) ベスト候補 plain
    try:
        part = msg.get_body(preferencelist=("plain",))
        if part:
            txt = part.get_content()
            if isinstance(txt, str) and txt.strip():
                return txt.strip()
    except Exception as e:
        log(f"WARN: get_body plain failed: {e}")

    # 2) walk で text/plain の寄せ集め
    plains = []
    try:
        for p in msg.walk():
            if p.get_content_type() == "text/plain":
                t = p.get_content()
                if isinstance(t, str) and t.strip():
                    plains.append(t.strip())
    except Exception as e:
        log(f"WARN: walk plain failed: {e}")
    if plains:
        return "\n\n".join(plains).strip()

    # 3-a) get_body('html')
    try:
        part = msg.get_body(preferencelist=("html",))
        if part:
            h = part.get_content()
            if isinstance(h, str) and h.strip():
                return _html_to_text(h)
    except Exception as e:
        log(f"WARN: get_body html failed: {e}")

    # 3-b) walk で text/html
    try:
        for p in msg.walk():
            if p.get_content_type() == "text/html":
                h = p.get_content()
                if isinstance(h, str) and h.strip():
                    return _html_to_text(h)
    except Exception as e:
        log(f"WARN: walk html failed: {e}")

    # 4) 単一パート fallback
    try:
        payload = msg.get_content()
        if isinstance(payload, str) and payload.strip():
            body = payload.strip()
            if "<" in body and ">" in body:
                body = _html_to_text(body)
            return body
    except Exception as e:
        log(f"WARN: get_content fallback failed: {e}")

    return ""


# ---------- HTMLそのものの抽出（iframe表示など用） ----------
def extract_html(msg):
    """
    EmailMessage -> HTML本文そのもの（あれば）
      1) get_body('html')
      2) walk で text/html
      3) なければ ""（テキストメール）
    """
    try:
        part = msg.get_body(preferencelist=("html",))
        if part:
            h = part.get_content()
            if isinstance(h, str) and h.strip():
                return h
    except Exception as e:
        log(f"WARN: extract_html get_body html failed: {e}")

    try:
        for p in msg.walk():
            if p.get_content_type() == "text/html":
                h = p.get_content()
                if isinstance(h, str) and h.strip():
                    return h
    except Exception as e:
        log(f"WARN: extract_html walk html failed: {e}")

    return ""


def ensure_dirs():
    BOX_DIR.mkdir(parents=True, exist_ok=True)
    MSG_DIR.mkdir(parents=True, exist_ok=True)


def upsert_mailbox(local: str):
    """
    mailboxes テーブルに box を作成（なければ）
    """
    try:
        con = sqlite3.connect(DB_PATH, timeout=5.0)
        try:
            con.execute("PRAGMA journal_mode=WAL")
        except Exception:
            pass
        con.execute(
            """
            INSERT OR IGNORE INTO mailboxes
              (box_id, local_part, user_id, created_at, ttl_days, max_messages, delete_on_first)
            VALUES
              (?, ?, 1, strftime('%Y-%m-%dT%H:%M:%S','now'), 7, 50, 0)
            """,
            (local, local),
        )
        con.commit()
        con.close()
        log(f"upsert mailbox ok local={local}")
    except Exception as e:
        log(f"WARN: upsert mailbox failed local={local}: {e}")


def next_msg_id() -> int:
    """
    /api/messages/*.txt の最大ID + 1 を返す（既存互換）。
    DBの id とは別カウンタ。
    """
    mx = 0
    for p in MSG_DIR.glob("*.txt"):
        try:
            n = int(p.stem)
            if n > mx:
                mx = n
        except Exception:
            continue
    return mx + 1


def insert_message_db(
    local: str,
    from_addr: str,
    subject: str,
    body: str,
    iso_date: str,
    raw_source: bytes | str | None = None,
):
    """
    DB (mail.db) の messages テーブルに 1 行 INSERT する。
    local は box_id / local_part (例: "1qyqf646")。
    """
    try:
        con = sqlite3.connect(DB_PATH, timeout=5.0)
        try:
            con.execute("PRAGMA journal_mode=WAL")
        except Exception:
            pass

        cur = con.cursor()

        # mailbox_id を取る（box_id か local_part どちらか一致でOK）
        cur.execute(
            "SELECT id FROM mailboxes WHERE box_id = ? OR local_part = ? LIMIT 1",
            (local, local),
        )
        row = cur.fetchone()
        if not row:
            log(f"WARN: insert_message_db: mailbox not found local={local}")
            con.close()
            return

        mailbox_id = row[0]

        # raw_source をテキスト化して保存（あくまで参考用）
        raw_text = None
        if raw_source is not None:
            try:
                if isinstance(raw_source, bytes):
                    raw_text = raw_source.decode("utf-8", errors="replace")
                else:
                    raw_text = str(raw_source)
            except Exception:
                raw_text = None

        cur.execute(
            """
            INSERT INTO messages
                (mailbox_id, from_addr, subject, body_text, received_at, message_uid, raw_source)
            VALUES
                (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                mailbox_id,
                from_addr or "",
                subject or "",
                body or "",
                iso_date,
                None,      # message_uid（いまは未使用なので NULL）
                raw_text,  # 元メールの生ソース（テキスト化）
            ),
        )
        mid = cur.lastrowid
        con.commit()
        con.close()
        log(f"DB: inserted message id={mid} mailbox_id={mailbox_id} local={local}")
    except Exception as e:
        log(f"WARN: insert_message_db failed local={local}: {e}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rcpt", default="", help="original recipient address")
    args = ap.parse_args()

    # Postfix からの STDIN をそのまま MIME パース
    msg = BytesParser(policy=policy.default).parse(sys.stdin.buffer)

    # rcpt 優先、なければ To
    rcpt_addr = (args.rcpt or "").strip()
    if not rcpt_addr:
        rcpt_addr = (msg.get("To") or "").split(",")[0].strip()

    local = (rcpt_addr.split("@", 1)[0] or "").lower()
    if not ID_RE.match(local or ""):
        log(f"ERR: invalid rcpt={rcpt_addr!r}")
        return 0

    from_addr = decode_hdr(msg.get("From"))
    subject   = decode_hdr(msg.get("Subject"))

    # Date を ISO8601 に（TZなしはUTC扱い）
    try:
        dt = parsedate_to_datetime(msg.get("Date"))
        if dt is None:
            raise ValueError
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        iso_date = dt.isoformat()
    except Exception:
        iso_date = datetime.now().astimezone().isoformat()

    # テキスト & HTML 両方抽出
    body_text = extract_text(msg)
    html_body = extract_html(msg)

    snippet = (
        body_text[:MAX_SNIP] + ("\n" if body_text and not body_text.endswith("\n") else "")
    ) if body_text else ""

    ensure_dirs()
    upsert_mailbox(local)

    # ファイルベース（旧来互換）
    mid = next_msg_id()

    # テキスト本文ファイル
    with (MSG_DIR / f"{mid}.txt").open("w", encoding="utf-8", errors="ignore") as f:
        if body_text:
            f.write(body_text + ("" if body_text.endswith("\n") else "\n"))
        else:
            f.write("\n")

    # HTML本文ファイル（UI の iframe 用など）
    if html_body:
        with (MSG_DIR / f"{mid}.html").open("w", encoding="utf-8", errors="ignore") as f:
            f.write(html_body)

    # ボックス一覧 JSON を更新
    items_path = BOX_DIR / f"{local}.json"
    try:
        items = json.loads(items_path.read_text(encoding="utf-8")) if items_path.exists() else []
    except Exception:
        items = []

    items.insert(0, {
        "id": mid,
        "box_id": local,
        "subject": subject or "",
        "from": from_addr or "",
        "date": iso_date,
        "snippet": snippet,
        # UI 用フィールド
        "body": body_text or "",
        "html": html_body or "",
    })

    items_path.write_text(
        json.dumps(items[:200], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    # v1 API 用 DB 保存（元メールは as_bytes() で再構成）
    try:
        raw_bytes = msg.as_bytes(policy=policy.default)
    except Exception:
        raw_bytes = None
    insert_message_db(local, from_addr, subject, body_text, iso_date, raw_source=raw_bytes)

    log(f"OK: saved mid={mid} local={local} subject={subject!r}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
