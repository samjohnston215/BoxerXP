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
    checkAndUnlockAchievements();
    saveStateToStorage();
}

function triggerFullCelebrationSplash() {
    document.getElementById("levelUpSplash").classList.add("active");
    playTone(880, 0.15);
    confettiBurst();
}

function dismissLevelUpSplash() {
    document.getElementById("levelUpSplash").classList.remove("active");
    renderInterface();
}

// ─── RANK PROMOTION CUTSCENE ─────────────────────────────────────────────────
function passGatekeeper() {
    if (state.careerRank < CONFIG.MAX_RANKS) state.careerRank++;
    state.level++; state.xp = 0; state.isExamGateActive = false;
    document.getElementById("gatekeeperPanel").classList.remove("active");
    saveStateToStorage();
    showRankPromotionCutscene(state.careerRank);
}

const RANK_PROMO_DATA = [
    null,
    { title:"RECRUIT DIVISION",     color:"var(--accent-blue)",   line:"Your journey begins. Guard up \u2014 this gym will forge you.", icon:"🥊" },
    { title:"NOVICE STRIKER",        color:"var(--accent-blue)",   line:"You've learned the basics. Now it's time to build habits.", icon:"🥊" },
    { title:"AMATEUR CONTENDER",     color:"var(--accent-blue)",   line:"Fundamentals locked in. Combinations are your next weapon.", icon:"🏅" },
    { title:"REGIONAL FIGHTER",      color:"var(--accent-purple)", line:"You're dangerous. Local fighters take you seriously now.", icon:"🏅" },
    { title:"APEX AGGRESSOR",        color:"var(--accent-purple)", line:"Power and precision combined. Elite territory ahead.", icon:"🏅" },
    { title:"CHAMPIONSHIP LINE",     color:"var(--accent-purple)", line:"You fight like a champion. The belt is within reach.", icon:"🏆" },
    { title:"ELITE TECHNICIAN",      color:"var(--accent-gold)",   line:"Pure mastery. Every movement has a purpose.", icon:"⭐" },
    { title:"MASTER STRIKER",        color:"var(--accent-gold)",   line:"Few fighters reach this level. You are one of them.", icon:"⭐" },
    { title:"GRAND FIGHT LEGEND",    color:"var(--accent-gold)",   line:"The pinnacle. Your name is in the record books.", icon:"👑" },
];

function showRankPromotionCutscene(newRank) {
    const data = RANK_PROMO_DATA[Math.min(newRank, RANK_PROMO_DATA.length - 1)];
    if (!data) { renderInterface(); return; }
    const overlay = document.getElementById("rankUpOverlay");
    document.getElementById("rankUpIcon").textContent = data.icon;
    document.getElementById("rankUpTitle").textContent = data.title;
    document.getElementById("rankUpTitle").style.color = data.color;
    document.getElementById("rankUpLine").textContent = data.line;
    document.getElementById("rankUpNum").textContent = `RANK ${newRank} / ${CONFIG.MAX_RANKS}`;
    overlay.classList.add("active");
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 180);
    setTimeout(() => playTone(784, 0.1), 360);
    setTimeout(() => playTone(1047, 0.18), 540);
    confettiBurst();
}

function dismissRankUpCutscene() {
    document.getElementById("rankUpOverlay").classList.remove("active");
    renderInterface();
    checkAndUnlockAchievements();
}

// ─── CONFETTI BURST ────────────────────────────────────────────────────────────────
function confettiBurst() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    const colors = ["#e74c3c","#3498db","#f1c40f","#2ecc71","#9b59b6","#e67e22","#1abc9c"];
    const particles = Array.from({length: 90}, () => ({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 5,
        vy: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 6,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 8
    }));
    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, 1 - frame / 80);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
            ctx.restore();
            p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        });
        frame++;
        if (frame < 90) requestAnimationFrame(draw);
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = "none"; }
    }
    draw();
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

function updateAttributeChassisBars() {
    Object.keys(state.stats).forEach(k => {
        const valEl = document.getElementById(`val-${k}`);
        const barEl = document.getElementById(`pbar-${k}`);
        if (valEl) valEl.innerText = state.stats[k];
        if (barEl) barEl.style.width = `${Math.min(100, Math.floor((state.stats[k] / CONFIG.STAT_MAX) * 100))}%`;
    });
    evaluateDynamicCombatStyle();
    renderRadarChart();
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

// ─── RADAR CHART ──────────────────────────────────────────────────────────────────
function renderRadarChart() {
    const canvas = document.getElementById("radarCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
    const labels = ["STR", "SPD", "STA", "TAC"];
    const vals = [state.stats.str, state.stats.spd, state.stats.sta, state.stats.tac];
    const max = CONFIG.STAT_MAX;
    const angles = labels.map((_, i) => (Math.PI * 2 * i / labels.length) - Math.PI / 2);
    const accentColor = "#4fc3f7";
    const gridColor = "rgba(255,255,255,0.08)";
    const labelColor = "#aaa";
    ctx.clearRect(0, 0, W, H);
    [0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.beginPath();
        angles.forEach((a, i) => {
            const x = cx + Math.cos(a) * R * f, y = cy + Math.sin(a) * R * f;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    angles.forEach(a => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    ctx.beginPath();
    angles.forEach((a, i) => {
        const r = (vals[i] / max) * R;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(79,195,247,0.18)";
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    angles.forEach((a, i) => {
        const r = (vals[i] / max) * R;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
    });
    ctx.font = "bold 11px 'Share Tech Mono', monospace";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    angles.forEach((a, i) => {
        const offset = 18;
        const x = cx + Math.cos(a) * (R + offset);
        const y = cy + Math.sin(a) * (R + offset);
        ctx.fillText(`${labels[i]} ${vals[i]}`, x, y);
    });
}
