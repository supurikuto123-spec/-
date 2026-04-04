# SMTPサーバー構築・運用ガイド

## 🚀 VPSデプロイ手順

### 1. コード更新
```bash
cd /var/www/sutemeado.com
git pull origin main
npm install
pm2 restart sutemeado
```

### 2. SMTPポートのファイアウォール設定
ポート25は標準SMTPポートですが、多くのクラウドプロバイダーでブロックされています。

```bash
# 現在の設定確認
ufw status

# SMTPポートを開放（外部からのメール受信用）
# 方法A: 標準ポート25（推奨、ただしプロバイダー制限あり）
sudo ufw allow 25/tcp

# 方法B: 代替ポート2525（ブロックされていない場合）
sudo ufw allow 2525/tcp

# 確認
ufw status
```

**注意**: AWS/GCP/Azure等ではポート25がデフォルトでブロックされています。ポート25を使用する場合、プロバイダーに解除リクエストが必要です。

### 3. DNS MXレコード設定

**DNS管理画面（dnsv.jp等）で以下を設定：**

```
Type: MX
Host: @（または空）
Value: 10 sutemeado.com
TTL: 3600
```

複数サーバーの場合：
```
10 sutemeado.com
20 backup-smtp.example.com
```

### 4. SMTPポートの確認・変更

デフォルトは2525（非特権ポート）です。

**環境変数でポートを変更：**
```bash
# ポート25を使用する場合（root権限が必要）
export SMTP_PORT=25
pm2 restart sutemeado

# または ecosystem.config.js で設定
```

`/var/www/sutemeado.com/ecosystem.config.js` を作成：
```javascript
module.exports = {
  apps: [{
    name: 'sutemeado',
    script: './server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      SMTP_PORT: 2525  // または 25
    },
    instances: 1,
    autorestart: true,
    watch: false
  }]
};
```

その後：
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 📧 動作確認

### 1. SMTPサーバー状態確認
```bash
# ポート確認
netstat -tlnp | grep :2525
# または
lsof -i :2525

# PM2ログ確認
pm2 logs sutemeado --lines 50
```

### 2. メール送信テスト
```bash
# コマンドラインからテスト（ポート2525の場合）
swaks --to test@sutemeado.com \
      --from sender@example.com \
      --server sutemeado.com:2525 \
      --subject "テストメール" \
      --body "これはテストです"

# または telnet で簡易テスト
telnet sutemeado.com 2525
HELO test
MAIL FROM: <sender@example.com>
RCPT TO: <test@sutemeado.com>
DATA
Subject: Test

This is a test.
.
QUIT
```

### 3. フロントエンド確認
1. https://sutemeado.com を開く
2. メールアドレスをコピー
3. Gmail/Yahoo等からメール送信
4. フロントエンドで自動的にメールが表示されることを確認

---

## 🔒 セキュリティ対策

### スパム対策（今後の実装検討）
現在のMVP版では最低限の実装です。本番運用で必要な場合：

1. **レート制限**: 同一IPからの連続接続を制限
2. **ブラックリスト**: 既知のスパム送信者をブロック
3. **Greylisting**: 初回接続を一時的に拒否（正当なサーバーは再試行する）
4. **SPF/DKIM/DMARC**: 認証メールの処理

### 現在実装済みの対策
- `@sutemeado.com` ドメインのみ受信
- envelope.rcptTo を確認（BCC対策）
- 1アドレス100件までの保存制限
- 24時間後の自動削除

---

## 🐛 トラブルシューティング

### メールが届かない場合

**確認項目:**
1. **MXレコード**: `dig MX sutemeado.com` で確認
2. **ポート**: `telnet sutemeado.com 25` または `2525` で接続確認
3. **ファイアウォール**: `ufw status` でポート開放確認
4. **PM2ログ**: `pm2 logs sutemeado` でエラーチェック

**よくある問題:**
- クラウドプロバイダーがポート25をブロック → ポート2525を使用または解除リクエスト
- DNSキャッシュ → TTL（86400秒=24時間）待つか、強制更新
- SELinux/AppArmor → ポリシー確認

---

## 📊 監視・メンテナンス

### ログ確認
```bash
# リアルタイムログ
pm2 logs sutemeado

# SMTP接続ログをgrep
grep "SMTP Connection" ~/.pm2/logs/sutemeado-out.log

# メール受信ログをgrep  
grep "Email received" ~/.pm2/logs/sutemeado-out.log
```

### メトリクス確認
```bash
# APIで統計取得
curl https://sutemeado.com/api/status
```

---

## 🔄 ポート25を使用する場合の追加手順

ポート25は特権ポート（<1024）なのでroot権限が必要：

### 方法1: PM2をrootで実行（非推奨）
```bash
sudo pm2 start server.js --name sutemeado-smtp
```

### 方法2: ポートフォワーディング（推奨）
```bash
# iptablesで2525→25にリダイレクト
sudo iptables -t nat -A PREROUTING -p tcp --dport 25 -j REDIRECT --to-port 2525

# 永続化
sudo apt-get install iptables-persistent
sudo netfilter-persistent save
```

### 方法3: authbindで権限付与
```bash
sudo apt-get install authbind
sudo touch /etc/authbind/byport/25
sudo chown root:root /etc/authbind/byport/25
sudo chmod 755 /etc/authbind/byport/25
# PM2設定で authbind --deep node を使用
```

---

## 📝 設定まとめ

| 項目 | 値 | 備考 |
|------|------|------|
| SMTPポート | 2525（デフォルト） | 環境変数 `SMTP_PORT` で変更可能 |
| 受信ドメイン | sutemeado.com | ハードコード、必要に応じて複数対応 |
| 保存期限 | 24時間 | アクセスで自動延長 |
| 最大保存数 | 100件/アドレス | 古いものから自動削除 |
| 認証 | なし | SMTP AUTH無効（一時メール用） |

---

**次のステップ:**
1. 上記手順でVPSにデプロイ
2. DNSでMXレコード設定
3. ファイアウォールでポート開放
4. 実際のメール送信テスト
