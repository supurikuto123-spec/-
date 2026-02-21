<?php
// contact-send.php
// 簡易プロキシ: JSON POST を Discord Webhook に転送
// ★.htaccessやNginxで、このファイルだけPOST許可+実体参照にするのが望ましい

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

// 簡易レート制限やCSRFトークン、Turnstileなどを本来は入れる
$input = file_get_contents('php://input');
if (!$input) {
  http_response_code(400);
  echo json_encode(['error' => 'Empty body']);
  exit;
}

$webhook = '$_ENV["DISCORD_WEBHOOK_URL"] ?? "WEBHOOK_NOT_CONFIGURED"';

$ch = curl_init($webhook);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($http ?: 500);
echo $res ?: json_encode(['ok' => ($http>=200 && $http<300)]);
