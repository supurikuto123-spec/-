# Nginx + Node.js 連携設定

現在、Nginxは設定されていますが、Node.jsサーバーへのプロキシが正しく動作していないようです。

## 確認事項

### 1. Node.jsサーバーが動作しているか確認
```bash
ssh root@163.44.101.51
pm2 status
```

### 2. ポート3000でリッスンしているか確認
```bash
netstat -tlnp | grep 3000
```

### 3. Nginx設定ファイルの確認
```bash
cat /etc/nginx/sites-enabled/sutemeado.com
```

### 4. 修正が必要な場合は以下を実行
```bash
# Nginx設定を更新
cat > /etc/nginx/sites-available/sutemeado.com << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name sutemeado.com www.sutemeado.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/sutemeado.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### 5. PM2でNode.jsサーバーを起動
```bash
cd /var/www/sutemeado.com
npm install
pm2 restart sutemeado || pm2 start server.js --name sutemeado
pm2 save
pm2 logs sutemeado
```

## 確認コマンド
```bash
# ローカルからAPIテスト
curl https://sutemeado.com/api/new-address

# サイトアクセス確認
curl -I https://sutemeado.com
```
