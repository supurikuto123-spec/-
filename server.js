const express = require('express');
const cors = require('cors');
const path = require('path');
const MailStore = require('./lib/mailstore');

const app = express();
const PORT = process.env.PORT || 3000;

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

// サーバーステータス
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// シミュレーション: テストメールを送信（開発用）
app.post('/api/simulate-mail', (req, res) => {
  const { address, subject, from, body } = req.body;
  
  if (!address) {
    return res.status(400).json({
      success: false,
      error: 'アドレスが必要です'
    });
  }
  
  const mail = mailStore.addMail(address, {
    subject: subject || 'テストメール',
    from: from || 'test@example.com',
    body: body || 'これはテストメールです。'
  });
  
  res.json({
    success: true,
    message: 'テストメールを送信しました',
    mail: mail
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sutemeado server running on port ${PORT}`);
  console.log(`📧 http://localhost:${PORT}`);
});
