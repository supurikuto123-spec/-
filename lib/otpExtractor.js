/**
 * OTP抽出モジュール - 5段階レイヤードアプローチ
 * 単純なパターンマッチによる誤検出を防止
 */

// ポジティブキーワード（近くにあるとスコアUP）
const POSITIVE_KEYWORDS_JA = [
  // 日本語
  '認証コード', '確認コード', '認証番号', '確認番号',
  'ワンタイム', 'ワンタイムパスワード', '一時パスワード',
  '認証', '確認', '入力', '使用', '有効期限',
  '以下のコード', 'このコード', 'コードを入力',
  '検証コード', 'セキュリティコード'
];

const POSITIVE_KEYWORDS_EN = [
  // 英語
  'code', 'otp', 'verification', 'verify', 'token',
  'passcode', 'password', 'security code', 'auth code',
  'authentication', 'one-time', 'one time',
  'expires', 'expiry', 'valid for',
  'enter', 'use this', 'enter this',
  'your code is', 'confirmation code', 'access code'
];

// ネガティブキーワード（近くにあるとスコアDOWN）
const NEGATIVE_KEYWORDS = [
  // 日本語
  '注文番号', '注文', '請求', '電話', 'TEL', 'FAX',
  '郵便番号', '〒', '追跡番号', '配送番号',
  // 英語
  'order', 'invoice', 'ticket', 'case number', 'ref',
  'phone', 'fax', 'zip', 'postal', 'tracking',
  'price', 'amount', 'total', 'quantity'
];

// 件名からの抽出パターン（高信頼度）
const SUBJECT_PATTERNS = [
  // 日本語
  /確認コード[：:は\s]+([0-9A-Za-z]{4,12})/i,
  /認証コード[：:は\s]+([0-9A-Za-z]{4,12})/i,
  /認証番号[：:は\s]+([0-9A-Za-z]{4,12})/i,
  /コード[：:は\s]+([0-9A-Za-z]{4,12})/i,
  /([0-9A-Za-z]{4,12})\s*が.*コード/,
  /【.*?】.*?([0-9A-Za-z]{4,12})/,
  // 英語
  /your\s+(?:verification\s+)?code[：:\s]+([0-9A-Za-z]{4,12})/i,
  /verification\s+code[：:\s]+([0-9A-Za-z]{4,12})/i,
  /([0-9A-Za-z]{4,12})\s+is\s+your/i,
  /code[：:\s]+([0-9A-Za-z]{4,12})/i,
  /otp[：:\s]+([0-9A-Za-z]{4,12})/i,
];

/**
 * Step 1: テキストの正規化
 * HTMLタグ、ゼロ幅文字、制御文字を除去
 */
function normalizeText(rawText) {
  if (!rawText) return '';
  
  return rawText
    // ゼロ幅文字・制御文字の除去
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    // HTMLタグの除去（HTMLが来た場合）
    .replace(/<[^>]*>/g, ' ')
    // HTMLエンティティのデコード
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    // 連続スペース・改行の正規化
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Step 2: 候補コードの列挙（4〜8桁）
 */
function getCandidates(text) {
  const candidates = [];
  
  // 数字のみのOTP（4〜8桁）- 単語境界を使う
  const numericPattern = /\b(\d{4,8})\b/g;
  let match;
  while ((match = numericPattern.exec(text)) !== null) {
    candidates.push({
      value: match[1],
      index: match.index,
      type: 'numeric'
    });
  }
  
  // 英数字混在OTP（6〜8文字、大文字）
  const alphanumPattern = /\b([A-Z0-9]{6,8})\b/g;
  while ((match = alphanumPattern.exec(text)) !== null) {
    // 純粋な数字は既に追加済みなので除外
    if (!/^\d+$/.test(match[1])) {
      candidates.push({
        value: match[1],
        index: match.index,
        type: 'alphanumeric'
      });
    }
  }
  
  // ハイフン区切り（例: 123-456 → 123456）
  const hyphenPattern = /\b(\d{3})[- ](\d{3})\b/g;
  while ((match = hyphenPattern.exec(text)) !== null) {
    candidates.push({
      value: match[1] + match[2],
      index: match.index,
      type: 'hyphenated'
    });
  }
  
  return candidates;
}

/**
 * Step 3: コンテキストスコアリング
 * 前後のキーワードで点数を付ける
 */
function scoreCandidate(candidate, fullText) {
  let score = 0;
  
  // 候補の前後100文字のコンテキストを取得
  const contextStart = Math.max(0, candidate.index - 100);
  const contextEnd = Math.min(fullText.length, candidate.index + candidate.value.length + 100);
  const context = fullText.slice(contextStart, contextEnd).toLowerCase();
  
  // ポジティブキーワードチェック
  [...POSITIVE_KEYWORDS_JA, ...POSITIVE_KEYWORDS_EN].forEach(keyword => {
    if (context.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });
  
  // ネガティブキーワードチェック
  NEGATIVE_KEYWORDS.forEach(keyword => {
    if (context.includes(keyword.toLowerCase())) {
      score -= 8;
    }
  });
  
  // 桁数ボーナス（6桁が最もOTPらしい）
  const len = candidate.value.length;
  if (len === 6) score += 5;
  else if (len === 4 || len === 8) score += 3;
  
  // コード直前の「:」「は」「is」ボーナス
  const before = fullText.slice(Math.max(0, candidate.index - 20), candidate.index);
  if (/[:：はis]\s*$/.test(before)) score += 8;
  
  // 同じ数字連続（111111）などは減点
  if (/^(\d)\1+$/.test(candidate.value)) {
    score -= 20;
  }
  
  return score;
}

/**
 * Step 4: 除外ルール
 * スコアに関係なく必ず除外すべきパターン
 */
function isRejected(candidate, fullText) {
  const val = candidate.value;
  const idx = candidate.index;
  
  // ルール1: URL内の数字（/path/123456 や ?id=123456）
  const urlPattern = /https?:\/\/[^\s]+/g;
  let urlMatch;
  while ((urlMatch = urlPattern.exec(fullText)) !== null) {
    if (idx >= urlMatch.index && idx < urlMatch.index + urlMatch[0].length) {
      return true; // URL内なので除外
    }
  }
  
  // ルール2: 電話番号フォーマット
  // 前後に電話番号的な記号がある場合
  const surroundingChars = fullText.slice(Math.max(0, idx - 5), idx + val.length + 5);
  if (/[\+\(\)]\d|0\d0|0120/.test(surroundingChars)) {
    return true;
  }
  
  // ルール3: 日付フォーマット（YYYY/MM/DD, YYYY-MM-DD）
  const datePattern = /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/;
  const surroundingText = fullText.slice(Math.max(0, idx - 2), idx + val.length + 2);
  if (datePattern.test(surroundingText)) {
    return true;
  }
  
  // ルール4: 長い連続数字の一部（10桁以上の数字列）
  const longNumPattern = /\d{10,}/g;
  let longMatch;
  while ((longMatch = longNumPattern.exec(fullText)) !== null) {
    if (idx >= longMatch.index && idx < longMatch.index + longMatch[0].length) {
      return true;
    }
  }
  
  // ルール5: 価格・金額フォーマット（¥, $, ,区切り）
  const priceChars = fullText.slice(Math.max(0, idx - 3), idx);
  if (/[¥\$€£,]/.test(priceChars)) {
    return true;
  }
  
  // ルール6: 郵便番号フォーマット（3桁-4桁）
  if (/^\d{3}$/.test(val)) {
    const after = fullText.slice(idx + val.length, idx + val.length + 5);
    if (/^[-]\d{4}/.test(after)) return true;
  }
  
  // ルール7: IPアドレス（数字.数字.数字.数字）
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipPattern.test(surroundingChars)) return true;
  
  // ルール8: 注文番号パターン（Order #123456）
  const beforeText = fullText.slice(Math.max(0, idx - 30), idx);
  if (/order\s*#|invoice\s*#|注文番号[：:]\s*$/i.test(beforeText)) {
    return true;
  }
  
  return false;
}

/**
 * 件名からOTPを抽出（最高信頼度）
 */
function extractOTPFromSubject(subject) {
  if (!subject) return null;
  
  const normalizedSubject = normalizeText(subject);
  
  for (const pattern of SUBJECT_PATTERNS) {
    const match = normalizedSubject.match(pattern);
    if (match && match[1]) {
      const code = match[1].trim().toUpperCase();
      // 4-12文字の英数字で、過度に単純なパターンは除外
      if (/^[0-9A-Z]{4,12}$/.test(code) && !/^(\d)\1+$/.test(code)) {
        return code;
      }
    }
  }
  return null;
}

/**
 * Step 5: メインロジック - メール本文からOTP抽出
 * @param {Object} email - メールオブジェクト
 * @param {string} email.text - テキスト本文（優先）
 * @param {string} email.html - HTML本文（フォールバック）
 * @param {string} email.subject - 件名（高信頼度優先）
 * @returns {string|null} - 抽出されたOTPコード、見つからない場合はnull
 */
function extractOTP(email = {}) {
  // 件名から先に試みる（最高信頼度）
  const subjectOTP = extractOTPFromSubject(email.subject);
  if (subjectOTP) return subjectOTP;
  
  // Step 1: テキストソースの選択と正規化
  const rawText = email.text || stripHtml(email.html || '');
  const bodyText = normalizeText(rawText);
  
  if (!bodyText) return null;
  
  // Step 2: 候補の列挙
  const candidates = getCandidates(bodyText);
  
  if (candidates.length === 0) return null;
  
  // Step 3: スコアリング
  const scored = candidates.map(c => ({
    ...c,
    score: scoreCandidate(c, bodyText)
  }));
  
  // Step 4: 除外ルール適用
  const valid = scored.filter(c => !isRejected(c, bodyText));
  
  if (valid.length === 0) return null;
  
  // Step 5: 最高スコアを返す（同点の場合は長いほうを優先）
  valid.sort((a, b) => b.score - a.score || b.value.length - a.value.length);
  
  // スコアが0以下は信頼性が低いのでnullを返す
  if (valid[0].score <= 0) return null;
  
  return valid[0].value.toUpperCase();
}

/**
 * HTMLからテキストを抽出するヘルパー
 */
function stripHtml(html) {
  if (!html) return '';
  
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 複数のメールから最新のOTPを抽出
 * @param {Array} mails - メールオブジェクトの配列
 * @returns {Object|null} - { otp, mailId, from, subject, receivedAt } or null
 */
function extractLatestOTP(mails) {
  if (!Array.isArray(mails) || mails.length === 0) return null;
  
  // 新しい順に検索
  for (const mail of mails) {
    const otp = extractOTP({
      subject: mail.subject,
      text: mail.body || mail.text,
      html: mail.html
    });
    
    if (otp) {
      return {
        otp,
        mailId: mail.id,
        from: mail.from,
        subject: mail.subject,
        receivedAt: mail.receivedAt
      };
    }
  }
  
  return null;
}

module.exports = {
  extractOTP,
  extractOTPFromSubject,
  extractLatestOTP,
  normalizeText,
  getCandidates,
  scoreCandidate,
  isRejected
};
