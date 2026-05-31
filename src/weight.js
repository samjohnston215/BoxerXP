function submitWeightEntry() {
    const input = document.getElementById("weightInputField");
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
        state.currentWeightDisplay = val; input.placeholder = val.toFixed(1);
        state.weightHistory.unshift({ date: todayISO(), weight: val });
        if (state.weightHistory.length > CONFIG.MAX_WEIGHT_HISTORY) state.weightHistory = state.weightHistory.slice(0, CONFIG.MAX_WEIGHT_HISTORY);
        renderWeightHistory(); saveStateToStorage();
    }
    input.value = ""; forceIosKeyboardReset();
}

function quickAdjustWeight(delta) {
    state.currentWeightDisplay = Math.max(0, state.currentWeightDisplay + delta);
    document.getElementById("weightInputField").placeholder = state.currentWeightDisplay.toFixed(1);
    state.weightHistory.unshift({ date: todayISO(), weight: state.currentWeightDisplay });
    if (state.weightHistory.length > CONFIG.MAX_WEIGHT_HISTORY) state.weightHistory = state.weightHistory.slice(0, CONFIG.MAX_WEIGHT_HISTORY);
    renderWeightHistory(); saveStateToStorage();
}

function renderWeightHistory() {
    const container = document.getElementById("weightHistoryList");
    if (!container) return;
    if (!state.weightHistory || state.weightHistory.length === 0) { container.innerHTML = '<div class="weight-empty">No entries yet. Log your first weight above.</div>'; return; }
    container.innerHTML = state.weightHistory.map(e => `<div class="weight-history-entry"><span class="wh-date">${e.date}</span><span class="wh-val">${parseFloat(e.weight).toFixed(1)} LBS</span></div>`).join('');
}
