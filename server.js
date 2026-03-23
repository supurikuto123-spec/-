const express = require('express');
const cors = require('cors');
const path = require('path');
const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const MailStore = require('./lib/mailstore');

const app = express();
const PORT = process.env.PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 2525;

// メールストアの初期化
const mailStore = new MailStore();

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

// 返信を送信
app.post('/api/mailbox/:address/:mailId/reply', async (req, res) => {
  const { address, mailId } = req.params;
  const { body } = req.body;

  if (!body || body.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '返信内容が空です'
    });
  }

  // 元のメールを取得
  const originalMail = mailStore.getMail(address, mailId);
  if (!originalMail) {
    return res.status(404).json({
      success: false,
      error: '元のメールが見つかりません'
    });
  }

  // 返信を保存（返信履歴として保存）
  const reply = mailStore.addReply(address, mailId, {
    body: body.trim(),
    from: address,
    to: originalMail.from,
    originalSubject: originalMail.subject
  });

  console.log(`↩️ Reply saved: ${address} -> ${originalMail.from}`);

  res.json({
    success: true,
    message: '返信を保存しました',
    reply: {
      id: reply.id,
      sentAt: reply.sentAt
    }
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
