#!/bin/bash

echo "Initializing local database..."

# Apply schema
echo "Applying schema..."
npx wrangler d1 execute website-desa --local --file=schema.sql

# Seed superadmin
echo "Seeding superadmin account..."
npx wrangler d1 execute website-desa --local --file=seed.sql

echo "Database initialized successfully!"
echo ""
echo "Superadmin credentials:"
echo "Username: admin"
echo "Password: password123"
