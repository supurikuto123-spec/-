import re

# index.html のヘッダー部分を抽出（nav + drawer）
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# <nav から </nav> までを抽出
nav_match = re.search(r'<nav class="navbar">.*?</nav>', content, re.DOTALL)
if not nav_match:
    print("ERROR: Could not find navbar in index.html")
    exit(1)
nav_html = nav_match.group(0)

# ドロワーオーバーレイからドロワー終了までを抽出
# drawer-overlay から drawer 終了まで
overlay_match = re.search(r'<div class="drawer-overlay" id="drawer-overlay"></div>', content)
if not overlay_match:
    print("ERROR: Could not find drawer-overlay in index.html")
    exit(1)

# drawer 本体を抽出
drawer_match = re.search(r'<div class="drawer" id="drawer">.*?</div>\s*</div>\s*<div class="drawer-footer>', content, re.DOTALL)
# 正確に drawer 終了を検出するために drawer-footer + 閉じタグを含める
footer_pattern = r'<div class="drawer-footer>.*?</p>\s*</div>\s*</div>\s*</div>'
full_drawer_match = re.search(r'<div class="drawer-overlay" id="drawer-overlay"></div>\s*<div class="drawer" id="drawer">.*?</div>\s*</div>\s*</div>', content, re.DOTALL)
if not full_drawer_match:
    # シンプルなパターンで再試行
    # drawer-overlay + drawer 本体
    overlay_start = content.find('<div class="drawer-overlay" id="drawer-overlay"></div>')
    drawer_start = content.find('<div class="drawer" id="drawer">')
    # </div> の次が <main> となる位置を探す
    main_start = content.find('<main class="main">')
    if overlay_start == -1 or drawer_start == -1 or main_start == -1:
        print(f"ERROR: Could not find positions: overlay={overlay_start}, drawer={drawer_start}, main={main_start}")
        exit(1)
    drawer_html = content[overlay_start:main_start].strip()
else:
    drawer_html = full_drawer_match.group(0)

# ヘッダー全体を組み立て（nav + drawer）
header_template = nav_html + '\n\n' + drawer_html

print(f"Extracted header from index.html ({len(header_template)} chars)")
print("=" * 50)

# 各ページを更新
targets = ['news.html', 'faq.html', 'contact.html', 'status.html', 'how-to-use.html', 'terms.html', 'privacy.html']

for filename in targets:
    print(f"\nProcessing {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        page_content = f.read()
    
    # 既存の nav を探す
    nav_start = page_content.find('<nav')
    if nav_start == -1:
        print(f"  WARNING: No <nav> found in {filename}, skipping")
        continue
    
    # main タグを探す（header 終了位置）
    main_start = page_content.find('<main')
    if main_start == -1:
        print(f"  WARNING: No <main> found in {filename}, trying body")
        # body タグの後を探す
        body_start = page_content.find('<body>')
        if body_start == -1:
            print(f"  ERROR: Cannot find body in {filename}")
            continue
        main_start = body_start + 6  # <body> の後
    
    # 既存のヘッダーを新しいものに置換
    new_content = page_content[:nav_start] + header_template + '\n\n' + page_content[main_start:]
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  ✓ Updated {filename}")

print("\n" + "=" * 50)
print("All headers synchronized with index.html!")
