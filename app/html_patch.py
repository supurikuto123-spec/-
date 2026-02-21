# -*- coding: utf-8 -*-
import re, html

def _html_to_text(src: str) -> str:
    if not isinstance(src, str):
        return ""
    s = src

    # remove script/style
    s = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', '', s)

    # normalize newlines
    s = s.replace('\r\n', '\n').replace('\r', '\n')

    # structural breaks
    s = re.sub(r'(?i)<br\s*/?>', '\n', s)
    s = re.sub(r'(?i)</p\s*>', '\n\n', s)
    s = re.sub(r'(?i)</h[1-6]\s*>', '\n\n', s)
    s = re.sub(r'(?i)</li\s*>', '\n', s)
    s = re.sub(r'(?i)</(div|section|article|table|tr)\s*>', '\n', s)

    # remove all tags
    s = re.sub(r'(?is)<[^>]+>', '', s)

    # decode entities
    s = html.unescape(s)

    # collapse spaces
    s = re.sub(r'[ \t]+\n', '\n', s)
    s = re.sub(r'\n{3,}', '\n\n', s)

    # trim
    return s.strip()

def extract_text(msg) -> str:
    """
    EmailMessage (policy.default) を受け取り本文テキストを返す。
    1) text/plain を最優先
    2) 無ければ全ての text/plain を結合
    3) 無ければ text/html を _html_to_text で変換
    4) それでも無ければ get_content() を最後に返す
    """
    # 1) prefer plain
    try:
        part = msg.get_body(preferencelist=("plain",))
        if part:
            txt = part.get_content()
            if isinstance(txt, str) and txt.strip():
                return txt.strip()
    except Exception:
        pass

    # 2) collect all plains
    plains = []
    try:
        for p in msg.walk():
            if p.get_content_type() == "text/plain":
                t = p.get_content()
                if isinstance(t, str) and t.strip():
                    plains.append(t.strip())
    except Exception:
        pass
    if plains:
        return "\n\n".join(plains).strip()

    # 3) html -> text
    try:
        part = msg.get_body(preferencelist=("html",))
        if part:
            html_src = part.get_content()
            if isinstance(html_src, str) and html_src.strip():
                return _html_to_text(html_src)
    except Exception:
        pass

    # 4) last resort
    try:
        payload = msg.get_content()
        if isinstance(payload, str) and payload.strip():
            # 安全弁：もしHTMLっぽかったら剥がす
            body = payload.strip()
            if "<" in body and ">" in body and len(body) - len(re.sub(r'[<>]', '', body)) > 10:
                return _html_to_text(body)
            return body
    except Exception:
        pass

    return ""
