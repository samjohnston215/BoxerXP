function renderInterface() {
    document.getElementById('userDisplay').innerText = state.username;
    document.getElementById('levelDisplay').innerText = state.level;
    document.getElementById('streakDisplay').innerText = state.streak;
    const wif = document.getElementById('weightInputField');
    if (wif) wif.placeholder = state.currentWeightDisplay.toFixed(1);
    const pd = document.getElementById('pointsDisplay');
    if (pd) pd.innerText = state.pointsBank;
    updateRankDisplayStrings();
    updateExperienceProgressBars();
    updateAttributeChassisBars();
    evaluateGatekeeperCalculations();
    buildDynamicMissionsByRank();
    rebuildSyllabusTiers();
    renderWeightHistory();
    renderSessionLog();
    applyLockedTrainingState();
    checkLockButtonVisibility();
}

function updateExperienceProgressBars() {
    const needed = xpRequired(state.level);
    const xpPct = Math.min(100, Math.floor((state.xp / needed) * 100));
    document.getElementById('xpBar').style.width = xpPct + '%';
    document.getElementById('xpText').innerText = xpPct + '%';
    document.getElementById('xpLabelText').innerText = state.xp + '/' + needed;
    const rankPct = Math.min(100, Math.floor((state.careerRank / CONFIG.MAX_RANKS) * 100));
    document.getElementById('rankBar').style.width = rankPct + '%';
    document.getElementById('rankText').innerText = rankPct + '%';
    document.getElementById('rankLabelText').innerText = state.careerRank + ' / ' + CONFIG.MAX_RANKS + ' RANKS';
}

function updateRankDisplayStrings() {
    const rankTitles = [
        'RECRUIT DIVISION','NOVICE STRIKER','AMATEUR CONTENDER',
        'REGIONAL FIGHTER','APEX AGGRESSOR','CHAMPIONSHIP LINE',
        'ELITE TECHNICIAN','MASTER STRIKER','GRAND FIGHT LEGEND'
    ];
    const idx = Math.min(state.careerRank - 1, rankTitles.length - 1);
    const titleEl = document.getElementById('rankDisplay');
    const emblemEl = document.getElementById('gloveEmblem');
    if (titleEl) titleEl.innerText = rankTitles[idx];
    const col = state.careerRank <= 3 ? 'var(--accent-blue)' : state.careerRank <= 6 ? 'var(--accent-purple)' : 'var(--accent-gold)';
    if (titleEl) titleEl.style.color = col;
    if (emblemEl) emblemEl.style.color = col;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tab-' + tabId);
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + tabId);
    if (page) page.classList.add('active');
    forceIosKeyboardReset();
}

function toggleHeaderCollapse() {
    const container = document.getElementById('headerCollapsible');
    const btn = document.getElementById('collapseBtn');
    state.headerCollapsed = !state.headerCollapsed;
    container.classList.toggle('collapsed', state.headerCollapsed);
    btn.innerText = state.headerCollapsed ? '\u25BC' : '\u25B2';
    saveStateToStorage();
}

function changeUsername() {
    const newName = prompt('CHANGE CALLSIGN NAME:', state.username);
    if (newName && newName.trim()) {
        state.username = newName.trim().toUpperCase();
        document.getElementById('userDisplay').innerText = state.username;
        saveStateToStorage();
    }
}

function applyNightModeBasedOnTime() {
    const h = new Date().getHours();
    if (h >= 20 || h < 6) document.body.classList.add('night-mode');
}

function forceIosKeyboardReset() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function generateDailyModifiers() {
    const modifiers = [
        '\u26A1 FOCUS DAY: Speed attribute tracking active.',
        '\uD83E\uDE90 ENDURANCE BLOCK: Pacing focus target loaded.',
        '\uD83D\uDEE1\uFE0F COUNTER DAY: Defense timing is high priority.'
    ];
    const idx = Math.floor(seededRandom(new Date().toDateString()) * modifiers.length);
    const el = document.getElementById('mutationBanner');
    if (el) el.innerText = modifiers[idx];
}

function rebuildSyllabusTiers() {
    const container = document.getElementById('syllabusContainer');
    if (!container) return;
    container.innerHTML = '<div class="panel-title-row"><span class="panel-title">Gym Progression Steps</span></div>';
    const levels = [
        { name: 'STAGE I: RECRUIT PLATFORM', range: 'Ranks 1-3', active: state.careerRank <= 3, desc: 'Master basic punch geometry, stable stances, and footwork fundamentals.' },
        { name: 'STAGE II: CONTENDER CIRCUITS', range: 'Ranks 4-6', active: state.careerRank >= 4 && state.careerRank <= 6, desc: 'Head-to-body target shifts, 90-degree pivot steps, variable rhythm.' },
        { name: 'STAGE III: CHAMPIONSHIP CORE', range: 'Ranks 7-9', active: state.careerRank >= 7, desc: 'Advanced fakes, inside-distance fighting, elastic spring footwork.' }
    ];
    levels.forEach(function(lvl) {
        const div = document.createElement('div');
        div.className = 'syllabus-tier' + (lvl.active ? ' current' : '');
        div.innerHTML = '<div class="tier-header"><span>' + lvl.name + '</span><span class="tier-status">' + (lvl.active ? '[YOUR ACTIVE GOAL]' : '[STANDBY]') + '</span></div>' +
            '<p style="font-size:0.8rem;color:var(--accent-blue);margin-bottom:4px;">' + lvl.range + '</p>' +
            '<div class="tier-reqs">' + lvl.desc + '</div>';
        container.appendChild(div);
    });
}

function upgradeStat(key) {
    if (state.pointsBank > 0 && state.stats[key] < CONFIG.STAT_MAX) {
        state.stats[key]++; state.pointsBank--;
        updateAttributeChassisBars(); saveStateToStorage();
    }
}

function reallocatePoints() {
    const base = { str: 10, spd: 10, sta: 10, tac: 10 };
    Object.keys(state.stats).forEach(function(k) {
        state.pointsBank += state.stats[k] - base[k];
        state.stats[k] = base[k];
    });
    updateAttributeChassisBars(); saveStateToStorage();
}

function checkAndUnlockAchievements() {}

function todayTheme() { return 'default'; }

document.addEventListener('DOMContentLoaded', function() {
    loadStateFromStorage();
    applyNightModeBasedOnTime();
    checkDailyReset();
    checkStreakReset();
    renderInterface();
    generateDailyModifiers();
});