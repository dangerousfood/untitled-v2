#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====== RTMP Stream Platform Development ======${NC}\n"

# Function to handle script exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  docker compose stop rtmp-server
  echo -e "${GREEN}RTMP server stopped.${NC}"
  echo -e "${BLUE}You can restart it anytime with:${NC} npm run rtmp:start"
  echo -e "${GREEN}Goodbye!${NC}"
  exit 0
}

# Set up trap to catch SIGINT (Ctrl+C)
trap cleanup SIGINT

# Start RTMP server in background
echo -e "${YELLOW}Starting RTMP server...${NC}"
docker compose up -d rtmp-server

# Check if RTMP server started successfully
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start RTMP server. Exiting.${NC}"
  exit 1
fi

echo -e "${GREEN}RTMP server started successfully!${NC}"
echo -e "${BLUE}Stream URL:${NC} rtmp://localhost:1935/live"
echo -e "${BLUE}Stream Key:${NC} stream1, stream2, or stream3\n"

# Start player app in dev mode with environment variables for RTMP host
echo -e "${YELLOW}Starting player app in development mode...${NC}"
echo -e "${BLUE}The app will be available at:${NC} http://localhost:3000"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# When running separately, we need to specify localhost for the RTMP server
cd player-app && NEXT_PUBLIC_RTMP_HOST=localhost NEXT_PUBLIC_RTMP_PORT=8080 npm run dev 