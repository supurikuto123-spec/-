/**
 * Sutemeado Common Functions
 * Lightweight i18n and drawer functionality for subpages
 */

// ===== i18n Translations =====
// app.js と重複を避けるため、既に定義されていればスキップ
if (typeof window.i18nCommon === 'undefined') {
  window.i18nCommon = {
  ja: {
    title: 'Sutemeado - シンプルな一時メール',
    description: '登録不要、パスワードでいつでもアクセスできる一時メールサービス',
    login: 'ログイン',
    newAddress: '新しいメールアドレスを作成',
    deleteAllMail: '全メール削除',
    deleteAddress: 'アドレスを削除',
    settings: '設定',
    apiDocs: 'API ドキュメント',
    termsOfService: '利用規約',
    privacyPolicy: 'プライバシー・クッキー',
    home: 'ホーム',
    howToUse: '使い方',
    status: '稼働状況',
    news: 'お知らせ',
    faq: 'よくある質問',
    contact: 'お問い合わせ',
    siteGuide: 'サイト案内',
    account: 'アカウント',
    dangerousOps: '危険な操作',
    others: 'その他',
    menu: 'メニュー',
    close: '閉じる',
    createAddress: 'アドレスを作成',
    loginWithAnother: '別アカウントでログイン'
  },
  en: {
    title: 'Sutemeado - Simple Temporary Email',
    description: 'No registration temporary email service. Access anytime with your password.',
    login: 'Login',
    newAddress: 'Create New Email Address',
    deleteAllMail: 'Delete All Emails',
    deleteAddress: 'Delete Address',
    settings: 'Settings',
    apiDocs: 'API Docs',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy & Cookies',
    home: 'Home',
    howToUse: 'How to Use',
    status: 'Status',
    news: 'News',
    faq: 'FAQ',
    contact: 'Contact',
    siteGuide: 'Site Guide',
    account: 'Account',
    dangerousOps: 'Dangerous Operations',
    others: 'Others',
    menu: 'Menu',
    close: 'Close',
    createAddress: 'Create Address',
    loginWithAnother: 'Login with Another Account'
  }
};
}



// State
const state = {
  currentLang: localStorage.getItem('sutemeado-lang') || 'ja',
  isLoggedIn: false
};

// Get translation
function t(key) {
  return window.i18nCommon[state.currentLang][key] || key;
}

// Update all i18n elements
function updateI18n(lang) {
  state.currentLang = lang;
  localStorage.setItem('sutemeado-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (window.i18nCommon[lang][key]) {
      if (el.tagName === 'TITLE') {
        document.title = window.i18nCommon[lang][key];
      } else {
        el.textContent = window.i18nCommon[lang][key];
      }
    }
  });

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && window.i18nCommon[lang].description) {
    metaDesc.content = window.i18nCommon[lang].description;
  }

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// Drawer functions
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

// Check login status and update drawer
function checkLoginStatus() {
  const loginInfo = localStorage.getItem('sutemeado-login');
  const loggedOutSection = document.getElementById('drawer-loggedout-section');
  const loggedInSection = document.getElementById('drawer-loggedin-section');

  if (loginInfo && loggedOutSection && loggedInSection) {
    state.isLoggedIn = true;
    loggedOutSection.style.display = 'none';
    loggedInSection.style.display = 'block';
  } else if (loggedOutSection && loggedInSection) {
    state.isLoggedIn = false;
    loggedOutSection.style.display = 'block';
    loggedInSection.style.display = 'none';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language
  updateI18n(state.currentLang);

  // Drawer toggle
  const menuToggle = document.getElementById('menu-toggle');
  const drawerClose = document.getElementById('drawer-close');
  const drawerOverlay = document.getElementById('drawer-overlay');

  if (menuToggle) {
    menuToggle.addEventListener('click', openDrawer);
  }
  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang && lang !== state.currentLang) {
        updateI18n(lang);
      }
    });
  });

  // Check login status
  checkLoginStatus();
});
