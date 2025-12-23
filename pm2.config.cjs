// PM2 Configuration for VPS Deployment
// This file should be kept in the repo and synced to VPS
// The DATABASE_URL is set here for production (VPS database)

module.exports = {
  apps: [{
    name: 'azteka-nextjs',
    cwd: '/srv/azteka-dsd',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3002,
      DATABASE_URL: 'postgresql://azteka_user:azteka_pass_2024@localhost:5432/azteka_dsd?schema=public'
    },
    error_file: '/srv/azteka-dsd/logs/pm2-error.log',
    out_file: '/srv/azteka-dsd/logs/pm2-out.log',
    autorestart: true,
    watch: false
  }]
}
