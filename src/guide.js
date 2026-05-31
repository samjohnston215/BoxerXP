function rebuildSyllabusTiers() {
    const container = document.getElementById("syllabusContainer");
    if (!container) return;
    container.innerHTML = '<div class="panel-title-row"><span class="panel-title">Gym Progression Steps</span></div>';
    const levels = [
        { name: "STAGE I: RECRUIT PLATFORM", range: "Ranks 1-3", cond: state.careerRank <= 3, desc: "Master basic punch geometry (straight lines), stable stances, and avoiding crossed steps while moving." },
        { name: "STAGE II: CONTENDER CIRCUITS", range: "Ranks 4-6", cond: (state.careerRank >= 4 && state.careerRank <= 6), desc: "Learn head-to-body target shifting, 90-degree lateral angle pivot steps, and variable rhythm punch speeds." },
        { name: "STAGE III: CHAMPIONSHIP CORE", range: "Ranks 7-9", cond: state.careerRank >= 7, desc: "Advanced fake/bait loops, working inside close phone-booth distances safely, and elastic spring foot movements." }
    ];
    levels.forEach(lvl => {
        const div = document.createElement("div");
        div.className = `syllabus-tier ${lvl.cond ? 'current' : ''}`;
        div.innerHTML = `<div class="tier-header"><span>${lvl.name}</span><span class="tier-status">${lvl.cond ? '[YOUR ACTIVE GOAL]' : '[STANDBY]'}</span></div><p style="font-size:0.8rem; color:var(--accent-blue); margin-bottom:4px;">${lvl.range}</p><div class="tier-reqs">${lvl.desc}</div>`;
        container.appendChild(div);
    });
}
