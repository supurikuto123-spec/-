/**
 * Sutemeado - Cyberpunk Temporary Email Service
 * Frontend JavaScript with i18n, custom addresses, and reply functionality
 */

// ===== i18n Translations =====
const i18n = {
  ja: {
    title: 'Sutemeado - シンプルな一時メール',
    description: '登録不要、シンプルな一時メールサービス。24時間限定の使い捨てメールアドレスを即座に発行。',
    statusOnline: 'システム正常',
    yourAddress: 'YOUR TEMPORARY ADDRESS',
    customAddressPlaceholder: '任意のアドレス名を入力',
    useThisAddress: '適用',
    addressHint: '24時間有効 / 自動削除',
    newAddress: '新規生成',
    refresh: '更新',
    customAddress: 'カスタム',
    inbox: 'INBOX',
    autoRefresh: '自動更新',
    noMail: 'メールはまだ届いていません',
    noMailSub: 'アドレスをコピーして登録・確認に使ってください',
    apiAccess: 'API ACCESS',
    apiDocs: '全機能無料でご利用いただけます。レート制限: 100req/min',
    footerHint: 'メールは24時間後に自動削除されます',
    receivedAt: '受信日時:',
    replyToThis: '返信する',
    replyPlaceholder: '返信内容を入力してください...',
    cancel: 'キャンセル',
    sendReply: '送信',
    delete: '削除',
    close: '閉じる',
    copied: 'アドレスをコピーしました',
    copyFailed: 'コピーに失敗しました',
    addressGenerated: '新しいアドレスを生成しました',
    addressGenerateFailed: 'アドレス生成に失敗しました',
    customAddressApplied: 'カスタムアドレスを適用しました',
    invalidAddress: '英数字とハイフンのみ使用可能です',
    addressDeleted: 'メールを削除しました',
    deleteFailed: '削除に失敗しました',
    autoRefreshOn: '自動更新をオンにしました',
    autoRefreshOff: '自動更新をオフにしました',
    replySent: '返信を送信しました',
    replyFailed: '返信に失敗しました',
    replyEmpty: '返信内容を入力してください',
    from: 'From:',
    to: 'To:',
    subject: '件名',
    dateFormat: 'ja-JP'
  },
  en: {
    title: 'Sutemeado - Simple Temporary Email',
    description: 'No registration required. Instant disposable email addresses valid for 24 hours.',
    statusOnline: 'System Online',
    yourAddress: 'YOUR TEMPORARY ADDRESS',
    customAddressPlaceholder: 'Enter custom address name',
    useThisAddress: 'Apply',
    addressHint: 'Valid for 24h / Auto-delete',
    newAddress: 'Generate New',
    refresh: 'Refresh',
    customAddress: 'Custom',
    inbox: 'INBOX',
    autoRefresh: 'Auto Refresh',
    noMail: 'No emails yet',
    noMailSub: 'Copy the address to use for registration',
    apiAccess: 'API ACCESS',
    apiDocs: 'All features free to use. Rate limit: 100req/min',
    footerHint: 'Emails are automatically deleted after 24 hours',
    receivedAt: 'Received:',
    replyToThis: 'Reply',
    replyPlaceholder: 'Enter your reply...',
    cancel: 'Cancel',
    sendReply: 'Send',
    delete: 'Delete',
    close: 'Close',
    copied: 'Address copied to clipboard',
    copyFailed: 'Failed to copy',
    addressGenerated: 'New address generated',
    addressGenerateFailed: 'Failed to generate address',
    customAddressApplied: 'Custom address applied',
    invalidAddress: 'Only alphanumeric and hyphens allowed',
    addressDeleted: 'Email deleted',
    deleteFailed: 'Failed to delete',
    autoRefreshOn: 'Auto refresh enabled',
    autoRefreshOff: 'Auto refresh disabled',
    replySent: 'Reply sent',
    replyFailed: 'Failed to send reply',
    replyEmpty: 'Please enter reply content',
    from: 'From:',
    to: 'To:',
    subject: 'Subject',
    dateFormat: 'en-US'
  }
};

// ===== Configuration =====
const CONFIG = {
  API_BASE: '',
  REFRESH_INTERVAL: 5000,
  STORAGE_KEY: 'sutemeado_address',
  LANG_KEY: 'sutemeado_lang'
};

// ===== State Management =====
const state = {
  currentAddress: null,
  mails: [],
  autoRefresh: true,
  refreshTimer: null,
  selectedMail: null,
  currentLang: 'ja'
};

// ===== DOM Elements =====
const elements = {
  emailAddress: document.getElementById('email-address'),
  copyBtn: document.getElementById('copy-btn'),
  newAddressBtn: document.getElementById('new-address-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  toggleCustomBtn: document.getElementById('toggle-custom-btn'),
  customAddressGroup: document.getElementById('custom-address-group'),
  customAddressInput: document.getElementById('custom-address-input'),
  useCustomBtn: document.getElementById('use-custom-btn'),
  mailList: document.getElementById('mail-list'),
  mailCount: document.getElementById('mail-count'),
  autoRefreshToggle: document.getElementById('auto-refresh'),
  modal: document.getElementById('mail-modal'),
  modalSubject: document.getElementById('modal-subject'),
  modalFrom: document.getElementById('modal-from'),
  modalTo: document.getElementById('modal-to'),
  modalDate: document.getElementById('modal-date'),
  modalBody: document.getElementById('modal-body'),
  modalClose: document.getElementById('modal-close'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalDelete: document.getElementById('modal-delete'),
  replySection: document.getElementById('reply-section'),
  replyInput: document.getElementById('reply-input'),
  replySend: document.getElementById('reply-send'),
  replyCancel: document.getElementById('reply-cancel'),
  toast: document.getElementById('toast'),
  langBtns: document.querySelectorAll('.lang-btn')
};

// ===== i18n Functions =====
function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem(CONFIG.LANG_KEY, lang);
  
  // Update active button
  elements.langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Update all translatable elements
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
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n[lang][key]) {
      el.placeholder = i18n[lang][key];
    }
  });
  
  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && i18n[lang].description) {
    metaDesc.content = i18n[lang].description;
  }
  
  // Refresh mail list to update dates
  if (state.mails.length > 0) {
    renderMailList(state.mails);
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

  async getMailbox(address) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}`);
    return res.json();
  },

  async getMail(address, mailId) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}/${mailId}`);
    return res.json();
  },

  async deleteMail(address, mailId) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}/${mailId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async sendReply(address, mailId, body) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}/${mailId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    });
    return res.json();
  }
};

// ===== Utility Functions =====
function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

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

// ===== State Management =====
function loadSavedAddress() {
  const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.address && data.createdAt && (Date.now() - data.createdAt < 24 * 60 * 60 * 1000)) {
        return data.address;
      }
    } catch (e) {
      console.error('Failed to parse saved address:', e);
    }
  }
  return null;
}

function saveAddress(address) {
  const data = { address, createdAt: Date.now() };
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}

// ===== UI Update Functions =====
function updateAddressDisplay(address) {
  elements.emailAddress.textContent = address;
  state.currentAddress = address;
  saveAddress(address);
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

  // HTMLリンクのセキュリティ対策
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

  // 高さ自動調整
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

        // 画像読み込み後に再調整
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

  // HTMLメール対応
  elements.modalBody.innerHTML = '';
  if (mail.html && mail.html.trim().length > 0) {
    const frame = createSandboxFrame(mail.html);
    elements.modalBody.appendChild(frame);
  } else {
    elements.modalBody.innerHTML = linkify(escapeHtml(mail.body));
  }

  // Clear reply input
  elements.replyInput.value = '';

  elements.modal.classList.add('active');

  mail.read = true;
  renderMailList(state.mails);
}

function closeMailModal() {
  elements.modal.classList.remove('active');
  state.selectedMail = null;
}

// ===== Core Functions =====
async function createNewAddress() {
  try {
    elements.newAddressBtn.disabled = true;
    const originalContent = elements.newAddressBtn.innerHTML;
    elements.newAddressBtn.innerHTML = `
      <svg class="loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
      </svg>
      <span>${state.currentLang === 'ja' ? '生成中...' : 'Generating...'}</span>
    `;
    
    const res = await api.newAddress();
    if (res.success) {
      updateAddressDisplay(res.address);
      state.mails = [];
      renderMailList([]);
      showToast(t('addressGenerated'), 'success');
    }
  } catch (err) {
    console.error('Failed to create address:', err);
    showToast(t('addressGenerateFailed'), 'error');
  } finally {
    elements.newAddressBtn.disabled = false;
    elements.newAddressBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
      <span>${t('newAddress')}</span>
    `;
  }
}

async function useCustomAddress() {
  const input = elements.customAddressInput.value.trim().toLowerCase();
  
  if (!input) {
    showToast(t('invalidAddress'), 'error');
    return;
  }
  
  // Validate: alphanumeric and hyphens only
  if (!/^[a-z0-9-]+$/.test(input)) {
    showToast(t('invalidAddress'), 'error');
    return;
  }
  
  const address = `${input}@sutemeado.com`;
  updateAddressDisplay(address);
  state.mails = [];
  renderMailList([]);
  showToast(t('customAddressApplied'), 'success');
  
  // Hide custom input after applying
  elements.customAddressGroup.style.display = 'none';
  elements.customAddressInput.value = '';
}

function toggleCustomAddress() {
  const isVisible = elements.customAddressGroup.style.display !== 'none';
  elements.customAddressGroup.style.display = isVisible ? 'none' : 'flex';
  if (!isVisible) {
    elements.customAddressInput.focus();
  }
}

async function refreshMailbox() {
  if (!state.currentAddress) return;
  
  try {
    elements.refreshBtn.disabled = true;
    elements.refreshBtn.innerHTML = `
      <svg class="loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
      </svg>
      <span>${state.currentLang === 'ja' ? '更新中...' : 'Updating...'}</span>
    `;
    
    const res = await api.getMailbox(state.currentAddress);
    if (res.success) {
      const readIds = new Set(state.mails.filter(m => m.read).map(m => m.id));
      state.mails = res.mails.map(m => ({ ...m, read: readIds.has(m.id) || m.read }));
      renderMailList(state.mails);
    }
  } catch (err) {
    console.error('Failed to refresh mailbox:', err);
  } finally {
    elements.refreshBtn.disabled = false;
    elements.refreshBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23,4 23,10 17,10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      <span>${t('refresh')}</span>
    `;
  }
}

async function deleteCurrentMail() {
  if (!state.selectedMail || !state.currentAddress) return;
  
  try {
    const res = await api.deleteMail(state.currentAddress, state.selectedMail.id);
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

async function sendReply() {
  if (!state.selectedMail || !state.currentAddress) return;
  
  const body = elements.replyInput.value.trim();
  if (!body) {
    showToast(t('replyEmpty'), 'error');
    return;
  }
  
  try {
    elements.replySend.disabled = true;
    elements.replySend.innerHTML = `
      <svg class="loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
      </svg>
      <span>${state.currentLang === 'ja' ? '送信中...' : 'Sending...'}</span>
    `;
    
    const res = await api.sendReply(state.currentAddress, state.selectedMail.id, body);
    if (res.success) {
      elements.replyInput.value = '';
      showToast(t('replySent'), 'success');
    } else {
      showToast(t('replyFailed'), 'error');
    }
  } catch (err) {
    console.error('Failed to send reply:', err);
    showToast(t('replyFailed'), 'error');
  } finally {
    elements.replySend.disabled = false;
    elements.replySend.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
      <span>${t('sendReply')}</span>
    `;
  }
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
  // Copy button
  elements.copyBtn.addEventListener('click', () => {
    if (state.currentAddress) {
      copyToClipboard(state.currentAddress);
    }
  });

  // New address
  elements.newAddressBtn.addEventListener('click', createNewAddress);

  // Refresh
  elements.refreshBtn.addEventListener('click', refreshMailbox);

  // Custom address toggle
  elements.toggleCustomBtn.addEventListener('click', toggleCustomAddress);
  
  // Use custom address
  elements.useCustomBtn.addEventListener('click', useCustomAddress);
  
  // Custom address input enter key
  elements.customAddressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      useCustomAddress();
    }
  });

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

  // Modal close
  elements.modalClose.addEventListener('click', closeMailModal);
  elements.modalCloseBtn.addEventListener('click', closeMailModal);
  elements.modalDelete.addEventListener('click', deleteCurrentMail);
  
  // Reply
  elements.replySend.addEventListener('click', sendReply);
  elements.replyCancel.addEventListener('click', () => {
    elements.replyInput.value = '';
  });
  
  // Modal outside click
  elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
      closeMailModal();
    }
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
      closeMailModal();
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
  
  // Hide custom address input initially
  elements.customAddressGroup.style.display = 'none';
  
  // Load or create address
  const savedAddress = loadSavedAddress();
  if (savedAddress) {
    updateAddressDisplay(savedAddress);
    await refreshMailbox();
  } else {
    await createNewAddress();
  }
  
  // Start auto refresh
  startAutoRefresh();
  
  console.log('🚀 Sutemeado initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
