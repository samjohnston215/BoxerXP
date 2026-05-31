// ─── PUNCH GLOSSARY ─────────────────────────────────────────────────────────
const GLOSSARY = [
  {
    id: "jab", num: "1", name: "JAB", emoji: "🥊",
    stance: "Orthodox or Southpaw", stat: "SPD",
    desc: "Your fastest, most-used punch. Thrown straight from your lead hand (left for orthodox). It sets up every combo and keeps opponents at range.",
    cues: ["Start from your guard — fist beside your chin","Extend straight forward, rotate fist to land knuckles-down","Snap back FAST — a slow return gets your arm trapped","Keep your rear hand glued to your cheek"],
    tip: "The jab wins fights. Land 3 clean jabs before throwing anything else today."
  },
  {
    id: "cross", num: "2", name: "CROSS", emoji: "💥",
    stance: "Orthodox", stat: "STR",
    desc: "Your primary power shot. Thrown from the rear hand (right for orthodox) with full hip and shoulder rotation. The '2' in every 1-2 combo.",
    cues: ["Pivot rear foot as you throw — heel lifts, toes point forward","Rotate hip and shoulder INTO the punch","Extend fully — reach through the target","Guard your chin with your lead shoulder as you extend"],
    tip: "Power comes from your legs and hips, not your arm. If your shoulder hurts, you're arming it."
  },
  {
    id: "lead-hook", num: "3", name: "LEAD HOOK", emoji: "🌀",
    stance: "Orthodox", stat: "STR",
    desc: "A horizontal punch from your lead side that comes from outside the opponent's line of sight. One of boxing's most devastating punches when landed clean.",
    cues: ["Elbow rises to shoulder height — arm forms an L-shape (90°)","Pivot on your lead foot, rotate your whole body","Keep your fist horizontal (palm down) or vertical (palm in) — both work","Stay compact — don't overswing or you lose balance"],
    tip: "The hook is a full-body movement. Think 'turn a doorknob with your whole body.'"
  },
  {
    id: "rear-hook", num: "4", name: "REAR HOOK", emoji: "🔄",
    stance: "Orthodox", stat: "STR",
    desc: "The rear-side hook. Less common but devastating at close range. Pairs with a jab to create an inside attack.",
    cues: ["Step your rear foot forward to close distance first","Elbow at shoulder height, same mechanics as lead hook","Rotate from the hip aggressively","Often used as a body shot — drive it into the ribs"],
    tip: "The rear hook is a close-range weapon. Don't throw it from distance — you'll miss and lose your balance."
  },
  {
    id: "uppercut", num: "5/6", name: "UPPERCUT", emoji: "⬆️",
    stance: "Orthodox or Southpaw", stat: "STR",
    desc: "An upward punch targeting the chin or body. Comes from below the opponent's guard. Lead uppercut = 5, Rear uppercut = 6.",
    cues: ["Drop your elbow slightly to load — don't cock it wide","Drive upward with your legs, not just your arm","Keep your palm facing you throughout the motion","Works best when you're inside — at distance it's a miss"],
    tip: "Uppercuts work when you're close. Slip to the outside of a jab, then plant a rear uppercut to the body."
  },
  {
    id: "body-shot", num: "Body", name: "BODY SHOT", emoji: "🎯",
    stance: "Orthodox or Southpaw", stat: "TAC",
    desc: "Any punch directed at the torso — ribs, liver, or solar plexus. A good body shot slows an opponent down for the rest of the fight.",
    cues: ["Bend your knees to get low — don't just dip your head","Target: left side = liver (devastating), right side = floating ribs","Drive through on impact — don't slap","Use it to force the guard down, then attack the head"],
    tip: "3 body shots followed by a head shot. They drop their guard to protect the body — that's your window."
  },
  {
    id: "slip", num: "D", name: "SLIP", emoji: "↩️",
    stance: "Orthodox or Southpaw", stat: "TAC",
    desc: "A defensive head movement — you rotate your torso slightly to move your head offline from an incoming punch without stepping back.",
    cues: ["Slip OUTSIDE: rotate to your left off a jab (head goes left)","Slip INSIDE: rotate to your right off a jab (head goes right)","Keep your knees slightly bent — movement comes from the hips","Return to guard immediately after slipping"],
    tip: "Slipping is not ducking. Your head stays at the same height — it just moves side to side a few inches."
  },
  {
    id: "guard", num: "G", name: "GUARD", emoji: "🛡️",
    stance: "Orthodox or Southpaw", stat: "TAC",
    desc: "Your default defensive position. Hands up, chin down, elbows in. Every punch should start and end here.",
    cues: ["Fists near temples — not too close (absorb with gloves) not too far","Chin is tucked — look through the top of your brow","Elbows protect your ribs — keep them close to your body","Shoulders slightly raised — protect against hooks"],
    tip: "Return to guard between EVERY punch. Hands drop = chin up = knockout."
  },
  {
    id: "footwork", num: "F", name: "FOOTWORK", emoji: "👟",
    stance: "Orthodox or Southpaw", stat: "STA",
    desc: "How you move your feet in the ring. Proper footwork keeps you balanced, controls range, and sets up punches. Always move the foot closest to your target direction first.",
    cues: ["Step-drag — move lead foot first, then drag rear foot","Never cross your feet — you'll fall or lose power","Stay on the balls of your feet (not flat-footed)","Circle to your left to move away from a right-handed opponent's power"],
    tip: "You throw better punches when your feet are right. Bad footwork = punches with no legs behind them."
  }
];

function buildGlossaryTab() {
  const page = document.getElementById("page-glossary");
  if (!page) return;
  page.innerHTML = `
    <div class="panel">
      <div class="panel-title-row" style="border:none;margin-bottom:4px;">
        <span class="panel-title">🥊 Punch Glossary</span>
      </div>
      <p style="font-size:0.78rem;color:var(--accent-dim);margin-bottom:14px;text-align:center;line-height:1.6;">
        Tap any punch to learn how to throw it correctly.<br>
        <span style="color:var(--accent-blue)">Numbers in combos: 1=Jab &nbsp;|&nbsp; 2=Cross &nbsp;|&nbsp; 3=Hook &nbsp;|&nbsp; 4=Hook(rear) &nbsp;|&nbsp; 5/6=Uppercut</span>
      </p>
      <div class="combo-legend">
        ${[["1","JAB"],["2","CROSS"],["3","L-HOOK"],["4","R-HOOK"],["5","L-UPP"],["6","R-UPP"]].map(([n,l])=>`<div class="combo-chip"><span class="combo-num">${n}</span><span class="combo-label">${l}</span></div>`).join("")}
      </div>
    </div>
    ${GLOSSARY.map(p => `
    <div class="panel gloss-card" id="gloss-${p.id}">
      <div class="gloss-header" onclick="toggleGlossCard('${p.id}')">
        <div class="gloss-title-row">
          <span class="gloss-num">${p.num}</span>
          <span class="gloss-name">${p.emoji} ${p.name}</span>
        </div>
        <div class="gloss-meta">
          <span class="gloss-stat-chip stat-chip-${p.stat.toLowerCase()}">${p.stat}</span>
          <span class="gloss-chevron" id="chev-${p.id}">▼</span>
        </div>
      </div>
      <div class="gloss-body" id="gbody-${p.id}" style="display:none;">
        <p class="gloss-desc">${p.desc}</p>
        <div class="gloss-cues-title">HOW TO THROW IT:</div>
        <ol class="gloss-cues">
          ${p.cues.map(c=>`<li>${c}</li>`).join("")}
        </ol>
        <div class="gloss-tip">💡 <strong>TRAINER TIP:</strong> ${p.tip}</div>
      </div>
    </div>`).join("")}
  `;
}

function toggleGlossCard(id) {
  const body = document.getElementById(`gbody-${id}`);
  const chev = document.getElementById(`chev-${id}`);
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  chev.textContent = isOpen ? "▼" : "▲";
}
