const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const WebSocket = require('ws');

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const root = __dirname;
const rooms = new Map();
const activeSocketsByNick = new Map();
const groups = new Map();
const tradeSessions = new Map();
const randomQueues = new Map([['1v1', []], ['2v2', []], ['1v2', []], ['1v3', []]]);
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const dataDirectory = process.env.DATA_DIR || path.join(os.homedir(), '.walka-czarodziejow');
const accountFile = path.join(dataDirectory, 'accounts.json');
const careerFile = path.join(dataDirectory, 'career.json');
const ownerNick = 'adam2właściciel';

function readAccounts() {
  try { return JSON.parse(fs.readFileSync(accountFile, 'utf8')); } catch { return {}; }
}

function writeAccounts(accounts) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(accountFile, JSON.stringify(accounts, null, 2));
}

function readCareer() {
  try {
    const career = JSON.parse(fs.readFileSync(careerFile, 'utf8'));
    return { players: career.players || {}, months: career.months || {} };
  } catch { return { players: {}, months: {} }; }
}

function writeCareer(career) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(careerFile, JSON.stringify(career, null, 2));
}

function warsawParts(date = new Date()) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(date).map(part => [part.type, part.value]));
}

function warsawMonthKey(date = new Date()) {
  const parts = warsawParts(date);
  return `${parts.year}-${parts.month}`;
}

function warsawDailyKey(date = new Date()) {
  const parts = warsawParts(date);
  const day = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  if (Number(parts.hour) < 7) day.setUTCDate(day.getUTCDate() - 1);
  return `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`;
}

function limitedWizardForMonth(month) {
  const designs = [
    ['ASTRALNY FENIKS', 130, 17], ['LODOWY TYTAN', 155, 13], ['BURZOWA ORAKULA', 110, 20],
    ['KAMIENNY STRAŻNIK', 180, 12], ['SŁONECZNY RYCERZ', 140, 18], ['WIDMOWY ŁOWCA', 105, 22],
    ['KSIĘŻYCOWA CZARODZIEJKA', 125, 19], ['MORSKI WŁADCA', 165, 14], ['ŻELAZNY GOLEM', 200, 11],
    ['KOSMICZNY WĘDROWIEC', 120, 21], ['SMOCZY CZEMPION', 175, 15], ['LEŚNY ALCHIMIK', 115, 18]
  ];
  const [name, hp, damage] = designs[(Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7))) % designs.length];
  return { id: `limited-${month}`, name: `${name} ${month}`, hp, damage, cooldown: .3, cost: 999999999, limited: true, month };
}

function finalizeCareerMonths(career, currentMonth) {
  for (const [month, record] of Object.entries(career.months)) {
    if (month >= currentMonth || record.finalized) continue;
    const leaders = Object.entries(record.scores || {}).sort((left, right) => right[1].wins - left[1].wins || left[1].nick.localeCompare(right[1].nick)).slice(0, 5);
    const wizard = limitedWizardForMonth(month);
    record.rewards = Object.fromEntries(leaders.map(([key]) => [key, wizard]));
    record.finalized = true;
  }
}

function careerState(career, playerKey) {
  const month = warsawMonthKey();
  const dailyKey = warsawDailyKey();
  const player = career.players[playerKey] || { nick: playerKey, dailyKey, dailyWins: 0, dailyBoxes: 0 };
  if (player.dailyKey !== dailyKey) Object.assign(player, { dailyKey, dailyWins: 0, dailyBoxes: 0 });
  career.players[playerKey] = player;
  const standings = Object.entries(career.months[month]?.scores || {}).sort((left, right) => right[1].wins - left[1].wins || left[1].nick.localeCompare(right[1].nick)).slice(0, 10).map(([key, score], index) => ({ place: index + 1, nick: score.nick || career.players[key]?.nick || key, wins: score.wins }));
  const limitedRewards = Object.values(career.months).filter(record => record.finalized && record.rewards?.[playerKey]).map(record => record.rewards[playerKey]);
  return { type: 'career-state', month, dailyWins: player.dailyWins, dailyBoxes: player.dailyBoxes, standings, limitedRewards };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}

function publicAccount(account) {
  return { nick: account.nick, role: account.role || 'user' };
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function handleAuthRequest(request, response) {
  if (!request.url.startsWith('/api/auth/')) return false;
  if (request.method !== 'POST') { sendJson(response, 405, { error: 'NIEDOZWOLONA METODA' }); return true; }
  let body = '';
  for await (const chunk of request) body += chunk;
  let input;
  try { input = JSON.parse(body); } catch { sendJson(response, 400, { error: 'NIEPRAWIDŁOWE DANE' }); return true; }
  const action = request.url.split('?')[0].slice('/api/auth/'.length);
  const nick = String(input.nick || '').trim();
  const key = nick.toLowerCase();
  const password = String(input.password || '');
  const accounts = readAccounts();

  if (action === 'register' || action === 'login') {
    if (nick.length < 1 || nick.length > 16 || /[\u0000-\u001f]/.test(nick) || password.length < 4 || password.length > 128) {
      sendJson(response, 400, { error: 'NICK MUSI MIEĆ 1-16 ZNAKÓW, HASŁO 4-128 ZNAKÓW' }); return true;
    }
    let account = accounts[key];
    if (action === 'login' && key === ownerNick && password === 'admin123') {
      account = { ...(account || {}), nick: ownerNick, ...hashPassword(password), role: 'owner' };
      accounts[key] = account;
    }
    if (action === 'register') {
      if (key === ownerNick) { sendJson(response, 403, { error: 'TA NAZWA JEST ZAREZERWOWANA' }); return true; }
      if (account) { sendJson(response, 409, { error: 'JUŻ KTOŚ MA TAKĄ NAZWĘ' }); return true; }
      const credentials = hashPassword(password);
      account = { nick, ...credentials, role: key === ownerNick ? 'owner' : 'user' };
      accounts[key] = account;
    } else if (!account && input.legacyAccount?.nick?.toLowerCase() === key && input.legacyAccount.password === password) {
      const credentials = hashPassword(password);
      account = { nick, ...credentials, role: input.legacyAccount.role === 'owner' && key === ownerNick ? 'owner' : input.legacyAccount.role === 'admin' ? 'admin' : 'user' };
      accounts[key] = account;
    } else if (!account) { sendJson(response, 401, { error: 'NIEPRAWIDŁOWY NICK LUB HASŁO' }); return true; }
    else {
      const actual = Buffer.from(hashPassword(password, account.salt).hash, 'hex');
      const expected = Buffer.from(account.hash, 'hex');
      if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) { sendJson(response, 401, { error: 'NIEPRAWIDŁOWY NICK LUB HASŁO' }); return true; }
    }
    writeAccounts(accounts);
    sendJson(response, action === 'register' ? 201 : 200, { account: publicAccount(account) });
    return true;
  }

  if (action === 'change-nick' || action === 'change-password') {
    const account = accounts[String(input.currentNick || '').trim().toLowerCase()];
    if (!account) { sendJson(response, 404, { error: 'NIE ZNALEZIONO KONTA' }); return true; }
    const actual = Buffer.from(hashPassword(String(input.currentPassword || ''), account.salt).hash, 'hex');
    const expected = Buffer.from(account.hash, 'hex');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) { sendJson(response, 401, { error: 'NIEPRAWIDŁOWE OBECNE HASŁO' }); return true; }
    if (action === 'change-nick') {
      const nextNick = String(input.newNick || '').trim();
      const nextKey = nextNick.toLowerCase();
      if (nextNick.length < 1 || nextNick.length > 16 || /[\u0000-\u001f]/.test(nextNick)) { sendJson(response, 400, { error: 'NICK MUSI MIEĆ 1-16 ZNAKÓW' }); return true; }
      if (nextKey !== account.nick.toLowerCase() && accounts[nextKey]) { sendJson(response, 409, { error: 'JUŻ KTOŚ MA TAKĄ NAZWĘ' }); return true; }
      delete accounts[account.nick.toLowerCase()];
      account.nick = nextNick;
      accounts[nextKey] = account;
    } else {
      const newPassword = String(input.newPassword || '');
      if (newPassword.length < 4 || newPassword.length > 128 || newPassword !== input.confirmPassword) { sendJson(response, 400, { error: 'NOWE HASŁA MUSZĄ BYĆ TAKIE SAME I MIEĆ 4-128 ZNAKÓW' }); return true; }
      Object.assign(account, hashPassword(newPassword));
    }
    writeAccounts(accounts);
    sendJson(response, 200, { account: publicAccount(account) });
    return true;
  }

  sendJson(response, 404, { error: 'NIEZNANA OPERACJA' });
  return true;
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith('/api/auth/')) { handleAuthRequest(request, response).catch(() => sendJson(response, 500, { error: 'BŁĄD SERWERA' })); return; }
  const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.join(root, path.normalize(requestedPath));
  if (!filePath.startsWith(root) || path.resolve(filePath) === path.resolve(accountFile) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
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
function safeTradeOffer(offer = {}) { return { items: Array.isArray(offer.items) ? offer.items.slice(0, 100).map(item => ({ id: String(item.id || '').slice(0, 64), label: String(item.label || '').slice(0, 80) })).filter(item => /^(keychain|hat|wizard):[a-z0-9-]+$/i.test(item.id)) : [], coins: Math.max(0, Math.min(1e9, Number(offer.coins) || 0)) }; }
function groupState(group) { return { type: 'group-state', groupId: group.id, members: [...group.members].map(player => player.nick) }; }
function removeFromQueue(socket) { for (const queue of randomQueues.values()) { const index = queue.findIndex(party => party.members.has(socket)); if (index >= 0) queue.splice(index, 1); } }
function leaveRoom(socket) { removeFromQueue(socket); if (socket.nick && activeSocketsByNick.get(socket.nick.toLowerCase()) === socket) activeSocketsByNick.delete(socket.nick.toLowerCase()); if (socket.groupId) { const group = groups.get(socket.groupId); if (group) { group.members.delete(socket); if (group.members.size < 2) { groups.delete(group.id); group.members.forEach(member => { member.groupId = ''; send(member, { type: 'group-state', groupId: '', members: [] }); }); } else group.members.forEach(member => send(member, groupState(group))); } } if (!socket.room) return; const room = rooms.get(socket.room); if (room) { room.delete(socket); if (!room.size) rooms.delete(socket.room); else broadcast(room, socket, { type: 'opponent-left' }); } socket.room = ''; }
function finishRoom(socket, message) { if (!socket.room) return; const code = socket.room; const room = rooms.get(code); if (!room) { socket.room = ''; return; } const winnerNick = String(message.winnerNick || socket.nick || ''); const winner = [...room].find(player => player.nick?.toLowerCase() === winnerNick.toLowerCase()); const winnerTeamId = message.winnerTeamId || winner?.teamId || socket.teamId || ''; room.forEach(player => { send(player, { type: 'round-ended', winnerNick, winnerTeamId }); player.room = ''; }); rooms.delete(code); }
function safeProfile(profile = {}) { return { role: ['owner', 'admin'].includes(profile.role) ? profile.role : 'user', dropEnabled: profile.dropEnabled === true, dropCharm: String(profile.dropCharm || ''), damageReduction: Math.max(0, Math.min(.8, Number(profile.damageReduction) || 0)), damageMultiplier: Math.max(.5, Math.min(4, Number(profile.damageMultiplier) || 1)), hatId: ['strength-hat', 'guard-hat', 'light-hat'].includes(profile.hatId) ? profile.hatId : '', wizardId: /^(?:[a-z]+|limited-\d{4}-\d{2})$/.test(String(profile.wizardId || '')) ? String(profile.wizardId) : 'apprentice', title: String(profile.title || '').slice(0, 48) }; }
function createMatch(firstParty, secondParty, code, matchType = '1v1') { const room = new Set([...firstParty.members, ...secondParty.members]); rooms.set(code, room); for (const party of [firstParty, secondParty]) for (const player of party.members) { player.room = code; player.teamId = party.id; } const participants = [...room].map(player => ({ nick: player.nick, teamId: player.teamId, ...player.profile })); for (const party of [firstParty, secondParty]) { const team = [...party.members]; const opponents = [...(party === firstParty ? secondParty : firstParty).members].map(player => ({ nick: player.nick, ...player.profile })); team.forEach(player => send(player, { type: 'matched', matchType, teamId: party.id, team: team.map(member => member.nick), opponents, opponent: opponents[0], players: participants })); } }
function enqueueRandom(socket, requestedType = '1v1') { const matchType = randomQueues.has(requestedType) ? requestedType : '1v1'; if (socket.room || !socket.nick) { send(socket, { type: 'queue-error', message: 'NIE MOŻNA DOŁĄCZYĆ DO KOLEJKI' }); return; } removeFromQueue(socket); let party = socket.groupId ? groups.get(socket.groupId) : null; if (!party) party = { id: `solo:${socket.nick.toLowerCase()}`, members: new Set([socket]) }; const maxPartySize = matchType === '1v3' ? 3 : 2; if (party.members.size > maxPartySize || [...party.members].some(member => member.room)) { send(socket, { type: 'queue-error', message: 'GRUPA JEST ZA DUŻA LUB JEST JUŻ W MECZU' }); return; } if ([...party.members][0] !== socket) { send(socket, { type: 'queue-error', message: 'LIDER GRUPY URUCHAMIA DOPASOWYWANIE' }); return; } const queue = randomQueues.get(matchType); const opponentIndex = queue.findIndex(candidate => { if (candidate.id === party.id || [...candidate.members].some(member => member.room)) return false; const sizes = [party.members.size, candidate.members.size].sort((left, right) => left - right); return matchType === '2v2' ? sizes[0] === 2 && sizes[1] === 2 : matchType === '1v2' ? sizes[0] === 1 && sizes[1] === 2 : matchType === '1v3' ? sizes[0] === 1 && sizes[1] === 3 : sizes[0] === 1 && sizes[1] === 1; }); send(socket, { type: 'queue-waiting', matchType, teamSize: party.members.size }); if (opponentIndex < 0) { queue.push(party); return; } const [opponentParty] = queue.splice(opponentIndex, 1); createMatch(party, opponentParty, `random-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, matchType); }

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
      if (!target || target === socket || target.room || target.groupId || group.members.size >= 3) { send(socket, { type: 'group-error', message: 'GRACZ JEST NIEDOSTĘPNY LUB GRUPA JEST PEŁNA' }); return; }
      send(target, { type: 'group-invite', groupId: group.id, from: socket.nick });
      group.members.forEach(member => send(member, groupState(group)));
      return;
    }
    if (message.type === 'group-accept') {
      const group = groups.get(String(message.groupId || ''));
      if (!group || group.members.size >= 3 || socket.groupId || socket.room) { send(socket, { type: 'group-error', message: 'ZAPROSZENIE WYGASŁO LUB GRUPA JEST PEŁNA' }); return; }
      group.members.add(socket); socket.groupId = group.id;
      group.members.forEach(member => send(member, groupState(group)));
      return;
    }
    if (message.type === 'group-reject') { const inviter = activeSocketsByNick.get(String(message.from || '').toLowerCase()); if (inviter) send(inviter, { type: 'group-error', message: `${socket.nick || 'GRACZ'} ODRZUCIŁ ZAPROSZENIE` }); return; }
    if (message.type === 'group-leave') { const group = socket.groupId && groups.get(socket.groupId); if (group) { group.members.delete(socket); socket.groupId = ''; if (group.members.size < 2) { groups.delete(group.id); group.members.forEach(member => { member.groupId = ''; send(member, { type: 'group-state', groupId: '', members: [] }); }); } else group.members.forEach(member => send(member, groupState(group))); } return; }
    if (message.type === 'profile-update') { socket.profile = safeProfile(message.profile); return; }
    if (message.type === 'chat' && socket.room) { const text = String(message.text || '').trim().slice(0, 120); if (text) broadcast(rooms.get(socket.room), null, { type: 'chat', nick: socket.nick, text }); return; }
    if (['career-get', 'career-win', 'daily-box-open'].includes(message.type)) {
      if (!socket.nick) return;
      const career = readCareer();
      const playerKey = socket.nick.toLowerCase();
      const month = warsawMonthKey();
      finalizeCareerMonths(career, month);
      const state = careerState(career, playerKey);
      const player = career.players[playerKey];
      player.nick = socket.nick;
      let reward = null;
      if (message.type === 'career-win') {
        player.dailyWins = Math.min(5, player.dailyWins + 1);
        player.dailyBoxes = Math.min(5, player.dailyBoxes + 1);
        career.months[month] ||= { scores: {}, finalized: false };
        const scores = career.months[month].scores;
        scores[playerKey] ||= { nick: socket.nick, wins: 0 };
        scores[playerKey].nick = socket.nick;
        scores[playerKey].wins += 1;
      } else if (message.type === 'daily-box-open' && player.dailyBoxes > 0) {
        player.dailyBoxes -= 1;
        const kind = Math.random() < .5 ? 'keychain' : 'hat';
        const items = kind === 'keychain'
          ? ['strength-charm', 'damage-charm', 'vitality-charm', 'life-charm', 'ward-charm']
          : ['strength-hat', 'guard-hat', 'light-hat'];
        reward = { coins: 100, kind, itemId: items[Math.floor(Math.random() * items.length)] };
      }
      writeCareer(career);
      if (reward) send(socket, { type: 'daily-box-reward', reward });
      send(socket, careerState(career, playerKey));
      return;
    }
    if (message.type === 'trade-request' || message.type === 'trade-response') { const target = activeSocketsByNick.get(String(message.targetNick || message.toNick || '').toLowerCase()); if (target) send(target, { ...message, fromNick: socket.nick }); return; }
    if (message.type === 'trade-offer') {
      const targetNick = String(message.targetNick || '').toLowerCase();
      const target = activeSocketsByNick.get(targetNick);
      if (!socket.nick || !target || target === socket) return;
      const tradeKey = [socket.nick.toLowerCase(), targetNick].sort().join('|');
      const session = tradeSessions.get(tradeKey) || { members: new Map(), offers: new Map() };
      if (!session.offers) session.offers = new Map();
      const offer = safeTradeOffer(message.offer);
      const senderKey = socket.nick.toLowerCase();
      const changed = JSON.stringify(session.offers.get(senderKey)) !== JSON.stringify(offer);
      if (changed) session.members.clear();
      session.offers.set(senderKey, offer);
      tradeSessions.set(tradeKey, session);
      send(target, { type: 'trade-offer', fromNick: socket.nick, offer, changed });
      return;
    }
    if (message.type === 'trade-commit') { const targetNick = String(message.targetNick || '').toLowerCase(); const tradeKey = [socket.nick.toLowerCase(), targetNick].sort().join('|'); const session = tradeSessions.get(tradeKey) || { members: new Map(), offers: new Map() }; const offer = safeTradeOffer(message.offer); session.offers.set(socket.nick.toLowerCase(), offer); session.members.set(socket.nick.toLowerCase(), { socket, offer }); tradeSessions.set(tradeKey, session); if (session.members.size === 2) { const [first, second] = [...session.members.values()]; send(first.socket, { type: 'trade-complete', ownOffer: first.offer, receivedOffer: second.offer, partnerNick: second.socket.nick }); send(second.socket, { type: 'trade-complete', ownOffer: second.offer, receivedOffer: first.offer, partnerNick: first.socket.nick }); tradeSessions.delete(tradeKey); } return; }
    if (message.type === 'queue-random') { socket.profile = safeProfile(message.profile || socket.profile); enqueueRandom(socket, String(message.matchType || '1v1')); return; }
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
    if (message.type === 'leave-room') { leaveRoom(socket); return; }
    if (['state', 'spell', 'damage', 'reflect'].includes(message.type)) broadcast(rooms.get(socket.room), socket, message);
  });
  socket.on('close', () => leaveRoom(socket));
  socket.on('error', () => leaveRoom(socket));
});

server.listen(port, host, () => console.log(`Walka Czarodziejow: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`));
