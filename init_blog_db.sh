#!/bin/bash
# ============================================
# Sutemeado ブログデータベース初期化スクリプト
# VPS環境でブログ機能を有効化する
# ============================================

set -e

# 設定
APP_DIR="/var/www/sutemeado.com"
DB_FILE="${APP_DIR}/data.db"
BACKUP_DIR="${APP_DIR}/backups"

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Sutemeado Blog Database Init${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ヘッダー表示
print_header

# ディレクトリ確認
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# バックアップ作成
print_warning "Creating database backup..."
if [ -f "$DB_FILE" ]; then
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="${BACKUP_DIR}/data_before_blog_$(date +%Y%m%d_%H%M%S).db"
    cp "$DB_FILE" "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
else
    print_warning "No existing database found. Will create new one."
fi

# better-sqlite3インストール確認
echo
echo "Checking better-sqlite3 installation..."
if ! npm list better-sqlite3 &>/dev/null; then
    print_warning "Installing better-sqlite3..."
    npm install better-sqlite3
    print_success "better-sqlite3 installed"
else
    print_success "better-sqlite3 already installed"
fi

# データベース初期化（Node.jsスクリプト実行）
echo
echo "Initializing blog tables..."

node << 'NODE_EOF'
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join('/var/www/sutemeado.com', 'data.db');
const db = new Database(DB_PATH);

// ブログテーブル作成
db.exec(`
CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    og_image TEXT,
    author TEXT DEFAULT 'Sutemeado Team',
    status TEXT DEFAULT 'draft',
    published_at INTEGER,
    updated_at INTEGER,
    created_at INTEGER DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
    views INTEGER DEFAULT 0,
    category TEXT,
    tags TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);

CREATE TABLE IF NOT EXISTS blog_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at INTEGER
);
`);

// デフォルト設定挿入
const defaultSettings = [
    ['blog_title', 'Sutemeado Blog'],
    ['blog_description', '一時メールサービスSutemeadoの最新情報、使い方ガイド、メールセキュリティのヒントをお届けします。'],
    ['posts_per_page', '10']
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO blog_settings (key, value, updated_at) VALUES (?, ?, ?)');
const now = Date.now();
defaultSettings.forEach(([key, value]) => {
    insertSetting.run(key, value, now);
});

// サンプル記事を挿入（なければ）
const samplePosts = [
    {
        slug: 'welcome-to-sutemeado-blog',
        title: 'Sutemeadoブログへようこそ',
        content: `<h1>Sutemeadoブログへようこそ</h1>
<p>Sutemeadoは、<strong>登録不要・即座に使える一時メールサービス</strong>です。スパムメールを回避し、プライバシーを守るための最適なソリューションを提供します。</p>
<h2>Sutemeadoの主な特徴</h2>
<ul>
<li><strong>即座に使用可能</strong>：アプリのダウンロードやアカウント登録は不要</li>
<li><strong>プライバシー保護</strong>：個人情報を守り、スパムを防止</li>
<li><strong>自動消去</strong>：一定時間後にメールが自動削除</li>
<li><strong>完全無料</strong>：基本機能は全て無料で利用可能</li>
</ul>
<h2>このブログについて</h2>
<p>このブログでは、Sutemeadoの最新アップデート、使い方ガイド、メールセキュリティに関する情報を発信しています。</p>`,
        excerpt: 'Sutemeado一時メールサービスの公式ブログへようこそ。最新情報や使い方ガイドをお届けします。',
        meta_description: 'Sutemeadoの公式ブログ。一時メールサービスの使い方、メールセキュリティのヒント、最新アップデート情報を配信しています。',
        meta_keywords: '一時メール,スパム防止,プライバシー保護,Sutemeado,使い方ガイド',
        category: 'お知らせ',
        tags: 'welcome,guide'
    },
    {
        slug: 'how-to-use-temporary-email',
        title: '一時メールの正しい使い方と活用シーン',
        content: `<h1>一時メールの正しい使い方と活用シーン</h1>
<p>一時メールは、<strong>短期間だけメールアドレスが必要な場面</strong>で非常に便利なツールです。しかし、適切な使い方を知らないと、思わぬトラブルに繋がる可能性もあります。</p>
<h2>一時メールの理想的な活用シーン</h2>
<h3>1. オンラインショッピングの会員登録</h3>
<p>一度だけ購入したいサイトでの会員登録時に使用。購入後のプロモーションメールを回避できます。</p>
<h3>2. フリーミアムサービスの試用</h3>
<p>無料トライアル期間だけ使いたいサービスの登録に。自動更新の通知を防げます。</p>
<h3>3. 掲示板やフォーラムへの投稿</h3>
<p>返信通知が必要な一時的な投稿に使用。</p>
<h2>避けるべき使用法</h2>
<div style="background:#ffebee;padding:15px;border-radius:5px;margin:15px 0;">
<p><strong>注意：</strong>以下の用途には一時メールを使用しないでください：</p>
<ul>
<li>銀行や金融機関の口座登録</li>
<li>重要な個人情報を含むサービス</li>
<li>パスワードリセットが必要な重要アカウント</li>
<li>長期的なコミュニケーションが必要な場面</li>
</ul>
</div>
<h2>Sutemeadoの使い方</h2>
<ol>
<li>トップページで「新しいアドレス」をクリック</li>
<li>自動生成されたアドレスをコピー</li>
<li>必要なサービスに貼り付け</li>
<li>受信ボックスでメールを確認</li>
</ol>`,
        excerpt: '一時メールの理想的な活用シーンと避けるべき使用法を解説。Sutemeadoの効果的な使い方をご紹介します。',
        meta_description: '一時メールの正しい使い方と活用シーンを解説。Sutemeadoを安全に効果的に利用するためのガイドです。',
        meta_keywords: '一時メール,使い方,活用シーン,プライバシー保護,メールセキュリティ',
        category: '使い方ガイド',
        tags: 'guide,tips,security'
    }
];

const insertPost = db.prepare(`
    INSERT OR IGNORE INTO blog_posts (
        slug, title, content, excerpt, meta_description, meta_keywords,
        author, status, published_at, updated_at, category, tags
    ) VALUES (?, ?, ?, ?, ?, ?, 'Sutemeado Team', 'published', ?, ?, ?, ?)
`);

const now2 = Date.now();
samplePosts.forEach(post => {
    insertPost.run(
        post.slug,
        post.title,
        post.content,
        post.excerpt,
        post.meta_description,
        post.meta_keywords,
        now2,
        now2,
        post.category,
        post.tags
    );
});

// 確認
const postCount = db.prepare("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'").get();
console.log(`✅ Blog database initialized with ${postCount.count} posts`);

db.close();
NODE_EOF

# 権限設定
print_warning "Setting database permissions..."
if [ -f "$DB_FILE" ]; then
    chmod 644 "$DB_FILE"
    print_success "Database permissions set to 644"
fi

# PM2再起動確認
echo
echo -e "${YELLOW}⚠️  Restart PM2 service to apply changes? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    print_warning "Restarting PM2 service..."
    pm2 restart sutemeado || pm2 start ecosystem.config.js --env production
    pm2 save
    print_success "PM2 service restarted"
else
    print_warning "Skipping PM2 restart. Remember to restart manually with: pm2 restart sutemeado"
fi

# 完了メッセージ
echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Blog Database Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo "Blog URL: https://sutemeado.com/blog"
echo "Database: $DB_FILE"
echo "Backup: $BACKUP_DIR"
echo
echo "Next steps:"
echo "1. Visit https://sutemeado.com/blog to verify"
echo "2. Add your AdSense ID to public/blog.html and public/blog/post.html"
echo "3. Create more blog posts via API or SQL"
echo
