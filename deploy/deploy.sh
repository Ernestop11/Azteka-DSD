#!/usr/bin/env bash
# deploy/deploy.sh
# Idempotent deploy helper for PM2-based apps in this repo.
# Usage:
#   ./deploy/deploy.sh --app azteka-sales --dry-run
#   ./deploy/deploy.sh --app azteka-sales --apply
# Options:
#   --app <name>     : one of alessa, printer-service, azteka-sales, smp
#   --target <path>  : deployment target dir on VPS (optional)
#   --skip-build     : skip npm build step (useful for services without build)
#   --dry-run        : print commands instead of executing
#   --apply          : actually run the steps

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

APP="azteka-sales"
TARGET=""
DRY_RUN=true
APPLY=false
SKIP_BUILD=false

usage() {
  cat <<EOF
Usage: $0 [--app <name>] [--target <path>] [--dry-run | --apply] [--skip-build]

Examples:
  # Dry-run for azteka (default)
  $0 --app azteka-sales --dry-run

  # Apply deploy for azteka to /srv/azteka-sales
  $0 --app azteka-sales --target /srv/azteka-sales --apply
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --app) APP="$2"; shift 2;;
    --target) TARGET="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift;;
    --apply) DRY_RUN=false; APPLY=true; shift;;
    --skip-build) SKIP_BUILD=true; shift;;
    -h|--help) usage;;
    *) echo "Unknown arg: $1"; usage;;
  esac
done

if [ "$APP" != "alessa" ] && [ "$APP" != "printer-service" ] && [ "$APP" != "azteka-sales" ] && [ "$APP" != "smp" ]; then
  echo "Unsupported app: $APP"
  usage
fi

# Default target locations (safe for dev/test); override with --target on VPS
case $APP in
  alessa) DEFAULT_TARGET="$REPO_ROOT/apps/alessa" ;;
  printer-service) DEFAULT_TARGET="$REPO_ROOT/printer-service" ;;
  azteka-sales) DEFAULT_TARGET="$REPO_ROOT/apps/sales" ;;
  smp) DEFAULT_TARGET="$REPO_ROOT/smp" ;;
esac

if [ -z "$TARGET" ]; then
  TARGET="$DEFAULT_TARGET"
fi

# Helper to either echo or run
run() {
  if [ "$DRY_RUN" = true ]; then
    echo "+DRY-RUN: $*"
  else
    echo "+RUN: $*"
    eval "$@"
  fi
}

# Safety checks
echo "Deploy script invoked for app: $APP"
echo "Target directory: $TARGET"
echo "Dry run: $DRY_RUN"

# Check pm2 presence (only if applying)
if [ "$DRY_RUN" = false ]; then
  if ! command -v pm2 >/dev/null 2>&1; then
    echo "ERROR: pm2 not found. Install with: sudo npm i -g pm2@latest" >&2
    exit 2
  fi
fi

# Show who owns the target directory if it exists
if [ -d "$TARGET" ]; then
  ls -ld "$TARGET"
else
  echo "Note: target directory does not exist yet: $TARGET"
fi

# Port-check helper
APP_PORT_VAR=""
case $APP in
  alessa) APP_PORT_VAR="4100";;
  printer-service) APP_PORT_VAR="4101";;
  azteka-sales) APP_PORT_VAR="4102";;
  smp) APP_PORT_VAR="4200";;
esac

echo "Planned port: $APP_PORT_VAR"
if command -v lsof >/dev/null 2>&1; then
  echo "Checking if port $APP_PORT_VAR is in use..."
  if lsof -iTCP -sTCP:LISTEN -Pn | grep -E ":(${APP_PORT_VAR})" >/dev/null 2>&1; then
    echo "WARNING: port $APP_PORT_VAR is already in use — double-check before applying."
  else
    echo "Port $APP_PORT_VAR seems free."
  fi
else
  echo "lsof not available — skipping port check"
fi

# Ensure target dir exists (if applying)
if [ "$DRY_RUN" = false ]; then
  if [ ! -d "$TARGET" ]; then
    echo "Creating target directory: $TARGET"
    run "sudo mkdir -p '$TARGET' && sudo chown \$USER '$TARGET'"
  fi
fi

# Clone/update repo if target is outside current repo root (dangerous op, show it in dry-run)
if [ "$(realpath "$TARGET")" = "$(realpath "$REPO_ROOT")" ]; then
  echo "Target is current repo — using local copy"
else
  echo "Target differs from repo root. On VPS you'd typically clone into $TARGET"
  if [ "$DRY_RUN" = true ]; then
    echo "+DRY-RUN: git clone <repo-url> $TARGET  # (if not already cloned)"
  else
    if [ ! -d "$TARGET/.git" ]; then
      echo "Cloning repo into $TARGET"
      run "git clone . '$TARGET'"
    else
      echo "Updating repo in $TARGET"
      run "cd '$TARGET' && git pull --ff-only"
    fi
  fi
fi

# Install dependencies and build (if applicable)
# For printer-service and smp there may be no build step.
echo "-- Installing dependencies and (optional) building --"
run "cd '$TARGET'"
if [ "$DRY_RUN" = false ]; then
  # real commands
  cd "$TARGET"
  if [ -f "package.json" ]; then
    echo "Running npm ci in $TARGET"
    npm ci
  fi
  if [ "$SKIP_BUILD" = false ]; then
    if [ -f "package.json" ] && grep -q '"build"' package.json; then
      echo "Running npm run build in $TARGET"
      npm run build
    else
      echo "No build script detected or --skip-build used; skipping build"
    fi
  else
    echo "--skip-build supplied; skipping build step"
  fi
else
  # Dry-run messages
  if [ -f "$TARGET/package.json" ]; then
    echo "+DRY-RUN: cd '$TARGET' && npm ci"
    if grep -q '"build"' "$TARGET/package.json" && [ "$SKIP_BUILD" = false ]; then
      echo "+DRY-RUN: cd '$TARGET' && npm run build"
    else
      echo "+DRY-RUN: (no build or build skipped)"
    fi
  else
    echo "+DRY-RUN: No package.json at $TARGET"
  fi
fi

# PM2 start/reload logic
echo "-- PM2 start/reload --"
PM2_CMD="pm2 start $REPO_ROOT/ecosystem.config.js --only $APP --env production"
PM2_RELOAD_CMD="pm2 reload $APP --update-env"
PM2_STATUS_CMD="pm2 describe $APP >/dev/null 2>&1"

if [ "$DRY_RUN" = true ]; then
  echo "+DRY-RUN: $PM2_CMD"
  echo "+DRY-RUN: pm2 save"
else
  # If the app is already known to pm2, reload to apply new build/env
  if pm2 info "$APP" >/dev/null 2>&1; then
    echo "App $APP already managed by pm2 — reloading"
    run "$PM2_RELOAD_CMD"
  else
    echo "Starting $APP via pm2"
    run "$PM2_CMD"
  fi
  echo "Saving pm2 process list"
  run "pm2 save"
fi

echo "Deploy script finished for $APP (dry-run=$DRY_RUN)"

# End of script
