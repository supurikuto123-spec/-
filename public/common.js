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
    loginWithAnother: '別アカウントでログイン',
    // how-to-use.html content
    howToUseTitle: '使い方ガイド',
    howToUseIntro: 'Sutemeadoは、登録不要・パスワードでいつでもアクセスできるシンプルな一時メールサービスです。このガイドでは、初めての方でも簡単に使えるよう、ステップバイステップで使い方を説明します。',
    step1Title: 'サイトにアクセスする',
    step1Content: 'ブラウザ（Chrome、Safari、Edgeなど）で sutemeado.com にアクセスしてください。アクセスすると、自動的に新しい一時メールアドレスが生成されます。',
    step1Tip: 'ヒント： スマートフォン・タブレット・PCのどれからでも利用可能です。お好きな端末でご利用ください。',
    step2Title: 'メールアドレスをコピーする',
    step2Content: '画面上部に表示されている「あなたのアドレス」（例：xxxxxx@sutemeado.com）をコピーします。コピーボタン（📋アイコン）をクリックすると簡単にコピーできます。',
    step2Tip: '重要： パスワードも必ず保存してください！同じアドレスに再度アクセスするには、メールアドレスとパスワードの両方が必要です。',
    step3Title: 'メールアドレスを入力する',
    step3Content: '試したいサービスやフォームの「メールアドレス入力欄」に、先ほどコピーしたアドレスを貼り付けます。確認メールや認証コードを受信したいサービスで、このアドレスを使ってください。',
    step4Title: 'メールを待つ',
    step4Content: 'メールの送信元からメールが届くまで、数秒〜数分かかる場合があります。Sutemeadoでは受信ボックスが約5秒ごとに自動更新されるため、画面を開いたまま待っていれば、自動的にメールが表示されます。',
    step4Tip: '急ぐ場合： 「更新」ボタンをクリックすると、即座に最新の状態を確認できます。',
    step5Title: 'メールを開く',
    step5Content: '受信ボックスに届いたメールをクリックすると、本文が表示されます。認証コードやリンクを確認し、必要な操作を行ってください。',
    step5Tip: '注意： 一時メールは長期保存向けではありません。重要な情報は必ずコピーまたはスクリーンショットで保存してください。',
    usefulFeatures: '便利な機能',
    featurePassword: 'パスワード保護',
    featurePasswordDesc: '各メールアドレスには固有のパスワードが設定されます。ブラウザを変えても、メールアドレスとパスワードがあればどこからでもアクセスできます。',
    featureAutoRefresh: '自動更新',
    featureAutoRefreshDesc: '受信ボックスは約5秒ごとに自動更新されます。手動でリロードする必要なく、新着メールをリアルタイムに確認できます。',
    featureCopy: 'ワンクリックコピー',
    featureCopyDesc: 'メールアドレスとパスワードは、コピーボタンをワンクリックで簡単にコピーできます。手入力の間違いを防げます。',
    featureChangePass: 'パスワード変更',
    featureChangePassDesc: 'いつでもパスワードを変更できます。より強固なパスワードに変更して、セキュリティを向上させることも可能です。',
    featureDeleteMail: 'メール削除',
    featureDeleteMailDesc: '不要なメールは個別に削除可能です。また、「全メール削除」機能で受信ボックスを一度に空にすることもできます。',
    featureNewAddress: '新規アドレス作成',
    featureNewAddressDesc: 'いつでも新しいメールアドレスを作成できます。古いアドレスを削除せずに、新しいアドレスを追加することも可能です。',
    apiUsage: 'APIの活用方法',
    apiDesc: 'Sutemeadoは開発者・テスター向けにAPIを提供しています。プログラムから一時メールアドレスを操作することで、自動化テストや開発作業を効率化できます。',
    apiNote: '詳細はトップページの「API」メニューからご確認ください。',
    menuUsage: 'メニューの使い方',
    menuDesc: '画面右上のハンバーガーメニュー（三本線のアイコン）をクリックすると、各種機能にアクセスできます：',
    menuItemLogin: 'ログイン： 既存のアドレスにパスワードでアクセス',
    menuItemNew: '新しいメールアドレスを作成： 新規アドレスを発行',
    menuItemDeleteAll: '全メール削除： 受信ボックスを空にする',
    menuItemDeleteAddr: 'アドレスを削除： このアドレス自体を削除',
    menuItemAPI: 'APIドキュメント： APIの詳細仕様を確認',
    menuItemSettings: '設定： テーマ（ライト/ダーク）の切り替え',
    menuItemStatus: '稼働状況： サービスの稼働状況を確認',
    menuItemNews: 'お知らせ： 最新のニュースとお知らせ',
    menuItemFAQ: 'よくある質問： 詳細なFAQを確認',
    ctaTitle: 'さっそく使ってみましょう',
    ctaText: 'Sutemeadoは登録不要ですぐに使えます。迷惑メールを避けて、プライバシーを守りましょう。',
    toTopPage: 'トップページへ',
    // faq.html content
    faqTitle: 'よくある質問',
    faqIntro: 'このページでは、Sutemeado（ステメアド）が提供する「一時メールアドレス（使い捨てメール・捨てメアド）」サービスについて、仕組み・使い方・安全性・保存期間などを掲載しています。一般的なユーザーから、Webエンジニア・アプリ開発者・テスターなど「一時メールを使いこなしたい人」向けの内容までカバーしています。',
    faqToc: '目次',
    // TOC
    tocTitle: '目次',
    tocAbout: 'サービス全体について',
    tocHowTo: '使い方・基本仕様・挙動',
    tocSecurity: 'セキュリティ・プライバシー・匿名性',
    tocLifetime: '保存期間・有効期限・データ削除',
    tocUsage: 'おすすめの使い方・NGな使い方',
    tocTrouble: 'メールが届かない／表示がおかしい',
    tocDev: '開発者・テスター向けの利用',
    tocLegal: '法的な観点・禁止事項・免責事項',
    // Section titles
    secWhatTitle: 'サービス全体について（概要・特徴・他サービスとの違い）',
    secHowTitle: '使い方・基本仕様・挙動',
    secSecurityTitle: 'セキュリティ・プライバシー・匿名性',
    secLifetimeTitle: '保存期間・有効期限・データ削除について',
    secUsageTitle: 'おすすめの使い方・NGな使い方・ユースケース集',
    secTroubleTitle: 'メールが届かない／表示がおかしいときの対処',
    secDevTitle: '開発者・テスター向けの利用に関する質問',
    secLegalTitle: '法的な観点・禁止事項・免責事項',
    // CTA
    contactCtaTitle: 'さらに質問がありますか？',
    contactCtaText: 'お問い合わせはInstagram DMからお気軽にどうぞ',
    contactCtaBtn: '@not_rare.tar にDMする',
    // Common
    backBtn: '戻る',
    // Terms page
    termsDate: '制定日：2026年3月25日　|　最終更新日：2026年3月25日',
    // Privacy page
    privacyDate: '制定日：2026年3月25日　|　最終更新日：2026年3月25日　|　適用範囲：日本およびEU/EEA地域'
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
    loginWithAnother: 'Login with Another Account',
    // how-to-use.html content
    howToUseTitle: 'How to Use Guide',
    howToUseIntro: 'Sutemeado is a simple temporary email service that requires no registration and can be accessed anytime with a password. This guide provides step-by-step instructions for first-time users.',
    step1Title: 'Access the Site',
    step1Content: 'Open your browser (Chrome, Safari, Edge, etc.) and go to sutemeado.com. A new temporary email address will be generated automatically when you access the site.',
    step1Tip: 'Tip: You can use it from any device - smartphone, tablet, or PC. Use your preferred device.',
    step2Title: 'Copy the Email Address',
    step2Content: 'Copy the "Your Address" displayed at the top of the screen (e.g., xxxxxx@sutemeado.com). Click the copy button (📋 icon) to easily copy it.',
    step2Tip: 'Important: Be sure to save your password! Both the email address and password are required to access the same address again.',
    step3Title: 'Enter the Email Address',
    step3Content: 'Paste the copied address into the "Email Address" field of the service or form you want to try. Use this address for services where you want to receive confirmation emails or verification codes.',
    step4Title: 'Wait for Email',
    step4Content: 'It may take a few seconds to a few minutes for emails to arrive from the sender. Sutemeado automatically refreshes the inbox approximately every 5 seconds, so just keep the screen open and emails will appear automatically.',
    step4Tip: 'In a hurry: Click the "Refresh" button to immediately check for the latest status.',
    step5Title: 'Open the Email',
    step5Content: 'Click on an email in the inbox to view its contents. Check the verification code or link and perform the necessary actions.',
    step5Tip: 'Note: Temporary email is not for long-term storage. Always copy or take a screenshot of important information.',
    usefulFeatures: 'Useful Features',
    featurePassword: 'Password Protection',
    featurePasswordDesc: 'Each email address has a unique password set. Even if you change browsers, you can access your email from anywhere with the email address and password.',
    featureAutoRefresh: 'Auto Refresh',
    featureAutoRefreshDesc: 'The inbox automatically refreshes approximately every 5 seconds. Check new emails in real-time without manually reloading.',
    featureCopy: 'One-Click Copy',
    featureCopyDesc: 'Email addresses and passwords can be easily copied with one click of the copy button. Prevents typing errors.',
    featureChangePass: 'Password Change',
    featureChangePassDesc: 'You can change your password anytime. You can also change to a stronger password to improve security.',
    featureDeleteMail: 'Delete Emails',
    featureDeleteMailDesc: 'Unnecessary emails can be deleted individually. You can also empty the inbox at once with the "Delete All Emails" feature.',
    featureNewAddress: 'Create New Address',
    featureNewAddressDesc: 'You can create a new email address anytime. You can also add new addresses without deleting old ones.',
    apiUsage: 'API Usage',
    apiDesc: 'Sutemeado provides an API for developers and testers. Automate tests and streamline development work by operating temporary email addresses from your programs.',
    apiNote: 'For details, please check the "API" menu on the top page.',
    menuUsage: 'How to Use the Menu',
    menuDesc: 'Click the hamburger menu (three-line icon) at the top right of the screen to access various features:',
    menuItemLogin: 'Login: Access existing address with password',
    menuItemNew: 'Create New Email Address: Issue a new address',
    menuItemDeleteAll: 'Delete All Emails: Empty the inbox',
    menuItemDeleteAddr: 'Delete Address: Delete this address itself',
    menuItemAPI: 'API Docs: Check detailed API specifications',
    menuItemSettings: 'Settings: Switch theme (Light/Dark)',
    menuItemStatus: 'Status: Check service operational status',
    menuItemNews: 'News: Latest news and announcements',
    menuItemFAQ: 'FAQ: Check detailed FAQ',
    ctaTitle: 'Start Using Now',
    ctaText: 'Sutemeado is ready to use immediately with no registration required. Avoid spam and protect your privacy.',
    toTopPage: 'To Top Page',
    // faq.html content
    faqTitle: 'FAQ',
    faqIntro: 'This page covers how Sutemeado temporary email service works, how to use it, security, storage period, and more. Content covers general users to web engineers, app developers, and testers who want to master temporary email.',
    faqToc: 'Table of Contents',
    // TOC
    tocTitle: 'Table of Contents',
    tocAbout: 'About the Service',
    tocHowTo: 'How to Use & Basic Specifications',
    tocSecurity: 'Security, Privacy & Anonymity',
    tocLifetime: 'Storage Period, Expiration & Data Deletion',
    tocUsage: 'Recommended & Not Recommended Usage',
    tocTrouble: 'Email Not Arriving / Display Issues',
    tocDev: 'For Developers & Testers',
    tocLegal: 'Legal Aspects, Prohibited Items & Disclaimer',
    // Section titles
    secWhatTitle: 'About the Service (Overview, Features, Differences from Other Services)',
    secHowTitle: 'How to Use & Basic Specifications',
    secSecurityTitle: 'Security, Privacy & Anonymity',
    secLifetimeTitle: 'Storage Period, Expiration & Data Deletion',
    secUsageTitle: 'Recommended Usage, Not Recommended Usage & Use Cases',
    secTroubleTitle: 'When Email Does Not Arrive / Display Issues',
    secDevTitle: 'Questions About Usage for Developers & Testers',
    secLegalTitle: 'Legal Aspects, Prohibited Items & Disclaimer',
    // CTA
    contactCtaTitle: 'Have More Questions?',
    contactCtaText: 'Feel free to contact us via Instagram DM',
    contactCtaBtn: 'DM @not_rare.tar',
    // Common
    backBtn: 'Back',
    // Terms page
    termsDate: 'Effective: March 25, 2026 | Last Updated: March 25, 2026',
    // Privacy page
    privacyDate: 'Effective: March 25, 2026 | Last Updated: March 25, 2026 | Applies to: Japan and EU/EEA Regions'
  }
};
}



// State
var state = {
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
