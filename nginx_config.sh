#!/bin/bash
# Nginx設定スクリプト（VPSでrootとして実行）

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

echo "✅ Nginx設定完了"
