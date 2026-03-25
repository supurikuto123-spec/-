#!/bin/bash
# VPSで実行してAPIレスポンスを確認

cd /var/www/sutemeado.com

echo "=== /api/mailbox/:address エンドポイントテスト ==="
echo "アドレス: m0choma6qa@sutemeado.com, パスワード: vFXKuJe46S"

# パスワードパラメータを使ってリクエスト
curl -s "http://localhost:3001/api/mailbox/m0choma6qa@sutemeado.com?password=vFXKuJe46S" | head -200

echo ""
echo ""
echo "=== /api/login エンドポイントテスト ==="
curl -s -X POST "http://localhost:3001/api/login" \
  -H "Content-Type: application/json" \
  -d '{"address":"m0choma6qa@sutemeado.com","password":"vFXKuJe46S"}' | head -200
