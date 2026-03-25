const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const MailStore = require('./lib/mailstore');

const app = express();
const PORT = process.env.PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 2525;

// DBパス設定（VPS永続化対策：絶対パスを使用）
// 環境変数 DB_PATH を最優先で使用（ecosystem.config.js で設定される）
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');

// DBディレクトリが存在しない場合は作成
try {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📁 Created DB directory: ${dbDir}`);
  }
} catch (err) {
  console.error('⚠️ Failed to create DB directory:', err.message);
}

console.log(`💾 Database path: ${DB_PATH}`);

// メールストアの初期化（明示的なDBパスを渡す）
const mailStore = new MailStore(DB_PATH);

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===== API Routes =====

// 新しいメールアドレスを生成（パスワード付き）
app.get('/api/new-address', async (req, res) => {
  try {
    const result = await mailStore.generateAddress();
    res.json({
      success: true,
      address: result.address,
      password: result.password,
      domain: 'sutemeado.com'
    });
  } catch (err) {
    console.error('Generate address error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to generate address',
      detail: err.message,
      code: err.code || 'UNKNOWN'
    });
  }
});

// ログイン（メールボックスへのアクセス）
app.post('/api/login', async (req, res) => {
  try {
    const { address, password } = req.body;
    
    if (!address || !password) {
      return res.status(400).json({
        success: false,
        error: 'メールアドレスとパスワードを入力してください'
      });
    }
    
    const normalized = address.toLowerCase().trim();
    
    // アドレスが存在するかチェック
    if (!(await mailStore.addressExists(normalized))) {
      return res.status(404).json({
        success: false,
        error: 'メールアドレスが見つかりません'
      });
    }
    
    // パスワード検証
    if (!(await mailStore.verifyPassword(normalized, password))) {
      return res.status(401).json({
        success: false,
        error: 'パスワードが正しくありません'
      });
    }
    
    // ログイン成功
    const mails = await mailStore.getMails(normalized, password);
    
    res.json({
      success: true,
      message: 'ログインしました',
      address: normalized,
      count: mails.length,
      mails: mails
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 特定のアドレスのメールを取得（パスワード必須）
app.post('/api/mailbox/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'パスワードが必要です'
      });
    }
    
    const mails = await mailStore.getMails(address, password);
    
    if (mails === null) {
      return res.status(401).json({
        success: false,
        error: '認証に失敗しました'
      });
    }
    
    res.json({
      success: true,
      address: address,
      count: mails.length,
      mails: mails
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 特定のメールの詳細を取得（パスワード必須）
app.post('/api/mailbox/:address/:mailId', async (req, res) => {
  try {
    const { address, mailId } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'パスワードが必要です'
      });
    }
    
    const mail = await mailStore.getMail(address, password, mailId);
    
    if (mail === null) {
      return res.status(401).json({
        success: false,
        error: '認証に失敗しました'
      });
    }
    
    if (mail === false || !mail) {
      return res.status(404).json({
        success: false,
        error: 'メールが見つかりません'
      });
    }
    
    res.json({
      success: true,
      mail: mail
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// メールを削除（パスワード必須）
app.delete('/api/mailbox/:address/:mailId', async (req, res) => {
  try {
    const { address, mailId } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'パスワードが必要です'
      });
    }
    
    const result = await mailStore.deleteMail(address, password, mailId);
    
    if (result === null) {
      return res.status(401).json({
        success: false,
        error: '認証に失敗しました'
      });
    }
    
    res.json({
      success: result,
      message: result ? 'メールを削除しました' : 'メールが見つかりません'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 全メールを削除（パスワード必須）
app.delete('/api/mailbox/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'パスワードが必要です'
      });
    }
    
    const result = await mailStore.clearMails(address, password);
    
    if (result === null) {
      return res.status(401).json({
        success: false,
        error: '認証に失敗しました'
      });
    }
    
    res.json({
      success: true,
      message: '全てのメールを削除しました'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// アドレスを完全に削除（パスワード必須）
app.delete('/api/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'パスワードが必要です'
      });
    }
    
    const result = await mailStore.deleteAddress(address, password);
    
    if (result === null) {
      return res.status(401).json({
        success: false,
        error: '認証に失敗しました'
      });
    }
    
    res.json({
      success: true,
      message: 'アドレスを削除しました'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// パスワード変更（パスワード必須）
app.put('/api/address/:address/password', async (req, res) => {
  try {
    const { address } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '現在のパスワードと新しいパスワードが必要です'
      });
    }
    
    const result = await mailStore.changePassword(address, currentPassword, newPassword);
    
    if (result === null) {
      return res.status(401).json({
        success: false,
        error: '認証に失敗しました（現在のパスワードが正しくありません）'
      });
    }
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'パスワードの変更に失敗しました'
      });
    }
    
    res.json({
      success: true,
      message: 'パスワードを変更しました'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// サーバーステータス
app.get('/api/status', async (req, res) => {
  try {
    const stats = await mailStore.getStats();
    res.json({
      success: true,
      status: 'running',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      stats: stats,
      smtpPort: SMTP_PORT
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
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

async function startServer() {
  await mailStore.init();
  console.log('📦 Database initialized');

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
        .then(async parsed => {
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
          for (const address of recipients) {
            if (address.endsWith('@sutemeado.com')) {
              try {
                const mail = await mailStore.addMail(address, {
                  subject: parsed.subject || '(件名なし)',
                  from: parsed.from?.text || parsed.from?.address || 'unknown@example.com',
                  body: parsed.text || parsed.html || '(本文なし)',
                  html: parsed.html || null
                });
                if (mail) {
                  console.log(`   ✅ Saved to mailbox: ${address} (ID: ${mail.id})`);
                } else {
                  console.log(`   ⚠️ Mailbox not found for: ${address}`);
                }
              } catch (err) {
                console.error(`   ❌ Error saving mail for ${address}:`, err);
              }
            }
          }
          
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
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
