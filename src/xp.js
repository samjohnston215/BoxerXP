function adjustXPEngine(amount) {
    if (state.isExamGateActive && amount > 0) return;
    state.xp += amount;
    const needed = xpRequired(state.level);
    while (state.xp >= needed) {
        state.xp -= needed;
        state.level++;
        triggerFullCelebrationSplash();
        const newNeeded = xpRequired(state.level);
        if (state.xp >= newNeeded) continue;
        break;
    }
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
    const gateLevel = nextRankGateLevel();
    if (!gateLevel) { state.isExamGateActive = false; document.getElementById("gatekeeperPanel").classList.remove("active"); return; }
    const needed = xpRequired(state.level);
    const threshold = Math.floor(needed * CONFIG.GATEKEEPER_XP_PERCENT);
    const isGate = state.level === gateLevel && state.xp >= threshold;
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
