#!/bin/bash
# Deploy script for clusters-and-climate Hugo blog
# Usage: ./deploy.sh "Commit message"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default commit message
COMMIT_MSG="${1:-Deploy: Update site}"

echo -e "${YELLOW}🚀 Starting deployment...${NC}"

# Ensure we're on master branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${RED}❌ Error: Must be on master branch. Currently on: $CURRENT_BRANCH${NC}"
    exit 1
fi

# Check for uncommitted changes on master
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Uncommitted changes detected on master. Committing...${NC}"
    git add -A
    git commit -m "$COMMIT_MSG"
fi

# Build the site
echo -e "${YELLOW}🔨 Building Hugo site...${NC}"
hugo

# Push master changes
echo -e "${YELLOW}📤 Pushing master branch...${NC}"
git push origin master

# Switch to gh-pages
echo -e "${YELLOW}🔄 Switching to gh-pages branch...${NC}"
git checkout gh-pages

# Copy built site from master
echo -e "${YELLOW}📋 Copying built site...${NC}"
git checkout master -- public/
cp -r public/* .
rm -rf public

# Commit and push gh-pages
echo -e "${YELLOW}📤 Deploying to gh-pages...${NC}"
git add -A
git commit -m "$COMMIT_MSG" || echo "No changes to commit"
git push origin gh-pages

# Switch back to master
echo -e "${YELLOW}🔄 Switching back to master...${NC}"
git checkout master

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Site will be live at https://clustersandclimate.com in a few minutes${NC}"
