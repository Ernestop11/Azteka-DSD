Deployment guide — Azteka Sales

This document explains a safe, non-invasive deployment approach so Azteka can coexist with other apps on the same VPS (e.g., Alessa Cloud on 4100).

Goals
- Provide both Docker and PM2 options.
- Choose a non-conflicting default port (4102). Allow overriding via env.
- Provide Nginx reverse proxy snippet for azteka.<yourdomain> → localhost:4102.
- Describe checks and recovery steps to avoid taking down other apps.

Prereqs (on VPS)
- Node 22 (recommended)
- Docker and docker-compose (optional, for container deployments)
- PM2 (if using native Node processes)
- Nginx and certbot (for reverse proxy / TLS)

Quick sanity checks before any change

# Check Docker containers
docker ps -a

# Check PM2 processes (if PM2 is used)
pm2 status || pm2 list

# See which process is listening on important ports
sudo lsof -iTCP -sTCP:LISTEN -Pn | grep -E ":(4100|4101|4102|4200)"

If an existing app is using a port, do NOT change that app — pick a different port for Azteka and update the PM2 ecosystem / Docker env accordingly.

Options

A) Docker (recommended for isolation)
1. Build image on VPS (from repo root or from apps/sales):

cd /srv/azteka-sales
docker build -t azteka-sales:latest -f apps/sales/Dockerfile .

2. Run container (example, mapping port 4102):

docker run -d --name azteka-sales -p 4102:4102 \
  -e NODE_ENV=production \
  -e PORT=4102 \
  azteka-sales:latest

3. Confirm it's healthy:

curl -I http://127.0.0.1:4102/

4. Configure Nginx: place `deploy/nginx.azteka.conf` into `/etc/nginx/sites-available/azteka` and symlink to `/etc/nginx/sites-enabled/`, then reload Nginx:

sudo ln -s /etc/nginx/sites-available/azteka /etc/nginx/sites-enabled/azteka
sudo nginx -t
sudo systemctl reload nginx

B) PM2 (native Node process)

1. Install PM2 globally (if not installed):

sudo npm i -g pm2@latest

2. Place app under `/srv/azteka-sales` (or another directory). Update `ecosystem.config.js` `cwd` if you use a different path.

3. Install dependencies and build:

cd /srv/azteka-sales/apps/sales
npm ci
npm run build

4. Start with PM2:

cd /srv/azteka-sales/apps/sales
pm2 start ../../apps/sales/ecosystem.config.js --env production

5. Save PM2 process list so it restarts on server reboot:

pm2 save
pm2 startup systemd
# Follow pm2 startup instructions printed on screen

6. To restart or update without downtime:

# pull changes, rebuild
git pull
npm ci
npm run build
# reload process
pm2 reload azteka-sales --update-env

Checking and recovering without impacting other services

- Always run `docker ps -a` and `pm2 list` before starting/stopping anything.
- Use `sudo lsof -i :<port>` to confirm which process is bound to that port.
- If you find Alessa or other apps running (e.g., on 4100), do not reuse that port.
- If you need to free a port you own, use `pm2 stop <name>` or `docker stop <container>` — but only for processes you started.

Suggested default ports
- Alessa Cloud: 4100 (existing)
- Printer service: 4101 (local)
- Azteka Sales (this app): 4102 (default) — changeable via PORT env.
- SMP (other app): 4200

Nginx reverse proxy example
- See `deploy/nginx.azteka.conf` — replace `azteka.<yourdomain>` and optionally add HTTPS via certbot.

If you want, I can:
- Produce systemd unit examples (instead of PM2)
- Create a Docker Compose production file
- Help run a dry-run on a staging VPS if you provide SSH access

Commands you'll likely run on the VPS (copy/paste)

# Clone repo
sudo mkdir -p /srv/azteka-sales
sudo chown $USER /srv/azteka-sales
cd /srv/azteka-sales
git clone <repo-url> .

# Build & run via Docker
docker build -t azteka-sales:latest -f apps/sales/Dockerfile .
docker run -d --name azteka-sales -p 4102:4102 -e PORT=4102 azteka-sales:latest

# OR run with PM2
cd apps/sales
npm ci
npm run build
pm2 start ./ecosystem.config.js --env production
pm2 save

# Nginx install & setup (Ubuntu example)
sudo apt update && sudo apt install -y nginx
sudo mv deploy/nginx.azteka.conf /etc/nginx/sites-available/azteka
sudo ln -s /etc/nginx/sites-available/azteka /etc/nginx/sites-enabled/azteka
sudo nginx -t && sudo systemctl reload nginx

Questions / next steps
- Do you want Docker or PM2 as the preferred deployment method? I can add a ready-to-run `docker-compose.prod.yml` or adjust the ecosystem file with multiple apps.
- If you want, provide the VPS domain/IP and I can prepare a step-by-step runbook tuned to that machine.
