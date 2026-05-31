function toggleTimer() {
    const btn = document.getElementById("timerStartBtn");
    const statusLabel = document.getElementById("timerStatus");
    if (state.timer.isRunning) {
        clearInterval(state.timer.instance); state.timer.isRunning = false;
        btn.innerText = "Resume Round"; btn.classList.remove("active-run");
        statusLabel.innerText = `${state.timer.mode} PAUSED`;
    } else {
        state.timer.isRunning = true; btn.innerText = "Pause Round"; btn.classList.add("active-run");
        statusLabel.innerText = state.timer.mode === 'WORK' ? "ROUND LIVE - WORK HARD" : "RESTING - ACTIVE RECOVERY";
        state.timer.instance = setInterval(() => { state.timer.timeLeft--; renderTimerLayoutDisplay(); if (state.timer.timeLeft <= 0) cycleTimerNextMode(); }, 1000);
    }
}

function cycleTimerNextMode() {
    const timerDisplay = document.getElementById("timerTime");
    const statusLabel = document.getElementById("timerStatus");
    if (state.timer.mode === 'WORK') {
        state.timer.mode = 'REST'; state.timer.timeLeft = state.timer.restDuration;
        statusLabel.innerText = "RESTING - ACTIVE RECOVERY"; timerDisplay.classList.add("visual-flash"); playTone(440, 0.2);
        const today = todayString();
        if (state.lastStreakDate !== today) { state.streak++; state.lastStreakDate = today; document.getElementById("streakDisplay").innerText = state.streak; saveStateToStorage(); }
    } else {
        state.timer.mode = 'WORK'; state.timer.timeLeft = state.timer.workDuration;
        statusLabel.innerText = "ROUND LIVE - WORK HARD"; timerDisplay.classList.remove("visual-flash"); playTone(660, 0.15);
    }
    renderTimerLayoutDisplay();
}

function resetTimer() {
    clearInterval(state.timer.instance); state.timer.isRunning = false; state.timer.mode = 'WORK'; state.timer.timeLeft = state.timer.workDuration;
    const btn = document.getElementById("timerStartBtn"); btn.innerText = "Start Round"; btn.classList.remove("active-run");
    document.getElementById("timerTime").classList.remove("visual-flash");
    document.getElementById("timerStatus").innerText = "BOXING TIMER IDLE"; renderTimerLayoutDisplay();
}

function renderTimerLayoutDisplay() {
    const m = Math.floor(state.timer.timeLeft / 60), s = state.timer.timeLeft % 60;
    document.getElementById("timerTime").innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function playTone(freq, duration) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}
