function toggleTaskById(wrapperId, xpVal) {
    if (state.trainingLocked) return;
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const task = state.tasks[wrapperId];
    if (!task) return;
    const wasComplete = task.completed;
    task.completed = !wasComplete;
    wrapper.classList.toggle("completed", task.completed);
    if (task.completed) {
        adjustXPEngine(xpVal);
        const nameEl = document.getElementById(`name-${wrapperId.replace('wrapper-', '')}`);
        addSessionLogEntry(nameEl ? nameEl.innerText : wrapperId, xpVal);
    } else {
        adjustXPEngine(-xpVal);
        removeSessionLogEntry(wrapperId);
    }
    saveStateToStorage();
    checkLockButtonVisibility();
}

function selectAllTasks() {
    if (state.trainingLocked) return;
    Object.keys(state.tasks).forEach(id => {
        if (!state.tasks[id].completed) {
            const wrapper = document.getElementById(id);
            const rewardEl = document.getElementById(`reward-${id.replace('wrapper-', '')}`);
            const xp = rewardEl ? parseInt(rewardEl.innerText.replace(/\D/g,'')) : 30;
            state.tasks[id].completed = true;
            if (wrapper) wrapper.classList.add("completed");
            adjustXPEngine(xp);
            const nameEl = document.getElementById(`name-${id.replace('wrapper-','')}`); 
            addSessionLogEntry(nameEl ? nameEl.innerText : id, xp);
        }
    });
    saveStateToStorage();
    checkLockButtonVisibility();
}

function deselectAllTasks() {
    if (state.trainingLocked) return;
    Object.keys(state.tasks).forEach(id => {
        if (state.tasks[id].completed) {
            const wrapper = document.getElementById(id);
            const rewardEl = document.getElementById(`reward-${id.replace('wrapper-', '')}`);
            const xp = rewardEl ? parseInt(rewardEl.innerText.replace(/\D/g,'')) : 30;
            state.tasks[id].completed = false;
            if (wrapper) wrapper.classList.remove("completed");
            adjustXPEngine(-xp);
            removeSessionLogEntry(id);
        }
    });
    saveStateToStorage();
    checkLockButtonVisibility();
}

function checkLockButtonVisibility() {
    const allDone = Object.values(state.tasks).every(t => t.completed);
    const btn = document.getElementById("lockTrainingBtn");
    if (btn) btn.style.display = allDone && !state.trainingLocked ? "block" : "none";
}

function promptLockTraining() {
    if (state.trainingLocked) return;
    const statNames = { str: "STRENGTH", spd: "SPEED", sta: "STAMINA", tac: "TACTICS" };
    const lines = Object.keys(state.tasks).map(id => {
        const key = CONFIG.TASK_STAT_MAP[state.tasks[id].blueprint] || 'tac';
        return `<div><span style="color:var(--accent-dim)">${state.tasks[id].blueprint}:</span> <span style="color:var(--accent-green);font-weight:bold;">+1 ${statNames[key]}</span></div>`;
    });
    document.getElementById("confirmStatPreview").innerHTML = lines.join('');
    document.getElementById("confirmOverlay").classList.add("active");
}

function confirmLockTraining() {
    document.getElementById("confirmOverlay").classList.remove("active");
    state.trainingLocked = true;
    Object.keys(state.tasks).forEach(id => {
        const key = CONFIG.TASK_STAT_MAP[state.tasks[id].blueprint] || 'tac';
        if (state.stats[key] < CONFIG.STAT_MAX) state.stats[key]++;
        document.getElementById(id)?.classList.add("locked");
    });
    document.getElementById("trainingLockedBanner").classList.add("active");
    state.totalSessions = (state.totalSessions || 0) + 1;
    updateAttributeChassisBars();
    saveStateToStorage();
    checkAndUnlockAchievements();
}

function cancelLockTraining() {
    document.getElementById("confirmOverlay").classList.remove("active");
}

function applyLockedTrainingState() {
    if (!state.trainingLocked) return;
    Object.keys(state.tasks).forEach(id => document.getElementById(id)?.classList.add("locked"));
    document.getElementById("trainingLockedBanner").classList.add("active");
}

function addSessionLogEntry(name, xp) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!state.sessionLog) state.sessionLog = [];
    state.sessionLog.push({ name, xp, time: timeStr });
    renderSessionLog();
}

function removeSessionLogEntry(wrapperId) {
    if (!state.sessionLog) return;
    state.sessionLog = state.sessionLog.filter(e => !e.name.includes(wrapperId));
    renderSessionLog();
}

function renderSessionLog() {
    const container = document.getElementById("sessionLogEntries");
    const totalEl = document.getElementById("sessionXpTotal");
    if (!container) return;
    if (!state.sessionLog || state.sessionLog.length === 0) {
        container.innerHTML = '<span style="color:var(--accent-dim); font-size:0.78rem;">No tasks completed yet.</span>';
        if (totalEl) totalEl.innerText = '';
        return;
    }
    container.innerHTML = state.sessionLog.map(e =>
        `<div class="session-log-entry"><span class="log-time">${e.time}</span><span class="log-name">${e.name}</span><span class="log-xp">+${e.xp} XP</span></div>`
    ).join('');
    const total = state.sessionLog.reduce((s, e) => s + e.xp, 0);
    if (totalEl) totalEl.innerText = `SESSION TOTAL: +${total} XP`;
}

function toggleInspection(panelId) {
    event.stopPropagation();
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const isOpen = panel.classList.contains("open");
    document.querySelectorAll(".inspection-panel.open").forEach(p => p.classList.remove("open"));
    if (!isOpen) panel.classList.add("open");
}

function buildDynamicMissionsByRank() {
    const tier = getMissionTier(state.careerRank);
    const theme = todayTheme();
    const missions = state.rankMissions?.[theme]?.[tier];
    if (!missions) return;

    const taskIds = ['wrapper-task1', 'wrapper-task2', 'wrapper-task3'];
    const missionKeys = ['task1', 'task2', 'task3'];

    taskIds.forEach((wid, i) => {
        const key = missionKeys[i];
        const m = missions[key];
        if (!m) return;
        const shortId = wid.replace('wrapper-', '');
        const nameEl = document.getElementById(`name-${shortId}`);
        const titleEl = document.getElementById(`inspect-title-${shortId}`);
        const bodyEl = document.getElementById(`inspect-body-${shortId}`);
        if (nameEl) nameEl.innerText = m.name;
        if (titleEl) titleEl.innerText = m.title;
        if (bodyEl) bodyEl.innerHTML = m.body;
        if (state.tasks[wid]) state.tasks[wid].blueprint = m.blueprint;
    });

    checkLockButtonVisibility();
    renderSessionLog();
}

function getMissionTier(rank) {
    if (rank <= 3) return 'beginner';
    if (rank <= 6) return 'intermediate';
    return 'advanced';
}
