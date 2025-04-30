#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Build the Vite frontend
npm run build

# Make the script executable
chmod +x build.sh 