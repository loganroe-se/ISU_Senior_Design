#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

# Define the target directories
TARGET_DIR="./python"
CERTS_DIR="$TARGET_DIR/etc/ssl/certs"
BUNDLE_FILE="global-bundle.pem"

echo -e "${BLUE}🚀 Starting AWS Lambda package setup...${NC}"

# Remove existing directory to avoid conflicts
if [ -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}⚠️  Removing existing 'python' directory...${NC}"
    rm -rf $TARGET_DIR
fi

# Create a clean target directory
echo -e "${GREEN}📁 Creating fresh 'python' directory...${NC}"
mkdir -p $TARGET_DIR

# Install dependencies using manylinux wheels compatible with AWS Lambda
echo -e "${BLUE}📦 Installing dependencies from requirements.txt...${NC}"
pip install --platform manylinux2014_x86_64 --only-binary=:all: --target $TARGET_DIR -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies! Exiting...${NC}"
    exit 1
fi

# Move all Python files into the ./python directory
echo -e "${BLUE}📂 Moving Python files into 'python' directory...${NC}"
cp *.py $TARGET_DIR

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Python files moved successfully!${NC}"
else
    echo -e "${RED}❌ Failed to move Python files! Exiting...${NC}"
    exit 1
fi

# Ensure the SSL certs directory exists
echo -e "${GREEN}📁 Creating 'etc/ssl/certs' directory...${NC}"
mkdir -p $CERTS_DIR

# Copy the global-bundle.pem file into the SSL certs directory
if [ -f "$BUNDLE_FILE" ]; then
    echo -e "${BLUE}🔒 Copying '$BUNDLE_FILE' to '$CERTS_DIR'...${NC}"
    cp $BUNDLE_FILE $CERTS_DIR

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ '$BUNDLE_FILE' copied successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to copy '$BUNDLE_FILE'! Exiting...${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  '$BUNDLE_FILE' not found! Skipping copy step.${NC}"
fi

echo -e "${GREEN}🎉 AWS Lambda package setup completed successfully!${NC}"
