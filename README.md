# RTMP Streaming Platform

A TikTok-style RTMP streaming platform with a vertical swipe interface.

## Quick Start

### Development Mode (All-in-One)

Use our development script to start everything with one command:

```bash
./dev.sh
```

This script will:
1. Start the RTMP server in the background
2. Start the player app in development mode
3. Properly shut down services when you press Ctrl+C

### Using NPM Scripts

We've added several npm scripts for managing the services separately:

```bash
# Start only the RTMP server in background
npm run rtmp:start

# Stop the RTMP server
npm run rtmp:stop

# View RTMP server logs
npm run rtmp:logs

# Restart the RTMP server
npm run rtmp:restart

# Start only the player app in dev mode
npm run player:dev

# Build the player app for production
npm run player:build

# Start the player app in production mode
npm run player:start

# Start all services (RTMP server and player app) in background
npm run start:all

# Stop all services
npm run stop:all

# Start RTMP server and run player in dev mode
npm run dev
```

## Streaming Setup

### Stream Information

- **RTMP URL**: rtmp://localhost:1935/live
- **Stream Keys**: stream1, stream2, stream3

### OBS Configuration

1. Open OBS Studio
2. Go to Settings > Stream
3. Select "Custom" as the service
4. Enter `rtmp://localhost:1935/live` as the server
5. Enter `stream1` (or stream2, stream3) as the stream key
6. Click "Apply" and "OK"
7. Click "Start Streaming" in the main OBS window

## Viewing Streams

Once everything is running:

1. Open your browser to http://localhost:3000
2. You should see your stream in a TikTok-style feed
3. Swipe up/down or use the arrow buttons to navigate between streams
4. Tap on the stream to toggle mute/unmute
5. Use the snap button for interactive effects

## Troubleshooting

If you encounter issues:

1. Check that Docker is running
2. Ensure ports 1935, 8080, and 3000 are not in use by other applications
3. View RTMP server logs with `npm run rtmp:logs`
4. Try restarting the RTMP server with `npm run rtmp:restart` 