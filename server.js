const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const root = __dirname;
const rooms = new Map();
const activeSocketsByNick = new Map();
const groups = new Map();
const randomQueues = new Map([[1, []], [2, []]]);
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
function groupState(group) { return { type: 'group-state', groupId: group.id, members: [...group.members].map(player => player.nick) }; }
function removeFromQueue(socket) { for (const queue of randomQueues.values()) { const index = queue.findIndex(party => party.members.has(socket)); if (index >= 0) queue.splice(index, 1); } }
function leaveRoom(socket) { removeFromQueue(socket); if (socket.nick && activeSocketsByNick.get(socket.nick.toLowerCase()) === socket) activeSocketsByNick.delete(socket.nick.toLowerCase()); if (socket.groupId) { const group = groups.get(socket.groupId); if (group) { group.members.delete(socket); if (group.members.size < 2) { groups.delete(group.id); group.members.forEach(member => { member.groupId = ''; send(member, { type: 'group-state', groupId: '', members: [] }); }); } else group.members.forEach(member => send(member, groupState(group))); } } if (!socket.room) return; const room = rooms.get(socket.room); if (room) { room.delete(socket); if (!room.size) rooms.delete(socket.room); else broadcast(room, socket, { type: 'opponent-left' }); } socket.room = ''; }
function finishRoom(socket, message) { if (!socket.room) return; const code = socket.room; const room = rooms.get(code); if (!room) { socket.room = ''; return; } const winnerNick = String(message.winnerNick || socket.nick || ''); const winner = [...room].find(player => player.nick?.toLowerCase() === winnerNick.toLowerCase()); const winnerTeamId = message.winnerTeamId || winner?.teamId || socket.teamId || ''; room.forEach(player => { send(player, { type: 'round-ended', winnerNick, winnerTeamId }); player.room = ''; }); rooms.delete(code); }
function safeProfile(profile = {}) { return { role: ['owner', 'admin'].includes(profile.role) ? profile.role : 'user', dropEnabled: profile.dropEnabled === true, dropCharm: String(profile.dropCharm || ''), damageReduction: Math.max(0, Math.min(.8, Number(profile.damageReduction) || 0)) }; }
function createMatch(firstParty, secondParty, code) { const room = new Set([...firstParty.members, ...secondParty.members]); rooms.set(code, room); for (const party of [firstParty, secondParty]) for (const player of party.members) { player.room = code; player.teamId = party.id; } const participants = [...room].map(player => ({ nick: player.nick, teamId: player.teamId, ...player.profile })); for (const party of [firstParty, secondParty]) { const team = [...party.members]; const opponents = [...(party === firstParty ? secondParty : firstParty).members].map(player => ({ nick: player.nick, ...player.profile })); team.forEach(player => send(player, { type: 'matched', teamId: party.id, team: team.map(member => member.nick), opponents, opponent: opponents[0], players: participants })); } }
function enqueueRandom(socket) { if (socket.room || !socket.nick) { send(socket, { type: 'queue-error', message: 'NIE MOŻNA DOŁĄCZYĆ DO KOLEJKI' }); return; } removeFromQueue(socket); let party = socket.groupId ? groups.get(socket.groupId) : null; if (!party) party = { id: `solo:${socket.nick.toLowerCase()}`, members: new Set([socket]) }; if (party.members.size > 2 || [...party.members].some(member => member.room)) { send(socket, { type: 'queue-error', message: 'GRUPA JEST JUŻ W MECZU' }); return; } if (party.members.size === 2 && [...party.members][0] !== socket) { send(socket, { type: 'queue-error', message: 'LIDER GRUPY URUCHAMIA DOPASOWYWANIE' }); return; } const queue = randomQueues.get(party.members.size); const opponentIndex = queue.findIndex(candidate => candidate.id !== party.id && [...candidate.members].every(member => !member.room)); send(socket, { type: 'queue-waiting', teamSize: party.members.size }); if (opponentIndex < 0) { queue.push(party); return; } const [opponentParty] = queue.splice(opponentIndex, 1); createMatch(party, opponentParty, `random-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`); }

webSocketServer.on('connection', socket => {
  socket.on('message', rawMessage => {
    let message;
    try { message = JSON.parse(rawMessage); } catch { return; }
    if (message.type === 'hello') {
      socket.nick = String(message.nick || '').trim().slice(0, 24);
      if (!socket.nick) return;
      socket.profile = safeProfile(message.profile);
      activeSocketsByNick.set(socket.nick.toLowerCase(), socket);
      send(socket, { type: 'hello', nick: socket.nick });
      return;
    }
    if (message.type === 'group-invite') {
      if (!socket.nick || socket.room) return;
      let group = socket.groupId && groups.get(socket.groupId);
      if (!group) { group = { id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, members: new Set([socket]) }; groups.set(group.id, group); socket.groupId = group.id; }
      const target = activeSocketsByNick.get(String(message.targetNick || '').toLowerCase());
      if (!target || target === socket || target.room || target.groupId || group.members.size >= 2) { send(socket, { type: 'group-error', message: 'GRACZ JEST NIEDOSTĘPNY LUB GRUPA JEST PEŁNA' }); return; }
      send(target, { type: 'group-invite', groupId: group.id, from: socket.nick });
      group.members.forEach(member => send(member, groupState(group)));
      return;
    }
    if (message.type === 'group-accept') {
      const group = groups.get(String(message.groupId || ''));
      if (!group || group.members.size >= 2 || socket.groupId || socket.room) { send(socket, { type: 'group-error', message: 'ZAPROSZENIE WYGASŁO LUB GRUPA JEST PEŁNA' }); return; }
      group.members.add(socket); socket.groupId = group.id;
      group.members.forEach(member => send(member, groupState(group)));
      return;
    }
    if (message.type === 'group-reject') { const inviter = activeSocketsByNick.get(String(message.from || '').toLowerCase()); if (inviter) send(inviter, { type: 'group-error', message: `${socket.nick || 'GRACZ'} ODRZUCIŁ ZAPROSZENIE` }); return; }
    if (message.type === 'group-leave') { const group = socket.groupId && groups.get(socket.groupId); if (group) { group.members.delete(socket); socket.groupId = ''; if (group.members.size < 2) { groups.delete(group.id); group.members.forEach(member => { member.groupId = ''; send(member, { type: 'group-state', groupId: '', members: [] }); }); } else group.members.forEach(member => send(member, groupState(group))); } return; }
    if (message.type === 'profile-update') { socket.profile = safeProfile(message.profile); return; }
    if (message.type === 'queue-random') { socket.profile = safeProfile(message.profile || socket.profile); enqueueRandom(socket); return; }
    if (message.type === 'queue-cancel') { removeFromQueue(socket); send(socket, { type: 'queue-cancelled' }); return; }
    if (message.type === 'join') {
      const code = String(message.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!code || socket.room) return;
      const room = rooms.get(code) || new Set();
      if (room.size >= 2) { send(socket, { type: 'room-full' }); return; }
      room.add(socket);
      rooms.set(code, room);
      socket.room = code;
      socket.nick = String(message.nick || socket.nick || 'GRACZ');
      socket.profile = safeProfile(message.profile || socket.profile);
      send(socket, { type: 'waiting', code });
      if (room.size === 2) { const players = [...room]; players.forEach((player, index) => { player.teamId = `${code}:${index}`; }); const participants = players.map(player => ({ nick: player.nick, teamId: player.teamId, ...player.profile })); players.forEach((player, index) => { const opponent = { nick: players[1 - index].nick, ...players[1 - index].profile }; send(player, { type: 'matched', teamId: player.teamId, team: [player.nick], opponents: [opponent], opponent, players: participants }); }); }
      return;
    }
    if (!socket.room) return;
    if (message.type === 'game-over') { finishRoom(socket, message); return; }
    if (message.type === 'damage' && message.targetNick) {
      const target = [...(rooms.get(socket.room) || [])].find(player => player.nick?.toLowerCase() === String(message.targetNick).toLowerCase());
      if (target) send(target, { ...message, fromNick: socket.nick });
      return;
    }
    if (['state', 'spell', 'damage', 'reflect'].includes(message.type)) broadcast(rooms.get(socket.room), socket, message);
  });
  socket.on('close', () => leaveRoom(socket));
  socket.on('error', () => leaveRoom(socket));
});

server.listen(port, host, () => console.log(`Walka Czarodziejow: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`));
