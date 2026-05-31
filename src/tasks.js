// Returns the correct mission tier based on current career rank
function getMissionTier() {
    if (state.careerRank >= 7) return 'advanced';
    if (state.careerRank >= 4) return 'intermediate';
    return 'beginner';
}

function buildDynamicMissionsByRank() {
    const theme = todayTheme();
    const tier  = getMissionTier();
    const activeSet = state.rankMissions[theme][tier];

    // Update day theme banner if element exists
    const dayBannerEl = document.getElementById('dayThemeBanner');
    const dayIndex = new Date().getDay();
    if (dayBannerEl) dayBannerEl.innerText = CONFIG.DAY_LABELS[dayIndex];

    ['task1','task2','task3'].forEach(t => {
        const task = activeSet[t];
        document.getElementById(`name-${t}`).innerText = task.name;
        document.getElementById(`inspect-title-${t}`).innerText = task.title;
        document.getElementById(`inspect-body-${t}`).innerHTML = task.body;
        // Update the XP blueprint so stat tracking stays accurate
        const wrapperId = `wrapper-${t}`;
        if (state.tasks[wrapperId]) {
            state.tasks[wrapperId].blueprint = task.blueprint;
        }
    });

    Object.keys(state.tasks).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("checked", state.tasks[id].completed);
    });
}

function toggleTaskById(wrapperId, xpValue) {
    if (state.trainingLocked) return;
    if (window.event && (window.event.target.classList.contains('info-trigger-btn') || window.event.target.closest('.inspection-panel'))) return;
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const wasCompleted = state.tasks[wrapperId].completed;
    state.tasks[wrapperId].completed = !wasCompleted;
    wrapper.classList.toggle("checked", state.tasks[wrapperId].completed);
    if (!wasCompleted) {
        adjustXPEngine(xpValue);
        const taskName = document.getElementById(`name-${wrapperId.replace('wrapper-','')}`)?.innerText || wrapperId;
        addSessionLogEntry(taskName, xpValue);
        checkAllTasksComplete();
    } else {
        adjustXPEngine(-xpValue);
        removeSessionLogEntry(wrapperId);
    }
    saveStateToStorage();
}

function selectAllTasks() {
    if (state.trainingLocked) return;
    Object.keys(state.tasks).forEach(id => {
        if (!state.tasks[id].completed) {
            document.getElementById(id)?.classList.add("checked");
            state.tasks[id].completed = true;
            adjustXPEngine(state.tasks[id].xp);
            const n = document.getElementById(`name-${id.replace('wrapper-','')}`)?.innerText || id;
            addSessionLogEntry(n, state.tasks[id].xp);
        }
    });
    saveStateToStorage();
    checkAllTasksComplete();
}

function deselectAllTasks() {
    if (state.trainingLocked) return;
    Object.keys(state.tasks).forEach(id => {
        if (state.tasks[id].completed) {
            document.getElementById(id)?.classList.remove("checked");
            adjustXPEngine(-state.tasks[id].xp);
            removeSessionLogEntry(id);
            state.tasks[id].completed = false;
        }
    });
    saveStateToStorage();
}

function toggleInspection(inspectId) {
    if (window.event) { window.event.stopPropagation(); window.event.preventDefault(); }
    document.getElementById(inspectId)?.classList.toggle("active");
}

function checkAllTasksComplete() {
    if (state.trainingLocked) return;
    const allDone = Object.keys(state.tasks).every(id => state.tasks[id].completed);
    if (allDone) showTrainingConfirmation();
}

function showTrainingConfirmation() {
    const statNames = { str: 'STRENGTH', spd: 'SPEED', sta: 'STAMINA', tac: 'TACTICS' };
    const lines = Object.keys(state.tasks).map(id => {
        const bp  = state.tasks[id].blueprint;
        const key = CONFIG.TASK_STAT_MAP[bp] || 'tac';
        return `<div><span style="color:var(--accent-dim)">${bp}:</span> <span style="color:var(--accent-green);font-weight:bold;">+1 ${statNames[key]}</span></div>`;
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
    updateAttributeChassisBars();
    saveStateToStorage();
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
    state.sessionLog.push({ name, xp, time: timeStr });
    renderSessionLog();
}
function removeSessionLogEntry(wrapperId) {
    const taskName = document.getElementById(`name-${wrapperId.replace('wrapper-','')}`)?.innerText;
    const idx = state.sessionLog.findIndex(e => e.name === taskName);
    if (idx > -1) state.sessionLog.splice(idx, 1);
    renderSessionLog();
}
function renderSessionLog() {
    const container = document.getElementById("sessionLogEntries");
    const totalEl = document.getElementById("sessionXpTotal");
    if (!container) return;
    if (state.sessionLog.length === 0) { container.innerHTML = '<span style="color:var(--accent-dim); font-size:0.78rem;">No tasks completed yet.</span>'; totalEl.innerText = ''; return; }
    container.innerHTML = state.sessionLog.map(e => `<div style="padding:2px 0;"><span style="color:var(--text-color);">${e.name.substring(0,40)}...</span><span style="color:var(--accent-green); margin-left:8px;">+${e.xp} XP @ ${e.time}</span></div>`).join('');
    totalEl.innerText = `TOTAL THIS SESSION: +${state.sessionLog.reduce((s,e) => s+e.xp, 0)} XP`;
}
