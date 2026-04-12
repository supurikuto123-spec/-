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
    privacyDate: '制定日：2026年3月25日　|　最終更新日：2026年3月25日　|　適用範囲：日本およびEU/EEA地域',
    // news.html
    newsItem1Date: '2026年4月8日',
    newsItem2Date: '2026年3月27日',
    newsItem2Badge: 'リリース',
    newsItem2Title: 'Sutemeado サービス開始',
    newsItem2Text1: 'Sutemeado（捨てメアド）がサービスを開始しました。',
    newsItem2Text2: '登録不要で簡単に使い捨てのメールアドレスが作成できる、プライバシー重視の一時メールサービスです。',
    newsItem2Text3: '今後ともSutemeadoをよろしくお願いいたします。',
    // contact.html
    contactTitle: 'お問い合わせ',
    contactIntro: 'Sutemeadoに関するご質問・ご意見・不具合報告などがございましたら、以下の方法でご連絡ください。',
    contactSectionTitle: 'お問い合わせ方法',
    contactMethod1Label: 'Instagram DM',
    contactMethod1Value: '@not_rare.tar へのダイレクトメッセージでお問い合わせください',
    contactMethod1Link: '@not_rare.tar を開く',
    contactDisclaimerTitle: '注意事項',
    contactDisclaimerText: '・お問い合わせ対応はベストエフォートで行っており、返答を保証するものではありません\n・迷惑行為や業務妨害となるお問い合わせはお控えください',
    contactFooter: '© 2026 Sutemeado - ステメアド',
    // status.html
    statusPageTitle: '稼働状況',
    lastUpdatedPrefix: '最終更新:',
    loadingText: '読み込み中...',
    refreshBtn: '最新情報を更新',
    statusCardMailTitle: 'メール受信サービス',
    statusCardAddressLabel: '作成アドレス',
    statusCardSmtpTitle: 'SMTPサーバー',
    statusCardMailLabel: '受信メール',
    statusUptimeSectionTitle: 'システム稼働率（過去24時間）',
    statusWebServerLabel: 'Webサーバー',
    statusSmtpLabel: 'SMTPサーバー (ポート2525)',
    statusDbLabel: 'データベース',
    statusApiLabel: 'APIエンドポイント',
    statusMeasuring: '計測中...',
    statusUptimeNote: '※ 稼働率は過去24時間の測定値に基づく実測値です。5分間隔で状態をチェックし記録しています。',
    statusInfoSectionTitle: 'システム情報',
    statusUptimeLabel: 'サービス稼働時間',
    statusResponseTimeLabel: 'APIレスポンス時間',
    statusFooter1: '© 2026 Sutemeado - ステメアド',
    statusFooter2: 'システム状態は2分間隔で自動更新されます',
    // blog.html translations
    blogLoading: '記事を読み込み中...',
    blogNoArticles: '記事がありません',
    blogError: '記事の読み込みに失敗しました。時間をおいて再度お試しください。'
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
    privacyDate: 'Effective: March 25, 2026 | Last Updated: March 25, 2026 | Applies to: Japan and EU/EEA Regions',
    // news.html
    newsItem1Date: 'April 8, 2026',
    newsItem2Date: 'March 27, 2026',
    newsItem2Badge: 'RELEASE',
    newsItem2Title: 'Sutemeado Service Launch',
    newsItem2Text1: 'Sutemeado (Disposable Email) has launched its service.',
    newsItem2Text2: 'A privacy-focused temporary email service where you can easily create disposable email addresses without registration.',
    newsItem2Text3: 'Thank you for using Sutemeado.',
    // contact.html
    contactTitle: 'Contact Us',
    contactIntro: 'If you have questions, opinions, or bug reports about Sutemeado, please contact us using the method below.',
    contactSectionTitle: 'Contact Method',
    contactMethod1Label: 'Instagram DM',
    contactMethod1Value: 'Please contact us via direct message to @not_rare.tar',
    contactMethod1Link: 'Open @not_rare.tar',
    contactDisclaimerTitle: 'Important Notes',
    contactDisclaimerText: '・Support is provided on a best-effort basis and responses are not guaranteed.\n・Please refrain from inquiries that constitute harassment or obstruction of business.',
    contactFooter: '© 2026 Sutemeado',
    // status.html
    statusPageTitle: 'Service Status',
    lastUpdatedPrefix: 'Last Updated:',
    loadingText: 'Loading...',
    refreshBtn: 'Refresh Latest Info',
    statusCardMailTitle: 'Mail Reception Service',
    statusCardAddressLabel: 'Created Addresses',
    statusCardSmtpTitle: 'SMTP Server',
    statusCardMailLabel: 'Received Emails',
    statusUptimeSectionTitle: 'System Uptime (Past 24 Hours)',
    statusWebServerLabel: 'Web Server',
    statusSmtpLabel: 'SMTP Server (Port 2525)',
    statusDbLabel: 'Database',
    statusApiLabel: 'API Endpoint',
    statusMeasuring: 'Measuring...',
    statusUptimeNote: '※ Uptime is based on actual measurements over the past 24 hours. Status is checked and recorded at 5-minute intervals.',
    statusInfoSectionTitle: 'System Information',
    statusUptimeLabel: 'Service Uptime',
    statusResponseTimeLabel: 'API Response Time',
    statusFooter1: '© 2026 Sutemeado',
    statusFooter2: 'System status automatically updates every 2 minutes',
    // blog.html translations
    blogTitle: 'Sutemeado Blog',
    blogSubtitle: 'Latest updates, usage guides, and email security tips',
    blogLoading: 'Loading articles...',
    blogError: 'Failed to load articles. Please try again later.',
    blogNoArticles: 'No articles found.',
    blogPopularPosts: 'Popular Posts',
    blogCategories: 'Categories',
    blogAboutTitle: 'About Sutemeado',
    blogAboutText: 'Sutemeado is a disposable email service that requires no registration. Protect your privacy and avoid spam.',
    blogUseService: 'Use the service →',
    blogAdvertisement: 'Advertisement',
    // news.html - additional translations for dates
    newsItem1Date: 'April 8, 2026',
    newsItem1Badge: 'NOTICE',
    newsItem1Title: 'Service Maintenance Notice',
    newsItem1Text1: 'Thank you for using Sutemeado.',
    newsItem1Text2: 'We are currently making frequent updates as we adjust the service.',
    newsItem1Text3: 'Therefore, you may experience temporary connection issues or bugs.',
    newsItem1Text4: 'We appreciate your understanding.',
    newsItem1Text5: 'If you have any questions, please contact us via the contact page.',
    // faq.html - full Q&A translations
    faqQ1: 'What is a temporary/disposable email address?',
    faqA1: 'A temporary or disposable email address is an email address that can be used for a certain period and then discarded. With Sutemeado, simply visiting the site in your browser generates a random mailbox ID, and a temporary email address in the format xxxxxx@sutemeado.com is automatically assigned. It is specialized for receiving emails and requires no personal information such as registration, real name, or phone number.',
    faqQ2: 'Why do many people use temporary email (Sutemeado)?',
    faqA2: 'Temporary email is often used in situations where you don\'t want to expose your real email address too much. For example: overseas services you just want to try, sites with unclear trustworthiness, or forms where entering an email might result in a flood of advertising emails. Using temporary email for these purposes allows you to test services without leaving a lasting trace.',
    faqQ3: 'What are the features of Sutemeado?',
    faqA3: 'Sutemeado is a temporary email reception service that emphasizes simplicity and speed. The design is minimal, displaying your temporary email address immediately after page load. You can access it anytime with a password, even from different browsers. There are no forced ad clicks or unnecessary screen transitions that would compromise the user experience.',
    faqQ4: 'Is it free? Will it become paid in the future?',
    faqA4: 'Currently, Sutemeado is completely free to use, with no registration fees or monthly charges. While operational costs for service continuity may be covered by advertising revenue, there are no plans to make it a service where payment is mandatory for basic functionality.',
    faqQ5: 'Can I use it from mobile/smartphone? Is it PC-only?',
    faqA5: 'It is available from smartphones, tablets, and PCs. Simply open sutemeado.com in your browser (Chrome, Safari, Edge, etc.) to use the temporary email address regardless of device or OS.',
    faqQ6: 'What is the basic flow of usage?',
    faqA6: 'The general usage flow is: 1) Visit sutemeado.com in your browser, 2) Copy the displayed temporary email address, 3) Paste it into the email field of the service or form you want to try, 4) Wait a few seconds to minutes for the email to arrive, 5) Click on the received email to view its contents.',
    faqQ7: 'Does the email address change every time? Can I keep using the same address?',
    faqA7: 'Yes, you can continue using the same address. Sutemeado uses a password-based access system, so you can access your mailbox from anywhere, regardless of browser cookies or device.',
    faqQ8: 'How often are emails automatically updated?',
    faqA8: 'The inbox automatically refreshes approximately every 5 seconds. Therefore, if you keep the screen open, new emails will appear in near real-time without any action required.',
    faqQ9: 'Can I receive emails with attachments?',
    faqA9: 'Emails with attachments can be received, but depending on the file type, size, or sender specifications, they may not open correctly or download properly. Be especially careful with executable files (.exe, etc.) which may pose security risks.',
    faqQ10: 'Are Japanese and HTML emails supported?',
    faqA10: 'Japanese text emails and general HTML emails are supported, but some emails with client-specific decorations or script-dependent layouts may display incorrectly.',
    faqQ11: 'Is there a sending function?',
    faqA11: 'Currently, Sutemeado is a receive-only temporary email service. To prevent misuse such as sending spam or impersonation, we do not provide functionality to send emails from temporary addresses.',
    faqQ12: 'Is Sutemeado safe? Does it support HTTPS?',
    faqA12: 'Sutemeado supports HTTPS (TLS) encrypted communication, protecting data transmitted between your browser and our servers from being read by third parties. However, please note that email systems on the internet are inherently like postcards and not all routing is fully encrypted.',
    faqQ13: 'How much anonymity is guaranteed?',
    faqA13: 'Temporary email prioritizes email address anonymity. No real name, phone number, or address is required for registration—simply accessing the browser is enough. However, minimal technical information such as IP addresses and access logs may be temporarily recorded on servers, as with most web services.',
    faqQ14: 'Can others see my emails?',
    faqA14: 'If someone knows both your email address and password, they could potentially access your inbox. Sutemeado mitigates this by requiring both a random string address and a set password.',
    faqQ15: 'Can I use it for important accounts (banks, main SNS)?',
    faqA15: 'We do not recommend using temporary email for important accounts that require password resets. If you cannot access the mailbox later or emails expire, account recovery may become difficult.',
    faqQ16: 'What about spam or dangerous links?',
    faqA16: 'Even with temporary email, the safety of received emails is not guaranteed. Whether to open suspicious links or attachments is ultimately the user\'s own judgment.',
    faqQ17: 'How long are emails stored?',
    faqA17: 'Emails are stored for 30 days. Saved emails are kept for 30 days, while unsaved emails are automatically deleted 30 days after receipt.',
    faqQ18: 'Can deleted emails be restored?',
    faqA18: 'Once deleted, emails cannot be restored. We do not provide individual email recovery from backups due to the nature of temporary email services.',
    faqQ19: 'Does the address itself have an expiration?',
    faqA19: 'The email address itself can be accessed anytime as long as you know the password. However, addresses that have not received emails for over 30 days may be deleted for system load reduction.',
    faqQ20: 'Recommended usage for general users',
    faqA20: 'Recommended uses include: trial registration for services you\'re curious about but don\'t fully trust, newsletter or campaign registrations you can easily unsubscribe from, downloading files that require email addresses, and receiving coupons.',
    faqQ21: 'Recommended usage for developers/testers',
    faqA21: 'For developers and testers, temporary email is very convenient for: testing registration emails, password resets, and notification emails in web apps; checking email template display issues; viewing multilingual emails; and as a destination for test deliveries from staging or local environments.',
    faqQ22: 'Usage examples to avoid (NG)',
    faqA22: 'Cases where temporary email is not suitable include: bank or securities account registrations, main SNS account registrations, services requiring ID verification, and subscriptions or important notifications that require long-term contact.',
    faqQ23: 'Can I use it for receiving authentication codes (one-time passwords)?',
    faqA23: 'While technically possible, temporary email is not suitable for checking login credentials or codes again later. Some services also block disposable email domains entirely.',
    faqQ24: 'What to check when emails don\'t arrive',
    faqA24: 'When emails don\'t arrive, check: whether there are extra spaces or line breaks when copying the address, if the destination address is correct, if the sender blocks temporary emails including sutemeado.com, and if enough time has passed (try the refresh button).',
    faqQ25: 'The email body is blank. Is it broken?',
    faqA25: 'For HTML emails, external images or stylesheets may be blocked, or layouts dependent on JavaScript may cause display issues. Some emails from Outlook or proprietary services may appear blank or broken.',
    faqQ26: 'Display is broken on smartphone',
    faqA26: 'If the smartphone screen is extremely narrow or font auto-enlargement is enabled, the body may become difficult to read. Try using your browser\'s "View desktop site" feature.',
    faqQ27: 'Can I use it for email sending tests in web apps?',
    faqA27: 'Yes, usage for testing purposes is welcome. Please use it to check registration emails, password reset emails, and notification emails. However, mass sending or spam-like behavior is prohibited.',
    faqQ28: 'Is there an API? I want to integrate it into automated tests',
    faqA28: 'Yes, we provide an API. Please check the "API" menu on the top page for details. You can also use E2E tests via browser to retrieve displayed emails.',
    faqQ29: 'Can I use it for load testing or mass email sending tests?',
    faqA29: 'Please refrain from using it for load testing purposes involving mass email sending. To ensure stable operation of the service, excessive load may result in temporary restrictions or access blocks.',
    faqQ30: 'Can it be used for illegal activities or harassment?',
    faqA30: 'Use of Sutemeado or any temporary email service for illegal activities, harassment, or nuisance is strictly prohibited. In response to legal requests, we may cooperate with relevant authorities.',
    faqQ31: 'Who is responsible for troubles caused by service use?',
    faqA31: 'Sutemeado is provided "as is" and we are not responsible for damages or troubles caused by use of the service. Please understand the risks of data loss and email non-delivery inherent to temporary email services.',
    faqHintSavePassword: 'Tip: Be sure to save your password. Both the email address and password are required to access the same address again.',
    faqWarningImportant: 'Important: For highly confidential information exchange, consider using encrypted email or PGP instead of temporary email.',
    faqWarningPersonal: 'Warning: We strongly recommend not receiving personal information, real names, addresses, or credit card information via temporary email.',
    faqWarningFinancial: 'Warning: Using temporary email for these purposes may lead to trouble such as "cannot view emails" or "cannot reset password."',
    faqTipSuspicious: 'Tip: We recommend ignoring emails from clearly suspicious senders or titles without opening them.',
    faqTipSaveImportant: 'Tip: Be sure to press the "Save" button for important emails to ensure 30-day retention. Unsaved emails are automatically deleted after 30 days and cannot be restored.',
    faqTipKeepAddress: 'Tip: To maintain your address, receive at least one email within 30 days.',
    // terms.html - full terms translations
    termsTitle: 'Terms of Service',
    termsIntro: 'These Terms of Service (hereinafter referred to as "these Terms") define the rights and obligations between the operator (hereinafter referred to as "the Operator") providing Sutemeado (hereinafter referred to as "this Service"), and users (hereinafter referred to as "the User") of this Service. By using this Service, you agree to these Terms.',
    termsDateLabel: 'Effective:',
    termsLastUpdated: 'Last Updated:',
    termsArticle1Title: 'Article 1 (Scope of Application)',
    termsArticle1_1: 'These Terms apply to all relationships between the Operator and the User regarding use of this Service.',
    termsArticle1_2: 'The Operator may establish individual provisions (hereinafter referred to as "Individual Provisions") regarding use of this Service. Individual Provisions constitute part of these Terms.',
    termsArticle1_3: 'In case of conflict between provisions of these Terms and Individual Provisions, Individual Provisions shall prevail.',
    termsArticle2Title: 'Article 2 (Service Overview)',
    termsArticle2_1: 'This Service provides users with issuance of temporary email addresses (hereinafter referred to as "temporary address") and email reception functionality.',
    termsArticle2_2: 'This Service can be used without registration and can be accessed anytime with password authentication.',
    termsArticle2_3: 'This Service is provided free of charge and is operated through advertising revenue.',
    termsArticle3Title: 'Article 3 (Eligibility)',
    termsArticle3_1: 'Users shall use this Service after agreeing to these Terms.',
    termsArticle3_2: 'Users shall prepare their own internet connection environment at their own responsibility when using this Service.',
    termsArticle3_3: 'Minors using this Service must obtain consent from a parent or legal guardian.',
    termsArticle4Title: 'Article 4 (Password Management)',
    termsArticle4_1: 'Passwords for accessing temporary addresses issued by this Service shall be managed by the user.',
    termsArticle4_2: 'If access to an address becomes impossible due to lost or forgotten passwords, the Operator does not guarantee recovery.',
    termsArticle4_3: 'Users shall take care not to leak passwords to third parties and are encouraged to change them regularly.',
    termsArticle5Title: 'Article 5 (Prohibited Acts)',
    termsArticle5Intro: 'Users shall not engage in the following acts when using this Service:',
    termsArticle5_1: 'Acts violating laws or public order and morals',
    termsArticle5_2: 'Acts related to criminal acts or acts that may be related to crimes',
    termsArticle5_3: 'Acts infringing intellectual property rights, portrait rights, privacy, honor, or other rights or interests of the Operator, other users, or third parties',
    termsArticle5_4: 'Acts destroying or interfering with the functions of this Service\'s servers or networks',
    termsArticle5_5: 'Acts reverse engineering, disassembling, or decompiling this Service',
    termsArticle5_6: 'Acts using this Service for commercial purposes (except when approved by the Operator)',
    termsArticle5_7: 'Spam acts sending mass emails or acts supporting such acts',
    termsArticle5_8: 'Use for the purpose of receiving spam emails',
    termsArticle5_9: 'Acts attempting unauthorized access to other users\' addresses',
    termsArticle5_10: 'Acts interfering with operation of this Service',
    termsArticle5_11: 'Other acts deemed inappropriate by the Operator',
    termsArticle6Title: 'Article 6 (Email Storage Period and Deletion)',
    termsArticle6_1: 'Received emails are stored for 30 days from receipt and then automatically deleted.',
    termsArticle6_2: 'Users can manually delete emails at any time.',
    termsArticle6_3: 'When an address is deleted, all emails associated with that address are also deleted simultaneously.',
    termsArticle6_4: 'Even if emails are lost due to system maintenance or failures, the Operator has no obligation to recover them.',
    termsArticle7Title: 'Article 7 (Service Changes, Interruptions, and Termination)',
    termsArticle7_1: 'The Operator may change, add, or discontinue content of this Service without prior notice to users.',
    termsArticle7_2: 'The Operator may interrupt all or part of this Service without prior notice to users in the following cases:',
    termsArticle7_2_1: 'When performing system maintenance or updates',
    termsArticle7_2_2: 'When provision of this Service becomes difficult due to force majeure such as natural disasters',
    termsArticle7_2_3: 'When provision of this Service becomes difficult due to server, communication line failures, or unauthorized access',
    termsArticle7_2_4: 'Other cases where the Operator deems interruption necessary',
    termsArticle7_3: 'When terminating this Service, the Operator shall notify users with reasonable advance notice.',
    termsArticle7_4: 'The Operator bears no responsibility for damages caused to users due to changes, interruptions, or termination under this article.',
    termsArticle8Title: 'Article 8 (Advertisement Display)',
    termsArticle8_1: 'This Service may display advertisements through third-party advertising networks such as Google AdSense.',
    termsArticle8_2: 'Users shall use this Service on the condition of viewing advertisements.',
    termsArticle8_3: 'Regarding advertisement content, the advertiser is responsible, and the Operator does not guarantee accuracy, legality, etc.',
    termsArticle8_4: 'The Operator is not involved in and bears no responsibility for transactions between users and advertisers resulting from ad clicks.',
    termsArticle9Title: 'Article 9 (Disclaimer)',
    termsArticle9_1: 'The Operator does not explicitly or implicitly guarantee accuracy, completeness, usefulness, fitness for particular purpose, security, etc. of this Service content.',
    termsArticle9_2: 'The Operator bears no responsibility for damages caused to users through use of this Service (including data loss, lost profits, business interruption, etc.), except where the Operator has intentional or gross negligence.',
    termsArticle9_3: 'The Operator bears no responsibility for disputes arising between users and other users or third parties.',
    termsArticle9_4: 'The Operator does not guarantee truthfulness, legality, appropriateness, etc. of email content received through this Service.',
    termsArticle10Title: 'Article 10 (Intellectual Property Rights)',
    termsArticle10_1: 'Copyrights, trademark rights, and other intellectual property rights related to this Service belong to the Operator or legitimate rights holders.',
    termsArticle10_2: 'Users do not acquire these rights by using this Service.',
    termsArticle10_3: 'Copyrights of information sent by users to this Service belong to users, but the Operator may use this within the scope necessary for operation and improvement of this Service.',
    termsArticle11Title: 'Article 11 (Changes to Terms)',
    termsArticle11_1: 'The Operator may change these Terms without prior notice to users when deemed necessary.',
    termsArticle11_2: 'Changed Terms shall take effect when posted on this Service.',
    termsArticle11_3: 'If users use this Service after changes to these Terms, they are deemed to have agreed to the changed Terms.',
    termsArticle12Title: 'Article 12 (Handling of Personal Information)',
    termsArticle12_1: 'Handling of personal information in this Service shall follow the Privacy Policy separately established.',
    termsArticle13Title: 'Article 13 (Governing Law and Jurisdiction)',
    termsArticle13_1: 'Japanese law shall be the governing law for interpretation of these Terms.',
    termsArticle13_2: 'For disputes regarding this Service, the court with jurisdiction over the Operator\'s location shall be the court of first instance with exclusive jurisdiction.',
    termsArticle14Title: 'Article 14 (Severability)',
    termsArticle14_1: 'Even if any provision of these Terms is deemed invalid or unenforceable, remaining provisions shall remain in effect.',
    termsArticle15Title: 'Article 15 (Contact)',
    termsArticle15_1: 'Inquiries regarding these Terms should be made through the contact form or methods specified by the Operator.',
    // privacy.html - full privacy policy translations
    privacyTitle: 'Privacy & Cookie Policy',
    privacyIntro: 'Sutemeado (hereinafter referred to as "this Service") respects user privacy and takes utmost care in protecting personal information. This policy explains handling of personal information and cookies in this Service.',
    privacyArticle1Title: 'Article 1 (Definition of Personal Information)',
    privacyArticle1_1: '"Personal Information" in this policy refers to "personal information" as defined in the Act on the Protection of Personal Information, and means information about living individuals that can identify specific individuals through names, dates of birth, addresses, phone numbers, contact information, or other descriptions contained in such information.',
    privacyArticle2Title: 'Article 2 (Collected Information)',
    privacyArticle2Intro: 'This Service may collect the following information:',
    privacyArticle2_1Title: '2.1 Information Directly Provided by Users',
    privacyArticle2_1_1: 'Password: Password set for accessing temporary addresses (stored encrypted)',
    privacyArticle2_1_2: 'Email Content: Sender, subject, body, and attachment file information of emails received at temporary addresses',
    privacyArticle2_2Title: '2.2 Automatically Collected Information',
    privacyArticle2_2_1: 'Access Logs: IP addresses, browser types, referrers, access dates and times',
    privacyArticle2_2_2: 'Device Information: Device types, OS, screen sizes',
    privacyArticle2_2_3: 'Cookies and Similar Technologies: See the cookie policy described later',
    privacyArticle2_3Title: '2.3 Information Not Collected',
    privacyArticle2_3_1: 'Names, addresses, phone numbers, or other information that can identify individuals (except passwords)',
    privacyArticle2_3_2: 'Credit card or other payment information',
    privacyArticle2_3_3: 'Date of birth, gender, or other attribute information',
    privacyArticle3Title: 'Article 3 (Purpose of Information Use)',
    privacyArticle3Intro: 'Collected information is used for the following purposes:',
    privacyArticle3_1: 'Provision and operation of this Service',
    privacyArticle3_2: 'User authentication and account management',
    privacyArticle3_3: 'Improvement of this Service and development of new features',
    privacyArticle3_4: 'Prevention and investigation of unauthorized access or misuse',
    privacyArticle3_5: 'System maintenance and troubleshooting',
    privacyArticle3_6: 'Advertising delivery and effectiveness measurement',
    privacyArticle3_7: 'Creation and analysis of statistical information',
    privacyArticle3_8: 'Compliance with laws and regulations',
    privacyArticle4Title: 'Article 4 (Information Storage Period)',
    privacyArticle4_1: 'Received Emails: Stored for 30 days from receipt, then automatically deleted',
    privacyArticle4_2: 'Access Logs: Stored for 90 days from collection',
    privacyArticle4_3: 'Cookies: 1 day to 2 years depending on type',
    privacyArticle4_4: 'When users delete addresses, all related data is immediately deleted',
    privacyArticle5Title: 'Article 5 (Third-Party Disclosure)',
    privacyArticle5Intro: 'The Operator does not provide users\' personal information to third parties except in the following cases:',
    privacyArticle5_1: 'When there is user consent',
    privacyArticle5_2: 'When disclosure is required by law',
    privacyArticle5_3: 'When necessary to protect human life, body, or property',
    privacyArticle5_4: 'When particularly necessary for improving public health or promoting healthy development of children',
    privacyArticle5_5: 'When national agencies or local governments or their entrusted parties need cooperation in performing affairs prescribed by law',
    privacyArticle6Title: 'Article 6 (About Advertising)',
    privacyArticle6_1: 'This Service displays advertisements through third-party ad delivery providers such as Google AdSense. These ad delivery providers may use cookies to display ads according to user interests.',
    privacyArticle6_2: 'Google AdSense / Google LLC',
    privacyArticle6_3: 'Google Analytics',
    privacyArticle6_4: 'Users can disable personalized ads through Google Ad Settings.',
    privacyArticle7Title: 'Article 7 (Cookie Policy)',
    privacyArticle7_1Title: '7.1 What are Cookies',
    privacyArticle7_1: 'Cookies are small text files that websites save to users\' devices through browsers. Cookies allow websites to remember user settings and past actions to provide more convenient services.',
    privacyArticle7_2Title: '7.2 Types of Cookies Used',
    privacyCookieType: 'Type',
    privacyCookiePurpose: 'Purpose',
    privacyCookieDuration: 'Duration',
    privacyCookieEssential: 'Essential Cookies',
    privacyCookieEssentialDesc: 'Provide basic service functionality (login status maintenance, language settings, theme settings)',
    privacyCookieEssentialDuration: '30 days',
    privacyCookieAnalytics: 'Analytics & Performance Cookies',
    privacyCookieAnalyticsDesc: 'Usage analysis by Google Analytics, service improvement',
    privacyCookieAnalyticsDuration: '2 years',
    privacyCookieAdvertising: 'Advertising & Targeting Cookies',
    privacyCookieAdvertisingDesc: 'Appropriate ad delivery by Google AdSense, effectiveness measurement',
    privacyCookieAdvertisingDuration: '13 months',
    privacyArticle7_3Title: '7.3 Consent for Users in EU/EEA Regions (GDPR Compliance)',
    privacyArticle7_3: 'For users accessing from the European Economic Area (EEA) and United Kingdom, we obtain explicit consent for cookie use and personalized advertising. If consent is declined, some features or personalized ads may be disabled.',
    privacyArticle7_3_1: 'EU User Consent Policy',
    privacyArticle7_3_2: 'We obtain explicit consent for cookie use and personalized advertising.',
    privacyArticle7_4Title: '7.4 How to Manage Cookies',
    privacyArticle7_4: 'Users can refuse acceptance of cookies or delete saved cookies through browser settings. However, if essential cookies are disabled, some features of this Service may become unavailable.',
    privacyChrome: 'Google Chrome Settings',
    privacyFirefox: 'Firefox Settings',
    privacySafari: 'Safari Settings',
    privacyEdge: 'Microsoft Edge Settings',
    privacyArticle8Title: 'Article 8 (Use of Google Analytics)',
    privacyArticle8_1: 'This Service uses "Google Analytics," an access analysis tool provided by Google LLC. Google Analytics collects and analyzes user usage using cookies. Collected information is managed according to Google\'s Privacy Policy.',
    privacyArticle8_2: 'Users can disable Google Analytics tracking by installing the Google Analytics Opt-out Add-on.',
    privacyArticle9Title: 'Article 9 (Information Security Management)',
    privacyArticle9Intro: 'The Operator implements the following security management measures to prevent leakage, loss, or damage of personal information:',
    privacyArticle9_1: 'Encrypted password storage (hashed with bcrypt)',
    privacyArticle9_2: 'Encrypted communication via HTTPS',
    privacyArticle9_3: 'Access restrictions and authentication functions',
    privacyArticle9_4: 'Regular security reviews',
    privacyArticle10Title: 'Article 10 (User Rights)',
    privacyArticle10Intro: 'Users have the following rights:',
    privacyArticle10_1: 'Right to Access: Right to confirm whether your personal information is being processed and to know its contents',
    privacyArticle10_2: 'Right to Rectification: Right to request correction of inaccurate personal information',
    privacyArticle10_3: 'Right to Erasure: Right to request deletion of personal information (can be achieved through address deletion)',
    privacyArticle10_4: 'Right to Restriction: Right to request restriction of personal information processing',
    privacyArticle10_5: 'Right to Data Portability: Right to receive your data in a structured format',
    privacyArticle10_6: 'Right to Object: Right to object to processing for marketing purposes',
    privacyArticle10_7: 'To exercise these rights, please contact us via this Service\'s contact point.',
    privacyArticle11Title: 'Article 11 (Children\'s Privacy)',
    privacyArticle11_1: 'This Service is not intended for children under 13. If we become aware that we have collected personal information from a child under 13, we will promptly delete such information.',
    privacyArticle12Title: 'Article 12 (Changes to Privacy Policy)',
    privacyArticle12_1: 'The Operator may change this policy as necessary.',
    privacyArticle12_2: 'The changed policy shall take effect when posted on this Service.',
    privacyArticle12_3: 'In case of significant changes, we will notify through notices on this Service or other appropriate methods.',
    privacyArticle12_4: 'If you cannot agree to the changed policy, please discontinue use of this Service.',
    privacyArticle13Title: 'Article 13 (International Data Transfer)',
    privacyArticle13_1: 'Information collected by this Service is stored on servers in Japan. However, through use of Google AdSense and Google Analytics, data may be sent to servers of Google LLC (United States). In this case, Google implements appropriate protective measures based on EU Standard Contractual Clauses.',
    privacyArticle14Title: 'Article 14 (Contact)',
    privacyArticle14Intro: 'For inquiries, opinions, or requests for exercising rights regarding this policy, please contact:',
    privacyArticle14_1: 'Contact Form: Access from this Service\'s menu',
    privacyArticle14_2: 'Operator Email: support@sutemeado.com (planned)',
    privacyArticle15Title: 'Article 15 (Governing Law)',
    privacyArticle15_1: 'This policy shall be interpreted in accordance with Japanese law. For users in EU/EEA regions, within the scope where the General Data Protection Regulation (GDPR) applies, this policy shall also satisfy the requirements of said regulation.',
    privacyCompliantNotice: 'This page complies with Google AdSense and GDPR/CCPA'
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
  const prevLang = state.currentLang;
  state.currentLang = lang;
  localStorage.setItem('sutemeado-lang', lang);
  document.documentElement.lang = lang;

  // ページが完全に読み込まれている場合のみリロード
  // 初回ロード時や初期化中はリロードしない
  if (prevLang && prevLang !== lang && document.readyState === 'complete') {
    // 言語が変更された場合、ページをリロードして完全に反映
    window.location.reload();
    return;
  }

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

// ===== Theme Toggle Functions =====
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'neon';
  const newTheme = currentTheme === 'neon' ? 'light' : 'neon';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('sutemeado-theme', newTheme);

  // Show toast notification
  const message = newTheme === 'light' ? 'ライトモードに変更しました' : 'ネオンモードに変更しました';
  showToast(message, 'success');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('sutemeado-theme') || 'neon';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Toast notification function
function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 12px 24px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    z-index: 10000;
    font-size: 0.875rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: fadeInUp 0.3s ease;
  `;

  document.body.appendChild(toast);

  // Remove after 2 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOutDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
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

// Button handlers for subpages - redirect to homepage with action params
function redirectToHome(action) {
  const lang = state.currentLang || 'ja';
  window.location.href = `/?action=${action}&lang=${lang}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load saved theme
  loadTheme();

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

  // Theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Fix non-functional buttons on subpages - redirect to homepage
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
  if (!isHomePage) {
    // Login/Account buttons - redirect to home with login action
    const menuLoginOther = document.getElementById('menu-login-other');
    if (menuLoginOther) {
      menuLoginOther.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        redirectToHome('login');
      });
    }

    // Create New Address button
    const menuNewAddress = document.getElementById('menu-new-address');
    if (menuNewAddress) {
      menuNewAddress.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        redirectToHome('new-address');
      });
    }

    // Delete All Emails button
    const menuDeleteAllMail = document.getElementById('menu-delete-all-mail');
    if (menuDeleteAllMail) {
      menuDeleteAllMail.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        redirectToHome('delete-all-mail');
      });
    }

    // Delete Address button
    const menuDeleteAddress = document.getElementById('menu-delete-address');
    if (menuDeleteAddress) {
      menuDeleteAddress.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        redirectToHome('delete-address');
      });
    }

    // API Docs button - will be handled separately to go to api.html
    const menuApi = document.getElementById('menu-api');
    if (menuApi) {
      menuApi.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/api.html';
      });
    }

    // Settings button - redirect to home
    const menuSettings = document.getElementById('menu-settings');
    if (menuSettings) {
      menuSettings.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        redirectToHome('settings');
      });
    }
  }

  // Check login status
  checkLoginStatus();
});
