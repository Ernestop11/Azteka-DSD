module.exports = {
  apps: [{
    name: 'azteka-api',
    script: '/srv/azteka-dsd/server.mjs',
    cwd: '/srv/azteka-dsd',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/srv/azteka-dsd/logs/pm2-error.log',
    out_file: '/srv/azteka-dsd/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
