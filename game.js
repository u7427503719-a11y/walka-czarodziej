addEventListener('storage', event => { if (!matchRoomKey || event.key !== matchRoomKey || !event.newValue) return; const room = JSON.parse(event.newValue); if (room.started && room.players.length === 2 && !running) { joined = true; mode = 'player'; ui.join.textContent = 'PRZECIWNIK ZNALEZIONY // START'; startGame('player'); } });
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
  if (event.target.closest('#dailyMissionButton')) { careerUi.chestModal.classList.remove('hidden'); careerUi.chestResult.textContent = ''; refreshCareer(); }
  if (event.target.closest('#dailyBoxOpenButton')) openDailyBox();
  if (event.target.closest('#leaderboardButton')) openLeaderboard();
  if (event.target.closest('#leaderboardClose')) careerUi.leaderboardModal.classList.add('hidden');
  const chest = event.target.closest('[data-chest]');
  if (chest) openChest(chest.dataset.chest);
});
const auth = { screen: document.getElementById('authScreen'), registerTab: document.getElementById('registerTab'), loginTab: document.getElementById('loginTab'), registerForm: document.getElementById('registerForm'), loginForm: document.getElementById('loginForm'), registerNick: document.getElementById('registerNick'), registerPassword: document.getElementById('registerPassword'), registerNickError: document.getElementById('registerNickError'), loginNick: document.getElementById('loginNick'), loginPassword: document.getElementById('loginPassword'), loginError: document.getElementById('loginError') };
const ownerUi = { panel: document.getElementById('ownerPanel'), panelBody: document.getElementById('ownerPanelBody'), toggle: document.getElementById('ownerToggleButton'), target: document.getElementById('ownerTarget'), coins: document.getElementById('ownerCoins'), wizard: document.getElementById('ownerWizard'), message: document.getElementById('ownerMessage'), addAdmin: document.getElementById('addAdminButton'), ban: document.getElementById('banButton'), unban: document.getElementById('unbanButton'), giveCoins: document.getElementById('giveCoinsButton'), takeCoins: document.getElementById('takeCoinsButton'), resetAccount: document.getElementById('resetAccountButton'), giveWizard: document.getElementById('giveWizardButton') };
const profileUi = { button: document.getElementById('profileButton'), avatar: document.getElementById('profileAvatar'), modal: document.getElementById('profileModal'), close: document.getElementById('profileClose'), name: document.getElementById('profileName'), editor: document.getElementById('avatarDrawCanvas'), clear: document.getElementById('avatarClear'), save: document.getElementById('avatarSave'), dropEnabled: document.getElementById('dropEnabled'), dropCharm: document.getElementById('dropKeychain'), title: document.getElementById('titleSelect'), showNick: document.getElementById('showNickChange'), showPassword: document.getElementById('showPasswordChange'), nickForm: document.getElementById('nickChangeForm'), passwordForm: document.getElementById('passwordChangeForm') };
const accountUi = { list: document.getElementById('profileAccountList'), details: document.getElementById('accountDetails'), name: document.getElementById('accountStatsName'), coins: document.getElementById('accountStatsCoins'), characters: document.getElementById('accountCharacters'), delete: document.getElementById('deleteAccountButton'), confirm: document.getElementById('confirmDeleteModal'), confirmYes: document.getElementById('confirmDeleteYes'), confirmNo: document.getElementById('confirmDeleteNo') };
const newsUi = { button: document.getElementById('newsButton'), modal: document.getElementById('newsModal'), close: document.getElementById('newsClose'), lists: { new: document.getElementById('newNewsList'), changed: document.getElementById('changedNewsList'), removed: document.getElementById('removedNewsList') }, music: document.getElementById('musicButton') };
const careerUi = { dailyButton: document.getElementById('dailyMissionButton'), dailyBadge: document.getElementById('dailyMissionBadge'), dailyProgress: document.getElementById('dailyMissionProgress'), boxCount: document.getElementById('dailyBoxCount'), boxButton: document.getElementById('dailyBoxOpenButton'), chestModal: document.getElementById('chestModal'), chestResult: document.getElementById('chestResult'), leaderboardButton: document.getElementById('leaderboardButton'), leaderboardModal: document.getElementById('leaderboardModal'), leaderboardClose: document.getElementById('leaderboardClose'), leaderboardTitle: document.getElementById('leaderboardTitle'), leaderboardList: document.getElementById('leaderboardList'), leaderboardStatus: document.getElementById('leaderboardStatus') };
let careerProgress = { month: '', wins: 0, boxes: 0, opening: false };
const chatUi = { button: document.getElementById('chatButton'), modal: document.getElementById('chatModal'), close: document.getElementById('chatClose'), form: document.getElementById('chatForm'), input: document.getElementById('chatInput'), bubble: document.getElementById('chatBubble') };
const tradeUi = { requestModal: document.getElementById('tradeRequestModal'), requestText: document.getElementById('tradeRequestText'), accept: document.getElementById('tradeAccept'), reject: document.getElementById('tradeReject'), modal: document.getElementById('tradeModal'), close: document.getElementById('tradeClose'), cancel: document.getElementById('tradeCancel'), confirm: document.getElementById('tradeConfirm'), partnerName: document.getElementById('tradePartnerName'), ownItems: document.getElementById('tradeOwnItems'), partnerItems: document.getElementById('tradePartnerItems'), ownCoins: document.getElementById('tradeOwnCoins'), partnerCoins: document.getElementById('tradePartnerCoins'), status: document.getElementById('tradeStatus') };
const OWNER_NICK = 'adam2właściciel';
const OWNER_PASSWORD = 'admin123';
const OWNER_NICKS = [OWNER_NICK];
let currentUser = '';
let logoutIntentional = false, opponentProfile = {}, matchRewardGranted = false, matchWinRecorded = false, avatarDrawing = false, accountPendingDelete = '';
function toggleOwnerPanel(forceCollapse) {
  const collapsed = typeof forceCollapse === 'boolean' ? forceCollapse : !ownerUi.panel.classList.contains('collapsed');
  ownerUi.panel.classList.toggle('collapsed', collapsed);
  ownerUi.toggle.textContent = collapsed ? 'ROZWIŃ' : 'ZWIŃ';
}
function getAccounts() { return JSON.parse(localStorage.getItem('arcanaAccounts') || '{}'); }
async function authRequest(action, data) { let response; try { response = await fetch(`/api/auth/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch { throw new Error('BRAK POŁĄCZENIA Z SERWEREM // OTWÓRZ GRĘ Z ADRESU KOMPUTERA'); } let result; try { result = await response.json(); } catch { throw new Error('NIEPRAWIDŁOWA ODPOWIEDŹ SERWERA'); } if (!response.ok) throw new Error(result.error || 'BŁĄD LOGOWANIA'); return result.account; }
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
    if (!accounts[key].serverSynced && (!accounts[key].password || accounts[key].password === accounts[key].nick)) {
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
  const equipped = getMap('arcanaEquipped');
  Object.keys(accounts).forEach(accountKey => {
    const account = accounts[accountKey];
    const allowedSpecial = accountKey === key ? ['owner-charm'] : account?.role === 'admin' ? ['admin-charm'] : [];
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
const chests = {
  hats: { rewards: [{ id: 'strength-hat', chance: .01 }, { id: 'guard-hat', chance: .49 }, { id: 'light-hat', chance: .50 }] },
  keychains: { rewards: [{ id: 'strength-charm', chance: .12 }, { id: 'damage-charm', chance: .38 }, { id: 'vitality-charm', chance: .25 }, { id: 'life-charm', chance: .15 }, { id: 'ward-charm', chance: .10 }] }
};
const keychains = { 'strength-charm': { name: 'TALIZMAN SIŁY', rarity: 'LEGENDARNY', damageMultiplier: 1.2 }, 'damage-charm': { name: 'BRELOK MOCY', rarity: 'NIEZWYKŁY', damageMultiplier: 1.005 }, 'vitality-charm': { name: 'SERCE ARENY', rarity: 'RZADKI', healthPercent: .1 }, 'life-charm': { name: 'KAMIEŃ ŻYCIA', rarity: 'NIEZWYKŁY', healthBonus: 10 }, 'ward-charm': { name: 'RUNICZNA OSŁONA', rarity: 'RZADKI', damageReduction: .1 }, 'owner-charm': { name: 'ZNAK WŁAŚCICIELA', rarity: 'MITYCZNY', damageMultiplier: 1.2, damageReduction: .15 }, 'admin-charm': { name: 'ODZNAKA ADMINA', rarity: 'EPICKI', damageMultiplier: 1.07, damageReduction: .1 } };
const hats = { 'strength-hat': { name: 'KAPELUSZ MOCY', rarity: 'LEGENDARNY', damageMultiplier: 1.05, symbol: '♛' }, 'guard-hat': { name: 'KAPELUSZ STRAŻNIKA', rarity: 'RZADKI', damageReduction: .05, symbol: '◆' }, 'light-hat': { name: 'LEKKA OSŁONA', rarity: 'NIEZWYKŁY', damageReduction: .025, symbol: '◇' } };
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
function updateBackpack() { const owned = getKeychains().filter(id => keychains[id]); const equipped = getEquippedKeychains(); const ownedHats = getHatInventory().filter(id => hats[id]); const equippedHat = getEquippedHat(); const empty = document.querySelector('.backpack-empty'); empty.classList.toggle('hidden', owned.length + ownedHats.length > 0); keychainCollection.classList.toggle('hidden', owned.length === 0); keychainCollection.innerHTML = owned.map(id => { const level = getKeychainLevel(id); const copies = owned.filter(item => item === id).length; return `<div class="keychain-card"><b>${keychains[id].name}</b><span>${keychains[id].rarity} // POZIOM ${level}/2</span><span>${equipped.includes(id) ? 'ZAŁOŻONY' : ''} ${copies} SZT.</span><div class="keychain-actions"><button type="button" data-equip="${id}">${equipped.includes(id) ? 'ZDEJMIJ' : 'ZAŁÓŻ'}</button><button type="button" data-combine="${id}" ${level >= 2 || copies <= level + 1 ? 'disabled' : ''}>POŁĄCZ</button></div></div>`; }).join(''); const hatCollection = document.getElementById('hatCollection'); hatCollection.classList.toggle('hidden', ownedHats.length === 0); hatCollection.innerHTML = [...new Set(ownedHats)].map(id => { const copies = ownedHats.filter(item => item === id).length; const level = getHatLevel(id); return `<div class="keychain-card"><b>${hats[id].name}</b><span>${hats[id].rarity} // POZIOM ${level}/2</span><span>${equippedHat === id ? 'ZAŁOŻONY' : ''} ${copies} SZT.</span><div class="keychain-actions"><button type="button" data-hat-equip="${id}">${equippedHat === id ? 'ZDEJMIJ' : 'ZAŁÓŻ'}</button><button type="button" data-hat-combine="${id}" ${level >= 2 || copies <= level + 1 ? 'disabled' : ''}>POŁĄCZ</button></div></div>`; }).join(''); }
function openChest(id) { const chest = chests[id]; if (!chest || !currentUser) return; const roll = Math.random(); let total = 0; const reward = chest.rewards.find(item => { total += item.chance; return roll < total; })?.id; if (!reward) return; if (hats[reward]) { const inventory = getMap('arcanaHats'); inventory[currentUser.toLowerCase()] = [...(inventory[currentUser.toLowerCase()] || []), reward]; saveMap('arcanaHats', inventory); updateBackpack(); chestResult.textContent = `${hats[reward].name} DODANY DO PLECAKA`; } else { grantKeychain(reward); chestResult.textContent = `${keychains[reward].name} DODANY DO PLECAKA`; } }
function updateCareerUI() { careerUi.dailyProgress.textContent = `WYGRANE DZISIAJ: ${careerProgress.wins}/5`; careerUi.boxCount.textContent = `DOSTĘPNE SKRZYNIE: ${careerProgress.boxes}/5`; careerUi.dailyBadge.textContent = `${careerProgress.wins}/5`; careerUi.boxButton.disabled = careerProgress.boxes < 1 || careerProgress.opening; careerUi.boxButton.textContent = careerProgress.opening ? 'OTWIERANIE...' : 'OTWÓRZ SKRZYNIĘ DZIENNĄ'; }
function refreshCareer() { if (!currentUser) return; connectMatchSocket(() => sendNetwork({ type: 'career-get' })); }
function openDailyBox() { if (!currentUser || careerProgress.boxes < 1 || careerProgress.opening) return; careerProgress.opening = true; updateCareerUI(); connectMatchSocket(() => sendNetwork({ type: 'daily-box-open' })); }
function openLeaderboard() { careerUi.leaderboardModal.classList.remove('hidden'); careerUi.leaderboardStatus.textContent = 'ŁADOWANIE RANKINGU...'; refreshCareer(); }
function applyCareerState(message) {
  careerProgress = { month: message.month || '', wins: Number(message.dailyWins) || 0, boxes: Number(message.dailyBoxes) || 0, opening: false };
  careerUi.leaderboardTitle.textContent = `RANKING // ${careerProgress.month}`;
  careerUi.leaderboardList.innerHTML = message.standings?.length ? message.standings.map(entry => `<li><span>${escapeHtml(String(entry.nick || 'GRACZ'))}</span><strong>${Number(entry.wins) || 0} WYGR.</strong></li>`).join('') : '<li>BRAK WYNIKÓW W TYM MIESIĄCU</li>';
  const ownStanding = message.standings?.find(entry => entry.nick?.toLowerCase() === currentUser.toLowerCase());
  careerUi.leaderboardStatus.textContent = ownStanding ? `TWOJE MIEJSCE: ${ownStanding.place} // ${ownStanding.wins} WYGRANYCH` : 'WYGRYWAJ POJEDYNKI, ABY WEJŚĆ DO TOP 10';
  (message.limitedRewards || []).forEach(grantLimitedWizard);
  if (message.limitedRewards?.length) updateShop();
  updateCareerUI();
}
function applyDailyBoxReward(reward) {
  coins += Number(reward.coins) || 0;
  persistCoins();
  if (reward.kind === 'keychain' && keychains[reward.itemId]) grantKeychain(reward.itemId);
  else if (reward.kind === 'hat' && hats[reward.itemId]) { const inventory = getMap('arcanaHats'); inventory[currentUser.toLowerCase()] = [...(inventory[currentUser.toLowerCase()] || []), reward.itemId]; saveMap('arcanaHats', inventory); updateBackpack(); }
  const itemName = reward.kind === 'keychain' ? keychains[reward.itemId]?.name : hats[reward.itemId]?.name;
  careerUi.chestResult.textContent = `+${Number(reward.coins) || 0} MONET${itemName ? ` // ${itemName} DODANY DO PLECAKA` : ''}`;
  updateShop();
}
function drawAvatar(canvas, imageData, nick) { const context = canvas.getContext('2d'); context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = '#15323a'; context.fillRect(0, 0, canvas.width, canvas.height); if (imageData) { const image = new Image(); image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height); image.src = imageData; } else { context.fillStyle = '#73e1dd'; context.font = `700 ${canvas.width * .44}px Space Grotesk`; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText((nick || '?').slice(0, 1).toUpperCase(), canvas.width / 2, canvas.height / 2); } }
function updateTitleChoices() { const wins = getMap('arcanaWizardWins')[currentUser.toLowerCase()] || {}; const selected = getMap('arcanaSelectedTitle')[currentUser.toLowerCase()] || ''; const earned = Object.keys(wins).filter(id => wins[id] >= 500 && wizards[id]); profileUi.title.innerHTML = '<option value="">BRAK TYTUŁU</option>' + earned.map(id => `<option value="${id}">${wizardTitles[id]}</option>`).join(''); profileUi.title.value = earned.includes(selected) ? selected : ''; }
function updateProfile() { if (!currentUser) return; const key = currentUser.toLowerCase(); const equipped = getEquippedKeychains(); const dropMap = getMap('arcanaDropCharm'); const previous = dropMap[key]; profileUi.dropCharm.innerHTML = equipped.length ? equipped.map(id => `<option value="${id}">${keychains[id].name}</option>`).join('') : '<option value="">BRAK ZAŁOŻONYCH BRELOCZKÓW</option>'; profileUi.dropCharm.disabled = equipped.length === 0; profileUi.dropCharm.value = equipped.includes(previous) ? previous : (equipped[0] || ''); if (equipped.length && !equipped.includes(previous)) { dropMap[key] = equipped[0]; saveMap('arcanaDropCharm', dropMap); } profileUi.dropEnabled.checked = Boolean(getMap('arcanaDropEnabled')[key]); profileUi.dropEnabled.disabled = equipped.length === 0; updateTitleChoices(); }
function openProfile() { const key = currentUser.toLowerCase(); profileUi.name.textContent = getAccounts()[key]?.nick || currentUser; profileUi.modal.classList.remove('hidden'); updateProfile(); updateAccountDirectory(); const avatar = getMap('arcanaAvatars')[key] || ''; drawAvatar(profileUi.avatar, avatar, currentUser); drawAvatar(profileUi.editor, avatar, currentUser); }
function recordWizardWin() { if (matchWinRecorded || !currentUser) return; matchWinRecorded = true; const key = currentUser.toLowerCase(); const wins = getMap('arcanaWizardWins'); wins[key] ||= {}; const previous = Number(wins[key][selectedWizard] || 0); wins[key][selectedWizard] = previous + 1; saveMap('arcanaWizardWins', wins); if (previous < 500 && wins[key][selectedWizard] >= 500) setToast(`TYTUŁ ODBLOKOWANY: ${wizardTitles[selectedWizard]}`); updateTitleChoices(); connectMatchSocket(() => sendNetwork({ type: 'career-win' })); }
function moveAccountData(oldNick, newNick) { const oldKey = oldNick.toLowerCase(); const newKey = newNick.toLowerCase(); const accounts = getAccounts(); const account = accounts[oldKey] || {}; delete accounts[oldKey]; account.nick = newNick; accounts[newKey] = account; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); ['arcanaBans', 'arcanaBalances', 'arcanaOwned', 'arcanaSelectedWizards', 'arcanaKeychains', 'arcanaEquipped', 'arcanaKeychainLevels', 'arcanaDropEnabled', 'arcanaDropCharm', 'arcanaAvatars', 'arcanaMatchBlocked', 'arcanaHats', 'arcanaHatLevels', 'arcanaEquippedHat', 'arcanaWizardWins', 'arcanaSelectedTitle'].forEach(name => { const map = getMap(name); if (Object.hasOwn(map, oldKey)) { map[newKey] = map[oldKey]; delete map[oldKey]; saveMap(name, map); } }); ['arcanaFriends', 'arcanaFriendRequests'].forEach(name => { const map = getMap(name); if (map[oldKey]) { map[newKey] = map[oldKey]; delete map[oldKey]; } Object.keys(map).forEach(owner => { map[owner] = (map[owner] || []).map(nick => nick.toLowerCase() === oldKey ? newNick : nick); }); saveMap(name, map); }); }
async function changeAccountNick(event) { event.preventDefault(); const oldNick = document.getElementById('changeNickCurrent').value.trim(); const newNick = document.getElementById('changeNickNew').value.trim(); const message = document.getElementById('nickChangeMessage'); message.textContent = ''; if (onlineMatch || running) { message.textContent = 'ZAKOŃCZ MECZ PRZED ZMIANĄ NICKU'; return; } if (oldNick.toLowerCase() !== currentUser.toLowerCase()) { message.textContent = 'WPISZ SWÓJ OBECNY NICK'; return; } try { const remote = await authRequest('change-nick', { currentNick: currentUser, currentPassword: document.getElementById('changeNickPassword').value, newNick }); moveAccountData(currentUser, remote.nick); currentUser = remote.nick; localStorage.setItem('arcanaCurrentUser', currentUser); ui.playerName.textContent = `GRACZ: ${currentUser}`; profileUi.name.textContent = currentUser; document.getElementById('changeNickCurrent').value = ''; document.getElementById('changeNickPassword').value = ''; document.getElementById('changeNickNew').value = ''; updateFriends(); updateAccountDirectory(); if (matchSocket) { matchSocket.close(); matchSocket = null; } message.textContent = 'NICK ZMIENIONY'; } catch (error) { message.textContent = error.message; } }
async function changeAccountPassword(event) { event.preventDefault(); const message = document.getElementById('passwordChangeMessage'); message.textContent = ''; const newPassword = document.getElementById('changePasswordNew').value; if (newPassword !== document.getElementById('changePasswordRepeat').value) { message.textContent = 'NOWE HASŁA NIE SĄ TAKIE SAME'; return; } try { await authRequest('change-password', { currentNick: currentUser, currentPassword: document.getElementById('changePasswordCurrent').value, newPassword, confirmPassword: document.getElementById('changePasswordRepeat').value }); const accounts = getAccounts(); accounts[currentUser.toLowerCase()].serverSynced = true; delete accounts[currentUser.toLowerCase()].password; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); profileUi.passwordForm.reset(); message.textContent = 'HASŁO ZMIENIONE'; } catch (error) { message.textContent = error.message; } }
function updateAccountDirectory() { const accounts = getAccounts(); const entries = Object.entries(accounts).filter(([, account]) => account?.nick).sort((left, right) => left[1].nick.localeCompare(right[1].nick)); accountUi.list.innerHTML = entries.map(([key, account]) => `<button type="button" data-account-view="${encodeURIComponent(key)}">${escapeHtml(account.nick)}</button>`).join('') || '<span class="friends-empty">BRAK KONT</span>'; }
function showAccountDetails(key) { const account = getAccounts()[key]; if (!account) return; const balances = getMap('arcanaBalances'); const coinsForAccount = Number(balances[key] ?? account.coins ?? 0); const owned = Array.from(new Set(['apprentice', ...(account.wizards || []), ...(getMap('arcanaOwned')[key] || [])])); accountUi.name.textContent = account.nick; accountUi.coins.textContent = `MONETY: ${coinsForAccount}`; accountUi.characters.textContent = `POSTACIE: ${owned.map(id => wizards[id]?.name || id).join(', ')}`; accountUi.delete.disabled = key === OWNER_NICK.toLowerCase(); accountPendingDelete = key; accountUi.details.classList.remove('hidden'); }
function requestAccountDelete() { if (!accountPendingDelete || accountPendingDelete === OWNER_NICK.toLowerCase()) return; accountUi.confirm.classList.remove('hidden'); }
function deleteAccountConfirmed() { const key = accountPendingDelete; const accounts = getAccounts(); if (!key || key === OWNER_NICK.toLowerCase() || !accounts[key]) { accountUi.confirm.classList.add('hidden'); return; } const nick = accounts[key].nick; delete accounts[key]; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); ['arcanaBans', 'arcanaBalances', 'arcanaOwned', 'arcanaSelectedWizards', 'arcanaKeychains', 'arcanaEquipped', 'arcanaKeychainLevels', 'arcanaDropEnabled', 'arcanaDropCharm', 'arcanaAvatars', 'arcanaMatchBlocked'].forEach(name => { const map = getMap(name); delete map[key]; saveMap(name, map); }); ['arcanaFriends', 'arcanaFriendRequests'].forEach(name => { const map = getMap(name); delete map[key]; Object.keys(map).forEach(owner => { map[owner] = (map[owner] || []).filter(friend => friend.toLowerCase() !== key); }); saveMap(name, map); }); accountUi.confirm.classList.add('hidden'); accountUi.details.classList.add('hidden'); accountPendingDelete = ''; updateAccountDirectory(); if (key === currentUser.toLowerCase()) logoutAccount(); else setToast(`USUNIĘTO KONTO ${nick}`); }
function clearNewProgress(key) { [['arcanaHats', []], ['arcanaHatLevels', {}], ['arcanaEquippedHat', ''], ['arcanaWizardWins', {}], ['arcanaSelectedTitle', '']].forEach(([name, empty]) => { const map = getMap(name); map[key] = empty; saveMap(name, map); }); }
const originalDeleteAccountConfirmed = deleteAccountConfirmed;
deleteAccountConfirmed = function () { const key = accountPendingDelete; if (key && key !== OWNER_NICK.toLowerCase() && getAccounts()[key]) clearNewProgress(key); originalDeleteAccountConfirmed(); };
function saveAvatar() { if (!currentUser) return; const avatars = getMap('arcanaAvatars'); avatars[currentUser.toLowerCase()] = profileUi.editor.toDataURL('image/png'); saveMap('arcanaAvatars', avatars); drawAvatar(profileUi.avatar, avatars[currentUser.toLowerCase()], currentUser); setToast('AVATAR ZAPISANY'); }
function accountCharm(id) { const inventory = getMap('arcanaKeychains'); inventory[id] = Array.from(new Set([...(inventory[id] || []), 'admin-charm'])); saveMap('arcanaKeychains', inventory); const equipped = getMap('arcanaEquipped'); equipped[id] = Array.from(new Set([...(equipped[id] || []), 'admin-charm'])).slice(0, 3); saveMap('arcanaEquipped', equipped); }
function getCurrentTitle() { const id = getMap('arcanaSelectedTitle')[currentUser.toLowerCase()] || ''; return wizardTitles[id] || ''; }
function getProfileDrop() { const key = currentUser.toLowerCase(); const enabled = Boolean(getMap('arcanaDropEnabled')[key]); const charm = getMap('arcanaDropCharm')[key]; return { nick: currentUser, role: getAccounts()[key]?.role || 'user', dropEnabled: enabled && getEquippedKeychains().includes(charm), dropCharm: charm, hatId: getEquippedHat(), wizardId: selectedWizard, title: getCurrentTitle(), damageMultiplier: getStrengthMultiplier(), damageReduction: getDamageReduction() }; }
function syncProfileToServer() { if (matchSocket?.readyState === WebSocket.OPEN) sendNetwork({ type: 'profile-update', profile: getProfileDrop() }); }
function clearAuthForm() {
  auth.registerNick.value = '';
  auth.loginNick.value = '';
  auth.registerPassword.value = '';
  auth.loginPassword.value = '';
  auth.registerNickError.textContent = '';
  auth.loginError.textContent = '';
}

function finishAuth(nick) { currentUser = nick; logoutIntentional = false; const key = nick.toLowerCase(); const accounts = getAccounts(); const account = accounts[key]; const balances = getMap('arcanaBalances'); const selectedByAccount = getMap('arcanaSelectedWizards'); coins = Number(balances[key] ?? account?.coins ?? localStorage.getItem('arcanaCoins') ?? 0); selectedWizard = selectedByAccount[key] || 'apprentice'; localStorage.setItem('arcanaWizard', selectedWizard); ui.playerName.textContent = `GRACZ: ${nick}`; profileUi.button.classList.remove('hidden'); ui.logout.classList.remove('hidden'); localStorage.setItem('arcanaCurrentUser', nick); ownerUi.panel.classList.toggle('hidden', !['owner', 'admin'].includes(account?.role)); ownerUi.addAdmin.classList.toggle('hidden', !isOwner()); ownerUi.resetAccount.classList.toggle('hidden', !isOwner()); if (['owner', 'admin'].includes(account?.role)) toggleOwnerPanel(false); auth.screen.classList.add('hidden'); document.getElementById('deviceScreen').classList.remove('hidden'); updateShop(); updateFriends(); updateProfile(); updateAccountDirectory(); drawAvatar(profileUi.avatar, getMap('arcanaAvatars')[key] || '', nick); updateOrientationPrompt(); connectMatchSocket(); }

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
  currentUser = '';
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
async function registerAccount(event) { event.preventDefault(); const nick = auth.registerNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); auth.registerNickError.textContent = ''; try { const remote = await authRequest('register', { nick, password: auth.registerPassword.value }); accounts[key] = { ...(accounts[key] || {}), nick, role: remote.role, serverSynced: true }; delete accounts[key].password; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); finishAuth(nick); } catch (error) { auth.registerNickError.textContent = error.message; } }
async function loginAccount(event) { event.preventDefault(); const nick = auth.loginNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); const legacy = accounts[key]; const password = auth.loginPassword.value; auth.loginError.textContent = ''; if (getMap('arcanaBans')[key]) { auth.loginError.textContent = 'TO KONTO ZOSTAŁO ZBANOWANE'; return; } try { const remote = await authRequest('login', { nick, password, legacyAccount: legacy?.password === password ? legacy : undefined }); accounts[key] = { ...(legacy || {}), nick: remote.nick, role: remote.role, serverSynced: true }; delete accounts[key].password; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); finishAuth(remote.nick); } catch (error) { auth.loginError.textContent = error.message; } }
function ownerTarget() { const key = ownerUi.target.value.trim().toLowerCase(); return key; }
function ownerResult(text) { ownerUi.message.textContent = text; }
function isOwner() { return OWNER_NICKS.includes(currentUser.toLowerCase()); }
function isStaff() { const account = getAccounts()[currentUser.toLowerCase()]; return account?.role === 'owner' || account?.role === 'admin'; }
function addAdmin() { if (!isOwner()) return; const key = ownerTarget(); const accounts = getAccounts(); if (!accounts[key] || key === OWNER_NICK.toLowerCase()) { ownerResult('NIEPRAWIDŁOWY CEL'); return; } accounts[key].role = 'admin'; localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); accountCharm(key); ownerResult(`DODANO ADMINA: ${accounts[key].nick}`); }
function changeBan(banned) { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); if (!accounts[key] || (banned && OWNER_NICKS.includes(key))) { ownerResult('NIEPRAWIDŁOWY CEL'); return; } const bans = getMap('arcanaBans'); if (banned) bans[key] = true; else delete bans[key]; saveMap('arcanaBans', bans); ownerResult(banned ? 'GRACZ ZBANOWANY' : `GRACZ ODBANOWANY: ${accounts[key].nick}`); }
function giveCoins() { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); const amount = Number(ownerUi.coins.value); if (!accounts[key] || !Number.isFinite(amount) || amount < 1) { ownerResult('NIEPRAWIDŁOWY CEL LUB LICZBA'); return; } const added = Math.floor(amount); const balances = getMap('arcanaBalances'); balances[key] = Number(balances[key] || accounts[key].coins || 0) + added; accounts[key].coins = balances[key]; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = balances[key]; localStorage.setItem('arcanaCoins', String(coins)); updateShop(); } ownerResult(`DODANO ${added} MONET GRACZOWI ${accounts[key].nick}`); }
function takeCoins() { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); const amount = Number(ownerUi.coins.value); if (!accounts[key] || !Number.isFinite(amount) || amount < 1) { ownerResult('NIEPRAWIDŁOWY CEL LUB LICZBA'); return; } const balances = getMap('arcanaBalances'); const remaining = Math.max(0, Number(balances[key] ?? accounts[key].coins ?? 0) - Math.floor(amount)); balances[key] = remaining; accounts[key].coins = remaining; saveMap('arcanaBalances', balances); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = remaining; localStorage.setItem('arcanaCoins', String(coins)); updateShop(); } ownerResult(`ODJĘTO MONETY GRACZOWI ${accounts[key].nick} // STAN ${remaining}`); }
function resetAccount() { if (!isOwner()) return; const key = ownerTarget(); const accounts = getAccounts(); if (!accounts[key] || OWNER_NICKS.includes(key)) { ownerResult('NIEPRAWIDŁOWY CEL'); return; } const balances = getMap('arcanaBalances'); const owned = getMap('arcanaOwned'); const selected = getMap('arcanaSelectedWizards'); balances[key] = 0; owned[key] = []; selected[key] = 'apprentice'; accounts[key].coins = 0; accounts[key].wizards = []; const emptyValues = { arcanaKeychains: [], arcanaEquipped: [], arcanaKeychainLevels: {}, arcanaDropEnabled: false, arcanaDropCharm: '' }; Object.entries(emptyValues).forEach(([mapName, emptyValue]) => { const data = getMap(mapName); data[key] = emptyValue; saveMap(mapName, data); }); saveMap('arcanaBalances', balances); saveMap('arcanaOwned', owned); saveMap('arcanaSelectedWizards', selected); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) { coins = 0; selectedWizard = 'apprentice'; localStorage.setItem('arcanaCoins', '0'); localStorage.setItem('arcanaWizard', selectedWizard); updateShop(); updateBackpack(); updateProfile(); } ownerResult(`ZEROWANO KONTO ${accounts[key].nick} // ZOSTAŁA PODSTAWOWA POSTAĆ`); }
const originalResetAccount = resetAccount;
resetAccount = function () { const key = ownerTarget(); const shouldClear = isOwner() && key !== OWNER_NICK.toLowerCase() && Boolean(getAccounts()[key]); originalResetAccount(); if (shouldClear) clearNewProgress(key); };
function giveWizard() { if (!isStaff()) return; const key = ownerTarget(); const accounts = getAccounts(); const id = ownerUi.wizard.value; if (!accounts[key] || (id === 'overlord' && !isOwner())) { ownerResult('TYLKO WŁAŚCICIEL MOŻE NADAĆ WŁADCĘ'); return; } const owned = getMap('arcanaOwned'); owned[key] = Array.from(new Set([...(owned[key] || accounts[key].wizards || []), id])); accounts[key].wizards = owned[key]; saveMap('arcanaOwned', owned); localStorage.setItem('arcanaAccounts', JSON.stringify(accounts)); if (key === currentUser.toLowerCase()) updateShop(); ownerResult(`${wizards[id].name} DANY GRACZOWI ${accounts[key].nick}`); }
const ui = { start: document.getElementById('startScreen'), reveal: document.getElementById('revealScreen'), revealName: document.getElementById('revealName'), revealPower: document.getElementById('revealPower'), revealMage: document.getElementById('revealMage'), playerName: document.getElementById('playerName'), logout: document.getElementById('logoutButton'), friendsButton: document.getElementById('friendsButton'), friendsModal: document.getElementById('friendsModal'), friendsClose: document.getElementById('friendsClose'), friendsTab: document.getElementById('friendsTab'), suggestionsTab: document.getElementById('suggestionsTab'), requestsTab: document.getElementById('requestsTab'), friendsView: document.getElementById('friendsView'), suggestionsView: document.getElementById('suggestionsView'), requestsView: document.getElementById('requestsView'), suggestionsList: document.getElementById('suggestionsList'), inviteNick: document.getElementById('inviteNick'), sendInvite: document.getElementById('sendInviteButton'), inviteMessage: document.getElementById('inviteMessage'), friendNick: document.getElementById('friendNick'), addFriend: document.getElementById('addFriendButton'), friendMessage: document.getElementById('friendMessage'), friendsList: document.getElementById('friendsList'), bot: document.getElementById('botButton'), player: document.getElementById('playerButton'), shopButton: document.getElementById('shopButton'), ownedButton: document.getElementById('ownedButton'), shopClose: document.getElementById('shopClose'), detail: document.getElementById('wizardDetail'), wizardName: document.getElementById('wizardName'), wizardPower: document.getElementById('wizardPower'), buy: document.getElementById('buyButton'), use: document.getElementById('useButton'), join: document.getElementById('joinNote'), result: document.getElementById('resultMessage'), coins: document.getElementById('coinsText'), shop: document.getElementById('shop'), score: document.getElementById('scoreText'), mana: document.getElementById('speedText'), manaMeter: document.getElementById('speedMeter'), ward: document.getElementById('altitudeText'), wardMeter: document.getElementById('altitudeMeter'), enemies: document.getElementById('enemiesText'), radar: document.getElementById('radar'), ammo: document.getElementById('ammoRow'), toast: document.getElementById('toast'), status: document.getElementById('statusText'), event: document.getElementById('eventText'), rival: document.getElementById('rivalName') };
const wizards = { apprentice: { name: 'ISKRA', cost: 0, hp: 100, damage: 12, cooldown: .3 }, storm: { name: 'BURZOWY', cost: 180, hp: 90, damage: 10, cooldown: .18 }, guardian: { name: 'STRAŻNIK', cost: 260, hp: 140, damage: 16, cooldown: .38 }, healer: { name: 'UZDROWICIEL', cost: 3000, hp: 110, damage: 11, cooldown: .3, heal: 10, abilityCooldown: 15 }, cloner: { name: 'KLONER', cost: 4000, hp: 100, damage: 12, cooldown: .3, maxClones: 3 }, aegis: { name: 'AEGIS', cost: 3000, hp: 120, damage: 15, cooldown: .3, shield: true }, knight: { name: 'RYCERZ', cost: 3500, hp: 120, damage: 2, cooldown: .3, abilityType: 'sword', abilityDamage: .4, abilityCooldown: 5 }, hercules: { name: 'HERKULES', cost: 10000, hp: 160, damage: 0, cooldown: .3, abilityType: 'stone', abilityDamage: .7, abilityCooldown: 4 }, sprinter: { name: 'SPRINTER', cost: 2000, hp: 100, damage: 12, cooldown: .3, speed: 1.7 }, shieldbearer: { name: 'TARCZOWNIK', cost: 5000, hp: 140, damage: 10, cooldown: .3, reflect: true, abilityCooldown: 10 }, thunder: { name: 'PIORUN', cost: 7500, hp: 110, damage: 12, cooldown: .3, abilityType: 'lightning', abilityDamage: .5, abilityCooldown: 8 }, illusionist: { name: 'ILUZJONER', cost: 6000, hp: 100, damage: 20, cooldown: .3, abilityType: 'illusion', abilityCooldown: 20, invisibilityDuration: 10 }, overlord: { name: 'WŁADCA', cost: 999999999, hp: 1000, damage: 1000, cooldown: .3, shield: true, fullShield: true, invisibility: true, ownerOnly: true } };
const wizardTitles = { apprentice: 'Uczeń Iskry', storm: 'Władca Burzy', guardian: 'Strażnik Kręgu', healer: 'Ostatnia Nadzieja', cloner: 'Mistrz Odbić', aegis: 'Niezłomna Tarcza', knight: 'Rycerz Areny', hercules: 'Pięść Herkulesa', sprinter: 'Błyskawiczny', shieldbearer: 'Mistrz Odbić', thunder: 'Głos Gromu', illusionist: 'Mistrz Iluzji', overlord: 'Władca Areny' };
const botProfiles = [
  { wizardId: 'apprentice', difficulty: 1, reward: 100 },
  { wizardId: 'storm', difficulty: 2, reward: 160 },
  { wizardId: 'guardian', difficulty: 3, reward: 220 },
  { wizardId: 'illusionist', difficulty: 4, reward: 300 },
  { wizardId: 'thunder', difficulty: 5, reward: 400 }
];
const news = { new: ['ILUZJONER // NOWA POSTAĆ'], changed: ['TRYBY BOTÓW // WIĘKSZE NAGRODY ZA TRUDNIEJSZE WALKI'], removed: [] };
const matchCodeInput = document.getElementById('matchCode');
const randomQueueButton = document.getElementById('randomQueueButton');
const groupInviteUi = { modal: document.getElementById('groupInviteModal'), text: document.getElementById('groupInviteText'), accept: document.getElementById('acceptGroupInvite'), reject: document.getElementById('rejectGroupInvite'), status: document.getElementById('groupStatus') };
let matchRoomKey = '';
let matchSocket = null, onlineMatch = false, lastNetworkSync = 0;
let groupId = '', groupMembers = [], pendingGroupInvite = null, teamId = '', randomQueued = false, queueMatchType = '1v1';
let coins = Number(localStorage.getItem('arcanaCoins') || 0), selectedWizard = localStorage.getItem('arcanaWizard') || 'apprentice', viewedWizard = 'apprentice';
let W = 0, H = 0, running = false, last = 0, score = 0, mode = 'bot', joined = false, toastClock = 0, ownedOnly = false, deviceMode = '', joystickPointer = null, gameStartToken = 0;
let activeBotProfile = botProfiles[0], botPlayers = [];
let joystickX = 0, joystickY = 0;
const keys = {};
const p1 = { x: 0, y: 0, hp: 100, maxHp: 100, mana: 100, damage: 12, spellCooldown: .3, abilityCooldown: 0, clones: 0, shield: 0, shieldUsed: false, invisible: false, invisibleTimer: 0, color: '#72e4d0', accent: '#d8fff2', face: 1, cooldown: 0 };
const p2 = { x: 0, y: 0, hp: 100, maxHp: 100, mana: 100, damage: 12, damageReduction: 0, clones: [], color: '#ef7693', accent: '#ffe0e9', face: -1, cooldown: 0, teamId: 'bot-team', botSpeed: 1 };
const remotePlayers = new Map();
let spells = [], particles = [], stars = [], cloneBodies = [];
function resize() { const previousW = W, previousH = H; W = canvas.width = innerWidth * devicePixelRatio; H = canvas.height = innerHeight * devicePixelRatio; canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); W = innerWidth; H = innerHeight; if (previousW && previousH) { [p1, p2, ...cloneBodies, ...spells, ...particles].forEach(item => { if (Number.isFinite(item.x)) item.x *= W / previousW; if (Number.isFinite(item.y)) item.y *= H / previousH; if (Number.isFinite(item.vx)) item.vx *= W / previousW; if (Number.isFinite(item.vy)) item.vy *= H / previousH; }); } stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2, a: .25 + Math.random() * .65 })); }
function createLocalBot(profile, teamId, index) { const wizard = wizards[profile.wizardId] || wizards.apprentice; return { nick: `BOT-${index + 1}`, wizardId: profile.wizardId, teamId, x: teamId === 'bot-team' ? W * (.73 + index * .06) : W * (.45 - index * .05), y: H * (.45 + index * .12), hp: wizard.hp, maxHp: wizard.hp, mana: 100, damage: wizard.damage, damageReduction: 0, clones: [], color: teamId === 'bot-team' ? '#ef7693' : '#ffb04b', accent: teamId === 'bot-team' ? '#ffe0e9' : '#fff0bd', face: teamId === 'bot-team' ? -1 : 1, cooldown: 0, botSpeed: 1 + profile.difficulty * .08 }; }
function reset() { const wizard = wizards[selectedWizard]; const botWizard = wizards[activeBotProfile.wizardId] || wizards.apprentice; score = 0; spells = []; particles = []; cloneBodies = []; botPlayers = []; p1.x = W * .27; p1.y = H * .59; p1.maxHp = wizard.hp + getHealthBonus(wizard.hp); p1.hp = p1.maxHp; p1.mana = 100; p1.damage = wizard.damage; p1.damageReduction = getDamageReduction(); p1.spellCooldown = wizard.cooldown; p1.abilityCooldown = 0; p1.clones = 0; p1.cooldown = 0; p1.shield = 0; p1.shieldUsed = false; p1.invisible = false; p1.invisibleTimer = 0; p2.x = W * .73; p2.y = H * .59; p2.maxHp = botWizard.hp; p2.hp = p2.maxHp; p2.mana = 100; p2.damage = botWizard.damage; p2.damageReduction = botWizard.damageReduction || 0; p2.clones = []; p2.cooldown = 0; p2.teamId = 'bot-team'; p2.botSpeed = 1 + activeBotProfile.difficulty * .08; const botCount = mode === 'bot-one-two' ? 2 : mode === 'bot-one-three' ? 3 : mode === 'bot-two-two' ? 2 : 1; for (let index = 1; index < botCount; index++) botPlayers.push(createLocalBot(botProfiles[(activeBotProfile.difficulty + index) % botProfiles.length], 'bot-team', index)); if (mode === 'bot-two-two') botPlayers.push(createLocalBot(botProfiles[0], 'player-team', 0)); updateUI(); }
function getMatchCode() { return matchCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function sendNetwork(message) { if (matchSocket?.readyState === WebSocket.OPEN) matchSocket.send(JSON.stringify(message)); }
function leaveMatchConnection() { if (matchSocket) { sendNetwork({ type: randomQueued ? 'queue-cancel' : 'leave-room' }); matchSocket.close(); matchSocket = null; } randomQueued = false; onlineMatch = false; joined = false; running = false; remotePlayers.clear(); ui.start.classList.remove('hidden'); updateDeviceControls(); }
function handleNetworkMessage(message) { if (message.type === 'waiting') { ui.join.textContent = `CZEKANIE NA GRACZA // KOD ${message.code}`; return; } if (message.type === 'matched') { onlineMatch = true; joined = true; opponentProfile = message.opponent || {}; mode = 'player'; matchRewardGranted = false; ui.join.textContent = 'PRZECIWNIK ZNALEZIONY // START'; if (!running) startGame('player'); return; } if (message.type === 'state') { p2.x = (1 - message.x) * W; p2.y = message.y * H; p2.hp = message.hp; p2.maxHp = message.maxHp || 100; p2.mana = message.mana; p2.invisible = message.invisible; p2.damageReduction = message.damageReduction || 0; p2.reflectShield = message.reflectShield || 0; p2.clones = (message.clones || []).map(clone => ({ x: (1 - clone.x) * W, y: clone.y * H, slot: clone.slot })); return; } if (message.type === 'spell') { const spell = message.spell; if (p1.reflectShield > 0) { const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x); const reflected = { ...spell, x: p1.x, y: p1.y, vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, life: 1.5, owner: p1 }; spells.push(reflected); sendNetwork({ type: 'reflect', id: spell.id, reflector: currentUser, spell: { ...reflected, x: reflected.x / W, y: reflected.y / H, vx: reflected.vx / W, vy: reflected.vy / H } }); return; } spells.push({ ...spell, x: (1 - spell.x) * W, y: spell.y * H, vx: -spell.vx * W, vy: spell.vy * H, owner: p2 }); return; } if (message.type === 'reflect') { spells.forEach(spell => { if (spell.id === message.id) spell.life = 0; }); const spell = message.spell; spells.push({ ...spell, x: (1 - spell.x) * W, y: spell.y * H, vx: -spell.vx * W, vy: spell.vy * H, owner: message.reflector?.toLowerCase() === currentUser.toLowerCase() ? p1 : p2 }); return; } if (message.type === 'damage') { p1.hp -= message.amount; if (p1.hp <= 0) endGame('GRACZ 2'); return; } if (message.type === 'round-ended') { const won = message.winnerNick?.toLowerCase() === currentUser.toLowerCase(); if (won && !matchRewardGranted && opponentProfile.dropEnabled && keychains[opponentProfile.dropCharm]) { grantKeychain(opponentProfile.dropCharm); matchRewardGranted = true; setToast(`ZDOBYWASZ BRELOCZEK: ${keychains[opponentProfile.dropCharm].name}`); } if (running && !won) { coins = Math.max(0, coins - 50); persistCoins(); ui.result.textContent = 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden'); ui.result.classList.add('loss'); } onlineMatch = false; joined = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'RUNDA ZAKOŃCZONA // DOŁĄCZ PONOWNIE KODEM'; updateDeviceControls(); if (matchSocket) matchSocket.close(); return; } if (message.type === 'opponent-left') { onlineMatch = false; joined = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'PRZECIWNIK OPUŚCIŁ GRĘ'; updateDeviceControls(); setToast('PRZECIWNIK OPUŚCIŁ GRĘ'); } }
function connectMatchSocket(onReady = () => {}) { if (matchSocket?.readyState === WebSocket.OPEN) { onReady(); return; } if (matchSocket?.readyState === WebSocket.CONNECTING) { matchSocket.addEventListener('open', onReady, { once: true }); return; } const protocol = location.protocol === 'https:' ? 'wss' : 'ws'; matchSocket = new WebSocket(`${protocol}://${location.host}`); matchSocket.addEventListener('open', () => { sendNetwork({ type: 'hello', nick: currentUser, profile: getProfileDrop() }); onReady(); }); matchSocket.addEventListener('message', event => { try { handleNetworkMessageV2(JSON.parse(event.data)); } catch { setToast('BŁĄD DANYCH POŁĄCZENIA'); } }); matchSocket.addEventListener('close', () => { matchSocket = null; randomQueued = false; if (onlineMatch) { onlineMatch = false; running = false; ui.start.classList.remove('hidden'); ui.join.textContent = 'POŁĄCZENIE ZERWANE'; } }); }
function startCodeMatch() { const code = getMatchCode(); if (!code || !currentUser) { setToast('WPISZ KOD LUB WYBIERZ LOSOWĄ GRĘ'); return; } if (getMap('arcanaMatchBlocked')[currentUser.toLowerCase()]) { setToast('DOPASOWANIE ZABLOKOWANE // WYLOGUJ SIĘ POPRAWNIE'); return; } if (onlineMatch || randomQueued) { setToast('JUŻ SZUKASZ GRACZA'); return; } mode = 'player'; joined = false; ui.join.textContent = 'ŁĄCZENIE Z SERWEREM...'; connectMatchSocket(() => sendNetwork({ type: 'join', code, nick: currentUser, profile: getProfileDrop() })); }
function startTeamQueue(matchType) { queueMatchType = matchType; if (randomQueued) { sendNetwork({ type: 'queue-cancel' }); randomQueued = false; } toggleRandomQueue(); }
function toggleRandomQueue() { if (!currentUser || onlineMatch) return; if (randomQueued) { randomQueued = false; sendNetwork({ type: 'queue-cancel' }); randomQueueButton.textContent = 'LOSOWA GRA →'; ui.join.textContent = 'ANULOWANO KOLEJKĘ'; return; } if (getMap('arcanaMatchBlocked')[currentUser.toLowerCase()]) { setToast('DOPASOWANIE ZABLOKOWANE'); return; } if (groupId && groupMembers[0]?.toLowerCase() !== currentUser.toLowerCase()) { setToast('LIDER GRUPY URUCHAMIA DOPASOWYWANIE'); return; } randomQueued = true; mode = 'player'; ui.join.textContent = `SZUKANIE MECZU ${queueMatchType.toUpperCase()}...`; connectMatchSocket(() => { if (randomQueued) sendNetwork({ type: 'queue-random', matchType: queueMatchType, profile: getProfileDrop() }); }); randomQueueButton.textContent = 'ANULUJ KOLEJKĘ'; }
function syncNetworkState() { const now = performance.now(); if (!onlineMatch || now - lastNetworkSync < 50) return; lastNetworkSync = now; sendNetwork({ type: 'state', nick: currentUser, teamId, x: p1.x / W, y: p1.y / H, hp: p1.hp, maxHp: p1.maxHp, mana: p1.mana, invisible: p1.invisible, damageReduction: p1.damageReduction, reflectShield: p1.reflectShield, clones: cloneBodies.map(clone => ({ x: clone.x / W, y: clone.y / H, slot: clone.slot })) }); }
function startGame(selectedMode) { mode = selectedMode; if (mode === 'player' && !joined) { ui.join.textContent = 'NACISNIJ ENTER, ABY DOLACZYC GRACZEM 2'; return; } if (mode.startsWith('bot')) activeBotProfile = botProfiles[Math.floor(Math.random() * botProfiles.length)]; const startToken = ++gameStartToken; reset(); running = false; ui.result.classList.add('hidden'); ui.start.classList.add('hidden'); const wizard = wizards[selectedWizard]; ui.revealName.textContent = wizard.name; ui.revealMage.textContent = wizard.name.slice(0, 1); ui.revealPower.textContent = wizard.abilityType === 'illusion' ? `NIEWIDZIALNOŚĆ // ${wizard.invisibilityDuration} SEKUND // ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.abilityType ? `UMIEJĘTNOŚĆ // ${Math.round(wizard.abilityDamage * 100)}% HP // CO ${wizard.abilityCooldown} SEK` : wizard.reflect ? `ODBICIE POCISKÓW // CO ${wizard.abilityCooldown} SEK` : wizard.heal ? `LECZENIE ${wizard.heal} HP // CO ${wizard.abilityCooldown} SEK` : wizard.maxClones ? `MAKSYMALNIE ${wizard.maxClones} KLONÓW` : wizard.shield ? 'TARCZA // REDUKCJA OBRAŻEŃ' : `MOC ZAKLĘCIA // ${wizard.damage} OBRAŻEŃ`; ui.reveal.classList.remove('hidden'); ui.status.textContent = 'PREPARING DUEL'; ui.event.textContent = 'CHOOSE YOUR SPELL'; ui.rival.textContent = mode.startsWith('bot') ? wizards[activeBotProfile.wizardId].name : 'PLAYER 2'; setTimeout(() => { if (startToken !== gameStartToken || !ui.start.classList.contains('hidden')) return; ui.reveal.classList.add('hidden'); running = true; updateDeviceControls(); ui.status.textContent = 'DUEL SYSTEMS ACTIVE'; ui.event.textContent = mode.startsWith('bot') ? 'THE BOT HAS ENTERED THE CIRCLE' : 'TWO MAGES // ONE DESTINY'; }, 1800); }
const originalStartGame = startGame;
startGame = function (selectedMode) { matchWinRecorded = false; originalStartGame(selectedMode); if (ui.reveal.classList.contains('hidden')) return; const rival = mode.startsWith('bot') ? { nick: 'BOT', wizardId: activeBotProfile.wizardId, title: '' } : opponentProfile; document.getElementById('matchPlayerWizard').textContent = wizards[selectedWizard].name; document.getElementById('matchPlayerNick').textContent = currentUser || 'GRACZ'; document.getElementById('matchPlayerTitle').textContent = getCurrentTitle(); document.getElementById('matchRivalWizard').textContent = wizards[rival.wizardId]?.name || 'ISKRA'; document.getElementById('matchRivalNick').textContent = rival.nick || 'PRZECIWNIK'; document.getElementById('matchRivalTitle').textContent = rival.title || ''; };
const originalEndGame = endGame;
endGame = function (winner) { const wasRunning = running; originalEndGame(winner); if (wasRunning && winner === 'GRACZ 1') recordWizardWin(); };
function joinPlayer() { if (mode === 'player' && !joined) { joined = true; ui.join.textContent = 'GRACZ 2 DOLACZYL // NACISNIJ ENTER'; setToast('GRACZ 2 DOLACZYL'); } }
function endGame(winner) { if (!running) return; running = false; const wasOnline = onlineMatch; const playerWon = winner === 'GRACZ 1'; if (wasOnline && playerWon) sendNetwork({ type: 'game-over', winnerNick: currentUser, winnerTeamId: teamId }); if (wasOnline) { onlineMatch = false; joined = false; } const reward = mode.startsWith('bot') ? activeBotProfile.reward : 100; if (playerWon) { coins += reward; persistCoins(); setToast(`+${reward} MONET ZA ZWYCIĘSTWO`); } else { coins = Math.max(0, coins - 50); persistCoins(); setToast('-50 MONET ZA PRZEGRANĄ'); } ui.result.textContent = playerWon ? 'WYGRAŁEŚ!' : 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden'); ui.result.classList.toggle('win', playerWon); ui.start.classList.remove('hidden'); ui.join.textContent = wasOnline ? 'RUNDA ZAKOŃCZONA // WPISZ KOD, ABY DOŁĄCZYĆ PONOWNIE' : `${winner} WYGRYWA // NAGRODA ${playerWon ? reward : 0} MONET`; ui.status.textContent = 'DUEL COMPLETE'; updateDeviceControls(); updateShop(); }
function move(m, dx, dy, dt) { const speed = m === p1 ? (wizards[selectedWizard].speed || 1) : (m.botSpeed || 1); m.x = Math.max(40, Math.min(W - 40, m.x + dx * 230 * speed * dt)); m.y = Math.max(H * .24, Math.min(H * .82, m.y + dy * 180 * speed * dt)); }
function getHostileTargets() { return onlineMatch ? [...remotePlayers.values()].filter(player => player.teamId !== teamId) : [p2, ...botPlayers].filter(player => player.teamId === 'bot-team'); }
function cast(owner, target, color) {
  const melee = owner === p1 && selectedWizard === 'hercules';
  if (!running || owner === target || owner.cooldown > 0 || (!melee && owner.mana < 16) || (owner === p1 && p1.damage <= 0 && !melee)) return;
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  if (melee) {
    if (Math.hypot(target.x - owner.x, target.y - owner.y) > 92) return;
    owner.cooldown = p1.spellCooldown;
    const damage = 15 * (1 - (target === p2 ? (p2.damageReduction || 0) : getDamageReduction()));
    target.hp -= damage;
    if (target.nick && remotePlayers.has(target.nick.toLowerCase())) remotePlayers.get(target.nick.toLowerCase()).hp = target.hp;
    if (onlineMatch && target.nick) sendNetwork({ type: 'damage', targetNick: target.nick, amount: damage });
    burst(target.x, target.y, '#e8c49a', 10);
    if (target.hp <= 0 && !onlineMatch) endGame('GRACZ 1');
    setToast('HERKULES // CIOS PIĘŚCIĄ');
    return;
  }
  owner.cooldown = owner === p1 ? p1.spellCooldown : .3;
  owner.mana -= 16;
  const damage = owner === p1 ? p1.damage * getStrengthMultiplier() : owner.damage;
  const spell = { id: `${Date.now()}-${Math.random()}`, x: owner.x + Math.cos(angle) * 28, y: owner.y + Math.sin(angle) * 28, vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, life: 1.5, damage, color, ownerNick: owner === p1 ? currentUser : owner.nick, teamId: owner === p1 ? teamId : owner.teamId };
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
  if (wizard.abilityType === 'illusion') { if (p1.abilityCooldown > 0) { setToast(`ILUZJONER // ODNOWIENIE ${Math.ceil(p1.abilityCooldown)} SEK`); return; } p1.invisible = true; p1.invisibleTimer = wizard.invisibilityDuration; p1.abilityCooldown = wizard.abilityCooldown; setToast('ILUZJONER // NIEWIDZIALNOŚĆ PRZEZ 10 SEKUND'); return; }
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
    const rawDamage = p2.maxHp * wizard.abilityDamage;
    const damage = rawDamage * (1 - (p2.damageReduction || 0));
    p2.hp -= damage;
    if (p2.nick && remotePlayers.has(p2.nick.toLowerCase())) remotePlayers.get(p2.nick.toLowerCase()).hp = p2.hp;
    if (onlineMatch && p2.nick) sendNetwork({ type: 'damage', targetNick: p2.nick, amount: damage });
    burst(p2.x, p2.y, wizard.abilityType === 'sword' ? '#e9e4d5' : '#ffe56b', 16);
    if (p2.hp <= 0) endGame('GRACZ 1');
    setToast(wizard.abilityType === 'sword' ? 'RYCERZ // CIOS MIECZEM' : 'PIORUN // UDERZENIE');
  }
}
function useShield() { if (!running || !wizards[selectedWizard].fullShield || p1.shieldUsed) return; p1.shield = 10; p1.shieldUsed = true; setToast('WŁADCA // TARCZA 100% // 10 SEKUND'); }
function update(dt) {
  if (!running || document.getElementById('rotatePrompt').classList.contains('show')) return;
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
  else if (!onlineMatch) { move(p2, p1.x > p2.x + 30 ? 1 : p1.x < p2.x - 30 ? -1 : 0, p1.y > p2.y + 25 ? 1 : p1.y < p2.y - 25 ? -1 : 0, dt); if (!p1.invisible && Math.random() < dt * (.45 + activeBotProfile.difficulty * .18)) cast(p2, p1, p2.color); botPlayers.forEach(player => { const targets = player.teamId === 'bot-team' ? [p1] : getHostileTargets(); const target = targets.filter(item => item && item.hp > 0).sort((left, right) => Math.hypot(left.x - player.x, left.y - player.y) - Math.hypot(right.x - player.x, right.y - player.y))[0]; if (!target) return; move(player, target.x > player.x + 30 ? 1 : target.x < player.x - 30 ? -1 : 0, target.y > player.y + 25 ? 1 : target.y < player.y - 25 ? -1 : 0, dt); if (Math.random() < dt * (.45 + activeBotProfile.difficulty * .18)) cast(player, target, player.color); }); }
  p1.cooldown = Math.max(0, p1.cooldown - dt);
  p1.abilityCooldown = Math.max(0, p1.abilityCooldown - dt);
  if (p1.invisibleTimer > 0) { p1.invisibleTimer = Math.max(0, p1.invisibleTimer - dt); if (!p1.invisibleTimer) p1.invisible = false; }
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
      const target = getHostileTargets().find(player => player.hp > 0 && Math.hypot(spell.x - player.x, spell.y - player.y) < 36);
      if (!target) return;
      const damage = spell.damage * (1 - (target.damageReduction || 0));
      target.hp -= damage;
      if (onlineMatch && target.nick) sendNetwork({ type: 'damage', targetNick: target.nick, amount: damage });
      burst(target.x, target.y, spell.color, 12); spell.life = 0;
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
function updateShop() { const accounts = getAccounts(); const accountOwned = accounts[currentUser.toLowerCase()]?.wizards || []; const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...accountOwned])); ui.coins.textContent = coins; ui.shop.querySelectorAll('.wizard-card[data-wizard]').forEach(card => { const wizard = wizards[card.dataset.wizard]; if (!wizard) return; const selected = card.dataset.wizard === selectedWizard; const hasWizard = wizard.cost === 0 || owned.includes(card.dataset.wizard); const available = hasWizard || (!wizard.ownerOnly && wizard.cost <= coins) || selected; card.classList.toggle('hidden', ownedOnly && !hasWizard); card.classList.toggle('locked', !available); card.classList.toggle('selected', selected); card.querySelector('span').textContent = selected ? 'WYBRANY' : wizard.ownerOnly && !hasWizard ? 'TYLKO WŁAŚCICIEL' : hasWizard ? 'POSIADANY' : wizard.cost === 0 ? 'DARMOWY' : `${wizard.cost} MONET // KUP`; }); }
function escapeHtml(value) { return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function updateFriends() { const key = currentUser.toLowerCase(); const friends = getMap('arcanaFriends')[key] || []; const requests = getMap('arcanaFriendRequests')[key] || []; ui.friendsList.innerHTML = friends.length ? friends.map(nick => `<div class="friend-item"><span class="friend-identity"><span class="friend-avatar" aria-hidden="true">${escapeHtml(nick.slice(0, 1).toUpperCase())}</span><span>${escapeHtml(nick)}</span></span><button type="button" data-group-invite="${encodeURIComponent(nick)}">ZAPROŚ DO GRUPY</button></div>`).join('') : '<div class="friends-empty">BRAK ZNAJOMYCH</div>'; ui.suggestionsList.innerHTML = requests.length ? requests.map(nick => `<div class="friend-item friend-request"><span class="friend-identity"><span class="friend-avatar" aria-hidden="true">${escapeHtml(nick.slice(0, 1).toUpperCase())}</span><span>${escapeHtml(nick)}</span></span><span class="friend-request-actions"><button type="button" data-accept="${encodeURIComponent(nick)}">✓</button><button type="button" data-reject="${encodeURIComponent(nick)}">X</button></span></div>`).join('') : '<div class="friends-empty">BRAK ZAPROSZEŃ</div>'; }
const originalUpdateFriends = updateFriends;
const originalUpdateShop = updateShop;
updateShop = function () { loadLimitedWizards(); originalUpdateShop(); };
updateFriends = function () { originalUpdateFriends(); ui.friendsList.querySelectorAll('.friend-item').forEach(item => { const nick = item.querySelector('.friend-identity > span:last-child')?.textContent.trim(); if (nick && !item.querySelector('[data-trade]')) { const button = document.createElement('button'); button.type = 'button'; button.dataset.trade = encodeURIComponent(nick); button.textContent = 'WYMIANA'; item.appendChild(button); } }); };
function setFriendsTab(tab) { const tabs = { friends: [ui.friendsTab, ui.friendsView], suggestions: [ui.suggestionsTab, ui.suggestionsView], requests: [ui.requestsTab, ui.requestsView] }; Object.entries(tabs).forEach(([name, [button, view]]) => { button.classList.toggle('active', name === tab); view.classList.toggle('hidden', name !== tab); }); }
const originalNetworkMessageHandler = handleNetworkMessageV2;
handleNetworkMessageV2 = function (message) { if (message.type === 'round-ended' && (message.winnerTeamId ? message.winnerTeamId === teamId : message.winnerNick?.toLowerCase() === currentUser.toLowerCase())) recordWizardWin(); originalNetworkMessageHandler(message); };
function sendFriendInvite() { const nick = ui.inviteNick.value.trim(); const key = nick.toLowerCase(); const accounts = getAccounts(); ui.inviteMessage.textContent = ''; if (!accounts[key]) { ui.inviteMessage.textContent = 'NIE ZNALEZIONO TAKIEGO GRACZA'; return; } if (key === currentUser.toLowerCase()) { ui.inviteMessage.textContent = 'NIE MOŻESZ ZAPROSIĆ SIEBIE'; return; } const friendsMap = getMap('arcanaFriends'); const friends = friendsMap[currentUser.toLowerCase()] || []; if (friends.some(friend => friend.toLowerCase() === key)) { ui.inviteMessage.textContent = 'TEN GRACZ JUŻ JEST ZNAJOMYM'; return; } const requestsMap = getMap('arcanaFriendRequests'); const requests = requestsMap[key] || []; if (requests.some(request => request.toLowerCase() === currentUser.toLowerCase())) { ui.inviteMessage.textContent = 'ZAPROSZENIE JUŻ WYSŁANE'; return; } requests.push(currentUser); requestsMap[key] = requests; saveMap('arcanaFriendRequests', requestsMap); ui.inviteNick.value = ''; ui.inviteMessage.textContent = 'ZAPROSZENIE WYSŁANE'; }
function sendGroupInvite(nick) { connectMatchSocket(() => sendNetwork({ type: 'group-invite', targetNick: nick })); }
function acceptGroupInvite(accepted) { if (!pendingGroupInvite) return; sendNetwork({ type: accepted ? 'group-accept' : 'group-reject', groupId: pendingGroupInvite.groupId, from: pendingGroupInvite.from }); pendingGroupInvite = null; groupInviteUi.modal.classList.add('hidden'); }
function respondToFriendInvite(nick, accepted) { const key = currentUser.toLowerCase(); const requestsMap = getMap('arcanaFriendRequests'); const requests = requestsMap[key] || []; const index = requests.findIndex(request => request.toLowerCase() === nick.toLowerCase()); if (index < 0) return; const sender = requests[index]; requests.splice(index, 1); requestsMap[key] = requests; saveMap('arcanaFriendRequests', requestsMap); if (accepted) { const friendsMap = getMap('arcanaFriends'); const ownFriends = friendsMap[key] || []; const senderKey = sender.toLowerCase(); const senderFriends = friendsMap[senderKey] || []; if (!ownFriends.some(friend => friend.toLowerCase() === senderKey)) ownFriends.push(sender); if (!senderFriends.some(friend => friend.toLowerCase() === key)) senderFriends.push(currentUser); friendsMap[key] = ownFriends; friendsMap[senderKey] = senderFriends; saveMap('arcanaFriends', friendsMap); } updateFriends(); }
function openWizard(id) { viewedWizard = id; const wizard = wizards[id]; const accounts = getAccounts(); const owned = Array.from(new Set([...(getMap('arcanaOwned')[currentUser.toLowerCase()] || []), ...(accounts[currentUser.toLowerCase()]?.wizards || [])])); const hasWizard = wizard.cost === 0 || owned.includes(id); const wins = Number(getMap('arcanaWizardWins')[currentUser.toLowerCase()]?.[id] || 0); const remainingWins = Math.max(0, 500 - wins); const power = wizard.abilityType === 'illusion' ? `Gadżet: NIEWIDZIALNOŚĆ ${wizard.invisibilityDuration} SEKUND, ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.abilityType ? `Gadżet: ${Math.round(wizard.abilityDamage * 100)}% HP, co ${wizard.abilityCooldown} s` : wizard.reflect ? `Gadżet: odbijanie pocisków, co ${wizard.abilityCooldown} s` : wizard.speed ? `Szybkość ruchu: ${wizard.speed}x` : wizard.maxClones ? `Moc: TWORZENIE KLONÓW, MAKSYMALNIE ${wizard.maxClones}` : wizard.heal ? `Moc: LECZENIE ${wizard.heal} HP, ODNOWIENIE ${wizard.abilityCooldown} SEKUND` : wizard.ownerOnly ? 'Moc: NIEWIDZIALNOŚĆ + TARCZA 100%' : wizard.shield ? 'Moc: TARCZA, REDUKUJE OBRAŻENIA' : `Moc zaklęcia: ${wizard.damage}`; ui.wizardName.textContent = wizard.name; ui.wizardPower.textContent = `${power} | ${wizard.damage} OBRAŻEŃ | ${wizard.hp} HP | WYGRANE: ${wins} // DO TYTUŁU: ${remainingWins} | Cena: ${wizard.ownerOnly ? 'TYLKO WŁAŚCICIEL' : wizard.cost === 0 ? 'darmowy' : wizard.cost + ' monet'}`; ui.buy.textContent = hasWizard ? 'POSIADANY' : 'KUP'; ui.buy.disabled = hasWizard; ui.use.disabled = !hasWizard || id === selectedWizard; ui.detail.classList.remove('hidden'); }
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
  if (remotePlayers.size) remotePlayers.forEach(player => { player.clones.forEach(clone => drawMage({ ...player, x: clone.x, y: clone.y }, `${player.nick} // KLON`)); drawMage(player, player.nick); });
  else { p2.clones.forEach(clone => drawMage({ ...p2, x: clone.x, y: clone.y }, `${rivalLabel} // KLON`)); drawMage(p2, rivalLabel); botPlayers.forEach(player => drawMage(player, player.nick)); }
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
  const hatId = m === p1 ? getEquippedHat() : (m.hatId || (m === p2 ? opponentProfile.hatId : ''));
  if (hats[hatId]) { ctx.fillStyle = hatId === 'strength-hat' ? '#ffcf67' : hatId === 'guard-hat' ? '#91d8ee' : '#d9d4f1'; ctx.beginPath(); ctx.moveTo(-20, -43); ctx.lineTo(-14, -58); ctx.lineTo(14, -58); ctx.lineTo(20, -43); ctx.closePath(); ctx.fill(); ctx.fillRect(-23, -44, 46, 5); }
  ctx.strokeStyle = m.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.face * 18, 13); ctx.lineTo(m.face * 42, -18); ctx.stroke();
  ctx.fillStyle = m.accent; ctx.font = '700 11px Space Grotesk'; ctx.textAlign = 'center'; ctx.fillText(label, 0, 67); ctx.restore();
}
function updateDeviceControls() { document.getElementById('touchControls').classList.toggle('hidden', deviceMode !== 'mobile' || !running); chatUi.button.classList.toggle('hidden', !running); document.getElementById('touchCast').textContent = selectedWizard === 'hercules' ? 'PIĘŚĆ' : 'STRZAŁ'; }
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
  if (message.type === 'daily-box-reward') { applyDailyBoxReward(message.reward || {}); return; }
  if (message.type === 'chat') { showChatBubble(message.nick || 'GRACZ', message.text || ''); return; }
  if (message.type === 'trade-request') { pendingTradeNick = message.fromNick; tradeUi.requestText.textContent = `WYMIANA // ${message.fromNick}`; tradeUi.requestModal.classList.remove('hidden'); return; }
  if (message.type === 'trade-response') { if (message.accepted) openTrade(message.fromNick); else setToast('GRACZ ODRZUCIŁ WYMIANĘ'); return; }
  if (message.type === 'trade-offer') { if (tradeState.partner?.toLowerCase() !== message.fromNick?.toLowerCase()) return; tradeState.partnerItems = Array.isArray(message.offer?.items) ? message.offer.items : []; tradeState.partnerCoins = Math.max(0, Number(message.offer?.coins) || 0); if (message.changed) { tradeState.accepted = false; tradeUi.status.textContent = 'OFERTA ZAKTUALIZOWANA // ZAAKCEPTUJ PONOWNIE'; } renderTrade(); return; }
  if (message.type === 'trade-complete') { completeTrade(message); return; }
  if (message.type === 'hello') { sendNetwork({ type: 'career-get' }); return; }
  if (message.type === 'waiting') { ui.join.textContent = `CZEKANIE NA GRACZA // KOD ${message.code}`; return; }
  if (message.type === 'queue-waiting') { randomQueued = true; queueMatchType = message.matchType || queueMatchType; ui.join.textContent = `${String(queueMatchType).toUpperCase()} // CZEKANIE NA GRACZY`; return; }
  if (message.type === 'queue-cancelled') { randomQueued = false; randomQueueButton.textContent = 'LOSOWA GRA →'; ui.join.textContent = 'ANULOWANO KOLEJKĘ'; return; }
  if (message.type === 'queue-error' || message.type === 'group-error') { randomQueued = false; setToast(message.message); return; }
  if (message.type === 'group-state') { groupId = message.groupId || ''; groupMembers = message.members || []; groupInviteUi.status.textContent = groupMembers.length > 1 ? `GRUPA: ${groupMembers.join(' + ')} // ${groupMembers.length}/3` : ''; updateFriends(); return; }
  if (message.type === 'group-invite') { pendingGroupInvite = message; groupInviteUi.text.textContent = `${message.from} ZAPRASZA CIĘ DO GRUPY`; groupInviteUi.modal.classList.remove('hidden'); return; }
  if (message.type === 'matched') {
    randomQueued = false; randomQueueButton.textContent = 'LOSOWA GRA →'; onlineMatch = true; joined = true; teamId = message.teamId || `solo:${currentUser.toLowerCase()}`; opponentProfile = (message.opponents || [message.opponent].filter(Boolean))[0] || {}; matchRewardGranted = false; remotePlayers.clear();
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
  if (message.type === 'damage') { if (!message.targetNick || message.targetNick.toLowerCase() === currentUser.toLowerCase()) { p1.hp -= message.amount; if (p1.hp <= 0) endGame('GRACZ 2'); } else { const target = remotePlayers.get(message.targetNick.toLowerCase()); if (target) target.hp -= message.amount; } return; }
  if (message.type === 'round-ended') {
    const won = message.winnerTeamId ? message.winnerTeamId === teamId : message.winnerNick?.toLowerCase() === currentUser.toLowerCase();
    if (won && !matchRewardGranted && opponentProfile.dropEnabled && keychains[opponentProfile.dropCharm]) { grantKeychain(opponentProfile.dropCharm); matchRewardGranted = true; setToast(`ZDOBYWASZ BRELOCZEK: ${keychains[opponentProfile.dropCharm].name}`); }
    if (running) { if (won) { coins += 100; persistCoins(); ui.result.textContent = 'WYGRAŁEŚ!'; ui.result.classList.remove('hidden', 'loss'); ui.result.classList.add('win'); } else { coins = Math.max(0, coins - 50); persistCoins(); ui.result.textContent = 'PRZEGRAŁEŚ!'; ui.result.classList.remove('hidden', 'win'); ui.result.classList.add('loss'); } }
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
profileUi.button.addEventListener('click', openProfile);
profileUi.close.addEventListener('click', () => profileUi.modal.classList.add('hidden'));
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
randomQueueButton.addEventListener('click', toggleRandomQueue);
document.getElementById('botTwoVTwoButton').addEventListener('click', () => startGame('bot-two-two'));
document.getElementById('botOneVTwoButton').addEventListener('click', () => startGame('bot-one-two'));
document.getElementById('botOneVThreeButton').addEventListener('click', () => startGame('bot-one-three'));
newsUi.button.addEventListener('click', () => toggleNews(true));
newsUi.close.addEventListener('click', () => toggleNews(false));
newsUi.music.addEventListener('click', toggleMusic);
document.getElementById('botTwoVTwoButton').addEventListener('click', () => startTeamQueue('2v2'));
document.getElementById('botOneVTwoButton').addEventListener('click', () => startTeamQueue('1v2'));
document.getElementById('botOneVThreeButton').addEventListener('click', () => startTeamQueue('1v3'));
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
function startBotMode() { leaveMatchConnection(); startGame('bot'); }
addEventListener('resize', resize); addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); if (e.code === 'KeyE') useAbility(); if (e.code === 'KeyQ') useShield(); if (e.code === 'Enter') { joinPlayer(); if (!running && joined && mode === 'player') startGame('player'); } if (e.code === 'KeyR' && running) startGame(mode); }); addEventListener('keyup', e => { keys[e.code] = false; }); ui.bot.addEventListener('click', startBotMode); ui.player.addEventListener('click', () => startCodeMatch()); ui.shopButton.addEventListener('click', () => { ownedOnly = false; ui.shop.classList.remove('hidden'); closeWizard(); updateShop(); }); ui.ownedButton.addEventListener('click', () => { ownedOnly = true; ui.shop.classList.remove('hidden'); closeWizard(); updateShop(); }); ui.shopClose.addEventListener('click', () => { ownedOnly = false; ui.shop.classList.add('hidden'); }); ui.shop.querySelectorAll('.wizard-card').forEach(card => card.addEventListener('click', () => openWizard(card.dataset.wizard))); document.getElementById('exitButton').addEventListener('click', closeWizard); ui.buy.addEventListener('click', () => buyWizard(viewedWizard)); ui.use.addEventListener('click', () => useWizard(viewedWizard)); resize(); reset(); updateShop(); requestAnimationFrame(frame);
auth.registerTab.addEventListener('click', () => showAuthForm('register')); auth.loginTab.addEventListener('click', () => showAuthForm('login')); auth.registerForm.addEventListener('submit', registerAccount); auth.loginForm.addEventListener('submit', loginAccount); ui.logout.addEventListener('click', logoutAccount); ownerUi.toggle.addEventListener('click', () => toggleOwnerPanel()); ownerUi.addAdmin.addEventListener('click', addAdmin); ownerUi.ban.addEventListener('click', () => changeBan(true)); ownerUi.unban.addEventListener('click', () => changeBan(false)); ownerUi.giveCoins.addEventListener('click', giveCoins); ownerUi.giveWizard.addEventListener('click', giveWizard); ui.friendsButton.addEventListener('click', () => { setFriendsTab('friends'); ui.friendsModal.classList.remove('hidden'); ui.inviteMessage.textContent = ''; updateFriends(); }); ui.friendsTab.addEventListener('click', () => setFriendsTab('friends')); ui.requestsTab.addEventListener('click', () => setFriendsTab('requests')); ui.suggestionsTab.addEventListener('click', () => setFriendsTab('suggestions')); ui.friendsClose.addEventListener('click', () => ui.friendsModal.classList.add('hidden')); ui.sendInvite.addEventListener('click', sendFriendInvite); ui.suggestionsList.addEventListener('click', event => { const accept = event.target.closest('[data-accept]'); const reject = event.target.closest('[data-reject]'); if (accept) respondToFriendInvite(decodeURIComponent(accept.dataset.accept), true); if (reject) respondToFriendInvite(decodeURIComponent(reject.dataset.reject), false); }); addEventListener('beforeunload', applyInactivePenalty); addEventListener('pagehide', event => { if (!event.persisted) applyInactivePenalty(); }); ensureOwnerAccount(); showAuthForm('register');
