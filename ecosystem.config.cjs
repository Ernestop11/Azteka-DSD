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
      cwd: '/srv/azteka-api-live',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        DATABASE_URL: 'postgresql://azteka_user:AzT3ka2024Prod@localhost:5432/azteka_dsd?schema=public',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyAvZQHxGVKFzw32Z-jEvFPTD9Y7-ZR5shQ',
      },
      error_file: '/srv/azteka-api-live/logs/pm2-nextjs-error.log',
      out_file: '/srv/azteka-api-live/logs/pm2-nextjs-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
    {
      name: 'azteka-worker',
      script: 'server/worker.mjs',
      cwd: '/srv/azteka-api-live',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        WORKER_PORT: 3003,
        WORKER_ID: 'worker-1',
        DATABASE_URL: 'postgresql://azteka_user:AzT3ka2024Prod@localhost:5432/azteka_dsd?schema=public',
        CORS_ORIGIN: '*',
      },
      error_file: '/srv/azteka-api-live/logs/pm2-worker-error.log',
      out_file: '/srv/azteka-api-live/logs/pm2-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
}
