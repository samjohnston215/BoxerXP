// ─── FIRST-SESSION TUTORIAL ──────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    icon: "🥊", title: "WELCOME TO COMBAT CORE",
    body: "This is your personal boxing training tracker. Complete daily workouts to earn XP, level up, and build your fighter stats.",
    btn: "NEXT →"
  },
  {
    icon: "📋", title: "YOUR DAILY TASKS",
    body: "Every day you get 3 training tasks tailored to your rank. Tap the <strong>[?]</strong> button on any task to see exactly how to do it. Tap the checkbox to mark it done.",
    btn: "NEXT →"
  },
  {
    icon: "⏱️", title: "THE BOXING TIMER",
    body: "Use the round timer at the top of the Tasks page to time your rounds. Standard boxing is <strong>3 minutes on, 1 minute rest</strong>. Hit Start Round and work!",
    btn: "NEXT →"
  },
  {
    icon: "🔒", title: "LOCK IN YOUR TRAINING",
    body: "When you finish all 3 tasks, a <strong>Lock Training</strong> button appears. Tap it to bank your stat gains. You only get one lock per day — make it count.",
    btn: "NEXT →"
  },
  {
    icon: "🏅", title: "RANKS & GATEKEEPERS",
    body: "As you level up, you'll hit <strong>Rank Gates</strong>. These require a real physical test with a trainer. Pass the test, log it, and advance to the next division.",
    btn: "NEXT →"
  },
  {
    icon: "📖", title: "PUNCH NUMBERS",
    body: "Your tasks use boxing notation. <strong>1 = Jab, 2 = Cross, 3 = Lead Hook, 4 = Rear Hook, 5/6 = Uppercuts</strong>. Visit the Glossary tab anytime to learn each punch.",
    btn: "LET'S FIGHT →"
  }
];

let tutorialStep = 0;

function checkAndShowTutorial() {
  if (state.tutorialDone) return;
  tutorialStep = 0;
  renderTutorialStep();
  document.getElementById("tutorialOverlay").classList.add("active");
}

function renderTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialStep];
  document.getElementById("tutIcon").textContent = step.icon;
  document.getElementById("tutTitle").textContent = step.title;
  document.getElementById("tutBody").innerHTML = step.body;
  document.getElementById("tutNextBtn").textContent = step.btn;
  const dots = document.querySelectorAll(".tut-dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === tutorialStep));
}

function tutorialNext() {
  tutorialStep++;
  if (tutorialStep >= TUTORIAL_STEPS.length) {
    dismissTutorial();
  } else {
    renderTutorialStep();
  }
}

function dismissTutorial() {
  state.tutorialDone = true;
  saveStateToStorage();
  document.getElementById("tutorialOverlay").classList.remove("active");
}
