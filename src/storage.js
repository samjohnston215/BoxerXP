function buildSavePayload() {
    return {
        username: state.username, level: state.level, xp: state.xp, careerRank: state.careerRank,
        streak: state.streak, lastStreakDate: state.lastStreakDate, pointsBank: state.pointsBank,
        stats: state.stats, headerCollapsed: state.headerCollapsed,
        currentWeightDisplay: state.currentWeightDisplay, weightHistory: state.weightHistory,
        tasks: state.tasks, lastResetDate: state.lastResetDate,
        isExamGateActive: state.isExamGateActive, trainingLocked: state.trainingLocked
    };
}

function saveStateToStorage() {
    try { localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(buildSavePayload())); } catch(e) {}
}

function applyLoadedPackage(pkg) {
    if (!pkg) return;
    state.username             = pkg.username             || state.username;
    state.level                = pkg.level                || state.level;
    state.xp                   = pkg.xp                   ?? state.xp;
    state.careerRank           = pkg.careerRank           || state.careerRank;
    state.streak               = pkg.streak               ?? state.streak;
    state.lastStreakDate       = pkg.lastStreakDate        || null;
    state.pointsBank           = pkg.pointsBank           ?? state.pointsBank;
    state.stats                = pkg.stats                || state.stats;
    state.headerCollapsed      = pkg.headerCollapsed      || false;
    state.currentWeightDisplay = pkg.currentWeightDisplay || state.currentWeightDisplay;
    state.weightHistory        = pkg.weightHistory        || [];
    state.tasks                = pkg.tasks                || state.tasks;
    state.lastResetDate        = pkg.lastResetDate        || null;
    state.isExamGateActive     = pkg.isExamGateActive     || false;
    state.trainingLocked       = pkg.trainingLocked       || false;
    if (state.headerCollapsed) {
        const hc = document.getElementById("headerCollapsible");
        const cb = document.getElementById("collapseBtn");
        if (hc) hc.classList.add("collapsed");
        if (cb) cb.innerText = "\u25BC";
    }
}

function loadStateFromStorage() {
    try { const raw = localStorage.getItem(CONFIG.SAVE_KEY); if (!raw) return; applyLoadedPackage(JSON.parse(raw)); } catch(e) {}
}

function exportSaveData() {
    const json = JSON.stringify(buildSavePayload(), null, 2);
    const area = document.getElementById("saveDataArea");
    area.value = json; area.classList.add("active"); area.select();
    document.getElementById("importConfirmBtn").style.display = "none";
}

function showImportArea() {
    const area = document.getElementById("saveDataArea");
    area.value = ""; area.classList.add("active");
    area.placeholder = "Paste exported save JSON here then tap Import...";
    document.getElementById("importConfirmBtn").style.display = "block";
}

function importSaveData() {
    try {
        const parsed = JSON.parse(document.getElementById("saveDataArea").value);
        applyLoadedPackage(parsed); renderInterface();
        document.getElementById("saveDataArea").classList.remove("active");
        document.getElementById("importConfirmBtn").style.display = "none";
        saveStateToStorage();
    } catch(e) { alert("Invalid save data. Please check and try again."); }
}
