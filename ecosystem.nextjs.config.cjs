module.exports = {
  apps: [{
    name: 'azteka-nextjs',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/srv/azteka-dsd',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/srv/azteka-dsd/logs/pm2-error.log',
    out_file: '/srv/azteka-dsd/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
