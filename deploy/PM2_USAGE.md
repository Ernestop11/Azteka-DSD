PM2 multi-app usage

This project includes `ecosystem.config.js` at the repo root that defines multiple app entries (Alessa, Printer, Azteka, SMP). The file is configured with safe defaults and environment-variable overrides so multiple apps can run on a single VPS without colliding.

Key points
- Default ports:
  - Alessa: 4100
  - Printer service: 4101
  - Azteka Sales: 4102
  - SMP: 4200
- Default `cwd` values are placeholders (e.g., `/srv/azteka-sales`). On the VPS adjust `cwd` to match where you clone the repo.
- To avoid affecting other apps, always check running containers/processes before starting/restarting apps (see commands below).

Start only one app (recommended when adding new apps):
```bash
# from /srv/azteka-sales (or repo root)
pm2 start ecosystem.config.js --only azteka-sales --env production
# OR
pm2 start ecosystem.config.js --only printer-service --env production
```

Start multiple apps at once:
```bash
pm2 start ecosystem.config.js --env production
```

Useful PM2 commands
```bash
# list processes
pm2 list

# show details / env
pm2 describe azteka-sales

# restart a single app
pm2 restart azteka-sales

# reload (zero-downtime for cluster mode)
pm2 reload azteka-sales --update-env

# show logs
pm2 logs azteka-sales --lines 200

# save/start on reboot
pm2 save
pm2 startup systemd
# follow the printed command to enable
```

Safety checklist (before touching services)
```bash
# see docker containers
docker ps -a

# see pm2 processes
pm2 list

# check ports in use
sudo lsof -iTCP -sTCP:LISTEN -Pn | grep -E ":(4100|4101|4102|4200)"
```

Notes
- If an app is already using a port, choose a different port for the new app and update `ecosystem.config.js` or set the PORT env var.
- You can override any value at runtime using environment variables. Example:
```bash
ALETEKA_CWD=/srv/azteka-sales/apps/sales AZTEKA_PORT=4500 pm2 start ecosystem.config.js --only azteka-sales --env production
```
(typo note: use AZTEKA_CWD/AZTEKA_PORT variables as defined in the ecosystem.)

If you want, I can:
- Add a `deploy.sh` script that handles clone, npm ci, build, and starting via PM2 per-app (dry-run safe by default).
- Add a systemd unit version instead of PM2.
- Add a `pm2` wrapper that will only start stopped apps (useful for scripted deploys).