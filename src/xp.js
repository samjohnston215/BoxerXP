function adjustXPEngine(amount) {
    if (state.isExamGateActive && amount > 0) return;
    state.xp += amount;
    while (state.xp >= CONFIG.XP_PER_LEVEL) { state.xp -= CONFIG.XP_PER_LEVEL; state.level++; triggerFullCelebrationSplash(); }
    if (state.xp < 0) state.xp = 0;
    evaluateGatekeeperCalculations();
    updateExperienceProgressBars();
    saveStateToStorage();
}

function triggerFullCelebrationSplash() {
    document.getElementById("levelUpSplash").classList.add("active");
    playTone(880, 0.15);
}

function dismissLevelUpSplash() {
    document.getElementById("levelUpSplash").classList.remove("active");
    renderInterface();
}

function evaluateGatekeeperCalculations() {
    const isGate = CONFIG.GATEKEEPER_LEVELS.includes(state.level) && state.xp >= CONFIG.GATEKEEPER_XP_THRESHOLD;
    state.isExamGateActive = isGate;
    document.getElementById("gatekeeperPanel").classList.toggle("active", isGate);
}

function passGatekeeper() {
    if (state.careerRank < CONFIG.MAX_RANKS) state.careerRank++;
    state.level++; state.xp = 0; state.isExamGateActive = false;
    document.getElementById("gatekeeperPanel").classList.remove("active");
    saveStateToStorage(); renderInterface();
}

function updateAttributeChassisBars() {
    Object.keys(state.stats).forEach(k => {
        const valEl = document.getElementById(`val-${k}`);
        const barEl = document.getElementById(`pbar-${k}`);
        if (valEl) valEl.innerText = state.stats[k];
        if (barEl) barEl.style.width = `${Math.min(100, Math.floor((state.stats[k] / CONFIG.STAT_MAX) * 100))}%`;
    });
    evaluateDynamicCombatStyle();
}

function evaluateDynamicCombatStyle() {
    const { str, spd, sta, tac } = state.stats;
    let arch = "BALANCE HYBRID";
    if (str > spd && str > sta && str > tac) arch = "POWER SLUGGER";
    else if (spd > str && spd > sta && spd > tac) arch = "SPEED OUT-BOXER";
    else if (sta > str && sta > spd && sta > tac) arch = "PRESSURE GRINDER";
    else if (tac > str && tac > spd && tac > sta) arch = "TECHNICAL INTERCEPTOR";
    const el = document.getElementById("styleArchetypeDisplay");
    if (el) el.innerText = `STYLE TYPE: ${arch}`;
}
