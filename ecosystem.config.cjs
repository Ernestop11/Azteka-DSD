/**
 * PM2 Ecosystem Configuration
 * Manages both Next.js app and Express worker
 */

module.exports = {
  apps: [
    {
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
        PORT: 3002,
        DATABASE_URL: 'postgresql://azteka_user:8jzL7PwAKwvNHZyBydKPImCnj@localhost:5432/azteka_dsd?schema=public',
      },
      error_file: '/srv/azteka-dsd/logs/pm2-nextjs-error.log',
      out_file: '/srv/azteka-dsd/logs/pm2-nextjs-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
    {
      name: 'azteka-worker',
      script: 'server/worker.mjs',
      cwd: '/srv/azteka-dsd',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        WORKER_PORT: 3003,
        WORKER_ID: 'worker-1',
        DATABASE_URL: process.env.DATABASE_URL,
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
      },
      error_file: '/srv/azteka-dsd/logs/pm2-worker-error.log',
      out_file: '/srv/azteka-dsd/logs/pm2-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
}
