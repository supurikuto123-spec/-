<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'Method Not Allowed']); exit; }

$ct = $_SERVER['CONTENT_TYPE'] ?? '';
$raw = file_get_contents('php://input');
$data = (stripos($ct,'application/json')!==false) ? (json_decode($raw, true) ?: []) : $_POST;

$need_reply = !empty($data['need_reply']) && in_array(strtolower((string)$data['need_reply']), ['1','true','yes','on'], true);
$email = trim($data['email'] ?? '');
$title = trim($data['title'] ?? '');
$body  = trim($data['body']  ?? '');
$hp    = trim($data['website'] ?? $data['hp'] ?? '');

if ($hp !== '') { echo json_encode(['ok'=>true]); exit; }
if ($body === '' || mb_strlen($body) < 5) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'body required']); exit; }
if ($need_reply && $email === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'email required when need_reply=true']); exit; }

$DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/XXXXXXXX/XXXXXXXX'; // ←新しいWebhookに差し替え

$id = substr(bin2hex(random_bytes(8)),0,8);
$lines = [
  '**お問い合わせ受信**',
  'ID: '.$id,
  '返信要否: '.($need_reply ? '必要' : '不要'),
  $email ? '返信先: <'.$email.'>' : null,
  $title ? '件名: '.$title : null,
  '本文:',
  '```',
  mb_substr($body, 0, 1500),
  '```',
  'From: '.$_SERVER['REMOTE_ADDR'],
];
$lines = array_values(array_filter($lines, fn($x)=>$x!==null));
$payload = json_encode(['content' => implode("\n", $lines)], JSON_UNESCAPED_UNICODE);

$ch = curl_init($DISCORD_WEBHOOK);
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 10,
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($resp === false || $code >= 400) { http_response_code(502); echo json_encode(['ok'=>false, 'error'=>'discord relay failed', 'status'=>$code]); exit; }
echo json_encode(['ok'=>true, 'id'=>$id]);
