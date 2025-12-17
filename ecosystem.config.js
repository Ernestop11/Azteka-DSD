/**
 * PM2 multi-app ecosystem configuration
 * - Designed to manage multiple apps on the same VPS without conflicts.
 * - Default ports: Alessa 4100, Printer 4101, Azteka 4102, SMP 4200
 * - Adjust `cwd` to point to the actual deployment path on your VPS (e.g., /srv/azteka-sales)
 * - Start only the app(s) you need via `pm2 start ecosystem.config.js --only <name>`
 */

module.exports = {
  apps: [
    {
      name: 'alessa',
      cwd: process.env.ALESSA_CWD || '/srv/alessa',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.ALESSA_PORT || 4100
      },
      autorestart: true,
      instances: 1,
      watch: false
    },

    {
      name: 'printer-service',
      cwd: process.env.PRINTER_CWD || '/srv/printer-service',
      script: 'node',
      args: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PRINTER_PORT || 4101
      },
      autorestart: true,
      instances: 1,
      watch: false
    },

    {
      name: 'azteka-sales',
      cwd: process.env.AZTEKA_CWD || '/srv/azteka-sales/apps/sales',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.AZTEKA_PORT || 4102
      },
      autorestart: true,
      instances: 1,
      watch: false
    },

    {
      name: 'smp',
      cwd: process.env.SMP_CWD || '/srv/smp',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.SMP_PORT || 4200
      },
      autorestart: true,
      instances: 1,
      watch: false
    }
  ]
};
