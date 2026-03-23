/**
 * Sutemeado - フロントエンドJavaScript
 * シンプルな一時メールサービスのクライアント側ロジック
 */

// ===== 設定 =====
const CONFIG = {
  API_BASE: '',  // 同じドメイン
  REFRESH_INTERVAL: 5000,  // 5秒
  STORAGE_KEY: 'sutemeado_address'
};

// ===== 状態管理 =====
const state = {
  currentAddress: null,
  mails: [],
  autoRefresh: true,
  refreshTimer: null,
  selectedMail: null
};

// ===== DOM要素 =====
const elements = {
  emailAddress: document.getElementById('email-address'),
  copyBtn: document.getElementById('copy-btn'),
  newAddressBtn: document.getElementById('new-address-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  mailList: document.getElementById('mail-list'),
  mailCount: document.getElementById('mail-count'),
  autoRefreshToggle: document.getElementById('auto-refresh'),
  modal: document.getElementById('mail-modal'),
  modalSubject: document.getElementById('modal-subject'),
  modalFrom: document.getElementById('modal-from'),
  modalDate: document.getElementById('modal-date'),
  modalBody: document.getElementById('modal-body'),
  modalClose: document.getElementById('modal-close'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalDelete: document.getElementById('modal-delete'),
  toast: document.getElementById('toast')
};

// ===== API関数 =====
const api = {
  // 新しいアドレスを生成
  async newAddress() {
    const res = await fetch('/api/new-address');
    return res.json();
  },

  // メールボックスを取得
  async getMailbox(address) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}`);
    return res.json();
  },

  // 特定のメールを取得
  async getMail(address, mailId) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}/${mailId}`);
    return res.json();
  },

  // メールを削除
  async deleteMail(address, mailId) {
    const res = await fetch(`/api/mailbox/${encodeURIComponent(address)}/${mailId}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// ===== ユーティリティ =====
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
      showToast('アドレスをコピーしました！');
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
    showToast('アドレスをコピーしました！');
  } catch (err) {
    showToast('コピーに失敗しました', 'error');
  }
  
  document.body.removeChild(textarea);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 1分未満
  if (diff < 60000) {
    return '刚刚';
  }
  // 1時間未満
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分前`;
  }
  // 24時間未満
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}時間前`;
  }
  
  return date.toLocaleString('ja-JP', {
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

// ===== 状態管理 =====
function loadSavedAddress() {
  const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      // 24時間以内のものだけ復元
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
  const data = {
    address,
    createdAt: Date.now()
  };
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}

// ===== UI更新 =====
function updateAddressDisplay(address) {
  elements.emailAddress.textContent = address;
  state.currentAddress = address;
  saveAddress(address);
}

function renderMailList(mails) {
  if (!mails || mails.length === 0) {
    elements.mailList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>メールはまだ届いていません</p>
        <p class="empty-sub">アドレスをコピーして登録・確認に使ってください</p>
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

  // メールクリックイベント
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

// ===== モーダル =====
async function openMailModal(mailId) {
  const mail = state.mails.find(m => m.id === mailId);
  if (!mail) return;

  state.selectedMail = mail;
  
  elements.modalSubject.textContent = mail.subject;
  elements.modalFrom.textContent = mail.from;
  elements.modalDate.textContent = mail.receivedAtFormatted;
  elements.modalBody.innerHTML = linkify(escapeHtml(mail.body));
  
  elements.modal.classList.add('active');
  
  // 既読マーク
  mail.read = true;
  renderMailList(state.mails);
}

function closeMailModal() {
  elements.modal.classList.remove('active');
  state.selectedMail = null;
}

// ===== メイン機能 =====
async function createNewAddress() {
  try {
    elements.newAddressBtn.disabled = true;
    elements.newAddressBtn.innerHTML = '<span>⏳</span> 生成中...';
    
    const res = await api.newAddress();
    if (res.success) {
      updateAddressDisplay(res.address);
      state.mails = [];
      renderMailList([]);
      showToast('新しいアドレスを生成しました');
      
      // テスト用にウェルカムメールを送信
      await sendWelcomeMail(res.address);
    }
  } catch (err) {
    console.error('Failed to create address:', err);
    showToast('アドレス生成に失敗しました', 'error');
  } finally {
    elements.newAddressBtn.disabled = false;
    elements.newAddressBtn.innerHTML = '<span>🎲</span> 新しいアドレス';
  }
}

async function sendWelcomeMail(address) {
  try {
    await fetch('/api/simulate-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        subject: '🎉 Sutemeadoへようこそ！',
        from: 'welcome@sutemeado.com',
        body: `Sutemeadoをご利用いただきありがとうございます！

これはテストメールです。実際のメールサービスと同じように動作します。

【使い方】
1. 画面上部のアドレスをコピー
2. 登録したいサービスに貼り付け
3. この画面でメールを待つ
4. メールが届いたらクリックして確認

【注意事項】
- メールは24時間後に自動削除されます
- 重要なデータの受信には不向きです
- プライバシー保護のためにご利用ください

ご質問があればお気軽にどうぞ！

Sutemeado Team
https://sutemeado.com`
      })
    });
    
    // ウェルカムメール後に更新
    setTimeout(() => refreshMailbox(), 500);
  } catch (err) {
    console.error('Failed to send welcome mail:', err);
  }
}

async function refreshMailbox() {
  if (!state.currentAddress) return;
  
  try {
    elements.refreshBtn.disabled = true;
    elements.refreshBtn.innerHTML = '<span>⏳</span> 更新中...';
    
    const res = await api.getMailbox(state.currentAddress);
    if (res.success) {
      // 既読状態を保持
      const readIds = new Set(state.mails.filter(m => m.read).map(m => m.id));
      state.mails = res.mails.map(m => ({
        ...m,
        read: readIds.has(m.id) || m.read
      }));
      renderMailList(state.mails);
    }
  } catch (err) {
    console.error('Failed to refresh mailbox:', err);
  } finally {
    elements.refreshBtn.disabled = false;
    elements.refreshBtn.innerHTML = '<span>🔄</span> 更新';
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
      showToast('メールを削除しました');
    }
  } catch (err) {
    console.error('Failed to delete mail:', err);
    showToast('削除に失敗しました', 'error');
  }
}

// ===== 自動更新 =====
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

// ===== イベントリスナー =====
function initEventListeners() {
  // コピーボタン
  elements.copyBtn.addEventListener('click', () => {
    if (state.currentAddress) {
      copyToClipboard(state.currentAddress);
    }
  });

  // 新しいアドレス
  elements.newAddressBtn.addEventListener('click', createNewAddress);

  // 更新ボタン
  elements.refreshBtn.addEventListener('click', refreshMailbox);

  // 自動更新トグル
  elements.autoRefreshToggle.addEventListener('change', (e) => {
    state.autoRefresh = e.target.checked;
    if (state.autoRefresh) {
      startAutoRefresh();
      showToast('自動更新をオンにしました');
    } else {
      stopAutoRefresh();
      showToast('自動更新をオフにしました');
    }
  });

  // モーダル
  elements.modalClose.addEventListener('click', closeMailModal);
  elements.modalCloseBtn.addEventListener('click', closeMailModal);
  elements.modalDelete.addEventListener('click', deleteCurrentMail);
  
  // モーダル外クリックで閉じる
  elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
      closeMailModal();
    }
  });

  // ESCキーでモーダルを閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
      closeMailModal();
    }
  });
}

// ===== 初期化 =====
async function init() {
  initEventListeners();
  
  // 保存されたアドレスを復元、なければ新規作成
  const savedAddress = loadSavedAddress();
  if (savedAddress) {
    updateAddressDisplay(savedAddress);
    await refreshMailbox();
  } else {
    await createNewAddress();
  }
  
  // 自動更新開始
  startAutoRefresh();
  
  console.log('🚀 Sutemeado initialized');
}

// DOMが準備できたら初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
