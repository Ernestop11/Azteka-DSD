#!/bin/bash

echo "Logging in..."
curl -i -c /tmp/azteka-cookie.txt \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"admin@azteka.com", "password":"password123"}'

echo ""
echo "Testing /api/auth/me..."
curl -b /tmp/azteka-cookie.txt http://localhost:3000/api/auth/me
echo ""

echo "Testing /api/admin/catalog/layout..."
curl -b /tmp/azteka-cookie.txt http://localhost:3000/api/admin/catalog/layout
echo ""

echo "Testing /api/admin/catalog/promos..."
curl -b /tmp/azteka-cookie.txt http://localhost:3000/api/admin/catalog/promos
echo ""

echo "Testing /api/products..."
curl -b /tmp/azteka-cookie.txt http://localhost:3000/api/products
echo ""

echo "DONE"

