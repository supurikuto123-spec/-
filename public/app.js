/**
 * Sutemeado - Temporary Email Service with Login
 * Frontend JavaScript with i18n and API menu
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
    createBtn: '作成',
    yourAddress: 'YOUR MAIL ADDRESS',
    yourPassword: 'YOUR PASSWORD',
    copy: 'コピー',
    copyPassword: 'パスワードをコピー',
    copyAddress: 'アドレスをコピー',
    newAddress: '新規作成',
    refresh: '更新',
    inbox: 'INBOX',
    autoRefresh: '自動更新',
    noMail: 'メールはまだ届いていません',
    noMailSub: 'アドレスをコピーして登録・確認に使ってください',
    delete: '削除',
    close: '閉じる',
    copied: 'コピーしました',
    copyFailed: 'コピーに失敗しました',
    addressCreated: 'アドレスを作成しました',
    addressCreateFailed: 'アドレス作成に失敗しました',
    loginFailed: 'ログインに失敗しました',
    invalidCredentials: 'メールアドレスまたはパスワードが正しくありません',
    addressDeleted: 'メールを削除しました',
    deleteFailed: '削除に失敗しました',
    autoRefreshOn: '自動更新をオンにしました',
    autoRefreshOff: '自動更新をオフにしました',
    from: 'From:',
    to: 'To:',
    subject: '件名',
    dateFormat: 'ja-JP',
    savePassword: 'パスワードを保存してください',
    savePasswordSub: 'このパスワードは再表示できません',
    apiDocs: 'API',
    apiGetAddress: 'GET /api/new-address - 新規アドレス作成',
    apiLogin: 'POST /api/login - ログイン',
    apiGetMails: 'POST /api/mailbox/:address - メール取得',
    apiDeleteMail: 'DELETE /api/mailbox/:address/:mailId - メール削除',
    apiDeleteAddress: 'DELETE /api/address/:address - アドレス削除',
    logout: 'ログアウト',
    deleteAllMail: '全メール削除',
    deleteAddress: 'アドレス削除',
    deleteAddressConfirm: 'このアドレスを削除しますか？すべてのメールが削除されます',
    deleteAllMailConfirm: 'すべてのメールを削除しますか？',
    deleteAddressSuccess: 'アドレスを削除しました',
    deleteAllMailSuccess: 'すべてのメールを削除しました',
    menu: 'メニュー'
  },
  en: {
    title: 'Sutemeado - Simple Temporary Email',
    description: 'No registration required. Access anytime with your password.',
    statusOnline: 'System Online',
    login: 'Login',
    createNew: 'Create New',
    emailAddress: 'Email Address',
    password: 'Password',
    loginBtn: 'Login',
    createBtn: 'Create',
    yourAddress: 'YOUR MAIL ADDRESS',
    yourPassword: 'YOUR PASSWORD',
    copy: 'Copy',
    copyPassword: 'Copy Password',
    copyAddress: 'Copy Address',
    newAddress: 'Create New',
    refresh: 'Refresh',
    inbox: 'INBOX',
    autoRefresh: 'Auto Refresh',
    noMail: 'No emails yet',
    noMailSub: 'Copy the address to use for registration',
    delete: 'Delete',
    close: 'Close',
    copied: 'Copied to clipboard',
    copyFailed: 'Failed to copy',
    addressCreated: 'Address created successfully',
    addressCreateFailed: 'Failed to create address',
    loginFailed: 'Login failed',
    invalidCredentials: 'Invalid email address or password',
    addressDeleted: 'Email deleted',
    deleteFailed: 'Failed to delete',
    autoRefreshOn: 'Auto refresh enabled',
    autoRefreshOff: 'Auto refresh disabled',
    from: 'From:',
    to: 'To:',
    subject: 'Subject',
    dateFormat: 'en-US',
    savePassword: 'Please save your password',
    savePasswordSub: 'This password cannot be displayed again',
    apiDocs: 'API',
    apiGetAddress: 'GET /api/new-address - Create new address',
    apiLogin: 'POST /api/login - Login',
    apiGetMails: 'POST /api/mailbox/:address - Get mails',
    apiDeleteMail: 'DELETE /api/mailbox/:address/:mailId - Delete mail',
    apiDeleteAddress: 'DELETE /api/address/:address - Delete address',
    logout: 'Logout',
    deleteAllMail: 'Delete All Mail',
    deleteAddress: 'Delete Address',
    deleteAddressConfirm: 'Delete this address? All mails will be removed.',
    deleteAllMailConfirm: 'Delete all mails?',
    deleteAddressSuccess: 'Address deleted',
    deleteAllMailSuccess: 'All mails deleted',
    menu: 'Menu'
  }
};

// ===== Configuration =====
const CONFIG = {
  API_BASE: '',
  REFRESH_INTERVAL: 5000,
  STORAGE_KEY: 'sutemeado_session',
  LANG_KEY: 'sutemeado_lang'
};

// ===== State Management =====
const state = {
  currentAddress: null,
  currentPassword: null,
  mails: [],
  autoRefresh: true,
  refreshTimer: null,
  selectedMail: null,
  currentLang: 'ja',
  showApiMenu: false
};

// ===== DOM Elements =====
const elements = {
  // Login/Create
  loginForm: document.getElementById('login-form'),
  createForm: document.getElementById('create-form'),
  authSection: document.getElementById('auth-section'),
  mainSection: document.getElementById('main-section'),
  loginAddress: document.getElementById('login-address'),
  loginPassword: document.getElementById('login-password'),
  loginBtn: document.getElementById('login-btn'),
  newAddressBtn: document.getElementById('new-address-btn'),
  
  // Address display
  emailAddress: document.getElementById('email-address'),
  passwordDisplay: document.getElementById('password-display'),
  copyAddressBtn: document.getElementById('copy-address-btn'),
  copyPasswordBtn: document.getElementById('copy-password-btn'),
  
  // Mailbox
  mailList: document.getElementById('mail-list'),
  mailCount: document.getElementById('mail-count'),
  refreshBtn: document.getElementById('refresh-btn'),
  autoRefreshToggle: document.getElementById('auto-refresh'),
  
  // Modal
  modal: document.getElementById('mail-modal'),
  modalSubject: document.getElementById('modal-subject'),
  modalFrom: document.getElementById('modal-from'),
  modalTo: document.getElementById('modal-to'),
  modalDate: document.getElementById('modal-date'),
  modalBody: document.getElementById('modal-body'),
  modalClose: document.getElementById('modal-close'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalDelete: document.getElementById('modal-delete'),
  
  // API Menu
  apiMenuBtn: document.getElementById('api-menu-btn'),
  apiMenu: document.getElementById('api-menu'),
  apiMenuClose: document.getElementById('api-menu-close'),
  
  // Settings Menu
  settingsBtn: document.getElementById('settings-btn'),
  settingsMenu: document.getElementById('settings-menu'),
  settingsMenuClose: document.getElementById('settings-menu-close'),
  logoutBtn: document.getElementById('logout-btn'),
  deleteAllMailBtn: document.getElementById('delete-all-mail-btn'),
  deleteAddressBtn: document.getElementById('delete-address-btn'),
  
  // Toast
  toast: document.getElementById('toast'),
  langBtns: document.querySelectorAll('.lang-btn')
};

// ===== i18n Functions =====
function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem(CONFIG.LANG_KEY, lang);
  
  elements.langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
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
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n[lang][key]) {
      el.placeholder = i18n[lang][key];
    }
  });
  
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && i18n[lang].description) {
    metaDesc.content = i18n[lang].description;
  }
}

function t(key) {
  return i18n[state.currentLang][key] || key;
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

// ===== Utility Functions =====
function showToast(message, type = 'info') {
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

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
    return state.currentLang === 'ja' ? '刚刚' : 'Just now';
  }
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return state.currentLang === 'ja' ? `${mins}分前` : `${mins}m ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return state.currentLang === 'ja' ? `${hours}時間前` : `${hours}h ago`;
  }
  
  return date.toLocaleString(i18n[state.currentLang].dateFormat, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Session Management =====
function saveSession(address, password) {
  const data = { address, password };
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}

function loadSession() {
  const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function clearSession() {
  localStorage.removeItem(CONFIG.STORAGE_KEY);
}

// ===== UI Update Functions =====
function showAuthSection() {
  elements.authSection.style.display = 'block';
  elements.mainSection.style.display = 'none';
}

function showMainSection() {
  elements.authSection.style.display = 'none';
  elements.mainSection.style.display = 'block';
}

function updateAddressDisplay(address, password) {
  elements.emailAddress.textContent = address;
  elements.passwordDisplay.textContent = password;
  state.currentAddress = address;
  state.currentPassword = password;
  saveSession(address, password);
}

function renderMailList(mails) {
  if (!mails || mails.length === 0) {
    elements.mailList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <p>${t('noMail')}</p>
        <p class="empty-sub">${t('noMailSub')}</p>
      </div>
    `;
    elements.mailCount.textContent = '0';
    return;
  }

  elements.mailCount.textContent = mails.length;
  
  elements.mailList.innerHTML = mails.map(mail => `
    <div class="mail-item ${!mail.read ? 'unread' : ''}" data-id="${mail.id}">
      <div class="mail-header">
        <span class="mail-subject">${escapeHtml(mail.subject)}</span>
        <span class="mail-time">${formatDate(mail.receivedAt)}</span>
      </div>
      <div class="mail-from">${escapeHtml(mail.from)}</div>
      <div class="mail-preview">${escapeHtml(mail.body.substring(0, 100))}...</div>
    </div>
  `).join('');

  document.querySelectorAll('.mail-item').forEach(item => {
    item.addEventListener('click', () => {
      const mailId = item.dataset.id;
      openMailModal(mailId);
    });
  });
}

// ===== HTML Mail Handling =====
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
      if (doc) {
        const height = Math.max(
          doc.body.scrollHeight,
          doc.body.offsetHeight,
          doc.documentElement.scrollHeight,
          doc.documentElement.offsetHeight
        );
        frame.style.height = Math.min(Math.max(height + 20, 200), 600) + 'px';

        const imgs = doc.querySelectorAll('img');
        imgs.forEach(img => {
          img.addEventListener('load', () => {
            const newHeight = Math.max(
              doc.body.scrollHeight,
              doc.body.offsetHeight,
              doc.documentElement.scrollHeight,
              doc.documentElement.offsetHeight
            );
            frame.style.height = Math.min(Math.max(newHeight + 20, 200), 600) + 'px';
          });
        });
      }
    } catch (e) {
      console.log('Iframe resize error:', e);
    }
  });

  return frame;
}

// ===== Modal Functions =====
async function openMailModal(mailId) {
  const mail = state.mails.find(m => m.id === mailId);
  if (!mail) return;

  state.selectedMail = mail;

  elements.modalSubject.textContent = mail.subject;
  elements.modalFrom.textContent = mail.from;
  elements.modalTo.textContent = state.currentAddress;
  elements.modalDate.textContent = new Date(mail.receivedAt).toLocaleString(i18n[state.currentLang].dateFormat);

  elements.modalBody.innerHTML = '';
  if (mail.html && mail.html.trim().length > 0) {
    const frame = createSandboxFrame(mail.html);
    elements.modalBody.appendChild(frame);
  } else {
    elements.modalBody.innerHTML = linkify(escapeHtml(mail.body));
  }

  elements.modal.classList.add('active');
  mail.read = true;
  renderMailList(state.mails);
}

function closeMailModal() {
  elements.modal.classList.remove('active');
  state.selectedMail = null;
}

// ===== Core Functions =====
async function login() {
  const address = elements.loginAddress.value.trim();
  const password = elements.loginPassword.value.trim();
  
  if (!address || !password) {
    showToast(t('invalidCredentials'), 'error');
    return;
  }
  
  try {
    elements.loginBtn.disabled = true;
    elements.loginBtn.textContent = state.currentLang === 'ja' ? 'ログイン中...' : 'Logging in...';
    
    const res = await api.login(address, password);
    
    if (res.success) {
      updateAddressDisplay(address, password);
      state.mails = res.mails || [];
      renderMailList(state.mails);
      showMainSection();
      startAutoRefresh();
      showToast(t('login'), 'success');
    } else {
      showToast(t('invalidCredentials'), 'error');
    }
  } catch (err) {
    console.error('Login failed:', err);
    showToast(t('loginFailed'), 'error');
  } finally {
    elements.loginBtn.disabled = false;
    elements.loginBtn.textContent = t('loginBtn');
  }
}

async function createNewAddress() {
  try {
    elements.newAddressBtn.disabled = true;
    elements.newAddressBtn.textContent = state.currentLang === 'ja' ? '作成中...' : 'Creating...';
    
    const res = await api.newAddress();
    
    if (res.success) {
      updateAddressDisplay(res.address, res.password);
      state.mails = [];
      renderMailList([]);
      showMainSection();
      
      // Show password warning
      showToast(`${t('savePassword')}: ${res.password}`, 'success');
      setTimeout(() => {
        alert(`${t('savePassword')}\n${t('savePasswordSub')}\n\nEmail: ${res.address}\nPassword: ${res.password}`);
      }, 100);
      
      startAutoRefresh();
    } else {
      showToast(t('addressCreateFailed'), 'error');
    }
  } catch (err) {
    console.error('Failed to create address:', err);
    showToast(t('addressCreateFailed'), 'error');
  } finally {
    elements.newAddressBtn.disabled = false;
    elements.newAddressBtn.textContent = t('createBtn');
  }
}

async function refreshMailbox() {
  if (!state.currentAddress || !state.currentPassword) return;
  
  try {
    elements.refreshBtn.disabled = true;
    
    const res = await api.getMailbox(state.currentAddress, state.currentPassword);
    
    if (res.success) {
      const readIds = new Set(state.mails.filter(m => m.read).map(m => m.id));
      state.mails = res.mails.map(m => ({ ...m, read: readIds.has(m.id) || m.read }));
      renderMailList(state.mails);
    }
  } catch (err) {
    console.error('Failed to refresh mailbox:', err);
  } finally {
    elements.refreshBtn.disabled = false;
  }
}

async function deleteCurrentMail() {
  if (!state.selectedMail || !state.currentAddress || !state.currentPassword) return;
  
  try {
    const res = await api.deleteMail(state.currentAddress, state.currentPassword, state.selectedMail.id);
    
    if (res.success) {
      state.mails = state.mails.filter(m => m.id !== state.selectedMail.id);
      renderMailList(state.mails);
      closeMailModal();
      showToast(t('addressDeleted'), 'success');
    }
  } catch (err) {
    console.error('Failed to delete mail:', err);
    showToast(t('deleteFailed'), 'error');
  }
}

async function deleteAllMail() {
  if (!state.currentAddress || !state.currentPassword) return;
  
  if (!confirm(t('deleteAllMailConfirm'))) return;
  
  try {
    const res = await api.clearMails(state.currentAddress, state.currentPassword);
    
    if (res.success) {
      state.mails = [];
      renderMailList([]);
      closeSettingsMenu();
      showToast(t('deleteAllMailSuccess'), 'success');
    }
  } catch (err) {
    console.error('Failed to delete all mails:', err);
    showToast(t('deleteFailed'), 'error');
  }
}

async function deleteAddress() {
  if (!state.currentAddress || !state.currentPassword) return;
  
  if (!confirm(t('deleteAddressConfirm'))) return;
  
  try {
    const res = await api.deleteAddress(state.currentAddress, state.currentPassword);
    
    if (res.success) {
      clearSession();
      state.currentAddress = null;
      state.currentPassword = null;
      state.mails = [];
      stopAutoRefresh();
      closeSettingsMenu();
      showAuthSection();
      showToast(t('deleteAddressSuccess'), 'success');
    }
  } catch (err) {
    console.error('Failed to delete address:', err);
    showToast(t('deleteFailed'), 'error');
  }
}

function logout() {
  clearSession();
  state.currentAddress = null;
  state.currentPassword = null;
  state.mails = [];
  stopAutoRefresh();
  closeSettingsMenu();
  showAuthSection();
}

// ===== Menu Functions =====
function toggleApiMenu() {
  state.showApiMenu = !state.showApiMenu;
  elements.apiMenu.classList.toggle('active', state.showApiMenu);
}

function closeApiMenu() {
  state.showApiMenu = false;
  elements.apiMenu.classList.remove('active');
}

function toggleSettingsMenu() {
  elements.settingsMenu.classList.toggle('active');
}

function closeSettingsMenu() {
  elements.settingsMenu.classList.remove('active');
}

// ===== Auto Refresh =====
function startAutoRefresh() {
  if (state.refreshTimer) {
    clearInterval(state.refreshTimer);
  }
  
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

// ===== Event Listeners =====
function initEventListeners() {
  // Login
  elements.loginBtn.addEventListener('click', login);
  elements.loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });
  
  // Create new address
  elements.newAddressBtn.addEventListener('click', createNewAddress);
  
  // Auth tabs switching
  const loginTab = document.getElementById('login-tab');
  const createTab = document.getElementById('create-tab');
  const loginForm = document.getElementById('login-form');
  const createForm = document.getElementById('create-form');
  
  if (loginTab && createTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      createTab.classList.remove('active');
      loginForm.style.display = 'block';
      createForm.style.display = 'none';
    });
    
    createTab.addEventListener('click', () => {
      createTab.classList.add('active');
      loginTab.classList.remove('active');
      createForm.style.display = 'block';
      loginForm.style.display = 'none';
    });
  }
  
  // Copy buttons
  elements.copyAddressBtn.addEventListener('click', () => {
    if (state.currentAddress) {
      copyToClipboard(state.currentAddress);
    }
  });
  
  elements.copyPasswordBtn.addEventListener('click', () => {
    if (state.currentPassword) {
      copyToClipboard(state.currentPassword);
    }
  });
  
  // Refresh
  elements.refreshBtn.addEventListener('click', refreshMailbox);
  
  // Auto refresh toggle
  elements.autoRefreshToggle.addEventListener('change', (e) => {
    state.autoRefresh = e.target.checked;
    if (state.autoRefresh) {
      startAutoRefresh();
      showToast(t('autoRefreshOn'), 'success');
    } else {
      stopAutoRefresh();
      showToast(t('autoRefreshOff'), 'info');
    }
  });
  
  // Modal
  elements.modalClose.addEventListener('click', closeMailModal);
  elements.modalCloseBtn.addEventListener('click', closeMailModal);
  elements.modalDelete.addEventListener('click', deleteCurrentMail);
  
  // API Menu
  elements.apiMenuBtn.addEventListener('click', toggleApiMenu);
  elements.apiMenuClose.addEventListener('click', closeApiMenu);
  
  // Settings Menu
  elements.settingsBtn.addEventListener('click', toggleSettingsMenu);
  elements.settingsMenuClose.addEventListener('click', closeSettingsMenu);
  elements.logoutBtn.addEventListener('click', logout);
  elements.deleteAllMailBtn.addEventListener('click', deleteAllMail);
  elements.deleteAddressBtn.addEventListener('click', deleteAddress);
  
  // Modal outside click
  elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
      closeMailModal();
    }
  });
  
  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.modal.classList.contains('active')) {
        closeMailModal();
      }
      if (elements.apiMenu.classList.contains('active')) {
        closeApiMenu();
      }
      if (elements.settingsMenu.classList.contains('active')) {
        closeSettingsMenu();
      }
    }
  });
  
  // Language toggle
  elements.langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });
}

// ===== Initialization =====
async function init() {
  initEventListeners();
  
  // Load language preference
  const savedLang = localStorage.getItem(CONFIG.LANG_KEY) || 'ja';
  setLanguage(savedLang);
  
  // Try to restore session
  const session = loadSession();
  if (session && session.address && session.password) {
    try {
      const res = await api.login(session.address, session.password);
      if (res.success) {
        updateAddressDisplay(session.address, session.password);
        state.mails = res.mails || [];
        renderMailList(state.mails);
        showMainSection();
        startAutoRefresh();
      } else {
        clearSession();
        showAuthSection();
      }
    } catch (err) {
      clearSession();
      showAuthSection();
    }
  } else {
    showAuthSection();
  }
  
  console.log('🚀 Sutemeado initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
