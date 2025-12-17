#!/bin/bash

# Make script stop on first error
set -e

echo "🚀 Starting Azteka DSD System automated setup..."

# Task 1: Bootstrap Project
echo "📦 Task 1: Bootstrapping project..."
cd apps/sales

# Kill any running Next.js dev server
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

npm install --yes

# Check and remove existing container if needed
if [ "$(docker ps -aq -f name=azteka_db)" ]; then
    echo "Removing existing azteka_db container..."
    docker stop azteka_db || true
    docker rm azteka_db || true
fi

# Create .env file with database configuration
cat > .env << EOL
DATABASE_URL=postgresql://admin:admin@localhost:5434/azteka?schema=public
NEXT_PUBLIC_API_URL=http://localhost:3002/api
EOL

docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

PORT=3002
while ! nc -z localhost $PORT; do
    ((PORT++))
done

# Task 2: Expand Prisma Schema
echo "🔄 Task 2: Updating Prisma Schema..."
npx prisma generate
npx prisma db push --accept-data-loss
# Start Prisma Studio in background
(npx prisma studio &)

# Start Next.js in background
(npm run dev -- --port $PORT &)
echo "✅ Project bootstrapped on port $PORT"

# Task 3: Import Products
echo "📝 Task 3: Importing products..."
node scripts/import_csv_products.js
echo "✅ Products imported"

# Task 4: Setup Print Service
echo "🖨️ Task 4: Setting up print service..."
cd ../../printer-service
npm init -y
npm install --yes express pdf-to-printer body-parser cors
echo "✅ Print service dependencies installed"

# Task 5: Build and start print service
echo "🏗️ Starting print service..."
# Kill any running print service
lsof -ti:4101 | xargs kill -9 2>/dev/null || true
(node index.js &)
echo "✅ Print service started on port 4101"

# Task 6: Return to main app directory
cd ../apps/sales

# Task 7: Install additional dependencies for sales app
echo "🛍️ Setting up sales app dependencies..."
npm install --yes @tanstack/react-query dexie react-hot-toast @heroicons/react
echo "✅ Sales app dependencies installed"

# Task 8: Install admin dashboard dependencies
echo "👔 Setting up admin dashboard..."
npm install --yes --legacy-peer-deps @tremor/react @shadcn/ui
echo "✅ Admin dashboard dependencies installed"

# Task 9: Set up Git
echo "🔄 Setting up Git..."
if [ ! -d ".git" ]; then
    git init
    cat > .gitignore << EOL
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# next.js
.next/
out/
build
dist

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Prisma
*.db
*.sqlite
EOL

    git add .
    git commit -m "Initial commit: Azteka DSD System setup"
fi

echo "✅ All tasks completed!"
echo "🌟 Your development environment is ready!"
echo "📝 Next steps:"
echo "  1. Check localhost:3002 for the main app"
echo "  2. Check localhost:4101 for the print service"
echo "  3. Access Prisma Studio to verify data"