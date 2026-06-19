import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const yUtils = require('./utils.cjs');

const { setupWSConnection } = yUtils;

const port = process.env.PORT || 5858;

// Create a bare HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket Sync Server is running.\n');
});

// Create the WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, {
    gc: true
  });
});

server.on('upgrade', (request, socket, head) => {
  // Extract room name from URL (e.g. /connect/:roomId)
  // For standard y-websocket, we can just pass it through
  const handleAuth = ws => {
    wss.emit('connection', ws, request);
  };
  wss.handleUpgrade(request, socket, head, handleAuth);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Yjs Sync Server running on port ${port} (0.0.0.0)`);
});
