module.exports = {
  apps: [{
    name: 'sutemeado',
    script: './server.js',
    env: {
      DB_PATH: '/var/www/sutemeado.com/data.db',
      NODE_ENV: 'production'
    },
    cwd: '/var/www/sutemeado.com'
  }]
};
