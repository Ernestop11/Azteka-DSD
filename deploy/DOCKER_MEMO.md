Docker deployment memo — notes for other app teams

Purpose
This memo explains how we deploy Azteka Sales and the Printer service with Docker, and what other app builds need to do so deployments coexist safely on the same VPS.

Key choices made
- Default host ports: Azteka Sales → 4102, Printer → 4101. These avoid conflicts with existing services (Alessa on 4100, SMP on 4200).
- Each service runs in its own container on the `azteka_net` network.
- We keep the DB external to this compose file in production (Postgres is provided separately on the host). If you need a DB container, coordinate schema and credentials.

What other app teams must do
1) Pick a safe port range and declare it
   - Use the port table in `deploy/README.md`. If you need a port change, open a PR to update `deploy/ports.md` or notify ops so we avoid collisions.

2) Provide a production-ready Dockerfile
   - Keep production images reproducible and small.
   - Copy only the built assets needed to run (do `npm ci --production` + `npm run build` inside the image or use multi-stage builds).
   - Expose a sensible port (via `EXPOSE`) and accept a PORT env variable.

3) Support configurable runtime via environment variables
   - Respect env var `PORT` and `NODE_ENV`.
   - Read DB connection from `DATABASE_URL` (12-factor style) rather than hard-coding.

4) Healthchecks
   - Provide a simple HTTP health endpoint (e.g., `/health`) that returns 200 when the service is ready. Docker Compose and orchestration tools rely on healthchecks to mark services healthy.

5) Use explicit container names and labels
   - Set a predictable container name like `myapp_prod` for easier troubleshooting.
   - Add Docker labels for ownership and contact info (e.g., `com.azteka.owner=team-name`).

6) External resources
   - If the app requires a DB or Redis, prefer connecting to shared host services rather than spinning a new DB per-app unless isolation is required. Coordinate schema and credentials with ops.

7) Network and reverse proxying
   - We use the host's Nginx as the main reverse proxy in production. Containers just map their internal port to a host port and Nginx proxies to localhost:port.
   - If you containerize Nginx, we can run it in the same compose stack, but that requires reworking how other apps are proxied.

8) CI/CD and image tagging
   - CI should publish images with stable tags (e.g., `azteka-sales:sha-<short>`) to the registry and optionally update a `docker-compose` or deployment manifest.
   - For zero-downtime deploys, change tags and restart only the service container.

9) Dev vs prod differences
   - Dev images can mount source code to volume; prod images must be immutable and built in CI.

10) Disk and runtime constraints
   - Keep logs out of the container filesystem. Use `docker logs` and central logging if available.
   - Monitor disk usage for DB volumes.

Quick start for your app (example steps to add a `myapp` service)
1. Add `myapp/Dockerfile` implementing production build and run.
2. Add a compose service to `docker-compose.prod.yml` using the same network and pick an unused port:

  myapp:
    build:
      context: ./apps/myapp
      dockerfile: Dockerfile
    image: myapp:latest
    container_name: myapp_prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=4300
    ports:
      - "4300:4300"
    networks:
      - azteka_net
    healthcheck:
      test: ["CMD-SHELL","curl -f http://localhost:4300/health || exit 1"]

3. Coordinate the port and DB credentials with operations.

Commands to build and run (ops / CI)

# Build & run locally
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker logs azteka_sales_prod --follow

When to use PM2 vs Docker
- Docker provides stronger isolation and is preferred for apps that have different runtime stacks or require separate dependency management.
- PM2 is simpler for native Node apps that run directly on the host and can be easier for low-overhead services.
- In this repo we provide both PM2 and Docker options; pick one per-app and document your choice.

If you want, I can:
- Create a `deploy/ports.md` file that acts as the official port allocation registry and a small PR template to request new ports.
- Add a CI snippet (GitHub Actions) that builds and pushes Docker images and outputs the `docker-compose` override to deploy new tags.

