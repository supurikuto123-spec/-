/**
 * Sutemeado - Temporary Email Service
 * Completely rewritten for proper UX and UI consistency
 */

// ===== i18n Translations =====
const i18n = {
  ja: {
    title: 'Sutemeado - シンプルな一時メール',
    description: '登録不要、パスワードでいつでもアクセスできる一時メールサービス',
    statusOnline: 'システム正常',
    login: 'ログイン',
    createNew: '新規作成',
    emailAddress: 'メールアドレス',
    password: 'パスワード',
    loginBtn: 'ログイン',
    createAddress: 'アドレスを作成',
    yourAddress: 'あなたのアドレス',
    yourPassword: 'パスワード',
    copy: 'コピー',
    copied: 'コピーしました',
    copyFailed: 'コピーに失敗しました',
    refresh: '更新',
    inbox: '受信箱',
    autoRefresh: '自動更新',
    noMail: 'メールはまだ届いていません',
    noMailSub: 'アドレスをコピーして登録・確認に使ってください',
    delete: '削除',
    close: '閉じる',
    cancel: 'キャンセル',
    back: '戻る',
    confirm: '確認',
    savePassword: 'パスワードを保存してください',
    savePasswordSub: 'このパスワードは再表示できません',
    addressCreated: 'アドレスを作成しました',
    addressCreateFailed: 'アドレス作成に失敗しました',
    loginFailed: 'ログインに失敗しました',
    invalidCredentials: 'メールアドレスまたはパスワードが正しくありません',
    mailDeleted: 'メールを削除しました',
    deleteFailed: '削除に失敗しました',
    deleteAllMailConfirm: 'すべてのメールを削除しますか？この操作は元に戻せません。',
    deleteAddressConfirm: 'このアドレスを削除しますか？すべてのメールが削除され、アドレスは使用できなくなります。',
    deleteAllMail: '全メール削除',
    deleteAddress: 'アドレスを削除',
    logout: 'ログアウト',
    settings: '設定',
    apiDocs: 'API',
    from: 'From:',
    to: 'To:',
    date: '日時:',
    subject: '件名',
    unread: '未読',
    error: 'エラー',
    success: '成功',
    warning: '警告',
    info: '情報',
    processing: '処理中...',
    loggingIn: 'ログイン中...',
    creating: 'アドレスを生成中...',
    langJA: '日本語',
    langEN: 'English',
    termsOfService: '利用規約',
    privacyPolicy: 'プライバシー・クッキー',
    changePassword: 'パスワード変更',
    currentPassword: '現在のパスワード',
    newPassword: '新しいパスワード',
    confirmPassword: 'パスワード確認',
    save: '保存',
    passwordHint: '英数8文字以上（特殊文字可）',
    passwordTooShort: 'パスワードは8文字以上必要です',
    passwordNeedLetter: '英字を含める必要があります',
    passwordNeedNumber: '数字を含める必要があります',
    passwordsNotMatch: '新しいパスワードと確認が一致しません',
    currentPasswordWrong: '現在のパスワードが違います',
    passwordChanged: 'パスワードを変更しました',
    passwordChangeFailed: 'パスワード変更に失敗しました',
    fillAllFields: 'すべての項目を入力してください',
    strengthWeak: '弱い',
    strengthMedium: '普通',
    strengthStrong: '強い',
    newAddress: '新しいメールアドレスを作成',
    createNewAddressConfirm: 'ログイン情報を保存していない場合、現在のアドレスにはアクセスできなくなります。今後利用しない場合はアドレスを削除してください。\n\n新しいメールアドレスを作成しますか？',
    passwordWarningTitle: 'パスワードを保存してください',
    passwordWarningMessage: '再度アクセスするために、必ずパスワードを保存してください。',
    understood: '了解しました'
  },
  en: {
    title: 'Sutemeado - Simple Temporary Email',
    description: 'No registration. Access anytime with your password.',
    statusOnline: 'System Online',
    login: 'Login',
    createNew: 'Create New',
    emailAddress: 'Email Address',
    password: 'Password',
    loginBtn: 'Login',
    createAddress: 'Create Address',
    yourAddress: 'Your Address',
    yourPassword: 'Password',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    refresh: 'Refresh',
    inbox: 'Inbox',
    autoRefresh: 'Auto Refresh',
    noMail: 'No emails yet',
    noMailSub: 'Copy the address to use for registration',
    delete: 'Delete',
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back',
    confirm: 'Confirm',
    savePassword: 'Please save your password',
    savePasswordSub: 'This password cannot be displayed again',
    addressCreated: 'Address created successfully',
    addressCreateFailed: 'Failed to create address',
    loginFailed: 'Login failed',
    invalidCredentials: 'Invalid email address or password',
    mailDeleted: 'Email deleted',
    deleteFailed: 'Failed to delete',
    deleteAllMailConfirm: 'Delete all emails? This cannot be undone.',
    deleteAddressConfirm: 'Delete this address? All emails will be removed and the address will no longer be available.',
    deleteAllMail: 'Delete All Mail',
    deleteAddress: 'Delete Address',
    logout: 'Logout',
    settings: 'Settings',
    apiDocs: 'API',
    from: 'From:',
    to: 'To:',
    date: 'Date:',
    subject: 'Subject',
    unread: 'Unread',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    processing: 'Processing...',
    loggingIn: 'Logging in...',
    creating: 'Generating address...',
    langJA: '日本語',
    langEN: 'English',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy & Cookies',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    save: 'Save',
    passwordHint: '8+ alphanumeric (special chars optional)',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordNeedLetter: 'Password must contain a letter',
    passwordNeedNumber: 'Password must contain a number',
    passwordsNotMatch: 'New password and confirmation do not match',
    currentPasswordWrong: 'Current password is incorrect',
    passwordChanged: 'Password changed successfully',
    passwordChangeFailed: 'Failed to change password',
    fillAllFields: 'Please fill in all fields',
    strengthWeak: 'Weak',
    strengthMedium: 'Medium',
    strengthStrong: 'Strong',
    newAddress: 'Create New Address',
    createNewAddressConfirm: 'If you have not saved your login info, you will lose access to the current address. Delete the address first if you no longer need it.\n\nCreate a new email address?',
    passwordWarningTitle: 'Please Save Your Password',
    passwordWarningMessage: 'To access this address later, please save your password.',
    understood: 'I Understand'
  }
};

// ===== Configuration =====
const CONFIG = {
  API_BASE: '',
  REFRESH_INTERVAL: 5000,
  STORAGE_KEY: 'sutemeado_session',
  LANG_KEY: 'sutemeado_lang',
  READ_KEY: 'sutemeado_read',
  THEME_KEY: 'sutemeado_theme'
};

// ===== State =====
const state = {
  currentAddress: null,
  currentPassword: null,
  mails: [],
  autoRefresh: true,
  refreshTimer: null,
  selectedMail: null,
  currentLang: 'ja',
  passwordVisible: false,
  theme: 'neon'
};

// ===== DOM Elements Cache =====
let elements = {};

// ===== i18n Functions =====
function t(key) {
  return i18n[state.currentLang][key] || key;
}

function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem(CONFIG.LANG_KEY, lang);
  document.documentElement.lang = lang;
  
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key]) {
      if (el.tagName === 'TITLE') {
        document.title = i18n[lang][key];
      } else {
        el.textContent = i18n[lang][key];
      }
    }
  });
  
  // Update language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && i18n[lang].description) {
    metaDesc.content = i18n[lang].description;
  }
}

// ===== API Functions =====
const api = {
  async newAddress() {
    const res = await fetch('/api/new-address');
    return res.json();
  },

  async login(address, password) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password })
    });
    return res.json();
  },

  async getMailbox(address, password) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  async getMail(address, password, mailId) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}/${mailId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  async deleteMail(address, password, mailId) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}/${mailId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  async clearMails(address, password) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  async deleteAddress(address, password) {
    const res = await fetch(`/api/address/${encodeURIComponent(address)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  async changePassword(address, currentPassword, newPassword) {
    const res = await fetch(`/api/address/${encodeURIComponent(address)}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return res.json();
  }
};

// ===== Toast Notification =====
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const toastIcon = toast.querySelector('.toast-icon');
  
  // Set message
  toastMessage.textContent = message;
  
  // Set icon based on type
  const icons = {
    success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  
  toastIcon.innerHTML = icons[type] || icons.info;
  
  // Remove all type classes and add current
  toast.className = 'toast show ' + type;
  
  // Auto hide
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ===== Custom Confirm Modal =====
let confirmCallback = null;
let confirmCancelCallback = null;

function showConfirm(title, message, onConfirm, type = 'warning', onCancel = null) {
  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-title');
  const messageEl = document.getElementById('confirm-message');
  const okBtn = document.getElementById('confirm-ok');
  
  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Update button type based on action type
  if (type === 'danger') {
    okBtn.className = 'btn btn-danger';
  } else {
    okBtn.className = 'btn btn-primary';
  }
  
  // Update button text
  okBtn.textContent = t('confirm') || '確認';
  document.getElementById('confirm-cancel').textContent = t('cancel');
  
  // Set callbacks
  confirmCallback = onConfirm;
  confirmCancelCallback = onCancel;
  
  // Show modal
  modal.classList.add('active');
}

function closeConfirm() {
  const modal = document.getElementById('confirm-modal');
  modal.classList.remove('active');
  confirmCallback = null;
  confirmCancelCallback = null;
}

function handleConfirmOk() {
  const cb = confirmCallback;
  closeConfirm();
  if (cb) cb();
}

function handleConfirmCancel() {
  const cb = confirmCancelCallback;
  closeConfirm();
  if (cb) cb();
}

// ===== Utility Functions =====
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t('copied'), 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast(t('copied'), 'success');
  } catch (err) {
    showToast(t('copyFailed'), 'error');
  }
  
  document.body.removeChild(textarea);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) {
    return state.currentLang === 'ja' ? 'たった今' : 'Just now';
  }
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return state.currentLang === 'ja' ? `${mins}分前` : `${mins}m ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return state.currentLang === 'ja' ? `${hours}時間前` : `${hours}h ago`;
  }
  
  return date.toLocaleString(state.currentLang === 'ja' ? 'ja-JP' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

// ===== Session Management =====
function saveSession(address, password) {
  const data = JSON.stringify({ address, password });
  localStorage.setItem(CONFIG.STORAGE_KEY, data);
  // Set cookie valid for 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `sutemeado_session=${encodeURIComponent(data)}; expires=${expires}; path=/; SameSite=Lax`;
}

function loadSession() {
  try {
    // Try cookie first
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('sutemeado_session=')) {
        const value = decodeURIComponent(cookie.substring('sutemeado_session='.length));
        return JSON.parse(value);
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(CONFIG.STORAGE_KEY);
  document.cookie = 'sutemeado_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// ===== Read State Persistence =====
function getReadKey(address) {
  return CONFIG.READ_KEY + '_' + (address || '');
}
function saveReadState(address, mails) {
  if (!address) return;
  const readIds = mails.filter(m => m.read).map(m => m.id);
  localStorage.setItem(getReadKey(address), JSON.stringify(readIds));
}
function loadReadIds(address) {
  if (!address) return new Set();
  try {
    const raw = localStorage.getItem(getReadKey(address));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function clearReadState(address) {
  localStorage.removeItem(getReadKey(address));
}

// ===== Theme =====
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(CONFIG.THEME_KEY, theme);
  // theme toggle button label
  const lbl = document.getElementById('theme-toggle-label');
  if (lbl) lbl.textContent = theme === 'light' ? (state.currentLang === 'ja' ? 'ネオンモード' : 'Neon Mode') : (state.currentLang === 'ja' ? 'ライトモード' : 'Light Mode');
}
function toggleTheme() {
  applyTheme(state.theme === 'neon' ? 'light' : 'neon');
}

// ===== UI Update Functions =====
function showLoggedOutView() {
  const mailboxView = document.getElementById('mailbox-view');
  if (mailboxView) mailboxView.style.display = 'none';
  updateDrawerLoginState();
}

function showMailboxView() {
  const mailboxView = document.getElementById('mailbox-view');
  if (mailboxView) mailboxView.style.display = 'block';
  updateDrawerLoginState();
  updateNavBadge();
}

function updateAddressDisplay(address, password) {
  document.getElementById('display-address').textContent = address;
  // パスワードの長さに合わせて•を表示
  const maskedPassword = password ? '•'.repeat(password.length) : '••••••••';
  document.getElementById('display-password').textContent = maskedPassword;
  state.currentAddress = address;
  state.currentPassword = password;
  state.passwordVisible = false;
  // Update eye icon to "hidden" state
  const eyeIcon = document.getElementById('eye-icon');
  if (eyeIcon) {
    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  }
  saveSession(address, password);
}

function togglePasswordVisibility() {
  const passwordEl = document.getElementById('display-password');
  const eyeIcon = document.getElementById('eye-icon');
  
  if (!state.currentPassword) return;
  
  state.passwordVisible = !state.passwordVisible;
  
  if (state.passwordVisible) {
    passwordEl.textContent = state.currentPassword;
    if (eyeIcon) {
      eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  } else {
    // パスワードの長さに合わせて•を表示
    passwordEl.textContent = '•'.repeat(state.currentPassword.length);
    if (eyeIcon) {
      eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    }
  }
}

function updateNavBadge() {
  // Badge element removed with nav-inbox, function kept for compatibility
  const unreadCount = state.mails.filter(m => !m.read).length;
  return unreadCount;
}

function renderMailList(mails) {
  const mailList = document.getElementById('mail-list');
  const mailCount = document.getElementById('mail-count');
  
  // 未読数を表示
  const unreadCount = (mails || []).filter(m => !m.read).length;
  mailCount.textContent = unreadCount > 0 ? unreadCount : (mails ? mails.length : 0);
  mailCount.title = unreadCount > 0 ? `${unreadCount}件未読` : `${mails ? mails.length : 0}件`;
  mailCount.classList.toggle('has-unread', unreadCount > 0);
  
  if (!mails || mails.length === 0) {
    mailList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
        <p data-i18n="noMail">${t('noMail')}</p>
        <span data-i18n="noMailSub">${t('noMailSub')}</span>
      </div>
    `;
    return;
  }
  
  // Sort by date, newest first
  const sortedMails = [...mails].sort((a, b) => b.receivedAt - a.receivedAt);
  const newHTML = sortedMails.map(mail => `
    <div class="mail-item ${!mail.read ? 'unread' : ''}" data-id="${mail.id}">
      <div class="mail-header">
        <span class="mail-subject">${escapeHtml(mail.subject || '(no subject)')}</span>
        <span class="mail-time">${formatDate(mail.receivedAt)}</span>
      </div>
      <div class="mail-from">${escapeHtml(mail.from)}</div>
      <div class="mail-preview">${escapeHtml(mail.body.substring(0, 100))}${mail.body.length > 100 ? '...' : ''}</div>
    </div>
  `).join('');

  // 差分更新：内容が変わった時だけ DOM を更新してちらつき防止
  if (mailList.innerHTML !== newHTML) {
    mailList.innerHTML = newHTML;
    mailList.querySelectorAll('.mail-item').forEach(item => {
      item.addEventListener('click', () => openMailModal(item.dataset.id));
    });
  }
  
  // 既読状態を永続化
  saveReadState(state.currentAddress, mails);
  updateNavBadge();
}

function createSandboxFrame(htmlContent) {
  const frame = document.createElement('iframe');
  frame.className = 'mail-frame';
  frame.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  frame.style.width = '100%';
  frame.style.minHeight = '200px';
  frame.style.border = '1px solid var(--border-color)';
  frame.style.borderRadius = 'var(--radius-md)';
  frame.style.background = '#fff';

  const sanitizedHtml = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, 'void(0);')
    .replace(/on\w+\s*=/gi, 'data-blocked-event=');

  const docContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background: #fff;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }
        /* Keep email's original layout as much as possible */
        img {
          max-width: 100%;
          height: auto;
        }
        body, table, td, th, div, p, span, a {
          -webkit-text-size-adjust: 100%;
        }
      </style>
    </head>
    <body>${sanitizedHtml}</body>
    </html>
  `;

  frame.srcdoc = docContent;

  frame.addEventListener('load', () => {
    try {
      const doc = frame.contentDocument || frame.contentWindow.document;
      if (!doc || !doc.body) return;

      // Make all links inside HTML email open outside the iframe
      doc.querySelectorAll('a[href]').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });

      doc.addEventListener('click', (event) => {
        const anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
        if (!anchor) return;

        const rawHref = (anchor.getAttribute('href') || '').trim();
        if (!rawHref || rawHref.startsWith('#') || rawHref.toLowerCase().startsWith('javascript:')) return;

        let openUrl = rawHref;
        if (rawHref.startsWith('//')) {
          openUrl = 'https:' + rawHref;
        }

        // Absolute URLs are opened in a new tab so user can navigate properly
        if (/^https?:\/\//i.test(openUrl)) {
          event.preventDefault();
          window.open(openUrl, '_blank', 'noopener,noreferrer');
        }
      }, true);

      const viewportWidth = frame.clientWidth || frame.parentElement?.clientWidth || 360;
      const contentWidth = Math.max(
        doc.documentElement?.scrollWidth || 0,
        doc.body.scrollWidth || 0,
        1
      );

      const scale = contentWidth > viewportWidth ? viewportWidth / contentWidth : 1;

      doc.body.style.transformOrigin = 'top left';
      doc.body.style.transform = `scale(${scale})`;
      doc.body.style.width = `${contentWidth}px`;
      doc.body.style.margin = '0';

      const contentHeight = Math.max(
        doc.body.scrollHeight,
        doc.documentElement?.scrollHeight || 0,
        doc.body.offsetHeight,
        doc.documentElement?.offsetHeight || 0
      );

      const scaledHeight = Math.ceil(contentHeight * scale) + 8;
      const maxH = Math.floor(window.innerHeight * 0.62);
      frame.style.height = Math.min(Math.max(scaledHeight, 180), Math.max(maxH, 320)) + 'px';
    } catch (e) {
      frame.style.height = '350px';
    }
  });

  return frame;
}

function openMailModal(mailId) {
  const mail = state.mails.find(m => m.id === mailId);
  if (!mail) return;
  
  state.selectedMail = mail;
  
  document.getElementById('modal-subject').textContent = mail.subject || '(no subject)';
  document.getElementById('modal-from').textContent = mail.from;
  document.getElementById('modal-to').textContent = state.currentAddress;
  document.getElementById('modal-date').textContent = new Date(mail.receivedAt).toLocaleString(state.currentLang === 'ja' ? 'ja-JP' : 'en-US');
  
  const bodyContainer = document.getElementById('modal-body-content');
  bodyContainer.innerHTML = '';
  
  if (mail.html && mail.html.trim().length > 0) {
    const frame = createSandboxFrame(mail.html);
    bodyContainer.appendChild(frame);
  } else {
    bodyContainer.innerHTML = `<div class="mail-body-text">${linkify(escapeHtml(mail.body))}</div>`;
  }
  
  document.getElementById('mail-modal').classList.add('active');
  
  // Mark as read
  if (!mail.read) {
    mail.read = true;
    saveReadState(state.currentAddress, state.mails);
    renderMailList(state.mails);
  }
}

function closeMailModal() {
  document.getElementById('mail-modal').classList.remove('active');
  state.selectedMail = null;
}

// ===== Drawer Menu =====
function openDrawer() {
  document.getElementById('drawer').classList.add('active');
  document.getElementById('drawer-overlay').classList.add('active');
  document.body.classList.add('drawer-open');
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('active');
  document.getElementById('drawer-overlay').classList.remove('active');
  document.body.classList.remove('drawer-open');
}

function updateDrawerLoginState() {
  const loggedIn = !!state.currentAddress;
  const loggedOutSec = document.getElementById('drawer-loggedout-section');
  const loggedInSec = document.getElementById('drawer-loggedin-section');
  if (loggedOutSec) loggedOutSec.style.display = loggedIn ? 'none' : 'block';
  if (loggedInSec) loggedInSec.style.display = loggedIn ? 'block' : 'none';
}

// ===== Modal Management =====
function openApiModal() {
  document.getElementById('api-modal').classList.add('active');
}

function closeApiModal() {
  document.getElementById('api-modal').classList.remove('active');
}

function openSettingsModal() {
  document.getElementById('settings-modal').classList.add('active');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.remove('active');
}

// ===== Change Password Modal =====
function openChangePasswordModal() {
  document.getElementById('change-password-form').reset();
  document.getElementById('pw-strength-wrap').style.display = 'none';
  document.getElementById('pw-match-msg').textContent = '';
  document.getElementById('change-password-modal').classList.add('active');
}

function closeChangePasswordModal() {
  document.getElementById('change-password-modal').classList.remove('active');
}

function calcPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function checkPwMatch(pw, confirm) {
  const msg = document.getElementById('pw-match-msg');
  if (!msg) return;
  if (!confirm) { msg.textContent = ''; return; }
  if (pw === confirm) {
    msg.textContent = '✓ 一致しています';
    msg.className = 'pw-match-msg match';
  } else {
    msg.textContent = '✗ パスワードが一致しません';
    msg.className = 'pw-match-msg no-match';
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const newPw = document.getElementById('new-password').value;
  const confirmPw = document.getElementById('confirm-new-password').value;
  const submitBtn = document.getElementById('change-password-submit-btn');

  if (newPw !== confirmPw) {
    showToast(t('passwordsNotMatch'), 'error');
    return;
  }
  if (newPw.length < 4) {
    showToast(t('passwordTooShort'), 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    // API: currentPassword に現在のパスワードを渡す（サーバー仕様）
    const res = await api.changePassword(state.currentAddress, state.currentPassword, newPw);
    if (res.success) {
      state.currentPassword = newPw;
      saveSession(state.currentAddress, newPw);
      updateAddressDisplay(state.currentAddress, newPw);
      closeChangePasswordModal();
      showToast(t('passwordChanged'), 'success');
    } else {
      showToast(res.error || t('passwordChangeFailed'), 'error');
    }
  } catch (err) {
    showToast(t('passwordChangeFailed'), 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

function openLoginModal() {
  document.getElementById('login-modal').classList.add('active');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
}

// ===== Password Warning Modal =====
// Password warning modal removed - passwords are always displayed in the UI
function openPasswordWarningModal() { /* no-op */ }
function closePasswordWarningModal() { /* no-op */ }
function hasSeenPasswordWarning() { return true; }
function markPasswordWarningSeen() { /* no-op */ }
function maybeShowPasswordWarning() { /* no-op */ }

// ===== New Address Confirm Modal =====
function openNewAddressConfirmModal() {
  document.getElementById('new-address-confirm-modal').classList.add('active');
}
function closeNewAddressConfirmModal() {
  document.getElementById('new-address-confirm-modal').classList.remove('active');
}

// ===== New Address =====
function handleNewAddress() {
  if (state.currentAddress) {
    // ログイン中 → 専用ダイアログ（削除ボタン付き）
    openNewAddressConfirmModal();
  } else {
    // 未ログイン → そのまま作成
    autoCreateAddress(true);
  }
}

// ===== Core Functions =====
async function handleLogin(e) {
  e.preventDefault();
  
  const address = document.getElementById('login-address').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const loginBtn = document.getElementById('login-btn');
  
  if (!address || !password) {
    showToast(t('invalidCredentials'), 'error');
    return;
  }
  
  try {
    loginBtn.disabled = true;
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" class="loading"/></svg><span>${t('loggingIn')}</span>`;
    
    const res = await api.login(address, password);
    
    if (res.success) {
      updateAddressDisplay(address, password);
      state.mails = res.mails || [];
      // Restore read state from localStorage
      const readIds = loadReadIds(address);
      state.mails = (state.mails || []).map(m => ({ ...m, read: readIds.has(m.id) }));
      renderMailList(state.mails);
      showMailboxView();
      closeLoginModal();
      showToast(t('login') + ' ' + t('success'), 'success');
      startAutoRefresh();
    } else {
      showToast(res.error || t('invalidCredentials'), 'error');
    }
  } catch (err) {
    console.error('Login failed:', err);
    showToast(t('loginFailed'), 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = `<span>${t('loginBtn')}</span>`;
  }
}

async function autoCreateAddress(isManualCreation = false) {
  const mailList = document.getElementById('mail-list');
  mailList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p data-i18n="creating">${t('creating')}</p>
    </div>
  `;

  try {
    const res = await api.newAddress();

    if (res.success) {
      updateAddressDisplay(res.address, res.password);
      state.mails = [];
      renderMailList([]);
      showMailboxView();

      showToast(t('addressCreated'), 'success', 3000);

      startAutoRefresh();
    } else {
      // Silent fail on auto-create - don't show error toast, just show empty state
      console.warn('Auto-create address failed:', res.message);
      renderMailList([]);
    }
  } catch (err) {
    // Silent fail on auto-create - don't show error toast
    console.error('Failed to create address:', err);
    renderMailList([]);
  }
}

// Keep for backward compatibility / manual trigger if needed
async function handleCreateAddress(e) {
  if (e) e.preventDefault();
  await autoCreateAddress();
}

async function refreshMailbox() {
  if (!state.currentAddress || !state.currentPassword) return;
  
  const refreshBtn = document.getElementById('refresh-btn');
  
  try {
    refreshBtn.disabled = true;
    refreshBtn.classList.add('spinning');
    
    const res = await api.getMailbox(state.currentAddress, state.currentPassword);
    
    if (res.success) {
      const readIds = new Set(state.mails.filter(m => m.read).map(m => m.id));
      // localStorageの既読も統合
      const savedIds = loadReadIds(state.currentAddress);
      savedIds.forEach(id => readIds.add(id));
      state.mails = (res.mails || []).map(m => ({ ...m, read: readIds.has(m.id) }));
      renderMailList(state.mails);
    }
  } catch (err) {
    console.error('Failed to refresh mailbox:', err);
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.classList.remove('spinning');
  }
}

async function handleDeleteMail() {
  if (!state.selectedMail || !state.currentAddress || !state.currentPassword) return;
  
  try {
    const res = await api.deleteMail(state.currentAddress, state.currentPassword, state.selectedMail.id);
    
    if (res.success) {
      state.mails = state.mails.filter(m => m.id !== state.selectedMail.id);
      renderMailList(state.mails);
      closeMailModal();
      showToast(t('mailDeleted'), 'success');
    } else {
      showToast(t('deleteFailed'), 'error');
    }
  } catch (err) {
    console.error('Failed to delete mail:', err);
    showToast(t('deleteFailed'), 'error');
  }
}

function handleDeleteAllMail() {
  if (!state.currentAddress || !state.currentPassword) return;
  
  showConfirm(
    t('deleteAllMail'),
    t('deleteAllMailConfirm'),
    async () => {
      try {
        const res = await api.clearMails(state.currentAddress, state.currentPassword);
        
        if (res.success) {
          clearReadState(state.currentAddress);
          state.mails = [];
          renderMailList([]);
          showToast(t('deleteAllMail'), 'success');
        } else {
          showToast(t('deleteFailed'), 'error');
        }
      } catch (err) {
        console.error('Failed to delete all mails:', err);
        showToast(t('deleteFailed'), 'error');
      }
    },
    'danger'
  );
}

function handleDeleteAddress() {
  if (!state.currentAddress || !state.currentPassword) return;
  
  showConfirm(
    t('deleteAddress'),
    t('deleteAddressConfirm'),
    async () => {
      try {
        const res = await api.deleteAddress(state.currentAddress, state.currentPassword);
        
        if (res.success) {
          clearReadState(state.currentAddress);
          clearSession();
          state.currentAddress = null;
          state.currentPassword = null;
          state.mails = [];
          stopAutoRefresh();
          showToast(t('deleteAddress'), 'success');
          // 削除後は新しいアドレスを自動生成（ページリロード不要）
          await autoCreateAddress();
        } else {
          showToast(t('deleteFailed'), 'error');
        }
      } catch (err) {
        console.error('Failed to delete address:', err);
        showToast(t('deleteFailed'), 'error');
      }
    },
    'danger'
  );
}

function handleLogout() {
  clearSession();
  state.currentAddress = null;
  state.currentPassword = null;
  state.mails = [];
  stopAutoRefresh();
  showLoggedOutView();
  showToast(t('logout'), 'success');
}

// ===== Password Change Functions =====
// Password Validation and Change Password Logic Removed

// ===== Auto Refresh =====
function startAutoRefresh() {
  stopAutoRefresh();
  if (state.autoRefresh) {
    state.refreshTimer = setInterval(refreshMailbox, CONFIG.REFRESH_INTERVAL);
  }
}

function stopAutoRefresh() {
  if (state.refreshTimer) {
    clearInterval(state.refreshTimer);
    state.refreshTimer = null;
  }
}

function toggleAutoRefresh(e) {
  state.autoRefresh = e.target.checked;
  if (state.autoRefresh) {
    startAutoRefresh();
    showToast(t('autoRefresh') + ' ON', 'info');
  } else {
    stopAutoRefresh();
    showToast(t('autoRefresh') + ' OFF', 'info');
  }
}

// ===== Navigation =====
function scrollToMailbox() {
  document.getElementById('mailbox-view').scrollIntoView({ behavior: 'smooth' });
}

// ===== Event Listeners =====
function initEventListeners() {
  // Hamburger / Drawer
  document.getElementById('menu-toggle').addEventListener('click', openDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

  // Drawer menu items
  document.getElementById('menu-login').addEventListener('click', () => {
    closeDrawer();
    openLoginModal();
  });
  document.getElementById('menu-login-other').addEventListener('click', () => {
    closeDrawer();
    // ログイン中: 警告なしで直接ログインモーダルを開く
    openLoginModal();
  });
  document.getElementById('menu-new-address').addEventListener('click', () => {
    closeDrawer();
    handleNewAddress();
  });
  document.getElementById('menu-change-password').addEventListener('click', () => {
    closeDrawer();
    openChangePasswordModal();
  });
  document.getElementById('menu-delete-all-mail').addEventListener('click', () => {
    closeDrawer();
    handleDeleteAllMail();
  });
  document.getElementById('menu-delete-address').addEventListener('click', () => {
    closeDrawer();
    handleDeleteAddress();
  });
  document.getElementById('menu-api').addEventListener('click', () => {
    closeDrawer();
    openApiModal();
  });
  document.getElementById('menu-settings').addEventListener('click', () => {
    closeDrawer();
    openSettingsModal();
  });

  // New Address Confirm Modal
  document.getElementById('new-addr-cancel').addEventListener('click', closeNewAddressConfirmModal);
  document.getElementById('new-addr-ok').addEventListener('click', async () => {
    closeNewAddressConfirmModal();
    clearSession();
    await autoCreateAddress(true);
  });
  document.getElementById('new-addr-delete').addEventListener('click', () => {
    // 削除確認ポップアップ（キャンセル時は新規作成モーダルに戻る）
    closeNewAddressConfirmModal();
    const msg = state.currentLang === 'ja'
      ? 'アドレスを使用しない場合は削除してください。\n\n' + t('deleteAddressConfirm')
      : "If you don't use the address, delete it.\n\n" + t('deleteAddressConfirm');
    showConfirm(
      t('deleteAddress'),
      msg,
      async () => {
        if (state.currentAddress && state.currentPassword) {
          try {
            await api.deleteAddress(state.currentAddress, state.currentPassword);
            clearReadState(state.currentAddress);
          } catch(e) { /* ignore */ }
        }
        clearSession();
        state.currentAddress = null;
        state.currentPassword = null;
        state.mails = [];
        stopAutoRefresh();
        await autoCreateAddress(true);
      },
      'danger',
      openNewAddressConfirmModal  // キャンセル時は元のモーダルに戻る
    );
  });

  // Forms
  document.getElementById('modal-login-form').addEventListener('submit', handleLogin);
  
  // Copy buttons
  document.getElementById('copy-address-btn').addEventListener('click', () => {
    if (state.currentAddress) copyToClipboard(state.currentAddress);
  });
  
  document.getElementById('copy-password-btn').addEventListener('click', () => {
    if (state.currentPassword) copyToClipboard(state.currentPassword);
  });
  
  document.getElementById('toggle-password-btn').addEventListener('click', togglePasswordVisibility);
  
  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', refreshMailbox);
  
  // Auto refresh toggle
  document.getElementById('auto-refresh').addEventListener('change', toggleAutoRefresh);
  
  // Modal closes
  document.getElementById('api-modal-close').addEventListener('click', closeApiModal);
  document.getElementById('settings-modal-close').addEventListener('click', closeSettingsModal);
  document.getElementById('mail-modal-close').addEventListener('click', closeMailModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeMailModal);
  document.getElementById('modal-delete-btn').addEventListener('click', handleDeleteMail);
  document.getElementById('login-modal-close').addEventListener('click', closeLoginModal);
  document.getElementById('change-password-modal-close').addEventListener('click', closeChangePasswordModal);

  // Settings actions (外観のみ)
  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    toggleTheme();
    closeSettingsModal();
  });
  // info-card のパスワード欄横の鉛筆ボタン
  document.getElementById('change-password-inline-btn').addEventListener('click', openChangePasswordModal);

  // Change password form
  document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
  document.getElementById('change-password-modal-close').addEventListener('click', closeChangePasswordModal);

  // 強度メーター
  document.getElementById('new-password').addEventListener('input', function() {
    const pw = this.value;
    const wrap = document.getElementById('pw-strength-wrap');
    const fill = document.getElementById('pw-strength-fill');
    const label = document.getElementById('pw-strength-label');
    if (!pw) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'flex';
    const score = calcPasswordStrength(pw);
    const levels = [
      { pct: 20, cls: 'weak',   text: t('strengthWeak')   || '弱い'  },
      { pct: 40, cls: 'weak',   text: t('strengthWeak')   || '弱い'  },
      { pct: 60, cls: 'medium', text: t('strengthMedium') || '普通'  },
      { pct: 80, cls: 'strong', text: t('strengthStrong') || '強い'  },
      { pct: 100,cls: 'strong', text: t('strengthStrong') || '強い'  },
    ];
    const lv = levels[Math.min(score, 4)];
    fill.style.width = lv.pct + '%';
    fill.className = 'pw-strength-fill ' + lv.cls;
    label.textContent = lv.text;
    label.className = 'pw-strength-label ' + lv.cls;
    // 確認欄チェック
    const confirmPw = document.getElementById('confirm-new-password').value;
    if (confirmPw) checkPwMatch(pw, confirmPw);
  });

  // 確認フィールド一致チェック
  document.getElementById('confirm-new-password').addEventListener('input', function() {
    checkPwMatch(document.getElementById('new-password').value, this.value);
  });

  // パスワード表示トグル（変更モーダル）
  ['toggle-new-password', 'toggle-confirm-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', function() {
      const targetId = id === 'toggle-new-password' ? 'new-password' : 'confirm-new-password';
      const input = document.getElementById(targetId);
      const svg = this.querySelector('svg');
      if (input.type === 'password') {
        input.type = 'text';
        svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
      } else {
        input.type = 'password';
        svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
      }
    });
  });
  
  // Login password visibility toggle
  document.getElementById('toggle-login-password')?.addEventListener('click', function() {
    const input = document.getElementById('login-password');
    const svg = this.querySelector('svg');
    if (input.type === 'password') {
      input.type = 'text';
      svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
      input.type = 'password';
      svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  });
  
  // Confirm modal
  document.getElementById('confirm-cancel').addEventListener('click', handleConfirmCancel);
  document.getElementById('confirm-ok').addEventListener('click', handleConfirmOk);

  // Language switch
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  
  // Close modals on overlay click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-overlay')) {
        if (modal.id === 'confirm-modal') {
          handleConfirmCancel();
        } else {
          modal.classList.remove('active');
        }
      }
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        if (modal.id === 'confirm-modal') {
          handleConfirmCancel();
        } else {
          modal.classList.remove('active');
        }
      });
    }
  });
}

// ===== Initialization =====
async function init() {
  // Load language
  const savedLang = localStorage.getItem(CONFIG.LANG_KEY) || 'ja';
  setLanguage(savedLang);

  // Load theme
  const savedTheme = localStorage.getItem(CONFIG.THEME_KEY) || 'neon';
  applyTheme(savedTheme);
  
  // Init event listeners
  initEventListeners();
  
  // Try restore session or create new address
  const session = loadSession();
  if (session && session.address && session.password) {
    try {
      const res = await api.login(session.address, session.password);
      if (res.success) {
        updateAddressDisplay(session.address, session.password);
        const readIds = loadReadIds(session.address);
        state.mails = (res.mails || []).map(m => ({ ...m, read: readIds.has(m.id) }));
        renderMailList(state.mails);
        showMailboxView();
        startAutoRefresh();
      } else {
        clearSession();
        // Auto-create new address instead of showing auth view
        await autoCreateAddress();
      }
    } catch (err) {
      clearSession();
      // Auto-create new address instead of showing auth view
      await autoCreateAddress();
    }
  } else {
    // No session - auto create new address
    await autoCreateAddress();
  }

  console.log('🚀 Sutemeado initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
