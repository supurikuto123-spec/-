# VPSデプロイ手順（ConoHa VPS）

## 手順1: VPSにSSH接続

```bash
ssh root@163.44.101.51
# パスワード: AAaa3982@@
```

## 手順2: アプリケーションディレクトリに移動

```bash
cd /var/www/sutemeado.com
```

## 手順3: 最新コードを取得

```bash
git fetch origin
git reset --hard origin/main
```

## 手順4: 依存関係をインストール

```bash
npm install
```

## 手順5: PM2でサービスを起動

```bash
pm2 restart sutemeado || pm2 start server.js --name sutemeado
pm2 save
```

## 手順6: Nginxを確認

```bash
nginx -t && systemctl reload nginx
```

## 完了！

- 🌐 https://sutemeado.com でアクセス可能
- 更新時は `/var/www/sutemeado.com/update.sh` を実行
