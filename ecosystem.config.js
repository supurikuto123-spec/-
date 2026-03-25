module.exports = {
  apps: [{
    name: 'sutemeado',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      // 絶対パスでDBファイルを指定（VPS再起動でも消えない）
      DB_PATH: '/var/www/sutemeado.com/data.db'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_PATH: '/var/www/sutemeado.com/data.db'
    },
    // ログ出力先
    log_file: '/var/log/sutemeado/combined.log',
    out_file: '/var/log/sutemeado/out.log',
    error_file: '/var/log/sutemeado/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // 起動時のメッセージ
    post_update: [
      'echo "🚀 Sutemeado started with DB_PATH: /var/www/sutemeado.com/data.db"'
    ]
  }]
};
