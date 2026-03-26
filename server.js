const express = require('express');
const cors = require('cors');
const path = require('path');
const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const MailStore = require('./lib/mailstore');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 2525;

// メールストアの初期化
const mailStore = new MailStore();

// SQLiteデータベース初期化（ブログ用）
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
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

// デフォルト設定を挿入
const defaultSettings = [
    ['blog_title', 'Sutemeado Blog'],
    ['blog_description', '一時メールサービスSutemeadoの最新情報、使い方ガイド、メールセキュリティのヒントをお届けします。'],
    ['posts_per_page', '10']
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO blog_settings (key, value, updated_at) VALUES (?, ?, ?)');
defaultSettings.forEach(([key, value]) => {
    insertSetting.run(key, value, Date.now());
});

console.log('✅ Blog database initialized');

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===== API Routes =====

// 新しいメールアドレスを生成
app.get('/api/new-address', (req, res) => {
  const address = mailStore.generateAddress();
  res.json({
    success: true,
    address: address,
    domain: 'sutemeado.com'
  });
});

// 特定のアドレスのメールを取得
app.get('/api/mailbox/:address', (req, res) => {
  const { address } = req.params;
  const mails = mailStore.getMails(address);
  
  res.json({
    success: true,
    address: address,
    count: mails.length,
    mails: mails
  });
});

// 特定のメールの詳細を取得
app.get('/api/mailbox/:address/:mailId', (req, res) => {
  const { address, mailId } = req.params;
  const mail = mailStore.getMail(address, mailId);
  
  if (!mail) {
    return res.status(404).json({
      success: false,
      error: 'メールが見つかりません'
    });
  }
  
  res.json({
    success: true,
    mail: mail
  });
});

// メールを削除
app.delete('/api/mailbox/:address/:mailId', (req, res) => {
  const { address, mailId } = req.params;
  const deleted = mailStore.deleteMail(address, mailId);
  
  res.json({
    success: deleted,
    message: deleted ? 'メールを削除しました' : 'メールが見つかりません'
  });
});

// 全メールを削除
app.delete('/api/mailbox/:address', (req, res) => {
  const { address } = req.params;
  mailStore.clearMails(address);
  
  res.json({
    success: true,
    message: '全てのメールを削除しました'
  });
});

// サーバーステータス
app.get('/api/status', (req, res) => {
  const stats = mailStore.getStats();
  res.json({
    success: true,
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    stats: stats,
    smtpPort: SMTP_PORT
  });
});

// ===== Blog API Routes =====

// ブログ記事一覧取得
app.get('/api/blog/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const category = req.query.category || null;
    const offset = (page - 1) * perPage;

    let query = `
      SELECT id, slug, title, excerpt, meta_description, author, 
             published_at, updated_at, views, category, tags
      FROM blog_posts 
      WHERE status = 'published'
    `;
    let countQuery = "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'";
    const params = [];

    if (category) {
      query += " AND category = ?";
      countQuery += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY published_at DESC LIMIT ? OFFSET ?";

    const stmt = db.prepare(query);
    const countStmt = db.prepare(countQuery);

    const posts = stmt.all(...params, perPage, offset);
    const { total } = countStmt.get(...params);

    // レスポンス整形
    const formattedPosts = posts.map(post => ({
      ...post,
      published_date: post.published_at ? new Date(post.published_at).toISOString() : null,
      updated_date: post.updated_at ? new Date(post.updated_at).toISOString() : null
    }));

    res.json({
      success: true,
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        perPage: perPage,
        totalPosts: total,
        totalPages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    console.error('Blog posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load blog posts'
    });
  }
});

// 特定の記事取得（slugで）
app.get('/api/blog/post/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const stmt = db.prepare(`
      SELECT id, slug, title, content, excerpt, meta_description, meta_keywords, 
             og_image, author, published_at, updated_at, views, category, tags
      FROM blog_posts 
      WHERE slug = ? AND status = 'published'
    `);
    const post = stmt.get(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // 閲覧数を増加
    const updateViews = db.prepare('UPDATE blog_posts SET views = views + 1 WHERE id = ?');
    updateViews.run(post.id);

    res.json({
      success: true,
      post: {
        ...post,
        views: post.views + 1,
        published_date: post.published_at ? new Date(post.published_at).toISOString() : null,
        updated_date: post.updated_at ? new Date(post.updated_at).toISOString() : null
      }
    });
  } catch (error) {
    console.error('Blog post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load blog post'
    });
  }
});

// 人気記事取得（閲覧数順）
app.get('/api/blog/popular', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const stmt = db.prepare(`
      SELECT slug, title, views
      FROM blog_posts 
      WHERE status = 'published'
      ORDER BY views DESC
      LIMIT ?
    `);
    const posts = stmt.all(limit);

    res.json({
      success: true,
      posts: posts
    });
  } catch (error) {
    console.error('Popular posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load popular posts'
    });
  }
});

// カテゴリ一覧取得
app.get('/api/blog/categories', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM blog_posts 
      WHERE status = 'published' AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);
    const categories = stmt.all();

    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load categories'
    });
  }
});

// ブログ設定取得
app.get('/api/blog/settings', (req, res) => {
  try {
    const stmt = db.prepare('SELECT key, value FROM blog_settings');
    const rows = stmt.all();
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load settings'
    });
  }
});

// ルートページ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'サーバーエラーが発生しました'
  });
});

// Expressサーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sutemeado API server running on port ${PORT}`);
  console.log(`📧 API: http://localhost:${PORT}`);
});

// ===== SMTP Server =====
const smtpServer = new SMTPServer({
  port: SMTP_PORT,
  host: '0.0.0.0',
  banner: 'Sutemeado SMTP Server',
  disabledCommands: ['AUTH', 'STARTTLS'],
  
  // 接続ログ
  onConnect(session, callback) {
    console.log(`📥 SMTP Connection from: ${session.remoteAddress}`);
    callback();
  },
  
  // メール受信時の処理
  onData(stream, session, callback) {
    simpleParser(stream)
      .then(parsed => {
        console.log(`📨 Email received: From=${parsed.from?.text}, Subject=${parsed.subject}`);
        console.log(`   To: ${parsed.to?.text || 'N/A'}`);
        
        // 宛先アドレスを抽出
        const recipients = [];
        
        if (parsed.to) {
          if (Array.isArray(parsed.to)) {
            parsed.to.forEach(addr => {
              if (addr.address) recipients.push(addr.address.toLowerCase());
            });
          } else if (parsed.to.address) {
            recipients.push(parsed.to.address.toLowerCase());
          }
        }
        
        // envelope.rcptTo からも取得（BCC対応）
        if (session.envelope && session.envelope.rcptTo) {
          session.envelope.rcptTo.forEach(addr => {
            const email = addr.address.toLowerCase();
            if (!recipients.includes(email)) {
              recipients.push(email);
            }
          });
        }
        
        console.log(`   Recipients: ${recipients.join(', ')}`);
        
        // 各宛先にメールを保存
        recipients.forEach(address => {
          if (address.endsWith('@sutemeado.com')) {
            const mail = mailStore.addMail(address, {
              subject: parsed.subject || '(件名なし)',
              from: parsed.from?.text || parsed.from?.address || 'unknown@example.com',
              body: parsed.text || parsed.html || '(本文なし)',
              html: parsed.html || null
            });
            console.log(`   ✅ Saved to mailbox: ${address} (ID: ${mail.id})`);
          }
        });
        
        callback();
      })
      .catch(err => {
        console.error('❌ Failed to parse email:', err);
        callback(new Error('Failed to parse email'));
      });
  }
});

// SMTPサーバー起動
smtpServer.listen(SMTP_PORT, '0.0.0.0', () => {
  console.log(`📬 SMTP Server running on port ${SMTP_PORT}`);
  console.log(`   Port: ${SMTP_PORT}`);
});

// エラーハンドリング
smtpServer.on('error', (err) => {
  console.error('SMTP Server Error:', err);
});
