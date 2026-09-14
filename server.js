const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const root = __dirname;
const rooms = new Map();
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((request, response) => {
  const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.join(root, path.normalize(requestedPath));
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
});

const webSocketServer = new WebSocket.Server({ server });
function send(socket, message) { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message)); }
function broadcast(room, sender, message) { room.forEach(socket => { if (socket !== sender) send(socket, message); }); }
function leaveRoom(socket) { if (!socket.room) return; const room = rooms.get(socket.room); if (room) { room.delete(socket); if (!room.size) rooms.delete(socket.room); else broadcast(room, socket, { type: 'opponent-left' }); } socket.room = ''; }

webSocketServer.on('connection', socket => {
  socket.on('message', rawMessage => {
    let message;
    try { message = JSON.parse(rawMessage); } catch { return; }
    if (message.type === 'join') {
      const code = String(message.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!code || socket.room) return;
      const room = rooms.get(code) || new Set();
      if (room.size >= 2) { send(socket, { type: 'room-full' }); return; }
      room.add(socket);
      rooms.set(code, room);
      socket.room = code;
      socket.nick = String(message.nick || 'GRACZ');
      send(socket, { type: 'waiting', code });
      if (room.size === 2) room.forEach(player => send(player, { type: 'matched' }));
      return;
    }
    if (!socket.room) return;
    if (['state', 'spell', 'damage', 'game-over'].includes(message.type)) broadcast(rooms.get(socket.room), socket, message);
  });
  socket.on('close', () => leaveRoom(socket));
  socket.on('error', () => leaveRoom(socket));
});

server.listen(port, host, () => console.log(`Walka Czarodziejow: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`));
