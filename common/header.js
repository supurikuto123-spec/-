document.addEventListener("DOMContentLoaded", () => {
  const headerHtml = `
    <nav class="nav">
      <a href="/how-to-use">使い方</a>
      <a href="/faq">FAQ</a>
      <a href="/tools">ツール</a>
      <a href="/about">概要</a>
      <a href="/terms">利用規約</a>
      <a href="/privacy">プライバシー</a>
      <a href="/contact">お問い合わせ</a>
    </nav>
  `;

  // header 内に挿入
  const header = document.querySelector("header");
  if (header) header.insertAdjacentHTML("beforeend", headerHtml);
});
