addEventListener('storage', event => { if (!matchRoomKey || event.key !== matchRoomKey || !event.newValue) return; const room = JSON.parse(event.newValue); if (room.started && room.players.length === 2 && !running) { joined = true; mode = 'player'; ui.join.textContent = 'PRZECIWNIK ZNALEZIONY // START'; startGame('player'); } });
addEventListener('click', event => { if (event.target.closest('#playerButton')) startCodeMatch(); });
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const chestModal = document.getElementById('chestModal');
const chestResult = document.getElementById('chestResult');
const keychainCollection = document.getElementById('keychainCollection');
addEventListener('click', event => {
  if (event.target.closest('#backpackButton')) { document.getElementById('backpackModal').classList.remove('hidden'); updateBackpack(); }
  if (event.target.closest('#backpackClose')) document.getElementById('backpackModal').classList.add('hidden');
  if (event.target.closest('#chestsButton')) { document.getElementById('shop').classList.add('hidden'); chestModal.classList.remove('hidden'); chestResult.textContent = ''; }
  if (event.target.closest('#chestClose')) chestModal.classList.add('hidden');
  const chest = event.target.closest('[data-chest]');
  if (chest) openChest(chest.dataset.chest);
});
const auth = { screen: document.getElementById('authScreen'), registerTab: document.getElementById('registerTab'), loginTab: document.getElementById('loginTab'), registerForm: document.getElementById('registerForm'), loginForm: document.getElementById('loginForm'), registerNick: document.getElementById('registerNick'), registerPassword: document.getElementById('registerPassword'), registerNickError: document.getElementById('registerNickError'), loginNick: document.getElementById('loginNick'), loginPassword: document.getElementById('loginPassword'), loginError: document.getElementById('loginError') };
const ownerUi = { panel: document.getElementById('ownerPanel'), panelBody: document.getElementById('ownerPanelBody'), toggle: document.getElementById('ownerToggleButton'), target: document.getElementById('ownerTarget'), coins: document.getElementById('ownerCoins'), wizard: document.getElementById('ownerWizard'), message: document.getElementById('ownerMessage'), addAdmin: document.getElementById('addAdminButton'), ban: document.getElementById('banButton'), unban: document.getElementById('unbanButton'), giveCoins: document.getElementById('giveCoinsButton'), takeCoins: document.getElementById('takeCoinsButton'), resetAccount: document.getElementById('resetAccountButton'), giveWizard: document.getElementById('giveWizardButton') };
const profileUi = { button: document.getElementById('profileButton'), avatar: document.getElementById('profileAvatar'), modal: document.getElementById('profileModal'), close: document.getElementById('profileClose'), name: document.getElementById('profileName'), editor: document.getElementById('avatarDrawCanvas'), clear: document.getElementById('avatarClear'), save: document.getElementById('avatarSave'), dropEnabled: document.getElementById('dropEnabled'), dropCharm: document.getElementById('dropKeychain') };
const OWNER_NICK = 'adam2właściciel';
const OWNER_PASSWORD = 'admin123';
const OWNER_NICKS = [OWNER_NICK];
let currentUser = '';
let logoutIntentional = false, opponentProfile = {}, matchRewardGranted = false, avatarDrawing = false;
function toggleOwnerPanel(forceCollapse) {
  const collapsed = typeof forceCollapse === 'boolean' ? forceCollapse : !ownerUi.panel.classList.contains('collapsed');
  ownerUi.panel.classList.toggle('collapsed', collapsed);
  ownerUi.toggle.textContent = collapsed ? 'ROZWIŃ' : 'ZWIŃ';
}
function getAccounts() { return JSON.parse(localStorage.getItem('arcanaAccounts') || '{}'); }
function getMap(name) { return JSON.parse(localStorage.getItem(name) || '{}'); }
function saveMap(name, value) { localStorage.setItem(name, JSON.stringify(value)); }
function ensureOwnerAccount() {
  const accounts = getAccounts();
  const key = OWNER_NICK.toLowerCase();
  const bans = getMap('arcanaBans');
  delete bans[key];
  saveMap('arcanaBans', bans);

  if (accounts.test123) accounts.test123.role = 'user';
  if (accounts['adam1właściciel']) delete accounts['adam1właściciel'];

  if (!accounts[key]) {
    accounts[key] = { nick: OWNER_NICK, password: OWNER_PASSWORD, role: 'owner' };
  } else {
    accounts[key].nick = OWNER_NICK;
    accounts[key].role = 'owner';
    if (!accounts[key].password || accounts[key].password === accounts[key].nick) {
      accounts[key].password = OWNER_PASSWORD;
    }
  }

  Object.keys(accounts).forEach(accountKey => {
    const account = accounts[accountKey];
    if (!account || typeof account !== 'object') return;
    if (account.nick === 'adam1właściciel') {
      delete accounts[accountKey];
      return;
    }
    if (account.role === 'owner' && accountKey !== key) {
      account.role = 'user';
    }
  });

  const inventory = getMap('arcanaKeychains');
  inventory[key] = Array.from(new Set([...(inventory[key] || []), 'owner-charm']));
  saveMap('arcanaKeychains', inventory);
  const equipped = getMap('arcanaEquipped');
  equipped[key] = Array.from(new Set(['owner-charm', ...(equipped[key] || [])])).slice(0, 3);
  saveMap('arcanaEquipped', equipped);
  localStorage.setItem('arcanaAccounts', JSON.stringify(accounts));
}
function persistCoins() { const balances = getMap('arcanaBalances'); const accounts = getAccounts(); balances[currentUser.toLowerCase()] = coins; if (accounts[currentUser.toLowerCase()]) accounts[currentUser.toLowerCase()].coins = coins; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); localStorage.setItem('arcanaCoins', coins); }
const chests = { main: { cost: 0, rewards: [{ id: 'vitality-charm', chance: .30 }, { id: 'life-charm', chance: .50 }, { id: 'ward-charm', chance: .19 }, { id: 'strength-charm', chance: .01 }] } };
const keychains = { 'strength-charm': { name: 'TALIZMAN SIŁY', rarity: 'LEGENDARNY', damageMultiplier: 1.2 }, 'vitality-charm': { name: 'SERCE ARENY', rarity: 'RZADKI', healthPercent: .1 }, 'life-charm': { name: 'KAMIEŃ ŻYCIA', rarity: 'NIEZWYKŁY', healthBonus: 10 }, 'ward-charm': { name: 'RUNICZNA OSŁONA', rarity: 'RZADKI', damageReduction: .1 }, 'owner-charm': { name: 'ZNAK WŁAŚCICIELA', rarity: 'MITYCZNY', damageMultiplier: 1.2, damageReduction: .15 }, 'admin-charm': { name: 'ODZNAKA ADMINA', rarity: 'EPICKI', damageMultiplier: 1.07, damageReduction: .1 } };
function getKeychains() { return getMap('arcanaKeychains')[currentUser.toLowerCase()] || []; }
function getEquippedKeychains() { return (getMap('arcanaEquipped')[currentUser.toLowerCase()] || []).filter(id => getKeychains().includes(id) && keychains[id]); }
function getKeychainLevel(id) { return Number(getMap('arcanaKeychainLevels')[currentUser.toLowerCase()]?.[id] || 0); }
function getStrengthMultiplier() { return getEquippedKeychains().reduce((multiplier, id) => { const base = keychains[id].damageMultiplier || 1; return multiplier * (1 + (base - 1) * (1 + getKeychainLevel(id) * .5)); }, 1); }
function getDamageReduction() { return Math.min(.8, getEquippedKeychains().reduce((total, id) => total + (keychains[id].damageReduction || 0) * (1 + getKeychainLevel(id) * .5), 0)); }
function getHealthBonus(baseHp) { return getEquippedKeychains().reduce((total, id) => total + baseHp * (keychains[id].healthPercent || 0) * (1 + getKeychainLevel(id) * .5) + (keychains[id].healthBonus || 0) * (1 + getKeychainLevel(id) * .5), 0); }
function grantKeychain(id) { if (!keychains[id]) return; const inventory = getMap('arcanaKeychains'); inventory[currentUser.toLowerCase()] = [...(inventory[currentUser.toLowerCase()] || []), id]; saveMap('arcanaKeychains', inventory); updateBackpack(); }
function toggleKeychain(id) { const equipped = getMap('arcanaEquipped'); const list = equipped[currentUser.toLowerCase()] || []; if (list.includes(id)) equipped[currentUser.toLowerCase()] = list.filter(item => item !== id); else if (list.length < 3) equipped[currentUser.toLowerCase()] = [...list, id]; else { setToast('MOŻESZ ZAŁOŻYĆ MAKSYMALNIE 3 BRELOCZKI'); return; } saveMap('arcanaEquipped', equipped); updateBackpack(); updateProfile(); }
function combineKeychain(id) { const inventory = getMap('arcanaKeychains'); const owned = inventory[currentUser.toLowerCase()] || []; const count = owned.filter(item => item === id).length; const levels = getMap('arcanaKeychainLevels'); const level = Number(levels[currentUser.toLowerCase()]?.[id] || 0); if (level >= 2 || count <= level + 1) { setToast(level >= 2 ? 'MAKSYMALNY POZIOM POŁĄCZENIA' : 'POTRZEBUJESZ DRUGIEGO TAKIEGO BRELOCZKA'); return; } owned.splice(owned.indexOf(id), 1); inventory[currentUser.toLowerCase()] = owned; levels[currentUser.toLowerCase()] ||= {}; levels[currentUser.toLowerCase()][id] = level + 1; saveMap('arcanaKeychains', inventory); saveMap('arcanaKeychainLevels', levels); updateBackpack(); setToast(`BRELOCZEK POŁĄCZONY // POZIOM ${level + 1}/2`); }
function updateBackpack() { const owned = getKeychains().filter(id => keychains[id]); const equipped = getEquippedKeychains(); const empty = document.querySelector('.backpack-empty'); empty.classList.toggle('hidden', owned.length > 0); keychainCollection.classList.toggle('hidden', owned.length === 0); keychainCollection.innerHTML = owned.map(id => { const level = getKeychainLevel(id); const copies = owned.filter(item => item === id).length; return `<div class="keychain-card"><b>${keychains[id].name}</b><span>${keychains[id].rarity} // POZIOM ${level}/2</span><span>${equipped.includes(id) ? 'ZAŁOŻONY' : ''} ${copies} SZT.</span><div class="keychain-actions"><button type="button" data-equip="${id}">${equipped.includes(id) ? 'ZDEJMIJ' : 'ZAŁÓŻ'}</button><button type="button" data-combine="${id}" ${level >= 2 || copies <= level + 1 ? 'disabled' : ''}>POŁĄCZ</button></div></div>`; }).join(''); }
function openChest(id) { const chest = chests[id]; if (!chest || !currentUser) return; const roll = Math.random(); let total = 0; const reward = chest.rewards.find(item => { total += item.chance; return roll < total; })?.id; if (!reward) return; grantKeychain(reward); chestResult.textContent = `${keychains[reward].name} DODANY DO PLECAKA`; }
function drawAvatar(canvas, imageData, nick) { const context = canvas.getContext('2d'); context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = '#15323a'; context.fillRect(0, 0, canvas.width, canvas.height); if (imageData) { const image = new Image(); image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height); image.src = imageData; } else { context.fillStyle = '#73e1dd'; context.font = `700 ${canvas.width * .44}px Space Grotesk`; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText((nick || '?').slice(0, 1).toUpperCase(), canvas.width / 2, canvas.height / 2); } }
function updateProfile() { if (!currentUser) return; const key = currentUser.toLowerCase(); const equipped = getEquippedKeychains(); const dropMap = getMap('arcanaDropCharm'); const previous = dropMap[key]; profileUi.dropCharm.innerHTML = equipped.length ? equipped.map(id => `<option value="${id}">${keychains[id].name}</option>`).join('') : '<option value="">BRAK ZAŁOŻONYCH BRELOCZKÓW</option>'; profileUi.dropCharm.disabled = equipped.length === 0; profileUi.dropCharm.value = equipped.includes(previous) ? previous : (equipped[0] || ''); if (equipped.length && !equipped.includes(previous)) { dropMap[key] = equipped[0]; saveMap('arcanaDropCharm', dropMap); } profileUi.dropEnabled.checked = Boolean(getMap('arcanaDropEnabled')[key]); profileUi.dropEnabled.disabled = equipped.length === 0; }
function openProfile() { const key = currentUser.toLowerCase(); profileUi.name.textContent = getAccounts()[key]?.nick || currentUser; profileUi.modal.classList.remove('hidden'); updateProfile(); const avatar = getMap('arcanaAvatars')[key] || ''; drawAvatar(profileUi.avatar, avatar, currentUser); drawAvatar(profileUi.editor, avatar, currentUser); }
function saveAvatar() { if (!currentUser) return; const avatars = getMap('arcanaAvatars'); avatars[currentUser.toLowerCase()] = profileUi.editor.toDataURL('image/png'); saveMap('arcanaAvatars', avatars); drawAvatar(profileUi.avatar, avatars[currentUser.toLowerCase()], currentUser); setToast('AVATAR ZAPISANY'); }
function accountCharm(id) { const inventory = getMap('arcanaKeychains'); inventory[id] = Array.from(new Set([...(inventory[id] || []), 'admin-charm'])); saveMap('arcanaKeychains', inventory); const equipped = getMap('arcanaEquipped'); equipped[id] = Array.from(new Set([...(equipped[id] || []), 'admin-charm'])).slice(0, 3); saveMap('arcanaEquipped', equipped); }
function getProfileDrop() { const key = currentUser.toLowerCase(); const enabled = Boolean(getMap('arcanaDropEnabled')[key]); const charm = getMap('arcanaDropCharm')[key]; return { nick: currentUser, role: getAccounts()[key]?.role || 'user', dropEnabled: enabled && getEquippedKeychains().includes(charm), dropCharm: charm, damageReduction: getDamageReduction() }; }
function clearAuthForm() {
  auth.registerNick.value = '';
  auth.loginNick.value = '';
  auth.registerPassword.value = '';
  auth.loginPassword.value = '';
  auth.registerNickError.textContent = '';
  auth.loginError.textContent = '';
}

function finishAuth(nick) { currentUser = nick; logoutIntentional = false; const key = nick.toLowerCase(); const accounts = getAccounts(); const account = accounts[key]; const balances = getMap('arcanaBalances'); const selectedByAccount = getMap('arcanaSelectedWizards'); coins = Number(balances[key] ?? account?.coins ?? localStorage.getItem('arcanaCoins') ?? 0); selectedWizard = selectedByAccount[key] || 'apprentice'; localStorage.setItem('arcanaWizard', selectedWizard); ui.playerName.textContent = `GRACZ: ${nick}`; profileUi.button.classList.remove('hidden'); ui.logout.classList.remove('hidden'); localStorage.setItem('arcanaCurrentUser', nick); ownerUi.panel.classList.toggle('hidden', !['owner', 'admin'].includes(account?.role)); ownerUi.addAdmin.classList.toggle('hidden', !isOwner()); ownerUi.resetAccount.classList.toggle('hidden', !isOwner()); if (['owner', 'admin'].includes(account?.role)) toggleOwnerPanel(false); auth.screen.classList.add('hidden'); document.getElementById('deviceScreen').classList.remove('hidden'); updateShop(); updateFriends(); updateProfile(); drawAvatar(profileUi.avatar, getMap('arcanaAvatars')[key] || '', nick); }

function logoutAccount() {
  if (!currentUser) return;
  logoutIntentional = true;
  if (matchSocket) {
    matchSocket.close();
    matchSocket = null;
  }
  onlineMatch = false;
  joined = false;
  running = false;
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
  currentUser = '';
  ui.playerName.textContent = '';
  profileUi.button.classList.add('hidden');
  profileUi.modal.classList.add('hidden');
  ui.logout.classList.add('hidden');
  ownerUi.panel.classList.add('hidden');
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
  currentUser = '';
  ui.playerName.textContent = '';
  profileUi.button.classList.add('hidden');
  profileUi.modal.classList.add('hidden');
  ui.logout.classList.add('hidden');
  ownerUi.panel.classList.add('hidden');
  clearAuthForm();
  auth.screen.classList.remove('hidden');
  localStorage.removeItem('arcanaCurrentUser');
}
function showAuthForm(form) { const register = form === 'register'; auth.registerForm.classList.toggle('hidden', !register); auth.loginForm.classList.toggle('hidden', register); auth.registerTab.classList.toggle('active', register); auth.loginTab.classList.toggle('active', !register); }
function registerAccount(event) { event.preventDefault(); const nick = auth.registerNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); auth.registerNickError.textContent = ''; if (accounts[key]) { auth.registerNickError.textContent = 'JUŻ KTOŚ MA TAKĄ NAZWĘ'; return; } accounts[key] = { nick, password: auth.registerPassword.value }; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); finishAuth(nick); }
function loginAccount(event) { event.preventDefault(); const nick = auth.loginNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); const account = accounts[key]; auth.loginError.textContent = ''; if (getMap('arcanaBans')[key]) { auth.loginError.textContent = 'TO KONTO ZOSTAŁO ZBANOWANE'; return; } if (!account || account.password !== auth.loginPassword.value) { auth.loginError.textContent = 'NIEPRAWIDŁOWY NICK LUB HASŁO'; return; } finishAuth(account.nick); }
function ownerTarget() { const key = ownerUi.target.value.trim().toLowerCase(); return key; }
function ownerResult(text) { ownerUi.message.textContent = text; }
function isOwner() { return OWNER_NICKS.includes(currentUser.toLowerCase()); }
function isStaff() { const account = getAccounts()[currentUser.toLowerCase()]; return account?.role === 'owner' || account?.role === 'admin'; }
function addAdmin() { if (!isOwner()) return; const key = ownerTarget(); const accounts = getAccounts(); if (!accounts[key] || key === OWNER_NICK.toLowerCase()) { ownerResult('NIEPRAWIDŁOWY CEL'); return; } accounts[key].role = 'admin'; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); accountCharm(key); ownerResult(`DODANO ADMINA: ${accounts[key].nick}`); }
function changeBan(banned) { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); if (!accounts[key] || (banned && OWNER_NICKS.includes(key))) { ownerResult('NIEPRAWIDŁOWY CEL'); return; } const bans = getMap('arcanaBans'); if (banned) bans[key] = true; else delete bans[key]; saveMap('arcanaBans', bans); ownerResult(banned ? 'GRACZ ZBANOWANY' : `GRACZ ODBANOWANY: ${accounts[key].nick}`); }
function giveCoins() { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); const amount = Number(ownerUi.coins.value); if (!accounts[key] || !Number.isFinite(amount) || amount < 1) { ownerResult('NIEPRAWIDŁOWY CEL LUB LICZBA'); return; } const added = Math.floor(amount); const balances = getMap('arcanaBalances'); balances[key] = Number(balances[key] || accounts[key].coins || 0) + added; accounts[key].coins = balances[key]; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = balances[key]; localStorage.setItem('arcanaCoins', String(coins)); updateShop(); } ownerResult(`DODANO ${added} MONET GRACZOWI ${accounts[key].nick}`); }
function takeCoins() { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); const amount = Number(ownerUi.coins.value); if (!accounts[key] || !Number.isFinite(amount) || amount < 1) { ownerResult('NIEPRAWIDŁOWY CEL LUB LICZBA'); return; } const balances = getMap('arcanaBalances'); const remaining = Math.max(0, Number(balances[key] ?? accounts[key].coins ?? 0) - Math.floor(amount)); balances[key] = remaining; accounts[key].coins = remaining; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = remaining; localStorage.setItem('arcanaCoins', String(coins)); updateShop(); } ownerResult(`ODJĘTO MONETY GRACZOWI ${accounts[key].nick} // STAN ${remaining}`); }
function resetAccount() { if (!isOwner()) return; const key = ownerTarget(); const accounts = getAccounts(); if (!accounts[key] || OWNER_NICKS.includes(key)) { ownerResult('NIEPRAWIDŁOWY CEL'); return; } const balances = getMap('arcanaBalances'); const owned = getMap('arcanaOwned'); const selected = getMap('arcanaSelectedWizards'); balances[key] = 0; owned[key] = []; selected[key] = 'apprentice'; accounts[key].coins = 0; accounts[key].wizards = []; const emptyValues = { arcanaKeychains: [], arcanaEquipped: [], arcanaKeychainLevels: {}, arcanaDropEnabled: false, arcanaDropCharm: '' }; Object.entries(emptyValues).forEach(([mapName, emptyValue]) => { const data = getMap(mapName); data[key] = emptyValue; saveMap(mapName, data); }); saveMap('arcanaBalances', balances); saveMap('arcanaOwned', owned); saveMap('arcanaSelectedWizards', selected); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = 0; selectedWizard = 'apprentice'; localStorage.setItem('arcanaCoins', '0'); localStorage.setItem('arcanaWizard', selectedWizard); updateShop(); updateBackpack(); updateProfile(); } ownerResult(`ZEROWANO KONTO ${accounts[key].nick} // ZOSTAŁA PODSTAWOWA POSTAĆ`); }
function giveWizard() { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); const id = ownerUi.wizard.value; if (!accounts[key] || (id === 'overlord' && !isOwner())) { ownerResult('TYLKO WŁAŚCICIEL MOŻE NADAĆ WŁADCĘ'); return; } const owned = getMap('arcanaOwned'); owned[key] = Array.from(new Set([...(owned[key] || accounts[key].wizards || []), id])); accounts[key].wizards = owned[key]; saveMap('arcanaOwned', owned); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) updateShop(); ownerResult(`${wizards[id].name} DANY GRACZOWI ${accounts[key].nick}`); }
const ui = { start: document.getElementById('startScreen'), reveal: document.getElementById('revealScreen'), revealName: document.getElementById('revealName'), revealPower: document.getElementById('revealPower'), revealMage: document.getElementById('revealMage'), playerName: document.getElementById('playerName'), logout: document.getElementById('logoutButton'), friendsButton: document.getElementById('friendsButton'), friendsModal: document.getElementById('friendsModal'), friendsClose: document.getElementById('friendsClose'), friendsTab: document.getElementById('friendsTab'), suggestionsTab: document.getElementById('suggestionsTab'), requestsTab: document.getElementById('requestsTab'), friendsView: document.getElementById('friendsView'), suggestionsView: document.getElementById('suggestionsView'), requestsView: document.getElementById('requestsView'), suggestionsList: document.getElementById('suggestionsList'), inviteNick: document.getElementById('inviteNick'), sendInvite: document.getElementById('sendInviteButton'), inviteMessage: document.getElementById('inviteMessage'), friendNick: document.getElementById('friendNick'), addFriend: document.getElementById('addFriendButton'), friendMessage: document.getElementById('friendMessage'), friendsList: document.getElementById('friendsList'), bot: document.getElementById('botButton'), player: document.getElementById('playerButton'), shopButton: document.getElementById('shopButton'), ownedButton: document.getElementById('ownedButton'), shopClose: document.getElementById('shopClose'), detail: document.getElementById('wizardDetail'), wizardName: document.getElementById('wizardName'), wizardPower: document.getElementById('wizardPower'), buy: document.getElementById('buyButton'), use: document.getElementById('useButton'), join: document.getElementById('joinNote'), result: document.getElementById('resultMessage'), coins: document.getElementById('coinsText'), shop: document.getElementById('shop'), score: document.getElementById('scoreText'), mana: document.getElementById('speedText'), manaMeter: document.getElementById('speedMeter'), ward: document.getElementById('altitudeText'), wardMeter: document.getElementById('altitudeMeter'), enemies: document.getElementById('enemiesText'), radar: document.getElementById('radar'), ammo: document.getElementById('ammoRow'), toast: document.getElementById('toast'), status: document.getElementById('statusText'), event: document.getElementById('eventText'), rival: document.getElementById('rivalName') };
const wizards = { apprentice: { name: 'ISKRA', cost: 0, hp: 100, damage: 12, cooldown: .3 }, storm: { name: 'BURZOWY', cost: 180, hp: 90, damage: 10, cooldown: .18 }, guardian: { name: 'STRAŻNIK', cost: 260, hp: 140, damage: 16, cooldown: .38 }, healer: { name: 'UZDROWICIEL', cost: 3000, hp: 110, damage: 11, cooldown: .3, heal: 10, abilityCooldown: 15 }, cloner: { name: 'KLONER', cost: 4000, hp: 100, damage: 12, cooldown: .3, maxClones: 3 }, aegis: { name: 'AEGIS', cost: 3000, hp: 120, damage: 15, cooldown: .3, shield: true }, knight: { name: 'RYCERZ', cost: 3500, hp: 120, damage: 2, cooldown: .3, abilityType: 'sword', abilityDamage: .4, abilityCooldown: 5 }, hercules: { name: 'HERKULES', cost: 10000, hp: 160, damage: 0, cooldown: .3, abilityType: 'stone', abilityDamage: .7, abilityCooldown: 4 }, sprinter: { name: 'SPRINTER', cost: 2000, hp: 100, damage: 12, cooldown: .3, speed: 1.7 }, shieldbearer: { name: 'TARCZOWNIK', cost: 5000, hp: 140, damage: 10, cooldown: .3, reflect: true, abilityCooldown: 10 }, thunder: { name: 'PIORUN', cost: 7500, hp: 110, damage: 12, cooldown: .3, abilityType: 'lightning', abilityDamage: .5, abilityCooldown: 8 }, overlord: { name: 'WŁADCA', cost: 999999999, hp: 1000, damage: 1000, cooldown: .3, shield: true, fullShield: true, invisibility: true, ownerOnly: true } };
const matchCodeInput = document.getElementById('matchCode');
let matchRoomKey = '';
let matchSocket = null, onlineMatch = false, lastNetworkSync = 0;
let coins = Number(localStorage.getItem('arcanaCoins') || 0), selectedWizard = localStorage.getItem('arcanaWizard') || 'apprentice', viewedWizard = 'apprentice';
let W = 0, H = 0, running = false, last = 0, score = 0, mode = 'bot', joined = false, toastClock = 0, ownedOnly = false, deviceMode = '', joystickPointer = null;
let joystickX = 0, joystickY = 0;
const keys = {};
const p1 = { x: 0, y: 0, hp: 100, maxHp: 100, mana: 100, damage: 12, spellCooldown: .3, abilityCooldown: 0, clones: 0, shield: 0, shieldUsed: false, invisible: false, color: '#72e4d0', accent: '#d8fff2', face: 1, cooldown: 0 };
const p2 = { x: 0, y: 0, hp: 100, maxHp: 100, mana: 100, damageReduction: 0, clones: [], color: '#ef7693', accent: '#ffe0e9', face: -1, cooldown: 0 };
let spells = [], particles = [], stars = [], cloneBodies = [];
function resize() { const previousW = W, previousH = H; W = canvas.width = innerWidth * devicePixelRatio; H = canvas.height = innerHeight * devicePixelRatio; canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); W = innerWidth; H = innerHeight; if (previousW && previousH) { [p1, p2, ...cloneBodies, ...spells, ...particles].forEach(item => { if (Number.isFinite(item.x)) item.x *= W / previousW; if (Number.isFinite(item.y)) item.y *= H / previousH; if (Number.isFinite(item.vx)) item.vx *= W / previousW; if (Number.isFinite(item.vy)) item.vy *= H / previousH; }); } stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2, a: .25 + Math.random() * .65 })); }
function reset() { const wizard = wizards[selectedWizard]; score = 0; spells = []; particles = []; cloneBodies = []; p1.x = W * .27; p1.y = H * .59; p1.maxHp = wizard.hp + getHealthBonus(wizard.hp); p1.hp = p1.maxHp; p1.mana = 100; p1.damage = wizard.damage; p1.damageReduction = getDamageReduction(); p1.spellCooldown = wizard.cooldown; p1.abilityCooldown = 0; p1.clones = 0; p1.cooldown = 0; p1.shield = 0; p1.reflectShield = 0; p1.shieldUsed = false; p1.invisible = false; p2.x = W * .73; p2.y = H * .59; p2.maxHp = 100; p2.hp = p2.mana = 100; p2.damageReduction = 0; p2.clones = []; p2.cooldown = 0; updateUI(); }
function getMatchCode() { return matchCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function sendNetwork(message) { if (matchSocket?.readyState === WebSocket.OPEN) matchSocket.send(JSON.stringify(message)); }
function handleNetworkMessage(message) { if (message.type === 'waiting') { ui.join.textContent = `CZEKANIE NA GRACZA // KOD ${message.code}`; return; } if (message.type === 'matched') { onlineMatch = true; joined = true; opponentProfile = message.opponent || {}; mode = 'player'; matchRewardGranted = false; ui.join.textContent = 'PRZECIWNIK ZNALEZIONY // START'; if (!running) startGame('player'); return; } if (message.type === 'state') { p2.x = (1 - message.x) * W; p2.y = message.y * H; p2.hp = message.hp; p2.maxHp = message.maxHp || 100; p2.mana = message.mana; p2.invisible = message.invisible; p2.damageReduction = message.damageReduction || 0; p2.reflectShield = message.reflectShield || 0; p2.clones = (message.clones || []).map(clone => ({ x: (1 - clone.x) * W, y: clone.y * H, slot: clone.slot })); return; } if (message.type === 'spell') { const spell = message.spell; if (p1.reflectShield > 0) { const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x); const reflected = { ...spell, x: p1.x, y: p1.y, vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, life: 1.5, owner: p1 }; spells.push(reflected); sendNetwork({ type: 'reflect', id: spell.id, reflector: currentUser, spell: { ...reflected, x: reflected.x / W, y: reflected.y / H, vx: reflected.vx / W, vy: reflected.vy / H } }); return; } spells.push({ ...spell, x: (1 - spell.x) * W, y: spell.y * H, vx: -spell.vx * W, vy: spell.vy * H, owner: p2 }); return; } if (message.type === 'reflect') { spells.forEach(spell => { if (spell.id === message.id) spell.life = 0; }); const spell = message.spell; spells.push({ ...spell, x: (1 - spell.x) * W, y: spell.y * H, vx: -spell.vx * W, vy: spell.vy * H, owner: message.reflector?.toLowerCase() === currentUser.toLowerCase() ? p1 : p2 }); return; } if (message.type === 'damage') { p1.hp -= message.amount; if (p1.hp <= 0) endGame('GRACZ 2'); return; } if (message.type === 'round-ended') { const won = message.winnerNick?.toLowerCase() === currentUser.toLowerCase(); if (won && !matchRewardGranted && opponentProfile.dropEnabled && keychains[opponentProfile.dropCharm]) { grantKeychain(opponentProfile.dropCharm); matchRewardGranted = true; setToast(`ZDOBYWASZ BRELOCZEK: ${keychains[opponentProfile.dropCharm].name}`); } if (running && !won) { coins = Math.max(0, coins - 50); persistCoins(); ui.result.textContent = 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden'); ui.result.classList.add('loss'); } onlineMatch = false; joined = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'RUNDA ZAKOŃCZONA // DOŁĄCZ PONOWNIE KODEM'; updateDeviceControls(); if (matchSocket) matchSocket.close(); return; } if (message.type === 'opponent-left') { onlineMatch = false; joined = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'PRZECIWNIK OPUŚCIŁ GRĘ'; updateDeviceControls(); setToast('PRZECIWNIK OPUŚCIŁ GRĘ'); } }
function startCodeMatch() { const code = getMatchCode(); if (!code || !currentUser) return; if (getMap('arcanaMatchBlocked')[currentUser.toLowerCase()]) { setToast('DOPASOWANIE ZABLOKOWANE // WYLOGUJ SIĘ POPRAWNIE'); return; } if (matchSocket && matchSocket.readyState === WebSocket.OPEN) { setToast('JUŻ SZUKASZ PRZECIWNIKA'); return; } const protocol = location.protocol === 'https:' ? 'wss' : 'ws'; matchSocket = new WebSocket(`${protocol}://${location.host}`); matchSocket.addEventListener('open', () => sendNetwork({ type: 'join', code, nick: currentUser, profile: getProfileDrop() })); matchSocket.addEventListener('message', event => { try { handleNetworkMessage(JSON.parse(event.data)); } catch { setToast('BŁĄD DANYCH POŁĄCZENIA'); } }); matchSocket.addEventListener('close', () => { matchSocket = null; if (onlineMatch) { onlineMatch = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'POŁĄCZENIE ZERWANE'; } }); mode = 'player'; joined = false; ui.join.textContent = 'ŁĄCZENIE Z SERWEREM...'; }
function syncNetworkState() { const now = performance.now(); if (!onlineMatch || now - lastNetworkSync < 50) return; lastNetworkSync = now; sendNetwork({ type: 'state', x: p1.x / W, y: p1.y / H, hp: p1.hp, maxHp: p1.maxHp, mana: p1.mana, invisible: p1.invisible, damageReduction: p1.damageReduction, reflectShield: p1.reflectShield, clones: cloneBodies.map(clone => ({ x: clone.x / W, y: clone.y / H, slot: clone.slot })) }); }
function startGame(selectedMode) { mode = selectedMode; if (mode === 'player' && !joined) { ui.join.textContent = 'NACISNIJ ENTER, ABY DOLACZYC GRACZEM 2'; return; } reset(); running = false; ui.result.classList.add('hidden'); ui.start.classList.add('hidden'); const wizard = wizards[selectedWizard]; ui.revealName.textContent = wizard.name; ui.revealMage.textContent = wizard.name.slice(0, 1); ui.revealPower.textContent = wizard.abilityType ? `UMIEJĘTNOŚĆ // ${Math.round(wizard.abilityDamage * 100)}% HP // CO ${wizard.abilityCooldown} SEK` : wizard.reflect ? `ODBICIE POCISKÓW // CO ${wizard.abilityCooldown} SEK` : wizard.heal ? `LECZENIE ${wizard.heal} HP // CO ${wizard.abilityCooldown} SEK` : wizard.maxClones ? `MAKSYMALNIE ${wizard.maxClones} KLONÓW` : wizard.shield ? 'TARCZA // REDUKCJA OBRAŻEŃ' : `MOC ZAKLĘCIA // ${wizard.damage} OBRAŻEŃ`; ui.reveal.classList.remove('hidden'); ui.status.textContent = 'PREPARING DUEL'; ui.event.textContent = 'CHOOSE YOUR SPELL'; ui.rival.textContent = mode === 'bot' ? 'THE BOT' : 'PLAYER 2'; setTimeout(() => { ui.reveal.classList.add('hidden'); running = true; updateDeviceControls(); ui.status.textContent = 'DUEL SYSTEMS ACTIVE'; ui.event.textContent = mode === 'bot' ? 'THE BOT HAS ENTERED THE CIRCLE' : 'TWO MAGES // ONE DESTINY'; }, 1800); }
function joinPlayer() { if (mode === 'player' && !joined) { joined = true; ui.join.textContent = 'GRACZ 2 DOLACZYL // NACISNIJ ENTER'; setToast('GRACZ 2 DOLACZYL'); } }
function endGame(winner) { if (!running) return; running = false; const wasOnline = onlineMatch; const playerWon = winner === 'GRACZ 1'; if (wasOnline && playerWon) sendNetwork({ type: 'game-over', winnerNick: currentUser }); if (wasOnline) { onlineMatch = false; joined = false; } if (playerWon) { coins += 100; persistCoins(); setToast('+100 MONET ZA ZWYCIĘSTWO'); } else { coins = Math.max(0, coins - 50); persistCoins(); setToast('-50 MONET ZA PRZEGRANĄ'); } ui.result.textContent = playerWon ? 'WYGRAŁEŚ!' : 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden'); ui.result.classList.toggle('win', playerWon); ui.start.classList.remove('hidden'); ui.join.textContent = wasOnline ? 'RUNDA ZAKOŃCZONA // WPISZ KOD, ABY DOŁĄCZYĆ PONOWNIE' : `${winner} WYGRYWA // WYBIERZ TRYB`; ui.status.textContent = 'DUEL COMPLETE'; updateDeviceControls(); updateShop(); }
function move(m, dx, dy, dt) { const speed = m === p1 ? (wizards[selectedWizard].speed || 1) : 1; m.x = Math.max(40, Math.min(W - 40, m.x + dx * 230 * speed * dt)); m.y = Math.max(H * .24, Math.min(H * .82, m.y + dy * 180 * speed * dt)); }
function cast(owner, target, color) { const melee = owner === p1 && selectedWizard === 'hercules'; if (!running || owner === target || owner.cooldown > 0 || (!melee && owner.mana < 16) || (owner === p1 && p1.damage <= 0 && !melee)) return; const a = Math.atan2(target.y - owner.y, target.x - owner.x); if (melee) { if (Math.hypot(target.x - owner.x, target.y - owner.y) > 92) return; owner.cooldown = p1.spellCooldown; const damage = 15 * (1 - (target === p2 ? (p2.damageReduction || 0) : getDamageReduction())); target.hp -= damage; if (onlineMatch) sendNetwork({ type: 'damage', amount: damage }); burst(target.x, target.y, '#e8c49a', 10); if (target.hp <= 0) endGame('GRACZ 1'); setToast('HERKULES // CIOS PIĘŚCIĄ'); return; } owner.cooldown = owner === p1 ? p1.spellCooldown : .3; owner.mana -= 16; const damage = owner === p1 ? p1.damage * getStrengthMultiplier() : 12; const spell = { id: `${Date.now()}-${Math.random()}`, x: owner.x + Math.cos(a) * 28, y: owner.y + Math.sin(a) * 28, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, life: 1.5, damage, color }; const shieldTarget = target === p1 ? p1.reflectShield > 0 : p2.reflectShield > 0; if (shieldTarget) { const angle = Math.atan2((target === p1 ? p2.y : p1.y) - target.y, (target === p1 ? p2.x : p1.x) - target.x); const reflected = { ...spell, x: target.x, y: target.y, vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, color: target.color, owner: target }; spells.push(reflected); if (onlineMatch && target === p2) sendNetwork({ type: 'reflect', id: spell.id, reflector: opponentProfile.nick, spell: { ...reflected, x: reflected.x / W, y: reflected.y / H, vx: reflected.vx / W, vy: reflected.vy / H } }); return; } spells.push({ ...spell, owner }); if (onlineMatch && owner === p1) sendNetwork({ type: 'spell', spell: { ...spell, x: spell.x / W, y: spell.y / H, vx: spell.vx / W, vy: spell.vy / H } }); burst(owner.x, owner.y, color, 5); }
function useAbility() {
  if (!running) return;
  const wizard = wizards[selectedWizard];
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
      const spell = { id: `${Date.now()}-${Math.random()}`, x: p1.x, y: p1.y, vx: Math.cos(angle) * 380, vy: Math.sin(angle) * 380, life: 2, damage: p2.maxHp * wizard.abilityDamage, color: '#c7a16b' };
      spells.push({ ...spell, owner: p1 });
      if (onlineMatch) sendNetwork({ type: 'spell', spell: { ...spell, x: spell.x / W, y: spell.y / H, vx: spell.vx / W, vy: spell.vy / H } });
      burst(p1.x, p1.y, spell.color, 12);
      setToast('HERKULES // KAMIEŃ RZUCONY');
      return;
    }
    const rawDamage = p2.maxHp * wizard.abilityDamage;
    const damage = rawDamage * (1 - (p2.damageReduction || 0));
    p2.hp -= damage;
    if (onlineMatch) sendNetwork({ type: 'damage', amount: damage });
    burst(p2.x, p2.y, wizard.abilityType === 'sword' ? '#e9e4d5' : '#ffe56b', 16);
    if (p2.hp <= 0) endGame('GRACZ 1');
    setToast(wizard.abilityType === 'sword' ? 'RYCERZ // CIOS MIECZEM' : 'PIORUN // UDERZENIE');
  }
}
function useShield() { if (!running || !wizards[selectedWizard].fullShield || p1.shieldUsed) return; p1.shield = 10; p1.shieldUsed = true; setToast('WŁADCA // TARCZA 100% // 10 SEKUND'); }
function update(dt) {
  if (!running) return;
  move(p1, (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0), dt);
  const time = performance.now() / 1000;
  cloneBodies.forEach(clone => {
    const angle = clone.slot * Math.PI * 2 / 3 + time * .7;
    const targetX = p1.x + Math.cos(angle) * 62;
    const targetY = p1.y + Math.sin(angle) * 38;
    clone.x += (targetX - clone.x) * Math.min(1, dt * 5);
    clone.y += (targetY - clone.y) * Math.min(1, dt * 5);
  });
  if (mode === 'player' && !onlineMatch) move(p2, (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0), (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0), dt);
  else if (!onlineMatch) { move(p2, p1.x > p2.x + 30 ? 1 : p1.x < p2.x - 30 ? -1 : 0, p1.y > p2.y + 25 ? 1 : p1.y < p2.y - 25 ? -1 : 0, dt); if (!p1.invisible && Math.random() < dt * .8) cast(p2, p1, p2.color); }
  p1.cooldown = Math.max(0, p1.cooldown - dt);
  p1.abilityCooldown = Math.max(0, p1.abilityCooldown - dt);
  p2.cooldown = Math.max(0, p2.cooldown - dt);
  p1.shield = Math.max(0, p1.shield - dt);
  p1.reflectShield = Math.max(0, p1.reflectShield - dt);
  p2.reflectShield = Math.max(0, p2.reflectShield - dt);
  p1.mana = Math.min(100, p1.mana + dt * 8);
  p2.mana = Math.min(100, p2.mana + dt * 8);
  if (keys.Space) cast(p1, p2, p1.color);
  if (mode === 'player' && !onlineMatch && (keys.Numpad0 || keys.Digit0)) cast(p2, p1, p2.color);
  spells.forEach(spell => {
    spell.x += spell.vx * dt;
    spell.y += spell.vy * dt;
    spell.life -= dt;
    const target = spell.owner === p1 ? p2 : p1;
    if (spell.life > 0 && Math.hypot(spell.x - target.x, spell.y - target.y) < 36) {
      const reduction = target === p1 ? getDamageReduction() : (target.damageReduction || 0);
      const shieldFactor = target === p1 && p1.shield > 0 ? (wizards[selectedWizard].fullShield ? 0 : .2) : 1;
      const damage = spell.damage * (1 - reduction) * shieldFactor;
      target.hp -= damage;
      if (onlineMatch && target === p1) sendNetwork({ type: 'damage', amount: damage });
      burst(target.x, target.y, spell.color, 12);
      spell.life = 0;
      if (target.hp <= 0) endGame(spell.owner === p1 ? 'GRACZ 1' : mode === 'bot' ? 'BOT' : 'GRACZ 2');
    }
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
function updateShop() { const accounts = getAccounts(); const accountOwned = accounts[currentUser.toLowerCase()]?.wizards || []; const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...accountOwned])); ui.coins.textContent = coins; ui.shop.querySelectorAll('.wizard-card[data-wizard]').forEach(card => { const wizard = wizards[card.dataset.wizard]; if (!wizard) return; const selected = card.dataset.wizard === selectedWizard; const hasWizard = wizard.cost === 0 || owned.includes(card.dataset.wizard); const available = hasWizard || (!wizard.ownerOnly && wizard.cost <= coins) || selected; card.classList.toggle('hidden', ownedOnly && !hasWizard); card.classList.toggle('locked', !available); card.classList.toggle('selected', selected); card.querySelector('span').textContent = selected ? 'WYBRANY' : wizard.ownerOnly && !hasWizard ? 'TYLKO WŁAŚCICIEL' : hasWizard ? 'POSIADANY' : wizard.cost === 0 ? 'DARMOWY' : `${wizard.cost} MONET // KUP`; }); }
function escapeHtml(value) { return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function updateFriends() { const key = currentUser.toLowerCase(); const friends = getMap('arcanaFriends')[key] || []; const requests = getMap('arcanaFriendRequests')[key] || []; ui.friendsList.innerHTML = friends.length ? friends.map(nick => `<div class="friend-item">${escapeHtml(nick)}</div>`).join('') : '<div class="friends-empty">BRAK ZNAJOMYCH</div>'; ui.suggestionsList.innerHTML = requests.length ? requests.map(nick => `<div class="friend-item friend-request"><span>${escapeHtml(nick)}</span><span class="friend-request-actions"><button type="button" data-accept="${encodeURIComponent(nick)}">✓</button><button type="button" data-reject="${encodeURIComponent(nick)}">X</button></span></div>`).join('') : '<div class="friends-empty">BRAK ZAPROSZEŃ</div>'; }
function setFriendsTab(tab) { const tabs = { friends: [ui.friendsTab, ui.friendsView], suggestions: [ui.suggestionsTab, ui.suggestionsView], requests: [ui.requestsTab, ui.requestsView] }; Object.entries(tabs).forEach(([name, [button, view]]) => { button.classList.toggle('active', name === tab); view.classList.toggle('hidden', name !== tab); }); }
function sendFriendInvite() { const nick = ui.inviteNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); ui.inviteMessage.textContent = ''; if (!accounts[key]) { ui.inviteMessage.textContent = 'NIE ZNALEZIONO TAKIEGO GRACZA'; return; } if (key === currentUser.toLowerCase()) { ui.inviteMessage.textContent = 'NIE MOŻESZ ZAPROSIĆ SIEBIE'; return; } const friendsMap = getMap('arcanaFriends'); const friends = friendsMap[currentUser.toLowerCase()] || []; if (friends.some(friend => friend.toLowerCase() === key)) { ui.inviteMessage.textContent = 'TEN GRACZ JUŻ JEST ZNAJOMYM'; return; } const requestsMap = getMap('arcanaFriendRequests'); const requests = requestsMap[key] || []; if (requests.some(request => request.toLowerCase() === currentUser.toLowerCase())) { ui.inviteMessage.textContent = 'ZAPROSZENIE JUŻ WYSŁANE'; return; } requests.push(currentUser); requestsMap[key] = requests; saveMap('arcanaFriendRequests', requestsMap); ui.inviteNick.value = ''; ui.inviteMessage.textContent = 'ZAPROSZENIE WYSŁANE'; }
function respondToFriendInvite(nick, accepted) { const key = currentUser.toLowerCase(); const requestsMap = getMap('arcanaFriendRequests'); const requests = requestsMap[key] || []; const index = requests.findIndex(request => request.toLowerCase() === nick.toLowerCase()); if (index < 0) return; const sender = requests[index]; requests.splice(index, 1); requestsMap[key] = requests; saveMap('arcanaFriendRequests', requestsMap); if (accepted) { const friendsMap = getMap('arcanaFriends'); const ownFriends = friendsMap[key] || []; const senderKey = sender.toLowerCase(); const senderFriends = friendsMap[senderKey] || []; if (!ownFriends.some(friend => friend.toLowerCase() === senderKey)) ownFriends.push(sender); if (!senderFriends.some(friend => friend.toLowerCase() === key)) senderFriends.push(currentUser); friendsMap[key] = ownFriends; friendsMap[senderKey] = senderFriends; saveMap('arcanaFriends', friendsMap); } updateFriends(); }
function openWizard(id) { viewedWizard = id; const wizard = wizards[id]; const accounts = getAccounts(); const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...(accounts[currentUser.toLowerCase()]?.wizards || [])])); const hasWizard = wizard.cost === 0 || owned.includes(id); const power = wizard.abilityType ? `Gadżet: ${Math.round(wizard.abilityDamage * 100)}% HP, co ${wizard.abilityCooldown} s` : wizard.reflect ? `Gadżet: odbijanie pocisków, co ${wizard.abilityCooldown} s` : wizard.speed ? `Szybkość ruchu: ${wizard.speed}x` : wizard.maxClones ? `Moc: TWORZENIE KLONÓW, MAKSYMALNIE ${wizard.maxClones}` : wizard.heal ? `Moc: LECZENIE ${wizard.heal} HP, ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.ownerOnly ? 'Moc: NIEWIDZIALNOŚĆ + TARCZA 100%' : wizard.shield ? 'Moc: TARCZA, REDUKUJE OBRAŻENIA' : `Moc zaklęcia: ${wizard.damage}`; ui.wizardName.textContent = wizard.name; ui.wizardPower.textContent = `${power} | ${wizard.damage} OBRAŻEŃ | ${wizard.hp} HP | Cena: ${wizard.ownerOnly ? 'TYLKO WŁAŚCICIEL' : wizard.cost === 0 ? 'darmowy' : wizard.cost + ' monet'}`; ui.buy.textContent = hasWizard ? 'POSIADANY' : 'KUP'; ui.buy.disabled = hasWizard; ui.use.disabled = !hasWizard || id === selectedWizard; ui.detail.classList.remove('hidden'); }
function closeWizard() { ui.detail.classList.add('hidden'); }
function removeWizard() { selectedWizard = 'apprentice'; localStorage.setItem('arcanaWizard', selectedWizard); const selected = getMap('arcanaSelectedWizards'); selected[currentUser.toLowerCase()] = selectedWizard; saveMap('arcanaSelectedWizards', selected); updateShop(); setToast('CZARODZIEJ ZDJĘTY'); }
function buyWizard(id) { const wizard = wizards[id]; const owned = getMap('arcanaOwned'); const accounts = getAccounts(); const playerOwned = Array.from(new Set([...(owned[currentUser.toLowerCase()] || []), ...(accounts[currentUser.toLowerCase()]?.wizards || [])])); if (wizard.ownerOnly && !isOwner() && !playerOwned.includes(id)) { setToast('WŁADCĘ MOŻE NADAĆ TYLKO TEST123'); return; } if (playerOwned.includes(id) || wizard.cost === 0) return; if (coins < wizard.cost) { setToast('NIE STAĆ CIĘ'); return; } coins -= wizard.cost; playerOwned.push(id); owned[currentUser.toLowerCase()] = playerOwned; accounts[currentUser.toLowerCase()].wizards = playerOwned; saveMap('arcanaOwned', owned); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); persistCoins(); setToast(`${wizard.name} KUPIONY // DODANO DO POSIADANYCH`); updateShop(); openWizard(id); }
function useWizard(id) { const wizard = wizards[id]; const accounts = getAccounts(); const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...(accounts[currentUser.toLowerCase()]?.wizards || [])])); if (wizard.cost > 0 && !owned.includes(id)) return; selectedWizard = id; localStorage.setItem('arcanaWizard', selectedWizard); const selected = getMap('arcanaSelectedWizards'); selected[currentUser.toLowerCase()] = id; saveMap('arcanaSelectedWizards', selected); updateShop(); openWizard(id); setToast(`${wizard.name} UŻYWANY`); }
function updateUI() { const playerHp = Math.max(0, p1.hp / p1.maxHp * 100); const rivalHp = Math.max(0, p2.hp / p2.maxHp * 100); ui.score.textContent = String(score).padStart(6, '0'); ui.mana.textContent = Math.round(p1.mana); ui.manaMeter.style.width = `${p1.mana}%`; ui.ward.textContent = Math.round(playerHp); ui.wardMeter.style.width = `${playerHp}%`; ui.enemies.textContent = `${mode === 'player' ? 'MAGE 2' : 'BOT'} WARD ${Math.round(rivalHp)}%`; ui.radar.innerHTML = `<i class="radar-contact" style="left:${50 + (p2.x - p1.x) / W * 100}%;top:${50 + (p2.y - p1.y) / H * 100}%"></i>`; ui.ammo.innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="ammo ${i >= Math.floor(p1.mana / 16) ? 'empty' : ''}"></i>`).join(''); if (toastClock <= 0) ui.toast.classList.remove('show'); }
function draw() {
  const bg = ctx.createRadialGradient(W * .5, H * .45, 20, W * .5, H * .5, Math.max(W, H) * .7);
  bg.addColorStop(0, '#4a3164'); bg.addColorStop(.5, '#1d294b'); bg.addColorStop(1, '#0a1227');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  stars.forEach(star => { ctx.globalAlpha = star.a; ctx.fillStyle = '#f9ddb0'; ctx.fillRect(star.x, star.y, star.r, star.r); });
  ctx.globalAlpha = 1; ctx.save(); ctx.translate(W / 2, H * .62); ctx.strokeStyle = 'rgba(241,195,120,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, Math.min(W * .37, 450), Math.min(H * .16, 125), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  spells.forEach(spell => { ctx.save(); ctx.shadowColor = spell.color; ctx.shadowBlur = 18; ctx.fillStyle = spell.color; ctx.beginPath(); ctx.arc(spell.x, spell.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
  particles.forEach(particle => { ctx.globalAlpha = Math.max(0, particle.life * 1.8); ctx.fillStyle = particle.color; ctx.fillRect(particle.x, particle.y, particle.size, particle.size); });
  ctx.globalAlpha = 1;
  const playerLabel = currentUser || 'GRACZ 1'; const rivalLabel = mode === 'bot' ? 'BOT' : (opponentProfile.nick || 'GRACZ 2');
  drawMage(p1, playerLabel);
  cloneBodies.forEach(clone => drawMage({ ...p1, x: clone.x, y: clone.y }, `${playerLabel} // KLON`));
  p2.clones.forEach(clone => drawMage({ ...p2, x: clone.x, y: clone.y }, `${rivalLabel} // KLON`));
  drawMage(p2, rivalLabel);
}
function drawMage(m, label) {
  if (m.invisible) return;
  ctx.save(); ctx.translate(m.x, m.y);
  const reflectTime = m === p1 ? p1.reflectShield : m === p2 ? p2.reflectShield : 0;
  const shieldTime = m === p1 ? p1.shield : 0;
  if (reflectTime > 0 || shieldTime > 0) {
    ctx.strokeStyle = reflectTime > 0 ? `rgba(255,190,86,${.5 + Math.sin(performance.now() / 120) * .18})` : `rgba(114,228,208,${.45 + Math.sin(performance.now() / 120) * .15})`;
    ctx.lineWidth = 4; ctx.shadowColor = reflectTime > 0 ? '#ffbe56' : '#72e4d0'; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(0, 0, 68, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.shadowColor = m.color; ctx.shadowBlur = 16; ctx.fillStyle = m.color; ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(28, 4); ctx.lineTo(22, 34); ctx.lineTo(0, 48); ctx.lineTo(-22, 34); ctx.lineTo(-28, 4); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#211934'; ctx.beginPath(); ctx.arc(0, -23, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = m.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.face * 18, 13); ctx.lineTo(m.face * 42, -18); ctx.stroke();
  ctx.fillStyle = m.accent; ctx.font = '700 11px Space Grotesk'; ctx.textAlign = 'center'; ctx.fillText(label, 0, 67); ctx.restore();
}
function updateDeviceControls() { document.getElementById('touchControls').classList.toggle('hidden', deviceMode !== 'mobile' || !running); document.getElementById('touchCast').textContent = selectedWizard === 'hercules' ? 'PIĘŚĆ' : 'STRZAŁ'; }
function resetJoystick() { joystickX = 0; joystickY = 0; keys.KeyW = keys.KeyA = keys.KeyS = keys.KeyD = false; document.getElementById('joystickKnob').style.transform = 'translate(-50%, -50%)'; }
function moveJoystick(event) { const joystick = document.getElementById('joystick'); const rect = joystick.getBoundingClientRect(); const dx = event.clientX - (rect.left + rect.width / 2); const dy = event.clientY - (rect.top + rect.height / 2); const radius = rect.width * .34; const distance = Math.hypot(dx, dy); const scale = distance > radius ? radius / distance : 1; joystickX = dx * scale / radius; joystickY = dy * scale / radius; document.getElementById('joystickKnob').style.transform = `translate(calc(-50% + ${joystickX * radius}px), calc(-50% + ${joystickY * radius}px))`; keys.KeyA = joystickX < -.2; keys.KeyD = joystickX > .2; keys.KeyW = joystickY < -.2; keys.KeyS = joystickY > .2; }
function chooseDevice(device) { deviceMode = device; localStorage.setItem('arcanaDevice', device); document.getElementById('deviceScreen').classList.add('hidden'); updateDeviceControls(); }
function frame(t) { const dt = Math.min(.035, (t - last) / 1000 || 0); last = t; update(dt); draw(); requestAnimationFrame(frame); }
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
profileUi.button.addEventListener('click', openProfile);
profileUi.close.addEventListener('click', () => profileUi.modal.classList.add('hidden'));
profileUi.clear.addEventListener('click', () => profileUi.editor.getContext('2d').clearRect(0, 0, profileUi.editor.width, profileUi.editor.height));
profileUi.save.addEventListener('click', saveAvatar);
profileUi.dropEnabled.addEventListener('change', () => { const map = getMap('arcanaDropEnabled'); map[currentUser.toLowerCase()] = profileUi.dropEnabled.checked; saveMap('arcanaDropEnabled', map); });
profileUi.dropCharm.addEventListener('change', () => { const map = getMap('arcanaDropCharm'); map[currentUser.toLowerCase()] = profileUi.dropCharm.value; saveMap('arcanaDropCharm', map); });
profileUi.editor.addEventListener('pointerdown', event => { avatarDrawing = true; profileUi.editor.setPointerCapture(event.pointerId); const rect = profileUi.editor.getBoundingClientRect(); const context = profileUi.editor.getContext('2d'); context.beginPath(); context.moveTo((event.clientX - rect.left) * profileUi.editor.width / rect.width, (event.clientY - rect.top) * profileUi.editor.height / rect.height); });
profileUi.editor.addEventListener('pointermove', event => { if (!avatarDrawing) return; const rect = profileUi.editor.getBoundingClientRect(); const context = profileUi.editor.getContext('2d'); context.strokeStyle = '#73e1dd'; context.lineWidth = 12; context.lineCap = 'round'; context.lineJoin = 'round'; context.lineTo((event.clientX - rect.left) * profileUi.editor.width / rect.width, (event.clientY - rect.top) * profileUi.editor.height / rect.height); context.stroke(); });
profileUi.editor.addEventListener('pointerup', () => { avatarDrawing = false; });
profileUi.editor.addEventListener('pointercancel', () => { avatarDrawing = false; });
keychainCollection.addEventListener('click', event => { const equip = event.target.closest('[data-equip]'); const combine = event.target.closest('[data-combine]'); if (equip) toggleKeychain(equip.dataset.equip); if (combine) combineKeychain(combine.dataset.combine); });
ownerUi.takeCoins.addEventListener('click', takeCoins);
ownerUi.resetAccount.addEventListener('click', resetAccount);
addEventListener('resize', resize); addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); if (e.code === 'KeyE') useAbility(); if (e.code === 'KeyQ') useShield(); if (e.code === 'Enter') { joinPlayer(); if (!running && joined && mode === 'player') startGame('player'); } if (e.code === 'KeyR' && running) startGame(mode); }); addEventListener('keyup', e => { keys[e.code] = false; }); ui.bot.addEventListener('click', () => startGame('bot')); ui.player.addEventListener('click', () => startGame('player')); ui.shopButton.addEventListener('click', () => { ownedOnly = false; ui.shop.classList.remove('hidden'); closeWizard(); updateShop(); }); ui.ownedButton.addEventListener('click', () => { ownedOnly = true; ui.shop.classList.remove('hidden'); closeWizard(); updateShop(); }); ui.shopClose.addEventListener('click', () => { ownedOnly = false; ui.shop.classList.add('hidden'); }); ui.shop.querySelectorAll('.wizard-card').forEach(card => card.addEventListener('click', () => openWizard(card.dataset.wizard))); document.getElementById('exitButton').addEventListener('click', closeWizard); ui.buy.addEventListener('click', () => buyWizard(viewedWizard)); ui.use.addEventListener('click', () => useWizard(viewedWizard)); resize(); reset(); updateShop(); requestAnimationFrame(frame);
auth.registerTab.addEventListener('click', () => showAuthForm('register')); auth.loginTab.addEventListener('click', () => showAuthForm('login')); auth.registerForm.addEventListener('submit', registerAccount); auth.loginForm.addEventListener('submit', loginAccount); ui.logout.addEventListener('click', logoutAccount); ownerUi.toggle.addEventListener('click', () => toggleOwnerPanel()); ownerUi.addAdmin.addEventListener('click', addAdmin); ownerUi.ban.addEventListener('click', () => changeBan(true)); ownerUi.unban.addEventListener('click', () => changeBan(false)); ownerUi.giveCoins.addEventListener('click', giveCoins); ownerUi.giveWizard.addEventListener('click', giveWizard); ui.friendsButton.addEventListener('click', () => { setFriendsTab('friends'); ui.friendsModal.classList.remove('hidden'); ui.inviteMessage.textContent = ''; updateFriends(); }); ui.friendsTab.addEventListener('click', () => setFriendsTab('friends')); ui.requestsTab.addEventListener('click', () => setFriendsTab('requests')); ui.suggestionsTab.addEventListener('click', () => setFriendsTab('suggestions')); ui.friendsClose.addEventListener('click', () => ui.friendsModal.classList.add('hidden')); ui.sendInvite.addEventListener('click', sendFriendInvite); ui.suggestionsList.addEventListener('click', event => { const accept = event.target.closest('[data-accept]'); const reject = event.target.closest('[data-reject]'); if (accept) respondToFriendInvite(decodeURIComponent(accept.dataset.accept), true); if (reject) respondToFriendInvite(decodeURIComponent(reject.dataset.reject), false); }); addEventListener('beforeunload', applyInactivePenalty); ensureOwnerAccount(); showAuthForm('register');
