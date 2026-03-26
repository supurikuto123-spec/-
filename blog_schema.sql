-- ============================================
-- Sutemeado ブログ機能データベーススキーマ
-- SEO & AdSense対応ブログシステム
-- ============================================

-- ブログ記事テーブル
CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,                    -- URL用（seo-friendly）
    title TEXT NOT NULL,                          -- 記事タイトル
    content TEXT NOT NULL,                        -- Markdown/HTML内容
    excerpt TEXT,                                -- 抜粋（SEO/meta用）
    meta_description TEXT,                         -- Meta description
    meta_keywords TEXT,                          -- Meta keywords
    og_image TEXT,                               -- OGP画像URL
    author TEXT DEFAULT 'Sutemeado Team',      -- 著者
    status TEXT DEFAULT 'draft',                -- draft/published/archived
    published_at INTEGER,                        -- 公開日時（Unix timestamp ms）
    updated_at INTEGER,                          -- 更新日時
    created_at INTEGER DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
    views INTEGER DEFAULT 0,                     -- 閲覧数
    category TEXT,                               -- カテゴリ
    tags TEXT                                    -- タグ（カンマ区切り）
);

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);

-- ブログ設定テーブル
CREATE TABLE IF NOT EXISTS blog_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at INTEGER
);

-- 初期設定値
INSERT OR REPLACE INTO blog_settings (key, value, updated_at) 
VALUES ('blog_title', 'Sutemeado Blog', CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER));

INSERT OR REPLACE INTO blog_settings (key, value, updated_at) 
VALUES ('blog_description', '一時メールサービスSutemeadoの最新情報、使い方ガイド、メールセキュリティのヒントをお届けします。', CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER));

INSERT OR REPLACE INTO blog_settings (key, value, updated_at) 
VALUES ('posts_per_page', '10', CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER));

-- サンプル記事（テンプレート）
-- 実際のコンテンツは管理画面や直接SQLで投入
INSERT OR IGNORE INTO blog_posts (
    slug, title, content, excerpt, meta_description, meta_keywords,
    author, status, published_at, updated_at, category, tags
) VALUES (
    'welcome-to-sutemeado-blog',
    'Sutemeadoブログへようこそ',
    '<h1>Sutemeadoブログへようこそ</h1>
<p>Sutemeadoは、<strong>登録不要・即座に使える一時メールサービス</strong>です。スパムメールを回避し、プライバシーを守るための最適なソリューションを提供します。</p>
<h2>Sutemeadoの主な特徴</h2>
<ul>
<li><strong>即座に使用可能</strong>：アプリのダウンロードやアカウント登録は不要</li>
<li><strong>プライバシー保護</strong>：個人情報を守り、スパムを防止</li>
<li><strong>自動消去</strong>：一定時間後にメールが自動削除</li>
<li><strong>完全無料</strong>：基本機能は全て無料で利用可能</li>
</ul>
<h2>このブログについて</h2>
<p>このブログでは、Sutemeadoの最新アップデート、使い方ガイド、メールセキュリティに関する情報を発信しています。</p>',
    'Sutemeado一時メールサービスの公式ブログへようこそ。最新情報や使い方ガイドをお届けします。',
    'Sutemeadoの公式ブログ。一時メールサービスの使い方、メールセキュリティのヒント、最新アップデート情報を配信しています。',
    '一時メール,スパム防止,プライバシー保護,Sutemeado,使い方ガイド',
    'Sutemeado Team',
    'published',
    CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER),
    CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER),
    'お知らせ',
    'welcome,guide'
);

INSERT OR IGNORE INTO blog_posts (
    slug, title, content, excerpt, meta_description, meta_keywords,
    author, status, published_at, updated_at, category, tags
) VALUES (
    'how-to-use-temporary-email',
    '一時メールの正しい使い方と活用シーン',
    '<h1>一時メールの正しい使い方と活用シーン</h1>
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
</ol>',
    '一時メールの理想的な活用シーンと避けるべき使用法を解説。Sutemeadoの効果的な使い方をご紹介します。',
    '一時メールの正しい使い方と活用シーンを解説。Sutemeadoを安全に効果的に利用するためのガイドです。',
    '一時メール,使い方,活用シーン,プライバシー保護,メールセキュリティ',
    'Sutemeado Team',
    'published',
    CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER),
    CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER),
    '使い方ガイド',
    'guide,tips,security'
);

-- 確認
SELECT 'ブログ記事数:' || COUNT(*) FROM blog_posts WHERE status = 'published';
