#!/usr/bin/env python3
import os
import random
import time
import sqlite3
from datetime import datetime, timezone

import requests

# ----------------- 設定 -----------------

BASE_URL = "https://tomy634.com"

# 管理用 admin API key（レート制限なし）
ADMIN_API_KEY = "adm_nwosqm1l69yt4cor1ckbvrhg"  # ←あなたの admin key

# SQLite のパス
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "mail.db")

# 1 回のヘルスチェックで作るボックス数とメール数の範囲
MIN_BOXES = 1
MAX_BOXES = 3
MIN_MAILS = 1
MAX_MAILS = 9

# 5 分で自動削除したいので、ここで待機時間を定義（秒）
DELETE_AFTER_SEC = 5 * 60

# 次のヘルスチェックまでの待機時間（秒）
MIN_INTERVAL = 60 * 60      # 60分
MAX_INTERVAL = 300 * 60     # 300分

# ---------------------------------------

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def create_box():
    """APIで一時ボックスを1つ作成して box_id, email を返す"""
    url = f"{BASE_URL}/api/v1/boxes"
    params = {"api_key": ADMIN_API_KEY}
    # テスト用なので ttl_days=1, max_messages は多めに
    payload = {
        "ttl_days": 1,
        "max_messages": 20
    }
    resp = requests.post(url, params=params, json=payload, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    print("[BOX] created:", data)
    return data["box_id"], data["email"]

def get_mailbox_id_from_db(box_id):
    """box_id から DB 上の mailbox_id を引く"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id FROM mailboxes WHERE box_id = ?", (box_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise RuntimeError(f"mailboxes に box_id={box_id} が見つかりません")
    return row[0]

def insert_dummy_mails(mailbox_id, count):
    """messages テーブルにダミーメールを count 通 INSERT"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for i in range(count):
        subject = f"[HEALTHCHECK] ping test {i+1}/{count}"
        body = (
            f"これは tomy634.com のヘルスチェック用ダミーメールです。\n"
            f"mailbox_id={mailbox_id}, index={i+1}/{count}\n"
            f"timestamp={now_iso()}\n"
        )
        cur.execute(
            """
            INSERT INTO messages (
              mailbox_id,
              from_addr,
              subject,
              body_text,
              received_at
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (
                mailbox_id,
                "healthcheck@tomy634.com",
                subject,
                body,
                now_iso(),
            )
        )
    conn.commit()
    conn.close()
    print(f"[MAIL] inserted {count} dummy messages into mailbox_id={mailbox_id}")

def delete_box(box_id):
    """APIでボックスごと削除"""
    url = f"{BASE_URL}/api/v1/boxes/{box_id}"
    params = {"api_key": ADMIN_API_KEY}
    resp = requests.delete(url, params=params, timeout=10)
    if resp.status_code == 404:
        print(f"[BOX] already deleted or not found: {box_id}")
        return
    resp.raise_for_status()
    print("[BOX] deleted:", box_id)

def one_healthcheck_round():
    """1 回分のヘルスチェック実行: ボックス作成→メール投入→5分後削除"""
    created_boxes = []  # [(box_id, mailbox_id), ...]

    # 1) ランダムな数だけボックスを作る
    num_boxes = random.randint(MIN_BOXES, MAX_BOXES)
    print(f"[ROUND] creating {num_boxes} box(es)")
    for _ in range(num_boxes):
        box_id, email = create_box()
        mailbox_id = get_mailbox_id_from_db(box_id)
        created_boxes.append((box_id, mailbox_id))

        # 各ボックスに 1〜9 通のダミーメール
        num_mails = random.randint(MIN_MAILS, MAX_MAILS)
        insert_dummy_mails(mailbox_id, num_mails)
        print(f"[ROUND] box={box_id} ({email}), mails={num_mails}")

    # 2) 5分待って削除
    print(f"[ROUND] sleep {DELETE_AFTER_SEC} sec before deleting boxes...")
    time.sleep(DELETE_AFTER_SEC)

    for box_id, _ in created_boxes:
        try:
            delete_box(box_id)
        except Exception as e:
            print(f"[ERROR] delete_box failed for {box_id}: {e}")

def main_loop():
    print("[PING] health_pinger started")
    while True:
        # まず 1 回実行
        try:
            one_healthcheck_round()
        except Exception as e:
            print("[ERROR] healthcheck round failed:", e)

        # 次の実行までランダムで待機
        interval = random.randint(MIN_INTERVAL, MAX_INTERVAL)
        print(f"[PING] next round in {interval/60:.1f} minutes")
        time.sleep(interval)

if __name__ == "__main__":
    main_loop()
