# RTMP Stream Player App

This is a Next.js application that provides a web player for RTMP streams. It's designed to work with the RTMP streaming server.

## Features

- HLS video playback using hls.js
- Support for different stream keys
- Real-time stream status updates
- Responsive design
- Fallback for browsers with native HLS support

## Development

To run this application in development mode:

```bash
npm install
npm run dev
```

## Docker

This application is designed to run in Docker alongside the RTMP server. The docker-compose.yml file in the parent directory will automatically build and run this application.

## Usage

1. Access the player at http://localhost:3000
2. Enter your stream key (default is "stream1")
3. If you're streaming to the RTMP server, the video should appear automatically

## Proxy Configuration

The application proxies requests to the RTMP server for HLS streams and statistics. This is configured in next.config.js. 