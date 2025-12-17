#!/bin/bash

# Quick deployment script - minimal output
# Usage: ./scripts/quick-deploy.sh

cd "$(dirname "$0")/.."
./scripts/deploy-to-vps.sh

