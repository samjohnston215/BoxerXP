const CONFIG = {
    SAVE_KEY: 'combatCore_v6_save',
    MAX_RANKS: 9,
    STAT_MAX: 100,
    MAX_WEIGHT_HISTORY: 30,
    GATEKEEPER_XP_PERCENT: 0.9,
    POINTS_PER_LEVEL: 3,
    TASK_STAT_MAP: {
        'Shadowboxing': 'spd',
        'Heavy Bag': 'str',
        'Footwork': 'sta',
        'Jab Drill': 'spd',
        'Cross Drill': 'str',
        'Defense Drill': 'tac',
        'Conditioning': 'sta',
        'Combination Work': 'tac',
        'Pad Work': 'spd',
        'Sparring': 'tac'
    }
};

function xpRequired(level) {
    return Math.floor(100 * Math.pow(1.15, level - 1));
}

function nextRankGateLevel() {
    const gates = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35, 8: 40 };
    return gates[state.careerRank] || null;
}

function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function seededRandom(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return Math.abs(h) / 2147483647;
}

function playTone(freq, duration) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(); osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}

let state = {
    username: 'FIGHTER_01',
    level: 1, xp: 0, careerRank: 1,
    streak: 0, lastStreakDate: null,
    pointsBank: 0,
    headerCollapsed: false,
    isExamGateActive: false,
    trainingLocked: false,
    tutorialDone: false,
    totalSessions: 0,
    currentWeightDisplay: 180.0,
    weightHistory: [],
    sessionLog: [],
    lastResetDate: null,
    achievements: [],
    rankMissions: null,
    stats: { str: 10, spd: 10, sta: 10, tac: 10 },
    tasks: {
        'wrapper-task1': { completed: false, xp: 30, blueprint: 'Shadowboxing' },
        'wrapper-task2': { completed: false, xp: 40, blueprint: 'Heavy Bag' },
        'wrapper-task3': { completed: false, xp: 30, blueprint: 'Footwork' }
    },
    timer: { workDuration: 180, restDuration: 60, timeLeft: 180, instance: null, isRunning: false, mode: 'WORK' }
};