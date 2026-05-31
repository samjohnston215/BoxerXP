function todayString() { return new Date().toDateString(); }
function todayISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function seededRandom(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; return Math.abs(h) / 2147483647; }
function forceIosKeyboardReset() { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
function applyNightModeBasedOnTime() { const h = new Date().getHours(); if (h >= 20 || h < 6) document.body.classList.add("night-mode"); }

document.addEventListener("DOMContentLoaded", () => {
    loadStateFromStorage();
    applyNightModeBasedOnTime();
    checkDailyReset();
    checkStreakReset();
    renderInterface();
    generateDailyModifiers();
});

function renderInterface() {
    document.getElementById("userDisplay").innerText = state.username;
    document.getElementById("levelDisplay").innerText = state.level;
    document.getElementById("streakDisplay").innerText = state.streak;
    document.getElementById("weightInputField").placeholder = state.currentWeightDisplay.toFixed(1);
    updateRankDisplayStrings();
    updateExperienceProgressBars();
    updateAttributeChassisBars();
    evaluateGatekeeperCalculations();
    buildDynamicMissionsByRank();
    rebuildSyllabusTiers();
    renderWeightHistory();
    renderSessionLog();
    applyLockedTrainingState();
}

function checkDailyReset() {
    const today = todayString();
    if (state.lastResetDate && state.lastResetDate !== today) {
        Object.keys(state.tasks).forEach(id => { state.tasks[id].completed = false; });
        state.lastResetDate = today;
        state.trainingLocked = false;
        state.sessionLog = [];
        saveStateToStorage();
        const notice = document.getElementById("resetNotice");
        if (notice) { notice.classList.add("active"); setTimeout(() => notice.classList.remove("active"), 4000); }
    } else if (!state.lastResetDate) {
        state.lastResetDate = today;
        saveStateToStorage();
    }
}

function checkStreakReset() {
    const today = todayString();
    if (state.lastStreakDate && state.lastStreakDate !== today) {
        const diffDays = Math.round((new Date(today) - new Date(state.lastStreakDate)) / 86400000);
        if (diffDays > 1) { state.streak = 0; saveStateToStorage(); }
    }
}

function generateDailyModifiers() {
    const modifiers = [
        "&#9889; FOCUS DAY: Extra round speed attributes tracking with high multiplier value.",
        "&#127760; ENDURANCE BLOCK: Pacing focus target loaded.",
        "&#128737;&#65039; COUNTER DAY: Slip setups and block timing are high priority.",
        "&#128165; POWER DAY: Emphasize heavy bag impact mechanics today.",
        "&#127919; PRECISION DAY: Clean form over volume. Quality reps only."
    ];
    document.getElementById("mutationBanner").innerHTML = modifiers[Math.floor(seededRandom(todayString()) * modifiers.length)];
}

function toggleHeaderCollapse() {
    const container = document.getElementById("headerCollapsible");
    const btn = document.getElementById("collapseBtn");
    state.headerCollapsed = !state.headerCollapsed;
    if (state.headerCollapsed) { container.classList.add("collapsed"); btn.innerText = "\u25BC"; }
    else { container.classList.remove("collapsed"); btn.innerText = "\u25B2"; }
    saveStateToStorage();
}

function startUsernameEdit() {
    document.getElementById("userDisplay").style.display = "none";
    const input = document.getElementById("usernameEditInput");
    input.value = state.username;
    input.classList.add("active");
    input.focus(); input.select();
}
function commitUsernameEdit() {
    const input = document.getElementById("usernameEditInput");
    const newName = input.value.trim().toUpperCase();
    if (newName) { state.username = newName; saveStateToStorage(); }
    document.getElementById("userDisplay").innerText = state.username;
    document.getElementById("userDisplay").style.display = "";
    input.classList.remove("active");
}
function usernameEditKeydown(e) {
    if (e.key === "Enter") commitUsernameEdit();
    if (e.key === "Escape") { document.getElementById("usernameEditInput").classList.remove("active"); document.getElementById("userDisplay").style.display = ""; }
}

function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`tab-${tabId}`).classList.add("active");
    document.querySelectorAll(".app-page").forEach(page => page.classList.remove("active"));
    document.getElementById(`page-${tabId}`).classList.add("active");
    forceIosKeyboardReset();
}

function updateRankDisplayStrings() {
    const rankTitles = ["RECRUIT DIVISION","NOVICE STRIKER","AMATEUR CONTENDER","REGIONAL FIGHTER","APEX AGGRESSOR","CHAMPIONSHIP LINE","ELITE TECHNICIAN","MASTER STRIKER","GRAND FIGHT LEGEND"];
    const idx = Math.min(state.careerRank - 1, rankTitles.length - 1);
    const titleEl = document.getElementById("rankDisplay");
    const emblemEl = document.getElementById("gloveEmblem");
    titleEl.innerText = rankTitles[idx];
    if (state.careerRank <= 3) { titleEl.style.color = emblemEl.style.color = "var(--accent-blue)"; }
    else if (state.careerRank <= 6) { titleEl.style.color = emblemEl.style.color = "var(--accent-purple)"; }
    else { titleEl.style.color = emblemEl.style.color = "var(--accent-gold)"; }
}

function updateExperienceProgressBars() {
    const xpPct = Math.min(100, Math.floor((state.xp / CONFIG.XP_PER_LEVEL) * 100));
    document.getElementById("xpBar").style.width = `${xpPct}%`;
    document.getElementById("xpText").innerText = `${xpPct}%`;
    document.getElementById("xpLabelText").innerText = `${state.xp}/${CONFIG.XP_PER_LEVEL}`;
    const rankPct = Math.min(100, Math.floor(((state.careerRank - 1) / CONFIG.MAX_RANKS) * 100));
    document.getElementById("rankBar").style.width = `${rankPct}%`;
    document.getElementById("rankText").innerText = `${rankPct}%`;
    document.getElementById("rankLabelText").innerText = `${state.careerRank} / ${CONFIG.MAX_RANKS} RANKS`;
}
