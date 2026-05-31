// ─── ACHIEVEMENTS ────────────────────────────────────────────────────────────
const ACHIEVEMENT_DEFS = [
  { id: "streak3",    icon: "🔥", name: "HEAT SEEKER",      desc: "3-day training streak",         check: s => s.streak >= 3 },
  { id: "streak7",    icon: "🔥", name: "FIRE WEEK",         desc: "7-day training streak",         check: s => s.streak >= 7 },
  { id: "streak30",   icon: "🔥", name: "INFERNO MONTH",     desc: "30-day training streak",        check: s => s.streak >= 30 },
  { id: "sess1",      icon: "🥊", name: "FIRST BLOOD",       desc: "Complete your first session",   check: s => (s.totalSessions||0) >= 1 },
  { id: "sess10",     icon: "🥊", name: "10-COUNT",          desc: "Complete 10 full sessions",     check: s => (s.totalSessions||0) >= 10 },
  { id: "sess50",     icon: "🥊", name: "IRON DISCIPLINE",   desc: "Complete 50 full sessions",     check: s => (s.totalSessions||0) >= 50 },
  { id: "rank3",      icon: "🏅", name: "CONTENDER",         desc: "Reach Rank 3",                  check: s => s.careerRank >= 3 },
  { id: "rank6",      icon: "🏅", name: "CHAMPIONSHIP LINE", desc: "Reach Rank 6",                  check: s => s.careerRank >= 6 },
  { id: "rank9",      icon: "🏅", name: "GRAND LEGEND",      desc: "Reach Max Rank 9",              check: s => s.careerRank >= 9 },
  { id: "str50",      icon: "💪", name: "SLEDGEHAMMER",      desc: "STR reaches 50",                check: s => s.stats.str >= 50 },
  { id: "spd50",      icon: "⚡", name: "LIGHTNING HANDS",   desc: "SPD reaches 50",                check: s => s.stats.spd >= 50 },
  { id: "sta50",      icon: "🫁", name: "IRON LUNGS",        desc: "STA reaches 50",                check: s => s.stats.sta >= 50 },
  { id: "tac50",      icon: "🧠", name: "RING PROFESSOR",    desc: "TAC reaches 50",                check: s => s.stats.tac >= 50 },
  { id: "allstats50", icon: "⭐", name: "WELL ROUNDED",      desc: "All stats reach 50",            check: s => s.stats.str>=50 && s.stats.spd>=50 && s.stats.sta>=50 && s.stats.tac>=50 },
  { id: "lv10",       icon: "🎖️", name: "VETERAN",           desc: "Reach Fighter Level 10",        check: s => s.level >= 10 },
  { id: "lv25",       icon: "🎖️", name: "SEASONED PRO",      desc: "Reach Fighter Level 25",        check: s => s.level >= 25 },
];

function checkAndUnlockAchievements() {
  if (!state.achievements) state.achievements = [];
  let newlyUnlocked = [];
  ACHIEVEMENT_DEFS.forEach(def => {
    if (!state.achievements.includes(def.id) && def.check(state)) {
      state.achievements.push(def.id);
      newlyUnlocked.push(def);
    }
  });
  if (newlyUnlocked.length) {
    saveStateToStorage();
    newlyUnlocked.forEach((def, i) => {
      setTimeout(() => showAchievementToast(def), i * 1800);
    });
  }
}

function showAchievementToast(def) {
  const toast = document.getElementById("achievementToast");
  if (!toast) return;
  toast.innerHTML = `<span class="ach-toast-icon">${def.icon}</span><div class="ach-toast-text"><div class="ach-toast-label">ACHIEVEMENT UNLOCKED</div><div class="ach-toast-name">${def.name}</div><div class="ach-toast-desc">${def.desc}</div></div>`;
  toast.classList.add("active");
  setTimeout(() => toast.classList.remove("active"), 3200);
}

function buildAchievementsSection() {
  const container = document.getElementById("achievementsGrid");
  if (!container) return;
  if (!state.achievements) state.achievements = [];
  const unlocked = state.achievements;
  container.innerHTML = ACHIEVEMENT_DEFS.map(def => {
    const done = unlocked.includes(def.id);
    return `<div class="ach-badge ${done ? "ach-unlocked" : "ach-locked"}">
      <div class="ach-icon">${done ? def.icon : "🔒"}</div>
      <div class="ach-name">${def.name}</div>
      <div class="ach-desc">${def.desc}</div>
    </div>`;
  }).join("");
}
