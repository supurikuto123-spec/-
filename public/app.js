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
    creating: '作成中...',
    langJA: '日本語',
    langEN: 'English'
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
    creating: 'Creating...',
    langJA: '日本語',
    langEN: 'English'
  }
};

// ===== Configuration =====
const CONFIG = {
  API_BASE: '',
  REFRESH_INTERVAL: 5000,
  STORAGE_KEY: 'sutemeado_session',
  LANG_KEY: 'sutemeado_lang'
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
  passwordVisible: false
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

function showConfirm(title, message, onConfirm, type = 'warning') {
  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-title');
  const messageEl = document.getElementById('confirm-message');
  const iconEl = modal.querySelector('.confirm-icon');
  const okBtn = document.getElementById('confirm-ok');
  
  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Set icon based on type
  const icons = {
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    danger: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  
  iconEl.innerHTML = icons[type] || icons.warning;
  iconEl.className = 'confirm-icon ' + type;
  
  // Update button text
  okBtn.textContent = t('confirm');
  document.getElementById('confirm-cancel').textContent = t('cancel');
  
  // Set callback
  confirmCallback = onConfirm;
  
  // Show modal
  modal.classList.add('active');
}

function closeConfirm() {
  const modal = document.getElementById('confirm-modal');
  modal.classList.remove('active');
  confirmCallback = null;
}

function handleConfirmOk() {
  if (confirmCallback) {
    confirmCallback();
  }
  closeConfirm();
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
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({ address, password }));
}

function loadSession() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(CONFIG.STORAGE_KEY);
}

// ===== UI Update Functions =====
function switchAuthTab(tab) {
  const createForm = document.getElementById('create-form');
  const loginForm = document.getElementById('login-form');
  const toggleCreate = document.getElementById('toggle-create');
  const toggleLogin = document.getElementById('toggle-login');
  
  if (tab === 'create') {
    createForm.style.display = 'block';
    loginForm.style.display = 'none';
    toggleCreate.classList.add('active');
    toggleLogin.classList.remove('active');
  } else {
    createForm.style.display = 'none';
    loginForm.style.display = 'block';
    toggleCreate.classList.remove('active');
    toggleLogin.classList.add('active');
    // Focus on email input
    setTimeout(() => document.getElementById('login-address').focus(), 100);
  }
}

function showAuthView() {
  document.getElementById('auth-view').style.display = 'flex';
  document.getElementById('mailbox-view').style.display = 'none';
  
  // Hide nav items that require login
  document.getElementById('nav-inbox').style.display = 'none';
  document.getElementById('nav-api').style.display = 'none';
  document.getElementById('nav-settings').style.display = 'none';
  document.getElementById('nav-badge').style.display = 'none';
}

function showMailboxView() {
  document.getElementById('auth-view').style.display = 'none';
  document.getElementById('mailbox-view').style.display = 'block';
  
  // Show nav items
  document.getElementById('nav-inbox').style.display = 'flex';
  document.getElementById('nav-api').style.display = 'flex';
  document.getElementById('nav-settings').style.display = 'flex';
  updateNavBadge();
}

function updateAddressDisplay(address, password) {
  document.getElementById('display-address').textContent = address;
  document.getElementById('display-password').textContent = password;
  state.currentAddress = address;
  state.currentPassword = password;
  state.passwordVisible = true;
  saveSession(address, password);
}

function togglePasswordVisibility() {
  const passwordEl = document.getElementById('display-password');
  const eyeIcon = document.getElementById('eye-icon');
  
  state.passwordVisible = !state.passwordVisible;
  
  if (state.passwordVisible) {
    passwordEl.textContent = state.currentPassword;
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  } else {
    passwordEl.textContent = '••••••••••';
    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  }
}

function updateNavBadge() {
  const badge = document.getElementById('nav-badge');
  const unreadCount = state.mails.filter(m => !m.read).length;
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderMailList(mails) {
  const mailList = document.getElementById('mail-list');
  const mailCount = document.getElementById('mail-count');
  
  mailCount.textContent = mails.length;
  
  if (!mails || mails.length === 0) {
    mailList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <p data-i18n="noMail">${t('noMail')}</p>
        <span data-i18n="noMailSub">${t('noMailSub')}</span>
      </div>
    `;
    return;
  }
  
  // Sort by date, newest first
  const sortedMails = [...mails].sort((a, b) => b.receivedAt - a.receivedAt);
  
  mailList.innerHTML = sortedMails.map(mail => `
    <div class="mail-item ${!mail.read ? 'unread' : ''}" data-id="${mail.id}">
      <div class="mail-header">
        <span class="mail-subject">${escapeHtml(mail.subject || '(no subject)')}</span>
        <span class="mail-time">${formatDate(mail.receivedAt)}</span>
      </div>
      <div class="mail-from">${escapeHtml(mail.from)}</div>
      <div class="mail-preview">${escapeHtml(mail.body.substring(0, 100))}${mail.body.length > 100 ? '...' : ''}</div>
    </div>
  `).join('');
  
  // Add click handlers
  mailList.querySelectorAll('.mail-item').forEach(item => {
    item.addEventListener('click', () => openMailModal(item.dataset.id));
  });
  
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
        body {
          margin: 0;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          word-break: break-word;
        }
        a {
          color: #0088ff;
          text-decoration: underline;
          word-break: break-all;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        table {
          max-width: 100%;
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
      if (doc && doc.body) {
        const height = Math.max(
          doc.body.scrollHeight,
          doc.body.offsetHeight,
          doc.documentElement?.scrollHeight || 0,
          doc.documentElement?.offsetHeight || 0
        );
        frame.style.height = Math.min(Math.max(height + 20, 200), 600) + 'px';
      }
    } catch (e) {
      console.log('Iframe resize error:', e);
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
    renderMailList(state.mails);
  }
}

function closeMailModal() {
  document.getElementById('mail-modal').classList.remove('active');
  state.selectedMail = null;
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
      state.mails.forEach(m => m.read = false);
      renderMailList(state.mails);
      showMailboxView();
      showToast(t('login') + ' ' + t('success'), 'success');
      startAutoRefresh();
    } else {
      showToast(t('invalidCredentials'), 'error');
    }
  } catch (err) {
    console.error('Login failed:', err);
    showToast(t('loginFailed'), 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg><span>${t('loginBtn')}</span>`;
  }
}

async function handleCreateAddress(e) {
  e.preventDefault();
  
  const createBtn = document.getElementById('create-btn');
  
  try {
    createBtn.disabled = true;
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" class="loading"/></svg><span>${t('creating')}</span>`;
    
    const res = await api.newAddress();
    
    if (res.success) {
      updateAddressDisplay(res.address, res.password);
      state.mails = [];
      renderMailList([]);
      showMailboxView();
      
      // Show password save reminder
      showToast(`${t('savePassword')}: ${res.password}`, 'success', 5000);
      
      // Show details modal
      setTimeout(() => {
        showConfirm(
          t('savePassword'),
          `Email: ${res.address}\nPassword: ${res.password}\n\n${t('savePasswordSub')}`,
          null,
          'info'
        );
        // Hide the OK button for this info modal
        document.getElementById('confirm-ok').style.display = 'inline-flex';
      }, 500);
      
      startAutoRefresh();
    } else {
      showToast(t('addressCreateFailed'), 'error');
    }
  } catch (err) {
    console.error('Failed to create address:', err);
    showToast(t('addressCreateFailed'), 'error');
  } finally {
    createBtn.disabled = false;
    createBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>${t('createAddress')}</span>`;
  }
}

async function refreshMailbox() {
  if (!state.currentAddress || !state.currentPassword) return;
  
  const refreshBtn = document.getElementById('refresh-btn');
  
  try {
    refreshBtn.disabled = true;
    refreshBtn.querySelector('svg').classList.add('loading');
    
    const res = await api.getMailbox(state.currentAddress, state.currentPassword);
    
    if (res.success) {
      // Preserve read status
      const readIds = new Set(state.mails.filter(m => m.read).map(m => m.id));
      state.mails = (res.mails || []).map(m => ({ ...m, read: readIds.has(m.id) }));
      renderMailList(state.mails);
    }
  } catch (err) {
    console.error('Failed to refresh mailbox:', err);
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.querySelector('svg').classList.remove('loading');
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
          state.mails = [];
          renderMailList([]);
          closeSettingsModal();
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
          clearSession();
          state.currentAddress = null;
          state.currentPassword = null;
          state.mails = [];
          stopAutoRefresh();
          closeSettingsModal();
          showAuthView();
          showToast(t('deleteAddress'), 'success');
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
  closeSettingsModal();
  showAuthView();
  showToast(t('logout'), 'success');
}

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
  // Auth tabs
  document.getElementById('toggle-create').addEventListener('click', () => switchAuthTab('create'));
  document.getElementById('toggle-login').addEventListener('click', () => switchAuthTab('login'));
  
  // Forms
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('create-form').addEventListener('submit', handleCreateAddress);
  
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
  
  // Nav items
  document.getElementById('nav-inbox').addEventListener('click', scrollToMailbox);
  document.getElementById('nav-api').addEventListener('click', openApiModal);
  document.getElementById('nav-settings').addEventListener('click', openSettingsModal);
  
  // Modal closes
  document.getElementById('api-modal-close').addEventListener('click', closeApiModal);
  document.getElementById('settings-modal-close').addEventListener('click', closeSettingsModal);
  document.getElementById('mail-modal-close').addEventListener('click', closeMailModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeMailModal);
  document.getElementById('modal-delete-btn').addEventListener('click', handleDeleteMail);
  
  // Settings actions
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('delete-all-mail-btn').addEventListener('click', handleDeleteAllMail);
  document.getElementById('delete-address-btn').addEventListener('click', handleDeleteAddress);
  
  // Confirm modal
  document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);
  document.getElementById('confirm-ok').addEventListener('click', handleConfirmOk);
  
  // Language switch
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  
  // Close modals on overlay click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-overlay')) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });
}

// ===== Initialization =====
async function init() {
  // Load language
  const savedLang = localStorage.getItem(CONFIG.LANG_KEY) || 'ja';
  setLanguage(savedLang);
  
  // Init event listeners
  initEventListeners();
  
  // Try restore session
  const session = loadSession();
  if (session && session.address && session.password) {
    try {
      const res = await api.login(session.address, session.password);
      if (res.success) {
        updateAddressDisplay(session.address, session.password);
        state.mails = (res.mails || []).map(m => ({ ...m, read: false }));
        renderMailList(state.mails);
        showMailboxView();
        startAutoRefresh();
      } else {
        clearSession();
        showAuthView();
      }
    } catch (err) {
      clearSession();
      showAuthView();
    }
  } else {
    showAuthView();
  }
  
  console.log('🚀 Sutemeado initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
