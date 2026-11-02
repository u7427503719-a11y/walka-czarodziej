//game js
addEventListener('storage', event => { if (!matchRoomKey || event.key !== matchRoomKey || !event.newValue) return; const room = JSON.parse(event.newValue); if (room.started && room.players.length === 2 && !running) { joined = true; mode = 'player'; ui.join.textContent = 'PRZECIWNIK ZNALEZIONY // START'; startGame('player'); } });
const canvas = document.getElementById('gameCanvas');
let rankingMode = "top20"; // albo "top10"
const ctx = canvas.getContext('2d');
const chestModal = document.getElementById('chestModal');
const chestResult = document.getElementById('chestResult');
const keychainCollection = document.getElementById('keychainCollection');
addEventListener('click', event => {
  if (event.target.closest('#backpackButton')) { document.getElementById('backpackModal').classList.remove('hidden'); updateBackpack(); }
  if (event.target.closest('#backpackClose')) document.getElementById('backpackModal').classList.add('hidden');
  if (event.target.closest('#chestClose')) chestModal.classList.add('hidden');
  if (event.target.closest('#dailyMissionButton')) { careerUi.chestModal.classList.remove('hidden'); careerUi.chestResult.textContent = ''; refreshCareer(); }
  if (event.target.closest('#dailyBoxOpenButton')) openDailyBox();
  if (event.target.closest('#leaderboardButton')) openLeaderboard();
  if (event.target.closest('#leaderboardClose')) careerUi.leaderboardModal.classList.add('hidden');
  const chest = event.target.closest('[data-chest]');
  if (chest) openChest(chest.dataset.chest);
  const pass = event.target.closest('[data-pass]');
  if (pass) window.selectPass?.(pass.dataset.pass);
  const passAction = event.target.closest('[data-pass-action]');
  if (passAction) window.handlePassAction?.(passAction.dataset.passAction);
});
const auth = { screen: document.getElementById('authScreen'), registerTab: document.getElementById('registerTab'), loginTab: document.getElementById('loginTab'), registerForm: document.getElementById('registerForm'), loginForm: document.getElementById('loginForm'), registerNick: document.getElementById('registerNick'), registerPassword: document.getElementById('registerPassword'), registerNickError: document.getElementById('registerNickError'), loginNick: document.getElementById('loginNick'), loginPassword: document.getElementById('loginPassword'), loginError: document.getElementById('loginError') };
const ownerUi = { panel: document.getElementById('ownerPanel'), panelBody: document.getElementById('ownerPanelBody'), toggle: document.getElementById('ownerToggleButton'), target: document.getElementById('ownerTarget'), coins: document.getElementById('ownerCoins'), wizard: document.getElementById('ownerWizard'), message: document.getElementById('ownerMessage'), addAdmin: document.getElementById('addAdminButton'), ban: document.getElementById('banButton'), unban: document.getElementById('unbanButton'), giveCoins: document.getElementById('giveCoinsButton'), takeCoins: document.getElementById('takeCoinsButton'), resetAccount: document.getElementById('resetAccountButton'), resetRanking: document.getElementById('resetRankingButton'), giveWizard: document.getElementById('giveWizardButton') };
ownerUi.password = document.getElementById('ownerPassword');
ownerUi.verifyPassword = document.getElementById('verifyOwnerPasswordButton');
ownerUi.grantOctober = document.getElementById('grantOctoberButton');
let ownerPasswordVerified = false, verifiedOwnerPassword = '';
const profileUi = { button: document.getElementById('profileButton'), avatar: document.getElementById('profileAvatar'), modal: document.getElementById('profileModal'), close: document.getElementById('profileClose'), name: document.getElementById('profileName'), editor: document.getElementById('avatarDrawCanvas'), clear: document.getElementById('avatarClear'), save: document.getElementById('avatarSave'), dropEnabled: document.getElementById('dropEnabled'), dropCharm: document.getElementById('dropKeychain'), title: document.getElementById('titleSelect'), showNick: document.getElementById('showNickChange'), showPassword: document.getElementById('showPasswordChange'), nickForm: document.getElementById('nickChangeForm'), passwordForm: document.getElementById('passwordChangeForm') };
const accountUi = { list: document.getElementById('profileAccountList'), details: document.getElementById('accountDetails'), name: document.getElementById('accountStatsName'), coins: document.getElementById('accountStatsCoins'), characters: document.getElementById('accountCharacters'), delete: document.getElementById('deleteAccountButton'), confirm: document.getElementById('confirmDeleteModal'), confirmYes: document.getElementById('confirmDeleteYes'), confirmNo: document.getElementById('confirmDeleteNo') };
const newsUi = { button: document.getElementById('newsButton'), modal: document.getElementById('newsModal'), close: document.getElementById('newsClose'), lists: { new: document.getElementById('newNewsList'), changed: document.getElementById('changedNewsList'), removed: document.getElementById('removedNewsList') }, music: document.getElementById('musicButton') };
const careerUi = { dailyButton: document.getElementById('dailyMissionButton'), dailyBadge: document.getElementById('dailyMissionBadge'), dailyProgress: document.getElementById('dailyMissionProgress'), boxCount: document.getElementById('dailyBoxCount'), boxButton: document.getElementById('dailyBoxOpenButton'), chestModal: document.getElementById('chestModal'), chestResult: document.getElementById('chestResult'), leaderboardButton: document.getElementById('leaderboardButton'), leaderboardModal: document.getElementById('leaderboardModal'), leaderboardClose: document.getElementById('leaderboardClose'), leaderboardTitle: document.getElementById('leaderboardTitle'), leaderboardList: document.getElementById('leaderboardList'), leaderboardStatus: document.getElementById('leaderboardStatus') };
careerUi.rankLabel = document.getElementById('rankedRankLabel');
careerUi.leagueList = document.getElementById('rankedLeagueList');
const rankedLeagueOrder = ['OBSYDIAN', 'LAWA', 'WODA', 'ŻELAZO', 'BRĄZ', 'KAMIEŃ', 'DREWNO'];
careerUi.leagueList.innerHTML = rankedLeagueOrder.map(league => `<div class="ranked-ladder-row"><strong>${league}</strong>${[1, 2, 3].map(division => `<span data-rank="${league} ${division}">${league} ${division}</span>`).join('')}</div>`).join('');
let careerProgress = { month: '', wins: 0, boxes: 0, opening: false, rank: 'DREWNO 1', rankPoints: 0 };
const chatUi = { button: document.getElementById('chatButton'), modal: document.getElementById('chatModal'), close: document.getElementById('chatClose'), form: document.getElementById('chatForm'), input: document.getElementById('chatInput'), bubble: document.getElementById('chatBubble') };
const tradeUi = { requestModal: document.getElementById('tradeRequestModal'), requestText: document.getElementById('tradeRequestText'), accept: document.getElementById('tradeAccept'), reject: document.getElementById('tradeReject'), modal: document.getElementById('tradeModal'), close: document.getElementById('tradeClose'), cancel: document.getElementById('tradeCancel'), confirm: document.getElementById('tradeConfirm'), partnerName: document.getElementById('tradePartnerName'), ownItems: document.getElementById('tradeOwnItems'), partnerItems: document.getElementById('tradePartnerItems'), ownCoins: document.getElementById('tradeOwnCoins'), partnerCoins: document.getElementById('tradePartnerCoins'), status: document.getElementById('tradeStatus') };
const OWNER_NICK = 'adam';
const RESTRICTED_OWNER_NICK = 'szymon';
const OWNER_NICKS = [OWNER_NICK, RESTRICTED_OWNER_NICK];
let currentUser = '';
let sessionPassword = '';
let sessionToken = '';
let progressSyncTimer = 0;
let progressSyncQueue = Promise.resolve();
let logoutIntentional = false, opponentProfile = {}, matchRewardGranted = false, matchWinRecorded = false, avatarDrawing = false, accountPendingDelete = '';
function toggleOwnerPanel(forceCollapse) {
  const collapsed = typeof forceCollapse === 'boolean' ? forceCollapse : !ownerUi.panel.classList.contains('collapsed');
  ownerUi.panel.classList.toggle('collapsed', collapsed);
  ownerUi.toggle.textContent = collapsed ? 'ROZWIŃ' : 'ZWIŃ';
}
function getAccounts() { return JSON.parse(localStorage.getItem('arcanaAccounts') || '{}'); }
const progressMapNames = [
  'arcanaBalances', 'arcanaOwned', 'arcanaSelectedWizards', 'arcanaKeychains',
  'arcanaEquipped', 'arcanaKeychainLevels', 'arcanaDropEnabled', 'arcanaDropCharm',
  'arcanaAvatars', 'arcanaMatchBlocked', 'arcanaHats', 'arcanaHatLevels',
  'arcanaEquippedHat', 'arcanaWizardWins', 'arcanaSelectedTitle', 'arcanaFriends',
  'arcanaFriendRequests', 'arcanaBans', 'arcanaPlayerData', 'arcanaSkins', 'arcanaEquippedSkin'
];
function findLocalAccountEntryByNick(nick) {
  const normalized = String(nick || '').trim().toLowerCase();
  if (!normalized) return null;
  const accounts = getAccounts();
  return Object.entries(accounts).find(([key, account]) => key === normalized || String(account?.nick || '').trim().toLowerCase() === normalized) || null;
}
async function authRequest(action, data, includeResponse = false) { let response; try { response = await fetch(`/api/auth/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch { throw new Error('BRAK POŁĄCZENIA Z SERWEREM // OTWÓRZ GRĘ Z ADRESU KOMPUTERA'); } let result; try { result = await response.json(); } catch { throw new Error('NIEPRAWIDŁOWA ODPOWIEDŹ SERWERA'); } if (!response.ok) throw new Error(result.error || 'BŁĄD LOGOWANIA'); return includeResponse ? result : result.account; }
function getMap(name) { return JSON.parse(localStorage.getItem(name) || '{}'); }
function saveMap(name, value) { localStorage.setItem(name, JSON.stringify(value)); if (progressMapNames.includes(name)) scheduleProgressSync(); }
function collectAccountProgress(nick) {
  const key = nick.toLowerCase();
  const maps = {};
  for (const name of progressMapNames) {
    const map = getMap(name);
    if (Object.prototype.hasOwnProperty.call(map, key)) maps[name] = { __arcanaValue: map[key] };
  }
  const account = getAccounts()[key];
  return { account: { coins: Number(account?.coins ?? getMap('arcanaBalances')[key] ?? 0) || 0 }, maps };
}
function hasAccountProgress(progress) {
  return Number(progress?.account?.coins) > 0 ||
    Object.values(progress?.maps || {}).some(entry => {
      const value = entry && typeof entry === 'object' && Object.prototype.hasOwnProperty.call(entry, '__arcanaValue')
        ? entry.__arcanaValue
        : entry;
      return value && typeof value === 'object' ? Object.keys(value).length > 0 : Boolean(value);
    });
}
function applyAccountProgress(nick, progress) {
  const key = nick.toLowerCase();
  for (const name of progressMapNames) {
    const map = getMap(name);
    const entry = progress?.maps?.[name];
    if (entry && typeof entry === 'object' && !Array.isArray(entry) && Object.prototype.hasOwnProperty.call(entry, '__arcanaValue')) {
      map[key] = entry.__arcanaValue;
    } else if (entry !== undefined) {
      map[key] = entry;
    } else {
      delete map[key];
    }
    saveMap(name, map);
  }
}
function scheduleProgressSync() {
  if (!currentUser || !sessionPassword) return;
  const nick = currentUser;
  const password = sessionPassword;
  const progress = collectAccountProgress(nick);
  clearTimeout(progressSyncTimer);
  progressSyncTimer = setTimeout(() => {
    progressSyncQueue = progressSyncQueue
      .then(() => authRequest('sync-progress', { nick, password, progress }))
      .catch(error => {
        console.error('Nie udało się zsynchronizować postępów:', error);
        setToast('NIE UDAŁO SIĘ ZAPISAĆ POSTĘPÓW NA SERWERZE');
      });
  }, 500);
}
function flushProgressSync() {
  if (!currentUser || !sessionPassword) return;
  clearTimeout(progressSyncTimer);
  const body = JSON.stringify({
    nick: currentUser,
    password: sessionPassword,
    progress: collectAccountProgress(currentUser)
  });
  fetch('/api/auth/sync-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).then(async response => {
    if (response.ok) return;
    let result;
    try { result = await response.json(); } catch { result = null; }
    throw new Error(result?.error || `BŁĄD ZAPISU POSTĘPÓW (${response.status})`);
  }).catch(error => console.error('Nie udało się wysłać postępów na serwer:', error));
}
function ensureOwnerAccount() {
  const accounts = getAccounts();
  const ownerKeys = OWNER_NICKS.map(nick => nick.toLowerCase());
  OWNER_NICKS.forEach(nick => {
    const key = nick.toLowerCase();
    if (!accounts[key]) accounts[key] = { nick, role: 'owner' };
    else accounts[key].role = 'owner';
  });

  Object.keys(accounts).forEach(accountKey => {
    const account = accounts[accountKey];
    if (!account || typeof account !== 'object') return;
    if (account.role === 'owner' && !ownerKeys.includes(accountKey)) {
      account.role = 'user';
    }
  });

  const inventory = getMap('arcanaKeychains');
  const equipped = getMap('arcanaEquipped');
  Object.keys(accounts).forEach(accountKey => {
    const account = accounts[accountKey];
    const allowedSpecial = ownerKeys.includes(accountKey) ? ['owner-charm'] : account?.role === 'admin' ? ['admin-charm'] : [];
    inventory[accountKey] = (inventory[accountKey] || []).filter(id => !['owner-charm', 'admin-charm'].includes(id) || allowedSpecial.includes(id));
    if (allowedSpecial.length) inventory[accountKey] = Array.from(new Set([...inventory[accountKey], ...allowedSpecial]));
    equipped[accountKey] = (equipped[accountKey] || []).filter(id => !['owner-charm', 'admin-charm'].includes(id) || allowedSpecial.includes(id));
    if (allowedSpecial.length) equipped[accountKey] = Array.from(new Set([...allowedSpecial, ...equipped[accountKey]])).slice(0, 3);
  });
  saveMap('arcanaKeychains', inventory);
  saveMap('arcanaEquipped', equipped);
  localStorage.setItem('arcanaAccounts', JSON.stringify(accounts));
}
function persistCoins() { const balances = getMap('arcanaBalances'); const accounts = getAccounts(); balances[currentUser.toLowerCase()] = coins; if (accounts[currentUser.toLowerCase()]) accounts[currentUser.toLowerCase()].coins = coins; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); localStorage.setItem('arcanaCoins', coins); }
function persistPlayerData() { if (!currentUser || !window.playerData?.[currentUser]) return; const data = getMap('arcanaPlayerData'); data[currentUser.toLowerCase()] = window.playerData[currentUser]; saveMap('arcanaPlayerData', data); }
Object.defineProperty(window, 'playerMoney', { configurable: true, get: () => coins, set: value => { coins = Math.max(0, Number(value) || 0); if (currentUser) persistCoins(); } });
const chests = {
  hats: { rewards: [{ id: 'strength-hat', chance: .01 }, { id: 'guard-hat', chance: .49 }, { id: 'light-hat', chance: .50 }] },
  keychains: { rewards: [{ id: 'strength-charm', chance: .12 }, { id: 'damage-charm', chance: .38 }, { id: 'vitality-charm', chance: .25 }, { id: 'life-charm', chance: .15 }, { id: 'ward-charm', chance: .10 }] }
};
const keychains = { 'strength-charm': { name: 'TALIZMAN SIŁY', rarity: 'LEGENDARNY', damageMultiplier: 1.2 }, 'damage-charm': { name: 'BRELOK MOCY', rarity: 'NIEZWYKŁY', damageMultiplier: 1.005 }, 'vitality-charm': { name: 'SERCE ARENY', rarity: 'RZADKI', healthPercent: .1 }, 'life-charm': { name: 'KAMIEŃ ŻYCIA', rarity: 'NIEZWYKŁY', healthBonus: 10 }, 'ward-charm': { name: 'RUNICZNA OSŁONA', rarity: 'RZADKI', damageReduction: .1 }, 'owner-charm': { name: 'ZNAK WŁAŚCICIELA', rarity: 'MITYCZNY', damageMultiplier: 1.2, damageReduction: .15 }, 'admin-charm': { name: 'ODZNAKA ADMINA', rarity: 'EPICKI', damageMultiplier: 1.07, damageReduction: .1 } };
const hats = { 'strength-hat': { name: 'KAPELUSZ MOCY', rarity: 'LEGENDARNY', damageMultiplier: 1.05, symbol: '♛' }, 'guard-hat': { name: 'KAPELUSZ STRAŻNIKA', rarity: 'RZADKI', damageReduction: .05, symbol: '◆' }, 'light-hat': { name: 'LEKKA OSŁONA', rarity: 'NIEZWYKŁY', damageReduction: .025, symbol: '◇' } };
const mageSkins = {
  gold: { name: 'ZŁOTY', value: 10000, player: '#ffd43b', opponent: '#8b5cf6', ally: '#62c987', playerAccent: '#fff0a3', opponentAccent: '#c4a8ff', allyAccent: '#b7f2c9', colors: 'TY: ŻÓŁTY // PRZECIWNIK: FIOLETOWY // SOJUSZNIK: ZIELONY' },
  spark: { name: 'ISKRA', value: 23000, player: '#ff922b', opponent: '#3485eb', ally: '#53d5d0', playerAccent: '#ffd0a1', opponentAccent: '#b6d8ff', allyAccent: '#b6fff4', colors: 'TY: POMARAŃCZOWY // PRZECIWNIK: NIEBIESKI // SOJUSZNIK: TURKUSOWY' },
  spring: { name: 'WIOSENNY', value: 35000, player: '#45c46a', opponent: '#ed5b9b', ally: '#ffad42', playerAccent: '#b7f2c9', opponentAccent: '#ffc0dc', allyAccent: '#ffe0a6', colors: 'TY: ZIELONY // PRZECIWNIK: RÓŻOWY // SOJUSZNIK: POMARAŃCZOWY' },
  monochrome: { name: 'MONOCHROMATYCZNY', value: 50000, player: '#ffffff', opponent: '#171717', ally: '#888888', playerAccent: '#d9d9d9', opponentAccent: '#555555', allyAccent: '#c4c4c4', colors: 'TY: BIAŁY // PRZECIWNIK: CZARNY // SOJUSZNIK: SZARY' }
};
const passCharacters = {
  vip: { name: 'ELEKTRYCZNY', pass: 'VIP', wizardId: 'electric' },
  svip: { name: 'ILUZJONISTA', pass: 'SVIP', wizardId: 'illusionist' },
  gvip: { name: 'PIORUN', pass: 'GVIP', wizardId: 'thunder' },
  premium: { name: 'WŁADCA ORŁÓW', pass: 'PREMIUM', wizardId: 'eaglelord' }
};
function grantPassCharacter(passId) {
  const character = passCharacters[passId];
  if (!character || !currentUser) return;
  const key = currentUser.toLowerCase();
  const accounts = getAccounts();
  const owned = getMap('arcanaOwned');
  const wizardIds = Array.from(new Set([...(owned[key] || []), ...(accounts[key]?.wizards || []), character.wizardId]));
  owned[key] = wizardIds;
  if (accounts[key]) accounts[key].wizards = wizardIds;
  saveMap('arcanaOwned', owned);
  localStorage.setItem('arcanaAccounts', JSON.stringify(accounts));
  updateShop();
}
function migrateOldPassCharacters() {
  const key = currentUser.toLowerCase();
  const previous = getMap('arcanaSkins');
  const previousItems = Array.isArray(previous[key]) ? previous[key] : [];
  const equippedId = getMap('arcanaEquippedSkin')[key];
  const legacyPassSkins = { 'vip-electric': 'vip', 'svip-illusionist': 'svip', 'gvip-thunder': 'gvip', 'premium-eagle': 'premium' };
  previousItems.forEach(id => {
    const passId = legacyPassSkins[id];
    if (passId) grantPassCharacter(passId);
  });
  const equipped = passCharacters[legacyPassSkins[equippedId]];
  if (equipped) {
    grantPassCharacter(equipped.pass.toLowerCase());
    useWizard(equipped.wizardId);
  }
  previous[key] = previousItems.filter(id => !legacyPassSkins[id]);
  saveMap('arcanaSkins', previous);
  if (legacyPassSkins[equippedId]) {
    const equippedMap = getMap('arcanaEquippedSkin');
    delete equippedMap[key];
    saveMap('arcanaEquippedSkin', equippedMap);
  }
}
function getMageSkinInventory() { const inventory = getMap('arcanaSkins')[currentUser.toLowerCase()]; return Array.isArray(inventory) ? inventory : []; }
function getEquippedMageSkin() {
  const id = getMap('arcanaEquippedSkin')[currentUser.toLowerCase()] || '';
  return getMageSkinInventory().includes(id) && mageSkins[id] ? id : '';
}
function ownsMageSkin(id) {
  const account = currentUser ? playerData?.[currentUser] : null;
  const passId = { gold: 'vip', spark: 'svip', spring: 'gvip', monochrome: 'premium' }[id];
  return getMageSkinInventory().includes(id) || Boolean(passId && (account?.ownedPass?.includes(passId) || account?.[passId]));
}
window.grantPassCharacter = grantPassCharacter;
function getKeychains() { return getMap('arcanaKeychains')[currentUser.toLowerCase()] || []; }
function getEquippedKeychains() { return (getMap('arcanaEquipped')[currentUser.toLowerCase()] || []).filter(id => getKeychains().includes(id) && keychains[id]); }
function getKeychainLevel(id) { return Number(getMap('arcanaKeychainLevels')[currentUser.toLowerCase()]?.[id] || 0); }
function getHatInventory() { return getMap('arcanaHats')[currentUser.toLowerCase()] || []; }
function getEquippedHat() { const id = getMap('arcanaEquippedHat')[currentUser.toLowerCase()] || ''; return getHatInventory().includes(id) && hats[id] ? id : ''; }
function getHatLevel(id) { return Number(getMap('arcanaHatLevels')[currentUser.toLowerCase()]?.[id] || 0); }
function getHatMultiplier(id) { return 1 + ((hats[id]?.damageMultiplier || 1) - 1) * (1 + getHatLevel(id) * .5); }
function getStrengthMultiplier() { const charms = getEquippedKeychains().reduce((multiplier, id) => { const base = keychains[id].damageMultiplier || 1; return multiplier * (1 + (base - 1) * (1 + getKeychainLevel(id) * .5)); }, 1); return charms * (getEquippedHat() ? getHatMultiplier(getEquippedHat()) : 1); }
function getDamageReduction() { const charms = getEquippedKeychains().reduce((total, id) => total + (keychains[id].damageReduction || 0) * (1 + getKeychainLevel(id) * .5), 0); const hat = getEquippedHat(); return Math.min(.8, charms + (hat ? (hats[hat].damageReduction || 0) * (1 + getHatLevel(hat) * .5) : 0)); }
function getHealthBonus(baseHp) { return getEquippedKeychains().reduce((total, id) => total + baseHp * (keychains[id].healthPercent || 0) * (1 + getKeychainLevel(id) * .5) + (keychains[id].healthBonus || 0) * (1 + getKeychainLevel(id) * .5), 0); }
function grantKeychain(id) { if (!keychains[id]) return; const inventory = getMap('arcanaKeychains'); inventory[currentUser.toLowerCase()] = [...(inventory[currentUser.toLowerCase()] || []), id]; saveMap('arcanaKeychains', inventory); updateBackpack(); }
function toggleKeychain(id) { const equipped = getMap('arcanaEquipped'); const list = equipped[currentUser.toLowerCase()] || []; if (list.includes(id)) equipped[currentUser.toLowerCase()] = list.filter(item => item !== id); else if (list.length < 3) equipped[currentUser.toLowerCase()] = [...list, id]; else { setToast('MOŻESZ ZAŁOŻYĆ MAKSYMALNIE 3 BRELOCZKI'); return; } saveMap('arcanaEquipped', equipped); updateBackpack(); updateProfile(); syncProfileToServer(); }
function combineKeychain(id) { const inventory = getMap('arcanaKeychains'); const owned = inventory[currentUser.toLowerCase()] || []; const count = owned.filter(item => item === id).length; const levels = getMap('arcanaKeychainLevels'); const level = Number(levels[currentUser.toLowerCase()]?.[id] || 0); if (level >= 2 || count <= level + 1) { setToast(level >= 2 ? 'MAKSYMALNY POZIOM POŁĄCZENIA' : 'POTRZEBUJESZ DRUGIEGO TAKIEGO BRELOCZKA'); return; } owned.splice(owned.indexOf(id), 1); inventory[currentUser.toLowerCase()] = owned; levels[currentUser.toLowerCase()] ||= {}; levels[currentUser.toLowerCase()][id] = level + 1; saveMap('arcanaKeychains', inventory); saveMap('arcanaKeychainLevels', levels); updateBackpack(); setToast(`BRELOCZEK POŁĄCZONY // POZIOM ${level + 1}/2`); }
function equipHat(id) { if (!getHatInventory().includes(id) || !hats[id]) return; const equipped = getMap('arcanaEquippedHat'); equipped[currentUser.toLowerCase()] = equipped[currentUser.toLowerCase()] === id ? '' : id; saveMap('arcanaEquippedHat', equipped); updateBackpack(); updateProfile(); syncProfileToServer(); }
function combineHat(id) { const inventory = getMap('arcanaHats'); const owned = inventory[currentUser.toLowerCase()] || []; const count = owned.filter(item => item === id).length; const levels = getMap('arcanaHatLevels'); const level = Number(levels[currentUser.toLowerCase()]?.[id] || 0); if (level >= 2 || count <= level + 1) { setToast(level >= 2 ? 'MAKSYMALNY POZIOM KAPELUSZA' : 'POTRZEBUJESZ DRUGIEGO TAKIEGO KAPELUSZA'); return; } owned.splice(owned.indexOf(id), 1); inventory[currentUser.toLowerCase()] = owned; levels[currentUser.toLowerCase()] ||= {}; levels[currentUser.toLowerCase()][id] = level + 1; saveMap('arcanaHats', inventory); saveMap('arcanaHatLevels', levels); updateBackpack(); setToast(`KAPELUSZ POŁĄCZONY // POZIOM ${level + 1}/2`); }
function updateBackpack() { const owned = getKeychains().filter(id => keychains[id]); const equipped = getEquippedKeychains(); const ownedHats = getHatInventory().filter(id => hats[id]); const equippedHat = getEquippedHat(); keychainCollection.classList.toggle('hidden', owned.length === 0); keychainCollection.innerHTML = owned.map(id => { const level = getKeychainLevel(id); const copies = owned.filter(item => item === id).length; return `<div class="keychain-card"><b>${keychains[id].name}</b><span>${keychains[id].rarity} // POZIOM ${level}/2</span><span>${equipped.includes(id) ? 'ZAŁOŻONY' : ''} ${copies} SZT.</span><div class="keychain-actions"><button type="button" data-equip="${id}">${equipped.includes(id) ? 'ZDEJMIJ' : 'ZAŁÓŻ'}</button><button type="button" data-combine="${id}" ${level >= 2 || copies <= level + 1 ? 'disabled' : ''}>POŁĄCZ</button></div></div>`; }).join(''); const hatCollection = document.getElementById('hatCollection'); hatCollection.classList.toggle('hidden', ownedHats.length === 0); hatCollection.innerHTML = [...new Set(ownedHats)].map(id => { const copies = ownedHats.filter(item => item === id).length; const level = getHatLevel(id); return `<div class="keychain-card"><b>${hats[id].name}</b><span>${hats[id].rarity} // POZIOM ${level}/2</span><span>${equippedHat === id ? 'ZAŁOŻONY' : ''} ${copies} SZT.</span><div class="keychain-actions"><button type="button" data-hat-equip="${id}">${equippedHat === id ? 'ZDEJMIJ' : 'ZAŁÓŻ'}</button><button type="button" data-hat-combine="${id}" ${level >= 2 || copies <= level + 1 ? 'disabled' : ''}>POŁĄCZ</button></div></div>`; }).join(''); }
function openChest(id) { const chest = chests[id]; if (!chest || !currentUser) return; const roll = Math.random(); let total = 0; const reward = chest.rewards.find(item => { total += item.chance; return roll < total; })?.id; if (!reward) return; let rewardName; if (hats[reward]) { const inventory = getMap('arcanaHats'); inventory[currentUser.toLowerCase()] = [...(inventory[currentUser.toLowerCase()] || []), reward]; saveMap('arcanaHats', inventory); updateBackpack(); rewardName = hats[reward].name; } else { grantKeychain(reward); rewardName = keychains[reward].name; } const result = `${rewardName} DODANY DO PLECAKA`; document.getElementById('backpackResult').textContent = result; document.getElementById(id === 'hats' ? 'shopHatChestResult' : 'shopKeychainChestResult').textContent = result; }
function updateCareerUI() { careerUi.dailyProgress.textContent = `WYGRANE DZISIAJ: ${careerProgress.wins}/5`; careerUi.boxCount.textContent = `DOSTĘPNE SKRZYNIE: ${careerProgress.boxes}/5`; careerUi.dailyBadge.textContent = `${careerProgress.wins}/5`; careerUi.boxButton.disabled = careerProgress.boxes < 1 || careerProgress.opening; careerUi.boxButton.textContent = careerProgress.opening ? 'OTWIERANIE...' : 'OTWÓRZ SKRZYNIĘ DZIENNĄ'; }
function refreshCareer() { if (!currentUser) return; connectMatchSocket(() => sendNetwork({ type: 'career-get' })); }
function openDailyBox() { if (!currentUser || careerProgress.boxes < 1 || careerProgress.opening) return; careerProgress.opening = true; updateCareerUI(); connectMatchSocket(() => sendNetwork({ type: 'daily-box-open' })); }
function openLeaderboard() { careerUi.leaderboardModal.classList.remove('hidden'); careerUi.leaderboardStatus.textContent = 'ŁADOWANIE RANKINGU...'; refreshCareer(); }
function applyCareerState(message) {
  careerProgress = { month: message.month || '', wins: Number(message.dailyWins) || 0, boxes: Number(message.dailyBoxes) || 0, opening: false, rank: message.rank || 'DREWNO 1', rankPoints: Number(message.rankPoints) || 0 };
  careerUi.rankLabel.textContent = `TWOJA RANGA: ${careerProgress.rank} // ${careerProgress.rankPoints} PKT`;
  careerUi.leagueList.querySelectorAll('[data-rank]').forEach(item => item.classList.toggle('current', item.dataset.rank === careerProgress.rank));
  careerUi.leaderboardTitle.textContent = `RANKING // ${careerProgress.month}`;
  careerUi.leaderboardList.innerHTML = message.standings?.length ? message.standings.map(entry => `<li><span>${escapeHtml(String(entry.nick || 'GRACZ'))}</span><strong>${Number(entry.wins) || 0} WYGR.</strong></li>`).join('') : '<li>BRAK WYNIKÓW W TYM MIESIĄCU</li>';
  const ownStanding = message.standings?.find(entry => entry.nick?.toLowerCase() === currentUser.toLowerCase());
  careerUi.leaderboardStatus.textContent = ownStanding ? `TWOJE MIEJSCE: ${ownStanding.place} // ${ownStanding.wins} WYGRANYCH` : 'WYGRYWAJ POJEDYNKI, ABY WEJŚĆ DO TOP 10';
  (message.limitedRewards || []).forEach(grantLimitedWizard);
  if (message.limitedRewards?.length) updateShop();
  updateCareerUI();
}
function applyDailyBoxReward(reward) {
  const baseCoins = Number(reward.coins) || 0;
  const earnedCoins = window.applyMoneyMultiplier ? window.applyMoneyMultiplier(baseCoins) : baseCoins;
  coins += earnedCoins;
  persistCoins();
  if (reward.kind === 'keychain' && keychains[reward.itemId]) grantKeychain(reward.itemId);
  else if (reward.kind === 'hat' && hats[reward.itemId]) { const inventory = getMap('arcanaHats'); inventory[currentUser.toLowerCase()] = [...(inventory[currentUser.toLowerCase()] || []), reward.itemId]; saveMap('arcanaHats', inventory); updateBackpack(); }
  const itemName = reward.kind === 'keychain' ? keychains[reward.itemId]?.name : hats[reward.itemId]?.name;
  careerUi.chestResult.textContent = `+${earnedCoins} MONET${itemName ? ` // ${itemName} DODANY DO PLECAKA` : ''}`;
  updateShop();
}


function updateTitleChoices() { const wins = getMap('arcanaWizardWins')[currentUser.toLowerCase()] || {}; const selected = getMap('arcanaSelectedTitle')[currentUser.toLowerCase()] || ''; const earned = Object.keys(wins).filter(id => wins[id] >= 500 && wizards[id]); profileUi.title.innerHTML = '<option value="">BRAK TYTUŁU</option>' + earned.map(id => `<option value="${id}">${wizardTitles[id]}</option>`).join(''); profileUi.title.value = earned.includes(selected) ? selected : ''; }
function drawAvatar(canvas, data, nick) {
  const context = canvas.getContext('2d');
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#101936';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#73e1dd';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `700 ${Math.floor(height * 0.55)}px 'Barlow Condensed', sans-serif`;
  context.fillText((String(nick || '?').trim().charAt(0) || '?').toUpperCase(), width / 2, height / 2);
  if (!data) return;
  const image = new Image();
  image.onload = () => context.drawImage(image, 0, 0, width, height);
  image.src = data;
}
function updateProfile() { if (!currentUser) return; const key = currentUser.toLowerCase(); const equipped = getEquippedKeychains(); const dropMap = getMap('arcanaDropCharm'); const previous = dropMap[key]; profileUi.dropCharm.innerHTML = equipped.length ? equipped.map(id => `<option value="${id}">${keychains[id].name}</option>`).join('') : '<option value="">BRAK ZAŁOŻONYCH BRELOCZKÓW</option>'; profileUi.dropCharm.disabled = equipped.length === 0; profileUi.dropCharm.value = equipped.includes(previous) ? previous : (equipped[0] || ''); if (equipped.length && !equipped.includes(previous)) { dropMap[key] = equipped[0]; saveMap('arcanaDropCharm', dropMap); } profileUi.dropEnabled.checked = Boolean(getMap('arcanaDropEnabled')[key]); profileUi.dropEnabled.disabled = equipped.length === 0; updateTitleChoices(); }
function openProfile() { const key = currentUser.toLowerCase(); profileUi.name.textContent = getAccounts()[key]?.nick || currentUser; profileUi.modal.classList.remove('hidden'); updateProfile(); updateAccountDirectory(); const avatar = getMap('arcanaAvatars')[key] || ''; drawAvatar(profileUi.avatar, avatar, currentUser); drawAvatar(profileUi.editor, avatar, currentUser); }
function recordWizardWin() { if (matchWinRecorded || !currentUser) return; matchWinRecorded = true; const key = currentUser.toLowerCase(); const wins = getMap('arcanaWizardWins'); wins[key] ||= {}; const previous = Number(wins[key][selectedWizard] || 0); wins[key][selectedWizard] = previous + 1; saveMap('arcanaWizardWins', wins); if (previous < 500 && wins[key][selectedWizard] >= 500) setToast(`TYTUŁ ODBLOKOWANY: ${wizardTitles[selectedWizard]}`); updateTitleChoices(); connectMatchSocket(() => sendNetwork({ type: 'career-win' })); }
function moveAccountData(oldNick, newNick) { const oldKey = oldNick.toLowerCase(); const newKey = newNick.toLowerCase(); const accounts = getAccounts(); const account = accounts[oldKey] || {}; delete accounts[oldKey]; account.nick = newNick; accounts[newKey] = account; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); ['arcanaBans', 'arcanaBalances', 'arcanaOwned', 'arcanaSelectedWizards', 'arcanaKeychains', 'arcanaEquipped', 'arcanaKeychainLevels', 'arcanaDropEnabled', 'arcanaDropCharm', 'arcanaAvatars', 'arcanaMatchBlocked', 'arcanaHats', 'arcanaHatLevels', 'arcanaEquippedHat', 'arcanaWizardWins', 'arcanaSelectedTitle', 'arcanaSkins', 'arcanaEquippedSkin'].forEach(name => { const map = getMap(name); if (Object.hasOwn(map, oldKey)) { map[newKey] = map[oldKey]; delete map[oldKey]; saveMap(name, map); } }); ['arcanaFriends', 'arcanaFriendRequests'].forEach(name => { const map = getMap(name); if (map[oldKey]) { map[newKey] = map[oldKey]; delete map[oldKey]; } Object.keys(map).forEach(owner => { map[owner] = (map[owner] || []).map(nick => nick.toLowerCase() === oldKey ? newNick : nick); }); saveMap(name, map); }); }
async function changeAccountNick(event) { event.preventDefault(); const oldNick = document.getElementById('changeNickCurrent').value.trim(); const newNick = document.getElementById('changeNickNew').value.trim(); const message = document.getElementById('nickChangeMessage'); message.textContent = ''; if (onlineMatch || running) { message.textContent = 'ZAKOŃCZ MECZ PRZED ZMIANĄ NICKU'; return; } if (oldNick.toLowerCase() !== currentUser.toLowerCase()) { message.textContent = 'WPISZ SWÓJ OBECNY NICK'; return; } try { const remote = await authRequest('change-nick', { currentNick: currentUser, currentPassword: document.getElementById('changeNickPassword').value, newNick }); moveAccountData(currentUser, remote.nick); currentUser = remote.nick; localStorage.setItem('arcanaCurrentUser', currentUser); ui.playerName.textContent = `GRACZ: ${currentUser}`; profileUi.name.textContent = currentUser; document.getElementById('changeNickCurrent').value = ''; document.getElementById('changeNickPassword').value = ''; document.getElementById('changeNickNew').value = ''; updateFriends(); updateAccountDirectory(); if (matchSocket) { matchSocket.close(); matchSocket = null; } message.textContent = 'NICK ZMIENIONY'; } catch (error) { message.textContent = error.message; } }
async function changeAccountPassword(event) { event.preventDefault(); const message = document.getElementById('passwordChangeMessage'); message.textContent = ''; const newPassword = document.getElementById('changePasswordNew').value; if (newPassword !== document.getElementById('changePasswordRepeat').value) { message.textContent = 'NOWE HASŁA NIE SĄ TAKIE SAME'; return; } try { const result = await authRequest('change-password', { currentNick: currentUser, currentPassword: document.getElementById('changePasswordCurrent').value, newPassword, confirmPassword: document.getElementById('changePasswordRepeat').value }); sessionPassword = newPassword; sessionToken = result.sessionToken; const accounts = getAccounts(); accounts[currentUser.toLowerCase()].serverSynced = true; delete accounts[currentUser.toLowerCase()].password; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); profileUi.passwordForm.reset(); message.textContent = 'HASŁO ZMIENIONE'; } catch (error) { message.textContent = error.message; } }
function updateAccountDirectory() { const accounts = getAccounts(); const entries = Object.entries(accounts).filter(([, account]) => account?.nick).sort((left, right) => left[1].nick.localeCompare(right[1].nick)); accountUi.list.innerHTML = entries.map(([key, account]) => `<button type="button" data-account-view="${encodeURIComponent(key)}">${escapeHtml(account.nick)}</button>`).join('') || '<span class="friends-empty">BRAK KONT</span>'; }
function showAccountDetails(key) { const account = getAccounts()[key]; if (!account) return; const balances = getMap('arcanaBalances'); const coinsForAccount = Number(balances[key] ?? account.coins ?? 0); const owned = Array.from(new Set(['apprentice', ...(account.wizards || []), ...(getMap('arcanaOwned')[key] || [])])); accountUi.name.textContent = account.nick; accountUi.coins.textContent = `MONETY: ${coinsForAccount}`; accountUi.characters.textContent = `POSTACIE: ${owned.map(id => wizards[id]?.name || id).join(', ')}`; accountUi.delete.disabled = OWNER_NICKS.includes(key); accountPendingDelete = key; accountUi.details.classList.remove('hidden'); }
function requestAccountDelete() { if (!accountPendingDelete || OWNER_NICKS.includes(accountPendingDelete)) return; accountUi.confirm.classList.remove('hidden'); }
function deleteAccountConfirmed() { const key = accountPendingDelete; const accounts = getAccounts(); if (!key || OWNER_NICKS.includes(key) || !accounts[key]) { accountUi.confirm.classList.add('hidden'); return; } const nick = accounts[key].nick; delete accounts[key]; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); ['arcanaBans', 'arcanaBalances', 'arcanaOwned', 'arcanaSelectedWizards', 'arcanaKeychains', 'arcanaEquipped', 'arcanaKeychainLevels', 'arcanaDropEnabled', 'arcanaDropCharm', 'arcanaAvatars', 'arcanaMatchBlocked', 'arcanaPlayerData', 'arcanaSkins', 'arcanaEquippedSkin'].forEach(name => { const map = getMap(name); delete map[key]; saveMap(name, map); }); ['arcanaFriends', 'arcanaFriendRequests'].forEach(name => { const map = getMap(name); delete map[key]; Object.keys(map).forEach(owner => { map[owner] = (map[owner] || []).filter(friend => friend.toLowerCase() !== key); }); saveMap(name, map); }); accountUi.confirm.classList.add('hidden'); accountUi.details.classList.add('hidden'); accountPendingDelete = ''; updateAccountDirectory(); if (key === currentUser.toLowerCase()) logoutAccount(); else setToast(`USUNIĘTO KONTO ${nick}`); }
function clearNewProgress(key) { [['arcanaHats', []], ['arcanaHatLevels', {}], ['arcanaEquippedHat', ''], ['arcanaWizardWins', {}], ['arcanaSelectedTitle', ''], ['arcanaPlayerData', {}], ['arcanaSkins', []], ['arcanaEquippedSkin', '']].forEach(([name, empty]) => { const map = getMap(name); map[key] = empty; saveMap(name, map); }); }
const originalDeleteAccountConfirmed = deleteAccountConfirmed;
deleteAccountConfirmed = function () { const key = accountPendingDelete; if (key && !OWNER_NICKS.includes(key) && getAccounts()[key]) clearNewProgress(key); originalDeleteAccountConfirmed(); };
function saveAvatar() { if (!currentUser) return; const avatars = getMap('arcanaAvatars'); avatars[currentUser.toLowerCase()] = profileUi.editor.toDataURL('image/png'); saveMap('arcanaAvatars', avatars); drawAvatar(profileUi.avatar, avatars[currentUser.toLowerCase()], currentUser); setToast('AVATAR ZAPISANY'); }
function accountCharm(id) { const inventory = getMap('arcanaKeychains'); inventory[id] = Array.from(new Set([...(inventory[id] || []), 'admin-charm'])); saveMap('arcanaKeychains', inventory); const equipped = getMap('arcanaEquipped'); equipped[id] = Array.from(new Set([...(equipped[id] || []), 'admin-charm'])).slice(0, 3); saveMap('arcanaEquipped', equipped); }
function getCurrentTitle() { const id = getMap('arcanaSelectedTitle')[currentUser.toLowerCase()] || ''; return wizardTitles[id] || ''; }
function getProfileDrop() { const key = currentUser.toLowerCase(); const enabled = Boolean(getMap('arcanaDropEnabled')[key]); const charm = getMap('arcanaDropCharm')[key]; return { nick: currentUser, role: getAccounts()[key]?.role || 'user', dropEnabled: enabled && getEquippedKeychains().includes(charm), dropCharm: charm, hatId: getEquippedHat(), skinId: getEquippedMageSkin(), wizardId: selectedWizard, title: getCurrentTitle(), damageMultiplier: getStrengthMultiplier(), damageReduction: getDamageReduction() }; }
function syncProfileToServer() { if (matchSocket?.readyState === WebSocket.OPEN) sendNetwork({ type: 'profile-update', profile: getProfileDrop() }); }
function clearAuthForm() {
  auth.registerNick.value = '';
  auth.loginNick.value = '';
  auth.registerPassword.value = '';
  auth.loginPassword.value = '';
  auth.registerNickError.textContent = '';
  auth.loginError.textContent = '';
}

function finishAuth(nick) { currentUser = nick; if (!window.playerData) window.playerData = {}; const key = nick.toLowerCase(); window.playerData[nick] = getMap('arcanaPlayerData')[key] || window.playerData[nick] || {}; logoutIntentional = false; const accounts = getAccounts(); const account = accounts[key]; const balances = getMap('arcanaBalances'); const selectedByAccount = getMap('arcanaSelectedWizards'); coins = Number(balances[key] ?? account?.coins ?? 0); selectedWizard = selectedByAccount[key] || 'apprentice'; localStorage.setItem('arcanaWizard', selectedWizard); migrateOldPassCharacters(); ui.playerName.textContent = `GRACZ: ${nick}`; profileUi.button.classList.remove('hidden'); ui.logout.classList.remove('hidden'); localStorage.setItem('arcanaCurrentUser', nick); syncAccountRoleUi(); ownerUi.panel.classList.toggle('hidden', account?.role !== 'owner'); ownerUi.addAdmin.classList.toggle('hidden', !isOwner()); ownerUi.resetAccount.classList.toggle('hidden', !isOwner()); ownerUi.resetRanking.classList.toggle('hidden', !isOwner()); updateRestrictedOwnerTools(); if (account?.role === 'owner') toggleOwnerPanel(false); auth.screen.classList.add('hidden'); document.getElementById('deviceScreen').classList.remove('hidden'); updateBackpack(); updateShop(); window.updatePassShop?.(); updateFriends(); updateProfile(); updateAccountDirectory(); drawAvatar(profileUi.avatar, getMap('arcanaAvatars')[key] || '', nick); updateOrientationPrompt(); connectMatchSocket(); }

function logoutAccount() {
  if (!currentUser) return;
  ownerPasswordVerified = false;
  verifiedOwnerPassword = '';
  ownerUi.password.value = '';
  ownerUi.grantOctober.classList.add('hidden');
  logoutIntentional = true;
  if (matchSocket?.readyState === WebSocket.OPEN) sendNetwork({ type: 'logout' });
  else if (sessionToken) fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionToken }) }).catch(error => console.error('Nie udało się zakończyć sesji:', error));
  if (matchSocket) {
    matchSocket.close();
    matchSocket = null;
  }
  onlineMatch = false;
  joined = false;
  running = false;
  gameStartToken += 1;
  clearTimeout(rankedSearchTimer);
  randomQueued = false;
  rankedGameActive = false;
  ui.reveal.classList.add('hidden');
  ui.result.classList.add('hidden');
  ui.start.classList.remove('hidden');
  updateDeviceControls();
  const key = currentUser.toLowerCase();
  const blockedMatches = getMap('arcanaMatchBlocked');
  delete blockedMatches[key];
  saveMap('arcanaMatchBlocked', blockedMatches);
  const accounts = getAccounts();
  if (accounts[key]) {
    const balances = getMap('arcanaBalances');
    balances[key] = Number(accounts[key].coins ?? balances[key] ?? coins ?? 0);
    saveMap('arcanaBalances', balances);
    accounts[key].coins = balances[key];
    localStorage.setItem('arcanaAccounts', JSON.stringify(accounts));
  }
  flushProgressSync();
  currentUser = '';
  sessionPassword = '';
  sessionToken = '';
  syncAccountRoleUi();
  ui.playerName.textContent = '';
  profileUi.button.classList.add('hidden');
  profileUi.modal.classList.add('hidden');
  document.getElementById('rankingModal')?.classList.add('hidden');
  careerUi.leaderboardModal.classList.add('hidden');
  ui.logout.classList.add('hidden');
  ownerUi.panel.classList.add('hidden');
  document.getElementById('deviceScreen').classList.add('hidden');
  clearAuthForm();
  auth.screen.classList.remove('hidden');
  localStorage.removeItem('arcanaCurrentUser');
  showAuthForm('login');
  setToast('WYLOGOWANO');
}

function applyInactivePenalty() {
  if (!currentUser || logoutIntentional) return;
  const accounts = getAccounts();
  const key = currentUser.toLowerCase();
  if (!accounts[key]) return;
  const balances = getMap('arcanaBalances');
  const currentBalance = Number(accounts[key].coins ?? balances[key] ?? coins ?? 0);
  const nextBalance = Math.max(0, currentBalance - 300);
  balances[key] = nextBalance;
  accounts[key].coins = nextBalance;
  saveMap('arcanaBalances', balances);
  localStorage.setItem('arcanaAccounts', JSON.stringify(accounts));
  const blockedMatches = getMap('arcanaMatchBlocked');
  blockedMatches[key] = true;
  saveMap('arcanaMatchBlocked', blockedMatches);
  coins = nextBalance;
  localStorage.setItem('arcanaCoins', String(nextBalance));
  setToast('-300 MONET ZA NIEWYLOGOWANIE');
  flushProgressSync();
  currentUser = '';
  sessionPassword = '';
  syncAccountRoleUi();
  ui.playerName.textContent = '';
  profileUi.button.classList.add('hidden');
  profileUi.modal.classList.add('hidden');
  ui.logout.classList.add('hidden');
  ownerUi.panel.classList.add('hidden');
  document.getElementById('deviceScreen').classList.add('hidden');
  clearAuthForm();
  auth.screen.classList.remove('hidden');
  localStorage.removeItem('arcanaCurrentUser');
}
function showAuthForm(form) { const register = form === 'register'; auth.registerForm.classList.toggle('hidden', !register); auth.loginForm.classList.toggle('hidden', register); auth.registerTab.classList.toggle('active', register); auth.loginTab.classList.toggle('active', !register); }
function clearLocalAccountProgress(key) {
  [
    'arcanaBalances', 'arcanaOwned', 'arcanaSelectedWizards', 'arcanaKeychains',
    'arcanaEquipped', 'arcanaKeychainLevels', 'arcanaDropEnabled', 'arcanaDropCharm',
    'arcanaAvatars', 'arcanaMatchBlocked', 'arcanaHats', 'arcanaHatLevels',
    'arcanaEquippedHat', 'arcanaWizardWins', 'arcanaSelectedTitle', 'arcanaFriends',
    'arcanaFriendRequests', 'arcanaBans', 'arcanaPlayerData', 'arcanaSkins', 'arcanaEquippedSkin'
  ].forEach(name => {
    const map = getMap(name);
    delete map[key];
    saveMap(name, map);
  });
  const accounts = getAccounts();
  delete accounts[key];
  localStorage.setItem('arcanaAccounts', JSON.stringify(accounts));
}
function normalizeLocalAccount(rawAccount = {}, fallbackNick = '') {
  if (!rawAccount || typeof rawAccount !== 'object') return { nick: fallbackNick, role: 'user', wizards: [], coins: 0, serverSynced: true };
  const normalized = { ...rawAccount };
  if (normalized.password) delete normalized.password;
  normalized.nick = normalized.nick || fallbackNick;
  normalized.role = normalized.role || 'user';
  normalized.wizards = Array.isArray(normalized.wizards) ? normalized.wizards : [];
  normalized.coins = Number(normalized.coins ?? 0) || 0;
  normalized.serverSynced = true;
  return normalized;
}
async function registerAccount(event) { event.preventDefault(); const nick = auth.registerNick.value.trim(); const key = nick.toLowerCase(); const password = auth.registerPassword.value; auth.registerNickError.textContent = ''; try { const registration = await authRequest('register', { nick, password }, true); const remote = registration.account; clearLocalAccountProgress(key); const accounts = getAccounts(); accounts[key] = normalizeLocalAccount({ nick: remote.nick, role: remote.role, wizards: remote.wizards || [] }, remote.nick); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); sessionPassword = password; sessionToken = registration.sessionToken; finishAuth(remote.nick); scheduleProgressSync(); } catch (error) { auth.registerNickError.textContent = error.message; } }
async function loginAccount(event) { event.preventDefault(); const nick = auth.loginNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); const password = auth.loginPassword.value; auth.loginError.textContent = ''; if (getMap('arcanaBans')[key]) { auth.loginError.textContent = 'TO KONTO ZOSTAŁO ZABANOWANE'; return; } try { const login = await authRequest('login', { nick, password }, true); const remote = login.account; const accountKey = remote.nick.toLowerCase(); const localProgress = collectAccountProgress(remote.nick); const useLocalProgress = !login.progress || (!hasAccountProgress(login.progress) && hasAccountProgress(localProgress)); const activeProgress = useLocalProgress ? localProgress : login.progress; if (login.progress && !useLocalProgress) applyAccountProgress(remote.nick, login.progress); const merged = normalizeLocalAccount({ ...(accounts[accountKey] || {}), ...(activeProgress?.account || {}), nick: remote.nick, role: remote.role, wizards: remote.wizards || accounts[accountKey]?.wizards || [] }, remote.nick); accounts[accountKey] = merged; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (useLocalProgress) await authRequest('sync-progress', { nick: remote.nick, password, progress: localProgress }); sessionPassword = password; sessionToken = login.sessionToken; finishAuth(remote.nick); scheduleProgressSync(); } catch (error) { const localAccountExists = findLocalAccountEntryByNick(nick); auth.loginError.textContent = localAccountExists && error.message.includes('NIE ISTNIEJE NA SERWERZE') ? 'TO KONTO JEST ZAPISANE TYLKO W TEJ PRZEGLĄDARCE, A NIE W BAZIE TEGO SERWERA. WŁAŚCICIEL MUSI PRZYWRÓCIĆ KONTO NA SERWERZE.' : error.message; } }
function ownerTarget() { const key = ownerUi.target.value.trim().toLowerCase(); return key; }
function ownerResult(text) { ownerUi.message.textContent = text; }
function isOwner() { return OWNER_NICKS.includes(currentUser.toLowerCase()); }
function hasRestrictedOwnerTools() { return currentUser.toLowerCase() === RESTRICTED_OWNER_NICK; }
function updateRestrictedOwnerTools() {
  const restricted = hasRestrictedOwnerTools();
  const canUseSpecialTools = !restricted && isOwner();
  ownerUi.grantOctober.closest('.owner-row')?.classList.toggle('hidden', !canUseSpecialTools);
  ownerUi.resetRanking.closest('.owner-row')?.classList.toggle('hidden', !canUseSpecialTools);
  const overlordOption = ownerUi.wizard.querySelector('option[value="overlord"]');
  if (overlordOption) {
    overlordOption.hidden = restricted;
    overlordOption.disabled = restricted;
  }
  if (restricted && ownerUi.wizard.value === 'overlord') ownerUi.wizard.value = 'storm';
}
function canUseRestrictedOwnerTools() { return isOwner() && !hasRestrictedOwnerTools(); }
function isStaff() { const account = getAccounts()[currentUser.toLowerCase()]; return account?.role === 'owner' || account?.role === 'admin'; }
function syncAccountRoleUi() {
  const accountRole = currentUser ? getAccounts()[currentUser.toLowerCase()]?.role || 'user' : '';
  const role = accountRole;
  window.userRoles = window.userRoles || {};
  if (currentUser) window.userRoles[currentUser] = role;
  document.getElementById('reportBtn')?.classList.toggle('hidden', !currentUser);
  document.getElementById('staffAdminPanel')?.classList.toggle('hidden', !currentUser || !['owner', 'admin'].includes(role));
  document.getElementById('staffHalfAdminPanel')?.classList.toggle('hidden', !currentUser || role !== 'half-admin');
  document.getElementById('adminRoleControls')?.classList.toggle('hidden', role !== 'owner');
  window.refreshAdminReports?.();
}
async function ownerRequest(action, data) { const response = await fetch(`/api/owner/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'BŁĄD SERWERA'); return result; }
async function checkServerAccount(nick) { if (!currentUser || !sessionPassword) throw new Error('ZALOGUJ SIĘ PONOWNIE'); const result = await authRequest('check-account', { nick: currentUser, password: sessionPassword, targetNick: String(nick || '').trim() }, true); return result.account; }
async function cacheCheckedAccount(nick) { const account = await checkServerAccount(nick); const key = account.nick.toLowerCase(); const accounts = getAccounts(); accounts[key] = { ...(accounts[key] || {}), ...account, serverSynced: true }; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); return { account, key, accounts }; }
async function verifyOwnerPassword() { ownerPasswordVerified = false; verifiedOwnerPassword = ''; ownerUi.grantOctober.classList.add('hidden'); if (!isOwner() || !ownerUi.password.value) { ownerResult('WPISZ HASŁO WŁAŚCICIELA'); return; } try { await ownerRequest('verify-password', { ownerNick: currentUser, password: ownerUi.password.value }); verifiedOwnerPassword = ownerUi.password.value; ownerPasswordVerified = true; updateRestrictedOwnerTools(); ownerResult('HASŁO POTWIERDZONE // PODAJ NICK GRACZA'); } catch (error) { ownerResult(error.message); } }
async function setAccountRole(nick, role) { if (!isOwner()) return; if (!ownerPasswordVerified || !verifiedOwnerPassword) { ownerResult('NAJPIERW POTWIERDŹ HASŁO WŁAŚCICIELA'); return; } try { const result = await ownerRequest('set-role', { ownerNick: currentUser, password: verifiedOwnerPassword, targetNick: nick, role }); const key = result.account.nick.toLowerCase(); const accounts = getAccounts(); accounts[key] = { ...(accounts[key] || {}), ...result.account, serverSynced: true }; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); window.userRoles = window.userRoles || {}; window.userRoles[result.account.nick] = result.account.role; syncAccountRoleUi(); ownerUi.panel.classList.toggle('hidden', !['owner', 'admin'].includes(getAccounts()[currentUser.toLowerCase()]?.role)); ownerResult(result.account.role === 'user' ? `USUNIĘTO ROLĘ: ${result.account.nick}` : `NADANO ROLĘ ${result.account.role}: ${result.account.nick}`); } catch (error) { ownerResult(error.message); } }
async function grantOctoberWizard() { if (!canUseRestrictedOwnerTools()) { ownerResult('TA OPERACJA JEST NIEDOSTĘPNA DLA TEGO WŁAŚCICIELA'); return; } if (!ownerPasswordVerified || !ownerTarget()) return; try { const result = await ownerRequest('grant-wizard', { ownerNick: currentUser, password: verifiedOwnerPassword, targetNick: ownerUi.target.value.trim() }); const key = result.account.nick.toLowerCase(); const accounts = getAccounts(); accounts[key] = { ...(accounts[key] || {}), ...result.account, serverSynced: true }; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); const owned = getMap('arcanaOwned'); owned[key] = Array.from(new Set([...(owned[key] || []), 'october'])); saveMap('arcanaOwned', owned); if (key === currentUser.toLowerCase()) updateShop(); ownerResult(`PAŹDZIERNIK NADANY GRACZOWI ${result.account.nick}`); } catch (error) { ownerResult(error.message); } }
async function resetRankedLadder() { if (!canUseRestrictedOwnerTools()) { ownerResult('TA OPERACJA JEST NIEDOSTĘPNA DLA TEGO WŁAŚCICIELA'); return; } if (!ownerPasswordVerified || !verifiedOwnerPassword) { ownerResult('NAJPIERW POTWIERDŹ HASŁO WŁAŚCICIELA'); return; } if (!confirm('Czy na pewno zresetować rangi wszystkich graczy? Misje dzienne i ranking miesiąca pozostaną bez zmian.')) return; try { const result = await ownerRequest('reset-ranking', { ownerNick: currentUser, password: verifiedOwnerPassword }); ownerResult(`ZRESETOWANO RANGI ${result.resetPlayers} GRACZY`); refreshCareer(); } catch (error) { ownerResult(error.message); } }
function addAdmin() { if (!isOwner()) return; const nick = ownerUi.target.value.trim(); if (!nick) { ownerResult('PODAJ NICK GRACZA'); return; } setAccountRole(nick, 'admin'); }
async function changeBan(banned) { if (!isStaff()) return; const nick = ownerUi.target.value.trim(); if (!nick) { ownerResult('PODAJ NICK GRACZA'); return; } try { const { account, key } = await cacheCheckedAccount(nick); const bans = getMap('arcanaBans'); if (banned) bans[key] = true; else delete bans[key]; saveMap('arcanaBans', bans); ownerResult(banned ? `GRACZ ZABANOWANY: ${account.nick}` : `GRACZ ODBANOWANY: ${account.nick}`); } catch (error) { ownerResult(error.message); } }
async function giveCoins() { if (!isStaff()) return; const nick = ownerUi.target.value.trim(); const amount = Number(ownerUi.coins.value); if (!Number.isFinite(amount) || amount < 1) { ownerResult('PODAJ PRAWIDŁOWĄ LICZBĘ MONET'); return; } try { const { account, key, accounts } = await cacheCheckedAccount(nick); const added = Math.floor(amount); const balances = getMap('arcanaBalances'); balances[key] = Number(balances[key] || account.coins || 0) + added; accounts[key].coins = balances[key]; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = balances[key]; localStorage.setItem('arcanaCoins', String(coins)); updateShop(); } ownerResult(`DODANO ${added} MONET GRACZOWI ${account.nick}`); } catch (error) { ownerResult(error.message); } }
async function takeCoins() { if (!isStaff()) return; const nick = ownerUi.target.value.trim(); const amount = Number(ownerUi.coins.value); if (!Number.isFinite(amount) || amount < 1) { ownerResult('PODAJ PRAWIDŁOWĄ LICZBĘ MONET'); return; } try { const { account, key, accounts } = await cacheCheckedAccount(nick); const balances = getMap('arcanaBalances'); const remaining = Math.max(0, Number(balances[key] ?? account.coins ?? 0) - Math.floor(amount)); balances[key] = remaining; accounts[key].coins = remaining; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = remaining; localStorage.setItem('arcanaCoins', String(coins)); updateShop(); } ownerResult(`ODJĘTO MONETY GRACZOWI ${account.nick} // STAN ${remaining}`); } catch (error) { ownerResult(error.message); } }
function resetAccount() { if (!isOwner()) return; const key = ownerTarget(); const accounts = getAccounts(); if (!accounts[key] || OWNER_NICKS.includes(key)) { ownerResult('NIEPRAWIDŁOWY CEL'); return; } const balances = getMap('arcanaBalances'); const owned = getMap('arcanaOwned'); const selected = getMap('arcanaSelectedWizards'); balances[key] = 0; owned[key] = []; selected[key] = 'apprentice'; accounts[key].coins = 0; accounts[key].wizards = []; const emptyValues = { arcanaKeychains: [], arcanaEquipped: [], arcanaKeychainLevels: {}, arcanaDropEnabled: false, arcanaDropCharm: '' }; Object.entries(emptyValues).forEach(([mapName, emptyValue]) => { const data = getMap(mapName); data[key] = emptyValue; saveMap(mapName, data); }); saveMap('arcanaBalances', balances); saveMap('arcanaOwned', owned); saveMap('arcanaSelectedWizards', selected); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = 0; selectedWizard = 'apprentice'; localStorage.setItem('arcanaCoins', '0'); localStorage.setItem('arcanaWizard', selectedWizard); updateShop(); updateBackpack(); updateProfile(); } ownerResult(`ZEROWANO KONTO ${accounts[key].nick} // ZOSTAŁA PODSTAWOWA POSTAĆ`); }
const originalResetAccount = resetAccount;
resetAccount = async function () { if (!isOwner()) return; const nick = ownerUi.target.value.trim(); if (!nick) { ownerResult('PODAJ NICK GRACZA'); return; } try { const { key } = await cacheCheckedAccount(nick); if (OWNER_NICKS.includes(key)) { ownerResult('NIE MOŻNA ZEROWAĆ KONTA WŁAŚCICIELA'); return; } originalResetAccount(); clearNewProgress(key); } catch (error) { ownerResult(error.message); } };
async function giveWizard() { if (!isStaff()) return; const nick = ownerUi.target.value.trim(); const id = ownerUi.wizard.value; if (!nick) { ownerResult('PODAJ NICK GRACZA'); return; } if (id === 'overlord' && (!isOwner() || hasRestrictedOwnerTools())) { ownerResult('NADAWANIE WŁADCY JEST NIEDOSTĘPNE'); return; } try { const { account, key, accounts } = await cacheCheckedAccount(nick); const owned = getMap('arcanaOwned'); owned[key] = Array.from(new Set([...(owned[key] || account.wizards || []), id])); accounts[key].wizards = owned[key]; saveMap('arcanaOwned', owned); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) updateShop(); ownerResult(`${wizards[id].name} DANY GRACZOWI ${account.nick}`); } catch (error) { ownerResult(error.message); } }
const ui = { start: document.getElementById('startScreen'), reveal: document.getElementById('revealScreen'), revealName: document.getElementById('revealName'), revealPower: document.getElementById('revealPower'), revealMage: document.getElementById('revealMage'), playerName: document.getElementById('playerName'), logout: document.getElementById('logoutButton'), friendsButton: document.getElementById('friendsButton'), friendsModal: document.getElementById('friendsModal'), friendsClose: document.getElementById('friendsClose'), friendsTab: document.getElementById('friendsTab'), suggestionsTab: document.getElementById('suggestionsTab'), requestsTab: document.getElementById('requestsTab'), friendsView: document.getElementById('friendsView'), suggestionsView: document.getElementById('suggestionsView'), requestsView: document.getElementById('requestsView'), suggestionsList: document.getElementById('suggestionsList'), inviteNick: document.getElementById('inviteNick'), sendInvite: document.getElementById('sendInviteButton'), inviteMessage: document.getElementById('inviteMessage'), friendNick: document.getElementById('friendNick'), addFriend: document.getElementById('addFriendButton'), friendMessage: document.getElementById('friendMessage'), friendsList: document.getElementById('friendsList'), shopButton: document.getElementById('shopButton'), ownedButton: document.getElementById('ownedButton'), shopClose: document.getElementById('shopClose'), detail: document.getElementById('wizardDetail'), wizardName: document.getElementById('wizardName'), wizardPower: document.getElementById('wizardPower'), buy: document.getElementById('buyButton'), use: document.getElementById('useButton'), join: document.getElementById('joinNote'), result: document.getElementById('resultMessage'), coins: document.getElementById('coinsText'), shop: document.getElementById('shop'), score: document.getElementById('scoreText'), mana: document.getElementById('speedText'), manaMeter: document.getElementById('speedMeter'), ward: document.getElementById('altitudeText'), wardMeter: document.getElementById('altitudeMeter'), enemies: document.getElementById('enemiesText'), radar: document.getElementById('radar'), ammo: document.getElementById('ammoRow'), toast: document.getElementById('toast'), status: document.getElementById('statusText'), event: document.getElementById('eventText'), rival: document.getElementById('rivalName') };
const wizards = { apprentice: { name: 'ISKRA', cost: 0, hp: 100, damage: 12, cooldown: .3 }, storm: { name: 'BURZOWY', cost: 180, hp: 90, damage: 10, cooldown: .18 }, electric: { name: 'ELEKTRYCZNY', cost: 25000, hp: 105, damage: 15, cooldown: .25, abilityType: 'lightning', abilityDamage: .55, abilityCooldown: 8, electricDamage: true }, guardian: { name: 'STRAŻNIK', cost: 260, hp: 140, damage: 16, cooldown: .38 }, healer: { name: 'UZDROWICIEL', cost: 3000, hp: 110, damage: 11, cooldown: .3, heal: 10, abilityCooldown: 15 }, cloner: { name: 'KLONER', cost: 4000, hp: 100, damage: 12, cooldown: .3, maxClones: 3 }, aegis: { name: 'AEGIS', cost: 3000, hp: 120, damage: 15, cooldown: .3, shield: true }, knight: { name: 'RYCERZ', cost: 3500, hp: 120, damage: 2, cooldown: .3, abilityType: 'sword', abilityDamage: .4, abilityCooldown: 5 }, hercules: { name: 'HERKULES', cost: 10000, hp: 160, damage: 0, cooldown: .3, abilityType: 'stone', abilityDamage: .7, abilityCooldown: 4 }, sprinter: { name: 'SPRINTER', cost: 2000, hp: 100, damage: 12, cooldown: .3, speed: 1.7 }, shieldbearer: { name: 'TARCZOWNIK', cost: 5000, hp: 140, damage: 10, cooldown: .3, reflect: true, abilityCooldown: 10 }, thunder: { name: 'PIORUN', cost: 7500, hp: 110, damage: 12, cooldown: .3, abilityType: 'lightning', abilityDamage: .5, abilityCooldown: 8 }, illusionist: { name: 'ILUZJONISTA', cost: 6000, hp: 100, damage: 20, cooldown: .3, abilityType: 'illusion', abilityCooldown: 20, invisibilityDuration: 10, secondaryAbilityType: 'teleport', secondaryAbilityCooldown: 12 }, frostwarden: { name: 'LODOWY WÓDZ', cost: 6200, hp: 138, damage: 18, cooldown: .3, abilityType: 'frost', abilityDamage: .45, abilityCooldown: 8, freezeDuration: 2 }, cosmicobserver: { name: 'KOSMICZNY OBSERWATOR', cost: 7200, hp: 102, damage: 16, cooldown: .3, speed: 1.5, abilityType: 'blink', abilityDamage: .35, abilityCooldown: 10 }, demonwanderer: { name: 'DEMONICZNY WĘDROWIEC', cost: 9000, hp: 118, damage: 20, cooldown: .3, abilityType: 'demonic-rush', abilityDamage: .8, abilityCooldown: 10 }, sanctifier: { name: 'ŚWIĄTY LECZYCIEL', cost: 8200, hp: 110, damage: 6, cooldown: .3, healAlly: true, healAmount: 18, abilityType: 'healing-bolt', abilityCooldown: 12 }, eaglelord: { name: 'WŁADCA ORŁÓW', cost: 250000, hp: 145, damage: 18, cooldown: .28, speed: 1.3, abilityType: 'eagle-strike', abilityDamage: .3, abilityCooldown: 9, secondaryAbilityType: 'eagle-heal', secondaryAbilityCooldown: 12 },
 october: { name: 'PAŹDZIERNIK', cost: 999999999, hp: 110, damage: 12, cooldown: .3, abilityType: 'leaf-gust', abilityCooldown: 14, ownerOnly: true, hidden: true }, overlord: { name: 'WŁADCA', cost: 999999999, hp: 1000, damage: 1000, cooldown: .3, shield: true, fullShield: true, invisibility: true, ownerOnly: true } };const wizardTitles = { apprentice: 'Uczeń Iskry', storm: 'Władca Burzy', electric: 'Władca Błyskawic', guardian: 'Strażnik Kręgu', healer: 'Ostatnia Nadzieja', cloner: 'Mistrz Odbić', aegis: 'Niezłomna Tarcza', knight: 'Rycerz Areny', hercules: 'Pięść Herkulesa', sprinter: 'Błyskawiczny', shieldbearer: 'Mistrz Odbić', thunder: 'Głos Gromu', illusionist: 'Mistrz Iluzji', eaglelord: 'Władca Orlich Szczytów', october: 'Strażnik Jesiennych Liści', overlord: 'Władca Areny', frostwarden: 'Lodowy Wódz', cosmicobserver: 'Kosmiczny Obserwator', demonwanderer: 'Demoniczny Wędrowiec', sanctifier: 'Życiodajny Opiekun' };
const botProfiles = [
  { wizardId: 'apprentice', difficulty: 1, reward: 100 },
  { wizardId: 'storm', difficulty: 2, reward: 160 },
  { wizardId: 'guardian', difficulty: 3, reward: 220 },
  { wizardId: 'illusionist', difficulty: 4, reward: 300 },
  { wizardId: 'thunder', difficulty: 5, reward: 400 }
];
const news = { new: ['ILUZJONER // NOWA POSTAĆ'], changed: ['TRYBY BOTÓW // WIĘKSZE NAGRODY ZA TRUDNIEJSZE WALKI'], removed: [] };
const matchCodeInput = document.getElementById('matchCode');
const randomQueueButton = document.createElement('button');
const modeSelectButton = document.getElementById('modeSelectButton');
const modeOptions = document.getElementById('modeOptions');
const playButton = document.getElementById('playButton');
let selectedGameMode = 'bot', rankedSearchTimer = 0, rankedFallback = false, rankedGameActive = false;
const groupInviteUi = { modal: document.getElementById('groupInviteModal'), text: document.getElementById('groupInviteText'), accept: document.getElementById('acceptGroupInvite'), reject: document.getElementById('rejectGroupInvite'), status: document.getElementById('groupStatus') };
let matchRoomKey = '';
let matchSocket = null, onlineMatch = false, lastNetworkSync = 0;
let groupId = '', groupMembers = [], pendingGroupInvite = null, teamId = '', randomQueued = false, queueMatchType = '1v1';
let coins = Number(localStorage.getItem('arcanaCoins') || 0), selectedWizard = localStorage.getItem('arcanaWizard') || 'apprentice', viewedWizard = 'apprentice';
let W = 0, H = 0, running = false, last = 0, score = 0, mode = 'bot', joined = false, toastClock = 0, ownedOnly = false, deviceMode = '', joystickPointer = null, gameStartToken = 0, teleportTargeting = false;
let previewPreviousWizard = '';
let activeBotProfile = botProfiles[0], botPlayers = [];
let joystickX = 0, joystickY = 0;
const keys = {};
const p1 = { x: 0, y: 0, hp: 100, maxHp: 100, mana: 100, damage: 12, spellCooldown: .3, abilityCooldown: 0, secondaryAbilityCooldown: 0, clones: 0, shield: 0, shieldUsed: false, invisible: false, invisibleTimer: 0, color: '#72e4d0', accent: '#d8fff2', face: 1, cooldown: 0 };
const p2 = { x: 0, y: 0, hp: 100, maxHp: 100, mana: 100, damage: 12, damageReduction: 0, clones: [], color: '#ef7693', accent: '#ffe0e9', face: -1, cooldown: 0, teamId: 'bot-team', botSpeed: 1 };
const remotePlayers = new Map();
let reportedEliminations = new Set();
let spells = [], particles = [], stars = [], cloneBodies = [];
function resize() { const previousW = W, previousH = H; W = canvas.width = innerWidth * devicePixelRatio; H = canvas.height = innerHeight * devicePixelRatio; canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); W = innerWidth; H = innerHeight; if (previousW && previousH) { [p1, p2, ...cloneBodies, ...spells, ...particles].forEach(item => { if (Number.isFinite(item.x)) item.x *= W / previousW; if (Number.isFinite(item.y)) item.y *= H / previousH; if (Number.isFinite(item.vx)) item.vx *= W / previousW; if (Number.isFinite(item.vy)) item.vy *= H / previousH; }); } stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2, a: .25 + Math.random() * .65 })); }
function createLocalBot(profile, teamId, index) { const wizard = wizards[profile.wizardId] || wizards.apprentice; return { nick: `BOT-${index + 1}`, botId: teamId === 'bot-team' ? `bot-${index + 1}` : '', wizardId: profile.wizardId, teamId, x: teamId === 'bot-team' ? W * (.73 + index * .06) : W * (.45 - index * .05), y: H * (.45 + index * .12), hp: wizard.hp, maxHp: wizard.hp, mana: 100, damage: wizard.damage, damageReduction: 0, clones: [], color: teamId === 'bot-team' ? '#ef7693' : '#ffb04b', accent: teamId === 'bot-team' ? '#ffe0e9' : '#fff0bd', face: teamId === 'bot-team' ? -1 : 1, cooldown: 0, botSpeed: 1 + profile.difficulty * .08 }; }
function reset() { const wizard = wizards[selectedWizard]; const botWizard = wizards[activeBotProfile.wizardId] || wizards.apprentice; score = 0; spells = []; particles = []; cloneBodies = []; botPlayers = []; reportedEliminations = new Set(); p1.stunTimer = 0; p1.knockbackTimer = 0; p1.x = W * .27; p1.y = H * .59; p1.maxHp = wizard.hp + getHealthBonus(wizard.hp); p1.hp = p1.maxHp; p1.mana = 100; p1.damage = wizard.damage; p1.damageReduction = getDamageReduction(); p1.spellCooldown = wizard.cooldown; p1.abilityCooldown = 0; p1.clones = 0; p1.cooldown = 0; p1.shield = 0; p1.shieldUsed = false; p1.invisible = false; p1.invisibleTimer = 0; p2.stunTimer = 0; p2.knockbackTimer = 0; p2.x = W * .73; p2.y = H * .59; p2.maxHp = botWizard.hp; p2.hp = p2.maxHp; p2.mana = 100; p2.damage = botWizard.damage; p2.damageReduction = botWizard.damageReduction || 0; p2.clones = []; p2.cooldown = 0; p2.teamId = 'bot-team'; p2.botId = 'bot-1'; p2.botSpeed = 1 + activeBotProfile.difficulty * .08; const botCount = mode === 'bot-one-two' ? 2 : mode === 'bot-one-three' ? 3 : mode === 'bot-two-two' ? 2 : 1; for (let index = 1; index < botCount; index++) botPlayers.push(createLocalBot(botProfiles[(activeBotProfile.difficulty + index) % botProfiles.length], 'bot-team', index)); if (mode === 'bot-two-two') botPlayers.push(createLocalBot(botProfiles[0], 'player-team', 0)); updateUI(); }
const resetForMode = reset;
reset = function () { resetForMode(); if (mode === 'preview') { p2.maxHp = 100; p2.hp = 100; p2.stunTimer = Infinity; botPlayers = []; updateUI(); } };
function getMatchCode() { return matchCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function sendNetwork(message) { if (matchSocket?.readyState === WebSocket.OPEN) matchSocket.send(JSON.stringify(message)); }
function recordElimination(target) { if (reportedEliminations.has(target)) return; reportedEliminations.add(target); if (onlineMatch && target.nick) sendNetwork({ type: 'kill', targetNick: target.nick }); else if (mode.startsWith('bot') && target.teamId === 'bot-team' && target.botId) sendNetwork({ type: 'career-bot-kill', targetId: target.botId }); }
function leaveMatchConnection() { if (matchSocket) { sendNetwork({ type: randomQueued ? 'queue-cancel' : 'leave-room' }); matchSocket.close(); matchSocket = null; } randomQueued = false; onlineMatch = false; joined = false; running = false; remotePlayers.clear(); ui.start.classList.remove('hidden'); updateDeviceControls(); }
function handleNetworkMessage(message) { if (message.type === 'waiting') { ui.join.textContent = `CZEKANIE NA GRACZA // KOD ${message.code}`; return; } if (message.type === 'matched') { onlineMatch = true; joined = true; opponentProfile = message.opponent || {}; mode = 'player'; matchRewardGranted = false; ui.join.textContent = 'PRZECIWNIK ZNALEZIONY // START'; if (!running) startGame('player'); return; } if (message.type === 'state') { p2.x = (1 - message.x) * W; p2.y = message.y * H; p2.hp = message.hp; p2.maxHp = message.maxHp || 100; p2.mana = message.mana; p2.invisible = message.invisible; p2.damageReduction = message.damageReduction || 0; p2.reflectShield = message.reflectShield || 0; p2.clones = (message.clones || []).map(clone => ({ x: (1 - clone.x) * W, y: clone.y * H, slot: clone.slot })); return; } if (message.type === 'spell') { const spell = message.spell; if (p1.reflectShield > 0) { const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x); const reflected = { ...spell, x: p1.x, y: p1.y, vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, life: 1.5, owner: p1 }; spells.push(reflected); sendNetwork({ type: 'reflect', id: spell.id, reflector: currentUser, spell: { ...reflected, x: reflected.x / W, y: reflected.y / H, vx: reflected.vx / W, vy: reflected.vy / H } }); return; } spells.push({ ...spell, x: (1 - spell.x) * W, y: spell.y * H, vx: -spell.vx * W, vy: spell.vy * H, owner: p2 }); return; } if (message.type === 'reflect') { spells.forEach(spell => { if (spell.id === message.id) spell.life = 0; }); const spell = message.spell; spells.push({ ...spell, x: (1 - spell.x) * W, y: spell.y * H, vx: -spell.vx * W, vy: spell.vy * H, owner: message.reflector?.toLowerCase() === currentUser.toLowerCase() ? p1 : p2 }); return; } if (message.type === 'damage') { p1.hp -= message.amount; if (p1.hp <= 0) endGame('GRACZ 2'); return; } if (message.type === 'round-ended') { const won = message.winnerNick?.toLowerCase() === currentUser.toLowerCase(); if (won && !matchRewardGranted && opponentProfile.dropEnabled && keychains[opponentProfile.dropCharm]) { grantKeychain(opponentProfile.dropCharm); matchRewardGranted = true; setToast(`ZDOBYWASZ BRELOCZEK: ${keychains[opponentProfile.dropCharm].name}`); } if (running && !won) { coins = Math.max(0, coins - 50); persistCoins(); ui.result.textContent = 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden'); ui.result.classList.add('loss'); } onlineMatch = false; joined = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'RUNDA ZAKOŃCZONA // DOŁĄCZ PONOWNIE KODEM'; updateDeviceControls(); if (matchSocket) matchSocket.close(); return; } if (message.type === 'opponent-left') { onlineMatch = false; joined = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'PRZECIWNIK OPUŚCIŁ GRĘ'; updateDeviceControls(); setToast('PRZECIWNIK OPUŚCIŁ GRĘ'); } }
function connectMatchSocket(onReady = () => {}) { if (matchSocket?.readyState === WebSocket.OPEN) { onReady(); return; } if (matchSocket?.readyState === WebSocket.CONNECTING) { matchSocket.addEventListener('open', onReady, { once: true }); return; } const protocol = location.protocol === 'https:' ? 'wss' : 'ws'; matchSocket = new WebSocket(`${protocol}://${location.host}`); matchSocket.addEventListener('open', () => { sendNetwork({ type: 'hello', nick: currentUser, sessionToken, profile: getProfileDrop() }); onReady(); }); matchSocket.addEventListener('message', event => { try { handleNetworkMessageV2(JSON.parse(event.data)); } catch { setToast('BŁĄD DANYCH POŁĄCZENIA'); } }); matchSocket.addEventListener('close', () => { matchSocket = null; randomQueued = false; if (onlineMatch) { onlineMatch = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'POŁĄCZENIE ZERWANE'; } }); }
function startCodeMatch() { const code = getMatchCode(); if (!code || !currentUser) { setToast('WPISZ KOD LUB WYBIERZ LOSOWĄ GRĘ'); return; } if (getMap('arcanaMatchBlocked')[currentUser.toLowerCase()]) { setToast('DOPASOWANIE ZABLOKOWANE // WYLOGUJ SIĘ POPRAWNIE'); return; } if (onlineMatch || randomQueued) { setToast('JUŻ SZUKASZ GRACZA'); return; } mode = 'player'; joined = false; ui.join.textContent = 'ŁĄCZENIE Z SERWEREM...'; connectMatchSocket(() => sendNetwork({ type: 'join', code, nick: currentUser, profile: getProfileDrop() })); }
function startTeamQueue(matchType) { queueMatchType = matchType; if (randomQueued) { sendNetwork({ type: 'queue-cancel' }); randomQueued = false; } toggleRandomQueue(); }
function startRankedQueue() { if (!currentUser || onlineMatch) return; if (randomQueued) { setToast('JUŻ SZUKASZ GRACZA'); return; } if (getMap('arcanaMatchBlocked')[currentUser.toLowerCase()]) { setToast('DOPASOWANIE ZABLOKOWANE'); return; } if (groupId && groupMembers[0]?.toLowerCase() !== currentUser.toLowerCase()) { setToast('LIDER GRUPY URUCHAMIA DOPASOWYWANIE'); return; } rankedFallback = false; rankedGameActive = true; queueMatchType = ['1v1', '2v2', '1v2', '1v3'][Math.floor(Math.random() * 4)]; randomQueued = true; mode = 'player'; ui.join.textContent = `RANKED ${queueMatchType.toUpperCase()} // SZUKANIE GRACZA`; connectMatchSocket(() => { if (randomQueued) sendNetwork({ type: 'queue-random', matchType: queueMatchType, ranked: true, profile: getProfileDrop() }); }); rankedSearchTimer = setTimeout(() => { if (!randomQueued || onlineMatch) return; randomQueued = false; rankedFallback = true; sendNetwork({ type: 'queue-cancel' }); ui.join.textContent = 'BRAK GRACZA // ROZPOCZYNAM WALKĘ Z BOTEM'; const botMode = { '1v1': 'bot', '2v2': 'bot-two-two', '1v2': 'bot-one-two', '1v3': 'bot-one-three' }[queueMatchType]; startGame(botMode); }, 5000); }
function toggleRandomQueue() { if (!currentUser || onlineMatch) return; if (randomQueued) { randomQueued = false; sendNetwork({ type: 'queue-cancel' }); randomQueueButton.textContent = 'LOSOWA GRA →'; ui.join.textContent = 'ANULOWANO KOLEJKĘ'; return; } if (getMap('arcanaMatchBlocked')[currentUser.toLowerCase()]) { setToast('DOPASOWANIE ZABLOKOWANE'); return; } if (groupId && groupMembers[0]?.toLowerCase() !== currentUser.toLowerCase()) { setToast('LIDER GRUPY URUCHAMIA DOPASOWYWANIE'); return; } randomQueued = true; mode = 'player'; ui.join.textContent = `SZUKANIE MECZU ${queueMatchType.toUpperCase()}...`; connectMatchSocket(() => { if (randomQueued) sendNetwork({ type: 'queue-random', matchType: queueMatchType, profile: getProfileDrop() }); }); randomQueueButton.textContent = 'ANULUJ KOLEJKĘ'; }
function syncNetworkState() { const now = performance.now(); if (!onlineMatch || now - lastNetworkSync < 50) return; lastNetworkSync = now; sendNetwork({ type: 'state', nick: currentUser, teamId, x: p1.x / W, y: p1.y / H, hp: p1.hp, maxHp: p1.maxHp, mana: p1.mana, invisible: p1.invisible, damageReduction: p1.damageReduction, reflectShield: p1.reflectShield, clones: cloneBodies.map(clone => ({ x: clone.x / W, y: clone.y / H, slot: clone.slot })) }); }
function startGame(selectedMode) { mode = selectedMode; if (mode === 'player' && !joined) { ui.join.textContent = 'NACISNIJ ENTER, ABY DOLACZYC GRACZEM 2'; return; } if (mode.startsWith('bot')) activeBotProfile = botProfiles[Math.floor(Math.random() * botProfiles.length)]; const startToken = ++gameStartToken; reset(); running = false; ui.result.classList.add('hidden'); ui.start.classList.add('hidden'); const wizard = wizards[selectedWizard]; ui.revealName.textContent = wizard.name; ui.revealMage.textContent = wizard.name.slice(0, 1); ui.revealPower.textContent = wizard.abilityType === 'illusion' ? `NIEWIDZIALNOŚĆ // ${wizard.invisibilityDuration} SEKUND // ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.abilityType ? `UMIEJĘTNOŚĆ // ${Math.round(wizard.abilityDamage * 100)}% HP // CO ${wizard.abilityCooldown} SEK` : wizard.reflect ? `ODBICIE POCISKÓW // CO ${wizard.abilityCooldown} SEK` : wizard.heal ? `LECZENIE ${wizard.heal} HP // CO ${wizard.abilityCooldown} SEK` : wizard.maxClones ? `MAKSYMALNIE ${wizard.maxClones} KLONÓW` : wizard.shield ? 'TARCZA // REDUKCJA OBRAŻEŃ' : `MOC ZAKLĘCIA // ${wizard.damage} OBRAŻEŃ`; ui.reveal.classList.remove('hidden'); ui.status.textContent = 'PREPARING DUEL'; ui.event.textContent = 'CHOOSE YOUR SPELL'; ui.rival.textContent = mode.startsWith('bot') ? wizards[activeBotProfile.wizardId].name : 'PLAYER 2'; setTimeout(() => { if (startToken !== gameStartToken || !ui.start.classList.contains('hidden')) return; ui.reveal.classList.add('hidden'); running = true; updateDeviceControls(); ui.status.textContent = 'DUEL SYSTEMS ACTIVE'; ui.event.textContent = mode.startsWith('bot') ? 'THE BOT HAS ENTERED THE CIRCLE' : 'TWO MAGES // ONE DESTINY'; }, 1800); }
const resetWithAbilityState = reset;
reset = function () { resetWithAbilityState(); p1.secondaryAbilityCooldown = 0; teleportTargeting = false; };
const originalStartGame = startGame;
startGame = function (selectedMode) { matchWinRecorded = false; originalStartGame(selectedMode); if (ui.reveal.classList.contains('hidden')) return; const rival = mode.startsWith('bot') ? { nick: 'BOT', wizardId: activeBotProfile.wizardId, title: '' } : opponentProfile; document.getElementById('matchPlayerWizard').textContent = wizards[selectedWizard].name; document.getElementById('matchPlayerNick').textContent = currentUser || 'GRACZ'; document.getElementById('matchPlayerTitle').textContent = getCurrentTitle(); document.getElementById('matchRivalWizard').textContent = wizards[rival.wizardId]?.name || 'ISKRA'; document.getElementById('matchRivalNick').textContent = rival.nick || 'PRZECIWNIK'; document.getElementById('matchRivalTitle').textContent = rival.title || ''; };
const startGameWithPreviewLabel = startGame;
startGame = function (selectedMode) { startGameWithPreviewLabel(selectedMode); if (selectedMode.startsWith('bot') && currentUser) connectMatchSocket(() => sendNetwork({ type: 'bot-match-start', mode: selectedMode })); if (selectedMode === 'preview' && !ui.reveal.classList.contains('hidden')) { document.getElementById('matchRivalWizard').textContent = 'BOT'; document.getElementById('matchRivalNick').textContent = '100 HP // NIE ATAKUJE'; } };
const originalEndGame = endGame;
endGame = function (winner) { const wasRunning = running; const wasOnline = onlineMatch; const wasRanked = rankedGameActive; if (wasRunning && mode.startsWith('bot')) sendNetwork({ type: 'bot-match-end' }); originalEndGame(winner); if (wasRunning && winner === 'GRACZ 1') recordWizardWin(); if (wasRunning && wasRanked && !wasOnline) connectMatchSocket(() => sendNetwork({ type: 'ranked-bot-result', won: winner === 'GRACZ 1' })); if (wasRunning && !wasRanked) rankedGameActive = false; };
function joinPlayer() { if (mode === 'player' && !joined) { joined = true; ui.join.textContent = 'GRACZ 2 DOLACZYL // NACISNIJ ENTER'; setToast('GRACZ 2 DOLACZYL'); } }
function endGame(winner) { if (!running) return; running = false; const wasOnline = onlineMatch; const playerWon = winner === 'GRACZ 1'; if (wasOnline && playerWon) sendNetwork({ type: 'game-over', winnerNick: currentUser, winnerTeamId: teamId }); if (wasOnline) { onlineMatch = false; joined = false; } const baseReward = mode.startsWith('bot') ? activeBotProfile.reward : 100; const reward = window.applyMoneyMultiplier ? window.applyMoneyMultiplier(baseReward) : baseReward; if (playerWon) { coins += reward; persistCoins(); setToast(`+${reward} MONET ZA ZWYCIĘSTWO`); } else { coins = Math.max(0, coins - 50); persistCoins(); setToast('-50 MONET ZA PRZEGRANĄ'); } ui.result.textContent = playerWon ? 'WYGRAŁEŚ!' : 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden'); ui.result.classList.toggle('win', playerWon); ui.start.classList.remove('hidden'); ui.join.textContent = wasOnline ? 'RUNDA ZAKOŃCZONA // WPISZ KOD, ABY DOŁĄCZYĆ PONOWNIE' : `${winner} WYGRYWA // NAGRODA ${playerWon ? reward : 0} MONET`; ui.status.textContent = 'DUEL COMPLETE'; updateDeviceControls(); updateShop(); }
const finishGameWithPreview = endGame;
endGame = function (winner) { if (mode === 'preview') { if (!running) return; running = false; ui.status.textContent = 'TEST POSTACI ZAKOŃCZONY'; document.getElementById('previewExitButton').textContent = 'WRÓĆ DO POSTACI'; updateDeviceControls(); return; } finishGameWithPreview(winner); };
function startWizardTest(id) { if (!wizards[id]) return; previewPreviousWizard = selectedWizard; selectedWizard = id; ui.shop.classList.add('hidden'); const exitButton = document.getElementById('previewExitButton'); exitButton.textContent = 'ZAKOŃCZ TEST'; exitButton.classList.remove('hidden'); startGame('preview'); }
function exitWizardTest() { if (mode !== 'preview') return; gameStartToken += 1; running = false; document.getElementById('previewExitButton').classList.add('hidden'); selectedWizard = previewPreviousWizard || 'apprentice'; previewPreviousWizard = ''; ui.result.classList.add('hidden'); ui.start.classList.remove('hidden'); ui.shop.classList.remove('hidden'); updateShop(); openWizard(viewedWizard); updateDeviceControls(); }
document.getElementById('testWizardButton').addEventListener('click', () => startWizardTest(viewedWizard));
document.getElementById('previewExitButton').addEventListener('click', exitWizardTest);
function move(m, dx, dy, dt) { if (m.hp <= 0) return; const speed = m === p1 ? (wizards[selectedWizard].speed || 1) : (m.botSpeed || 1); m.x = Math.max(40, Math.min(W - 40, m.x + dx * 230 * speed * dt)); m.y = Math.max(H * .24, Math.min(H * .82, m.y + dy * 180 * speed * dt)); }
function getHostileTargets() { return onlineMatch ? [...remotePlayers.values()].filter(player => player.teamId !== teamId) : [p2, ...botPlayers].filter(player => player.teamId === 'bot-team'); }
function cast(owner, target, color) {
  const melee = owner === p1 && selectedWizard === 'hercules';
  if (!running || owner.hp <= 0 || target.hp <= 0 || owner === target || owner.cooldown > 0 || owner.stunTimer > 0 || (!melee && owner.mana < 16) || (owner === p1 && p1.damage <= 0 && !melee)) return;
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  if (melee) {
    if (Math.hypot(target.x - owner.x, target.y - owner.y) > 92) return;
    owner.cooldown = p1.spellCooldown;
    const damage = 15 * (1 - (target === p2 ? (p2.damageReduction || 0) : getDamageReduction()));
    const targetWasAlive = target.hp > 0;
    target.hp -= damage;
    if (target.nick && remotePlayers.has(target.nick.toLowerCase())) remotePlayers.get(target.nick.toLowerCase()).hp = target.hp;
    if (onlineMatch && target.nick) sendNetwork({ type: 'damage', targetNick: target.nick, amount: damage });
    if (targetWasAlive && target.hp <= 0) recordElimination(target);
    burst(target.x, target.y, '#e8c49a', 10);
    if (target.hp <= 0 && getHostileTargets().every(player => player.hp <= 0)) endGame('GRACZ 1');
    setToast('HERKULES // CIOS PIĘŚCIĄ');
    return;
  }
  owner.cooldown = owner === p1 ? p1.spellCooldown : .3;
  owner.mana -= 16;
  const damage = owner === p1 ? p1.damage * getStrengthMultiplier() : owner.damage;
  const healingBolt = owner === p1 && wizards[selectedWizard]?.healAlly;
  const spell = { id: `${Date.now()}-${Math.random()}`, x: owner.x + Math.cos(angle) * 28, y: owner.y + Math.sin(angle) * 28, vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, life: 1.5, damage, color, ownerNick: owner === p1 ? currentUser : owner.nick, teamId: owner === p1 ? teamId : owner.teamId, healAlly: healingBolt, healAmount: wizards[selectedWizard]?.healAmount || 0, electricDamage: owner === p1 && wizards[selectedWizard]?.electricDamage };
  const shieldTarget = target === p1 ? p1.reflectShield > 0 : target.reflectShield > 0;
  if (shieldTarget) {
    const direction = Math.atan2((target === p1 ? p2.y : p1.y) - target.y, (target === p1 ? p2.x : p1.x) - target.x);
    const reflected = { ...spell, x: target.x, y: target.y, vx: Math.cos(direction) * 520, vy: Math.sin(direction) * 520, color: target.color, owner: target, ownerNick: target === p1 ? currentUser : target.nick, teamId: target === p1 ? teamId : target.teamId };
    spells.push(reflected);
    if (onlineMatch && target !== p1) sendNetwork({ type: 'reflect', id: spell.id, reflector: target.nick, spell: { ...reflected, x: reflected.x / W, y: reflected.y / H, vx: reflected.vx / W, vy: reflected.vy / H } });
    return;
  }
  spells.push({ ...spell, owner });
  if (onlineMatch && owner === p1) sendNetwork({ type: 'spell', ownerNick: currentUser, teamId, spell: { ...spell, x: spell.x / W, y: spell.y / H, vx: spell.vx / W, vy: spell.vy / H } });
  burst(owner.x, owner.y, color, 5);
}
function useAbility() {
  if (!running || p1.hp <= 0 || p1.stunTimer > 0) return;
  const wizard = wizards[selectedWizard];
  if (wizard.abilityType === 'leaf-gust') {
    if (p1.abilityCooldown > 0) { setToast(`PODMUCH LIŚCI // ODNOWIENIE ${Math.ceil(p1.abilityCooldown)} SEK`); return; }
    p1.abilityCooldown = wizard.abilityCooldown;
    const targets = getHostileTargets().filter(target => applyLeafGust(target, p1.x, p1.y));
    if (onlineMatch) sendNetwork({ type: 'leaf-gust', teamId, x: p1.x / W, y: p1.y / H });
    burst(p1.x, p1.y, '#b7df78', 24);
    setToast(targets.length ? 'PODMUCH LIŚCI // ODRZUT + OGŁUSZENIE' : 'PODMUCH LIŚCI // POZA ZASIĘGIEM');
    return;
  }
  if (wizard.maxClones) {
    if (p1.clones >= wizard.maxClones) { setToast(`KLONER // LIMIT ${wizard.maxClones} KLONÓW`); return; }
    p1.clones += 1;
    cloneBodies.push({ x: p1.x, y: p1.y, slot: p1.clones - 1 });
    burst(p1.x, p1.y, '#d89cff', 14);
    syncNetworkState();
    setToast(`KLONER // KLON ${p1.clones}/${wizard.maxClones}`);
    return;
  }
  if (wizard.heal) {
    if (p1.abilityCooldown > 0) { setToast(`UZDROWICIEL // ODNOWIENIE ${Math.ceil(p1.abilityCooldown)} SEK`); return; }
    if (p1.hp >= p1.maxHp) { setToast('UZDROWICIEL // HP JEST PEŁNE'); return; }
    p1.hp = Math.min(p1.maxHp, p1.hp + wizard.heal);
    p1.abilityCooldown = wizard.abilityCooldown;
    burst(p1.x, p1.y, '#8dff9a', 14);
    setToast(`UZDROWICIEL // +${wizard.heal} HP`);
    return;
  }
  if (wizard.healAlly) {
    if (p1.abilityCooldown > 0) { setToast(`ŚWIĄTY LECZYCIEL // ODNOWIENIE ${Math.ceil(p1.abilityCooldown)} SEK`); return; }
    p1.hp = Math.min(p1.maxHp, p1.hp + wizard.healAmount);
    p1.abilityCooldown = wizard.abilityCooldown;
    burst(p1.x, p1.y, '#a9ffc1', 14);
    setToast(`ŚWIĄTY LECZYCIEL // +${wizard.healAmount} HP`);
    return;
  }
  if (wizard.abilityType === 'illusion') {
    if (p1.invisible) {
      p1.invisible = false;
      p1.invisibleTimer = 0;
      updateDeviceControls();
      setToast('ILUZJONISTA // ZAKOŃCZONO NIEWIDZIALNOŚĆ');
      return;
    }
    if (p1.abilityCooldown > 0) { setToast(`ILUZJONISTA // ODNOWIENIE ${Math.ceil(p1.abilityCooldown)} SEK`); return; }
    p1.invisible = true;
    p1.invisibleTimer = wizard.invisibilityDuration;
    p1.abilityCooldown = wizard.abilityCooldown;
    updateDeviceControls();
    setToast(`ILUZJONISTA // NIEWIDZIALNOŚĆ ${wizard.invisibilityDuration} SEKUND`);
    return;
  }
  if (wizard.invisibility) { p1.invisible = !p1.invisible; setToast(p1.invisible ? 'WŁADCA // NIEWIDZIALNOŚĆ' : 'WŁADCA // WIDOCZNOŚĆ'); return; }
  if (wizard.shield && !wizard.reflect) {
    if (p1.shieldUsed) return;
    p1.shield = 10;
    p1.shieldUsed = true;
    setToast('TARCZA // 80% REDUKCJI // 10 SEKUND');
    return;
  }
  if (wizard.reflect || wizard.abilityType) {
    if (p1.abilityCooldown > 0) { setToast(`ODNOWIENIE // ${Math.ceil(p1.abilityCooldown)} SEK`); return; }
    p1.abilityCooldown = wizard.abilityCooldown;
    if (wizard.reflect) { p1.reflectShield = 5; syncNetworkState(); setToast('TARCZOWNIK // ODBICIE PRZEZ 5 SEKUND'); return; }
    if (wizard.abilityType === 'stone') {
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const spell = { id: `${Date.now()}-${Math.random()}`, x: p1.x, y: p1.y, vx: Math.cos(angle) * 380, vy: Math.sin(angle) * 380, life: 2, damage: p2.maxHp * wizard.abilityDamage, color: '#c7a16b', ownerNick: currentUser, teamId };
      spells.push({ ...spell, owner: p1 });
      if (onlineMatch) sendNetwork({ type: 'spell', ownerNick: currentUser, teamId, spell: { ...spell, x: spell.x / W, y: spell.y / H, vx: spell.vx / W, vy: spell.vy / H } });
      burst(p1.x, p1.y, spell.color, 12);
      setToast('HERKULES // KAMIEŃ RZUCONY');
      return;
    }
    const target = getHostileTargets().filter(player => player.hp > 0)
      .sort((left, right) => Math.hypot(left.x - p1.x, left.y - p1.y) - Math.hypot(right.x - p1.x, right.y - p1.y))[0];
    if (!target) { p1.abilityCooldown = 0; setToast('BRAK PRZECIWNIKA W ZASIĘGU'); return; }
    if (wizard.abilityType === 'eagle-strike') {
      const angle = Math.atan2(target.y - p1.y, target.x - p1.x);
      const spell = { id: `${Date.now()}-${Math.random()}`, x: p1.x, y: p1.y, vx: Math.cos(angle) * 340, vy: Math.sin(angle) * 340, life: 2, damage: target.maxHp * wizard.abilityDamage, color: '#f5c451', ownerNick: currentUser, teamId, eagle: true };
      spells.push({ ...spell, owner: p1 });
      if (onlineMatch) sendNetwork({ type: 'spell', ownerNick: currentUser, teamId, spell: { ...spell, x: spell.x / W, y: spell.y / H, vx: spell.vx / W, vy: spell.vy / H } });
      burst(p1.x, p1.y, spell.color, 14);
      setToast('WŁADCA ORŁÓW // ORZEŁ ATAKUJE');
      return;
    }
    const damage = target.maxHp * wizard.abilityDamage * (1 - (target.damageReduction || 0));
    const targetWasAlive = target.hp > 0;
    target.hp -= damage;
    if (target.nick && remotePlayers.has(target.nick.toLowerCase())) remotePlayers.get(target.nick.toLowerCase()).hp = target.hp;
    if (onlineMatch && target.nick) sendNetwork({ type: 'damage', targetNick: target.nick, amount: damage });
    if (targetWasAlive && target.hp <= 0) recordElimination(target);
    const effectColor = wizard.abilityType === 'sword' ? '#e9e4d5' : '#ffe56b';
    burst(target.x, target.y, effectColor, 16);
    if (target.hp <= 0 && getHostileTargets().every(player => player.hp <= 0)) endGame('GRACZ 1');
    setToast(wizard.abilityType === 'sword' ? 'RYCERZ // CIOS MIECZEM' : 'PIORUN // UDERZENIE');
  }
}
function useSecondaryAbility() {
  if (!running || p1.hp <= 0 || p1.stunTimer > 0) return;
  const wizard = wizards[selectedWizard];
  if (wizard.secondaryAbilityType === 'eagle-heal') {
    if (p1.secondaryAbilityCooldown > 0) { setToast(`WŁADCA ORŁÓW // LECZENIE ZA ${Math.ceil(p1.secondaryAbilityCooldown)} SEK`); return; }
    if (p1.hp >= p1.maxHp) { setToast('WŁADCA ORŁÓW // HP JEST PEŁNE'); return; }
    const heal = p1.maxHp * .3;
    const healed = Math.min(heal, p1.maxHp - p1.hp);
    p1.hp = Math.min(p1.maxHp, p1.hp + heal);
    p1.secondaryAbilityCooldown = wizard.secondaryAbilityCooldown;
    burst(p1.x, p1.y, '#b7f2c9', 18);
    setToast(`WŁADCA ORŁÓW // ORZEŁ LECZY +${Math.round(healed)} HP`);
    return;
  }
  if (wizard.secondaryAbilityType === 'teleport') {
    if (p1.secondaryAbilityCooldown > 0) { setToast(`ILUZJONISTA // TELEPORT ZA ${Math.ceil(p1.secondaryAbilityCooldown)} SEK`); return; }
    teleportTargeting = !teleportTargeting;
    setToast(teleportTargeting ? 'ILUZJONISTA // KLIKNIJ MIEJSCE TELEPORTACJI' : 'ILUZJONISTA // TELEPORT ANULOWANY');
    return;
  }
  useShield();
}
function applyLeafGust(target, sourceX, sourceY) { const dx = target.x - sourceX; const dy = target.y - sourceY; const distance = Math.hypot(dx, dy); if (distance > 380) return false; const direction = distance ? 1 / distance : 1; target.stunTimer = 2; target.knockbackX = dx * direction * 680; target.knockbackY = dy * direction * 420; target.knockbackTimer = .4; return true; }
function tickControlEffects(target, dt) { target.stunTimer = Math.max(0, (target.stunTimer || 0) - dt); if (target.knockbackTimer > 0) { target.x = Math.max(40, Math.min(W - 40, target.x + target.knockbackX * dt)); target.y = Math.max(H * .24, Math.min(H * .82, target.y + target.knockbackY * dt)); target.knockbackTimer = Math.max(0, target.knockbackTimer - dt); } }
function useShield() { if (!running || !wizards[selectedWizard].fullShield || p1.shieldUsed) return; p1.shield = 10; p1.shieldUsed = true; setToast('WŁADCA // TARCZA 100% // 10 SEKUND'); }
function teleportToPointer(event) {
  if (!teleportTargeting || !running || selectedWizard !== 'illusionist') return;
  const rect = canvas.getBoundingClientRect();
  p1.x = Math.max(40, Math.min(W - 40, (event.clientX - rect.left) * W / rect.width));
  p1.y = Math.max(H * .24, Math.min(H * .82, (event.clientY - rect.top) * H / rect.height));
  teleportTargeting = false;
  p1.secondaryAbilityCooldown = wizards.illusionist.secondaryAbilityCooldown;
  burst(p1.x, p1.y, '#c4a8ff', 18);
  lastNetworkSync = 0;
  syncNetworkState();
  setToast('ILUZJONISTA // TELEPORTACJA');
}
canvas.addEventListener('pointerdown', teleportToPointer);
function update(dt) {
  if (!running || document.getElementById('rotatePrompt').classList.contains('show')) return;
  tickControlEffects(p1, dt); tickControlEffects(p2, dt); botPlayers.forEach(player => tickControlEffects(player, dt));
  if (p1.stunTimer <= 0) move(p1, (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0), dt);
  const time = performance.now() / 1000;
  cloneBodies.forEach(clone => {
    const angle = clone.slot * Math.PI * 2 / 3 + time * .7;
    const targetX = p1.x + Math.cos(angle) * 62;
    const targetY = p1.y + Math.sin(angle) * 38;
    clone.x += (targetX - clone.x) * Math.min(1, dt * 5);
    clone.y += (targetY - clone.y) * Math.min(1, dt * 5);
  });
  if (mode === 'player' && !onlineMatch && p2.hp > 0 && p2.stunTimer <= 0) move(p2, (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0), (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0), dt);
  else if (mode !== 'preview' && !onlineMatch) { if (p2.hp > 0 && p2.stunTimer <= 0) { move(p2, p1.x > p2.x + 30 ? 1 : p1.x < p2.x - 30 ? -1 : 0, p1.y > p2.y + 25 ? 1 : p1.y < p2.y - 25 ? -1 : 0, dt); if (!p1.invisible && Math.random() < dt * (.45 + activeBotProfile.difficulty * .18)) cast(p2, p1, p2.color); } botPlayers.forEach(player => { if (player.hp <= 0 || player.stunTimer > 0) return; const targets = player.teamId === 'bot-team' ? [p1] : getHostileTargets(); const target = targets.filter(item => item && item.hp > 0).sort((left, right) => Math.hypot(left.x - player.x, left.y - player.y) - Math.hypot(left.x - player.x, left.y - player.y))[0]; if (!target) return; move(player, target.x > player.x + 30 ? 1 : target.x < player.x - 30 ? -1 : 0, target.y > player.y + 25 ? 1 : target.y < player.y - 25 ? -1 : 0, dt); if (Math.random() < dt * (.45 + activeBotProfile.difficulty * .18)) cast(player, target, player.color); }); }
  p1.cooldown = Math.max(0, p1.cooldown - dt);
  p1.abilityCooldown = Math.max(0, p1.abilityCooldown - dt);
  p1.secondaryAbilityCooldown = Math.max(0, p1.secondaryAbilityCooldown - dt);
  if (p1.invisibleTimer > 0) { p1.invisibleTimer = Math.max(0, p1.invisibleTimer - dt); if (!p1.invisibleTimer) { p1.invisible = false; updateDeviceControls(); } }
  p2.cooldown = Math.max(0, p2.cooldown - dt);
  botPlayers.forEach(player => { player.cooldown = Math.max(0, player.cooldown - dt); player.mana = Math.min(100, player.mana + dt * 8); });
  p1.shield = Math.max(0, p1.shield - dt);
  p1.reflectShield = Math.max(0, p1.reflectShield - dt);
  p2.reflectShield = Math.max(0, p2.reflectShield - dt);
  p1.mana = Math.min(100, p1.mana + dt * 8);
  p2.mana = Math.min(100, p2.mana + dt * 8);
  if (keys.Space) cast(p1, getHostileTargets().filter(target => target.hp > 0).sort((left, right) => Math.hypot(left.x - p1.x, left.y - p1.y) - Math.hypot(right.x - p1.x, right.y - p1.y))[0] || p2, p1.color);
  if (mode === 'player' && !onlineMatch && (keys.Numpad0 || keys.Digit0)) cast(p2, p1, p2.color);
  spells.forEach(spell => {
    spell.x += spell.vx * dt;
    spell.y += spell.vy * dt;
    spell.life -= dt;
    if (spell.life <= 0) return;
    if (spell.owner === p1) {
      const healsAlly = Boolean(spell.healAlly);
      if (healsAlly && Math.hypot(spell.x - p1.x, spell.y - p1.y) < 38) {
        const heal = Number(spell.healAmount) || 18;
        p1.hp = Math.min(p1.maxHp, p1.hp + heal);
        burst(p1.x, p1.y, '#99ffd0', 12); spell.life = 0;
        setToast('ŚWIĄTY LECZYCIEL // +HP');
        return;
      }
      const target = getHostileTargets().find(player => player.hp > 0 && Math.hypot(spell.x - player.x, spell.y - player.y) < 36);
      if (!target) return;
      const damage = spell.damage * (1 - (target.damageReduction || 0));
      const targetWasAlive = target.hp > 0;
      target.hp -= damage;
      if (spell.electricDamage) target.stunTimer = Math.max(target.stunTimer || 0, 1.2);
      if (onlineMatch && target.nick) sendNetwork({ type: 'damage', targetNick: target.nick, amount: damage, stunDuration: spell.electricDamage ? 1.2 : 0 });
      if (targetWasAlive && target.hp <= 0) recordElimination(target);
      burst(target.x, target.y, spell.color, spell.electricDamage ? 20 : 12); spell.life = 0;
      if (spell.electricDamage) setToast('ELEKTRYCZNY // PORAŻENIE PRĄDEM');
      if (p2.nick === target.nick) p2.hp = target.hp;
      if (onlineMatch && getHostileTargets().every(player => player.hp <= 0)) endGame('GRACZ 1');
      else if (!onlineMatch && getHostileTargets().every(player => player.hp <= 0)) endGame('GRACZ 1');
      return;
    }
    if ((onlineMatch && spell.teamId === teamId) || (!onlineMatch && spell.teamId === 'player-team')) return;
    if (Math.hypot(spell.x - p1.x, spell.y - p1.y) >= 36) return;
    const reduction = getDamageReduction();
    const shieldFactor = p1.shield > 0 ? (wizards[selectedWizard].fullShield ? 0 : .2) : 1;
    p1.hp -= spell.damage * (1 - reduction) * shieldFactor;
    if (spell.electricDamage) p1.stunTimer = Math.max(p1.stunTimer || 0, 1.2);
    burst(p1.x, p1.y, spell.color, 12); spell.life = 0;
    if (p1.hp <= 0) endGame('GRACZ 2');
  });
  spells = spells.filter(spell => spell.life > 0 && spell.x > -40 && spell.x < W + 40 && spell.y > -40 && spell.y < H + 40);
  particles.forEach(particle => { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.life -= dt; });
  particles = particles.filter(particle => particle.life > 0);
  toastClock -= dt;
  syncNetworkState();
  updateUI();
}
function burst(x, y, color, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 25 + Math.random() * 130; particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .3 + Math.random() * .5, color, size: 2 + Math.random() * 3 }); } }
function setToast(text) { ui.toast.textContent = text; ui.toast.classList.add('show'); toastClock = 1.2; }
function renderNews() { Object.entries(news).forEach(([category, messages]) => { newsUi.lists[category].innerHTML = messages.length ? messages.map(message => `<p>${escapeHtml(message)}</p>`).join('') : '<p>BRAK WIADOMOŚCI</p>'; }); }
function toggleNews(show) { if (show) { renderNews(); newsUi.modal.classList.remove('hidden'); } else newsUi.modal.classList.add('hidden'); }
let musicContext = null, musicGain = null, musicTimer = null, musicStep = 0;
function toggleMusic() { if (musicContext) { musicContext.close(); musicContext = null; musicGain = null; clearInterval(musicTimer); musicTimer = null; newsUi.music.textContent = 'MUZYKA: WŁĄCZ'; return; } const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return; musicContext = new AudioContextClass(); musicContext.resume(); musicGain = musicContext.createGain(); musicGain.gain.value = .08; musicGain.connect(musicContext.destination); const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23]; const playNote = () => { const oscillator = musicContext.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = notes[musicStep++ % notes.length]; oscillator.connect(musicGain); oscillator.start(); oscillator.stop(musicContext.currentTime + 1.8); }; playNote(); musicTimer = setInterval(playNote, 1800); newsUi.music.textContent = 'MUZYKA: WYŁĄCZ'; }
let pendingTradeNick = '', tradeState = { partner: '', ownItems: [], partnerItems: [], ownCoins: 0, partnerCoins: 0, accepted: false };
function installLimitedWizard(character) { if (!character?.id || !/^limited-\d{4}-\d{2}$/.test(character.id)) return false; wizards[character.id] = { id: character.id, name: String(character.name || 'CZARODZIEJ SEZONU'), hp: Number(character.hp) || 100, damage: Number(character.damage) || 12, cooldown: Number(character.cooldown) || .3, cost: 999999999, limited: true, month: character.month || character.id.slice(8) }; wizardTitles[character.id] = `LIMITOWANY CZARODZIEJ // ${wizards[character.id].month}`; const offers = document.querySelector('.wizard-offers'); if (offers && !offers.querySelector(`[data-wizard="${character.id}"]`)) { const card = document.createElement('button'); card.type = 'button'; card.className = 'wizard-card'; card.dataset.wizard = character.id; const name = document.createElement('b'); name.textContent = wizards[character.id].name; const label = document.createElement('span'); label.textContent = 'LIMITOWANY CZARODZIEJ'; card.append(name, label); offers.append(card); } return true; }
function grantLimitedWizard(character) { if (!installLimitedWizard(character)) return; const key = currentUser.toLowerCase(); const catalog = getMap('arcanaLimitedWizards'); catalog[character.id] = character; saveMap('arcanaLimitedWizards', catalog); const owned = getMap('arcanaOwned'); const accounts = getAccounts(); owned[key] = Array.from(new Set([...(owned[key] || []), character.id])); if (accounts[key]) accounts[key].wizards = Array.from(new Set([...(accounts[key].wizards || []), character.id])); saveMap('arcanaOwned', owned); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); }
function loadLimitedWizards() { Object.values(getMap('arcanaLimitedWizards')).forEach(installLimitedWizard); }
function getTradeItems() { const key = currentUser.toLowerCase(); const keychainItems = (getMap('arcanaKeychains')[key] || []).filter(id => keychains[id]).map(id => ({ id: `keychain:${id}`, label: keychains[id].name })); const hatItems = (getMap('arcanaHats')[key] || []).filter(id => hats[id]).map(id => ({ id: `hat:${id}`, label: hats[id].name })); const accounts = getAccounts(); const ownedWizards = [...new Set([...(getMap('arcanaOwned')[key] || []), ...(accounts[key]?.wizards || [])])]; const wizardItems = ownedWizards.filter(id => id !== 'apprentice' && wizards[id] && !wizards[id].ownerOnly && !wizards[id].limited).map(id => ({ id: `wizard:${id}`, label: wizards[id].name })); return [...wizardItems, ...keychainItems, ...hatItems]; }
function renderTrade() { const own = getTradeItems(); tradeUi.ownItems.innerHTML = own.length ? own.map(item => `<button type="button" class="trade-item ${tradeState.ownItems.includes(item.id) ? 'selected' : ''}" data-trade-item="${item.id}" ${tradeState.accepted ? 'disabled' : ''}>${escapeHtml(item.label)}</button>`).join('') : '<span class="friends-empty">BRAK RZECZY</span>'; tradeUi.partnerItems.innerHTML = tradeState.partnerItems.length ? tradeState.partnerItems.map(item => `<div class="trade-item">${escapeHtml(item.label)}</div>`).join('') : '<span class="friends-empty">BRAK OFERTY</span>'; tradeUi.partnerCoins.textContent = `MONETY: ${tradeState.partnerCoins}`; tradeUi.ownCoins.value = tradeState.ownCoins; tradeUi.ownCoins.disabled = tradeState.accepted; }
function getTradeOffer() { return { items: tradeState.ownItems.map(id => ({ id, label: getTradeItems().find(item => item.id === id)?.label || id })), coins: Math.max(0, Number(tradeUi.ownCoins.value) || 0) }; }
function sendTradeOffer() { if (tradeState.partner) sendNetwork({ type: 'trade-offer', targetNick: tradeState.partner, offer: getTradeOffer() }); }
function openTrade(partner) { tradeState = { partner, ownItems: [], partnerItems: [], ownCoins: 0, partnerCoins: 0, accepted: false }; tradeUi.partnerName.textContent = `GRACZ: ${partner}`; tradeUi.status.textContent = ''; renderTrade(); tradeUi.modal.classList.remove('hidden'); sendTradeOffer(); }
function sendTradeRequest(nick) { connectMatchSocket(() => sendNetwork({ type: 'trade-request', targetNick: nick })); setToast('PROŚBA O WYMIANĘ WYSŁANA'); }
function applyTradeOffer(items, coinsAmount, received) { const key = currentUser.toLowerCase(); items.forEach(token => { const [type, id] = token.id.split(':'); if (type === 'wizard') { if (!wizards[id] || id === 'apprentice' || wizards[id].ownerOnly) return; const owned = getMap('arcanaOwned'); const accounts = getAccounts(); const accountWizards = accounts[key]?.wizards || []; if (received) { owned[key] = Array.from(new Set([...(owned[key] || []), id])); accounts[key].wizards = Array.from(new Set([...accountWizards, id])); } else { owned[key] = (owned[key] || []).filter(item => item !== id); accounts[key].wizards = accountWizards.filter(item => item !== id); if (selectedWizard === id) removeWizard(); } saveMap('arcanaOwned', owned); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); return; } const mapName = type === 'keychain' ? 'arcanaKeychains' : type === 'hat' ? 'arcanaHats' : ''; if (!mapName) return; const map = getMap(mapName); map[key] = received ? [...(map[key] || []), id] : (map[key] || []).filter(item => item !== id); saveMap(mapName, map); }); const balances = getMap('arcanaBalances'); balances[key] = received ? Number(balances[key] ?? coins) + Number(coinsAmount || 0) : Math.max(0, Number(balances[key] ?? coins) - coinsAmount); saveMap('arcanaBalances', balances); coins = balances[key]; persistCoins(); updateShop(); updateBackpack(); }
function commitTrade() { if (!tradeState.partner || tradeState.accepted) return; tradeState.ownCoins = Math.max(0, Number(tradeUi.ownCoins.value) || 0); const balance = Number(getMap('arcanaBalances')[currentUser.toLowerCase()] ?? coins); if (tradeState.ownCoins > balance) { tradeUi.status.textContent = 'NIE MASZ TYLE MONET'; return; } tradeState.accepted = true; tradeUi.status.textContent = 'OCZEKIWANIE NA DRUGIEGO GRACZA'; renderTrade(); sendNetwork({ type: 'trade-commit', targetNick: tradeState.partner, offer: getTradeOffer() }); }
function completeTrade(message) { applyTradeOffer(message.ownOffer.items || [], message.ownOffer.coins || 0, false); applyTradeOffer(message.receivedOffer.items || [], message.receivedOffer.coins || 0, true); tradeUi.status.textContent = 'WYMIANA ZAKOŃCZONA'; setToast('WYMIANA ZAKOŃCZONA'); setTimeout(() => tradeUi.modal.classList.add('hidden'), 900); }
function showChatBubble(nick, text) { chatUi.bubble.textContent = `${nick}: ${text}`; chatUi.bubble.classList.remove('hidden'); const isOwn = nick.toLowerCase() === currentUser.toLowerCase(); chatUi.bubble.style.left = `${(isOwn ? p1.x : p2.x)}px`; chatUi.bubble.style.top = `${(isOwn ? p1.y : p2.y) - 72}px`; clearTimeout(showChatBubble.timer); showChatBubble.timer = setTimeout(() => chatUi.bubble.classList.add('hidden'), 5000); }
function sendChat(text) { const clean = String(text || '').trim().slice(0, 120); if (!clean) return; if (onlineMatch) sendNetwork({ type: 'chat', text: clean }); else showChatBubble(currentUser, clean); chatUi.input.value = ''; chatUi.modal.classList.add('hidden'); }
function updateShop() { const accounts = getAccounts(); const accountOwned = accounts[currentUser.toLowerCase()]?.wizards || []; const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...accountOwned])); ui.coins.textContent = coins; ui.shop.querySelectorAll('.wizard-card[data-wizard]').forEach(card => { const wizard = wizards[card.dataset.wizard]; if (!wizard) return; const selected = card.dataset.wizard === selectedWizard; const hasWizard = wizard.cost === 0 || owned.includes(card.dataset.wizard); const available = hasWizard || (!wizard.ownerOnly && wizard.cost <= coins) || selected; card.classList.toggle('hidden', ownedOnly && !hasWizard); card.classList.toggle('locked', !available); card.classList.toggle('selected', selected); card.querySelector('span').textContent = selected ? 'WYBRANY' : wizard.ownerOnly && !hasWizard ? 'TYLKO WŁAŚCICIEL' : hasWizard ? 'POSIADANY' : wizard.cost === 0 ? 'DARMOWY' : `${wizard.cost} MONET // KUP`; }); window.refreshShopCollections?.(); window.updatePassShop?.(); }
function updatePrivateWizardCard() { let card = ui.shop.querySelector('.wizard-card[data-wizard="october"]'); if (card) return; card = document.createElement('button'); card.type = 'button'; card.className = 'wizard-card'; card.dataset.wizard = 'october'; const name = document.createElement('b'); name.textContent = wizards.october.name; const label = document.createElement('span'); label.textContent = 'TYLKO WŁAŚCICIEL'; card.append(name, label); card.addEventListener('click', () => openWizard('october')); ui.shop.querySelector('.wizard-offers').append(card); }
function escapeHtml(value) { return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function updateFriends() { const key = currentUser.toLowerCase(); const friends = getMap('arcanaFriends')[key] || []; const requests = getMap('arcanaFriendRequests')[key] || []; ui.friendsList.innerHTML = friends.length ? friends.map(nick => `<div class="friend-item"><span class="friend-identity"><span class="friend-avatar" aria-hidden="true">${escapeHtml(nick.slice(0, 1).toUpperCase())}</span><span>${escapeHtml(nick)}</span></span><button type="button" data-group-invite="${encodeURIComponent(nick)}">ZAPROŚ DO GRUPY</button></div>`).join('') : '<div class="friends-empty">BRAK ZNAJOMYCH</div>'; ui.suggestionsList.innerHTML = requests.length ? requests.map(nick => `<div class="friend-item friend-request"><span class="friend-identity"><span class="friend-avatar" aria-hidden="true">${escapeHtml(nick.slice(0, 1).toUpperCase())}</span><span>${escapeHtml(nick)}</span></span><span class="friend-request-actions"><button type="button" data-accept="${encodeURIComponent(nick)}">✓</button><button type="button" data-reject="${encodeURIComponent(nick)}">X</button></span></div>`).join('') : '<div class="friends-empty">BRAK ZAPROSZEŃ</div>'; }
const originalUpdateFriends = updateFriends;
const originalUpdateShop = updateShop;
updateShop = function () { loadLimitedWizards(); originalUpdateShop(); updatePrivateWizardCard(); };
const originalOpenWizard = openWizard;
openWizard = function (id) {
  originalOpenWizard(id);
  const wizard = wizards[id];
  const descriptions = {
    electric: 'Strzały rażą prądem i ogłuszają. Gadżet E: piorun zadaje 55% HP.',
    thunder: 'Gadżet E: piorun zadaje 50% maksymalnego HP przeciwnika.',
    illusionist: `Gadżet E: niewidzialność do ${wizard.invisibilityDuration} s (można przerwać). Gadżet Q: kliknij miejsce, aby się teleportować.`,
    eaglelord: 'Gadżet E: przyzwany orzeł zadaje do 30% maksymalnego HP. Gadżet Q: orzeł leczy do 30% maksymalnego HP.'
  };
  if (descriptions[id]) {
    const details = ui.wizardPower.textContent;
    const divider = details.indexOf(' | ');
    ui.wizardPower.textContent = `${descriptions[id]}${divider >= 0 ? details.slice(divider) : ''}`;
  }
  if (id === 'october') ui.wizardPower.textContent = `Gadżet: PODMUCH LIŚCI // ODRZUT + OGŁUSZENIE 2 SEKUNDY, ODNOWIENIE ${wizard.abilityCooldown} SEKUND | ${wizard.damage} OBRAŻEŃ | ${wizard.hp} HP`;
};
updateFriends = function () { originalUpdateFriends(); ui.friendsList.querySelectorAll('.friend-item').forEach(item => { const nick = item.querySelector('.friend-identity > span:last-child')?.textContent.trim(); if (nick && !item.querySelector('[data-trade]')) { const button = document.createElement('button'); button.type = 'button'; button.dataset.trade = encodeURIComponent(nick); button.textContent = 'WYMIANA'; item.appendChild(button); } }); };
function setFriendsTab(tab) { const tabs = { friends: [ui.friendsTab, ui.friendsView], suggestions: [ui.suggestionsTab, ui.suggestionsView], requests: [ui.requestsTab, ui.requestsView] }; Object.entries(tabs).forEach(([name, [button, view]]) => { button.classList.toggle('active', name === tab); view.classList.toggle('hidden', name !== tab); }); }
const originalNetworkMessageHandler = handleNetworkMessageV2;
handleNetworkMessageV2 = function (message) { if (message.type === 'round-ended' && (message.winnerTeamId ? message.winnerTeamId === teamId : message.winnerNick?.toLowerCase() === currentUser.toLowerCase())) recordWizardWin(); originalNetworkMessageHandler(message); };
function sendFriendInvite() { const nick = ui.inviteNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); ui.inviteMessage.textContent = ''; if (!accounts[key]) { ui.inviteMessage.textContent = 'NIE ZNALEZIONO TAKIEGO GRACZA'; return; } if (key === currentUser.toLowerCase()) { ui.inviteMessage.textContent = 'NIE MOŻESZ ZAPROSIĆ SIEBIE'; return; } const friendsMap = getMap('arcanaFriends'); const friends = friendsMap[currentUser.toLowerCase()] || []; if (friends.some(friend => friend.toLowerCase() === key)) { ui.inviteMessage.textContent = 'TEN GRACZ JUŻ JEST ZNAJOMYM'; return; } const requestsMap = getMap('arcanaFriendRequests'); const requests = requestsMap[key] || []; if (requests.some(request => request.toLowerCase() === currentUser.toLowerCase())) { ui.inviteMessage.textContent = 'ZAPROSZENIE JUŻ WYSŁANE'; return; } requests.push(currentUser); requestsMap[key] = requests; saveMap('arcanaFriendRequests', requestsMap); ui.inviteNick.value = ''; ui.inviteMessage.textContent = 'ZAPROSZENIE WYSŁANE'; }
function sendGroupInvite(nick) { connectMatchSocket(() => sendNetwork({ type: 'group-invite', targetNick: nick })); }
function acceptGroupInvite(accepted) { if (!pendingGroupInvite) return; sendNetwork({ type: accepted ? 'group-accept' : 'group-reject', groupId: pendingGroupInvite.groupId, from: pendingGroupInvite.from }); pendingGroupInvite = null; groupInviteUi.modal.classList.add('hidden'); }
function respondToFriendInvite(nick, accepted) { connectMatchSocket(() => sendNetwork({ type: 'friend-response', targetNick: nick, accepted })); }
function openWizard(id) { viewedWizard = id; const wizard = wizards[id]; const accounts = getAccounts(); const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...(accounts[currentUser.toLowerCase()]?.wizards || [])])); const hasWizard = wizard.cost === 0 || owned.includes(id); const wins = Number(getMap('arcanaWizardWins')[currentUser.toLowerCase()]?.[id] || 0); const remainingWins = Math.max(0, 500 - wins); const power = wizard.healAlly ? `Gadżet: STRZAŁY LECZĄ SOJUSZNIKÓW ${wizard.healAmount} HP, ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.abilityType === 'illusion' ? `Gadżet: NIEWIDZIALNOŚĆ ${wizard.invisibilityDuration} SEKUND, ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.abilityType ? `Gadżet: ${Math.round(wizard.abilityDamage * 100)}% HP, co ${wizard.abilityCooldown} s` : wizard.reflect ? `Gadżet: odbijanie pocisków, co ${wizard.abilityCooldown} s` : wizard.speed ? `Szybkość ruchu: ${wizard.speed}x` : wizard.maxClones ? `Moc: TWORZENIE KLONÓW, MAKSYMALNIE ${wizard.maxClones}` : wizard.heal ? `Moc: LECZENIE ${wizard.heal} HP, ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.ownerOnly ? 'Moc: NIEWIDZIALNOŚĆ + TARCZA 100%' : wizard.shield ? 'Moc: TARCZA, REDUKUJE OBRAŻENIA' : `Moc zaklęcia: ${wizard.damage}`;
 ui.wizardName.textContent = wizard.name; ui.wizardPower.textContent = `${power} | ${wizard.damage} OBRAŻEŃ | ${wizard.hp} HP | WYGRANE: ${wins} // DO TYTUŁU: ${remainingWins} | Cena: ${wizard.ownerOnly ? 'TYLKO WŁAŚCICIEL' : wizard.cost === 0 ? 'darmowy' : wizard.cost + ' monet'}`; ui.buy.textContent = hasWizard ? 'POSIADANY' : 'KUP'; ui.buy.disabled = hasWizard; ui.use.disabled = !hasWizard || id === selectedWizard; ui.detail.classList.remove('hidden'); }function closeWizard() { ui.detail.classList.add('hidden'); }
function removeWizard() { selectedWizard = 'apprentice'; localStorage.setItem('arcanaWizard', selectedWizard); const selected = getMap('arcanaSelectedWizards'); selected[currentUser.toLowerCase()] = selectedWizard; saveMap('arcanaSelectedWizards', selected); updateShop(); setToast('CZARODZIEJ ZDJĘTY'); }
function buyWizard(id) { const wizard = wizards[id]; const owned = getMap('arcanaOwned'); const accounts = getAccounts(); const playerOwned = Array.from(new Set([...(owned[currentUser.toLowerCase()] || []), ...(accounts[currentUser.toLowerCase()]?.wizards || [])])); if (wizard.ownerOnly && !isOwner() && !playerOwned.includes(id)) { setToast('WŁADCĘ MOŻE NADAĆ TYLKO TEST123'); return; } if (playerOwned.includes(id) || wizard.cost === 0) return; if (coins < wizard.cost) { setToast('NIE STAĆ CIĘ'); return; } coins -= wizard.cost; playerOwned.push(id); owned[currentUser.toLowerCase()] = playerOwned; accounts[currentUser.toLowerCase()].wizards = playerOwned; saveMap('arcanaOwned', owned); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); persistCoins(); setToast(`${wizard.name} KUPIONY // DODANO DO POSIADANYCH`); updateShop(); openWizard(id); }
function useWizard(id) { const wizard = wizards[id]; const accounts = getAccounts(); const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...(accounts[currentUser.toLowerCase()]?.wizards || [])])); if (wizard.cost > 0 && !owned.includes(id)) return; selectedWizard = id; localStorage.setItem('arcanaWizard', selectedWizard); const selected = getMap('arcanaSelectedWizards'); selected[currentUser.toLowerCase()] = id; saveMap('arcanaSelectedWizards', selected); updateShop(); openWizard(id); setToast(`${wizard.name} UŻYWANY`); }
const updatePreviewLoop = update;
update = function (dt) { if (mode === 'preview' && running) p2.stunTimer = Infinity; updatePreviewLoop(dt); if (mode === 'preview' && running) p2.stunTimer = Infinity; };
function updateUI() { const playerHp = Math.max(0, p1.hp / p1.maxHp * 100); const rivalHp = Math.max(0, p2.hp / p2.maxHp * 100); ui.score.textContent = String(score).padStart(6, '0'); ui.mana.textContent = Math.round(p1.mana); ui.manaMeter.style.width = `${p1.mana}%`; ui.ward.textContent = Math.round(playerHp); ui.wardMeter.style.width = `${playerHp}%`; ui.enemies.textContent = `${mode === 'player' ? 'MAGE 2' : 'BOT'} WARD ${Math.round(rivalHp)}%`; ui.radar.innerHTML = `<i class="radar-contact" style="left:${50 + (p2.x - p1.x) / W * 100}%;top:${50 + (p2.y - p1.y) / H * 100}%"></i>`; ui.ammo.innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="ammo ${i >= Math.floor(p1.mana / 16) ? 'empty' : ''}"></i>`).join(''); if (toastClock <= 0) ui.toast.classList.remove('show'); }
const updateUIWithPreviewBot = updateUI;
updateUI = function () { updateUIWithPreviewBot(); if (mode === 'preview') ui.enemies.textContent = `BOT // ${Math.max(0, Math.ceil(p2.hp))}/100 HP`; };
function draw() {
  const bg = ctx.createRadialGradient(W * .5, H * .45, 20, W * .5, H * .5, Math.max(W, H) * .7);
  bg.addColorStop(0, '#4a3164'); bg.addColorStop(.5, '#1d294b'); bg.addColorStop(1, '#0a1227');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  stars.forEach(star => { ctx.globalAlpha = star.a; ctx.fillStyle = '#f9ddb0'; ctx.fillRect(star.x, star.y, star.r, star.r); });
  ctx.globalAlpha = 1; ctx.save(); ctx.translate(W / 2, H * .62); ctx.strokeStyle = 'rgba(241,195,120,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, Math.min(W * .37, 450), Math.min(H * .16, 125), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  spells.forEach(spell => {
    if (spell.eagle) {
      drawEagleProjectile(spell);
      return;
    }
    ctx.save(); ctx.shadowColor = spell.color; ctx.shadowBlur = 18; ctx.fillStyle = spell.color; ctx.beginPath(); ctx.arc(spell.x, spell.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
  particles.forEach(particle => { ctx.globalAlpha = Math.max(0, particle.life * 1.8); ctx.fillStyle = particle.color; ctx.fillRect(particle.x, particle.y, particle.size, particle.size); });
  ctx.globalAlpha = 1;
  const playerLabel = currentUser || 'GRACZ 1'; const rivalLabel = mode === 'preview' || mode.startsWith('bot') ? 'BOT' : (opponentProfile.nick || 'GRACZ 2');
  drawMage(p1, playerLabel);
  cloneBodies.forEach(clone => drawMage({ ...p1, x: clone.x, y: clone.y }, `${playerLabel} // KLON`));
  if (remotePlayers.size) remotePlayers.forEach(player => { player.clones.forEach(clone => drawMage({ ...player, x: clone.x, y: clone.y }, `${player.nick} // KLON`)); drawMage(player, player.nick); });
  else { p2.clones.forEach(clone => drawMage({ ...p2, x: clone.x, y: clone.y }, `${rivalLabel} // KLON`)); drawMage(p2, rivalLabel); botPlayers.forEach(player => drawMage(player, player.nick)); }
}
function drawEagleProjectile(spell) {
  ctx.save();
  ctx.translate(spell.x, spell.y);
  ctx.rotate(Math.atan2(spell.vy, spell.vx));
  ctx.shadowColor = spell.color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = spell.color;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(3, -4);
  ctx.lineTo(-8, -13);
  ctx.lineTo(-5, -3);
  ctx.lineTo(-16, -7);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-16, 7);
  ctx.lineTo(-5, 3);
  ctx.lineTo(-8, 13);
  ctx.lineTo(3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function drawMage(m, label) {
  if (m.invisible) return;
  const sameTeam = onlineMatch ? m === p1 || m.teamId === teamId : m === p1 || m.teamId === 'player-team';
  const localSkin = mageSkins[getEquippedMageSkin()];
  const characterSkin = mageSkins[m === p1 ? getEquippedMageSkin() : (m.skinId || (m === p2 ? opponentProfile.skinId : ''))];
  const palette = characterSkin || localSkin;
  const appearance = palette
    ? {
        color: characterSkin ? palette.player : sameTeam ? palette.ally : palette.opponent,
        accent: characterSkin ? palette.playerAccent : sameTeam ? palette.allyAccent : palette.opponentAccent,
        hasSkin: true
      }
    : { color: m.color, accent: m.accent, hasSkin: false };
  ctx.save(); ctx.translate(m.x, m.y);
  const reflectTime = m === p1 ? p1.reflectShield : m === p2 ? p2.reflectShield : 0;
  const shieldTime = m === p1 ? p1.shield : 0;
  const hpRatio = Math.max(0, Math.min(1, (m.hp || 0) / (m.maxHp || 1)));
  const barWidth = 64;
  if (reflectTime > 0 || shieldTime > 0) {
    ctx.strokeStyle = reflectTime > 0 ? `rgba(255,190,86,${.5 + Math.sin(performance.now() / 120) * .18})` : `rgba(114,228,208,${.45 + Math.sin(performance.now() / 120) * .15})`;
    ctx.lineWidth = 4; ctx.shadowColor = reflectTime > 0 ? '#ffbe56' : '#72e4d0'; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(0, 0, 68, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(8, 15, 24, 0.65)'; ctx.fillRect(-barWidth / 2, -78, barWidth, 9);
  ctx.fillStyle = hpRatio > .6 ? '#6ce4b5' : hpRatio > .3 ? '#f6c76b' : '#ff7368'; ctx.fillRect(-barWidth / 2, -78, barWidth * hpRatio, 9);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.strokeRect(-barWidth / 2, -78, barWidth, 9);
  ctx.fillStyle = '#f4f7ff'; ctx.font = '700 9px Space Grotesk'; ctx.textAlign = 'center'; ctx.fillText(`${Math.max(0, Math.ceil(m.hp || 0))}/${Math.ceil(m.maxHp || 1)}`, 0, -87);
  ctx.shadowColor = appearance.color; ctx.shadowBlur = 16; ctx.fillStyle = appearance.color; ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(28, 4); ctx.lineTo(22, 34); ctx.lineTo(0, 48); ctx.lineTo(-22, 34); ctx.lineTo(-28, 4); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = appearance.hasSkin ? appearance.color : '#211934'; ctx.beginPath(); ctx.arc(0, -23, 15, 0, Math.PI * 2); ctx.fill();
  const hatId = m === p1 ? getEquippedHat() : (m.hatId || (m === p2 ? opponentProfile.hatId : ''));
  if (hats[hatId]) { ctx.fillStyle = hatId === 'strength-hat' ? '#ffcf67' : hatId === 'guard-hat' ? '#91d8ee' : '#d9d4f1'; ctx.beginPath(); ctx.moveTo(-20, -43); ctx.lineTo(-14, -58); ctx.lineTo(14, -58); ctx.lineTo(20, -43); ctx.closePath(); ctx.fill(); ctx.fillRect(-23, -44, 46, 5); }
  ctx.strokeStyle = appearance.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.face * 18, 13); ctx.lineTo(m.face * 42, -18); ctx.stroke();
  ctx.fillStyle = appearance.accent; ctx.font = '700 11px Space Grotesk'; ctx.textAlign = 'center'; ctx.fillText(label, 0, 67); ctx.restore();
}
function updateDeviceControls() { const wizard = wizards[selectedWizard]; document.getElementById('touchControls').classList.toggle('hidden', deviceMode !== 'mobile' || !running); chatUi.button.classList.toggle('hidden', !running); document.getElementById('touchCast').textContent = selectedWizard === 'hercules' ? 'PIĘŚĆ' : 'STRZAŁ'; document.getElementById('touchAbility').textContent = selectedWizard === 'illusionist' ? (p1.invisible ? 'ZAKOŃCZ E' : 'NIEWIDZIALNOŚĆ E') : 'GADŻET E'; const secondary = document.getElementById('touchSecondary'); secondary.classList.toggle('hidden', !wizard.secondaryAbilityType && !wizard.fullShield); secondary.textContent = wizard.secondaryAbilityType === 'teleport' ? 'TELEPORT Q' : wizard.secondaryAbilityType === 'eagle-heal' ? 'LECZ Q' : 'TARCZA Q'; }
function resetJoystick() { joystickX = 0; joystickY = 0; keys.KeyW = keys.KeyA = keys.KeyS = keys.KeyD = false; document.getElementById('joystickKnob').style.transform = 'translate(-50%, -50%)'; }
function moveJoystick(event) { const joystick = document.getElementById('joystick'); const rect = joystick.getBoundingClientRect(); const dx = event.clientX - (rect.left + rect.width / 2); const dy = event.clientY - (rect.top + rect.height / 2); const radius = rect.width * .34; const distance = Math.hypot(dx, dy); const scale = distance > radius ? radius / distance : 1; joystickX = dx * scale / radius; joystickY = dy * scale / radius; document.getElementById('joystickKnob').style.transform = `translate(calc(-50% + ${joystickX * radius}px), calc(-50% + ${joystickY * radius}px))`; keys.KeyA = joystickX < -.2; keys.KeyD = joystickX > .2; keys.KeyW = joystickY < -.2; keys.KeyS = joystickY > .2; }
function updateOrientationPrompt() { const portraitRequired = deviceMode === 'mobile' && matchMedia('(orientation: portrait) and (max-width: 1100px)').matches; const prompt = document.getElementById('rotatePrompt'); prompt.classList.toggle('show', portraitRequired); prompt.classList.toggle('landscape-required', portraitRequired); }
function chooseDevice(device) { deviceMode = device; localStorage.setItem('arcanaDevice', device); document.getElementById('deviceScreen').classList.add('hidden'); if (device === 'mobile') screen.orientation?.lock?.('landscape')?.catch?.(() => {}); updateOrientationPrompt(); updateDeviceControls(); }
addEventListener('orientationchange', updateOrientationPrompt);
addEventListener('resize', updateOrientationPrompt);
matchMedia('(orientation: portrait) and (max-width: 1100px)').addEventListener('change', updateOrientationPrompt);
screen.orientation?.addEventListener?.('change', updateOrientationPrompt);
function refreshPrimaryOpponent() { const opponents = [...remotePlayers.values()].filter(player => player.teamId !== teamId); if (!opponents.length) return; const nearest = opponents.reduce((best, player) => Math.hypot(player.x - p1.x, player.y - p1.y) < Math.hypot(best.x - p1.x, best.y - p1.y) ? player : best); Object.assign(p2, nearest); }
function handleNetworkMessageV2(message) {
  if (message.type === 'career-state') { applyCareerState(message); return; }
  if (message.type === 'friend-state') {
    const key = currentUser.toLowerCase();
    const friends = getMap('arcanaFriends');
    const requests = getMap('arcanaFriendRequests');
    friends[key] = Array.isArray(message.friends) ? message.friends : [];
    requests[key] = Array.isArray(message.requests) ? message.requests : [];
    saveMap('arcanaFriends', friends);
    saveMap('arcanaFriendRequests', requests);
    if (message.notice) ui.inviteMessage.textContent = message.notice;
    updateFriends();
    return;
  }
  if (message.type === 'friend-request-sent') {
    ui.inviteNick.value = '';
    ui.inviteMessage.textContent = `ZAPROSZENIE WYSŁANE DO ${message.targetNick}`;
    return;
  }
  if (message.type === 'social-error') {
    if (message.context === 'friend') ui.inviteMessage.textContent = message.message;
    else if (message.context === 'group') groupInviteUi.status.textContent = message.message;
    else if (message.context === 'trade') tradeUi.status.textContent = message.message;
    setToast(message.message);
    return;
  }
  if (message.type === 'profile-update') {
    const key = String(message.nick || '').toLowerCase();
    const player = remotePlayers.get(key);
    if (player) Object.assign(player, message.profile || {});
    if (opponentProfile.nick?.toLowerCase() === key) Object.assign(opponentProfile, message.profile || {});
    refreshPrimaryOpponent();
    return;
  }
  if (message.type === 'daily-box-reward') { applyDailyBoxReward(message.reward || {}); return; }
  if (message.type === 'leaf-gust') { if (message.teamId === teamId) return; const sourceX = (1 - message.x) * W; const sourceY = message.y * H; if (applyLeafGust(p1, sourceX, sourceY)) { burst(p1.x, p1.y, '#b7df78', 18); setToast('PODMUCH LIŚCI // OGŁUSZENIE'); } return; }
  if (message.type === 'chat') { showChatBubble(message.nick || 'GRACZ', message.text || ''); return; }
  if (message.type === 'trade-request') { pendingTradeNick = message.fromNick; tradeUi.requestText.textContent = `WYMIANA // ${message.fromNick}`; tradeUi.requestModal.classList.remove('hidden'); return; }
  if (message.type === 'trade-response') { if (message.accepted) openTrade(message.fromNick); else setToast('GRACZ ODRZUCIŁ WYMIANĘ'); return; }
  if (message.type === 'trade-offer') { if (tradeState.partner?.toLowerCase() !== message.fromNick?.toLowerCase()) return; tradeState.partnerItems = Array.isArray(message.offer?.items) ? message.offer.items : []; tradeState.partnerCoins = Math.max(0, Number(message.offer?.coins) || 0); if (message.changed) { tradeState.accepted = false; tradeUi.status.textContent = 'OFERTA ZAKTUALIZOWANA // ZAAKCEPTUJ PONOWNIE'; } renderTrade(); return; }
  if (message.type === 'trade-complete') { completeTrade(message); return; }
  if (message.type === 'hello') { sendNetwork({ type: 'career-get' }); return; }
  if (message.type === 'waiting') { ui.join.textContent = `CZEKANIE NA GRACZA // KOD ${message.code}`; return; }
  if (message.type === 'queue-waiting') { randomQueued = true; queueMatchType = message.matchType || queueMatchType; ui.join.textContent = `${String(queueMatchType).toUpperCase()} // CZEKANIE NA GRACZY`; return; }
  if (message.type === 'queue-cancelled') { randomQueued = false; if (!rankedFallback) ui.join.textContent = 'ANULOWANO KOLEJKĘ'; return; }
  if (message.type === 'queue-error' || message.type === 'group-error') { randomQueued = false; rankedGameActive = false; clearTimeout(rankedSearchTimer); setToast(message.message); return; }
  if (message.type === 'group-state') { groupId = message.groupId || ''; groupMembers = message.members || []; groupInviteUi.status.textContent = groupMembers.length > 1 ? `GRUPA: ${groupMembers.join(' + ')} // ${groupMembers.length}/3` : ''; updateFriends(); return; }
  if (message.type === 'group-invite') { pendingGroupInvite = message; groupInviteUi.text.textContent = `${message.from} ZAPRASZA CIĘ DO GRUPY`; groupInviteUi.modal.classList.remove('hidden'); return; }
  if (message.type === 'matched') {
    if (rankedFallback) { sendNetwork({ type: 'leave-room' }); return; }
    clearTimeout(rankedSearchTimer); rankedGameActive = message.ranked === true; randomQueued = false; randomQueueButton.textContent = 'LOSOWA GRA →'; onlineMatch = true; joined = true; teamId = message.teamId || `solo:${currentUser.toLowerCase()}`; opponentProfile = (message.opponents || [message.opponent].filter(Boolean))[0] || {}; matchRewardGranted = false; remotePlayers.clear();
    (message.players || []).filter(player => player.nick?.toLowerCase() !== currentUser.toLowerCase()).forEach(player => remotePlayers.set(player.nick.toLowerCase(), { ...player, x: W * .73, y: H * .59, hp: 100, maxHp: 100, mana: 100, clones: [], color: '#ef7693', accent: '#ffe0e9', face: -1, cooldown: 0 }));
    if (!remotePlayers.size && message.opponent?.nick) remotePlayers.set(message.opponent.nick.toLowerCase(), { ...message.opponent, teamId: 'opponent', x: W * .73, y: H * .59, hp: 100, maxHp: 100, mana: 100, clones: [], color: '#ef7693', accent: '#ffe0e9', face: -1, cooldown: 0 });
    refreshPrimaryOpponent(); mode = 'player'; ui.join.textContent = remotePlayers.size > 1 ? 'MECZ DRUŻYNOWY // 2 NA 2' : 'PRZECIWNIK ZNALEZIONY // START'; if (!running) startGame('player'); return;
  }
  if (message.type === 'state') {
    const key = String(message.nick || '').toLowerCase(); if (!key || key === currentUser.toLowerCase()) return;
    const sameTeam = message.teamId === teamId; const player = remotePlayers.get(key) || { color: sameTeam ? '#ffb04b' : '#ef7693', accent: sameTeam ? '#fff0bd' : '#ffe0e9', face: sameTeam ? 1 : -1 };
    player.nick = message.nick; player.teamId = message.teamId; player.x = (sameTeam ? message.x : 1 - message.x) * W; player.y = message.y * H; player.hp = message.hp; player.maxHp = message.maxHp || 100; player.mana = message.mana; player.invisible = message.invisible; player.damageReduction = message.damageReduction || 0; player.reflectShield = message.reflectShield || 0; player.clones = (message.clones || []).map(clone => ({ x: (sameTeam ? clone.x : 1 - clone.x) * W, y: clone.y * H, slot: clone.slot })); remotePlayers.set(key, player); refreshPrimaryOpponent(); return;
  }
  if (message.type === 'spell') {
    const incoming = message.spell; const owner = remotePlayers.get(String(message.ownerNick || '').toLowerCase()) || { ...p2, nick: message.ownerNick, teamId: message.teamId };
    if (p1.reflectShield > 0 && message.teamId !== teamId) { const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x); const reflected = { ...incoming, id: incoming.id, x: p1.x, y: p1.y, vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, owner: p1, teamId, ownerNick: currentUser }; spells.push(reflected); sendNetwork({ type: 'reflect', id: incoming.id, reflector: currentUser, spell: { ...reflected, x: reflected.x / W, y: reflected.y / H, vx: reflected.vx / W, vy: reflected.vy / H } }); return; }
    const sameTeam = message.teamId === teamId; spells.push({ ...incoming, x: (sameTeam ? incoming.x : 1 - incoming.x) * W, y: incoming.y * H, vx: (sameTeam ? incoming.vx : -incoming.vx) * W, vy: incoming.vy * H, owner, teamId: message.teamId }); return;
  }
  if (message.type === 'reflect') { spells.forEach(spell => { if (spell.id === message.id) spell.life = 0; }); const shot = message.spell; const owner = remotePlayers.get(String(message.reflector || '').toLowerCase()) || { ...p2, nick: message.reflector, teamId: 'opponent' }; spells.push({ ...shot, x: (1 - shot.x) * W, y: shot.y * H, vx: -shot.vx * W, vy: shot.vy * H, owner, teamId: owner.teamId }); return; }
  if (message.type === 'damage') { if (!message.targetNick || message.targetNick.toLowerCase() === currentUser.toLowerCase()) { p1.hp -= message.amount; p1.stunTimer = Math.max(p1.stunTimer || 0, Number(message.stunDuration) || 0); if (p1.hp <= 0) endGame('GRACZ 2'); } else { const target = remotePlayers.get(message.targetNick.toLowerCase()); if (target) { target.hp -= message.amount; target.stunTimer = Math.max(target.stunTimer || 0, Number(message.stunDuration) || 0); } } return; }
  if (message.type === 'round-ended') {
    const won = message.winnerTeamId ? message.winnerTeamId === teamId : message.winnerNick?.toLowerCase() === currentUser.toLowerCase();
    if (won && !matchRewardGranted && opponentProfile.dropEnabled && keychains[opponentProfile.dropCharm]) { grantKeychain(opponentProfile.dropCharm); matchRewardGranted = true; setToast(`ZDOBYWASZ BRELOCZEK: ${keychains[opponentProfile.dropCharm].name}`); }
    if (running) { if (won) { const reward = window.applyMoneyMultiplier ? window.applyMoneyMultiplier(100) : 100; coins += reward; persistCoins(); ui.result.textContent = 'WYGRAŁEŚ!'; ui.result.classList.remove('hidden', 'loss'); ui.result.classList.add('win'); setToast(`+${reward} MONET ZA ZWYCIĘSTWO`); } else { coins = Math.max(0, coins - 50); persistCoins(); ui.result.textContent = 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden', 'win'); ui.result.classList.add('loss'); } }
    gameStartToken += 1; ui.reveal.classList.add('hidden'); onlineMatch = false; joined = false; running = false; remotePlayers.clear(); ui.start.classList.remove('hidden'); ui.join.textContent = 'RUNDA ZAKOŃCZONA // DOŁĄCZ PONOWNIE'; updateDeviceControls(); if (matchSocket) sendNetwork({ type: 'leave-room' }); return;
  }
  if (message.type === 'opponent-left') { gameStartToken += 1; ui.reveal.classList.add('hidden'); onlineMatch = false; joined = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'PRZECIWNIK OPUŚCIŁ GRĘ'; updateDeviceControls(); setToast('PRZECIWNIK OPUŚCIŁ GRĘ'); }
}
function frame(t) { const dt = Math.min(.035, (t - last) / 1000 || 0); last = t; updateOrientationPrompt(); update(dt); draw(); requestAnimationFrame(frame); }
document.getElementById('deviceScreen').addEventListener('click', event => { const button = event.target.closest('[data-device]'); if (button) chooseDevice(button.dataset.device); });
const joystick = document.getElementById('joystick');
joystick.addEventListener('pointerdown', event => { joystickPointer = event.pointerId; joystick.setPointerCapture(event.pointerId); moveJoystick(event); });
joystick.addEventListener('pointermove', event => { if (event.pointerId === joystickPointer) moveJoystick(event); });
joystick.addEventListener('pointerup', event => { if (event.pointerId === joystickPointer) { joystickPointer = null; resetJoystick(); } });
joystick.addEventListener('pointercancel', resetJoystick);
document.getElementById('touchCast').addEventListener('pointerdown', event => { event.preventDefault(); keys.Space = true; cast(p1, p2, p1.color); });
document.getElementById('touchCast').addEventListener('pointerup', () => { keys.Space = false; });
document.getElementById('touchCast').addEventListener('pointercancel', () => { keys.Space = false; });
document.getElementById('touchAbility').addEventListener('pointerdown', event => { event.preventDefault(); useAbility(); });
document.getElementById('touchSecondary').addEventListener('pointerdown', event => { event.preventDefault(); useSecondaryAbility(); });
addEventListener('keydown', event => {
  if (event.code !== 'KeyQ' || event.repeat) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  useSecondaryAbility();
}, true);
profileUi.button.addEventListener('click', openProfile);
profileUi.close.addEventListener('click', () => profileUi.modal.classList.add('hidden'));
document.getElementById('openRankingsButton').addEventListener('click', () => window.openRanking());
profileUi.clear.addEventListener('click', () => profileUi.editor.getContext('2d').clearRect(0, 0, profileUi.editor.width, profileUi.editor.height));
profileUi.save.addEventListener('click', saveAvatar);
profileUi.dropEnabled.addEventListener('change', () => { const map = getMap('arcanaDropEnabled'); map[currentUser.toLowerCase()] = profileUi.dropEnabled.checked; saveMap('arcanaDropEnabled', map); syncProfileToServer(); });
profileUi.showNick.addEventListener('click', () => profileUi.nickForm.classList.toggle('hidden'));
profileUi.showPassword.addEventListener('click', () => profileUi.passwordForm.classList.toggle('hidden'));
profileUi.nickForm.addEventListener('submit', changeAccountNick);
profileUi.passwordForm.addEventListener('submit', changeAccountPassword);
profileUi.title.addEventListener('change', () => { const map = getMap('arcanaSelectedTitle'); map[currentUser.toLowerCase()] = profileUi.title.value; saveMap('arcanaSelectedTitle', map); syncProfileToServer(); });
profileUi.dropCharm.addEventListener('change', () => { const map = getMap('arcanaDropCharm'); map[currentUser.toLowerCase()] = profileUi.dropCharm.value; saveMap('arcanaDropCharm', map); syncProfileToServer(); });
profileUi.editor.addEventListener('pointerdown', event => { avatarDrawing = true; profileUi.editor.setPointerCapture(event.pointerId); const rect = profileUi.editor.getBoundingClientRect(); const context = profileUi.editor.getContext('2d'); context.beginPath(); context.moveTo((event.clientX - rect.left) * profileUi.editor.width / rect.width, (event.clientY - rect.top) * profileUi.editor.height / rect.height); });
profileUi.editor.addEventListener('pointermove', event => { if (!avatarDrawing) return; const rect = profileUi.editor.getBoundingClientRect(); const context = profileUi.editor.getContext('2d'); context.strokeStyle = '#73e1dd'; context.lineWidth = 12; context.lineCap = 'round'; context.lineJoin = 'round'; context.lineTo((event.clientX - rect.left) * profileUi.editor.width / rect.width, (event.clientY - rect.top) * profileUi.editor.height / rect.height); context.stroke(); });
profileUi.editor.addEventListener('pointerup', () => { avatarDrawing = false; });
profileUi.editor.addEventListener('pointercancel', () => { avatarDrawing = false; });
ui.friendsList.addEventListener('click', event => { const button = event.target.closest('[data-group-invite]'); if (button) sendGroupInvite(decodeURIComponent(button.dataset.groupInvite)); });
groupInviteUi.accept.addEventListener('click', () => acceptGroupInvite(true));
groupInviteUi.reject.addEventListener('click', () => acceptGroupInvite(false));
modeSelectButton.addEventListener('click', () => { const expanded = modeSelectButton.getAttribute('aria-expanded') === 'true'; modeSelectButton.setAttribute('aria-expanded', String(!expanded)); modeOptions.classList.toggle('hidden', expanded); });
modeOptions.addEventListener('click', event => { const option = event.target.closest('[data-game-mode]'); if (!option) return; selectedGameMode = option.dataset.gameMode; modeOptions.querySelectorAll('[data-game-mode]').forEach(button => button.classList.toggle('selected', button === option)); modeSelectButton.textContent = `TRYB GRY: ${option.textContent}`; modeSelectButton.setAttribute('aria-expanded', 'false'); modeOptions.classList.add('hidden'); });
playButton.addEventListener('click', () => { if (selectedGameMode === 'ranked') { startRankedQueue(); return; } rankedFallback = false; rankedGameActive = false; clearTimeout(rankedSearchTimer); if (selectedGameMode === 'player') { startCodeMatch(); return; } leaveMatchConnection(); startGame(selectedGameMode); });
newsUi.close.addEventListener('click', () => toggleNews(false));
newsUi.music.addEventListener('click', toggleMusic);
chatUi.button.addEventListener('click', () => chatUi.modal.classList.remove('hidden'));
chatUi.close.addEventListener('click', () => chatUi.modal.classList.add('hidden'));
chatUi.form.addEventListener('submit', event => { event.preventDefault(); sendChat(chatUi.input.value); });
chatUi.modal.addEventListener('click', event => { const suggestion = event.target.closest('[data-chat]'); if (suggestion) sendChat(suggestion.dataset.chat); });
tradeUi.accept.addEventListener('click', () => { if (!pendingTradeNick) return; sendNetwork({ type: 'trade-response', targetNick: pendingTradeNick, accepted: true }); tradeUi.requestModal.classList.add('hidden'); openTrade(pendingTradeNick); });
tradeUi.reject.addEventListener('click', () => { if (pendingTradeNick) sendNetwork({ type: 'trade-response', targetNick: pendingTradeNick, accepted: false }); pendingTradeNick = ''; tradeUi.requestModal.classList.add('hidden'); });
tradeUi.close.addEventListener('click', () => tradeUi.modal.classList.add('hidden'));
tradeUi.cancel.addEventListener('click', () => { tradeUi.modal.classList.add('hidden'); tradeState = { partner: '', ownItems: [], partnerItems: [], ownCoins: 0, partnerCoins: 0, accepted: false }; });
tradeUi.confirm.addEventListener('click', commitTrade);
tradeUi.ownItems.addEventListener('click', event => { const item = event.target.closest('[data-trade-item]'); if (!item || tradeState.accepted) return; const id = item.dataset.tradeItem; tradeState.ownItems = tradeState.ownItems.includes(id) ? tradeState.ownItems.filter(value => value !== id) : [...tradeState.ownItems, id]; renderTrade(); sendTradeOffer(); });
tradeUi.ownCoins.addEventListener('input', () => { if (tradeState.accepted) return; tradeState.ownCoins = Math.max(0, Number(tradeUi.ownCoins.value) || 0); sendTradeOffer(); });
ui.friendsList.addEventListener('click', event => { const button = event.target.closest('[data-trade]'); if (button) sendTradeRequest(decodeURIComponent(button.dataset.trade)); });
accountUi.list.addEventListener('click', event => { const target = event.target.closest('[data-account-view]'); if (target) showAccountDetails(decodeURIComponent(target.dataset.accountView)); });
accountUi.delete.addEventListener('click', requestAccountDelete);
accountUi.confirmNo.addEventListener('click', () => accountUi.confirm.classList.add('hidden'));
accountUi.confirmYes.addEventListener('click', deleteAccountConfirmed);
keychainCollection.addEventListener('click', event => { const equip = event.target.closest('[data-equip]'); const combine = event.target.closest('[data-combine]'); if (equip) toggleKeychain(equip.dataset.equip); if (combine) combineKeychain(combine.dataset.combine); });
document.getElementById('hatCollection').addEventListener('click', event => { const equip = event.target.closest('[data-hat-equip]'); const combine = event.target.closest('[data-hat-combine]'); if (equip) equipHat(equip.dataset.hatEquip); if (combine) combineHat(combine.dataset.hatCombine); });
ownerUi.takeCoins.addEventListener('click', takeCoins);
ownerUi.resetAccount.addEventListener('click', resetAccount);
ownerUi.password.addEventListener('input', () => { ownerPasswordVerified = false; verifiedOwnerPassword = ''; ownerUi.grantOctober.classList.add('hidden'); });
ownerUi.verifyPassword.addEventListener('click', verifyOwnerPassword);
ownerUi.grantOctober.addEventListener('click', grantOctoberWizard);
ownerUi.resetRanking.addEventListener('click', resetRankedLadder);
addEventListener('resize', resize); addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); if (e.code === 'KeyE') useAbility(); if (e.code === 'KeyQ') useShield(); if (e.code === 'Enter') { joinPlayer(); if (!running && joined && mode === 'player') startGame('player'); } if (e.code === 'KeyR' && running) startGame(mode); }); addEventListener('keyup', e => { keys[e.code] = false; }); ui.shopButton.addEventListener('click', () => { ownedOnly = false; ui.shop.classList.remove('hidden'); closeWizard(); updateShop(); }); ui.ownedButton.addEventListener('click', () => { ownedOnly = true; ui.shop.classList.remove('hidden'); closeWizard(); updateShop(); }); ui.shopClose.addEventListener('click', () => { ownedOnly = false; ui.shop.classList.add('hidden'); }); ui.shop.querySelectorAll('.wizard-card').forEach(card => card.addEventListener('click', () => openWizard(card.dataset.wizard))); document.getElementById('exitButton').addEventListener('click', closeWizard); ui.buy.addEventListener('click', () => buyWizard(viewedWizard)); ui.use.addEventListener('click', () => useWizard(viewedWizard)); resize(); reset(); updateShop(); requestAnimationFrame(frame);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushProgressSync();
});
auth.registerTab.addEventListener('click', () => showAuthForm('register')); auth.loginTab.addEventListener('click', () => showAuthForm('login')); auth.registerForm.addEventListener('submit', registerAccount); auth.loginForm.addEventListener('submit', loginAccount); ui.logout.addEventListener('click', logoutAccount); ownerUi.toggle.addEventListener('click', () => toggleOwnerPanel()); ownerUi.addAdmin.addEventListener('click', addAdmin); ownerUi.ban.addEventListener('click', () => changeBan(true)); ownerUi.unban.addEventListener('click', () => changeBan(false)); ownerUi.giveCoins.addEventListener('click', giveCoins); ownerUi.giveWizard.addEventListener('click', giveWizard); ui.friendsButton.addEventListener('click', () => { setFriendsTab('friends'); ui.friendsModal.classList.remove('hidden'); ui.inviteMessage.textContent = ''; updateFriends(); }); ui.friendsTab.addEventListener('click', () => setFriendsTab('friends')); ui.requestsTab.addEventListener('click', () => setFriendsTab('requests')); ui.suggestionsTab.addEventListener('click', () => setFriendsTab('suggestions')); ui.friendsClose.addEventListener('click', () => ui.friendsModal.classList.add('hidden')); ui.sendInvite.addEventListener('click', sendFriendInvite); ui.suggestionsList.addEventListener('click', event => { const accept = event.target.closest('[data-accept]'); const reject = event.target.closest('[data-reject]'); if (accept) respondToFriendInvite(decodeURIComponent(accept.dataset.accept), true); if (reject) respondToFriendInvite(decodeURIComponent(reject.dataset.reject), false); }); addEventListener('beforeunload', applyInactivePenalty); addEventListener('pagehide', event => { if (!event.persisted) applyInactivePenalty(); }); ensureOwnerAccount(); showAuthForm('register');
// === ARCANNA GLOBAL PATCH: OWNER, FRIENDS, TRADE ===
// Ten blok możesz wkleić pod całym game.js. Nadpisuje stare funkcje.

(function () {
  // Bezpieczne sprawdzenie, czy mamy fetch i WebSocket
  const hasFetch = typeof fetch === 'function';

  // -------- OWNER PANEL (globalne konta) --------

  if (typeof verifyOwnerPassword === 'function') {
    const originalVerifyOwnerPassword = verifyOwnerPassword;

    verifyOwnerPassword = function () {
      if (!hasFetch || !window.ownerUi || !window.currentUser) {
        return originalVerifyOwnerPassword();
      }

      const nick = currentUser;
      const password = ownerUi.password.value.trim();

      fetch('/api/owner/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerNick: nick, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          window.ownerPasswordVerified = true;
          window.verifiedOwnerPassword = password;
          updateRestrictedOwnerTools();
          ownerUi.message.textContent = 'HASŁO POPRAWNE';
        } else {
          ownerUi.message.textContent = 'BŁĘDNE HASŁO';
        }
      })
      .catch(() => ownerUi.message.textContent = 'BŁĄD SERWERA');
    };
  }

  if (typeof grantOctoberWizard === 'function') {
    const originalGrantOctoberWizard = grantOctoberWizard;

    grantOctoberWizard = function () {
      if (!hasFetch || !window.ownerUi || !window.currentUser) {
        return originalGrantOctoberWizard();
      }

      if (!window.ownerPasswordVerified || !window.verifiedOwnerPassword) {
        ownerUi.message.textContent = 'NAJPIERW ZWERYFIKUJ HASŁO';
        return;
      }

      if (!canUseRestrictedOwnerTools()) {
        ownerUi.message.textContent = 'TA OPERACJA JEST NIEDOSTĘPNA DLA TEGO WŁAŚCICIELA';
        return;
      }

      const targetNick = ownerUi.target.value.trim();

      fetch('/api/owner/grant-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerNick: currentUser,
          password: verifiedOwnerPassword,
          targetNick
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.account) {
          ownerUi.message.textContent = `DODANO CZARODZIEJA DLA: ${data.account.nick}`;
        } else {
          ownerUi.message.textContent = data.error || 'BŁĄD';
        }
      })
      .catch(() => ownerUi.message.textContent = 'BŁĄD SERWERA');
    };
  }

  // -------- FRIENDS (globalne konta) --------

  if (typeof sendFriendInvite === 'function') {
    const originalSendFriendInvite = sendFriendInvite;

    sendFriendInvite = function () {
      if (!hasFetch || !window.ui || !window.connectMatchSocket || !window.sendNetwork) {
        return originalSendFriendInvite();
      }

      const nick = ui.inviteNick.value.trim();
      ui.inviteMessage.textContent = '';

      if (!nick) {
        ui.inviteMessage.textContent = 'PODAJ NICK GRACZA';
        return;
      }
      if (nick.toLowerCase() === currentUser.toLowerCase()) {
        ui.inviteMessage.textContent = 'NIE MOŻESZ DODAĆ SIEBIE DO ZNAJOMYCH';
        return;
      }

      ui.inviteMessage.textContent = 'SPRAWDZANIE KONTA...';
      connectMatchSocket(() => {
        sendNetwork({ type: 'friend-request', targetNick: nick });
      });
    };
  }

  // -------- TRADE (globalne konta) --------

  if (typeof sendTradeRequest === 'function') {
    const originalSendTradeRequest = sendTradeRequest;

    sendTradeRequest = function (nick) {
      if (!window.connectMatchSocket || !window.sendNetwork) {
        return originalSendTradeRequest(nick);
      }

      const targetNick = String(nick || '').trim();
      if (!targetNick) return;

      connectMatchSocket(() => {
        sendNetwork({ type: 'trade-request', targetNick });
      });

      if (typeof setToast === 'function') {
        setToast('PROŚBA O WYMIANĘ WYSŁANA');
      }
    };
  }

  if (typeof openTrade === 'function') {
    const originalOpenTrade = openTrade;

    openTrade = function (partner) {
      if (!window.tradeUi) {
        return originalOpenTrade(partner);
      }

      window.tradeState = {
        partner,
        ownItems: [],
        partnerItems: [],
        ownCoins: 0,
        partnerCoins: 0,
        accepted: false
      };

      tradeUi.partnerName.textContent = `GRACZ: ${partner}`;
      tradeUi.status.textContent = '';
      if (typeof renderTrade === 'function') renderTrade();
      tradeUi.modal.classList.remove('hidden');

      if (typeof sendTradeOffer === 'function') {
        sendTradeOffer();
      }
    };
  }

})();
// === AUTO-HIDE LOGOUT MESSAGE (5 SECONDS) ===
// Wklej ten blok NA SAM DÓŁ game.js

(function () {

  // Jeśli gra używa setToast() do wyświetlania komunikatów,
  // to nadpisujemy ją tak, aby komunikat znikał po 5 sekundach.

  if (typeof setToast === 'function') {
    const originalSetToast = setToast;

    setToast = function (text) {
      // wyświetlamy komunikat normalnie
      originalSetToast(text);

      // jeśli istnieje element toastEl, ustawiamy timer
      if (window.toastEl) {
        clearTimeout(window._toastTimer);

        window._toastTimer = setTimeout(() => {
          toastEl.classList.remove('show');
        }, 5000); // 5 sekund
      }
    };
  }

})();
// === ARCANNA MOBILE PATCH: BLOCK SCROLL IN GAME, ALLOW IN LOBBY ===
// Wklej ten blok NA SAMYM DOLE game.js

(function () {

  // Funkcja blokująca przewijanie ekranu
  function blockScroll() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
  }

  // Funkcja odblokowująca przewijanie ekranu
  function allowScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  // Nasłuch na zmiany ekranu gry
  const observer = new MutationObserver(() => {
    const inLobby =
      document.querySelector('.start-screen') &&
      !document.querySelector('.start-screen').classList.contains('hidden');

    const inGame =
      document.querySelector('.game-shell') &&
      !document.querySelector('.start-screen')?.classList.contains('hidden');

    // Jeśli jesteś w lobby → można przewijać
    if (inLobby) {
      allowScroll();
    }

    // Jeśli jesteś w grze → blokujemy przewijanie
    if (!inLobby) {
      blockScroll();
    }
  });

  // Obserwujemy cały dokument
  observer.observe(document.body, { childList: true, subtree: true });

  // Dodatkowe zabezpieczenie — blokada scrolla podczas gry
  window.addEventListener('touchmove', function (e) {
    const inLobby =
      document.querySelector('.start-screen') &&
      !document.querySelector('.start-screen').classList.contains('hidden');

    if (!inLobby) {
      e.preventDefault();
    }
  }, { passive: false });

})();

// === RANKINGI ===
(function () {
  const rankingModal = document.createElement('section');
  rankingModal.id = 'rankingModal';
  rankingModal.className = 'ranking-modal hidden';
  rankingModal.setAttribute('role', 'dialog');
  rankingModal.setAttribute('aria-modal', 'true');
  rankingModal.setAttribute('aria-labelledby', 'rankingTitle');
  rankingModal.innerHTML = `
    <div class="ranking-window">
      <div class="ranking-heading">
        <div>
          <div class="eyebrow">ARCANE COUNCIL / TOP GRACZY</div>
          <h2 id="rankingTitle">TOP 10 RANKED</h2>
        </div>
        <button id="rankingCloseTop" class="shop-close" type="button" aria-label="Zamknij ranking">X</button>
      </div>
      <div id="rankingList" class="ranking-list" aria-live="polite"></div>
      <div class="ranking-actions">
        <button type="button" data-ranking-mode="ranked" class="active">TOP 10 RANKED</button>
        <button type="button" data-ranking-mode="kills">TOP 20 KILLE</button>
        <button type="button" data-ranking-mode="wins">TOP 10 WYGRANE</button>
        <button id="rankingClose" type="button">ZAMKNIJ</button>
      </div>
    </div>
  `;
  document.body.appendChild(rankingModal);

  const rankingTitle = rankingModal.querySelector('#rankingTitle');
  const rankingList = rankingModal.querySelector('#rankingList');
  const rankingActions = rankingModal.querySelector('.ranking-actions');
  const modeTitles = { ranked: 'TOP 10 RANKED', kills: 'TOP 20 KILLE', wins: 'TOP 10 WYGRANE' };

  function fetchRanking(mode) {
    rankingTitle.textContent = modeTitles[mode];
    rankingList.innerHTML = '<div class="ranking-empty">ŁADOWANIE RANKINGU...</div>';
    fetch(`/api/ranking/${mode}`)
      .then(response => {
        if (!response.ok) throw new Error('Nie udało się pobrać rankingu.');
        return response.json();
      })
      .then(players => {
        rankingList.replaceChildren();
        if (!Array.isArray(players) || players.length === 0) {
          rankingList.innerHTML = '<div class="ranking-empty">BRAK DANYCH</div>';
          return;
        }
        players.forEach((player, index) => {
          const row = document.createElement('div');
          row.className = 'ranking-row';
          const place = document.createElement('strong');
          place.className = 'ranking-place';
          place.textContent = String(index + 1).padStart(2, '0');
          const nick = document.createElement('span');
          nick.className = 'ranking-nick';
          nick.textContent = player.nick || 'GRACZ';
          const value = document.createElement('strong');
          value.className = 'ranking-value';
          value.textContent = mode === 'ranked' ? `${Number(player.rankPoints) || 0} RP` : mode === 'kills' ? `${Number(player.kills) || 0} KILLI` : `${Number(player.wins) || 0} WYGRANYCH`;
          row.append(place, nick, value);
          rankingList.appendChild(row);
        });
      })
      .catch(() => {
        rankingList.innerHTML = '<div class="ranking-empty">NIE UDAŁO SIĘ ZAŁADOWAĆ RANKINGU</div>';
      });
  }

  function closeRanking() {
    rankingModal.classList.add('hidden');
  }

  rankingActions.addEventListener('click', event => {
    const button = event.target.closest('[data-ranking-mode]');
    if (button) {
      rankingActions.querySelectorAll('[data-ranking-mode]').forEach(item => item.classList.toggle('active', item === button));
      fetchRanking(button.dataset.rankingMode);
    }
    if (event.target.closest('#rankingClose')) closeRanking();
  });
  rankingModal.querySelector('#rankingCloseTop').addEventListener('click', closeRanking);
  rankingModal.addEventListener('click', event => {
    if (event.target === rankingModal) closeRanking();
  });

  window.openRanking = function () {
    profileUi.modal.classList.add('hidden');
    rankingModal.classList.remove('hidden');
    fetchRanking('ranked');
  };
})();
// === ARCANNA SHOP MODULE: POSTACIE / BRELOCZKI / KAPELUSZE / SKINY ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Znajdujemy okno sklepu
  const shopWindow = document.querySelector('.shop-window');
  if (!shopWindow) return;

  // Tworzymy zakładki u góry sklepu
  const tabs = document.createElement('div');
  tabs.className = 'mode-buttons';
  tabs.style.marginBottom = '14px';

  tabs.innerHTML = `
    <button data-shop="characters" class="active">POSTACIE</button>
    <button data-shop="keychains">BRELOCZKI</button>
    <button data-shop="hats">KAPELUSZE</button>
    <button data-shop="skins">SKINY</button>
    <button data-shop="passes">KARNETY</button>
  `;

  // Wstawiamy zakładki na górę sklepu
  shopWindow.insertBefore(tabs, shopWindow.firstChild);

  // Tworzymy kontenery na zawartość
  const charactersSection = document.createElement('div');
  const keychainsSection = document.createElement('div');
  const hatsSection = document.createElement('div');
  const skinsSection = document.createElement('div');
  const passesSection = document.createElement('div');

  charactersSection.id = 'shopCharacters';
  keychainsSection.id = 'shopKeychains';
  hatsSection.id = 'shopHats';
  skinsSection.id = 'shopSkins';
  passesSection.id = 'shopPasses';

  const wizardOffers = shopWindow.querySelector('.wizard-offers');
  const wizardDetail = shopWindow.querySelector('.wizard-detail');
  const passShop = shopWindow.querySelector('.pass-shop');
  const ownedEmpty = document.createElement('p');
  ownedEmpty.className = 'shop-owned-empty hidden';
  ownedEmpty.textContent = 'BRAK POSIADANYCH PRZEDMIOTÓW W TEJ KATEGORII';
  charactersSection.append(wizardOffers, wizardDetail);
  keychainsSection.innerHTML = `<button type="button" class="shop-chest-button" data-chest="keychains">OTWÓRZ SKRZYNIĘ Z BRELOCZKAMI</button><div class="keychain-collection"></div><div class="shop-chest-result" id="shopKeychainChestResult"></div>`;
  hatsSection.innerHTML = `<button type="button" class="shop-chest-button" data-chest="hats">OTWÓRZ SKRZYNIĘ Z KAPELUSZAMI</button><div class="hat-collection"></div><div class="shop-chest-result" id="shopHatChestResult"></div>`;
  skinsSection.innerHTML = `<section class="skin-shop" aria-labelledby="skinShopTitle"><div class="eyebrow">ARCANE MARKET / SKINY</div><h4 id="skinShopTitle">SKINY CZARODZIEJÓW</h4><p class="skin-shop-note">Kupuj skiny za monety bez wymaganej rangi. Możesz założyć dowolny posiadany skin.</p><div id="skinOffers" class="skin-offers"></div><p id="skinShopEmpty" class="shop-owned-empty hidden">BRAK POSIADANYCH SKINÓW</p><p id="skinShopStatus" class="pass-shop-status" role="status"></p></section>`;
  keychainsSection.appendChild(ownedEmpty.cloneNode(true));
  hatsSection.appendChild(ownedEmpty.cloneNode(true));
  passesSection.append(passShop);

  // Dodajemy sekcje do sklepu
  shopWindow.appendChild(charactersSection);
  shopWindow.appendChild(keychainsSection);
  shopWindow.appendChild(hatsSection);
  shopWindow.appendChild(skinsSection);
  shopWindow.appendChild(passesSection);

  // Domyślnie widoczna sekcja POSTACIE
  keychainsSection.style.display = 'none';
  hatsSection.style.display = 'none';
  skinsSection.style.display = 'none';
  passesSection.style.display = 'none';

  // Obsługa przełączania zakładek
  tabs.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;

    tabs.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const mode = e.target.dataset.shop;
    const sections = { characters: charactersSection, keychains: keychainsSection, hats: hatsSection, skins: skinsSection, passes: passesSection };
    Object.entries(sections).forEach(([name, section]) => { section.style.display = name === mode ? 'block' : 'none'; });
    if (mode === 'skins') window.refreshSkinShop?.();
    if (mode === 'passes') window.updatePassShop?.();
  });
  skinsSection.addEventListener('click', event => {
    const button = event.target.closest('[data-skin-action]');
    if (!button) return;
    window.handleMageSkinAction?.(button.dataset.skinAction, button.dataset.skinId);
  });
  window.refreshShopCollections = function () {
    const shopKeychains = keychainsSection.querySelector('.keychain-collection');
    const shopHats = hatsSection.querySelector('.hat-collection');
    shopKeychains.innerHTML = keychainCollection.innerHTML;
    shopHats.innerHTML = document.getElementById('hatCollection').innerHTML;
    const hasKeychains = shopKeychains.querySelector('.keychain-card') !== null;
    const hasHats = shopHats.querySelector('.keychain-card') !== null;
    keychainsSection.querySelector('.shop-chest-button').classList.toggle('hidden', ownedOnly);
    hatsSection.querySelector('.shop-chest-button').classList.toggle('hidden', ownedOnly);
    shopKeychains.classList.toggle('hidden', ownedOnly && !hasKeychains);
    shopHats.classList.toggle('hidden', ownedOnly && !hasHats);
    keychainsSection.querySelector('.shop-owned-empty').classList.toggle('hidden', !ownedOnly || hasKeychains);
    hatsSection.querySelector('.shop-owned-empty').classList.toggle('hidden', !ownedOnly || hasHats);
    keychainsSection.querySelector('.shop-chest-result').classList.toggle('hidden', ownedOnly);
    hatsSection.querySelector('.shop-chest-result').classList.toggle('hidden', ownedOnly);
  };
  const updateBackpackAndShop = updateBackpack;
  updateBackpack = function () { updateBackpackAndShop(); window.refreshShopCollections(); };
  window.refreshShopCollections();
  [keychainsSection, hatsSection].forEach(section => section.addEventListener('click', event => {
    const equip = event.target.closest('[data-equip]');
    const combine = event.target.closest('[data-combine]');
    const hatEquip = event.target.closest('[data-hat-equip]');
    const hatCombine = event.target.closest('[data-hat-combine]');
    if (equip) toggleKeychain(equip.dataset.equip);
    if (combine) combineKeychain(combine.dataset.combine);
    if (hatEquip) equipHat(hatEquip.dataset.hatEquip);
    if (hatCombine) combineHat(hatCombine.dataset.hatCombine);
  }));

  // Automatyczne ładowanie danych postaci
  window.loadShopCharacters = function (data) {
    const container = charactersSection.querySelector('.wizard-offers');
    container.innerHTML = '';

    data.forEach(w => {
      const card = document.createElement('button');
      card.className = 'wizard-card';
      card.innerHTML = `
        <b>${w.name}</b>
        <span>${w.desc}</span>
      `;
      container.appendChild(card);
    });
  };

  // Automatyczne ładowanie breloczków
  window.loadShopKeychains = function (data) {
    const container = keychainsSection.querySelector('.keychain-collection');
    container.innerHTML = '';

    data.forEach(k => {
      const card = document.createElement('div');
      card.className = 'keychain-card';
      card.innerHTML = `
        <b>${k.name}</b>
        <span>${k.desc}</span>
      `;
      container.appendChild(card);
    });
  };

})();
// === ARCANNA MESSAGE MODULE: VISIBLE TO ENEMY + FLOATING WITH PLAYER ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Kontener na wiadomości w grze
  let messageLayer = document.getElementById('messageLayer');
  if (!messageLayer) {
    messageLayer = document.createElement('div');
    messageLayer.id = 'messageLayer';
    messageLayer.style.position = 'absolute';
    messageLayer.style.left = '0';
    messageLayer.style.top = '0';
    messageLayer.style.width = '100%';
    messageLayer.style.height = '100%';
    messageLayer.style.pointerEvents = 'none';
    messageLayer.style.zIndex = '50';
    document.body.appendChild(messageLayer);
  }

  // Tworzenie dymku wiadomości
  function createMessageBubble(nick, text) {
    const bubble = document.createElement('div');
    bubble.className = 'msgBubble';
    bubble.style.position = 'absolute';
    bubble.style.padding = '6px 10px';
    bubble.style.background = 'rgba(0,0,0,0.65)';
    bubble.style.color = '#fff';
    bubble.style.borderRadius = '8px';
    bubble.style.fontSize = '12px';
    bubble.style.pointerEvents = 'none';
    bubble.style.transition = 'opacity 0.4s ease';
    bubble.style.opacity = '1';
    bubble.innerHTML = `<strong>${nick}:</strong> ${text}`;

    messageLayer.appendChild(bubble);

    // Usuwanie po 4 sekundach
    setTimeout(() => {
      bubble.style.opacity = '0';
      setTimeout(() => bubble.remove(), 400);
    }, 4000);

    return bubble;
  }

  // Aktualizacja pozycji dymków
  function updateMessagePositions(players) {
    const bubbles = document.querySelectorAll('.msgBubble');

    bubbles.forEach(bubble => {
      const nick = bubble.dataset.nick;
      const player = players[nick];

      if (!player) return;

      const x = player.x;
      const y = player.y - 40; // nad głową

      bubble.style.left = x + 'px';
      bubble.style.top = y + 'px';
    });
  }

  // Nasłuch wiadomości z serwera
  if (typeof connectMatchSocket === 'function') {
    const originalConnect = connectMatchSocket;

    connectMatchSocket = function (cb) {
      originalConnect(() => {
        // odbieranie wiadomości
        matchSocket.onmessage = (msg) => {
          const data = JSON.parse(msg.data);

          if (data.type === 'chat') {
            const bubble = createMessageBubble(data.nick, data.text);
            bubble.dataset.nick = data.nick;
          }

          if (cb) cb(data);
        };
      });
    };
  }

  // Wysyłanie wiadomości
  window.sendGameMessage = function (text) {
    if (!window.matchSocket) return;

    sendNetwork({
      type: 'chat',
      text,
      nick: currentUser
    });

    const bubble = createMessageBubble(currentUser, text);
    bubble.dataset.nick = currentUser;
  };

  // Aktualizacja pozycji dymków co klatkę
  setInterval(() => {
    if (window.players) {
      updateMessagePositions(window.players);
    }
  }, 50);

})();
// === ARCANNA ANTI-CHEAT MODULE ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Konto odporne na anty-cheat
  const immuneAccount = "adam";

  // Maksymalna dozwolona prędkość (15% więcej niż normalna)
  const BASE_SPEED = 4.0; 
  const MAX_SPEED = BASE_SPEED * 1.15;

  // Funkcja wysyłająca bana
  function banPlayer(nick, reason) {
    if (nick === immuneAccount) return; // adam jest odporny

    sendNetwork({
      type: "ban",
      nick,
      reason
    });

    console.warn("ANTYCHEAT: Zbanowano gracza:", nick, "Powód:", reason);
  }

  // Sprawdzanie prędkości gracza
  function checkSpeedCheat(players) {
    Object.values(players).forEach(p => {
      if (!p || !p.nick) return;
      if (p.nick === immuneAccount) return;

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

      if (speed > MAX_SPEED) {
        banPlayer(p.nick, "Prędkość większa niż 15%");
      }
    });
  }

  // Sprawdzanie nieskończonej amunicji
  function checkAmmoCheat(players) {
    Object.values(players).forEach(p => {
      if (!p || !p.nick) return;
      if (p.nick === immuneAccount) return;

      if (p.ammo !== undefined && p.lastAmmo !== undefined) {
        if (p.ammo === p.lastAmmo && p.isShooting) {
          banPlayer(p.nick, "Nieskończona amunicja");
        }
      }

      p.lastAmmo = p.ammo;
    });
  }

  // Główna pętla anty-cheatu
  setInterval(() => {
    if (!window.players) return;

    checkSpeedCheat(window.players);
    checkAmmoCheat(window.players);

  }, 300); // sprawdzanie co 0.3 sekundy

})();
// === ARCANNA ANTI-CHEAT: TELEPORTATION CHECK ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Konto odporne na anty-cheat
  const immuneAccount = "adam";

  // Czarodzieje, którzy mają legalny teleport
  const allowedTeleportMages = ["iluzjonista", "władca orłów"];

  // Minimalny czas między teleportami (15 sekund)
  const MIN_TELEPORT_INTERVAL = 15000;

  // Rejestr teleportów
  const teleportLog = {};

  // Funkcja wysyłająca bana
  function banPlayer(nick, reason) {
    if (nick === immuneAccount) return; // adam jest odporny

    sendNetwork({
      type: "ban",
      nick,
      reason
    });

    console.warn("ANTYCHEAT TELEPORT:", nick, "Powód:", reason);
  }

  // Główna funkcja sprawdzająca teleporty
  function checkTeleportCheat(players) {
    Object.values(players).forEach(p => {
      if (!p || !p.nick) return;
      if (p.nick === immuneAccount) return;

      // Jeśli gracz nie ma teleportu, a teleportuje się → ban
      if (p.didTeleport && !allowedTeleportMages.includes(p.class)) {
        banPlayer(p.nick, "Teleport na czarodzieju bez teleportu");
        return;
      }

      // Jeśli gracz ma teleport, sprawdzamy częstotliwość
      if (p.didTeleport && allowedTeleportMages.includes(p.class)) {

        const now = Date.now();

        if (!teleportLog[p.nick]) {
          teleportLog[p.nick] = now;
          return;
        }

        const last = teleportLog[p.nick];
        const diff = now - last;

        // Jeśli teleportował się częściej niż co 15 sekund → ban
        if (diff < MIN_TELEPORT_INTERVAL) {
          banPlayer(p.nick, "Teleportowanie częściej niż co 15 sekund");
        }

        teleportLog[p.nick] = now;
      }
    });
  }

  // Pętla anty-cheatu teleportacji
  setInterval(() => {
    if (!window.players) return;
    checkTeleportCheat(window.players);
  }, 300); // sprawdzanie co 0.3 sekundy

})();
// === ARCANNA ANTI-CHEAT: TELEPORTATION CHECK (FLYING ALLOWED) ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Konto odporne na anty-cheat
  const immuneAccount = "adam";

  // Czarodzieje, którzy mają legalny teleport
  const allowedTeleportMages = ["iluzjonista", "władca orłów"];

  // Minimalny czas między teleportami (15 sekund)
  const MIN_TELEPORT_INTERVAL = 15000;

  // Rejestr teleportów
  const teleportLog = {};

  // Funkcja wysyłająca bana
  function banPlayer(nick, reason) {
    if (nick === immuneAccount) return; // adam jest odporny

    sendNetwork({
      type: "ban",
      nick,
      reason
    });

    console.warn("ANTYCHEAT TELEPORT:", nick, "Powód:", reason);
  }

  // Główna funkcja sprawdzająca teleporty
  function checkTeleportCheat(players) {
    Object.values(players).forEach(p => {
      if (!p || !p.nick) return;
      if (p.nick === immuneAccount) return;

      // LATANIE jest legalne — ignorujemy
      // p.isFlying może istnieć, ale nie sprawdzamy tego

      // TELEPORT — sprawdzamy
      if (p.didTeleport) {

        // 1. Teleport na złym czarodzieju → ban
        if (!allowedTeleportMages.includes(p.class)) {
          banPlayer(p.nick, "Teleport na czarodzieju bez teleportu");
          return;
        }

        // 2. Teleport za często → ban
        const now = Date.now();

        if (!teleportLog[p.nick]) {
          teleportLog[p.nick] = now;
          return;
        }

        const last = teleportLog[p.nick];
        const diff = now - last;

        if (diff < MIN_TELEPORT_INTERVAL) {
          banPlayer(p.nick, "Teleportowanie częściej niż co 15 sekund");
        }

        teleportLog[p.nick] = now;
      }
    });
  }

  // Pętla anty-cheatu teleportacji
  setInterval(() => {
    if (!window.players) return;
    checkTeleportCheat(window.players);
  }, 300); // sprawdzanie co 0.3 sekundy

})();
// === ARCANNA DAILY QUEST FIX: RESET AT 7:00 POLISH TIME ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Pobieranie czasu polskiego (CET/CEST)
  function getPolishTime() {
    return new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  }

  // Zwraca timestamp polski
  function getPolishDate() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Warsaw" }));
  }

  // Sprawdzanie czy trzeba zresetować misje
  function shouldResetDailyQuests(lastReset) {
    const now = getPolishDate();

    // Jeśli nie ma zapisanego resetu → resetujemy
    if (!lastReset) return true;

    const last = new Date(lastReset);

    // Jeśli dzień się zmienił → reset
    if (now.getDate() !== last.getDate()) {
      return true;
    }

    // Jeśli jest po 7:00, a ostatni reset był przed 7:00 → reset
    const sevenAM = new Date(now);
    sevenAM.setHours(7, 0, 0, 0);

    if (now > sevenAM && last < sevenAM) {
      return true;
    }

    return false;
  }

  // Główna funkcja resetu misji
  function resetDailyQuests() {
    if (!window.currentUser) return;

    const saved = localStorage.getItem("dailyQuestReset_" + currentUser);

    if (shouldResetDailyQuests(saved)) {
      // Reset misji
      if (window.dailyQuests) {
        dailyQuests.forEach(q => {
          q.progress = 0;
          q.completed = false;
        });
      }

      // Zapis nowego resetu
      const now = getPolishDate().toISOString();
      localStorage.setItem("dailyQuestReset_" + currentUser, now);

      console.log("Misje dzienne zresetowane o 7:00 czasu polskiego");
    }
  }

  // Uruchamiamy sprawdzanie co minutę
  setInterval(resetDailyQuests, 60000);

  // Sprawdzamy też przy starcie gry
  resetDailyQuests();

})();
// === ARCANNA NEW MAGES MODULE ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Dodajemy nowych czarodziejów do listy postaci
  if (!window.allMages) window.allMages = [];

  // --- WŁADCA ORŁÓW ---
  allMages.push({
    id: "wladca_orlow",
    name: "Władca Orłów",
    price: 15000,
    desc: "Przyzywa orły które leczą lub atakują.",
    class: "wladca_orlow",
    maxHP: 100,
    speed: 4,
    abilities: {
      healEagleCooldown: 20000,
      attackEagleCooldown: 20000,
      healAmount: 0.30,   // 30% HP
      attackDamage: 0.30  // 30% HP przeciwnika
    }
  });

  // --- UŁASKAWIONY ---
  allMages.push({
    id: "ulaskawiony",
    name: "Ułaskawiony",
    price: 8000,
    desc: "Ma dwa życia.",
    class: "ulaskawiony",
    maxHP: 100,
    speed: 4,
    abilities: {
      extraLife: true
    }
  });

  // --- ELEKTRYCZNY ---
  allMages.push({
    id: "elektryczny",
    name: "Elektryczny",
    price: 6500,
    desc: "Strzały rażą prądem.",
    class: "elektryczny",
    maxHP: 100,
    speed: 4,
    abilities: {
      electricDamage: true
    }
  });

  // --- LOGIKA GADŻETÓW WŁADCY ORŁÓW ---
  window.useEagleHeal = function (player) {
    if (player.class !== "wladca_orlow") return;

    const now = Date.now();
    if (!player.lastHealEagle) player.lastHealEagle = 0;

    if (now - player.lastHealEagle < 20000) return; // cooldown

    player.lastHealEagle = now;

    const heal = player.maxHP * 0.30;
    player.hp = Math.min(player.hp + heal, player.maxHP);
  };

  window.useEagleAttack = function (player, target) {
    if (player.class !== "wladca_orlow") return;

    const now = Date.now();
    if (!player.lastAttackEagle) player.lastAttackEagle = 0;

    if (now - player.lastAttackEagle < 20000) return; // cooldown

    player.lastAttackEagle = now;

    const dmg = target.maxHP * 0.30;
    target.hp -= dmg;
  };

  // --- LOGIKA UŁASKAWIONEGO (2 życia) ---
  window.checkExtraLife = function (player) {
    if (player.class !== "ulaskawiony") return;

    if (!player.extraLifeUsed && player.hp <= 0) {
      player.extraLifeUsed = true;
      player.hp = player.maxHP; // drugie życie
    }
  };

  // --- LOGIKA ELEKTRYCZNEGO (prąd) ---
  window.applyElectricDamage = function (player, target) {
    if (player.class !== "elektryczny") return;

    // dodatkowy efekt prądu
    target.hp -= 5; // lekkie dodatkowe obrażenia
  };

})();
// === ARCANNA REPORT BUTTON + MATCH HISTORY + SHOP UPDATE + HP LOCK ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // ============================================================
  // 1. POJEDYNCZY PRZYCISK ZGŁOSZENIA W PRAWYM DOLNYM ROGU
  // ============================================================

  const reportBtn = document.createElement('button');
  reportBtn.id = 'reportBtn';
  reportBtn.classList.add('hidden');
  reportBtn.textContent = "ZGŁOŚ";
  reportBtn.style.position = "fixed";
  reportBtn.style.right = "18px";
  reportBtn.style.bottom = "18px";
  reportBtn.style.zIndex = "8";
  reportBtn.style.padding = "8px 14px";
  reportBtn.style.background = "#c62828";
  reportBtn.style.color = "#fff";
  reportBtn.style.borderRadius = "6px";
  reportBtn.style.border = "none";
  reportBtn.style.cursor = "pointer";

  document.body.appendChild(reportBtn);

  // Okno zgłoszenia
  const reportModal = document.createElement('div');
  reportModal.className = "friends-modal hidden";
  reportModal.innerHTML = `
    <div class="friends-window" style="max-width:420px;">
      <h3>Zgłoś gracza</h3>
      <label>Nick gracza:<br><input id="reportNick" type="text"></label>
      <label>Co się stało:<br><textarea id="reportText" rows="4"></textarea></label>
      <button id="reportSend">Wyślij zgłoszenie</button>
      <button id="reportClose" style="margin-top:10px;">Zamknij</button>
      <div id="reportMsg" style="margin-top:10px;color:#fff;"></div>
    </div>
  `;
  document.body.appendChild(reportModal);

  reportBtn.onclick = () => reportModal.classList.remove("hidden");
  reportModal.querySelector("#reportClose").onclick = () => reportModal.classList.add("hidden");

  reportModal.querySelector("#reportSend").onclick = async () => {
    const nick = reportModal.querySelector("#reportNick").value.trim();
    const text = reportModal.querySelector("#reportText").value.trim();

    if (!nick || !text) {
      reportModal.querySelector("#reportMsg").textContent = "Wypełnij oba pola!";
      return;
    }

    if (!currentUser || typeof window.sendReportToAdmins !== 'function') {
      reportModal.querySelector("#reportMsg").textContent = "ZALOGUJ SIĘ, ABY WYSŁAĆ ZGŁOSZENIE";
      return;
    }
    try {
      await window.sendReportToAdmins(currentUser, nick, text);
      reportModal.querySelector("#reportMsg").textContent = "ZGŁOSZENIE ZAPISANE";
    } catch (error) {
      reportModal.querySelector("#reportMsg").textContent = error.message;
    }
  };

  // ============================================================
  // 2. HISTORIA POJEDYNKÓW W PROFILU
  // ============================================================

  if (!window.matchHistory) window.matchHistory = [];

  // Dodawanie pojedynku do historii
  window.addMatchToHistory = function (result, enemyNick, enemyMage, myMage) {
    matchHistory.unshift({
      result,
      enemyNick,
      enemyMage,
      myMage
    });

    if (matchHistory.length > 5) matchHistory.pop();
  };

  // Okno historii
  const historyModal = document.createElement('div');
  historyModal.className = "friends-modal hidden";
  historyModal.innerHTML = `
    <div class="friends-window" style="max-width:420px;">
      <h3>Historia pojedynków</h3>
      <div id="historyList" class="friends-list"></div>
      <button id="historyClose" style="margin-top:10px;">Zamknij</button>
    </div>
  `;
  document.body.appendChild(historyModal);

  historyModal.querySelector("#historyClose").onclick = () => historyModal.classList.add("hidden");

  window.openMatchHistory = function () {
    const list = historyModal.querySelector("#historyList");
    list.innerHTML = "";

    matchHistory.forEach((m, i) => {
      const row = document.createElement("div");
      row.className = "friend-item";
      row.innerHTML = `
        <span><strong>${i + 1}.</strong> ${m.result === "win" ? "Wygrana" : "Przegrana"}</span>
        <span>vs ${m.enemyNick}</span>
      `;
      row.onclick = () => {
        alert(
          `Pojedynek z ${m.enemyNick}\n\n` +
          `Przeciwnik: ${m.enemyMage}\n` +
          `Ty: ${m.myMage}`
        );
      };
      list.appendChild(row);
    });

    historyModal.classList.remove("hidden");
  };

  // ============================================================
  // 3. DODANIE NOWYCH CZARODZIEJÓW DO SKLEPU
  // ============================================================

  if (window.allMages) {
    allMages.push({
      id: "wladca_orlow",
      name: "Władca Orłów",
      price: 15000,
      desc: "Przyzywa orły które leczą lub atakują.",
      class: "wladca_orlow"
    });

    allMages.push({
      id: "ulaskawiony",
      name: "Ułaskawiony",
      price: 8000,
      desc: "Ma dwa życia.",
      class: "ulaskawiony"
    });

    allMages.push({
      id: "elektryczny",
      name: "Elektryczny",
      price: 6500,
      desc: "Strzały rażą prądem.",
      class: "elektryczny"
    });
  }

  // ============================================================
  // 4. BLOKADA RUCHU I STRZAŁÓW PRZY 0 HP
  // ============================================================

  const originalUpdatePlayer = window.updatePlayer;

  window.updatePlayer = function (p) {
    if (p.hp <= 0) {
      p.vx = 0;
      p.vy = 0;
      p.canShoot = false;
      return;
    }

    p.canShoot = true;

    if (originalUpdatePlayer) originalUpdatePlayer(p);
  };

})();
// === ARCANNA EAGLE ANIMATIONS + PROJECTILES MODULE ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // ============================
  // 1. TWORZENIE ORŁA
  // ============================

  function spawnEagle(x, y, type) {
    const eagle = document.createElement('div');
    eagle.className = 'eagle';
    eagle.dataset.type = type;
    eagle.style.position = 'absolute';
    eagle.style.left = x + 'px';
    eagle.style.top = y + 'px';
    eagle.style.width = '40px';
    eagle.style.height = '40px';
    eagle.style.backgroundSize = 'cover';
    eagle.style.zIndex = '20';

    // Animacja orła
    eagle.style.transition = 'left 0.2s linear, top 0.2s linear';

    // Wygląd orła
    eagle.style.backgroundImage =
      type === 'heal'
        ? 'url(https://i.imgur.com/8i9mY0p.png)'   // orzeł leczący
        : 'url(https://i.imgur.com/0p9Qk4F.png)';  // orzeł atakujący

    document.body.appendChild(eagle);
    return eagle;
  }

  // ============================
  // 2. TWORZENIE POCISKU ORŁA
  // ============================

  function spawnEagleProjectile(x, y, targetX, targetY, type, onHit) {
    const proj = document.createElement('div');
    proj.className = 'eagleProjectile';
    proj.style.position = 'absolute';
    proj.style.left = x + 'px';
    proj.style.top = y + 'px';
    proj.style.width = '16px';
    proj.style.height = '16px';
    proj.style.borderRadius = '50%';
    proj.style.zIndex = '25';

    // Kolor pocisku
    proj.style.background =
      type === 'heal'
        ? 'rgba(0,255,0,0.8)'   // zielony — leczenie
        : 'rgba(255,0,0,0.8)';  // czerwony — atak

    document.body.appendChild(proj);

    // Animacja lotu pocisku
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 6;
    const steps = dist / speed;

    let step = 0;

    const interval = setInterval(() => {
      step++;

      proj.style.left = x + dx * (step / steps) + 'px';
      proj.style.top = y + dy * (step / steps) + 'px';

      // trafienie
      if (step >= steps) {
        clearInterval(interval);
        proj.remove();
        onHit();
      }
    }, 16);
  }

  // ============================
  // 3. ORZEŁ LECZĄCY
  // ============================

  window.useEagleHeal = function (player) {
    if (player.class !== "wladca_orlow") return;

    const now = Date.now();
    if (!player.lastHealEagle) player.lastHealEagle = 0;
    if (now - player.lastHealEagle < 20000) return;

    player.lastHealEagle = now;

    const eagle = spawnEagle(player.x - 60, player.y - 60, 'heal');

    // Orzeł leci do gracza
    const interval = setInterval(() => {
      eagle.style.left = player.x + 'px';
      eagle.style.top = (player.y - 40) + 'px';
    }, 50);

    // Pocisk leczący
    setTimeout(() => {
      spawnEagleProjectile(
        eagle.offsetLeft,
        eagle.offsetTop,
        player.x,
        player.y,
        'heal',
        () => {
          const heal = player.maxHP * 0.30;
          player.hp = Math.min(player.hp + heal, player.maxHP);
        }
      );

      clearInterval(interval);
      setTimeout(() => eagle.remove(), 300);
    }, 600);
  };

  // ============================
  // 4. ORZEŁ ATAKUJĄCY
  // ============================

  window.useEagleAttack = function (player, target) {
    if (player.class !== "wladca_orlow") return;

    const now = Date.now();
    if (!player.lastAttackEagle) player.lastAttackEagle = 0;
    if (now - player.lastAttackEagle < 20000) return;

    player.lastAttackEagle = now;

    const eagle = spawnEagle(player.x + 60, player.y - 60, 'attack');

    // Orzeł leci do przeciwnika
    const interval = setInterval(() => {
      eagle.style.left = target.x + 'px';
      eagle.style.top = (target.y - 40) + 'px';
    }, 50);

    // Pocisk atakujący
    setTimeout(() => {
      spawnEagleProjectile(
        eagle.offsetLeft,
        eagle.offsetTop,
        target.x,
        target.y,
        'attack',
        () => {
          const dmg = target.maxHP * 0.30;
          target.hp -= dmg;
        }
      );

      clearInterval(interval);
      setTimeout(() => eagle.remove(), 300);
    }, 600);
  };

})();
// === ARCANNA SHOP CARD HOVER ANIMATION ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Czekamy aż sklep się załaduje
  const observer = new MutationObserver(() => {
    const cards = document.querySelectorAll('.wizard-card');

    if (cards.length > 0) {
      cards.forEach(card => {
        card.style.transition = "transform 0.25s ease, box-shadow 0.25s ease";

        card.addEventListener("mouseenter", () => {
          card.style.transform = "scale(1.15)";
          card.style.boxShadow = "0 0 18px rgba(255,255,255,0.4)";
          card.style.zIndex = "1000";
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "scale(1)";
          card.style.boxShadow = "none";
          card.style.zIndex = "1";
        });
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
// === ARCANNA ADMINISTRATION SYSTEM (OWNER > ADMIN > HALF-ADMIN) ===
// Wklej NA SAMYM DOLE game.js

(function () {

  const OWNER = "adam"; // właściciel gry

  if (!window.userRoles) window.userRoles = {}; 
  if (!window.reports) {
    const storedReports = localStorage.getItem('arcanaReports');
    if (!storedReports) window.reports = [];
    else {
      try {
        const parsedReports = JSON.parse(storedReports);
        window.reports = Array.isArray(parsedReports) ? parsedReports : [];
      } catch (error) {
        console.error('Nie można odczytać zapisanych zgłoszeń.', error);
        window.reports = [];
      }
    }
  }
  if (!window.suspended) window.suspended = {}; 

  // ============================================================
  // NADAWANIE I ODBIERANIE RÓL (tylko właściciel)
  // ============================================================

  window.setRole = function (nick, role) {
    if (currentUser.toLowerCase() !== OWNER.toLowerCase()) return;
    return setAccountRole(nick, role);
  };

  window.removeRole = function (nick) {
    return window.setRole(nick, 'user');
  };

  // ============================================================
  // ZAWIESZENIE GRACZA (owner, admin, half-admin)
  // ============================================================

  window.suspendPlayer = async function (nick) {
    const role = userRoles[currentUser];

    if (
      currentUser !== OWNER &&
      role !== "admin" &&
      role !== "half-admin"
    ) return;

    try {
      const account = await checkServerAccount(nick);
      const end = Date.now() + 24 * 60 * 60 * 1000;
      suspended[account.nick] = end;
      sendNetwork({ type: "suspend", nick: account.nick, until: end });
    } catch (error) {
      setToast(error.message);
    }
  };

  // ============================================================
  // ODWIESZENIE GRACZA (owner + admin)
  // ============================================================

  window.unsuspendPlayer = async function (nick) {
    const role = userRoles[currentUser];

    if (currentUser !== OWNER && role !== "admin") return;

    try {
      const account = await checkServerAccount(nick);
      delete suspended[account.nick];
      sendNetwork({ type: "unsuspend", nick: account.nick });
    } catch (error) {
      setToast(error.message);
    }
  };

  // ============================================================
  // BLOKADA WEJŚCIA DLA ZAWIESZONYCH
  // ============================================================

  window.checkSuspension = function (nick) {
    if (!suspended[nick]) return false;

    if (Date.now() > suspended[nick]) {
      delete suspended[nick];
      return false;
    }

    return true;
  };

  // ============================================================
  // SYSTEM ZGŁOSZEŃ
  // ============================================================

  window.sendReportToAdmins = async function (from, target, text) {
    try {
      const account = await checkServerAccount(target);
      reports.push({
        from: String(from).slice(0, 16),
        target: account.nick,
        text: String(text).trim().slice(0, 1000),
        time: new Date().toLocaleString("pl-PL")
      });
      localStorage.setItem('arcanaReports', JSON.stringify(reports));
      window.refreshAdminReports?.();
    } catch (error) {
      setToast(error.message);
      throw error;
    }
  };

  // ============================================================
  // PANEL ADMINA / WŁAŚCICIELA
  // ============================================================

  const adminPanel = document.getElementById('staffAdminPanel');
  adminPanel.querySelector("#adminClose").onclick = () => {
    const collapsed = adminPanel.classList.toggle('collapsed');
    adminPanel.querySelector("#adminClose").textContent = collapsed ? 'ROZWIŃ' : 'ZWIŃ';
  };

  // ============================================================
  // ŁADOWANIE ZGŁOSZEŃ (owner + admin)
  // ============================================================

  function loadAdminReports() {
    const role = userRoles[currentUser];

    if (currentUser !== OWNER && role !== "admin") return;

    const list = adminPanel.querySelector("#adminReports");
    list.innerHTML = "";

    reports.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "friend-item";
      const summary = document.createElement('span');
      summary.textContent = `${i + 1}. ${r.from} → ${r.target}`;
      const description = document.createElement('span');
      description.textContent = r.text;
      const timestamp = document.createElement('span');
      timestamp.textContent = r.time;
      row.append(summary, description, timestamp);
      list.appendChild(row);
    });
  }
  window.refreshAdminReports = loadAdminReports;

  // ============================================================
  // NADAWANIE RÓL (tylko właściciel)
  // ============================================================

  adminPanel.querySelector("#giveAdmin").onclick = () => {
    if (currentUser !== OWNER) return;
    const nick = adminPanel.querySelector("#roleNick").value.trim();
    window.setRole(nick, "admin");
  };

  adminPanel.querySelector("#giveHalfAdmin").onclick = () => {
    if (currentUser !== OWNER) return;
    const nick = adminPanel.querySelector("#roleNick").value.trim();
    window.setRole(nick, "half-admin");
  };

  adminPanel.querySelector("#removeRole").onclick = () => {
    if (currentUser !== OWNER) return;
    const nick = adminPanel.querySelector("#roleNick").value.trim();
    window.removeRole(nick);
  };

  // ============================================================
  // ZAWIESZENIE / ODWIESZENIE
  // ============================================================

  adminPanel.querySelector("#suspendBtn").onclick = () => {
    const nick = adminPanel.querySelector("#suspendNick").value.trim();
    window.suspendPlayer(nick);
  };

  adminPanel.querySelector("#unsuspendBtn").onclick = () => {
    const nick = adminPanel.querySelector("#suspendNick").value.trim();
    window.unsuspendPlayer(nick);
  };

})();
// === ARCANNA HALF-ADMIN PANEL ===
// Wklej NA SAMYM DOLE game.js

(function () {

  const OWNER = "adam";

  if (!window.userRoles) window.userRoles = {};
  if (!window.reports) window.reports = [];
  if (!window.suspended) window.suspended = {};

  // ============================================================
  // FUNKCJE PÓŁ-ADMINA
  // ============================================================

  // pół-admin może zawieszać graczy
  window.halfAdminSuspend = async function (nick) {
    const role = userRoles[currentUser];

    if (role !== "half-admin") return;

    try {
      const account = await checkServerAccount(nick);
      const end = Date.now() + 24 * 60 * 60 * 1000;
      suspended[account.nick] = end;
      sendNetwork({ type: "suspend", nick: account.nick, until: end });
    } catch (error) {
      setToast(error.message);
    }
  };

  // pół-admin może wysyłać zgłoszenia
  window.halfAdminSendReport = async function (target, text) {
    const role = userRoles[currentUser];

    if (role !== "half-admin") return;

    try {
      const account = await checkServerAccount(target);
      reports.push({ from: currentUser, target: account.nick, text, time: new Date().toLocaleString("pl-PL") });
      localStorage.setItem('arcanaReports', JSON.stringify(reports));
      window.refreshAdminReports?.();
      sendNetwork({ type: "report", from: currentUser, target: account.nick, text });
    } catch (error) {
      setToast(error.message);
    }
  };

  // ============================================================
  // PANEL PÓŁ-ADMINA
  // ============================================================

  const halfPanel = document.getElementById('staffHalfAdminPanel');
  halfPanel.querySelector("#halfClose").onclick = () => {
    const collapsed = halfPanel.classList.toggle('collapsed');
    halfPanel.querySelector("#halfClose").textContent = collapsed ? 'ROZWIŃ' : 'ZWIŃ';
  };

  // ============================================================
  // OBSŁUGA PRZYCISKÓW PANELU
  // ============================================================

  halfPanel.querySelector("#halfSuspendBtn").onclick = () => {
    const nick = halfPanel.querySelector("#halfSuspendNick").value.trim();
    window.halfAdminSuspend(nick);
  };

  halfPanel.querySelector("#halfReportBtn").onclick = () => {
    const nick = halfPanel.querySelector("#halfReportNick").value.trim();
    const text = halfPanel.querySelector("#halfReportText").value.trim();
    window.halfAdminSendReport(nick, text);
  };

})();
// === ARCANNA SHOP: KARNETY + VIP SYSTEM ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // ============================================================
  // 1. DODAJEMY NOWĄ ZAKŁADKĘ "KARNETY"
  // ============================================================

  const shopWindow = document.querySelector('.shop-window');
  if (!shopWindow) return;

  // Sekcja VIP
  const vipSection = document.createElement('div');
  vipSection.id = "shopVip";
  vipSection.style.display = "none";
  vipSection.innerHTML = `
    <div class="vip-card" style="
      background:#222;
      padding:20px;
      border-radius:12px;
      color:#fff;
      text-align:center;
      margin-top:20px;
    ">
      <h2>VIP Karnet</h2>
      <p><strong>Cena:</strong> 100000 monet</p>
      <p>Mnożnik pieniędzy: <strong>x1.25</strong></p>
      <p>Codziennie: <strong>+500 monet</strong></p>
      <p>Darmowa postać: <strong>Elektryczny</strong></p>
      <button id="buyVipBtn" style="
        margin-top:15px;
        padding:10px 20px;
        background:#ffca28;
        border:none;
        border-radius:8px;
        cursor:pointer;
      ">Kup VIP</button>
      <div id="vipMsg" style="margin-top:10px;color:#fff;"></div>
    </div>
  `;
  shopWindow.appendChild(vipSection);

  // ============================================================
  // 2. LOGIKA KUPNA VIP
  // ============================================================

  if (!window.playerData) window.playerData = {};
  if (!playerData[currentUser]) playerData[currentUser] = {};

  const buyBtn = vipSection.querySelector("#buyVipBtn");
  const msg = vipSection.querySelector("#vipMsg");

  buyBtn.onclick = () => {
    const money = window.playerMoney || 0;

    if (money < 100000) {
      msg.textContent = "Nie masz wystarczająco monet!";
      return;
    }

    // Odejmujemy kasę
    window.playerMoney -= 100000;

    // Nadajemy VIP
    playerData[currentUser].vip = true;

    // Nadajemy postać Elektryczny
    if (!window.unlockedMages) window.unlockedMages = {};
    unlockedMages[currentUser] = unlockedMages[currentUser] || [];
    unlockedMages[currentUser].push("elektryczny");

    msg.textContent = "Kupiono VIP!";

    };

    // ============================================================
    // 4. VIP MNOŻNIK PIENIĘDZY
  // ============================================================

  window.applyMoneyMultiplier = function (amount) {
    if (window.playerData?.[currentUser]?.vip) {
      return Math.floor(amount * 1.25);
    }
    return amount;
  };

})();
// === ARCANNA SHOP: SVIP SYSTEM ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // ============================================================
  // 1. DODAJEMY KARTĘ SVIP DO ZAKŁADKI KARNETY
  // ============================================================

  const shopWindow = document.querySelector('.shop-window');
  if (!shopWindow) return;

  const vipSection = document.querySelector('#shopVip');
  if (!vipSection) return;

  const svipCard = document.createElement('div');
  svipCard.className = "svip-card";
  svipCard.style = `
    background:#333;
    padding:20px;
    border-radius:12px;
    color:#fff;
    text-align:center;
    margin-top:20px;
  `;
  svipCard.innerHTML = `
    <h2>SVIP Karnet</h2>
    <p><strong>Cena:</strong> 200000 monet</p>
    <p>Mnożnik pieniędzy: <strong>x1.5</strong></p>
    <p>Codziennie: <strong>+750 monet</strong></p>
    <p>Darmowa postać: <strong>Iluzjonista</strong></p>
    <button id="buySvipBtn" style="
      margin-top:15px;
      padding:10px 20px;
      background:#ff5722;
      border:none;
      border-radius:8px;
      cursor:pointer;
    ">Kup SVIP</button>
    <div id="svipMsg" style="margin-top:10px;color:#fff;"></div>
  `;

  vipSection.appendChild(svipCard);

  // ============================================================
  // 2. LOGIKA KUPNA SVIP
  // ============================================================

  if (!window.playerData) window.playerData = {};
  if (!playerData[currentUser]) playerData[currentUser] = {};

  const buySvipBtn = svipCard.querySelector("#buySvipBtn");
  const svipMsg = svipCard.querySelector("#svipMsg");

  buySvipBtn.onclick = () => {
    const money = window.playerMoney || 0;

    if (money < 200000) {
      svipMsg.textContent = "Nie masz wystarczająco monet!";
      return;
    }

    // Odejmujemy kasę
    window.playerMoney -= 200000;

    // Nadajemy SVIP
    playerData[currentUser].svip = true;

    // Nadajemy postać Iluzjonista
    if (!window.unlockedMages) window.unlockedMages = {};
    unlockedMages[currentUser] = unlockedMages[currentUser] || [];
    unlockedMages[currentUser].push("iluzjonista");

    svipMsg.textContent = "Kupiono SVIP!";

  };

  // ============================================================
  // 4. SVIP MNOŻNIK PIENIĘDZY
  // ============================================================

  const oldMultiplier = window.applyMoneyMultiplier;

  window.applyMoneyMultiplier = function (amount) {
    if (window.playerData?.[currentUser]?.svip) {
      return Math.floor(amount * 1.5);
    }
    return oldMultiplier(amount);
  };

})();
// === ARCANNA SHOP: GVIP SYSTEM ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // ============================================================
  // 1. DODAJEMY KARTĘ GVIP DO ZAKŁADKI KARNETY
  // ============================================================

  const shopWindow = document.querySelector('.shop-window');
  if (!shopWindow) return;

  const vipSection = document.querySelector('#shopVip');
  if (!vipSection) return;

  const gvipCard = document.createElement('div');
  gvipCard.className = "gvip-card";
  gvipCard.style = `
    background:#444;
    padding:20px;
    border-radius:12px;
    color:#fff;
    text-align:center;
    margin-top:20px;
  `;
  gvipCard.innerHTML = `
    <h2>GVIP Karnet</h2>
    <p><strong>Cena:</strong> 500000 monet</p>
    <p>Mnożnik pieniędzy: <strong>x1.75</strong></p>
    <p>Codziennie: <strong>+1000 monet</strong></p>
    <p>Darmowa postać: <strong>Piorun</strong></p>
    <button id="buyGvipBtn" style="
      margin-top:15px;
      padding:10px 20px;
      background:#29b6f6;
      border:none;
      border-radius:8px;
      cursor:pointer;
    ">Kup GVIP</button>
    <div id="gvipMsg" style="margin-top:10px;color:#fff;"></div>
  `;

  vipSection.appendChild(gvipCard);

  // ============================================================
  // 2. LOGIKA KUPNA GVIP
  // ============================================================

  if (!window.playerData) window.playerData = {};
  if (!playerData[currentUser]) playerData[currentUser] = {};

  const buyGvipBtn = gvipCard.querySelector("#buyGvipBtn");
  const gvipMsg = gvipCard.querySelector("#gvipMsg");

  buyGvipBtn.onclick = () => {
    const money = window.playerMoney || 0;

    if (money < 500000) {
      gvipMsg.textContent = "Nie masz wystarczająco monet!";
      return;
    }

    // Odejmujemy kasę
    window.playerMoney -= 500000;

    // Nadajemy GVIP
    playerData[currentUser].gvip = true;

    // Nadajemy postać Piorun
    if (!window.unlockedMages) window.unlockedMages = {};
    unlockedMages[currentUser] = unlockedMages[currentUser] || [];
    unlockedMages[currentUser].push("piorun");

    gvipMsg.textContent = "Kupiono GVIP!";

  };

  // ============================================================
  // 4. GVIP MNOŻNIK PIENIĘDZY
  // ============================================================

  const oldMultiplier = window.applyMoneyMultiplier;

  window.applyMoneyMultiplier = function (amount) {
    if (window.playerData?.[currentUser]?.gvip) {
      return Math.floor(amount * 1.75);
    }
    return oldMultiplier(amount);
  };

})();
// === ARCANNA SHOP: PREMIUM SYSTEM (1 000 000) ===
// Wklej NA SAMYM DOLE game.js

(function () {

  const shopWindow = document.querySelector('.shop-window');
  if (!shopWindow) return;

  const vipSection = document.querySelector('#shopVip');
  if (!vipSection) return;

  const premiumCard = document.createElement('div');
  premiumCard.className = "premium-card";
  premiumCard.style = `
    background:#550000;
    padding:20px;
    border-radius:12px;
    color:#fff;
    text-align:center;
    margin-top:20px;
  `;
  premiumCard.innerHTML = `
    <h2>PREMIUM Karnet</h2>
    <p><strong>Cena:</strong> 1000000 monet</p>
    <p>Mnożnik pieniędzy: <strong>x2.0</strong></p>
    <p>Codziennie: <strong>+1500 monet</strong></p>
    <p>Darmowa postać: <strong>Władca Orłów</strong></p>
    <button id="buyPremiumBtn" style="
      margin-top:15px;
      padding:10px 20px;
      background:#ff1744;
      border:none;
      border-radius:8px;
      cursor:pointer;
    ">Kup PREMIUM</button>
    <div id="premiumMsg" style="margin-top:10px;color:#fff;"></div>
  `;

  vipSection.appendChild(premiumCard);

  if (!window.playerData) window.playerData = {};
  if (!playerData[currentUser]) playerData[currentUser] = {};

  const buyPremiumBtn = premiumCard.querySelector("#buyPremiumBtn");
  const premiumMsg = premiumCard.querySelector("#premiumMsg");

  buyPremiumBtn.onclick = () => {
    const money = window.playerMoney || 0;

    if (money < 1000000) {
      premiumMsg.textContent = "Nie masz wystarczająco monet!";
      return;
    }

    window.playerMoney -= 1000000;

    playerData[currentUser].premium = true;

    if (!window.unlockedMages) window.unlockedMages = {};
    unlockedMages[currentUser] = unlockedMages[currentUser] || [];
    unlockedMages[currentUser].push("wladca_orlow");

    premiumMsg.textContent = "Kupiono PREMIUM!";

  };

  const oldMultiplier = window.applyMoneyMultiplier;

  window.applyMoneyMultiplier = function (amount) {
    if (window.playerData?.[currentUser]?.premium) {
      return Math.floor(amount * 2.0);
    }
    return oldMultiplier(amount);
  };

})();
// === ARCANNA ACTIVE PASS SYSTEM (MAX 1 PASS) ===
// Wklej NA SAMYM DOLE game.js

(function () {

  if (!window.playerData) window.playerData = {};
  if (!playerData[currentUser]) playerData[currentUser] = {};

  // Lista wszystkich karnetów i ich cen
  const PASS_PRICES = {
    vip: 100000,
    svip: 250000,
    gvip: 500000,
    premium: 1000000
  };

  // Nazwy wyświetlane
  const PASS_NAMES = {
    vip: "VIP",
    svip: "SVIP",
    gvip: "GVIP",
    premium: "PREMIUM"
  };
  const PASS_DAILY_REWARDS = { vip: 500, svip: 750, gvip: 1000, premium: 1500 };
  const PASS_BENEFITS = {
    vip: { character: 'ELEKTRYCZNY', skin: 'ZŁOTY (WARTOŚĆ 10 000 MONET)', multiplier: 'x1,25' },
    svip: { character: 'ILUZJONISTA', skin: 'POMARAŃCZOWY // NIEBIESKI // SOJUSZNIK TURKUSOWY (WARTOŚĆ 23 000 MONET)', multiplier: 'x1,5' },
    gvip: { character: 'PIORUN', skin: 'ZIELONY // RÓŻOWY // SOJUSZNIK POMARAŃCZOWY (WARTOŚĆ 35 000 MONET)', multiplier: 'x1,75' },
    premium: { character: 'WŁADCA ORŁÓW', skin: 'MONOCHROMATYCZNY (WARTOŚĆ 50 000 MONET)', multiplier: 'x2' }
  };
  const LEGACY_DAILY_KEYS = { vip: 'vipDaily_', svip: 'svipDaily_', gvip: 'gvipDaily_', premium: 'premiumDaily_' };
  let selectedPassId = '';

  window.refreshSkinShop = function () {
    const offers = document.getElementById('skinOffers');
    const empty = document.getElementById('skinShopEmpty');
    if (!offers || !empty) return;

    const skins = Object.entries(mageSkins)
      .map(([id, skin]) => ({ id, ...skin, owned: ownsMageSkin(id), equipped: getEquippedMageSkin() === id }))
      .filter(skin => !ownedOnly || skin.owned);
    offers.replaceChildren();
    skins.forEach(skin => {
      const card = document.createElement('article');
      card.className = `skin-card${skin.owned ? ' owned' : ''}${skin.equipped ? ' equipped' : ''}`;

      const name = document.createElement('strong');
      name.textContent = skin.name;
      const source = document.createElement('span');
      source.textContent = skin.colors;
      const status = document.createElement('small');
      status.textContent = skin.owned
        ? skin.equipped ? 'ZAŁOŻONY' : 'POSIADANY'
        : `CENA ${skin.value.toLocaleString('pl-PL')} MONET`;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.skinId = skin.id;
      button.dataset.skinAction = skin.owned ? (skin.equipped ? 'unequip' : 'equip') : 'buy';
      button.textContent = skin.owned ? (skin.equipped ? 'ZDEJMIJ' : 'ZAŁÓŻ') : `KUP // ${skin.value.toLocaleString('pl-PL')} MONET`;

      card.append(name, source, status, button);
      offers.appendChild(card);
    });
    empty.classList.toggle('hidden', !ownedOnly || skins.length > 0);
  };
  window.handleMageSkinAction = function (action, id) {
    const skin = mageSkins[id];
    if (!currentUser || !skin) return;
    const status = document.getElementById('skinShopStatus');
    const key = currentUser.toLowerCase();

    if (action === 'buy') {
      if (ownsMageSkin(id)) {
        status.textContent = `SKIN ${skin.name} JEST JUŻ POSIADANY`;
        window.refreshSkinShop();
        return;
      };
      if (coins < skin.value) {
        status.textContent = `BRAKUJE ${(skin.value - coins).toLocaleString('pl-PL')} MONET`;
        return;
      }
      coins -= skin.value;
      persistCoins();
      const inventory = getMap('arcanaSkins');
      inventory[key] = Array.from(new Set([...(inventory[key] || []), id]));
      saveMap('arcanaSkins', inventory);
      status.textContent = `KUPIONO SKIN ${skin.name}`;
      updateShop();
      window.refreshSkinShop();
      return;
    }

    if (!ownsMageSkin(id)) {
      status.textContent = 'NAJPIERW KUP TEN SKIN LUB ODBLOKUJ GO Z KARNETU';
      return;
    }
    const equipped = getMap('arcanaEquippedSkin');
    if (action === 'equip') {
      const inventory = getMap('arcanaSkins');
      inventory[key] = Array.from(new Set([...(inventory[key] || []), id]));
      saveMap('arcanaSkins', inventory);
      equipped[key] = id;
      status.textContent = `ZAŁOŻONO SKIN ${skin.name}`;
    } else if (action === 'unequip' && equipped[key] === id) {
      equipped[key] = '';
      status.textContent = `ZDJĘTO SKIN ${skin.name}`;
    } else {
      return;
    }
    saveMap('arcanaEquippedSkin', equipped);
    syncProfileToServer();
    window.refreshSkinShop();
  }

  function getPolishDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);
    return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  }

  function getPolishDayKey(date) {
    if (!Number.isFinite(date.getTime())) return '';
    const parts = getPolishDateParts(date);
    const day = Number(parts.day) - (Number(parts.hour) < 7 ? 1 : 0);
    return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, day)).toISOString().slice(0, 10);
  }

  function getLastClaimDay(account, passId) {
    const storedDays = account.passDailyClaimDates && typeof account.passDailyClaimDates === 'object'
      ? account.passDailyClaimDates
      : {};
    const storedDay = typeof storedDays[passId] === 'string' ? storedDays[passId] : '';
    const legacy = localStorage.getItem(`${LEGACY_DAILY_KEYS[passId]}${currentUser}`);
    const legacyDay = legacy ? getPolishDayKey(new Date(legacy)) : '';
    return storedDay > legacyDay ? storedDay : legacyDay;
  }

  function getDailyClaimState(account, passId) {
    const parts = getPolishDateParts();
    const today = `${parts.year}-${parts.month}-${parts.day}`;
    if (Number(parts.hour) < 7) return { available: false, message: 'NAGRODA DOSTĘPNA CODZIENNIE OD 07:00 CZASU POLSKIEGO' };
    if (getLastClaimDay(account, passId) === today) return { available: false, message: 'DZISIEJSZA NAGRODA ZOSTAŁA JUŻ ODEBRANA' };
    return { available: true, message: 'NAGRODA JEST GOTOWA DO ODBIORU' };
  }

  function normalizePassAccount(account) {
    const before = JSON.stringify(account);
    const passIds = Object.keys(PASS_PRICES);
    const legacyActivePasses = passIds.filter(id => account[id] === true);
    const ownedPass = Array.isArray(account.ownedPass)
      ? Array.from(new Set(account.ownedPass.filter(id => PASS_PRICES[id])))
      : legacyActivePasses;
    if (!ownedPass.length && legacyActivePasses.length) ownedPass.push(...legacyActivePasses);
    account.ownedPass = ownedPass;
    if (!ownedPass.includes(account.activePass)) account.activePass = legacyActivePasses.find(id => ownedPass.includes(id)) || '';
    passIds.forEach(id => { account[id] = account.activePass === id; });
    if (JSON.stringify(account) !== before) persistPlayerData();
  }

  // ============================================================
  // FUNKCJA KUPNA KARNETU (WYWOŁYWANA PRZY KUPNIE)
  // ============================================================

  function updatePassShop() {
    const account = currentUser ? playerData[currentUser] : null;
    if (account) normalizePassAccount(account);
    let hasOwnedPass = false;
    if (ownedOnly && selectedPassId && !account?.ownedPass?.includes(selectedPassId)) selectedPassId = '';
    document.querySelectorAll('[data-pass]').forEach(button => {
      const passId = button.dataset.pass;
      const owned = account?.ownedPass?.includes(passId);
      const active = account?.activePass === passId;
      hasOwnedPass ||= Boolean(owned);
      button.classList.toggle('hidden', ownedOnly && !owned);
      button.classList.toggle('active', active);
      button.classList.toggle('selected', selectedPassId === passId);
      button.querySelector('span').textContent = active ? 'AKTYWNY' : owned ? 'POSIADANY' : `${PASS_PRICES[passId].toLocaleString('pl-PL')} MONET`;
    });
    document.getElementById('passOwnedEmpty')?.classList.toggle('hidden', !ownedOnly || hasOwnedPass);
    updatePassDetails();
    window.refreshSkinShop();
  }
  window.updatePassShop = updatePassShop;

  function updatePassDetails() {
    const details = document.getElementById('passDetails');
    const actions = document.getElementById('passActions');
    const title = document.getElementById('passDetailsTitle');
    const benefits = document.getElementById('passBenefits');
    const dailyStatus = document.getElementById('passDailyStatus');
    const account = currentUser ? playerData[currentUser] : null;
    const passId = selectedPassId;
    if (!details || !actions || !title || !benefits || !dailyStatus || !account || !PASS_PRICES[passId]) {
      details?.classList.add('hidden');
      return;
    }

    details.classList.remove('hidden');
    const owned = Array.isArray(account.ownedPass) && account.ownedPass.includes(passId);
    const active = account.activePass === passId;
    const rewardAmount = PASS_DAILY_REWARDS[passId];
    title.textContent = `${PASS_NAMES[passId]}${active ? ' // AKTYWNY' : ''}`;
    benefits.replaceChildren();
    [
      `POSTAĆ Z KARNETU: ${PASS_BENEFITS[passId].character}`,
      `SKIN Z KARNETU: ${PASS_BENEFITS[passId].skin}`,
      `MNOŻNIK ZAROBKÓW: ${PASS_BENEFITS[passId].multiplier}`,
      `CODZIENNA NAGRODA: +${rewardAmount.toLocaleString('pl-PL')} MONET`
    ].forEach(text => {
      const item = document.createElement('li');
      item.textContent = text;
      benefits.appendChild(item);
    });
    actions.innerHTML = '';

    if (!owned) {
      dailyStatus.textContent = 'Kup karnet, aby odblokować jego codzienną nagrodę.';
      actions.innerHTML = '<button type="button" data-pass-action="buy">KUP KARNET</button>';
      return;
    }

    const claimState = active ? getDailyClaimState(account, passId) : null;
    dailyStatus.textContent = active ? claimState.message : 'Załóż ten karnet, aby odbierać jego codzienną nagrodę.';
    actions.innerHTML = `
      <button type="button" data-pass-action="${active ? 'unequip' : 'equip'}">${active ? 'ZDEJMIJ KARNET' : 'ZAŁÓŻ KARNET'}</button>
      ${active ? `<button type="button" data-pass-action="claim" ${claimState.available ? '' : 'disabled'}>ODBIERZ NAGRODĘ</button>` : ''}
      <button type="button" class="danger" data-pass-action="sell">SPRZEDAJ ZA ${Math.floor(PASS_PRICES[passId] * .75).toLocaleString('pl-PL')} MONET</button>
    `;
  }

  window.selectPass = function (passId) {
    if (!PASS_PRICES[passId]) return;
    selectedPassId = passId;
    updatePassShop();
  };

  window.handlePassAction = function (action) {
    const passId = selectedPassId;
    if (!currentUser || !PASS_PRICES[passId]) return;
    const account = playerData[currentUser] ||= {};
    const ownedPass = Array.isArray(account.ownedPass) ? account.ownedPass : [];

    if (action === 'buy' && !ownedPass.includes(passId)) {
      window.buyPass(passId);
      return;
    }
    if (action === 'equip' && ownedPass.includes(passId)) {
      account.activePass = passId;
      ['vip', 'svip', 'gvip', 'premium'].forEach(id => { account[id] = id === passId; });
      persistPlayerData();
      window.grantPassCharacter?.(passId);
      document.getElementById('passShopStatus').textContent = `ZAŁOŻONO KARNET ${PASS_NAMES[passId]}`;
      updatePassShop();
      return;
    }
    if (action === 'unequip' && account.activePass === passId) {
      account.activePass = '';
      ['vip', 'svip', 'gvip', 'premium'].forEach(id => { account[id] = false; });
      persistPlayerData();
      document.getElementById('passShopStatus').textContent = `ZDJĘTO KARNET ${PASS_NAMES[passId]}`;
      updatePassShop();
      return;
    }
    if (action === 'sell' && ownedPass.includes(passId)) {
      const refund = Math.floor(PASS_PRICES[passId] * .75);
      if (!confirm(`Czy sprzedać karnet ${PASS_NAMES[passId]} za ${refund.toLocaleString('pl-PL')} monet?`)) return;
      account.ownedPass = ownedPass.filter(id => id !== passId);
      if (account.activePass === passId) {
        account.activePass = '';
        ['vip', 'svip', 'gvip', 'premium'].forEach(id => { account[id] = false; });
      }
      coins += refund;
      persistCoins();
      persistPlayerData();
      document.getElementById('passShopStatus').textContent = `SPRZEDANO KARNET ${PASS_NAMES[passId]} ZA ${refund.toLocaleString('pl-PL')} MONET`;
      updatePassShop();
      return;
    }
    if (action === 'claim' && ownedPass.includes(passId) && account.activePass === passId) {
      const claimState = getDailyClaimState(account, passId);
      if (!claimState.available) {
        document.getElementById('passShopStatus').textContent = claimState.message;
        updatePassShop();
        return;
      }
      const parts = getPolishDateParts();
      account.passDailyClaimDates = account.passDailyClaimDates && typeof account.passDailyClaimDates === 'object'
        ? account.passDailyClaimDates
        : {};
      account.passDailyClaimDates[passId] = `${parts.year}-${parts.month}-${parts.day}`;
      coins += PASS_DAILY_REWARDS[passId];
      persistCoins();
      persistPlayerData();
      document.getElementById('passShopStatus').textContent = `ODEBRANO +${PASS_DAILY_REWARDS[passId].toLocaleString('pl-PL')} MONET ZA KARNET ${PASS_NAMES[passId]}`;
      updatePassShop();
    }
  };

  setInterval(() => {
    if (selectedPassId) updatePassDetails();
  }, 30000);

  window.buyPass = function (passId) {
    const price = PASS_PRICES[passId];
    if (!currentUser || !price) return;
    if (!window.playerData) window.playerData = {};
    const account = playerData[currentUser] ||= {};
    const ownedPass = Array.isArray(account.ownedPass) ? account.ownedPass : [];
    account.ownedPass = ownedPass;

    if (ownedPass.includes(passId)) {
      account.activePass = passId;
      ['vip', 'svip', 'gvip', 'premium'].forEach(id => { account[id] = id === passId; });
      persistPlayerData();
      window.grantPassCharacter?.(passId);
      selectedPassId = passId;
      updatePassShop();
      document.getElementById('passShopStatus').textContent = `${PASS_NAMES[passId]} JEST TERAZ AKTYWNY`;
      return;
    }

    const activePass = account.activePass && PASS_PRICES[account.activePass] ? account.activePass : null;
    const refund = activePass ? Math.floor(PASS_PRICES[activePass] * .75) : 0;
    const sellActive = Boolean(activePass) && confirm(`Masz aktywny karnet ${PASS_NAMES[activePass]}. Czy sprzedać go za ${refund.toLocaleString('pl-PL')} monet i aktywować ${PASS_NAMES[passId]}?`);
    const availableCoins = coins + (sellActive ? refund : 0);
    if (availableCoins < price) {
      document.getElementById('passShopStatus').textContent = `BRAKUJE ${Math.ceil(price - availableCoins).toLocaleString('pl-PL')} MONET`;
      return;
    }

    if (sellActive) {
      account.ownedPass = ownedPass.filter(id => id !== activePass);
      account.activePass = passId;
    } else if (!activePass) {
      account.activePass = passId;
    }
    account.ownedPass = Array.from(new Set([...account.ownedPass, passId]));
    ['vip', 'svip', 'gvip', 'premium'].forEach(id => { account[id] = account.activePass === id; });
    coins = availableCoins - price;
    persistCoins();
    persistPlayerData();
    window.grantPassCharacter?.(passId);
    selectedPassId = passId;
    updatePassShop();
    document.getElementById('passShopStatus').textContent = sellActive
      ? `SPRZEDANO ${PASS_NAMES[activePass]} I AKTYWOWANO ${PASS_NAMES[passId]}`
      : `KUPIONO ${PASS_NAMES[passId]}${account.activePass === passId ? ' // AKTYWNY' : ''}`;
  };

  const applyPassMoneyMultiplier = window.applyMoneyMultiplier;
  window.applyMoneyMultiplier = function (amount) {
    const account = currentUser ? playerData[currentUser] : null;
    const ownedPasses = new Set(account?.ownedPass || []);
    ['vip', 'svip', 'gvip', 'premium'].forEach(passId => {
      if (account?.[passId]) ownedPasses.add(passId);
    });
    const passMultiplier = ownedPasses.has('premium') ? 2
      : ownedPasses.has('gvip') ? 1.75
        : ownedPasses.has('svip') ? 1.5
          : ownedPasses.has('vip') ? 1.25
            : 0;
    if (passMultiplier) return Math.floor(amount * passMultiplier);
    return applyPassMoneyMultiplier ? applyPassMoneyMultiplier(amount) : amount;
  };

  updatePassShop();

})();
// === ARCANNA PASS FIXES (NO DUPLICATE CHARACTERS) ===
// Wklej NA SAMYM DOLE game.js

(function () {

  // Funkcja dodająca postać tylko jeśli gracz jej nie ma
  function giveCharacterOnce(nick, mageId) {
    if (!window.unlockedMages) window.unlockedMages = {};
    unlockedMages[nick] = unlockedMages[nick] || [];

    if (!unlockedMages[nick].includes(mageId)) {
      unlockedMages[nick].push(mageId);
      return true; // dodano
    }
    return false; // już miał
  }

  // POPRAWKA: SVIP nie dodaje iluzjonisty drugi raz
  window.giveSVIPCharacter = function (nick) {
    const added = giveCharacterOnce(nick, "iluzjonista");
    return added;
  };

  // POPRAWKA: GVIP dodaje Pioruna tylko raz
  window.giveGVIPCharacter = function (nick) {
    const added = giveCharacterOnce(nick, "piorun");
    return added;
  };

  // POPRAWKA: PREMIUM dodaje Władcę Orłów tylko raz
  window.givePremiumCharacter = function (nick) {
    const added = giveCharacterOnce(nick, "wladca_orlow");
    return added;
  };

})();
