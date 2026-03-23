#!/bin/bash
# VPS上で実行するワンライナー修正スクリプト
# root@163.44.101.51 で実行してください

echo "🔧 修正を開始..."

# Node.jsアプリがあるディレクトリに移動
cd /var/www/sutemeado.com || exit 1

# 依存関係を確認・インストール
npm install

# PM2でサービスを確実に起動
pm2 delete sutemeado 2>/dev/null || true
pm2 start server.js --name sutemeado
pm2 save

# Nginx設定を更新（ポート3000へのプロキシ）
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

# SSL証明書がある場合はHTTPS設定も確認
if [ -f /etc/letsencrypt/live/sutemeado.com/fullchain.pem ]; then
    cat > /etc/nginx/sites-available/sutemeado.com << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name sutemeado.com www.sutemeado.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sutemeado.com www.sutemeado.com;

    ssl_certificate /etc/letsencrypt/live/sutemeado.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sutemeado.com/privkey.pem;

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
fi

# Nginx設定を有効化
ln -sf /etc/nginx/sites-available/sutemeado.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginxをテスト・再起動
nginx -t && systemctl restart nginx

# ステータス確認
echo ""
echo "✅ セットアップ完了！"
echo "Node.jsステータス:"
pm2 status

echo ""
echo "🌐 サイトURL:"
echo "  https://sutemeado.com"
echo "  https://sutemeado.com/api/new-address"
