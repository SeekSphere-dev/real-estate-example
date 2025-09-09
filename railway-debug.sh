#!/bin/bash

echo "🔍 Railway Deployment Debug Script"
echo "=================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Run: railway login"
    exit 1
fi

echo "✅ Logged in to Railway"

# Show current project info
echo ""
echo "📋 Current Railway Project:"
railway status

# Show environment variables
echo ""
echo "🔧 Environment Variables:"
railway variables

# Show recent logs
echo ""
echo "📝 Recent Deployment Logs:"
railway logs --limit 50

echo ""
echo "🚀 To deploy with the simple Dockerfile:"
echo "1. Rename Dockerfile to Dockerfile.original"
echo "2. Rename Dockerfile.simple to Dockerfile"
echo "3. Run: railway up"

echo ""
echo "🔍 To monitor deployment:"
echo "railway logs --follow"